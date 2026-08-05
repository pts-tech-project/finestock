import { useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { PoweredByFooter } from '../components/PoweredByFooter';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Input';
import { ApiError } from '../lib/api';
import { resetPasswordRequest } from '../lib/authApi';

export function ResetPasswordPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token')?.trim() || '', [params]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (isAuthenticated) return <Navigate to="/modules" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing a token. Request a new one.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordRequest({ token, newPassword });
      setDone(true);
      window.setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-theme">
        <ThemeToggle />
      </div>

      <div className="reset-card">
        {done ? (
          <div className="reset-success">
            <h2>Password updated</h2>
            <p>You can now sign in with your new password.</p>
            <Link to="/login" className="back-login">
              <ArrowLeft size={16} /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="reset-header">
              <h2>Choose a new password</h2>
              <p>Enter a new password for your FinStock account</p>
            </div>

            {!token && (
              <div className="reset-error" role="alert">
                This page needs a valid reset link from your email.
              </div>
            )}

            <form onSubmit={handleSubmit} className="reset-form" noValidate>
              <Field label="New password" htmlFor="rp-new">
                <Input
                  id="rp-new"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!token}
                />
              </Field>
              <Field label="Confirm password" htmlFor="rp-confirm">
                <Input
                  id="rp-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token}
                />
              </Field>

              {error && (
                <div className="reset-error" role="alert">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" loading={loading} disabled={!token} style={{ width: '100%' }}>
                Update password
              </Button>

              <Link to="/forgot-password" className="back-login">
                Request a new reset link
              </Link>
            </form>
          </>
        )}
      </div>

      <PoweredByFooter variant="on-dark" />

      <style>{`
        .reset-page {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 1.5rem; position: relative;
          background: linear-gradient(155deg, #0c1929 0%, #123048 42%, #0f766e 120%);
        }
        .reset-theme { position: absolute; top: 1.15rem; right: 1.15rem; }
        .reset-card {
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.97);
          border-radius: 18px; padding: 2rem 1.85rem 1.65rem;
          box-shadow: 0 16px 40px rgba(8, 20, 35, 0.28);
        }
        .reset-header h2 {
          margin: 0 0 0.3rem; font-family: var(--font-display);
          font-size: 1.45rem; font-weight: 700; color: #0f172a;
        }
        .reset-header p { margin: 0 0 1.25rem; color: #64748b; font-size: 0.9rem; }
        .reset-form { display: flex; flex-direction: column; gap: 1rem; }
        .reset-error {
          background: var(--color-danger-bg); color: var(--color-danger);
          padding: 0.65rem 0.85rem; border-radius: var(--radius-sm);
          font-size: 0.85rem; font-weight: 500;
        }
        .reset-success { text-align: center; }
        .reset-success h2 { margin: 0 0 0.5rem; font-family: var(--font-display); }
        .reset-success p { color: #64748b; margin-bottom: 1rem; }
        .back-login {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;
          color: var(--color-accent); font-weight: 600; font-size: 0.875rem;
        }
        .reset-page .pts-footer { width: 100%; margin-top: auto; }
      `}</style>
    </div>
  );
}
