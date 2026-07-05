import { Elysia, t } from 'elysia';
import { Settings } from '../models';

export const settingsRoutes = new Elysia({ prefix: '/api/settings' })
  .get('/', async ({ query }) => {
    const filter = query.category ? { category: query.category } : {};
    const settings = await Settings.find(filter).lean();
    return { success: true, data: settings };
  })
  .get('/:key', async ({ params: { key } }) => {
    const setting = await Settings.findOne({ key }).lean();
    if (!setting) return { success: false, error: 'Setting not found' };
    return { success: true, data: setting };
  })
  .put('/:key', async ({ params: { key }, body }) => {
    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, ...body },
      { new: true, upsert: true }
    ).lean();
    return { success: true, data: setting };
  }, {
    body: t.Object({
      value: t.Unknown(),
      category: t.Optional(t.String()),
      description: t.Optional(t.String()),
    }),
  })
  .delete('/:key', async ({ params: { key } }) => {
    const setting = await Settings.findOneAndDelete({ key });
    if (!setting) return { success: false, error: 'Setting not found' };
    return { success: true, data: { deleted: true } };
  });
