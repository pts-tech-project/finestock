import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Pencil, UserX } from 'lucide-react';
import { Card, Badge, SearchInput, Pagination } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { mockUsers } from '../data/mockData';
import type { User, UserRole } from '../types';

const emptyForm = {
  name: '',
  email: '',
  role: 'Staff' as UserRole,
  status: 'Active' as User['status'],
};

export function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      const matchStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
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
    const duplicate = users.some(
      (u) => u.email.toLowerCase() === form.email.toLowerCase() && u.id !== editing?.id
    );
    if (duplicate) next.email = 'A user with this email already exists';
    return next;
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    if (editing) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editing.id
            ? { ...u, name: form.name, email: form.email, role: form.role, status: form.status }
            : u
        )
      );
      toast('User updated');
    } else {
      setUsers((prev) => [
        {
          id: crypto.randomUUID(),
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
        },
        ...prev,
      ]);
      toast('User created');
    }
    setModalOpen(false);
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
          {r.status === 'Active' && (
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
        <Button onClick={openAdd}><Plus size={16} /> Add User</Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search users..."
          />
          <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={{ width: 150 }}>
            <option value="All">All Roles</option>
            <option>Owner</option>
            <option>Manager</option>
            <option>Accountant</option>
            <option>Staff</option>
          </Select>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: 150 }}>
            <option value="All">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
        </div>
        <DataTable
          columns={columns}
          data={pageData}
          keyField="id"
          emptyTitle="No users found"
          emptyDescription="Try adjusting your filters or add a new user."
        />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit User' : 'Add User'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
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
              <option>Owner</option>
              <option>Manager</option>
              <option>Accountant</option>
              <option>Staff</option>
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
        </form>
        <style>{`
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          @media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } }
        `}</style>
      </Modal>

      <ConfirmDialog
        open={!!deactivateId}
        title="Deactivate User"
        message="This user will no longer be able to sign in. You can reactivate them later."
        confirmLabel="Deactivate"
        danger
        onCancel={() => setDeactivateId(null)}
        onConfirm={() => {
          setUsers((prev) =>
            prev.map((u) => (u.id === deactivateId ? { ...u, status: 'Inactive' } : u))
          );
          setDeactivateId(null);
          toast('User deactivated');
        }}
      />
    </div>
  );
}
