import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { login as authLogin, logout as authLogout, tryRefresh, type UserInfo } from '../lib/auth';

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, login: async () => null, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tryRefresh().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    const result = await authLogin(username, password);
    if ('error' in result) return result.error;
    setUser(result.user);
    return null;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
