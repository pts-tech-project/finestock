import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import type { ModuleId } from '../types';
import { APP_MODULES } from '../data/modules';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'finstock_active_module';
const DEMO_STORAGE_KEY = 'finstock_module_demos';
const DEMO_DAYS = 10;

export type DemoStatus = 'pending' | 'active';

export interface ModuleDemo {
  moduleId: ModuleId;
  userId: string;
  userName: string;
  userEmail: string;
  status: DemoStatus;
  requestedAt: string;
  /** Set when admin approves the demo */
  startsAt?: string;
  expiresAt?: string;
}

interface ModuleContextValue {
  activeModule: ModuleId | null;
  entitledModules: ModuleId[];
  demos: ModuleDemo[];
  hasAccess: (id: ModuleId) => boolean;
  getDemo: (id: ModuleId) => ModuleDemo | undefined;
  /** Days remaining on an active demo for the current user; null if none */
  demoDaysLeft: (id: ModuleId) => number | null;
  selectModule: (id: ModuleId) => { ok: boolean; error?: string };
  requestDemo: (id: ModuleId) => { ok: boolean; error?: string };
  requestPurchase: (id: ModuleId) => { ok: boolean; error?: string };
  /** Mock: admin approves a pending demo (normally done via email). */
  approveDemo: (id: ModuleId) => { ok: boolean; error?: string };
  clearModule: () => void;
}

const ModuleContext = createContext<ModuleContextValue | null>(null);

function readDemos(): ModuleDemo[] {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ModuleDemo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDemos(demos: ModuleDemo[]) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demos));
}

function isDemoActive(demo: ModuleDemo, now = Date.now()) {
  if (demo.status !== 'active' || !demo.expiresAt) return false;
  return new Date(demo.expiresAt).getTime() > now;
}

export function ModuleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const planModules = useMemo<ModuleId[]>(
    () => (user?.modules?.length ? user.modules : ['core']),
    [user]
  );

  const [demos, setDemos] = useState<ModuleDemo[]>(readDemos);

  // Drop expired active demos
  useEffect(() => {
    const now = Date.now();
    const next = demos.filter((d) => d.status === 'pending' || isDemoActive(d, now));
    if (next.length !== demos.length) {
      setDemos(next);
      writeDemos(next);
    }
  }, [demos]);

  const entitledModules = useMemo<ModuleId[]>(() => {
    if (!user) return planModules;
    const demoIds = demos
      .filter((d) => d.userId === user.id && isDemoActive(d))
      .map((d) => d.moduleId);
    return Array.from(new Set([...planModules, ...demoIds]));
  }, [planModules, demos, user]);

  const [activeModule, setActiveModule] = useState<ModuleId | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ModuleId | null;
    if (saved && APP_MODULES.some((m) => m.id === saved)) return saved;
    return null;
  });

  useEffect(() => {
    if (activeModule && !entitledModules.includes(activeModule)) {
      setActiveModule(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeModule, entitledModules]);

  const getDemo = useCallback(
    (id: ModuleId) => demos.find((d) => d.moduleId === id),
    [demos]
  );

  const demoDaysLeft = useCallback(
    (id: ModuleId) => {
      if (!user) return null;
      const demo = demos.find((d) => d.moduleId === id && d.userId === user.id && isDemoActive(d));
      if (!demo?.expiresAt) return null;
      const ms = new Date(demo.expiresAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    },
    [demos, user]
  );

  const hasAccess = useCallback(
    (id: ModuleId) => entitledModules.includes(id),
    [entitledModules]
  );

  const selectModule = useCallback(
    (id: ModuleId) => {
      if (!APP_MODULES.some((m) => m.id === id)) {
        return { ok: false, error: 'Unknown module.' };
      }
      if (!entitledModules.includes(id)) {
        return {
          ok: false,
          error: 'This module requires an additional payment or an approved demo.',
        };
      }
      setActiveModule(id);
      localStorage.setItem(STORAGE_KEY, id);
      return { ok: true };
    },
    [entitledModules]
  );

  const requestDemo = useCallback(
    (id: ModuleId) => {
      if (!user) return { ok: false, error: 'You must be signed in.' };
      if (!APP_MODULES.some((m) => m.id === id)) {
        return { ok: false, error: 'Unknown module.' };
      }
      if (planModules.includes(id)) {
        return { ok: false, error: 'This module is already on your plan.' };
      }

      const existing = demos.find((d) => d.moduleId === id);
      if (existing) {
        if (existing.userId === user.id && existing.status === 'pending') {
          return { ok: false, error: 'Your demo request is already waiting for admin approval by email.' };
        }
        if (existing.userId === user.id && isDemoActive(existing)) {
          return { ok: false, error: 'You already have an active demo for this module.' };
        }
        if (existing.userId !== user.id) {
          return {
            ok: false,
            error: 'A demo for this module is already assigned to another user. Only one user can use the demo.',
          };
        }
      }

      // Account-wide: one demo seat across add-ons for this org mock — also block if this user already has another pending/active demo
      const userHasOtherDemo = demos.some(
        (d) =>
          d.userId === user.id &&
          d.moduleId !== id &&
          (d.status === 'pending' || isDemoActive(d))
      );
      if (userHasOtherDemo) {
        return {
          ok: false,
          error: 'You already have a demo request or active demo. Only one demo user is allowed.',
        };
      }

      const next: ModuleDemo = {
        moduleId: id,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };

      const updated = [...demos.filter((d) => d.moduleId !== id), next];
      setDemos(updated);
      writeDemos(updated);

      return { ok: true };
    },
    [user, planModules, demos]
  );

  const requestPurchase = useCallback(
    (id: ModuleId) => {
      if (!user) return { ok: false, error: 'You must be signed in.' };
      if (!APP_MODULES.some((m) => m.id === id)) {
        return { ok: false, error: 'Unknown module.' };
      }
      if (planModules.includes(id)) {
        return { ok: false, error: 'This module is already on your plan.' };
      }
      return { ok: true };
    },
    [user, planModules]
  );

  const approveDemo = useCallback(
    (id: ModuleId) => {
      const existing = demos.find((d) => d.moduleId === id && d.status === 'pending');
      if (!existing) {
        return { ok: false, error: 'No pending demo request found for this module.' };
      }

      const startsAt = new Date();
      const expiresAt = new Date(startsAt);
      expiresAt.setDate(expiresAt.getDate() + DEMO_DAYS);

      const updated = demos.map((d) =>
        d.moduleId === id
          ? {
              ...d,
              status: 'active' as const,
              startsAt: startsAt.toISOString(),
              expiresAt: expiresAt.toISOString(),
            }
          : d
      );
      setDemos(updated);
      writeDemos(updated);
      return { ok: true };
    },
    [demos]
  );

  const clearModule = useCallback(() => {
    setActiveModule(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      activeModule,
      entitledModules,
      demos,
      hasAccess,
      getDemo,
      demoDaysLeft,
      selectModule,
      requestDemo,
      requestPurchase,
      approveDemo,
      clearModule,
    }),
    [
      activeModule,
      entitledModules,
      demos,
      hasAccess,
      getDemo,
      demoDaysLeft,
      selectModule,
      requestDemo,
      requestPurchase,
      approveDemo,
      clearModule,
    ]
  );

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
}

export function useModules() {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error('useModules must be used within ModuleProvider');
  return ctx;
}

export { DEMO_DAYS };
