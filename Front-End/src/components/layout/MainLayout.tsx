import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, LogOut, User, LayoutGrid } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useModules } from '../../context/ModuleContext';
import { APP_MODULES } from '../../data/modules';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { activeModule, clearModule } = useModules();
  const navigate = useNavigate();
  const moduleName = APP_MODULES.find((m) => m.id === activeModule)?.name;

  const handleLogout = () => {
    clearModule();
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <div className="main-atmosphere" aria-hidden="true" />
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          {moduleName && <span className="topbar-module">{moduleName}</span>}
          <div className="topbar-spacer" />
          <Link to="/modules" className="modules-chip" title="Switch module">
            <LayoutGrid size={16} />
            <span>Modules</span>
          </Link>
          <button type="button" className="icon-btn" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <div className="user-chip">
            <div className="user-avatar"><User size={16} /></div>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Logout" title="Logout">
            <LogOut size={18} />
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
          background: var(--color-bg);
        }
        .main-area {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .main-atmosphere {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(ellipse 70% 45% at 100% -10%, rgba(15, 118, 110, 0.12), transparent 55%),
            radial-gradient(ellipse 50% 40% at 0% 100%, rgba(12, 25, 41, 0.06), transparent 50%);
        }
        .topbar {
          height: var(--header-height);
          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.9);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 1.5rem;
          position: sticky;
          top: 0;
          z-index: 30;
        }
        .menu-btn {
          display: none;
          color: var(--color-text);
          padding: 0.35rem;
          border-radius: 8px;
        }
        .menu-btn:hover { background: var(--color-bg-muted); }
        .topbar-module {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-accent-text);
          padding: 0.3rem 0.65rem;
          background: var(--color-accent-soft);
          border-radius: 8px;
          letter-spacing: 0.01em;
        }
        .topbar-spacer { flex: 1; }
        .modules-chip {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.45rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem; font-weight: 700;
          color: var(--color-accent-text);
          background: var(--color-accent-soft);
          transition: transform var(--transition), filter var(--transition);
        }
        .modules-chip:hover { filter: brightness(0.97); transform: translateY(-1px); }
        .icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px;
          color: var(--color-text-secondary);
          transition: background var(--transition), color var(--transition);
        }
        .icon-btn:hover { background: var(--color-bg-muted); color: var(--color-text); }
        .user-chip {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.25rem 0.5rem 0.25rem 0.25rem;
        }
        .user-avatar {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(145deg, #0f766e, #0c1929);
          color: white;
          display: flex; align-items: center; justify-content: center;
        }
        .user-meta { display: flex; flex-direction: column; line-height: 1.2; }
        .user-name { font-size: 0.85rem; font-weight: 700; }
        .user-role { font-size: 0.7rem; color: var(--color-text-muted); }
        .content {
          position: relative;
          z-index: 1;
          padding: 1.5rem 1.65rem 2rem;
          flex: 1;
        }
        @media (max-width: 900px) {
          .menu-btn { display: flex; }
          .user-meta { display: none; }
          .topbar-module { display: none; }
          .modules-chip span { display: none; }
          .content { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
