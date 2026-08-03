import { useState, type FormEvent } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { changePasswordRequest, updateProfileRequest } from '../lib/authApi';

export function ProfilePage() {
  const { toast } = useToast();
  const { user, applySessionUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!profile.name.trim()) next.name = 'Name is required';
    if (!profile.email.trim()) next.email = 'Email is required';
    else if (!profile.email.includes('@')) next.email = 'Enter a valid email';
    setProfileErrors(next);
    if (Object.keys(next).length) return;

    setSavingProfile(true);
    try {
      const res = await updateProfileRequest({
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      applySessionUser(res.data.user, res.data.permissions, res.data.allowed);
      setProfile({ name: res.data.user.name, email: res.data.user.email });
      toast(res.message || 'Profile updated');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update profile';
      if (/email already exists/i.test(message)) {
        setProfileErrors({ email: message });
      } else {
        toast(message, 'error');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!passwords.currentPassword) next.currentPassword = 'Current password is required';
    if (!passwords.newPassword) next.newPassword = 'New password is required';
    else if (passwords.newPassword.length < 8) next.newPassword = 'Must be at least 8 characters';
    if (passwords.newPassword !== passwords.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(next);
    if (Object.keys(next).length) return;

    setSavingPassword(true);
    try {
      const res = await changePasswordRequest({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast(res.message || 'Password changed successfully');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Update your account details and password</p>
        </div>
      </div>

      <div className="profile-page-grid">
        <Card title="Account details">
          <form onSubmit={handleSaveProfile} className="form-grid">
            <Field label="Name" htmlFor="pf-name" error={profileErrors.name}>
              <Input
                id="pf-name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                error={!!profileErrors.name}
              />
            </Field>
            <Field label="Email" htmlFor="pf-email" error={profileErrors.email}>
              <Input
                id="pf-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                error={!!profileErrors.email}
              />
            </Field>
            <Field label="Role" htmlFor="pf-role">
              <Input id="pf-role" value={user?.role ?? ''} disabled />
            </Field>
            <Field label="Status" htmlFor="pf-status">
              <Input id="pf-status" value={user?.status ?? ''} disabled />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Button type="submit" loading={savingProfile}>
                Save profile
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Change password">
          <form onSubmit={handleChangePassword} className="form-stack">
            <Field label="Current password" htmlFor="pw-current" error={passwordErrors.currentPassword}>
              <Input
                id="pw-current"
                type="password"
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                }
                error={!!passwordErrors.currentPassword}
              />
            </Field>
            <Field label="New password" htmlFor="pw-new" error={passwordErrors.newPassword}>
              <Input
                id="pw-new"
                type="password"
                autoComplete="new-password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                error={!!passwordErrors.newPassword}
              />
            </Field>
            <Field
              label="Confirm new password"
              htmlFor="pw-confirm"
              error={passwordErrors.confirmPassword}
            >
              <Input
                id="pw-confirm"
                type="password"
                autoComplete="new-password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                error={!!passwordErrors.confirmPassword}
              />
            </Field>
            <Button type="submit" loading={savingPassword}>
              Change password
            </Button>
          </form>
        </Card>
      </div>

      <style>{`
        .profile-page-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-stack { display: flex; flex-direction: column; gap: 1rem; }
        @media (max-width: 900px) {
          .profile-page-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
