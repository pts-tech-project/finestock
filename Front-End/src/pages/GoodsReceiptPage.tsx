import { useCallback, useEffect, useState } from 'react';
import { Check, Eye, Pencil, Plus } from 'lucide-react';
import { Badge, Card, Pagination, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { approveGoodsReceipt, createGoodsReceipt, listEligiblePurchaseOrders, listGoodsReceipts, updateGoodsReceipt, type GoodsReceiptInput } from '../api/goodsReceipts';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import type { GoodsReceipt, PurchaseOrder } from '../types';

const today = () => new Date().toISOString().slice(0, 10);

export function GoodsReceiptPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const canReceiveGoods = hasPermission('Receive Goods');
  const canApproveReceipt = hasPermission('Approve Goods Receipt');
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [eligibleOrders, setEligibleOrders] = useState<PurchaseOrder[]>([]);
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GoodsReceipt | null>(null);
  const [viewing, setViewing] = useState<GoodsReceipt | null>(null);
  const [approving, setApproving] = useState<GoodsReceipt | null>(null);
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [receiptDate, setReceiptDate] = useState(today());
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [receiptResult, poResult] = await Promise.all([listGoodsReceipts(status, page), listEligiblePurchaseOrders()]);
      setReceipts(receiptResult.data); setTotalPages(receiptResult.pagination?.totalPages ?? 1); setEligibleOrders(poResult.data);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load goods receipts'); }
    finally { setLoading(false); }
  }, [status, page]);
  useEffect(() => { void load(); }, [load]);

  const selectedOrder = eligibleOrders.find((order) => order.id === purchaseOrderId);
  const openCreate = () => { setEditing(null); setPurchaseOrderId(''); setReceiptDate(today()); setDeliveryNoteNumber(''); setNotes(''); setQuantities({}); setError(''); setFormOpen(true); };
  const chooseOrder = (id: string) => { setPurchaseOrderId(id); setQuantities({}); };
  const openEdit = (receipt: GoodsReceipt) => {
    setEditing(receipt); setPurchaseOrderId(receipt.purchaseOrderId); setReceiptDate(receipt.receiptDate);
    setDeliveryNoteNumber(receipt.deliveryNoteNumber ?? ''); setNotes(receipt.notes ?? '');
    setQuantities(Object.fromEntries(receipt.lines.map((line) => [line.purchaseOrderLineId, String(line.quantityReceived)])));
    setError(''); setFormOpen(true);
  };
  const save = async () => {
    const lines = Object.entries(quantities).filter(([, value]) => Number(value) > 0).map(([purchaseOrderLineId, value]) => ({ purchaseOrderLineId, quantityReceived: Number(value) }));
    if (!purchaseOrderId) return setError('Select an approved purchase order');
    if (!lines.length) return setError('Enter at least one received quantity');
    setSaving(true); setError('');
    const payload: GoodsReceiptInput = { purchaseOrderId, receiptDate, deliveryNoteNumber: deliveryNoteNumber.trim() || null, notes: notes.trim() || null, lines };
    try {
      if (editing) { await updateGoodsReceipt(editing.id, payload); toast('Goods receipt updated'); }
      else { await createGoodsReceipt(payload); toast('Goods receipt saved as draft'); }
      setFormOpen(false); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save goods receipt'); }
    finally { setSaving(false); }
  };
  const approve = async () => {
    if (!approving) return;
    try { await approveGoodsReceipt(approving.id); toast('Goods receipt approved; stock updated'); setApproving(null); await load(); }
    catch (err) { toast(err instanceof Error ? err.message : 'Unable to approve receipt', 'error'); }
  };

  const columns: Column<GoodsReceipt>[] = [
    { key: 'grnNumber', header: 'GRN Number' },
    { key: 'poNumber', header: 'PO Number', render: (row) => row.purchaseOrder.poNumber },
    { key: 'supplier', header: 'Supplier', render: (row) => row.purchaseOrder.supplierName },
    { key: 'receiptDate', header: 'Receipt Date' },
    { key: 'totalAmount', header: 'Value', align: 'right', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'APPROVED' ? 'success' : 'neutral'}>{row.status === 'APPROVED' ? 'Approved' : 'Draft'}</Badge> },
    { key: 'actions', header: 'Approval / Actions', render: (row) => <div style={{ display: 'flex', gap: 4 }}><Button size="sm" variant="ghost" title="View" onClick={() => setViewing(row)}><Eye size={14} /></Button>{row.status === 'DRAFT' && canReceiveGoods && <Button size="sm" variant="ghost" title="Edit" onClick={() => openEdit(row)}><Pencil size={14} /></Button>}{row.status === 'DRAFT' && canApproveReceipt && <Button size="sm" variant="ghost" title="Approve" onClick={() => setApproving(row)}><Check size={14} /></Button>}</div> },
  ];

  return <div className="page">
    <div className="page-header"><div><h1 className="page-title">Goods Receipts</h1><p className="page-subtitle">Receive approved purchase orders and update ingredient stock</p></div>{canReceiveGoods && <Button onClick={openCreate}><Plus size={16} /> Create Receipt</Button>}</div>
    <Card><div className="toolbar" style={{ marginBottom: '1rem' }}><Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ width: 170 }}><option value="All">All Statuses</option><option value="DRAFT">Draft</option><option value="APPROVED">Approved</option></Select></div>{loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading receipts…</p> : error && !formOpen ? <p style={{ padding: '2rem', color: 'var(--color-danger)', textAlign: 'center' }}>{error}</p> : <DataTable columns={columns} data={receipts} keyField="id" emptyTitle="No goods receipts" emptyDescription="Approve a purchase order, then create its goods receipt." />}<Pagination page={page} totalPages={totalPages} onChange={setPage} /></Card>

    <Modal open={formOpen} onClose={() => !saving && setFormOpen(false)} title={editing ? `Edit ${editing.grnNumber}` : 'Create Goods Receipt'} size="lg" footer={<><Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button><Button onClick={() => void save()} loading={saving}>Save Draft</Button></>}>
      <div className="gr-header"><Field label="Approved Purchase Order"><Select value={purchaseOrderId} onChange={(e) => chooseOrder(e.target.value)} disabled={!!editing}><option value="">Select approved PO</option>{eligibleOrders.map((order) => <option key={order.id} value={order.id}>{order.poNumber} — {order.supplierName}</option>)}</Select></Field><Field label="Receipt Date"><Input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} /></Field><Field label="Delivery Note Number"><Input value={deliveryNoteNumber} onChange={(e) => setDeliveryNoteNumber(e.target.value)} /></Field></div>
      {selectedOrder && <div className="gr-lines"><div className="gr-line gr-head"><span>Ingredient</span><span>PO Balance</span><span>Receive Now</span><span>Unit Cost</span></div>{selectedOrder.lines.filter((line) => line.balanceQuantity > 0 && line.item?.itemType === 'INGREDIENT').map((line) => <div className="gr-line" key={line.id}><span>{line.itemCode} — {line.itemName}</span><span>{line.balanceQuantity} {line.unit}</span><Input aria-label={`Received quantity for ${line.itemName}`} type="number" min="0" max={line.balanceQuantity} step="0.001" value={quantities[line.id] ?? ''} onChange={(e) => setQuantities((current) => ({ ...current, [line.id]: e.target.value }))} /><span>{formatCurrency(line.unitPrice)}</span></div>)}</div>}
      <Field label="Notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>{error && <p className="form-error">{error}</p>}
    </Modal>

    <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.grnNumber ?? 'Goods Receipt'} size="lg" footer={<Button variant="outline" onClick={() => setViewing(null)}>Close</Button>}>{viewing && <><p><strong>PO:</strong> {viewing.purchaseOrder.poNumber} · <strong>Supplier:</strong> {viewing.purchaseOrder.supplierName}</p><div className="table-wrap" style={{ marginTop: '1rem' }}><table className="data-table"><thead><tr><th>Ingredient</th><th>Quantity</th><th>Unit Cost</th><th>Amount</th></tr></thead><tbody>{viewing.lines.map((line) => <tr key={line.id}><td>{line.itemCode} — {line.itemName}</td><td>{line.quantityReceived} {line.unit}</td><td>{formatCurrency(line.unitCost)}</td><td>{formatCurrency(line.lineAmount)}</td></tr>)}</tbody></table></div></>}</Modal>
    <ConfirmDialog open={!!approving} title="Approve Goods Receipt" message={`Approve ${approving?.grnNumber ?? ''}? This will update PO balances and stock, and the receipt cannot be edited afterwards.`} confirmLabel="Approve & Update Stock" onCancel={() => setApproving(null)} onConfirm={() => void approve()} />
    <style>{`.gr-header{display:grid;grid-template-columns:2fr 1fr 1fr;gap:1rem}.gr-lines{display:flex;flex-direction:column;gap:.5rem;margin:1.25rem 0}.gr-line{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:.75rem;align-items:center}.gr-head{font-size:.72rem;text-transform:uppercase;font-weight:700;color:var(--color-text-secondary)}.form-error{color:var(--color-danger);margin-top:.75rem}@media(max-width:650px){.gr-header,.gr-line{grid-template-columns:1fr}.gr-head{display:none}}`}</style>
  </div>;
}
