import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Button, Label, Dropdown, Modal, useOverlayState, TextField, TextArea, Card } from '@heroui/react';
import { staggerContainer } from '../../shared/lib/animations';
import { api } from '../../shared/lib/api';
import { ChatConversationRoot, ChatConversationContent, ChatConversationScrollButton } from '../../components/chat-conversation';
import { ChatMessageUser, ChatMessageAssistant, ChatMessageBubble, ChatMessageContent, ChatMessageBody, ChatMessageAvatar } from '../../components/chat-message';
import { ChatMessageActionsCopy, ChatMessageActionsRegenerate, ChatMessageActionsRoot } from '../../components/chat-message-actions';
import { ChainOfThought } from '../../components/chain-of-thought';
import { PromptSuggestion } from '../../components/prompt-suggestion';
import { Markdown } from '../../components/markdown';
import { TextShimmer } from '../../components/text-shimmer';
import { ChatTool } from '../../components/chat-tool';
import { useAuth } from '../../shared/context/AuthContext';
import { PaperPlane, ChevronsExpandUpRight, Comment, TrashBin } from '@gravity-ui/icons';
import { VoiceInputButton } from '../../components/voice-input-button';
import { VoiceMode } from './VoiceMode';

const STORAGE_KEY = 'smart-home-chat-messages';
const MODEL_PREF_KEY = 'smart-home-chat-model-pref';

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMessages(msgs: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}

function loadModelPref(): { providerId: string; model: string } | null {
  try {
    const raw = localStorage.getItem(MODEL_PREF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveModelPref(providerId: string, model: string) {
  localStorage.setItem(MODEL_PREF_KEY, JSON.stringify({ providerId, model }));
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
}

interface ProviderItem {
  _id: string;
  name: string;
  protocol: string;
  models: string[];
}

const suggestions = [
  { id: '1', title: '查看家中温度', description: '获取当前各房间温度数据' },
  { id: '2', title: '打开客厅灯', description: '控制客厅灯光设备' },
  { id: '3', title: '查看摄像头状态', description: '检查所有摄像头在线情况' },
  { id: '4', title: '今日家庭成员', description: '查看在家成员及健康状态' },
];

export function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [providerId, setProviderId] = useState('');
  const [model, setModel] = useState('');
  const [providersLoading, setProvidersLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [voiceEnabledInput, setVoiceEnabledInput] = useState(true);
  const [voiceEnabledOutput, setVoiceEnabledOutput] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ttsLoading, setTtsLoading] = useState<string | null>(null); // message id being synthesized
  const [toolCalls, setToolCalls] = useState<{ id: string; toolName: string; state: 'input-available' | 'output-available' | 'output-error'; input: any; output?: any; error?: string }[]>([]);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);

  // Input
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const expandModalState = useOverlayState();
  const abortRef = useRef<AbortController | null>(null);

  const autoResize = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 144) + 'px';
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    api.get<{ success: boolean; data: ProviderItem[] }>('/chat/providers')
      .then((res) => {
        setProviders(res.data);
        const pref = loadModelPref();
        const matchedProvider = pref && res.data.find((p) => p._id === pref.providerId);
        if (matchedProvider && matchedProvider.models.includes(pref!.model)) {
          setProviderId(pref!.providerId);
          setModel(pref!.model);
        } else {
          const first = res.data[0];
          if (first) {
            setProviderId(first._id);
            if (first.models[0]) setModel(first.models[0]);
          }
        }
      })
      .finally(() => setProvidersLoading(false));
  }, []);

  useEffect(() => {
    api.get<{ success: boolean; data: Record<string, unknown> }>('/voice/config')
      .then(() => {
        api.get<{ success: boolean; data: { key: string; value: unknown }[] }>('/settings?category=voice')
          .then((sr) => {
            const map: Record<string, boolean> = {};
            for (const s of sr.data) map[s.key] = s.value as boolean;
            setVoiceEnabledInput(map['voice.enabled_input'] !== false);
            setVoiceEnabledOutput(map['voice.enabled_output'] !== false);
          }).catch(() => {});
      }).catch(() => { setVoiceEnabledInput(false); setVoiceEnabledOutput(false); });
  }, []);

  const selectedProvider = providers.find((p) => p._id === providerId);

  const doSendStream = useCallback(async (msgs: ChatMessage[]) => {
    setStreaming(true);
    setLoading(true);
    setToolCalls([]);
    const abort = new AbortController();
    abortRef.current = abort;

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    let reasoningAcc = '';

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs.map((m) => ({ role: m.role, content: m.content })),
          providerId,
          model: model || undefined,
          user: user ? { id: user.id, username: user.username, role: user.role, uid: user.uid } : undefined,
        }),
        signal: abort.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as any;

            if (ev.type === 'text') {
              setMessages((prev) => prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + ev.content } : m
              ));
            } else if (ev.type === 'reasoning') {
              reasoningAcc += ev.content;
              setMessages((prev) => prev.map((m) =>
                m.id === assistantId ? { ...m, reasoning: reasoningAcc } : m
              ));
            } else if (ev.type === 'tool_use') {
              if (ev.toolUse) {
                setToolCalls(ev.toolUse.map((tu: any) => ({
                  id: tu.id,
                  toolName: tu.name,
                  state: 'input-available' as const,
                  input: tu.input,
                })));
              }
            } else if (ev.type === 'tool_result') {
              if (ev.results) {
                setToolCalls((prev) => prev.map((tc) => {
                  const r = ev.results.find((x: any) => x.id === tc.id);
                  if (!r) return tc;
                  return {
                    ...tc,
                    state: r.isError ? 'output-error' as const : 'output-available' as const,
                    output: r.isError ? undefined : r.content,
                  };
                }));
              }
            } else if (ev.type === 'done') {
              setToolCalls([]);
            } else if (ev.type === 'error') {
              setMessages((prev) => prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + `\n\n**错误:** ${ev.error}` } : m
              ));
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId ? { ...m, content: m.content + `\n\n**请求失败:** ${e.message}` } : m
        ));
      }
    } finally {
      setStreaming(false);
      setLoading(false);
      abortRef.current = null;
    }
  }, [providerId, model]);

  const handleSubmit = useCallback(async (text: string) => {
    if (!text.trim() || loading || !providerId) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    await doSendStream(next);
  }, [loading, providerId, messages, doSendStream]);

  const handleSuggestion = useCallback((title: string) => {
    handleSubmit(title);
  }, [handleSubmit]);

  const handleSendFromInput = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    handleSubmit(text);
  }, [inputText, handleSubmit]);

  const handleClearChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
  }, []);

  const handleTtsPlay = useCallback(async (msgId: string, text: string) => {
    setTtsLoading(msgId);
    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { audioRef.current = null; };
      audio.play();
    } catch { /* TTS failed */ }
    setTtsLoading(null);
  }, []);

  const handleVoiceTranscription = useCallback((text: string) => {
    setInputText(text);
    // Auto-submit on next tick so input state is updated
    setTimeout(() => handleSubmit(text), 0);
  }, [handleSubmit]);

  /** 语音对话模式：发送文本 → AI SSE 流 → 返回完整回复 */
  const handleVoiceModeSubmit = useCallback(async (text: string): Promise<string> => {
    if (!providerId) throw new Error('请先选择模型');

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    let fullReply = '';
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          providerId,
          model: model || undefined,
          user: user ? { id: user.id, username: user.username, role: user.role, uid: user.uid } : undefined,
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as any;
            if (ev.type === 'text') {
              fullReply += ev.content;
              setMessages((prev) => prev.map((m) =>
                m.id === assistantId ? { ...m, content: fullReply } : m
              ));
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId ? { ...m, content: `**请求失败:** ${e.message}` } : m
      ));
      throw e;
    }

    return fullReply;
  }, [providerId, model, messages, user]);

  const headerActionsEl = document.getElementById('page-header-actions');

  return (
    <motion.div
      animate="show"
      className="flex flex-col h-full"
      initial="hidden"
      variants={staggerContainer}
    >
      {/* Model selector + clear button portaled to page header */}
      {headerActionsEl && createPortal(
        <div className="flex items-center gap-2">
          <Dropdown>
            <Button variant="ghost" className="rounded-[15px]">
              {selectedProvider ? `${model.replaceAll('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` : '选择模型'}
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu>
                {providers.map((p) => (
                  <Dropdown.SubmenuTrigger key={p._id}>
                    <Dropdown.Item id={p._id} textValue={p.name}>
                      <Label>{p.name}</Label>
                      <Dropdown.SubmenuIndicator />
                    </Dropdown.Item>
                    <Dropdown.Popover>
                      <Dropdown.Menu onAction={(key) => {
                        setProviderId(p._id);
                        setModel(String(key));
                        saveModelPref(p._id, String(key));
                      }}>
                        {p.models.map((m) => (
                          <Dropdown.Item key={m} id={m} textValue={m}>
                            <Label>{m}</Label>
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown.SubmenuTrigger>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
          {messages.length > 0 && (
            <Button size="sm" variant="ghost" onPress={handleClearChat}>
              <TrashBin className="size-3.5" />
              清除记录
            </Button>
          )}
        </div>,
        headerActionsEl
      )}

      {/* Messages */}
      <ChatConversationRoot className="flex-1 min-h-0">
        <ChatConversationContent>
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-16">
              <Comment className="size-12 mb-3 opacity-30" />
              <p className="text-sm mb-6">
                {providers.length === 0 ? '请先在设置中配置并启用 AI 供应商' : '与 AI 管家对话'}
              </p>
              <PromptSuggestion className="max-w-[600px]">
                <PromptSuggestion.Items>
                  {suggestions.map((s) => (
                    <PromptSuggestion.Item key={s.id} onPress={() => handleSuggestion(s.title)}>
                      <PromptSuggestion.ItemDescription>{s.description}</PromptSuggestion.ItemDescription>
                    </PromptSuggestion.Item>
                  ))}
                </PromptSuggestion.Items>
              </PromptSuggestion>
            </div>
          )}

          {messages.map((msg) =>
            msg.role === 'user' ? (
              <div key={msg.id} className="max-w-[90%] lg:max-w-[70%] ml-auto">
                <ChatMessageUser>
                  <ChatMessageBody>
                    <ChatMessageBubble>
                      <ChatMessageContent>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </ChatMessageContent>
                    </ChatMessageBubble>
                  </ChatMessageBody>
                </ChatMessageUser>
              </div>
            ) : (
              <div key={msg.id} className="max-w-[90%] lg:max-w-[70%]">
                <ChatMessageAssistant>
                  <ChatMessageAvatar alt="AI" fallback="AI" />
                  <ChatMessageBody>
                    {msg.reasoning && (
                      <ChainOfThought>
                        <ChainOfThought.Trigger>思考过程</ChainOfThought.Trigger>
                        <ChainOfThought.Content>
                          <p className="text-xs text-neutral-400 whitespace-pre-wrap">{msg.reasoning}</p>
                        </ChainOfThought.Content>
                      </ChainOfThought>
                    )}
                    <ChatMessageBubble>
                      <ChatMessageContent>
                        <Markdown>{msg.content || (streaming && messages[messages.length - 1]?.id === msg.id ? '' : '...')}</Markdown>
                      </ChatMessageContent>
                    </ChatMessageBubble>
                    {msg.content && (
                      <ChatMessageActionsRoot>
                        <ChatMessageActionsCopy onPress={() => {
                          navigator.clipboard.writeText(msg.content);
                        }} />
                        {voiceEnabledOutput && (
                          <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            isDisabled={ttsLoading === msg.id}
                            onPress={() => handleTtsPlay(msg.id, msg.content)}
                            aria-label="播放语音"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </Button>
                        )}
                        <ChatMessageActionsRegenerate onPress={() => {
                          const idx = messages.findIndex((m) => m.id === msg.id);
                          if (idx > 0) {
                            const prev = messages.slice(0, idx);
                            setMessages(prev);
                            doSendStream(prev);
                          }
                        }} />
                      </ChatMessageActionsRoot>
                    )}
                  </ChatMessageBody>
                </ChatMessageAssistant>
              </div>
            )
          )}

          {toolCalls.length > 0 &&
            <div className="max-w-[90%] lg:max-w-[70%]">
              <ChatMessageAssistant>
                <ChatMessageAvatar alt="AI" fallback="AI" />
                <ChatMessageBody>
                  {toolCalls.map((tc) => (
                    <ChatTool
                      key={tc.id}
                      state={tc.state}
                      toolName={tc.toolName}
                      input={tc.input}
                      output={tc.state === 'output-available' ? tc.output : undefined}
                    />
                  ))}
                </ChatMessageBody>
              </ChatMessageAssistant>
            </div>
          }

          {loading && !streaming && (
            <ChatMessageAssistant>
              <ChatMessageAvatar alt="AI" fallback="AI" />
              <ChatMessageBody>
                <ChatMessageBubble>
                  <TextShimmer>AI 正在思考中...</TextShimmer>
                </ChatMessageBubble>
              </ChatMessageBody>
            </ChatMessageAssistant>
          )}
        </ChatConversationContent>
        <ChatConversationScrollButton tooltip="滚动到底部" />
      </ChatConversationRoot>

      {/* Input Area */}
      <div className="shrink-0 flex justify-center px-4 py-3">
        <Card className="p-3 flex flex-row items-end gap-2 w-full max-w-[70%] shadow-none transition-shadow duration-200 shadow-lg shadow-primary-100">
          <TextField
            value={inputText}
            onChange={(v) => setInputText(v)}
            isDisabled={loading}
            className="flex-1"
          >
            <Label className="sr-only">输入消息</Label>
            <TextArea
              ref={textareaRef}
              placeholder="输入消息，Enter 发送..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendFromInput();
                }
            }}
            onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            className="!border-none !shadow-none !ring-0"
            style={{ maxHeight: '144px' }}
          />
        </TextField>
        <div className="flex items-center gap-1 shrink-0">
          {voiceEnabledInput && (
            <VoiceInputButton onTranscription={handleVoiceTranscription} disabled={loading} />
          )}
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onPress={() => setVoiceModeOpen(true)}
            aria-label="语音对话模式"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </Button>
          <Button size="sm" variant="ghost" isIconOnly onPress={expandModalState.open}>
            <ChevronsExpandUpRight className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="primary"
            isIconOnly
            onPress={handleSendFromInput}
            isDisabled={!inputText.trim() || loading || !providerId}
          >
            <PaperPlane className="size-3.5" />
          </Button>
        </div>
        </Card>
      </div>

      {/* Expand Modal */}
      <Modal state={expandModalState}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="w-full max-w-2xl">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>编辑消息</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <TextField
                  value={inputText}
                  onChange={(v) => setInputText(v)}
                >
                  <Label className="sr-only">编辑消息</Label>
                  <TextArea
                    placeholder="在此编辑消息..."
                    rows={12}
                    className="resize-none"
                  />
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close">取消</Button>
                <Button
                  variant="primary"
                  onPress={() => {
                    expandModalState.close();
                    handleSendFromInput();
                  }}
                  isDisabled={!inputText.trim() || loading}
                >
                  <PaperPlane className="size-3.5" />
                  发送
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <VoiceMode
        isOpen={voiceModeOpen}
        onClose={() => setVoiceModeOpen(false)}
        onSubmit={handleVoiceModeSubmit}
      />
    </motion.div>
  );
}
