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

  if (isAuthenticated) return <Navigate to="/modules" replace />;

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
    <div className="forgot-page">
      <div className="forgot-bg" aria-hidden="true">
        <div className="forgot-orb forgot-orb-a" />
        <div className="forgot-orb forgot-orb-b" />
        <div className="forgot-grid" />
      </div>

      <div className="forgot-shell">
        <aside className="forgot-hero">
          <div className="forgot-mark">F</div>
          <p className="forgot-kicker">Account recovery</p>
          <h1 className="forgot-brand-title">FinStock</h1>
          <p className="forgot-hero-copy">
            We will email you a secure link so you can set a new password and get back to work.
          </p>
        </aside>

        <div className="forgot-card">
          {sent ? (
            <div className="forgot-success">
              <div className="success-icon">
                <MailCheck size={28} />
              </div>
              <h2>Check your email</h2>
              <p>
                If an account exists for <strong>{email}</strong>, you will receive a password reset
                link shortly.
              </p>
              <Link to="/login" className="back-login">
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="forgot-card-header">
                <h2>Forgot password</h2>
                <p>Enter your email and we will send a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="forgot-form" noValidate>
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
                  Send reset link
                </Button>

                <Link to="/login" className="forgot-link">
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        .forgot-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .forgot-bg {
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(155deg, #0c1929 0%, #123048 42%, #0f766e 120%);
        }
        .forgot-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(64px);
          opacity: 0.42;
          animation: forgot-drift 16s ease-in-out infinite alternate;
        }
        .forgot-orb-a {
          width: 420px; height: 420px;
          top: -120px; left: -80px;
          background: #14b8a6;
        }
        .forgot-orb-b {
          width: 340px; height: 340px;
          bottom: -60px; right: -40px;
          background: #1e4976;
          animation-delay: -5s;
        }
        .forgot-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse 75% 65% at 40% 40%, black, transparent);
        }
        @keyframes forgot-drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(18px, 14px) scale(1.06); }
        }
        @keyframes forgot-rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .forgot-shell {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 920px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 2rem;
          align-items: center;
        }
        .forgot-hero {
          color: white;
          animation: forgot-rise 0.55s ease both;
        }
        .forgot-mark {
          width: 58px; height: 58px;
          border-radius: 14px;
          background: #0f766e;
          color: white;
          font-family: var(--font-display);
          font-size: 1.7rem;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem;
          box-shadow: 0 12px 28px rgba(15, 118, 110, 0.4);
        }
        .forgot-kicker {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(204, 251, 241, 0.78);
          margin-bottom: 0.55rem;
        }
        .forgot-brand-title {
          font-family: var(--font-display);
          font-size: clamp(2.6rem, 5vw, 3.6rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
          margin: 0 0 0.9rem;
        }
        .forgot-hero-copy {
          max-width: 22rem;
          color: rgba(226, 232, 240, 0.78);
          font-size: 1.02rem;
          line-height: 1.55;
          margin: 0;
        }

        .forgot-card {
          background: rgba(255,255,255,0.97);
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.35);
          padding: 2rem 1.85rem 1.65rem;
          box-shadow: 0 16px 40px rgba(8, 20, 35, 0.28);
          animation: forgot-rise 0.6s ease 0.1s both;
        }
        .forgot-card-header { margin-bottom: 1.25rem; }
        .forgot-card-header h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.3rem;
        }
        .forgot-card-header p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }
        .forgot-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
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
          padding: 0.5rem 0;
        }
        .success-icon {
          width: 56px; height: 56px; border-radius: 14px;
          background: var(--color-accent-soft);
          color: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
        }
        .forgot-success h2 {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 700;
          margin: 0;
        }
        .forgot-success p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.55;
          max-width: 320px;
          margin: 0;
        }
        .back-login {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.5rem;
          color: var(--color-accent);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .back-login:hover { text-decoration: underline; }

        @media (max-width: 820px) {
          .forgot-shell {
            grid-template-columns: 1fr;
            max-width: 420px;
            gap: 1.5rem;
          }
          .forgot-hero { text-align: center; }
          .forgot-mark { margin-left: auto; margin-right: auto; }
          .forgot-hero-copy { margin-left: auto; margin-right: auto; }
        }

        @media (prefers-reduced-motion: reduce) {
          .forgot-orb, .forgot-hero, .forgot-card { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
