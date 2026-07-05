import { Elysia, t } from 'elysia';
import { User, FamilyMember } from '../models';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, hashPassword, verifyPassword } from '../services/auth';

let seeded = false;
async function seedAdmin() {
  if (seeded) return;
  try {
    const exists = await User.findOne({ username: 'admin' });
    if (!exists) {
      const uid = `M${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      await FamilyMember.create({ uid, name: '管理员', gender: 'male', accessLevel: 'full' });
      await User.create({
        username: 'admin',
        password: await hashPassword('admin123'),
        role: 'admin',
        memberId: uid,
      });
      console.log('[Auth] Default admin account created: admin / admin123, uid:', uid);
    }
    seeded = true;
  } catch (e: any) {
    console.error('[Auth] Seed admin failed:', e.message);
  }
}

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .post('/login', async ({ body }) => {
    await seedAdmin();
    const user = await User.findOne({ username: body.username });
    if (!user) return { success: false, error: '用户名或密码错误' };

    const valid = await verifyPassword(body.password, user.password);
    if (!valid) return { success: false, error: '用户名或密码错误' };

    const payload = { userId: user._id.toString(), username: user.username, role: user.role, uid: user.memberId };
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user._id, username: user.username, role: user.role, uid: user.memberId },
      },
    };
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
  })

  .post('/refresh', async ({ body }) => {
    const payload = await verifyRefreshToken(body.refreshToken);
    if (!payload) return { success: false, error: 'refresh token 无效或已过期' };

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== body.refreshToken) {
      return { success: false, error: 'refresh token 无效' };
    }

    const newPayload = { userId: user._id.toString(), username: user.username, role: user.role, uid: user.memberId };
    const accessToken = await generateAccessToken(newPayload);
    const refreshToken = await generateRefreshToken(newPayload);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user._id, username: user.username, role: user.role, uid: user.memberId },
      },
    };
  }, {
    body: t.Object({
      refreshToken: t.String(),
    }),
  })

  .get('/me', async ({ headers }) => {
    const auth = headers.authorization;
    if (!auth?.startsWith('Bearer ')) return { success: false, error: '未登录' };

    const payload = await verifyAccessToken(auth.slice(7));
    if (!payload) return { success: false, error: 'token 无效或已过期' };

    const user = await User.findById(payload.userId).select('-password -refreshToken');
    if (!user) return { success: false, error: '用户不存在' };

    return { success: true, data: { id: user._id, username: user.username, role: user.role, uid: user.memberId } };
  });
