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
          padding: 0.15rem 0.55rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .badge-default { background: var(--color-accent-soft); color: var(--color-accent-text); }
        .badge-success { background: var(--color-success-bg); color: var(--color-success); }
        .badge-warning { background: var(--color-warning-bg); color: var(--color-warning); }
        .badge-danger { background: var(--color-danger-bg); color: var(--color-danger); }
        .badge-info { background: var(--color-info-bg); color: var(--color-info); }
        .badge-neutral { background: #f1f5f9; color: #475569; }
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
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          padding: 1.25rem;
        }
        .card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem; gap: 0.75rem;
        }
        .card-title { font-size: 1rem; font-weight: 700; }
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
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1.15rem 1.25rem;
          box-shadow: var(--shadow-sm);
        }
        .stat-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .stat-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
        .stat-icon { color: var(--color-accent); display: flex; }
        .stat-value { font-size: 1.65rem; font-weight: 700; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
        .stat-change { font-size: 0.8rem; margin-top: 0.35rem; font-weight: 500; }
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
        .search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
        .search-wrap .search-input { padding-left: 2.1rem; }
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
      <Inbox size={40} strokeWidth={1.25} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
      <style>{`
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 3rem 1.5rem; text-align: center; color: var(--color-text-muted);
        }
        .empty-state h3 { color: var(--color-text); font-size: 1.05rem; margin-top: 0.5rem; }
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
          padding: 0.35rem 0.75rem; border: 1px solid var(--color-border);
          border-radius: var(--radius-sm); background: white; font-weight: 500;
        }
        .pagination button:hover:not(:disabled) { background: var(--color-bg-muted); }
        .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}
