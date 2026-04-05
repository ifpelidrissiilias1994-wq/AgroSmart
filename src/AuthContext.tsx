import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from './api';
import { authApi, ApiError } from './api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (data: { username: string; email: string; password: string; password2: string; accept_data_policy: boolean }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const u = await authApi.me();
      setUser(u);
    } catch (_e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (identifier: string, password: string) => {
    const u = await authApi.login(identifier, password);
    setUser(u);
    return u;
  };

  const register = async (data: Parameters<typeof authApi.register>[0]) => {
    const u = await authApi.register(data);
    setUser(u);
    return u;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (_e) { /* ignore */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
