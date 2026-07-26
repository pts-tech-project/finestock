import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModules } from '../context/ModuleContext';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Input';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { clearModule } = useModules();
  const navigate = useNavigate();
  const [email, setEmail] = useState('john@restaurant.com');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/modules" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      clearModule();
      navigate('/modules');
    } else {
      setError(result.error ?? 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true">
        <div className="login-orb login-orb-a" />
        <div className="login-orb login-orb-b" />
        <div className="login-orb login-orb-c" />
        <div className="login-grid-pattern" />
      </div>

      <div className="login-shell">
        <aside className="login-hero">
          <div className="login-mark">F</div>
          <p className="login-kicker">Restaurant finance</p>
          <h1 className="login-brand-title">FinStock</h1>
          <p className="login-hero-copy">
            Sales, inventory, purchasing and HMRC — organised in one place for your kitchen.
          </p>
        </aside>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Sign in</h2>
            <p>Enter your account details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <Field label="Email" htmlFor="email" error={error && !email ? error : undefined}>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
                autoComplete="email"
                error={!!error}
              />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                error={!!error}
              />
            </Field>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
              Sign in
            </Button>

            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </form>

          <div className="login-hint">
            <span>Full access — john@restaurant.com / demo</span>
            <span>Finance only — sarah@restaurant.com / demo</span>
          </div>
        </div>
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
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(155deg, #0c1929 0%, #123048 42%, #0f766e 120%);
        }
        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(64px);
          opacity: 0.42;
          animation: login-drift 16s ease-in-out infinite alternate;
        }
        .login-orb-a {
          width: 460px; height: 460px;
          top: -140px; left: -100px;
          background: #14b8a6;
        }
        .login-orb-b {
          width: 380px; height: 380px;
          bottom: -80px; right: -60px;
          background: #1e4976;
          animation-delay: -5s;
        }
        .login-orb-c {
          width: 220px; height: 220px;
          top: 42%; left: 48%;
          background: #5eead4;
          opacity: 0.18;
          animation-delay: -9s;
        }
        .login-grid-pattern {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse 75% 65% at 40% 40%, black, transparent);
        }

        @keyframes login-drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(20px, 16px) scale(1.06); }
        }
        @keyframes login-rise {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes login-mark-in {
          from { opacity: 0; transform: scale(0.82); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        .login-shell {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 920px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 2rem;
          align-items: center;
        }

        .login-hero {
          color: white;
          padding: 0.5rem 0.75rem;
          animation: login-rise 0.6s ease both;
        }
        .login-mark {
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
          animation: login-mark-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .login-kicker {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(204, 251, 241, 0.78);
          margin-bottom: 0.55rem;
        }
        .login-brand-title {
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 5vw, 3.75rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
          margin: 0 0 0.9rem;
        }
        .login-hero-copy {
          max-width: 22rem;
          color: rgba(226, 232, 240, 0.78);
          font-size: 1.05rem;
          line-height: 1.55;
          margin: 0;
        }

        .login-card {
          background: rgba(255,255,255,0.97);
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.35);
          padding: 2rem 1.85rem 1.65rem;
          box-shadow: 0 16px 40px rgba(8, 20, 35, 0.28);
          animation: login-rise 0.65s ease 0.12s both;
        }
        .login-card-header {
          margin-bottom: 1.35rem;
        }
        .login-card-header h2 {
          font-family: var(--font-display);
          font-size: 1.55rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 0.3rem;
          color: #0f172a;
        }
        .login-card-header p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .login-form > * {
          animation: login-rise 0.5s ease both;
        }
        .login-form > *:nth-child(1) { animation-delay: 0.2s; }
        .login-form > *:nth-child(2) { animation-delay: 0.28s; }
        .login-form > *:nth-child(3) { animation-delay: 0.36s; }
        .login-form > *:nth-child(4) { animation-delay: 0.42s; }
        .login-form > *:nth-child(5) { animation-delay: 0.48s; }

        .login-error {
          background: var(--color-danger-bg);
          color: var(--color-danger);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          animation: login-shake 0.4s ease;
        }

        .forgot-link {
          text-align: center;
          color: var(--color-accent);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.35rem;
          transition: color 0.15s ease;
        }
        .forgot-link:hover {
          color: var(--color-accent-hover);
          text-decoration: underline;
        }

        .login-hint {
          margin-top: 1.35rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.72rem;
          color: var(--color-text-muted);
          text-align: center;
          animation: login-rise 0.5s ease 0.55s both;
        }

        @media (max-width: 820px) {
          .login-shell {
            grid-template-columns: 1fr;
            max-width: 420px;
            gap: 1.5rem;
          }
          .login-hero {
            text-align: center;
            padding: 0;
          }
          .login-mark { margin-left: auto; margin-right: auto; }
          .login-hero-copy {
            margin-left: auto;
            margin-right: auto;
            font-size: 0.95rem;
          }
          .login-brand-title { font-size: 2.6rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-orb, .login-hero, .login-card, .login-mark, .login-form > *, .login-hint, .login-error {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
