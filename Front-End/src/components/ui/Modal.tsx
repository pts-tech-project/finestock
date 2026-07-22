import type { ReactNode } from 'react';
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
  if (!open) return null;

  return (
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
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15, 23, 42, 0.5);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.15s ease;
        }
        .modal {
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-height: 90vh;
          display: flex; flex-direction: column;
          animation: scaleIn 0.2s ease;
        }
        .modal-sm { max-width: 400px; }
        .modal-md { max-width: 560px; }
        .modal-lg { max-width: 780px; }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.15rem 1.35rem;
          border-bottom: 1px solid var(--color-border);
        }
        .modal-header h2 { font-size: 1.1rem; font-weight: 700; }
        .modal-close { color: var(--color-text-muted); display: flex; padding: 0.25rem; border-radius: 4px; }
        .modal-close:hover { background: var(--color-bg-muted); color: var(--color-text); }
        .modal-body { padding: 1.35rem; overflow-y: auto; }
        .modal-footer {
          display: flex; justify-content: flex-end; gap: 0.6rem;
          padding: 1rem 1.35rem;
          border-top: 1px solid var(--color-border);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
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
