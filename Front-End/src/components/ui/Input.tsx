import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function Field({ label, error, hint, children, htmlFor }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor} className="field-label">{label}</label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
      <style>{`
        .field { display: flex; flex-direction: column; gap: 0.35rem; }
        .field-label { font-size: 0.825rem; font-weight: 600; color: var(--color-text); }
        .field-hint { font-size: 0.75rem; color: var(--color-text-muted); }
        .field-error { font-size: 0.75rem; color: var(--color-danger); }
      `}</style>
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <>
      <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
      <style>{`
        .input {
          width: 100%;
          padding: 0.6rem 0.8rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-bg-elevated);
          color: var(--color-text);
          transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
        }
        .input:hover { border-color: var(--color-border-strong); }
        .input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
          background: #fff;
        }
        .input-error { border-color: var(--color-danger); }
        .input-error:focus { box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12); }
        .input::placeholder { color: var(--color-text-muted); }
      `}</style>
    </>
  );
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <>
      <select className={`input select ${className}`} {...props}>
        {children}
      </select>
      <style>{`
        .select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; padding-right: 2rem; }
      `}</style>
    </>
  );
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <>
      <textarea className={`input textarea ${className}`} {...props} />
      <style>{`
        .textarea { min-height: 90px; resize: vertical; }
      `}</style>
    </>
  );
}
