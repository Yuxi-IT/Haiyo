import { Elysia, t } from 'elysia';
import { ApiProvider, McpServer } from '../models';
import { getAdapter } from '../services/ai-protocol';
import { builtinTools, getBuiltinTool } from '../services/builtin-tools';
import { buildSystemPrompt } from '../services/prompt-builder';
import type { CompletionMessage, ToolDefinition, ToolUseBlock, ToolResultBlock } from '../types';

const MAX_TOOL_ITERATIONS = 5;

async function callMcpTool(serverUrl: string, toolName: string, input: Record<string, unknown>): Promise<{ content: string; isError: boolean }> {
  try {
    const res = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: crypto.randomUUID(),
        params: { name: toolName, arguments: input },
      }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json() as any;
    if (data.error) {
      return { content: `MCP 错误: ${data.error.message || JSON.stringify(data.error)}`, isError: true };
    }
    const result = data.result?.content;
    if (Array.isArray(result)) {
      return { content: result.map((r: any) => r.text || JSON.stringify(r)).join('\n'), isError: false };
    }
    return { content: JSON.stringify(data.result || data), isError: false };
  } catch (e: any) {
    return { content: `工具调用失败: ${e.message}`, isError: true };
  }
}

export const chatRoutes = new Elysia({ prefix: '/api' })
  .post('/chat', async ({ body }) => {
    const provider = body.providerId
      ? await ApiProvider.findById(body.providerId)
      : await ApiProvider.findOne({ enabled: true });

    if (!provider) {
      return { success: false, error: '没有可用的 AI 供应商，请先在设置中配置并启用一个供应商' };
    }

    const toolCtx = body.user ? { userId: body.user.id, username: body.user.username, role: body.user.role, uid: body.user.uid } : undefined;

    // ... rest unchanged, but pass toolCtx to execute calls

    const model = body.model || provider.models[0];
    if (!model) {
      return { success: false, error: `供应商「${provider.name}」没有配置模型，请先在设置中添加模型` };
    }

    const mcps = await McpServer.find({ status: 'online' }).lean();

    // Build tool definitions from MCP servers + built-in tools
    const tools: ToolDefinition[] = [];
    const toolServerMap: Record<string, string> = {};

    for (const mcp of mcps) {
      for (const tool of mcp.tools) {
        tools.push({
          name: tool.name,
          description: tool.description || '',
          inputSchema: tool.inputSchema || { type: 'object', properties: {} },
        });
        toolServerMap[tool.name] = mcp.url;
      }
    }

    for (const bt of builtinTools) {
      tools.push(bt.definition);
    }

    const systemPrompt = await buildSystemPrompt();

    const messages: CompletionMessage[] = [
      { role: 'system', content: systemPrompt },
      ...body.messages.map((m) => ({
        role: m.role as CompletionMessage['role'],
        content: m.content,
      })),
    ];

    try {
      const adapter = getAdapter(provider.protocol);
      let totalUsage = { inputTokens: 0, outputTokens: 0 };
      let finalContent = '';
      let finalReasoning: string | undefined;
      const toolCalls: { name: string; input: Record<string, unknown>; result: string }[] = [];

      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        const response = await adapter.complete(
          {
            messages,
            model,
            maxTokens: body.maxTokens || 4096,
            temperature: body.temperature ?? 0.7,
            tools: tools.length > 0 ? tools : undefined,
          },
          { baseUrl: provider.baseUrl, apiKey: provider.apiKey }
        );

        totalUsage.inputTokens += response.usage.inputTokens;
        totalUsage.outputTokens += response.usage.outputTokens;

        if (response.stopReason === 'tool_use' && response.toolUse && response.toolUse.length > 0) {
          messages.push({
            role: 'assistant',
            content: response.content || '',
            toolUse: response.toolUse,
          });

          const results: ToolResultBlock[] = [];
          for (const tu of response.toolUse) {
            const builtinTool = getBuiltinTool(tu.name);
            if (builtinTool) {
              const result = await builtinTool.execute(tu.input, toolCtx);
              results.push({ toolUseId: tu.id, content: result, isError: false });
              toolCalls.push({ name: tu.name, input: tu.input, result });
              continue;
            }
            const serverUrl = toolServerMap[tu.name];
            if (!serverUrl) {
              results.push({ toolUseId: tu.id, content: `未知工具: ${tu.name}`, isError: true });
              continue;
            }
            const result = await callMcpTool(serverUrl, tu.name, tu.input);
            results.push({ toolUseId: tu.id, content: result.content, isError: result.isError });
            toolCalls.push({ name: tu.name, input: tu.input, result: result.content });
          }

          messages.push({ role: 'tool_result', content: '', toolResults: results });
          continue;
        }

        finalContent = response.content;
        finalReasoning = response.reasoning;
        break;
      }

      return {
        success: true,
        data: {
          content: finalContent,
          reasoning: finalReasoning,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          model,
          usage: totalUsage,
          provider: { name: provider.name, protocol: provider.protocol },
        },
      };
    } catch (error: any) {
      const detail = error.cause?.code || error.message;
      return {
        success: false,
        error: `AI 调用失败\n供应商: ${provider.name}\n地址: ${provider.baseUrl}\n模型: ${model}\n原因: ${detail}`,
      };
    }
  }, {
    body: t.Object({
      messages: t.Array(t.Object({
        role: t.Union([t.Literal('user'), t.Literal('assistant'), t.Literal('system')]),
        content: t.String(),
      })),
      providerId: t.Optional(t.String()),
      model: t.Optional(t.String()),
      maxTokens: t.Optional(t.Number()),
      temperature: t.Optional(t.Number()),
      user: t.Optional(t.Object({
        id: t.String(),
        username: t.String(),
        role: t.String(),
        uid: t.Optional(t.String()),
      })),
    }),
  })

  // ─── Streaming chat ────────────────────────────────────────────────

  .post('/chat/stream', async ({ body }) => {
    const provider = body.providerId
      ? await ApiProvider.findById(body.providerId)
      : await ApiProvider.findOne({ enabled: true });

    if (!provider) {
      return new Response(JSON.stringify({ error: '没有可用的 AI 供应商' }), { status: 400 });
    }

    const model = body.model || provider.models[0];
    if (!model) {
      return new Response(JSON.stringify({ error: '没有配置模型' }), { status: 400 });
    }

    const mcps = await McpServer.find({ status: 'online' }).lean();
    const tools: ToolDefinition[] = [];
    const toolServerMap: Record<string, string> = {};

    for (const mcp of mcps) {
      for (const tool of mcp.tools) {
        tools.push({
          name: tool.name,
          description: tool.description || '',
          inputSchema: tool.inputSchema || { type: 'object', properties: {} },
        });
        toolServerMap[tool.name] = mcp.url;
      }
    }
    for (const bt of builtinTools) tools.push(bt.definition);

    const systemPrompt = await buildSystemPrompt();

    const messages: CompletionMessage[] = [
      { role: 'system', content: systemPrompt },
      ...body.messages.map((m: any) => ({
        role: m.role as CompletionMessage['role'],
        content: m.content,
      })),
    ];

    const toolCtx = body.user ? { userId: body.user.id, username: body.user.username, role: body.user.role, uid: body.user.uid } : undefined;

    const adapter = getAdapter(provider.protocol);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        try {
          for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
            const gen = adapter.streamComplete(
              { messages, model, maxTokens: body.maxTokens || 4096, temperature: body.temperature ?? 0.7, tools: tools.length > 0 ? tools : undefined },
              { baseUrl: provider.baseUrl, apiKey: provider.apiKey }
            );

            let textBuf = '';
            let reasoningBuf = '';
            let toolUseFound = false;

            for await (const ev of gen) {
              if (ev.type === 'text_delta') {
                textBuf += ev.content!;
                send({ type: 'text', content: ev.content });
              } else if (ev.type === 'reasoning_delta') {
                reasoningBuf += ev.content!;
                send({ type: 'reasoning', content: ev.content });
              } else if (ev.type === 'tool_use' && ev.toolUse) {
                toolUseFound = true;
                send({ type: 'tool_use', toolUse: ev.toolUse });

                // Execute tools
                const results: ToolResultBlock[] = [];
                for (const tu of ev.toolUse) {
                  const builtinTool = getBuiltinTool(tu.name);
                  if (builtinTool) {
                    const result = await builtinTool.execute(tu.input, toolCtx);
                    results.push({ toolUseId: tu.id, content: result, isError: false });
                  } else {
                    const serverUrl = toolServerMap[tu.name];
                    if (!serverUrl) {
                      results.push({ toolUseId: tu.id, content: `未知工具: ${tu.name}`, isError: true });
                    } else {
                      const r = await callMcpTool(serverUrl, tu.name, tu.input);
                      results.push({ toolUseId: tu.id, content: r.content, isError: r.isError });
                    }
                  }
                }

                send({ type: 'tool_result', results: results.map((r) => ({ id: r.toolUseId, content: r.content, isError: r.isError })) });

                messages.push({
                  role: 'assistant',
                  content: textBuf,
                  toolUse: ev.toolUse,
                });
                messages.push({ role: 'tool_result', content: '', toolResults: results });
                break;
              } else if (ev.type === 'error') {
                send({ type: 'error', error: ev.error });
                break;
              }
            }

            if (!toolUseFound) {
              send({ type: 'done' });
              break;
            }
          }
        } catch (e: any) {
          send({ type: 'error', error: e.message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  }, {
    body: t.Object({
      messages: t.Array(t.Object({
        role: t.Union([t.Literal('user'), t.Literal('assistant'), t.Literal('system')]),
        content: t.String(),
      })),
      providerId: t.Optional(t.String()),
      model: t.Optional(t.String()),
      maxTokens: t.Optional(t.Number()),
      temperature: t.Optional(t.Number()),
      user: t.Optional(t.Object({
        id: t.String(),
        username: t.String(),
        role: t.String(),
        uid: t.Optional(t.String()),
      })),
    }),
  })

  .get('/chat/providers', async () => {
    const providers = await ApiProvider.find({ enabled: true }).lean();
    return {
      success: true,
      data: providers.map(({ apiKey, ...rest }) => ({
        ...rest,
        apiKey: '***',
      })),
    };
  });
