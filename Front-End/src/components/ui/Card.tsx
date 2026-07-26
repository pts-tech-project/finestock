import type { ReactNode } from 'react';
import { Search, Inbox, Loader2 } from 'lucide-react';
import { Input } from './Input';

export function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}) {
  return (
    <>
      <span className={`badge badge-${variant}`}>{children}</span>
      <style>{`
        .badge {
          display: inline-flex; align-items: center;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .badge-default { background: var(--color-accent-soft); color: var(--color-accent-text); }
        .badge-success { background: var(--color-success-bg); color: var(--color-success); }
        .badge-warning { background: var(--color-warning-bg); color: var(--color-warning); }
        .badge-danger { background: var(--color-danger-bg); color: var(--color-danger); }
        .badge-info { background: var(--color-info-bg); color: var(--color-info); }
        .badge-neutral { background: var(--color-bg-muted); color: var(--color-text-secondary); }
      `}</style>
    </>
  );
}

export function Card({
  children,
  className = '',
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <>
      <div className={`card ${className}`}>
        {(title || action) && (
          <div className="card-header">
            {title && <h3 className="card-title">{title}</h3>}
            {action}
          </div>
        )}
        {children}
      </div>
      <style>{`
        .card {
          background: var(--color-bg-elevated);
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          padding: 1.3rem 1.35rem;
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .card:hover {
          box-shadow: 0 10px 28px rgba(12, 25, 41, 0.09);
        }
        .card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.05rem; gap: 0.75rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--color-border);
        }
        .card-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.015em;
        }
      `}</style>
    </>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change?: string;
  icon?: ReactNode;
}) {
  const positive = change?.startsWith('+');
  return (
    <>
      <div className="stat-card">
        <div className="stat-accent" />
        <div className="stat-top">
          <span className="stat-label">{label}</span>
          {icon && <span className="stat-icon">{icon}</span>}
        </div>
        <div className="stat-value">{value}</div>
        {change && (
          <div className={`stat-change ${positive ? 'up' : 'down'}`}>{change}</div>
        )}
      </div>
      <style>{`
        .stat-card {
          position: relative;
          overflow: hidden;
          background: var(--color-bg-elevated);
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: var(--radius-lg);
          padding: 1.2rem 1.25rem 1.15rem;
          box-shadow: var(--shadow-md);
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(12, 25, 41, 0.1);
        }
        .stat-accent {
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(180deg, var(--color-accent), #14b8a6);
        }
        .stat-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem; }
        .stat-label {
          font-size: 0.72rem; font-weight: 700; color: var(--color-text-secondary);
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .stat-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--color-accent-soft); color: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 1.7rem; font-weight: 700; letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .stat-change { font-size: 0.8rem; margin-top: 0.4rem; font-weight: 600; }
        .stat-change.up { color: var(--color-success); }
        .stat-change.down { color: var(--color-danger); }
      `}</style>
    </>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-wrap">
      <Search size={16} className="search-icon" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      <style>{`
        .search-wrap { position: relative; min-width: 220px; }
        .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
        .search-wrap .search-input { padding-left: 2.2rem; }
      `}</style>
    </div>
  );
}

export function EmptyState({
  title = 'No data found',
  description = 'Try adjusting your filters or add a new record.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Inbox size={28} strokeWidth={1.5} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
      <style>{`
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.45rem; padding: 3rem 1.5rem; text-align: center; color: var(--color-text-muted);
        }
        .empty-icon {
          width: 56px; height: 56px; border-radius: 14px;
          background: var(--color-bg-muted); color: var(--color-text-secondary);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.35rem;
        }
        .empty-state h3 {
          color: var(--color-text); font-family: var(--font-display);
          font-size: 1.1rem; margin-top: 0.15rem;
        }
        .empty-state p { font-size: 0.875rem; max-width: 280px; }
      `}</style>
    </div>
  );
}

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="loading">
      <Loader2 size={28} className="spin" />
      <span>{label}</span>
      <style>{`
        .loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.75rem; padding: 3rem; color: var(--color-text-secondary);
        }
        .spin { animation: spin 0.8s linear infinite; color: var(--color-accent); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
      <style>{`
        .pagination {
          display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem;
          padding-top: 1rem; font-size: 0.85rem; color: var(--color-text-secondary);
        }
        .pagination button {
          padding: 0.4rem 0.85rem; border: 1px solid var(--color-border);
          border-radius: var(--radius-sm); background: var(--color-bg-elevated); font-weight: 600;
          color: var(--color-text);
          transition: background var(--transition), border-color var(--transition);
        }
        .pagination button:hover:not(:disabled) {
          background: var(--color-bg-muted);
          border-color: var(--color-border-strong);
        }
        .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}
