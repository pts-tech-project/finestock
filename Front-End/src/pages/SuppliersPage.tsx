import { useMemo, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Card, Badge, SearchInput, Pagination, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { mockSuppliers } from '../data/mockData';
import type { Supplier } from '../types';

const empty = {
  name: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  vatNumber: '',
  paymentTerms: 'Net 30',
};

export function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pageSize = 6;

  const filtered = useMemo(
    () => suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.contact.toLowerCase().includes(search.toLowerCase())),
    [suppliers, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Company name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSuppliers((prev) => [
      {
        id: crypto.randomUUID(),
        name: form.name,
        contact: form.contact,
        email: form.email,
        phone: form.phone,
        vatNumber: form.vatNumber,
        balance: 0,
        status: 'Active',
        address: form.address,
        paymentTerms: form.paymentTerms,
      },
      ...prev,
    ]);
    setOpen(false);
    setForm(empty);
    toast('Supplier added');
  };

  const columns: Column<Supplier>[] = [
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
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage supplier contacts and balances</p>
        </div>
        <Button onClick={() => { setForm(empty); setErrors({}); setOpen(true); }}>
          <Plus size={16} /> Add Supplier
        </Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search suppliers..." />
        </div>
        <DataTable columns={columns} data={pageData} keyField="id" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Supplier"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="form-grid">
          <Field label="Company Name" htmlFor="s-name" error={errors.name}>
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
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Address" htmlFor="s-addr">
              <Textarea id="s-addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
          </div>
        </form>
        <style>{`
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          @media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } }
        `}</style>
      </Modal>
    </div>
  );
}
