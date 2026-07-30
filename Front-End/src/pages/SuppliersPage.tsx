import { useEffect, useState, type FormEvent } from 'react';
import { Eye, Pencil, Plus, UserCheck, UserX } from 'lucide-react';
import {
  Card,
  Badge,
  SearchInput,
  Pagination,
  EmptyState,
  Loading,
  formatCurrency,
} from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import {
  createSupplier,
  listSuppliers,
  updateSupplier,
  updateSupplierStatus,
} from '../api/suppliers';
import type { Supplier } from '../types';

const empty = {
  supplierCode: '',
  name: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  vatNumber: '',
  paymentTerms: 'Net 30',
  openingBalance: '0',
};

export function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [statusTarget, setStatusTarget] = useState<Supplier | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const pageSize = 6;

  useEffect(() => {
    let isCurrentRequest = true;

    setLoading(true);
    setLoadError('');

    const timer = window.setTimeout(async () => {
      try {
        const response = await listSuppliers({
          search,
          status: statusFilter,
          page,
          pageSize,
        });

        if (!isCurrentRequest) return;

        setSuppliers(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        if (!isCurrentRequest) return;

        setSuppliers([]);
        setLoadError(error instanceof Error ? error.message : 'Could not load suppliers');
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    }, 300);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timer);
    };
  }, [search, statusFilter, page, reloadKey]);

  const openCreate = () => {
    setEditingSupplier(null);
    setForm(empty);
    setErrors({});
    setSubmitError('');
    setOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({
      supplierCode: supplier.supplierCode,
      name: supplier.name,
      contact: supplier.contact ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
      vatNumber: supplier.vatNumber ?? '',
      paymentTerms: supplier.paymentTerms ?? 'Net 30',
      openingBalance: String(supplier.openingBalance),
    });
    setErrors({});
    setSubmitError('');
    setOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.supplierCode.trim()) errs.supplierCode = 'Supplier code is required';
    if (!form.name.trim()) errs.name = 'Supplier name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!Number.isFinite(Number(form.openingBalance))) {
      errs.openingBalance = 'Opening balance must be a valid number';
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setSubmitError('');

    try {
      const payload = {
        supplierCode: form.supplierCode.trim().toUpperCase(),
        name: form.name.trim(),
        contact: form.contact.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        vatNumber: form.vatNumber.trim(),
        paymentTerms: form.paymentTerms,
        openingBalance: Number(form.openingBalance),
        status: editingSupplier?.status ?? ('Active' as const),
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, payload);
      } else {
        await createSupplier(payload);
      }

      setOpen(false);
      setEditingSupplier(null);
      setForm(empty);
      setPage(1);
      setReloadKey((current) => current + 1);
      toast(editingSupplier ? 'Supplier updated' : 'Supplier added');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not save supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;

    const nextStatus = statusTarget.status === 'Active' ? 'Inactive' : 'Active';
    setChangingStatus(true);

    try {
      await updateSupplierStatus(statusTarget.id, nextStatus);
      setStatusTarget(null);
      setReloadKey((current) => current + 1);
      toast(`Supplier marked as ${nextStatus}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not change supplier status', 'error');
    } finally {
      setChangingStatus(false);
    }
  };

  const columns: Column<Supplier>[] = [
    { key: 'supplierCode', header: 'Code', sortable: true },
    { key: 'name', header: 'Supplier Name', sortable: true },
    { key: 'contact', header: 'Contact' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'vatNumber', header: 'VAT Number' },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      render: (r) => formatCurrency(r.balance),
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
      align: 'right',
      render: (supplier) => (
        <div className="table-actions">
          <Button size="sm" variant="ghost" onClick={() => setViewingSupplier(supplier)}>
            <Eye size={14} /> View
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(supplier)}>
            <Pencil size={14} /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusTarget(supplier)}
          >
            {supplier.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
            {supplier.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage supplier contacts and balances</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Supplier
        </Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search suppliers..." />
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'All' | 'Active' | 'Inactive');
              setPage(1);
            }}
            aria-label="Filter suppliers by status"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
        {loading ? (
          <Loading label="Loading suppliers..." />
        ) : loadError ? (
          <EmptyState
            title="Could not load suppliers"
            description={loadError}
            action={
              <Button variant="outline" onClick={() => setReloadKey((current) => current + 1)}>
                Try again
              </Button>
            }
          />
        ) : suppliers.length === 0 ? (
          <EmptyState
            title="No suppliers found"
            description={
              search || statusFilter !== 'All'
                ? 'Try changing your search or filter.'
                : 'Add your first supplier to get started.'
            }
          />
        ) : (
          <>
            <DataTable columns={columns} data={suppliers} keyField="id" />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editingSupplier ? 'Save Changes' : 'Save'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="form-grid">
          <Field label="Supplier Code" htmlFor="s-code" error={errors.supplierCode}>
            <Input
              id="s-code"
              value={form.supplierCode}
              onChange={(e) => setForm({ ...form, supplierCode: e.target.value.toUpperCase() })}
              placeholder="SUP-001"
              error={!!errors.supplierCode}
            />
          </Field>
          <Field label="Supplier Name" htmlFor="s-name" error={errors.name}>
            <Input id="s-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} />
          </Field>
          <Field label="Contact Person" htmlFor="s-contact">
            <Input id="s-contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </Field>
          <Field label="Email" htmlFor="s-email" error={errors.email}>
            <Input id="s-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={!!errors.email} />
          </Field>
          <Field label="Phone" htmlFor="s-phone">
            <Input id="s-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="VAT Number" htmlFor="s-vat">
            <Input id="s-vat" value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} />
          </Field>
          <Field label="Payment Terms" htmlFor="s-terms">
            <Select id="s-terms" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}>
              <option>Net 7</option>
              <option>Net 14</option>
              <option>Net 30</option>
              <option>Net 60</option>
            </Select>
          </Field>
          <Field label="Opening Balance" htmlFor="s-balance" error={errors.openingBalance}>
            <Input
              id="s-balance"
              type="number"
              step="0.01"
              value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
              error={!!errors.openingBalance}
            />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Address" htmlFor="s-addr">
              <Textarea id="s-addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
          </div>
          {submitError && (
            <div className="supplier-form-error" role="alert">
              {submitError}
            </div>
          )}
        </form>
        <style>{`
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .supplier-form-error {
            grid-column: 1 / -1;
            padding: 0.75rem;
            border-radius: var(--radius-sm);
            background: var(--color-danger-bg);
            color: var(--color-danger);
            font-size: 0.875rem;
          }
          .table-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.25rem;
          }
          @media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } }
        `}</style>
      </Modal>

      <Modal
        open={!!viewingSupplier}
        onClose={() => setViewingSupplier(null)}
        title="Supplier Details"
        footer={
          <>
            <Button variant="outline" onClick={() => setViewingSupplier(null)}>Close</Button>
            <Button
              onClick={() => {
                if (!viewingSupplier) return;
                const supplier = viewingSupplier;
                setViewingSupplier(null);
                openEdit(supplier);
              }}
            >
              <Pencil size={14} /> Edit
            </Button>
          </>
        }
      >
        {viewingSupplier && (
          <dl className="supplier-details">
            <div><dt>Code</dt><dd>{viewingSupplier.supplierCode}</dd></div>
            <div><dt>Name</dt><dd>{viewingSupplier.name}</dd></div>
            <div><dt>Contact</dt><dd>{viewingSupplier.contact || '—'}</dd></div>
            <div><dt>Email</dt><dd>{viewingSupplier.email || '—'}</dd></div>
            <div><dt>Phone</dt><dd>{viewingSupplier.phone || '—'}</dd></div>
            <div><dt>VAT Number</dt><dd>{viewingSupplier.vatNumber || '—'}</dd></div>
            <div><dt>Payment Terms</dt><dd>{viewingSupplier.paymentTerms || '—'}</dd></div>
            <div><dt>Opening Balance</dt><dd>{formatCurrency(viewingSupplier.openingBalance)}</dd></div>
            <div><dt>Status</dt><dd>{viewingSupplier.status}</dd></div>
            <div className="supplier-details-wide">
              <dt>Address</dt><dd>{viewingSupplier.address || '—'}</dd>
            </div>
          </dl>
        )}
        <style>{`
          .supplier-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem 1.5rem;
          }
          .supplier-details div { display: flex; flex-direction: column; gap: 0.25rem; }
          .supplier-details dt {
            color: var(--color-text-muted);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
          }
          .supplier-details dd { color: var(--color-text); }
          .supplier-details-wide { grid-column: 1 / -1; }
          @media (max-width: 560px) {
            .supplier-details { grid-template-columns: 1fr; }
            .supplier-details-wide { grid-column: auto; }
          }
        `}</style>
      </Modal>

      <ConfirmDialog
        open={!!statusTarget}
        title={statusTarget?.status === 'Active' ? 'Deactivate Supplier' : 'Activate Supplier'}
        message={
          statusTarget?.status === 'Active'
            ? `Deactivate ${statusTarget?.name}? Existing records will remain available.`
            : `Reactivate ${statusTarget?.name}?`
        }
        confirmLabel={
          changingStatus
            ? 'Saving...'
            : statusTarget?.status === 'Active'
              ? 'Deactivate'
              : 'Activate'
        }
        danger={statusTarget?.status === 'Active'}
        onConfirm={() => {
          if (!changingStatus) void handleStatusChange();
        }}
        onCancel={() => {
          if (!changingStatus) setStatusTarget(null);
        }}
      />
    </div>
  );
}
