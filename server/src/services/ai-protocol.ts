import type { AIProtocol, CompletionRequest, CompletionResponse, ToolUseBlock } from '../types';

interface AdapterConfig {
  baseUrl: string;
  apiKey: string;
}

export interface StreamEvent {
  type: 'text_delta' | 'reasoning_delta' | 'tool_use' | 'done' | 'error';
  content?: string;
  toolUse?: ToolUseBlock[];
  usage?: { inputTokens: number; outputTokens: number };
  error?: string;
}

interface AIAdapter {
  complete(request: CompletionRequest, config: AdapterConfig): Promise<CompletionResponse>;
  streamComplete(request: CompletionRequest, config: AdapterConfig): AsyncGenerator<StreamEvent>;
}

// ─── Helpers ────────────────────────────────────────────────────────

function extractContent(data: any): string {
  if (Array.isArray(data.content)) {
    const texts = data.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');
    if (texts) return texts;
  }
  if (typeof data.content === 'string') return data.content;
  const oc = data.choices?.[0]?.message?.content;
  if (typeof oc === 'string') return oc;
  if (typeof data.text === 'string') return data.text;
  return '';
}

function extractToolUse(data: any): ToolUseBlock[] | undefined {
  // Anthropic format
  if (Array.isArray(data.content)) {
    const blocks = data.content
      .filter((b: any) => b.type === 'tool_use')
      .map((b: any) => ({ id: b.id, name: b.name, input: b.input || {} }));
    if (blocks.length > 0) return blocks;
  }
  // OpenAI format
  const toolCalls = data.choices?.[0]?.message?.tool_calls;
  if (Array.isArray(toolCalls) && toolCalls.length > 0) {
    return toolCalls.map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      input: JSON.parse(tc.function.arguments || '{}'),
    }));
  }
  return undefined;
}

function extractStopReason(data: any): CompletionResponse['stopReason'] {
  // Anthropic
  if (data.stop_reason === 'tool_use') return 'tool_use';
  if (data.stop_reason === 'end_turn') return 'end_turn';
  if (data.stop_reason === 'max_tokens') return 'max_tokens';
  // OpenAI
  const fr = data.choices?.[0]?.finish_reason;
  if (fr === 'tool_calls') return 'tool_use';
  if (fr === 'stop') return 'end_turn';
  if (fr === 'length') return 'max_tokens';
  return 'end_turn';
}

function extractUsage(data: any) {
  return {
    inputTokens: data.usage?.input_tokens || data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.output_tokens || data.usage?.completion_tokens || 0,
  };
}

// ─── Claude (Anthropic Messages API) ────────────────────────────────

function buildClaudeBody(request: CompletionRequest, stream: boolean): Record<string, unknown> {
  const systemMsg = request.messages.find((m) => m.role === 'system');
  const msgs = request.messages.filter((m) => m.role !== 'system').map((m) => {
    if (m.role === 'tool_result' && m.toolResults) {
      return {
        role: 'user',
        content: m.toolResults.map((tr) => ({
          type: 'tool_result',
          tool_use_id: tr.toolUseId,
          content: tr.content,
          is_error: tr.isError || false,
        })),
      };
    }
    if (m.toolUse && m.toolUse.length > 0) {
      const content: any[] = [];
      if (m.content) content.push({ type: 'text', text: m.content });
      for (const tu of m.toolUse) {
        content.push({ type: 'tool_use', id: tu.id, name: tu.name, input: tu.input });
      }
      return { role: 'assistant', content };
    }
    return { role: m.role, content: [{ type: 'text', text: m.content }] };
  });

  const body: Record<string, unknown> = {
    model: request.model,
    max_tokens: request.maxTokens || 4096,
    messages: msgs,
    stream,
  };
  if (request.temperature !== undefined) body.temperature = request.temperature;
  if (systemMsg) body.system = systemMsg.content;
  if (request.tools && request.tools.length > 0) {
    body.tools = request.tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema,
    }));
  }
  return body;
}

async function* parseClaudeSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const toolUseBlocks: Record<string, { id: string; name: string; input: string }> = {};
  let usage = { inputTokens: 0, outputTokens: 0 };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6);
      if (json === '[DONE]') continue;
      try {
        const ev = JSON.parse(json) as any;
        const type = ev.type;

        if (type === 'message_start') {
          usage.inputTokens = ev.message?.usage?.input_tokens || 0;
        } else if (type === 'content_block_delta') {
          const delta = ev.delta;
          if (delta.type === 'text_delta') {
            yield { type: 'text_delta', content: delta.text };
          } else if (delta.type === 'input_json_delta') {
            const idx = ev.index;
            if (!toolUseBlocks[idx]) toolUseBlocks[idx] = { id: '', name: '', input: '' };
            toolUseBlocks[idx].input += delta.partial_json;
          }
        } else if (type === 'content_block_start') {
          const block = ev.content_block;
          if (block.type === 'tool_use') {
            const idx = ev.index;
            toolUseBlocks[idx] = { id: block.id, name: block.name, input: '' };
          }
        } else if (type === 'message_delta') {
          usage.outputTokens = ev.usage?.output_tokens || 0;
        } else if (type === 'message_stop') {
          const toolUses = Object.values(toolUseBlocks);
          if (toolUses.length > 0) {
            yield {
              type: 'tool_use',
              toolUse: toolUses.map((tu) => ({ id: tu.id, name: tu.name, input: JSON.parse(tu.input || '{}') })),
            };
          }
          yield { type: 'done', usage };
        }
      } catch {}
    }
  }
}

const claudeAdapter: AIAdapter = {
  async complete(request, config) {
    const body = buildClaudeBody(request, false);
    const res = await fetch(`${config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    return {
      content: extractContent(data),
      toolUse: extractToolUse(data),
      stopReason: extractStopReason(data),
      model: data.model,
      usage: extractUsage(data),
    };
  },

  async *streamComplete(request, config) {
    const body = buildClaudeBody(request, true);
    const res = await fetch(`${config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      yield { type: 'error', error: `Claude API error: ${res.status}` };
      return;
    }
    yield* parseClaudeSSE(res.body!);
  },
};

function buildOpenAIBody(request: CompletionRequest, stream: boolean): Record<string, unknown> {
  const msgs = request.messages.map((m) => {
    if (m.role === 'tool_result' && m.toolResults) {
      return m.toolResults.map((tr) => ({
        role: 'tool',
        tool_call_id: tr.toolUseId,
        content: tr.content,
      }));
    }
    if (m.toolUse && m.toolUse.length > 0) {
      return {
        role: 'assistant',
        content: m.content || null,
        tool_calls: m.toolUse.map((tu) => ({
          id: tu.id,
          type: 'function',
          function: { name: tu.name, arguments: JSON.stringify(tu.input) },
        })),
      };
    }
    return { role: m.role, content: m.content };
  }).flat();

  const body: Record<string, unknown> = {
    model: request.model,
    max_tokens: request.maxTokens || 1024,
    messages: msgs,
    stream,
  };
  if (request.temperature !== undefined) body.temperature = request.temperature;
  if (request.tools && request.tools.length > 0) {
    body.tools = request.tools.map((t) => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.inputSchema },
    }));
  }
  return body;
}

// ─── OpenAI Chat Completions (SSE streaming) ────────────────────────

async function* parseOpenAISSE(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const toolCallAcc: Record<number, { id: string; name: string; args: string }> = {};
  let usage = { inputTokens: 0, outputTokens: 0 };
  let finished = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6);
      if (json === '[DONE]') {
        finished = true;
        continue;
      }
      try {
        const ev = JSON.parse(json) as any;
        const choice = ev.choices?.[0];
        if (!choice) continue;
        const delta = choice.delta;

        if (delta?.content) {
          yield { type: 'text_delta', content: delta.content };
        }
        if (delta?.reasoning_content) {
          yield { type: 'reasoning_delta', content: delta.reasoning_content };
        }
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCallAcc[idx]) toolCallAcc[idx] = { id: tc.id || '', name: '', args: '' };
            if (tc.id) toolCallAcc[idx].id = tc.id;
            if (tc.function?.name) toolCallAcc[idx].name += tc.function.name;
            if (tc.function?.arguments) toolCallAcc[idx].args += tc.function.arguments;
          }
        }
        if (ev.usage) {
          usage = {
            inputTokens: ev.usage.prompt_tokens || 0,
            outputTokens: ev.usage.completion_tokens || 0,
          };
        }
        if (choice.finish_reason === 'tool_calls') {
          const tcs = Object.values(toolCallAcc);
          yield {
            type: 'tool_use',
            toolUse: tcs.map((tc) => ({
              id: tc.id,
              name: tc.name,
              input: JSON.parse(tc.args || '{}'),
            })),
          };
        }
      } catch {}
    }
  }
  if (finished) yield { type: 'done', usage };
}

const openaiChatAdapter: AIAdapter = {
  async complete(request, config) {
    const body = buildOpenAIBody(request, false);
    const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    return {
      content: extractContent(data),
      toolUse: extractToolUse(data),
      stopReason: extractStopReason(data),
      model: data.model,
      usage: extractUsage(data),
    };
  },

  async *streamComplete(request, config) {
    const body = buildOpenAIBody(request, true);
    const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      yield { type: 'error', error: `OpenAI API error: ${res.status}` };
      return;
    }
    yield* parseOpenAISSE(res.body!);
  },
};

// ─── OpenAI Reasoning (o1/o3) ───────────────────────────────────────

const openaiReasoningAdapter: AIAdapter = {
  async complete(request, config) {
    const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        max_completion_tokens: request.maxTokens || 4096,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) throw new Error(`OpenAI Reasoning API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    const choice = data.choices?.[0]?.message;
    const usage = extractUsage(data);
    return {
      content: extractContent(data),
      reasoning: choice?.reasoning_content || undefined,
      model: data.model,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens + (data.usage?.completion_tokens_details?.reasoning_tokens || 0),
      },
    };
  },

  async *streamComplete(request, config) {
    const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        max_completion_tokens: request.maxTokens || 4096,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });
    if (!res.ok) { yield { type: 'error', error: `API error: ${res.status}` }; return; }
    yield* parseOpenAISSE(res.body!);
  },
};

// ─── DeepSeek Reasoning (R1) ────────────────────────────────────────

const deepseekReasoningAdapter: AIAdapter = {
  async complete(request, config) {
    const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens || 4096,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) throw new Error(`DeepSeek API error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    const choice = data.choices?.[0]?.message;
    return {
      content: extractContent(data),
      reasoning: choice?.reasoning_content || undefined,
      model: data.model,
      usage: extractUsage(data),
    };
  },

  async *streamComplete(request, config) {
    const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens || 4096,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });
    if (!res.ok) { yield { type: 'error', error: `API error: ${res.status}` }; return; }
    yield* parseOpenAISSE(res.body!);
  },
};

// ─── Factory ────────────────────────────────────────────────────────

const adapters: Record<AIProtocol, AIAdapter> = {
  claude: claudeAdapter,
  'openai-chat': openaiChatAdapter,
  'openai-reasoning': openaiReasoningAdapter,
  'deepseek-reasoning': deepseekReasoningAdapter,
};

export function getAdapter(protocol: AIProtocol): AIAdapter {
  const adapter = adapters[protocol];
  if (!adapter) throw new Error(`Unknown protocol: ${protocol}`);
  return adapter;
}
