import { useState } from 'react';
import { Card, Badge } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { mockGoodsReceipts } from '../data/mockData';
import type { GoodsReceipt } from '../types';

export function GoodsReceiptPage() {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState(mockGoodsReceipts);
  const [selected, setSelected] = useState<GoodsReceipt | null>(null);
  const [receivedQty, setReceivedQty] = useState('');
  const [condition, setCondition] = useState('Good');

  const statusVariant = (s: GoodsReceipt['status']) => {
    if (s === 'Complete') return 'success' as const;
    if (s === 'Partial') return 'warning' as const;
    return 'neutral' as const;
  };

  const confirmReceipt = () => {
    if (!selected || !receivedQty) {
      toast('Enter received quantity', 'error');
      return;
    }
    const qty = Number(receivedQty);
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? {
              ...r,
              receivedItems: Math.min(r.expectedItems, r.receivedItems + qty),
              status:
                r.receivedItems + qty >= r.expectedItems
                  ? 'Complete'
                  : 'Partial',
            }
          : r
      )
    );
    setSelected(null);
    setReceivedQty('');
    toast('Goods receipt confirmed');
  };

  const columns: Column<GoodsReceipt>[] = [
    { key: 'poNumber', header: 'PO Number' },
    { key: 'supplier', header: 'Supplier' },
    { key: 'expectedItems', header: 'Expected Items', align: 'right' },
    { key: 'receivedItems', header: 'Received Items', align: 'right' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) =>
        r.status !== 'Complete' ? (
          <Button size="sm" variant="outline" onClick={() => { setSelected(r); setReceivedQty(''); }}>
            Receive
          </Button>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Goods Receipt</h1>
          <p className="page-subtitle">Receive stock against purchase orders</p>
        </div>
      </div>

      <Card>
        <DataTable columns={columns} data={receipts} keyField="id" />
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Receive — ${selected?.poNumber}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={confirmReceipt}>Confirm Receipt</Button>
          </>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p className="text-muted">Supplier: <strong style={{ color: 'var(--color-text)' }}>{selected.supplier}</strong></p>
            <Field label="Product / Items" htmlFor="gr-product">
              <Input id="gr-product" value="PO line items" disabled />
            </Field>
            <Field label="Ordered Quantity" htmlFor="gr-ordered">
              <Input id="gr-ordered" value={String(selected.expectedItems - selected.receivedItems)} disabled />
            </Field>
            <Field label="Received Quantity" htmlFor="gr-recv">
              <Input id="gr-recv" type="number" value={receivedQty} onChange={(e) => setReceivedQty(e.target.value)} />
            </Field>
            <Field label="Condition" htmlFor="gr-cond">
              <Select id="gr-cond" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option>Good</option>
                <option>Damaged</option>
                <option>Partial Damage</option>
              </Select>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
