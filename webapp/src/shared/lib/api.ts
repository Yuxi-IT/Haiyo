import { getAccessToken, getRefreshToken, tryRefresh } from './auth';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options?.headers as Record<string, string> || {}) };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${BASE}${path}`, { ...options, headers });
  let data = await res.json();

  // 如果返回"请先登录"类错误且有 refresh token，尝试刷新后重试
  if (
    (!res.ok || data?.success === false) &&
    (data?.error?.includes('登录') || data?.error?.includes('token') || res.status === 401) &&
    getRefreshToken()
  ) {
    const user = await tryRefresh();
    if (user) {
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      res = await fetch(`${BASE}${path}`, { ...options, headers });
      data = await res.json();
    }
  }

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
