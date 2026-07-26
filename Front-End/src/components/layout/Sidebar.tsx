import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Receipt,
  BarChart3,
  Landmark,
  Settings,
  ClipboardList,
  ChevronDown,
  X,
  Building2,
  FileText,
  Wallet,
  UsersRound,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { useModules } from '../../context/ModuleContext';
import { APP_MODULES, navForModule } from '../../data/modules';

const icons: Record<string, ReactNode> = {
  dashboard: <LayoutDashboard size={18} />,
  sales: <ShoppingCart size={18} />,
  inventory: <Package size={18} />,
  purchasing: <Truck size={18} />,
  expenses: <Receipt size={18} />,
  reports: <BarChart3 size={18} />,
  hmrc: <Landmark size={18} />,
  corporation: <Building2 size={18} />,
  vat: <FileText size={18} />,
  paye: <Wallet size={18} />,
  payroll: <UsersRound size={18} />,
  ai: <Sparkles size={18} />,
  settings: <Settings size={18} />,
  audit: <ClipboardList size={18} />,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { activeModule } = useModules();
  const moduleMeta = APP_MODULES.find((m) => m.id === activeModule);
  const navItems = activeModule ? navForModule(activeModule) : [];

  const [expanded, setExpanded] = useState<string[]>(() => {
    const openGroups: string[] = [];
    navItems.forEach((item) => {
      if (item.children?.some((c) => location.pathname.startsWith(c.path))) {
        openGroups.push(item.label);
      }
    });
    return openGroups.length ? openGroups : ['Sales', 'Inventory', 'Purchasing', 'Settings'];
  });

  const toggle = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isChildActive = (children?: { path: string }[]) =>
    children?.some((c) => location.pathname === c.path || location.pathname.startsWith(c.path + '/'));

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">F</div>
          <div>
            <div className="brand-name">FinStock</div>
            <div className="brand-tag">{moduleMeta?.name ?? 'Select module'}</div>
          </div>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-switch">
          <Link to="/modules" className="switch-module" onClick={onClose}>
            <ArrowLeftRight size={16} />
            Switch module
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            if (item.children) {
              const isOpen = expanded.includes(item.label);
              const active = isChildActive(item.children);
              return (
                <div key={item.label} className="nav-group">
                  <button
                    type="button"
                    className={`nav-parent ${active ? 'active' : ''}`}
                    onClick={() => toggle(item.label)}
                  >
                    <span className="nav-icon">{icons[item.icon!]}</span>
                    <span className="nav-label">{item.label}</span>
                    <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="nav-children">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) => `nav-child ${isActive ? 'active' : ''}`}
                          onClick={onClose}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path!}
                end={item.path === '/hmrc' || item.path === '/payroll' || item.path === '/ai'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">{icons[item.icon!]}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <style>{`
        .sidebar-backdrop {
          display: none;
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 40;
        }
        .sidebar {
          width: var(--sidebar-width);
          background: var(--color-sidebar);
          color: var(--color-sidebar-text);
          display: flex; flex-direction: column;
          height: 100vh;
          position: sticky; top: 0;
          flex-shrink: 0;
          z-index: 50;
          overflow-y: auto;
        }
        .sidebar-brand {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 1.25rem 1.15rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .brand-mark {
          width: 36px; height: 36px; border-radius: 8px;
          background: linear-gradient(145deg, #14b8a6, #0f766e);
          color: white; font-weight: 700; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          box-shadow: 0 6px 14px rgba(15, 118, 110, 0.35);
        }
        .brand-name { color: white; font-weight: 700; font-size: 1.05rem; line-height: 1.2; }
        .brand-tag { font-size: 0.7rem; color: var(--color-sidebar-text); }
        .sidebar-close { display: none; margin-left: auto; color: var(--color-sidebar-text); }
        .sidebar-switch { padding: 0.75rem 0.65rem 0.15rem; }
        .switch-module {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem; font-weight: 600;
          color: var(--color-sidebar-text);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .switch-module:hover { background: var(--color-sidebar-hover); color: white; }
        .sidebar-nav { padding: 0.85rem 0.65rem; display: flex; flex-direction: column; gap: 0.15rem; }
        .nav-link, .nav-parent {
          display: flex; align-items: center; gap: 0.65rem;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-sm);
          color: var(--color-sidebar-text);
          font-size: 0.9rem; font-weight: 500;
          width: 100%; text-align: left;
          transition: background var(--transition), color var(--transition);
        }
        .nav-link:hover, .nav-parent:hover { background: var(--color-sidebar-hover); color: white; }
        .nav-link.active, .nav-parent.active { background: var(--color-sidebar-active); color: white; }
        .nav-icon { display: flex; opacity: 0.85; }
        .nav-label { flex: 1; }
        .chevron { transition: transform var(--transition); opacity: 0.6; }
        .chevron.open { transform: rotate(180deg); }
        .nav-children { padding: 0.15rem 0 0.35rem 2.4rem; display: flex; flex-direction: column; gap: 0.1rem; }
        .nav-child {
          padding: 0.45rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.825rem;
          color: var(--color-sidebar-text);
        }
        .nav-child:hover { color: white; background: var(--color-sidebar-hover); }
        .nav-child.active { color: white; background: linear-gradient(135deg, #0f766e, #0d9488); font-weight: 600; }

        @media (max-width: 900px) {
          .sidebar-backdrop { display: block; }
          .sidebar {
            position: fixed; left: 0; top: 0;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar-close { display: flex; }
        }
      `}</style>
    </>
  );
}
