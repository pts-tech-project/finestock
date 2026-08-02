import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import {
  ApiError,
  clearToken,
  getToken,
  loginRequest,
  mapAuthUser,
  meRequest,
  setToken,
} from '../lib/authApi';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  permissions: Record<string, boolean>;
  allowed: string[];
  isAuthenticated: boolean;
  /** True while restoring session from stored JWT via /api/auth/me */
  bootstrapping: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (name: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = 'finstock_user';

function persistSession(user: User, token: string) {
  setToken(token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem('finstock_active_module');
}

function clearSession() {
  clearToken();
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('finstock_active_module');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [allowed, setAllowed] = useState<string[]>([]);
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => {
    setUser(null);
    setTokenState(null);
    setPermissions({});
    setAllowed([]);
    clearSession();
  }, []);

  useEffect(() => {
    const existing = getToken();
    if (!existing) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await meRequest();
        if (cancelled) return;
        const mapped = mapAuthUser(res.data.user);
        setUser(mapped);
        setTokenState(existing);
        setPermissions(res.data.permissions ?? {});
        setAllowed(res.data.allowed ?? []);
        localStorage.setItem(USER_KEY, JSON.stringify(mapped));
      } catch {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setTokenState(null);
        setPermissions({});
        setAllowed([]);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }
    if (!email.includes('@')) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }

    try {
      const res = await loginRequest(email.trim(), password);
      const mapped = mapAuthUser(res.data.user);
      persistSession(mapped, res.data.token);
      setUser(mapped);
      setTokenState(res.data.token);
      setPermissions(res.data.permissions ?? {});
      setAllowed(res.data.allowed ?? []);
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Login failed. Please try again.';
      return { ok: false, error: message };
    }
  }, []);

  const hasPermission = useCallback(
    (name: string) => Boolean(permissions[name]) || allowed.includes(name),
    [permissions, allowed],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        allowed,
        isAuthenticated: !!user && !!token,
        bootstrapping,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
