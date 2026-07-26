import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('finstock_user');
    return saved ? (JSON.parse(saved) as User) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (!email || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }
    if (!email.includes('@')) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 4) {
      return { ok: false, error: 'Password must be at least 4 characters.' };
    }
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { ok: false, error: 'No account found for that email.' };
    }
    if (found.status !== 'Active') {
      return { ok: false, error: 'This account is inactive.' };
    }
    setUser(found);
    localStorage.setItem('finstock_user', JSON.stringify(found));
    localStorage.removeItem('finstock_active_module');
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('finstock_user');
    localStorage.removeItem('finstock_active_module');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
