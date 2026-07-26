import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  UsersRound,
  Sparkles,
  Lock,
  ArrowRight,
  LogOut,
  Clock,
  ShoppingCart,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModules, DEMO_DAYS } from '../context/ModuleContext';
import { useToast } from '../context/ToastContext';
import { APP_MODULES } from '../data/modules';
import type { ModuleId } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

const icons: Record<ModuleId, typeof LayoutDashboard> = {
  core: LayoutDashboard,
  hmrc: Landmark,
  payroll: UsersRound,
  ai: Sparkles,
};

const accents: Record<ModuleId, string> = {
  core: '#0f766e',
  hmrc: '#1e3a5f',
  payroll: '#0e7490',
  ai: '#334155',
};

export function ModulesPage() {
  const { user, logout } = useAuth();
  const {
    entitledModules,
    selectModule,
    hasAccess,
    getDemo,
    demoDaysLeft,
    requestDemo,
    requestPurchase,
    approveDemo,
  } = useModules();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [demoModuleId, setDemoModuleId] = useState<ModuleId | null>(null);
  const [purchaseModuleId, setPurchaseModuleId] = useState<ModuleId | null>(null);

  const unlockedCount = APP_MODULES.filter((m) => entitledModules.includes(m.id)).length;
  const demoModule = APP_MODULES.find((m) => m.id === demoModuleId);
  const purchaseModule = APP_MODULES.find((m) => m.id === purchaseModuleId);

  const openModule = (id: ModuleId) => {
    const mod = APP_MODULES.find((m) => m.id === id);
    if (!mod) return;

    if (!hasAccess(id)) {
      toast('Additional payment or an approved demo is required', 'error');
      return;
    }

    const result = selectModule(id);
    if (!result.ok) {
      toast(result.error ?? 'Unable to open module', 'error');
      return;
    }
    navigate(mod.homePath);
  };

  const confirmDemoRequest = () => {
    if (!demoModuleId) return;
    const result = requestDemo(demoModuleId);
    setDemoModuleId(null);
    if (!result.ok) {
      toast(result.error ?? 'Could not request demo', 'error');
      return;
    }
    toast(
      'Demo request sent. An admin will review it and confirm by email before the 10-day trial starts.',
      'info'
    );
  };

  const confirmPurchase = () => {
    if (!purchaseModuleId) return;
    const result = requestPurchase(purchaseModuleId);
    setPurchaseModuleId(null);
    if (!result.ok) {
      toast(result.error ?? 'Could not start purchase', 'error');
      return;
    }
    toast(
      'Purchase request sent. Our team will email you payment details to unlock this module.',
      'info'
    );
  };

  const handleApproveDemo = (id: ModuleId) => {
    const result = approveDemo(id);
    if (!result.ok) {
      toast(result.error ?? 'Could not approve demo', 'error');
      return;
    }
    toast(`Demo approved. Access is active for ${DEMO_DAYS} days.`, 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="modules-page">
      <div className="modules-bg" aria-hidden="true">
        <div className="modules-orb modules-orb-a" />
        <div className="modules-orb modules-orb-b" />
        <div className="modules-grid-pattern" />
      </div>

      <header className="modules-top">
        <div className="modules-user-chip">
          <span className="modules-avatar">{user?.name?.charAt(0) ?? 'U'}</span>
          <div className="modules-user-meta">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </div>
        <button type="button" className="modules-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </header>

      <main className="modules-main">
        <section className="modules-hero">
          <div className="modules-mark">F</div>
          <p className="modules-kicker">Welcome back</p>
          <h1 className="modules-brand-title">FinStock</h1>
          <p className="modules-lead">
            Choose where to work today. {unlockedCount} of {APP_MODULES.length} modules are available on your plan.
          </p>
        </section>

        <section className="modules-grid" aria-label="Available modules">
          {APP_MODULES.map((mod, index) => {
            const Icon = icons[mod.id];
            const unlocked = hasAccess(mod.id);
            const accent = accents[mod.id];
            const demo = getDemo(mod.id);
            const daysLeft = demoDaysLeft(mod.id);
            const isOwnPending = demo?.status === 'pending' && demo.userId === user?.id;
            const isOtherDemo =
              Boolean(demo) &&
              demo!.userId !== user?.id &&
              (demo!.status === 'pending' || demo!.status === 'active');

            if (unlocked) {
              return (
                <button
                  key={mod.id}
                  type="button"
                  className="module-tile unlocked"
                  style={{
                    ['--module-accent' as string]: accent,
                    animationDelay: `${0.08 + index * 0.07}s`,
                  }}
                  onClick={() => openModule(mod.id)}
                >
                  <div className="module-accent-bar" />
                  <div className="module-tile-body">
                    <div className="module-tile-top">
                      <span className="module-icon">
                        <Icon size={24} strokeWidth={1.75} />
                      </span>
                      <span className="module-status on">
                        {daysLeft != null
                          ? `Demo · ${daysLeft}d left`
                          : mod.billing === 'included'
                            ? 'Included'
                            : 'Unlocked'}
                      </span>
                    </div>
                    <h2>{mod.name}</h2>
                    <p>{mod.description}</p>
                    <span className="module-cta">
                      Enter module <ArrowRight size={16} />
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <article
                key={mod.id}
                className="module-tile locked"
                style={{
                  ['--module-accent' as string]: accent,
                  animationDelay: `${0.08 + index * 0.07}s`,
                }}
              >
                <div className="module-accent-bar" />
                <div className="module-tile-body">
                  <div className="module-tile-top">
                    <span className="module-icon">
                      <Icon size={24} strokeWidth={1.75} />
                    </span>
                    <span className="module-status off">
                      {isOwnPending ? (
                        <>
                          <Clock size={12} /> Pending
                        </>
                      ) : (
                        <>
                          <Lock size={12} /> Add-on
                        </>
                      )}
                    </span>
                  </div>

                  <h2>{mod.name}</h2>
                  <p>{mod.description}</p>

                  {isOwnPending ? (
                    <div className="module-locked-actions">
                      <p className="module-note">
                        Demo request sent. Waiting for admin approval by email ({DEMO_DAYS}-day trial, one user).
                      </p>
                      {user?.role === 'Owner' && (
                        <Button size="sm" onClick={() => handleApproveDemo(mod.id)}>
                          Simulate admin email approval
                        </Button>
                      )}
                    </div>
                  ) : isOtherDemo ? (
                    <p className="module-note">
                      Demo is already reserved for another user. Only one demo user is allowed — purchase to unlock.
                    </p>
                  ) : (
                    <div className="module-locked-actions">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDemoModuleId(mod.id)}
                      >
                        <PlayCircle size={15} /> Request a demo
                      </Button>
                      <Button size="sm" onClick={() => setPurchaseModuleId(mod.id)}>
                        <ShoppingCart size={15} /> Purchase now
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <Modal
        open={!!demoModuleId}
        onClose={() => setDemoModuleId(null)}
        title="Request a demo"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDemoModuleId(null)}>Cancel</Button>
            <Button onClick={confirmDemoRequest}>Send demo request</Button>
          </>
        }
      >
        <div className="module-modal-copy">
          <p>
            Request a free demo of <strong>{demoModule?.name}</strong>.
          </p>
          <ul>
            <li>Demo lasts <strong>{DEMO_DAYS} days</strong> after admin approval</li>
            <li>Only <strong>one user</strong> can use the demo for this module</li>
            <li>An <strong>admin must accept by email</strong> before access starts</li>
          </ul>
          <p className="module-modal-muted">
            You will be notified by email when your request is approved or declined.
          </p>
        </div>
      </Modal>

      <Modal
        open={!!purchaseModuleId}
        onClose={() => setPurchaseModuleId(null)}
        title="Purchase module"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setPurchaseModuleId(null)}>Cancel</Button>
            <Button onClick={confirmPurchase}>Purchase now</Button>
          </>
        }
      >
        <div className="module-modal-copy">
          <p>
            Purchase <strong>{purchaseModule?.name}</strong> for your FinStock plan.
          </p>
          <p className="module-modal-muted">
            We will email payment and onboarding details to <strong>{user?.email}</strong> so your
            team can unlock this module permanently.
          </p>
        </div>
      </Modal>

      <style>{`
        .modules-page {
          height: 100dvh;
          max-height: 100dvh;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modules-bg {
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(155deg, #0c1929 0%, #123048 42%, #0f766e 120%);
        }
        .modules-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.45;
          animation: modules-drift 14s ease-in-out infinite alternate;
        }
        .modules-orb-a {
          width: min(42vw, 420px); height: min(42vw, 420px);
          top: -12vh; right: -8vw;
          background: #14b8a6;
        }
        .modules-orb-b {
          width: min(36vw, 360px); height: min(36vw, 360px);
          bottom: 4%; left: -10vw;
          background: #1e4976;
          animation-delay: -4s;
        }
        .modules-grid-pattern {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent);
        }

        @keyframes modules-drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(24px, 18px) scale(1.08); }
        }
        @keyframes modules-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modules-top, .modules-main { position: relative; z-index: 1; }

        .modules-top {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(0.55rem, 1.4vh, 1rem) clamp(0.85rem, 2.5vw, 1.75rem);
        }
        .modules-user-chip {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          color: rgba(255,255,255,0.92);
        }
        .modules-avatar {
          width: clamp(32px, 4.5vh, 38px); height: clamp(32px, 4.5vh, 38px);
          border-radius: 10px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.95rem;
        }
        .modules-user-meta {
          display: flex; flex-direction: column; line-height: 1.2;
        }
        .modules-user-meta strong { font-size: 0.88rem; }
        .modules-user-meta span {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.55);
        }
        .modules-logout {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.7rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.75);
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
        }
        .modules-logout:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .modules-main {
          flex: 1;
          min-height: 0;
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          padding: 0 clamp(0.85rem, 2.5vw, 1.5rem) clamp(0.75rem, 2vh, 1.5rem);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(0.65rem, 2vh, 1.35rem);
        }

        .modules-hero {
          flex-shrink: 0;
          text-align: center;
          animation: modules-rise 0.55s ease both;
        }
        .modules-mark {
          width: clamp(40px, 6vh, 52px); height: clamp(40px, 6vh, 52px);
          margin: 0 auto clamp(0.35rem, 1vh, 0.75rem);
          border-radius: 12px;
          background: #0f766e;
          color: white;
          font-family: var(--font-display);
          font-size: clamp(1.2rem, 2.4vh, 1.5rem);
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 28px rgba(15, 118, 110, 0.35);
        }
        .modules-kicker {
          font-size: clamp(0.68rem, 1.3vh, 0.78rem);
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(204, 251, 241, 0.75);
          margin-bottom: 0.25rem;
        }
        .modules-brand-title {
          font-family: var(--font-display);
          font-size: clamp(1.85rem, 5.5vh, 3.2rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: white;
          line-height: 1;
          margin: 0 0 clamp(0.25rem, 0.8vh, 0.55rem);
        }
        .modules-lead {
          max-width: 28rem;
          margin: 0 auto;
          color: rgba(226, 232, 240, 0.78);
          font-size: clamp(0.82rem, 1.7vh, 0.98rem);
          line-height: 1.4;
        }

        .modules-grid {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(2, minmax(0, 1fr));
          gap: clamp(0.55rem, 1.4vh, 0.9rem);
        }

        .module-tile {
          position: relative;
          text-align: left;
          border: none;
          padding: 0;
          overflow: hidden;
          border-radius: clamp(12px, 1.6vh, 16px);
          background: rgba(255,255,255,0.96);
          min-height: 0;
          height: 100%;
          animation: modules-rise 0.55s ease both;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          box-shadow: 0 8px 24px rgba(8, 20, 35, 0.18);
        }
        .module-tile.unlocked {
          cursor: pointer;
        }
        .module-tile.unlocked:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(8, 20, 35, 0.24);
        }
        .module-tile:focus-visible {
          outline: 2px solid #5eead4;
          outline-offset: 3px;
        }
        .module-tile.locked {
          background: rgba(255,255,255,0.9);
          cursor: default;
        }

        .module-accent-bar {
          height: 3px;
          background: var(--module-accent);
          flex-shrink: 0;
        }
        .module-tile.locked .module-accent-bar {
          background: #94a3b8;
        }

        .module-tile-body {
          padding: clamp(0.95rem, 2.2vh, 1.35rem) clamp(1rem, 2vw, 1.4rem);
          display: flex;
          flex-direction: column;
          gap: clamp(0.35rem, 1vh, 0.6rem);
          height: calc(100% - 3px);
          min-height: 0;
        }
        .module-tile-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.15rem;
        }
        .module-icon {
          width: clamp(44px, 6vh, 52px); height: clamp(44px, 6vh, 52px);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: color-mix(in srgb, var(--module-accent) 14%, white);
          color: var(--module-accent);
          transition: transform 0.22s ease;
          flex-shrink: 0;
        }
        .module-icon svg {
          width: clamp(20px, 2.8vh, 24px);
          height: clamp(20px, 2.8vh, 24px);
        }
        .module-tile.unlocked:hover .module-icon {
          transform: scale(1.06);
        }
        .module-tile.locked .module-icon {
          background: #f1f5f9;
          color: #94a3b8;
        }

        .module-status {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 0.28rem 0.55rem;
          border-radius: 6px;
          white-space: nowrap;
        }
        .module-status.on {
          background: #ccfbf1;
          color: #0f766e;
        }
        .module-status.off {
          background: #f1f5f9;
          color: #64748b;
        }

        .module-tile h2 {
          font-family: var(--font-display);
          font-size: clamp(1.2rem, 2.8vh, 1.45rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0f172a;
          margin: 0;
        }
        .module-tile.locked h2 { color: #475569; }

        .module-tile p {
          margin: 0;
          flex: 1;
          min-height: 0;
          font-size: clamp(0.9rem, 1.9vh, 1rem);
          line-height: 1.5;
          color: #64748b;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .module-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: auto;
          padding-top: 0.25rem;
          font-size: clamp(0.88rem, 1.8vh, 0.95rem);
          font-weight: 700;
          color: var(--module-accent);
        }
        .module-tile.unlocked:hover .module-cta {
          gap: 0.5rem;
        }

        .module-locked-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: auto;
          padding-top: 0.2rem;
        }
        .module-locked-actions .btn {
          flex: 1 1 auto;
          min-width: 0;
        }
        .module-note {
          margin: auto 0 0 !important;
          flex: 0 0 auto !important;
          display: block !important;
          -webkit-line-clamp: unset !important;
          overflow: visible !important;
          font-size: 0.78rem !important;
          line-height: 1.4 !important;
          color: #64748b !important;
        }

        .module-modal-copy {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          color: var(--color-text);
          font-size: 0.92rem;
          line-height: 1.55;
        }
        .module-modal-copy ul {
          list-style: disc;
          padding-left: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          color: var(--color-text-secondary);
        }
        .module-modal-muted {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        @media (max-width: 720px) {
          .modules-logout span { display: none; }
          .modules-logout { padding: 0.5rem; }
          .modules-user-meta { display: none; }
          .module-locked-actions { flex-direction: column; }
        }

        @media (max-height: 700px) {
          .modules-kicker { display: none; }
          .modules-lead { display: none; }
          .modules-mark { margin-bottom: 0.35rem; }
        }

        @media (max-height: 560px) {
          .modules-hero { display: none; }
          .modules-main { justify-content: stretch; padding-top: 0.25rem; }
        }

        @supports not (height: 100dvh) {
          .modules-page {
            height: 100vh;
            max-height: 100vh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .modules-orb, .modules-hero, .module-tile {
            animation: none !important;
          }
          .module-tile.unlocked:hover { transform: none; }
        }
      `}</style>
    </div>
  );
}
