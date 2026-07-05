import { Elysia, t } from 'elysia';
import { McpServer } from '../models';

export const mcpRoutes = new Elysia({ prefix: '/api/mcp' })
  .get('/', async () => {
    const servers = await McpServer.find().lean();
    return { success: true, data: servers };
  })
  .get('/:id', async ({ params: { id } }) => {
    const server = await McpServer.findById(id).lean();
    if (!server) return { success: false, error: 'MCP server not found' };
    return { success: true, data: server };
  })
  .post('/', async ({ body }) => {
    const server = await McpServer.create(body);
    return { success: true, data: server };
  }, {
    body: t.Object({
      name: t.String(),
      url: t.String(),
      tools: t.Optional(t.Array(t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        inputSchema: t.Optional(t.Record(t.String(), t.Unknown())),
      }))),
    }),
  })
  .put('/:id', async ({ params: { id }, body }) => {
    const server = await McpServer.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!server) return { success: false, error: 'MCP server not found' };
    return { success: true, data: server };
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      url: t.Optional(t.String()),
    }),
  })
  .delete('/:id', async ({ params: { id } }) => {
    const server = await McpServer.findByIdAndDelete(id);
    if (!server) return { success: false, error: 'MCP server not found' };
    return { success: true, data: { deleted: true } };
  })
  .post('/:id/test', async ({ params: { id } }) => {
    const server = await McpServer.findById(id);
    if (!server) return { success: false, error: 'MCP server not found' };

    try {
      const res = await fetch(server.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'initialize', id: 1, params: { capabilities: {} } }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        server.status = 'online';
        server.lastChecked = new Date();
        await server.save();
        return { success: true, data: { status: 'online' } };
      }
      server.status = 'error';
      server.lastChecked = new Date();
      await server.save();
      return { success: false, error: `Server returned ${res.status}` };
    } catch (error: any) {
      server.status = 'offline';
      server.lastChecked = new Date();
      await server.save();
      return { success: false, error: error.message };
    }
  })
  .get('/:id/tools', async ({ params: { id } }) => {
    const server = await McpServer.findById(id);
    if (!server) return { success: false, error: 'MCP server not found' };

    try {
      const res = await fetch(server.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 2, params: {} }),
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json() as any;
      if (data.result?.tools) {
        server.tools = data.result.tools;
        await server.save();
      }
      return { success: true, data: server.tools };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
