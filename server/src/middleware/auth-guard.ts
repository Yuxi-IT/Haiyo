import { Elysia } from 'elysia';
import { verifyAccessToken } from '../services/auth';
import type { TokenPayload } from '../services/auth';

export const authGuard = new Elysia({ name: 'auth-guard' })
  .derive(async ({ headers }) => {
    const auth = headers.authorization;
    if (!auth?.startsWith('Bearer ')) return { user: null };

    const payload = await verifyAccessToken(auth.slice(7));
    return { user: payload };
  })
  .as('plugin');

export function requireAuth(user: TokenPayload | null) {
  if (!user) {
    return { success: false, error: '未登录或 token 已过期' };
  }
  return null;
}

export function requireAdmin(user: TokenPayload | null) {
  if (!user) {
    return { success: false, error: '未登录或 token 已过期' };
  }
  if (user.role !== 'admin') {
    return { success: false, error: '需要管理员权限' };
  }
  return null;
}
