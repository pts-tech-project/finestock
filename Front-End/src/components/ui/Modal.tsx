import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className={`modal modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: var(--color-overlay);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 1.5rem 1rem;
          animation: modalFadeIn 0.18s ease;
        }
        .modal {
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 48px rgba(8, 20, 35, 0.28);
          width: 100%;
          max-height: calc(100dvh - 3rem);
          margin: auto;
          display: flex;
          flex-direction: column;
          min-height: 0;
          animation: modalRiseIn 0.22s ease;
          border: 1px solid var(--color-border);
        }
        .modal-sm { max-width: 400px; }
        .modal-md { max-width: 560px; }
        .modal-lg { max-width: 780px; }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.15rem 1.35rem;
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }
        .modal-header h2 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.015em;
          color: var(--color-text);
        }
        .modal-close {
          color: var(--color-text-muted);
          display: flex;
          padding: 0.25rem;
          border-radius: 4px;
        }
        .modal-close:hover {
          background: var(--color-bg-muted);
          color: var(--color-text);
        }
        .modal-body {
          padding: 1.35rem;
          overflow-y: auto;
          min-height: 0;
          flex: 1;
          color: var(--color-text);
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.6rem;
          padding: 1rem 1.35rem;
          border-top: 1px solid var(--color-border);
          flex-shrink: 0;
        }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalRiseIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @supports not (height: 100dvh) {
          .modal { max-height: calc(100vh - 3rem); }
        }
      `}</style>
    </div>,
    document.body
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}
