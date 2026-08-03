import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { KeyRound, Pencil, Plus, UserX } from 'lucide-react';
import { Card, Badge, SearchInput, Pagination, Loading } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { fetchRolesMatrix } from '../lib/rolesApi';
import {
  createUser,
  deactivateUser,
  listUsers,
  resetUserPassword,
  updateUser,
} from '../lib/usersApi';
import type { User, UserRole } from '../types';

const emptyForm = {
  name: '',
  email: '',
  role: 'Staff' as UserRole,
  status: 'Active' as User['status'],
};

export function UsersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([
    'Owner',
    'Manager',
    'Accountant',
    'Staff',
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const pageSize = 6;

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchRolesMatrix();
        const names = data.roles.map((r) => r.name);
        if (names.length) {
          setRoleOptions(names);
          setForm((prev) => ({
            ...prev,
            role: names.includes(prev.role)
              ? prev.role
              : names.includes('Staff')
                ? 'Staff'
                : names[0],
          }));
        }
      } catch {
        // Keep default system roles if roles API fails
      }
    })();
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers({
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load users';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, toast]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadUsers();
    }, search ? 250 : 0);
    return () => window.clearTimeout(t);
  }, [loadUsers, search]);

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = useMemo(
    () => users.slice((safePage - 1) * pageSize, safePage * pageSize),
    [users, safePage],
  );

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      role: roleOptions.includes('Staff') ? 'Staff' : roleOptions[0] || 'Staff',
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!form.email.includes('@')) next.email = 'Enter a valid email';
    return next;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      if (editing) {
        const updated = await updateUser(editing.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          status: form.status,
        });
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast('User updated');
      } else {
        const result = await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          status: form.status,
        });
        setUsers((prev) => [result.user, ...prev]);
        toast(
          result.emailSent
            ? 'User created. Login credentials have been emailed.'
            : 'User created. Email could not be sent — check backend email config.',
        );
      }
      setModalOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save user';
      if (/email already exists/i.test(message)) {
        setErrors({ email: message });
      } else {
        toast(message, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    setSaving(true);
    try {
      const updated = await deactivateUser(deactivateId);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setDeactivateId(null);
      toast('User deactivated');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to deactivate user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetId) return;
    setSaving(true);
    try {
      const result = await resetUserPassword(resetId);
      setResetId(null);
      toast(
        result.emailSent
          ? 'Password reset. New credentials have been emailed.'
          : 'Password reset. Email could not be sent — check backend email config.',
      );
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to reset password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<User>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (r) => <Badge variant="info">{r.role}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Active' ? 'success' : 'neutral'}>{r.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title="Edit">
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setResetId(r.id)} title="Reset password">
            <KeyRound size={14} />
          </Button>
          {r.status === 'Active' && r.id !== currentUser?.id && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeactivateId(r.id)}
              title="Deactivate"
            >
              <UserX size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage staff accounts and access roles</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add User
        </Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search users..."
          />
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: 150 }}
          >
            <option value="All">All Roles</option>
            {roleOptions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: 150 }}
          >
            <option value="All">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
        </div>

        {loading ? (
          <Loading label="Loading users..." />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pageData}
              keyField="id"
              emptyTitle="No users found"
              emptyDescription="Try adjusting your filters or add a new user."
            />
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit User' : 'Add User'}
        footer={
          <>
            <Button variant="outline" disabled={saving} onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave}>
              Save
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="form-grid">
          <Field label="Name" htmlFor="u-name" error={errors.name}>
            <Input
              id="u-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!errors.name}
            />
          </Field>
          <Field label="Email" htmlFor="u-email" error={errors.email}>
            <Input
              id="u-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={!!errors.email}
            />
          </Field>
          <Field label="Role" htmlFor="u-role">
            <Select
              id="u-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            >
              {roleOptions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="u-status">
            <Select
              id="u-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as User['status'] })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </Field>
          {!editing && (
            <p className="text-muted" style={{ gridColumn: '1 / -1', fontSize: '0.85rem', margin: 0 }}>
              A temporary password will be generated and emailed to the user.
            </p>
          )}
        </form>
        <style>{`
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          @media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } }
        `}</style>
      </Modal>

      <ConfirmDialog
        open={!!deactivateId}
        title="Deactivate User"
        message="This user will no longer be able to sign in. You can reactivate them later by editing their status."
        confirmLabel="Deactivate"
        danger
        onCancel={() => setDeactivateId(null)}
        onConfirm={() => {
          void handleDeactivate();
        }}
      />

      <ConfirmDialog
        open={!!resetId}
        title="Reset Password"
        message="A new temporary password will be generated and emailed to this user."
        confirmLabel="Reset password"
        onCancel={() => setResetId(null)}
        onConfirm={() => {
          void handleResetPassword();
        }}
      />
    </div>
  );
}
