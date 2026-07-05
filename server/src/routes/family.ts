import { Elysia, t } from 'elysia';
import { FamilyMember, User } from '../models';
import { authGuard, requireAdmin } from '../middleware/auth-guard';
import { hashPassword } from '../services/auth';

export const familyRoutes = new Elysia({ prefix: '/api/family' })
  .use(authGuard)

  // ─── Read (public) ──────────────────────────────────────────────
  .get('/', async () => {
    const members = await FamilyMember.find().lean();
    return { success: true, data: members };
  })
  .get('/:id', async ({ params: { id } }) => {
    const member = await FamilyMember.findById(id).lean();
    if (!member) return { success: false, error: 'Member not found' };
    return { success: true, data: member };
  })
  .get('/:id/emotions', async ({ params: { id }, query }) => {
    const member = await FamilyMember.findById(id).lean();
    if (!member) return { success: false, error: 'Member not found' };
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const records = (member.emotionRecords || [])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice((page - 1) * limit, page * limit);
    return { success: true, data: records, meta: { total: member.emotionRecords?.length || 0, page, limit } };
  })

  // ─── Write (admin only) ─────────────────────────────────────────
  .post('/', async ({ body, user }) => {
    const err = requireAdmin(user);
    if (err) return err;

    // Generate a unique uid for the member
    const uid = `M${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const member = await FamilyMember.create({
      uid,
      name: body.name,
      gender: body.gender,
      birthday: body.birthday,
      avatar: body.avatar,
      email: body.email,
      accessLevel: body.accessLevel,
    });

    // Create user account — name is the login username, link via uid
    const existing = await User.findOne({ username: body.name });
    if (!existing) {
      await User.create({
        username: body.name,
        password: await hashPassword(body.password),
        role: 'member',
        memberId: uid,
      });
    } else {
      existing.memberId = uid;
      await existing.save();
    }

    return { success: true, data: member };
  }, {
    body: t.Object({
      name: t.String(),
      password: t.String(),
      gender: t.Optional(t.String()),
      avatar: t.Optional(t.String()),
      birthday: t.Optional(t.String()),
      email: t.Optional(t.String()),
      accessLevel: t.Optional(t.String()),
    }),
  })

  .put('/:id', async ({ params: { id }, body, user }) => {
    const err = requireAdmin(user);
    if (err) return err;
    const member = await FamilyMember.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!member) return { success: false, error: 'Member not found' };
    return { success: true, data: member };
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      gender: t.Optional(t.String()),
      avatar: t.Optional(t.String()),
      birthday: t.Optional(t.String()),
      email: t.Optional(t.String()),
      accessLevel: t.Optional(t.String()),
      isHome: t.Optional(t.Boolean()),
    }),
  })

  .delete('/:id', async ({ params: { id }, user }) => {
    const err = requireAdmin(user);
    if (err) return err;
    const member = await FamilyMember.findByIdAndDelete(id);
    if (!member) return { success: false, error: 'Member not found' };
    return { success: true, data: { deleted: true } };
  })

  .post('/:id/emotions', async ({ params: { id }, body, user }) => {
    const err = requireAdmin(user);
    if (err) return err;
    const member = await FamilyMember.findByIdAndUpdate(
      id,
      { $push: { emotionRecords: { ...body, timestamp: new Date() } } },
      { new: true }
    ).lean();
    if (!member) return { success: false, error: 'Member not found' };
    return { success: true, data: member.emotionRecords?.[member.emotionRecords.length - 1] };
  }, {
    body: t.Object({
      emotion: t.String(),
      context: t.Optional(t.String()),
      sensorSnapshot: t.Optional(t.Object({
        temperature: t.Optional(t.Number()),
        humidity: t.Optional(t.Number()),
      })),
    }),
  });
