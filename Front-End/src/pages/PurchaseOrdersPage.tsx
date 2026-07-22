import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Badge, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { mockPurchaseOrders, mockSuppliers, mockProducts } from '../data/mockData';
import type { PurchaseOrder } from '../types';

interface LineItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  vat: number;
}

export function PurchaseOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(mockPurchaseOrders);
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState(mockSuppliers[0].name);
  const [lines, setLines] = useState<LineItem[]>([
    { id: '1', product: mockProducts[0].name, quantity: 10, unitPrice: 5, vat: 20 },
  ]);

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const vatTotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice * (l.vat / 100), 0);
  const total = subtotal + vatTotal;

  const statusVariant = (s: PurchaseOrder['status']) => {
    const map: Record<PurchaseOrder['status'], 'neutral' | 'info' | 'warning' | 'success' | 'danger'> = {
      Draft: 'neutral',
      Sent: 'info',
      Received: 'warning',
      Completed: 'success',
      Cancelled: 'danger',
    };
    return map[s];
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), product: mockProducts[0].name, quantity: 1, unitPrice: 0, vat: 20 },
    ]);
  };

  const updateLine = (id: string, patch: Partial<LineItem>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const save = (status: 'Draft' | 'Sent') => {
    if (!supplier || lines.length === 0) {
      toast('Add at least one product line', 'error');
      return;
    }
    const poNumber = `PO${1000 + orders.length + 1}`;
    setOrders((prev) => [
      {
        id: crypto.randomUUID(),
        poNumber,
        supplier,
        date: new Date().toLocaleDateString('en-GB'),
        amount: total,
        status,
      },
      ...prev,
    ]);
    setOpen(false);
    toast(status === 'Draft' ? 'Purchase order saved as draft' : 'Purchase order sent to supplier');
  };

  const columns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', header: 'PO Number', sortable: true },
    { key: 'supplier', header: 'Supplier' },
    { key: 'date', header: 'Date' },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => formatCurrency(r.amount),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Button size="sm" variant="ghost" onClick={() => toast(`Opened ${r.poNumber}`, 'info')}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">Create and track supplier orders</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> Create PO</Button>
      </div>

      <Card>
        <DataTable columns={columns} data={orders} keyField="id" />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Purchase Order"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => save('Draft')}>Save Draft</Button>
            <Button onClick={() => save('Sent')}>Send Supplier</Button>
          </>
        }
      >
        <Field label="Supplier" htmlFor="po-supplier">
          <Select id="po-supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
            {mockSuppliers.filter((s) => s.status === 'Active').map((s) => (
              <option key={s.id}>{s.name}</option>
            ))}
          </Select>
        </Field>

        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <strong>Products</strong>
            <Button size="sm" variant="outline" onClick={addLine}><Plus size={14} /> Add Row</Button>
          </div>
          <div className="po-lines">
            {lines.map((line) => (
              <div key={line.id} className="po-line">
                <Select value={line.product} onChange={(e) => updateLine(line.id, { product: e.target.value })}>
                  {mockProducts.map((p) => <option key={p.id}>{p.name}</option>)}
                </Select>
                <Input type="number" value={line.quantity} onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) })} placeholder="Qty" />
                <Input type="number" step="0.01" value={line.unitPrice} onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) })} placeholder="Unit Price" />
                <Select value={line.vat} onChange={(e) => updateLine(line.id, { vat: Number(e.target.value) })}>
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={20}>20%</option>
                </Select>
                <span className="line-total">{formatCurrency(line.quantity * line.unitPrice * (1 + line.vat / 100))}</span>
                <Button size="sm" variant="ghost" onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="po-summary">
          <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div><span>VAT</span><strong>{formatCurrency(vatTotal)}</strong></div>
          <div className="po-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
        </div>

        <style>{`
          .po-lines { display: flex; flex-direction: column; gap: 0.5rem; }
          .po-line {
            display: grid;
            grid-template-columns: 2fr 80px 100px 80px 90px 36px;
            gap: 0.5rem;
            align-items: center;
          }
          .line-total { font-size: 0.85rem; font-weight: 600; text-align: right; }
          .po-summary {
            margin-top: 1.25rem; padding-top: 1rem;
            border-top: 1px solid var(--color-border);
            display: flex; flex-direction: column; gap: 0.4rem; align-items: flex-end;
          }
          .po-summary > div { display: flex; gap: 2rem; min-width: 200px; justify-content: space-between; }
          .po-total { font-size: 1.1rem; padding-top: 0.35rem; }
          @media (max-width: 700px) {
            .po-line { grid-template-columns: 1fr 1fr; }
          }
        `}</style>
      </Modal>
    </div>
  );
}
