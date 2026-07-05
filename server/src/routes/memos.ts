import { Elysia, t } from 'elysia';
import { Memo, FamilyMember } from '../models';
import { authGuard } from '../middleware/auth-guard';

export const memoRoutes = new Elysia({ prefix: '/api/memos' })
  .use(authGuard)
  .get('/', async () => {
    const memos = await Memo.find()
      .populate('createdBy', 'name uid')
      .sort({ pinned: -1, createdAt: -1 })
      .lean();
    return { success: true, data: memos };
  })
  .post('/', async ({ body, user }) => {
    if (!user) return { success: false, error: '请先登录' };
    const member = await FamilyMember.findOne({ uid: user.uid }).lean();
    const memo = await Memo.create({ content: body.content, type: body.type, pinned: body.pinned, color: body.color, createdBy: member?._id });
    return { success: true, data: memo };
  }, {
    body: t.Object({
      content: t.String(),
      type: t.Optional(t.String()),
      pinned: t.Optional(t.Boolean()),
      color: t.Optional(t.String()),
    }),
  })
  .put('/:id', async ({ params: { id }, body }) => {
    const memo = await Memo.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!memo) return { success: false, error: 'Memo not found' };
    return { success: true, data: memo };
  }, {
    body: t.Object({
      content: t.Optional(t.String()),
      pinned: t.Optional(t.Boolean()),
      color: t.Optional(t.String()),
      type: t.Optional(t.String()),
    }),
  })
  .delete('/:id', async ({ params: { id } }) => {
    const memo = await Memo.findByIdAndDelete(id);
    if (!memo) return { success: false, error: 'Memo not found' };
    return { success: true, data: { deleted: true } };
  })
  .patch('/:id/pin', async ({ params: { id } }) => {
    const memo = await Memo.findById(id);
    if (!memo) return { success: false, error: 'Memo not found' };
    memo.pinned = !memo.pinned;
    await memo.save();
    return { success: true, data: memo };
  });
