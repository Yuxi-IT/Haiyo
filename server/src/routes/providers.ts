import { Elysia, t } from 'elysia';
import { ApiProvider } from '../models';
import { getAdapter } from '../services/ai-protocol';

export const providerRoutes = new Elysia({ prefix: '/api/providers' })
  .get('/', async () => {
    const providers = await ApiProvider.find().lean();
    const safe = providers.map(({ apiKey, ...rest }) => ({ ...rest, apiKey: '***' }));
    return { success: true, data: safe };
  })
  .get('/:id', async ({ params: { id } }) => {
    const provider = await ApiProvider.findById(id).lean();
    if (!provider) return { success: false, error: 'Provider not found' };
    return { success: true, data: { ...provider, apiKey: '***' } };
  })
  .post('/', async ({ body }) => {
    const provider = await ApiProvider.create(body);
    return { success: true, data: { ...provider.toObject(), apiKey: '***' } };
  }, {
    body: t.Object({
      name: t.String(),
      baseUrl: t.String(),
      apiKey: t.String(),
      protocol: t.Union([
        t.Literal('claude'),
        t.Literal('openai-chat'),
        t.Literal('openai-reasoning'),
        t.Literal('deepseek-reasoning'),
      ]),
      models: t.Optional(t.Array(t.String())),
      enabled: t.Optional(t.Boolean()),
    }),
  })
  .put('/:id', async ({ params: { id }, body }) => {
    const provider = await ApiProvider.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!provider) return { success: false, error: 'Provider not found' };
    return { success: true, data: { ...provider, apiKey: '***' } };
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      baseUrl: t.Optional(t.String()),
      apiKey: t.Optional(t.String()),
      protocol: t.Optional(t.String()),
      models: t.Optional(t.Array(t.String())),
      enabled: t.Optional(t.Boolean()),
    }),
  })
  .delete('/:id', async ({ params: { id } }) => {
    const provider = await ApiProvider.findByIdAndDelete(id);
    if (!provider) return { success: false, error: 'Provider not found' };
    return { success: true, data: { deleted: true } };
  })
  .post('/:id/test', async ({ params: { id } }) => {
    const provider = await ApiProvider.findById(id);
    if (!provider) return { success: false, error: 'Provider not found' };

    try {
      const adapter = getAdapter(provider.protocol);
      const response = await adapter.complete(
        {
          messages: [{ role: 'user', content: 'Hi' }],
          model: provider.models[0] || 'default',
          maxTokens: 10,
        },
        { baseUrl: provider.baseUrl, apiKey: provider.apiKey }
      );
      return { success: true, data: { status: 'ok', response: response.content.slice(0, 100) } };
    } catch (error: any) {
      return { success: false, error: `Test failed: ${error.message}` };
    }
  });
