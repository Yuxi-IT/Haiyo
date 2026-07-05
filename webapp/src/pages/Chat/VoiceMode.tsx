import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Xmark, Microphone } from '@gravity-ui/icons';
import { Button } from '@heroui/react';
import { Markdown } from '../../components/markdown';

type VoiceState = 'idle' | 'listening' | 'sending' | 'playing';

interface VoiceModeProps {
  isOpen: boolean;
  onClose: () => void;
  /** 发送消息给 AI，返回完整回复文本 */
  onSubmit: (text: string) => Promise<string>;
}

const SILENCE_THRESHOLD = 0.01; // RMS 阈值
const SILENCE_DURATION = 2000; // 2秒静默
const CHUNK_INTERVAL = 200; // 200ms 一个 audio chunk

const stateLabels: Record<VoiceState, string> = {
  idle: '准备就绪',
  listening: '正在听...',
  sending: 'AI 思考中...',
  playing: '播放中...',
};

export function VoiceMode({ isOpen, onClose, onSubmit }: VoiceModeProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [recognizedText, setRecognizedText] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [error, setError] = useState('');

  // Refs
  const asrWsRef = useRef<WebSocket | null>(null);
  const ttsWsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const playingRef = useRef(false);
  const closingRef = useRef(false);
  const stateRef = useRef<VoiceState>('idle');

  // 同步 state 到 ref
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 清理所有资源
  const cleanup = useCallback(() => {
    closingRef.current = true;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (asrWsRef.current) {
      try { asrWsRef.current.close(); } catch {}
      asrWsRef.current = null;
    }
    if (ttsWsRef.current) {
      try { ttsWsRef.current.close(); } catch {}
      ttsWsRef.current = null;
    }
    audioQueueRef.current = [];
    playingRef.current = false;
  }, []);

  // 关闭时清理
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setState('idle');
      setRecognizedText('');
      setAiReply('');
      setError('');
      closingRef.current = false;
    }
  }, [isOpen, cleanup]);

  // ========== TTS 播放 ==========
  const playTtsAudio = useCallback(async (text: string) => {
    if (closingRef.current) return;
    setState('playing');

    return new Promise<void>((resolve) => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ttsWs = new WebSocket(`${wsProtocol}//${window.location.host}/api/voice/tts-ws`);
      ttsWsRef.current = ttsWs;

      const audioChunks: ArrayBuffer[] = [];

      ttsWs.onopen = () => {
        ttsWs.send(JSON.stringify({ type: 'synthesize', text }));
      };

      ttsWs.onmessage = (ev) => {
        if (typeof ev.data === 'string') {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === 'tts_end' || msg.type === 'error') {
              // 所有 chunk 收到，播放
              if (audioChunks.length > 0) {
                const blob = new Blob(audioChunks, { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.onended = () => {
                  URL.revokeObjectURL(url);
                  resolve();
                };
                audio.onerror = () => {
                  URL.revokeObjectURL(url);
                  resolve();
                };
                audio.play().catch(() => resolve());
              } else {
                resolve();
              }
              ttsWs.close();
            }
          } catch {
            /* ignore */
          }
        } else if (ev.data instanceof Blob) {
          ev.data.arrayBuffer().then((buf) => audioChunks.push(buf));
        } else if (ev.data instanceof ArrayBuffer) {
          audioChunks.push(ev.data);
        }
      };

      ttsWs.onerror = () => resolve();
      ttsWs.onclose = () => {
        // 如果没有音频，直接 resolve
        if (audioChunks.length === 0) resolve();
      };
    });
  }, []);

  // ========== ASR 录音 + 识别 ==========
  const startListening = useCallback(async () => {
    if (closingRef.current) return;
    setRecognizedText('');
    setError('');
    setState('listening');

    try {
      // 获取麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 创建 AudioContext
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);

      // 创建 ASR WebSocket
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const asrWs = new WebSocket(`${wsProtocol}//${window.location.host}/api/voice/asr-ws`);
      asrWsRef.current = asrWs;
      asrWs.binaryType = 'arraybuffer';

      let accText = '';
      let silenceStart: number | null = null;
      let asrReady = false;

      asrWs.onmessage = (ev) => {
        if (typeof ev.data === 'string') {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === 'ready') {
              asrReady = true;
            } else if (msg.type === 'asr') {
              // 更新识别文本
              if (msg.text) {
                accText = msg.text;
                setRecognizedText(accText);
              }
              // 收到新文本，重置静默计时
              if (msg.text && msg.text.trim()) {
                silenceStart = null;
                if (silenceTimerRef.current) {
                  clearTimeout(silenceTimerRef.current);
                  silenceTimerRef.current = null;
                }
              }
            }
          } catch {
            /* ignore */
          }
        }
      };

      asrWs.onerror = () => {
        setError('语音识别连接失败');
        setState('idle');
      };

      // ScriptProcessor 每 200ms 发送 audio chunk + 静默检测
      const bufferSize = Math.round(16000 * CHUNK_INTERVAL / 1000);
      // bufferSize 必须是 2 的幂
      const nearestPow2 = Math.pow(2, Math.ceil(Math.log2(bufferSize)));
      const processor = audioCtx.createScriptProcessor(nearestPow2 as number, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (closingRef.current || !asrReady) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // 计算 RMS 能量
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);

        // 静默检测
        if (rms < SILENCE_THRESHOLD) {
          if (silenceStart === null) {
            silenceStart = Date.now();
          } else if (Date.now() - silenceStart >= SILENCE_DURATION && accText.trim()) {
            // 2秒静默 + 有识别文本 → 结束录音
            silenceStart = null;
            finishRecording(accText);
            return;
          }
        } else {
          silenceStart = null;
        }

        // 转换为 16-bit PCM
        const pcm = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // 发送 PCM 数据到 ASR WebSocket
        if (asrWs.readyState === WebSocket.OPEN) {
          asrWs.send(pcm.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // 结束录音并发送给 AI
      const finishRecording = async (text: string) => {
        // 停止录音
        if (processorRef.current) {
          processorRef.current.disconnect();
          processorRef.current = null;
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }

        // 通知 ASR 结束
        if (asrWs.readyState === WebSocket.OPEN) {
          asrWs.send(JSON.stringify({ type: 'end' }));
          // 等一小段时间让最终结果返回
          await new Promise((r) => setTimeout(r, 500));
          asrWs.close();
        }
        asrWsRef.current = null;

        if (!text.trim() || closingRef.current) {
          setState('idle');
          return;
        }

        // 发送给 AI
        setState('sending');
        try {
          const reply = await onSubmit(text.trim());
          setAiReply(reply);

          if (closingRef.current) return;

          // TTS 播放
          if (reply.trim()) {
            await playTtsAudio(reply);
          }

          if (closingRef.current) return;

          // 循环：播放完毕后继续听
          setAiReply('');
          startListening();
        } catch (err: any) {
          setError(err.message || '发送失败');
          setState('idle');
        }
      };
    } catch (err: any) {
      setError(err.message || '麦克风权限获取失败');
      setState('idle');
    }
  }, [onSubmit, playTtsAudio, cleanup]);

  // 打开时自动开始录音
  useEffect(() => {
    if (isOpen && state === 'idle') {
      closingRef.current = false;
      const timer = setTimeout(() => startListening(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
      >
        {/* 关闭按钮 */}
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          onPress={handleClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
          aria-label="关闭语音对话"
        >
          <Xmark className="size-6" />
        </Button>

        {/* 状态指示 */}
        <div className="flex flex-col items-center gap-8 max-w-lg w-full px-6">
          {/* 动态波纹 */}
          <div className="relative flex items-center justify-center w-32 h-32">
            {state === 'listening' && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-500/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full bg-blue-500/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </>
            )}
            {state === 'sending' && (
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-500/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {state === 'playing' && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                state === 'listening'
                  ? 'bg-blue-500'
                  : state === 'sending'
                    ? 'bg-amber-500'
                    : state === 'playing'
                      ? 'bg-green-500'
                      : 'bg-neutral-600'
              }`}
            >
              <Microphone className="size-8 text-white" />
            </div>
          </div>

          {/* 状态文字 */}
          <p className="text-white/80 text-sm">{stateLabels[state]}</p>

          {/* 识别文本 */}
          {recognizedText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 rounded-lg px-4 py-3 w-full"
            >
              <p className="text-xs text-white/50 mb-1">你说：</p>
              <p className="text-white text-sm">{recognizedText}</p>
            </motion.div>
          )}

          {/* AI 回复 */}
          {aiReply && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 rounded-lg px-4 py-3 w-full max-h-48 overflow-y-auto"
            >
              <p className="text-xs text-white/50 mb-1">AI：</p>
              <div className="text-white text-sm prose prose-invert prose-sm max-w-none">
                <Markdown>{aiReply}</Markdown>
              </div>
            </motion.div>
          )}

          {/* 错误 */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/20 rounded-lg px-4 py-2 w-full"
            >
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* 手动重试按钮（仅 idle 状态） */}
          {state === 'idle' && isOpen && (
            <Button
              size="sm"
              variant="secondary"
              onPress={startListening}
              className="text-white"
            >
              <Microphone className="size-4" />
              开始对话
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
