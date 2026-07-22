import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Input';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('john@restaurant.com');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.error ?? 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-brand">
          <div className="login-mark">F</div>
          <h1>FinStock</h1>
          <p>Restaurant Finance System</p>
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

          {error && <div className="login-error" role="alert">{error}</div>}

          <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
            Login
          </Button>

          <Link to="/forgot-password" className="forgot-link">
            Forgot Password
          </Link>
        </form>

        <p className="login-hint">Demo: use any email from settings and password “demo”</p>
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
        .login-error {
          background: var(--color-danger-bg);
          color: var(--color-danger);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .forgot-link {
          text-align: center;
          color: var(--color-accent);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.35rem;
        }
        .forgot-link:hover { text-decoration: underline; }
        .login-hint {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
