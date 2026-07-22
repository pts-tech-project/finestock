import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="topbar-spacer" />
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
        }
        .main-area {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .topbar {
          height: var(--header-height);
          background: var(--color-bg-elevated);
          border-bottom: 1px solid var(--color-border);
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
          border-radius: 6px;
        }
        .menu-btn:hover { background: var(--color-bg-muted); }
        .topbar-spacer { flex: 1; }
        .icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px;
          color: var(--color-text-secondary);
        }
        .icon-btn:hover { background: var(--color-bg-muted); color: var(--color-text); }
        .user-chip {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.25rem 0.5rem 0.25rem 0.25rem;
        }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--color-accent-soft); color: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
        }
        .user-meta { display: flex; flex-direction: column; line-height: 1.2; }
        .user-name { font-size: 0.85rem; font-weight: 600; }
        .user-role { font-size: 0.7rem; color: var(--color-text-muted); }
        .content {
          padding: 1.5rem;
          flex: 1;
        }
        @media (max-width: 900px) {
          .menu-btn { display: flex; }
          .user-meta { display: none; }
          .content { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
