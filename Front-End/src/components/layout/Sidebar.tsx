import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import type { NavItem } from '../../types';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  {
    label: 'Sales',
    icon: 'sales',
    children: [
      { label: 'Daily Sales', path: '/sales/daily' },
      { label: 'Sales Import', path: '/sales/import' },
    ],
  },
  {
    label: 'Inventory',
    icon: 'inventory',
    children: [
      { label: 'Products', path: '/products' },
      { label: 'Stock Items', path: '/inventory' },
      { label: 'Stock Movements', path: '/inventory/movements' },
    ],
  },
  {
    label: 'Purchasing',
    icon: 'purchasing',
    children: [
      { label: 'Suppliers', path: '/suppliers' },
      { label: 'Purchase Orders', path: '/purchase-orders' },
      { label: 'Goods Receipt', path: '/goods-receipt' },
      { label: 'Supplier Invoices', path: '/supplier-invoices' },
    ],
  },
  { label: 'Expenses', path: '/expenses', icon: 'expenses' },
  { label: 'Reports', path: '/reports', icon: 'reports' },
  { label: 'HMRC VAT', path: '/hmrc', icon: 'hmrc' },
  {
    label: 'Settings',
    icon: 'settings',
    children: [
      { label: 'Company Profile', path: '/settings/company' },
      { label: 'Users', path: '/settings/users' },
      { label: 'Roles & Permissions', path: '/settings/roles' },
    ],
  },
  { label: 'Audit Logs', path: '/audit', icon: 'audit' },
];

const icons: Record<string, ReactNode> = {
  dashboard: <LayoutDashboard size={18} />,
  sales: <ShoppingCart size={18} />,
  inventory: <Package size={18} />,
  purchasing: <Truck size={18} />,
  expenses: <Receipt size={18} />,
  reports: <BarChart3 size={18} />,
  hmrc: <Landmark size={18} />,
  settings: <Settings size={18} />,
  audit: <ClipboardList size={18} />,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
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
            <div className="brand-tag">Restaurant Finance</div>
          </div>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
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
          background: var(--color-accent);
          color: white; font-weight: 700; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
        }
        .brand-name { color: white; font-weight: 700; font-size: 1.05rem; line-height: 1.2; }
        .brand-tag { font-size: 0.7rem; color: var(--color-sidebar-text); }
        .sidebar-close { display: none; margin-left: auto; color: var(--color-sidebar-text); }
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
        .nav-child.active { color: white; background: var(--color-accent); font-weight: 600; }

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
