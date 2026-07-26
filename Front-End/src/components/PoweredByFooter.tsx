interface PoweredByFooterProps {
  /** Use on dark branded auth/module screens */
  variant?: 'default' | 'on-dark';
}

export function PoweredByFooter({ variant = 'default' }: PoweredByFooterProps) {
  return (
    <footer className={`pts-footer pts-footer-${variant}`}>
      <div className="pts-footer-inner">
        <span className="pts-powered">Powered by</span>
        <span className="pts-brand">
          <span className="pts-mark">PTS</span>
          <span className="pts-name">Tech</span>
        </span>
        <span className="pts-divider" aria-hidden="true" />
        <span className="pts-tagline">Path to Success</span>
      </div>

      <style>{`
        .pts-footer {
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          padding: 0.85rem 1.25rem;
        }
        .pts-footer-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.45rem 0.65rem;
          font-size: 0.72rem;
          letter-spacing: 0.04em;
        }
        .pts-powered {
          font-weight: 500;
          text-transform: uppercase;
          opacity: 0.7;
        }
        .pts-brand {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 700;
        }
        .pts-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.7rem;
          height: 1.15rem;
          padding: 0 0.3rem;
          border-radius: 4px;
          background: linear-gradient(135deg, var(--color-accent), #0d9488);
          color: #fff;
          font-size: 0.62rem;
          letter-spacing: 0.08em;
        }
        .pts-name {
          font-family: var(--font-display);
          font-size: 0.85rem;
          letter-spacing: -0.01em;
        }
        .pts-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          opacity: 0.45;
          background: currentColor;
        }
        .pts-tagline {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.68rem;
          opacity: 0.8;
        }

        .pts-footer-default {
          border-top: 1px solid var(--color-border);
          background: color-mix(in srgb, var(--color-bg-elevated) 70%, transparent);
          color: var(--color-text-secondary);
        }
        .pts-footer-default .pts-name {
          color: var(--color-text);
        }

        .pts-footer-on-dark {
          color: rgba(226, 232, 240, 0.72);
        }
        .pts-footer-on-dark .pts-name {
          color: rgba(255, 255, 255, 0.92);
        }
        .pts-footer-on-dark .pts-mark {
          box-shadow: 0 4px 12px rgba(15, 118, 110, 0.35);
        }
      `}</style>
    </footer>
  );
}
