import { useMemo, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Card, Badge, SearchInput, Pagination, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { mockExpenses } from '../data/mockData';
import type { Expense } from '../types';

export function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState(mockExpenses);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: 'Rent' as Expense['category'],
    description: '',
    amount: '',
    vat: '',
    date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pageSize = 5;

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || e.category === category;
      return matchSearch && matchCat;
    });
  }, [expenses, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setExpenses((prev) => [
      {
        id: crypto.randomUUID(),
        date: form.date ? new Date(form.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        vat: Number(form.vat) || 0,
        status: 'Pending',
      },
      ...prev,
    ]);
    setOpen(false);
    toast('Expense added');
  };

  const columns: Column<Expense>[] = [
    { key: 'date', header: 'Date', sortable: true },
    { key: 'category', header: 'Category' },
    { key: 'description', header: 'Description' },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => formatCurrency(r.amount),
    },
    {
      key: 'vat',
      header: 'VAT',
      align: 'right',
      render: (r) => formatCurrency(r.vat),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Paid' ? 'success' : 'warning'}>{r.status}</Badge>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track operating expenses and receipts</p>
        </div>
        <Button onClick={() => { setErrors({}); setOpen(true); }}>
          <Plus size={16} /> Add Expense
        </Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search expenses..." />
          <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} style={{ width: 160 }}>
            <option value="All">All Categories</option>
            <option>Rent</option>
            <option>Utilities</option>
            <option>Cleaning</option>
            <option>Maintenance</option>
            <option>Other</option>
          </Select>
        </div>
        <DataTable columns={columns} data={pageData} keyField="id" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Expense"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Category" htmlFor="ex-cat">
            <Select id="ex-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Expense['category'] })}>
              <option>Rent</option>
              <option>Utilities</option>
              <option>Cleaning</option>
              <option>Maintenance</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field label="Description" htmlFor="ex-desc" error={errors.description}>
            <Textarea id="ex-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Amount" htmlFor="ex-amt" error={errors.amount}>
              <Input id="ex-amt" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} error={!!errors.amount} />
            </Field>
            <Field label="VAT" htmlFor="ex-vat">
              <Input id="ex-vat" type="number" step="0.01" value={form.vat} onChange={(e) => setForm({ ...form, vat: e.target.value })} />
            </Field>
          </div>
          <Field label="Date" htmlFor="ex-date">
            <Input id="ex-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Receipt Upload" htmlFor="ex-receipt">
            <Input id="ex-receipt" type="file" accept="image/*,.pdf" />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
