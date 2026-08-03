import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Card, Pagination, SearchInput, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { listItems } from '../api/items';
import { approvePurchaseOrder, createPurchaseOrder, listPurchaseOrders, updatePurchaseOrder, type PurchaseOrderInput } from '../api/purchaseOrders';
import { useToast } from '../context/ToastContext';
import type { Product, PurchaseOrder, PurchaseOrderLine } from '../types';

type DraftLine = { key: string; itemId: string; orderedQuantity: string; unitPrice: string; vatRate: string };
const today = () => new Date().toISOString().slice(0, 10);
const newLine = (): DraftLine => ({ key: crypto.randomUUID(), itemId: '', orderedQuantity: '1', unitPrice: '', vatRate: '20' });

function statusLabel(status: PurchaseOrder['status']) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function PurchaseOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [viewing, setViewing] = useState<PurchaseOrder | null>(null);
  const [approving, setApproving] = useState<PurchaseOrder | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [orderDate, setOrderDate] = useState(today());
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);
  const [formError, setFormError] = useState('');
  const pageSize = 10;

  const loadOrders = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await listPurchaseOrders({ search, status, page, pageSize });
      setOrders(result.data); setTotalPages(result.pagination?.totalPages ?? 1);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load purchase orders'); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { const timer = window.setTimeout(() => void loadOrders(), 300); return () => window.clearTimeout(timer); }, [loadOrders]);
  useEffect(() => {
    void listItems({ status: 'Active', itemType: 'INGREDIENT', page: 1, pageSize: 100 })
      .then((result) => setItems(result.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load items'));
  }, []);

  const calculated = useMemo(() => lines.map((line) => {
    const quantity = Number(line.orderedQuantity) || 0;
    const price = Number(line.unitPrice) || 0;
    const vat = Number(line.vatRate) || 0;
    const subtotal = quantity * price;
    return { ...line, subtotal, vatAmount: subtotal * vat / 100, total: subtotal * (1 + vat / 100) };
  }), [lines]);
  const subtotal = calculated.reduce((sum, line) => sum + line.subtotal, 0);
  const vatTotal = calculated.reduce((sum, line) => sum + line.vatAmount, 0);

  const resetForm = () => {
    setEditing(null); setSupplierName(''); setOrderDate(today()); setDeliveryDate(''); setNotes('');
    setLines([newLine()]); setFormError('');
  };
  const openCreate = () => { resetForm(); setFormOpen(true); };
  const openEdit = (order: PurchaseOrder) => {
    setEditing(order); setSupplierName(order.supplierName); setOrderDate(order.orderDate);
    setDeliveryDate(order.expectedDeliveryDate ?? ''); setNotes(order.notes ?? '');
    setLines(order.lines.map((line) => ({ key: line.id, itemId: line.itemId, orderedQuantity: String(line.orderedQuantity), unitPrice: String(line.unitPrice), vatRate: String(line.vatRate) })));
    setFormError(''); setFormOpen(true);
  };
  const updateLine = (key: string, patch: Partial<DraftLine>) => setLines((current) => current.map((line) => line.key === key ? { ...line, ...patch } : line));

  const save = async (event: FormEvent) => {
    event.preventDefault(); setFormError('');
    if (!supplierName.trim()) return setFormError('Supplier name is required');
    if (!lines.length || lines.some((line) => !line.itemId || Number(line.orderedQuantity) <= 0 || Number(line.unitPrice) < 0 || line.unitPrice === '')) return setFormError('Complete every item, quantity and unit price');
    if (new Set(lines.map((line) => line.itemId)).size !== lines.length) return setFormError('The same item cannot be added twice');
    const payload: PurchaseOrderInput = {
      supplierName: supplierName.trim(), orderDate, expectedDeliveryDate: deliveryDate || null,
      notes: notes.trim() || null,
      lines: lines.map((line) => ({ itemId: line.itemId, orderedQuantity: Number(line.orderedQuantity), unitPrice: Number(line.unitPrice), vatRate: Number(line.vatRate) })),
    };
    setSaving(true);
    try {
      if (editing) { await updatePurchaseOrder(editing.id, payload); toast('Purchase order updated'); }
      else { await createPurchaseOrder(payload); toast('Purchase order saved as draft'); }
      setFormOpen(false); await loadOrders();
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Unable to save purchase order'); }
    finally { setSaving(false); }
  };

  const approve = async () => {
    if (!approving) return;
    try { await approvePurchaseOrder(approving.id); toast(`${approving.poNumber} approved and locked`); setApproving(null); await loadOrders(); }
    catch (err) { toast(err instanceof Error ? err.message : 'Unable to approve', 'error'); }
  };
  const badgeVariant = (value: PurchaseOrder['status']) => value === 'RECEIVED' ? 'success' : value === 'PARTIALLY_RECEIVED' ? 'warning' : value === 'APPROVED' ? 'info' : value === 'CANCELLED' ? 'danger' : 'neutral';
  const columns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', header: 'PO Number' }, { key: 'supplierName', header: 'Supplier' }, { key: 'orderDate', header: 'Order Date' },
    { key: 'totalAmount', header: 'Total', align: 'right', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'receivedAmount', header: 'Received', align: 'right', render: (row) => formatCurrency(row.receivedAmount) },
    { key: 'balanceAmount', header: 'Balance', align: 'right', render: (row) => formatCurrency(row.balanceAmount) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={badgeVariant(row.status)}>{statusLabel(row.status)}</Badge> },
    { key: 'actions', header: 'Approval / Actions', render: (row) => <div style={{ display: 'flex', gap: 4 }}>
      <Button size="sm" variant="ghost" title="View" onClick={() => setViewing(row)}><Eye size={14} /></Button>
      {row.status === 'DRAFT' && <><Button size="sm" variant="ghost" title="Edit" onClick={() => openEdit(row)}><Pencil size={14} /></Button><Button size="sm" variant="ghost" title="Approve" onClick={() => setApproving(row)}><Check size={14} /></Button></>}
    </div> },
  ];

  const lineTable = (orderLines: PurchaseOrderLine[]) => <div className="table-wrap"><table className="data-table"><thead><tr><th>Item</th><th>Ordered</th><th>Received</th><th>Balance Qty</th><th>Unit Price</th><th>Line Total</th><th>Balance Amount</th></tr></thead><tbody>{orderLines.map((line) => <tr key={line.id}><td>{line.itemCode} — {line.itemName}</td><td>{line.orderedQuantity} {line.unit}</td><td>{line.receivedQuantity}</td><td>{line.balanceQuantity}</td><td>{formatCurrency(line.unitPrice)}</td><td>{formatCurrency(line.lineTotal)}</td><td>{formatCurrency(line.balanceAmount)}</td></tr>)}</tbody></table></div>;

  return <div className="page">
    <div className="page-header"><div><h1 className="page-title">Purchase Orders</h1><p className="page-subtitle">Create and approve supplier orders; receive them through Goods Receipt</p></div><Button onClick={openCreate}><Plus size={16} /> Create PO</Button></div>
    <Card><div className="toolbar" style={{ marginBottom: '1rem' }}><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search PO or supplier..." /><Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ width: 190 }}><option value="All">All Statuses</option><option value="DRAFT">Draft</option><option value="APPROVED">Approved</option><option value="PARTIALLY_RECEIVED">Partially Received</option><option value="RECEIVED">Received</option></Select></div>
      {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading purchase orders…</p> : error ? <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger)' }}>{error}</p> : <DataTable columns={columns} data={orders} keyField="id" emptyTitle="No purchase orders" emptyDescription="Create your first purchase order." />}
      {!loading && !error && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </Card>

    <Modal open={formOpen} onClose={() => !saving && setFormOpen(false)} title={editing ? `Edit ${editing.poNumber}` : 'Create Purchase Order'} size="lg" footer={<><Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" form="po-form" loading={saving}>Save Draft</Button></>}>
      <form id="po-form" onSubmit={save}><div className="po-header-grid"><Field label="Supplier Name" htmlFor="supplier"><Input id="supplier" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} /></Field><Field label="Order Date" htmlFor="orderDate"><Input id="orderDate" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} /></Field><Field label="Expected Delivery" htmlFor="delivery"><Input id="delivery" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} /></Field></div>
        <div className="po-lines-title"><strong>Items</strong><Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, newLine()])}><Plus size={14} /> Add Row</Button></div>
        <div className="po-lines">
          <div className="po-line po-line-head" aria-hidden="true"><span>Item</span><span>Quantity</span><span>Unit Price</span><span>VAT</span><span>Line Total</span><span>Remove</span></div>
          {calculated.map((line) => <div key={line.key} className="po-line"><Select aria-label="Item" value={line.itemId} onChange={(e) => updateLine(line.key, { itemId: e.target.value })}><option value="">Select item</option>{items.map((item) => <option key={item.id} value={item.id}>{item.itemCode} — {item.name}</option>)}</Select><Input aria-label="Quantity" type="number" min="0.001" step="0.001" value={line.orderedQuantity} onChange={(e) => updateLine(line.key, { orderedQuantity: e.target.value })} placeholder="Qty" /><Input aria-label="Unit price" type="number" min="0" step="0.0001" value={line.unitPrice} onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })} placeholder="Unit price" /><Select aria-label="VAT rate" value={line.vatRate} onChange={(e) => updateLine(line.key, { vatRate: e.target.value })}><option value="0">0%</option><option value="5">5%</option><option value="20">20%</option></Select><span>{formatCurrency(line.total)}</span><Button type="button" size="sm" variant="ghost" title="Remove line" aria-label="Remove line" onClick={() => setLines((current) => current.filter((value) => value.key !== line.key))}><Trash2 size={14} /></Button></div>)}
        </div>
        <Field label="Notes" htmlFor="notes"><Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        <div className="po-summary"><div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><div><span>VAT</span><strong>{formatCurrency(vatTotal)}</strong></div><div><span>Total</span><strong>{formatCurrency(subtotal + vatTotal)}</strong></div></div>{formError && <p className="form-error">{formError}</p>}
      </form>
    </Modal>

    <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.poNumber ?? 'Purchase Order'} size="lg" footer={<Button variant="outline" onClick={() => setViewing(null)}>Close</Button>}>{viewing && <><div className="po-view-summary"><span><strong>Supplier:</strong> {viewing.supplierName}</span><span><strong>Status:</strong> {statusLabel(viewing.status)}</span><span><strong>Total:</strong> {formatCurrency(viewing.totalAmount)}</span><span><strong>Balance:</strong> {formatCurrency(viewing.balanceAmount)}</span></div>{lineTable(viewing.lines)}{viewing.notes && <p style={{ marginTop: '1rem' }}><strong>Notes:</strong> {viewing.notes}</p>}</>}</Modal>

    <ConfirmDialog open={!!approving} title="Approve Purchase Order" message={`Approve ${approving?.poNumber ?? ''}? After approval, supplier, items, quantities and prices cannot be edited.`} confirmLabel="Approve & Lock" onCancel={() => setApproving(null)} onConfirm={() => void approve()} />
    <style>{`.po-header-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:1rem}.po-lines-title{display:flex;justify-content:space-between;align-items:center;margin:1.25rem 0 .75rem}.po-lines{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem}.po-line{display:grid;grid-template-columns:2fr 85px 110px 80px 95px 58px;gap:.5rem;align-items:center}.po-line>span{text-align:right;font-weight:600;font-size:.85rem}.po-line-head{padding:0 .25rem;color:var(--color-text-secondary);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em}.po-line-head>span{text-align:left}.po-line-head>span:nth-child(5){text-align:right}.po-line-head>span:last-child{text-align:center}.po-summary{margin:1rem 0;display:flex;flex-direction:column;align-items:flex-end;gap:.35rem}.po-summary>div{display:flex;justify-content:space-between;min-width:230px;gap:2rem}.po-view-summary{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem}.receive-list{display:flex;flex-direction:column;gap:1rem}.form-error{color:var(--color-danger);margin-top:.75rem}@media(max-width:700px){.po-header-grid,.po-view-summary{grid-template-columns:1fr}.po-line{grid-template-columns:1fr 1fr}.po-line-head{display:none}}`}</style>
  </div>;
}
