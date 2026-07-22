import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import type { UserRole } from '../types';

const permissions = [
  'View Sales',
  'Manage Inventory',
  'Create Purchase',
  'View Reports',
  'Submit VAT',
];

const defaultPerms: Record<UserRole, Record<string, boolean>> = {
  Owner: {
    'View Sales': true,
    'Manage Inventory': true,
    'Create Purchase': true,
    'View Reports': true,
    'Submit VAT': true,
  },
  Manager: {
    'View Sales': true,
    'Manage Inventory': true,
    'Create Purchase': true,
    'View Reports': true,
    'Submit VAT': false,
  },
  Accountant: {
    'View Sales': true,
    'Manage Inventory': false,
    'Create Purchase': false,
    'View Reports': true,
    'Submit VAT': true,
  },
  Staff: {
    'View Sales': true,
    'Manage Inventory': true,
    'Create Purchase': false,
    'View Reports': false,
    'Submit VAT': false,
  },
};

export function SettingsPage() {
  const { toast } = useToast();
  const [role, setRole] = useState<UserRole>('Manager');
  const [rolePerms, setRolePerms] = useState(defaultPerms);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Roles and system permissions</p>
        </div>
      </div>

      <Card title="Roles & Permissions">
        <div className="toolbar" style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>
            Role
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{ display: 'block', marginTop: '0.35rem', width: 200 }}
            >
              <option>Owner</option>
              <option>Manager</option>
              <option>Accountant</option>
              <option>Staff</option>
            </Select>
          </label>
        </div>

        <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
          Configure permissions for the <strong>{role}</strong> role
        </p>

        <div className="perm-list">
          {permissions.map((p) => (
            <label key={p} className="perm-item">
              <input
                type="checkbox"
                checked={rolePerms[role][p]}
                onChange={(e) =>
                  setRolePerms((prev) => ({
                    ...prev,
                    [role]: { ...prev[role], [p]: e.target.checked },
                  }))
                }
              />
              <span>{p}</span>
            </label>
          ))}
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <Button onClick={() => toast(`${role} permissions updated`)}>Save Permissions</Button>
        </div>
      </Card>

      <style>{`
        .perm-list { display: flex; flex-direction: column; gap: 0.65rem; max-width: 480px; }
        .perm-item {
          display: flex; align-items: center; gap: 0.65rem;
          padding: 0.65rem 0.85rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 500;
        }
        .perm-item:hover { background: var(--color-bg-muted); }
        .perm-item input { width: 16px; height: 16px; accent-color: var(--color-accent); }
      `}</style>
    </div>
  );
}
