const REFRESH_KEY = 'smart-home-refresh-token';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export interface UserInfo {
  id: string;
  username: string;
  role: 'admin' | 'member';
  uid?: string;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem(REFRESH_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_KEY);
  }
}

export async function login(username: string, password: string): Promise<{ user: UserInfo } | { error: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!data.success) return { error: data.error };
  accessToken = data.data.accessToken;
  setRefreshToken(data.data.refreshToken);
  return { user: data.data.user };
}

export function logout() {
  accessToken = null;
  setRefreshToken(null);
}

export async function tryRefresh(): Promise<UserInfo | null> {
  const rt = getRefreshToken();
  if (!rt) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
        const data = await res.json();
        if (!data.success) {
          logout();
          return null;
        }
        accessToken = data.data.accessToken;
        setRefreshToken(data.data.refreshToken);
        return data.data.user as UserInfo;
      } catch {
        logout();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    const user = await tryRefresh();
    if (user) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}
