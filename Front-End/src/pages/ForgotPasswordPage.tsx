import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Input';

export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-brand">
          <div className="login-mark">F</div>
          <h1>FinStock</h1>
          <p>Forgot Password</p>
        </div>

        {sent ? (
          <div className="forgot-success">
            <div className="success-icon">
              <MailCheck size={28} />
            </div>
            <h2>Check your email</h2>
            <p>
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <Link to="/login" className="back-login">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <p className="forgot-copy">
              Enter the email associated with your account and we will send you a reset link.
            </p>

            <Field label="Email" htmlFor="forgot-email" error={error || undefined}>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
                autoComplete="email"
                error={!!error}
              />
            </Field>

            <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
              Send Reset Link
            </Button>

            <Link to="/login" className="forgot-link">
              <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Login
            </Link>
          </form>
        )}
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .login-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(15, 118, 110, 0.18), transparent),
            radial-gradient(ellipse 70% 50% at 80% 80%, rgba(12, 25, 41, 0.12), transparent),
            linear-gradient(160deg, #e8eef3 0%, #dce5ec 45%, #eef1f4 100%);
        }
        .login-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--color-border);
          padding: 2.25rem 2rem;
        }
        .login-brand {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .login-mark {
          width: 52px; height: 52px; margin: 0 auto 0.85rem;
          border-radius: 12px;
          background: var(--color-sidebar);
          color: white;
          font-family: var(--font-display);
          font-size: 1.5rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .login-brand h1 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .login-brand p {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
        .login-form { display: flex; flex-direction: column; gap: 1rem; }
        .forgot-copy {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: 0.25rem;
        }
        .forgot-link {
          text-align: center;
          color: var(--color-accent);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.35rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
        .forgot-link:hover { text-decoration: underline; }
        .forgot-success {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .success-icon {
          width: 56px; height: 56px; border-radius: 14px;
          background: var(--color-accent-soft);
          color: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.25rem;
        }
        .forgot-success h2 {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .forgot-success p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.55;
          max-width: 320px;
        }
        .back-login {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.75rem;
          color: var(--color-accent);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .back-login:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
