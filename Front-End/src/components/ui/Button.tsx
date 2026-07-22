import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {children}
      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          transition: background var(--transition), color var(--transition), border-color var(--transition), opacity var(--transition);
          white-space: nowrap;
        }
        .btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.8rem; }
        .btn-md { padding: 0.55rem 1rem; font-size: 0.9rem; }
        .btn-lg { padding: 0.75rem 1.35rem; font-size: 1rem; }
        .btn-primary { background: var(--color-accent); color: white; }
        .btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }
        .btn-secondary { background: var(--color-sidebar); color: white; }
        .btn-secondary:hover:not(:disabled) { background: #152536; }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--color-border-strong);
          color: var(--color-text);
        }
        .btn-outline:hover:not(:disabled) { background: var(--color-bg-muted); }
        .btn-ghost { background: transparent; color: var(--color-text-secondary); }
        .btn-ghost:hover:not(:disabled) { background: var(--color-bg-muted); color: var(--color-text); }
        .btn-danger { background: var(--color-danger); color: white; }
        .btn-danger:hover:not(:disabled) { background: #b91c1c; }
        .btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}
