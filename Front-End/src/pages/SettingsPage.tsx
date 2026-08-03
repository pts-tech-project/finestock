import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Loading } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import {
  createRole,
  deleteRole,
  fetchRolesMatrix,
  updateRolePermissions,
  type PermissionMap,
  type RoleRecord,
} from '../lib/rolesApi';
import type { UserRole } from '../types';

function emptyPerms(keys: string[]): PermissionMap {
  return Object.fromEntries(keys.map((k) => [k, false]));
}

export function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'Owner';

  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<UserRole>('Manager');
  const [rolePerms, setRolePerms] = useState<Record<string, PermissionMap>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<PermissionMap>({});
  const [creating, setCreating] = useState(false);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  const selectedMeta = useMemo(
    () => roles.find((r) => r.name === role),
    [roles, role],
  );

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRolesMatrix();
      setPermissions(data.permissions);
      setRoles(data.roles);
      setRolePerms(data.matrix);
      setDirty(false);
      setRole((current) =>
        data.roles.some((r) => r.name === current) ? current : data.roles[0]?.name || 'Staff',
      );
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to load roles', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const openCreate = () => {
    setNewRoleName('');
    setNewRolePerms(emptyPerms(permissions));
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!canEdit) return;
    const name = newRoleName.trim();
    if (!name) {
      toast('Role name is required', 'error');
      return;
    }
    setCreating(true);
    try {
      const created = await createRole(name, newRolePerms);
      toast(`Role "${created.name}" created`);
      setCreateOpen(false);
      await loadRoles();
      setRole(created.name);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to create role', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast('Only Owners can update role permissions', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateRolePermissions(role, rolePerms[role] || {});
      setRolePerms((prev) => ({
        ...prev,
        [role]: { ...updated.permissions },
      }));
      setDirty(false);
      toast(`${role} permissions updated`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to save permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteName) return;
    setSaving(true);
    try {
      await deleteRole(deleteName);
      toast(`Role "${deleteName}" deleted`);
      setDeleteName(null);
      await loadRoles();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to delete role', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Roles & Permissions</h1>
          <p className="page-subtitle">Create roles and control what each one can do</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" onClick={() => void loadRoles()} disabled={loading || saving}>
            Refresh
          </Button>
          {canEdit && (
            <Button onClick={openCreate} disabled={loading}>
              <Plus size={16} /> Create Role
            </Button>
          )}
        </div>
      </div>

      <Card title="Roles & Permissions">
        {loading ? (
          <Loading label="Loading permissions..." />
        ) : (
          <>
            <div className="toolbar" style={{ marginBottom: '1.25rem', gap: '0.75rem', alignItems: 'flex-end' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                Role
                <Select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setDirty(false);
                  }}
                  style={{ display: 'block', marginTop: '0.35rem', width: 220 }}
                >
                  {roles.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                      {r.isSystem ? ' (system)' : ''}
                    </option>
                  ))}
                </Select>
              </label>
              {canEdit && selectedMeta && !selectedMeta.isSystem && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteName(role)}
                  title="Delete role"
                >
                  <Trash2 size={14} /> Delete role
                </Button>
              )}
            </div>

            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              Configure permissions for the <strong>{role}</strong> role
              {!canEdit && (
                <>
                  {' '}
                  — <em>view only (Owner required to save)</em>
                </>
              )}
            </p>

            <div className="perm-list">
              {permissions.map((p) => (
                <label key={p} className={`perm-item ${!canEdit ? 'disabled' : ''}`}>
                  <input
                    type="checkbox"
                    checked={Boolean(rolePerms[role]?.[p])}
                    disabled={!canEdit || saving}
                    onChange={(e) => {
                      setRolePerms((prev) => ({
                        ...prev,
                        [role]: { ...(prev[role] || {}), [p]: e.target.checked },
                      }));
                      setDirty(true);
                    }}
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Button onClick={() => void handleSave()} loading={saving} disabled={!canEdit || !dirty}>
                Save Permissions
              </Button>
              {dirty && canEdit && (
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Unsaved changes
                </span>
              )}
            </div>
          </>
        )}
      </Card>

      <Modal
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        title="Create Role"
        footer={
          <>
            <Button variant="outline" disabled={creating} onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button loading={creating} onClick={() => void handleCreate()}>
              Create
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Field label="Role name" htmlFor="new-role-name">
            <Input
              id="new-role-name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Supervisor"
            />
          </Field>
          <div>
            <p style={{ fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.65rem' }}>
              Starting permissions
            </p>
            <div className="perm-list">
              {permissions.map((p) => (
                <label key={p} className="perm-item">
                  <input
                    type="checkbox"
                    checked={Boolean(newRolePerms[p])}
                    onChange={(e) =>
                      setNewRolePerms((prev) => ({ ...prev, [p]: e.target.checked }))
                    }
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteName}
        title="Delete Role"
        message={`Delete "${deleteName}"? Users must be reassigned first. System roles cannot be deleted.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteName(null)}
        onConfirm={() => {
          void handleDelete();
        }}
      />

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
        .perm-item:hover:not(.disabled) { background: var(--color-bg-muted); }
        .perm-item.disabled { opacity: 0.75; cursor: default; }
        .perm-item input { width: 16px; height: 16px; accent-color: var(--color-accent); }
      `}</style>
    </div>
  );
}
