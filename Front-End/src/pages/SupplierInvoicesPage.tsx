import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Card, Badge, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { mockSupplierInvoices, mockSuppliers } from '../data/mockData';
import type { SupplierInvoice } from '../types';

export function SupplierInvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState(mockSupplierInvoices);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    invoiceNumber: '',
    supplier: mockSuppliers[0].name,
    date: '',
    amount: '',
    vat: '',
  });

  const statusVariant = (s: SupplierInvoice['status']) => {
    if (s === 'Paid') return 'success' as const;
    if (s === 'Overdue') return 'danger' as const;
    return 'warning' as const;
  };

  const handleUpload = () => {
    if (!form.invoiceNumber || !form.amount) {
      toast('Invoice number and amount are required', 'error');
      return;
    }
    setInvoices((prev) => [
      {
        id: crypto.randomUUID(),
        invoiceNumber: form.invoiceNumber,
        supplier: form.supplier,
        date: form.date || new Date().toLocaleDateString('en-GB'),
        amount: Number(form.amount),
        vat: Number(form.vat) || 0,
        status: 'Pending',
      },
      ...prev,
    ]);
    setOpen(false);
    toast('Invoice uploaded');
  };

  const columns: Column<SupplierInvoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice Number' },
    { key: 'supplier', header: 'Supplier' },
    { key: 'date', header: 'Date' },
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
      render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Invoices</h1>
          <p className="page-subtitle">Track and upload supplier invoices</p>
        </div>
        <Button onClick={() => setOpen(true)}><Upload size={16} /> Upload Invoice</Button>
      </div>

      <Card>
        <DataTable columns={columns} data={invoices} keyField="id" />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upload Invoice"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload}>Upload</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Upload PDF" htmlFor="inv-file">
            <Input id="inv-file" type="file" accept=".pdf" />
          </Field>
          <Field label="Invoice Number" htmlFor="inv-num">
            <Input id="inv-num" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} />
          </Field>
          <Field label="Supplier" htmlFor="inv-sup">
            <Select id="inv-sup" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
              {mockSuppliers.map((s) => <option key={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Invoice Date" htmlFor="inv-date">
            <Input id="inv-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Amount" htmlFor="inv-amt">
              <Input id="inv-amt" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
            <Field label="VAT Amount" htmlFor="inv-vat">
              <Input id="inv-vat" type="number" step="0.01" value={form.vat} onChange={(e) => setForm({ ...form, vat: e.target.value })} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
