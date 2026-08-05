import { useCallback, useEffect, useState } from 'react';
import { Check, Download, Eye, FileText, Pencil, Plus } from 'lucide-react';
import { Badge, Card, Pagination, SearchInput, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { approveSupplierInvoice, createSupplierInvoice, listEligibleInvoiceReceipts, listSupplierInvoices, openSupplierInvoiceAttachment, updateSupplierInvoice, type SupplierInvoiceInput } from '../api/supplierInvoices';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { GoodsReceipt, SupplierInvoice } from '../types';

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ goodsReceiptId: '', invoiceNumber: '', invoiceDate: today(), dueDate: '', netAmount: '', vatAmount: '0', notes: '' });

export function SupplierInvoicesPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('Manage Supplier Invoices');
  const canApprove = hasPermission('Approve Supplier Invoices');
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<SupplierInvoice | null>(null);
  const [editing, setEditing] = useState<SupplierInvoice | null>(null);
  const [approving, setApproving] = useState<SupplierInvoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [attachment, setAttachment] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invoiceResult, receiptResult] = await Promise.all([
        listSupplierInvoices({ search, status, page }),
        listEligibleInvoiceReceipts(),
      ]);
      setInvoices(invoiceResult.data);
      setTotalPages(invoiceResult.pagination?.totalPages ?? 1);
      setReceipts(receiptResult.data);
      setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load supplier invoices'); }
    finally { setLoading(false); }
  }, [search, status, page]);
  useEffect(() => { const timer = setTimeout(() => void load(), 250); return () => clearTimeout(timer); }, [load]);

  const editingReceipt: GoodsReceipt | null = editing ? {
    ...editing.goodsReceipt,
    purchaseOrderId: editing.purchaseOrderId,
    purchaseOrder: { ...editing.purchaseOrder, status: 'RECEIVED' },
    deliveryNoteNumber: null,
    notes: null,
    approvedAt: editing.approvedAt,
    lines: [],
  } : null;
  const availableReceipts = editingReceipt && !receipts.some((row) => row.id === editingReceipt.id) ? [editingReceipt, ...receipts] : receipts;
  const selectedReceipt = availableReceipts.find((row) => row.id === form.goodsReceiptId);
  const openCreate = () => { setEditing(null); setForm(emptyForm()); setAttachment(null); setError(''); setOpen(true); };
  const openEdit = (row: SupplierInvoice) => {
    setEditing(row);
    setForm({ goodsReceiptId: row.goodsReceiptId, invoiceNumber: row.invoiceNumber, invoiceDate: row.invoiceDate, dueDate: row.dueDate ?? '', netAmount: String(row.netAmount), vatAmount: String(row.vatAmount), notes: row.notes ?? '' });
    setAttachment(null); setError(''); setOpen(true);
  };
  const selectReceipt = (id: string) => {
    const receipt = availableReceipts.find((row) => row.id === id);
    setForm((current) => ({
      ...current,
      goodsReceiptId: id,
      netAmount: receipt ? String(receipt.invoiceExpected?.netAmount ?? receipt.totalAmount) : current.netAmount,
      vatAmount: receipt ? String(receipt.invoiceExpected?.vatAmount ?? 0) : current.vatAmount,
    }));
  };
  const save = async () => {
    if (!form.goodsReceiptId || !form.invoiceNumber.trim() || Number(form.netAmount) <= 0) return setError('Goods receipt, invoice number and a positive net amount are required');
    const input: SupplierInvoiceInput = { goodsReceiptId: form.goodsReceiptId, invoiceNumber: form.invoiceNumber.trim(), invoiceDate: form.invoiceDate, dueDate: form.dueDate || null, netAmount: Number(form.netAmount), vatAmount: Number(form.vatAmount || 0), notes: form.notes.trim() || null, attachment };
    setSaving(true); setError('');
    try {
      if (editing) { await updateSupplierInvoice(editing.id, input); toast('Supplier invoice updated'); }
      else { await createSupplierInvoice(input); toast('Supplier invoice saved as draft'); }
      setOpen(false); setForm(emptyForm()); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save supplier invoice'); }
    finally { setSaving(false); }
  };
  const openAttachment = async (row: SupplierInvoice, download = false) => {
    try {
      const blob = await openSupplierInvoiceAttachment(row.id, download);
      const url = URL.createObjectURL(blob);
      if (download) { const link = document.createElement('a'); link.href = url; link.download = row.attachmentOriginalName || 'supplier-invoice'; link.click(); }
      else window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) { toast(e instanceof Error ? e.message : 'Unable to open attachment', 'error'); }
  };
  const approve = async () => {
    if (!approving) return;
    try { await approveSupplierInvoice(approving.id); setApproving(null); toast('Supplier invoice approved; balance is now payable'); await load(); }
    catch (e) { toast(e instanceof Error ? e.message : 'Unable to approve invoice', 'error'); }
  };
  const badge = (value: SupplierInvoice['status']) => value === 'PAID' ? 'success' as const : value === 'PARTIALLY_PAID' ? 'warning' as const : value === 'APPROVED' ? 'info' as const : value === 'CANCELLED' ? 'danger' as const : 'neutral' as const;
  const columns: Column<SupplierInvoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice Number' },
    { key: 'supplierName', header: 'Supplier' },
    { key: 'reference', header: 'PO / GRN', render: row => `${row.purchaseOrder.poNumber} / ${row.goodsReceipt.grnNumber}` },
    { key: 'invoiceDate', header: 'Invoice Date' },
    { key: 'totalAmount', header: 'Total', align: 'right', render: row => formatCurrency(row.totalAmount) },
    { key: 'paidAmount', header: 'Paid', align: 'right', render: row => formatCurrency(row.paidAmount) },
    { key: 'balanceAmount', header: 'Balance', align: 'right', render: row => formatCurrency(row.balanceAmount) },
    { key: 'status', header: 'Status', render: row => <Badge variant={badge(row.status)}>{row.status.replaceAll('_', ' ')}</Badge> },
    { key: 'actions', header: 'Approval / Actions', render: row => <div style={{ display: 'flex', gap: 4 }}><Button size="sm" variant="ghost" title="View" onClick={() => setViewing(row)}><Eye size={14} /></Button>{row.attachmentOriginalName && <Button size="sm" variant="ghost" title="Preview attachment" onClick={() => void openAttachment(row)}><FileText size={14} /></Button>}{row.status === 'DRAFT' && canManage && <Button size="sm" variant="ghost" title="Edit" onClick={() => openEdit(row)}><Pencil size={14} /></Button>}{row.status === 'DRAFT' && canApprove && <Button size="sm" variant="ghost" title="Approve" onClick={() => setApproving(row)}><Check size={14} /></Button>}</div> },
  ];

  return <div className="page">
    <div className="page-header"><div><h1 className="page-title">Supplier Invoices</h1><p className="page-subtitle">Match invoices to approved goods receipts and maintain payable balances</p></div>{canManage && <Button onClick={openCreate}><Plus size={16} /> Add Invoice</Button>}</div>
    <Card><div className="toolbar" style={{ marginBottom: '1rem' }}><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search invoice or supplier..." /><Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="All">All Statuses</option><option value="DRAFT">Draft</option><option value="APPROVED">Approved</option><option value="PARTIALLY_PAID">Partially Paid</option><option value="PAID">Paid</option></Select></div>{loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading invoices…</p> : error && !open ? <p style={{ padding: '2rem', color: 'var(--color-danger)', textAlign: 'center' }}>{error}</p> : <DataTable columns={columns} data={invoices} keyField="id" emptyTitle="No supplier invoices" emptyDescription="Approve a goods receipt, then enter its supplier invoice." />}<Pagination page={page} totalPages={totalPages} onChange={setPage} /></Card>
    <Modal open={open} onClose={() => !saving && setOpen(false)} title={editing ? `Edit ${editing.invoiceNumber}` : 'Add Supplier Invoice'} size="lg" footer={<><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button loading={saving} onClick={() => void save()}>Save Draft</Button></>}><div className="invoice-form"><Field label="Approved Goods Receipt"><Select value={form.goodsReceiptId} onChange={e => selectReceipt(e.target.value)} disabled={!!editing}><option value="">Select approved GRN</option>{availableReceipts.map(row => <option key={row.id} value={row.id}>{row.grnNumber} — {row.purchaseOrder.supplierName} ({row.purchaseOrder.poNumber})</option>)}</Select></Field>{selectedReceipt && <div className="invoice-match"><span><strong>Supplier:</strong> {selectedReceipt.purchaseOrder.supplierName}</span><span><strong>PO:</strong> {selectedReceipt.purchaseOrder.poNumber}</span><span><strong>Expected net:</strong> {formatCurrency(selectedReceipt.invoiceExpected?.netAmount ?? selectedReceipt.totalAmount)}</span><span><strong>Expected VAT:</strong> {formatCurrency(selectedReceipt.invoiceExpected?.vatAmount ?? 0)}</span><span><strong>Expected total:</strong> {formatCurrency(selectedReceipt.invoiceExpected?.totalAmount ?? selectedReceipt.totalAmount)}</span></div>}<div className="invoice-grid"><Field label="Supplier Invoice Number"><Input value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} /></Field><Field label="Invoice Date"><Input type="date" value={form.invoiceDate} onChange={e => setForm({ ...form, invoiceDate: e.target.value })} /></Field><Field label="Due Date"><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></Field><Field label="Net Amount"><Input type="number" min="0.01" step="0.01" value={form.netAmount} onChange={e => setForm({ ...form, netAmount: e.target.value })} /></Field><Field label="VAT Amount"><Input type="number" min="0" step="0.01" value={form.vatAmount} onChange={e => setForm({ ...form, vatAmount: e.target.value })} /></Field><Field label="Invoice Total"><Input disabled value={formatCurrency(Number(form.netAmount || 0) + Number(form.vatAmount || 0))} /></Field></div><Field label={editing?.attachmentOriginalName ? 'Replace Attachment (optional)' : 'Invoice Attachment (optional)'}><Input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={e => setAttachment(e.target.files?.[0] ?? null)} />{editing?.attachmentOriginalName && !attachment && <small>Current: {editing.attachmentOriginalName}</small>}<small>PDF, JPG or PNG; maximum 10 MB. Encrypted PDFs are not accepted.</small></Field><Field label="Notes"><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>{error && <p className="form-error">{error}</p>}</div></Modal>
    <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.invoiceNumber ?? 'Supplier Invoice'} footer={<Button variant="outline" onClick={() => setViewing(null)}>Close</Button>}>{viewing && <div className="invoice-summary"><p><strong>Supplier:</strong> {viewing.supplierName}</p><p><strong>PO / GRN:</strong> {viewing.purchaseOrder.poNumber} / {viewing.goodsReceipt.grnNumber}</p><p><strong>Invoice date:</strong> {viewing.invoiceDate}</p><p><strong>Due date:</strong> {viewing.dueDate || 'Not set'}</p><hr /><p><strong>Net:</strong> {formatCurrency(viewing.netAmount)}</p><p><strong>VAT:</strong> {formatCurrency(viewing.vatAmount)}</p><p><strong>Total:</strong> {formatCurrency(viewing.totalAmount)}</p><p><strong>Paid:</strong> {formatCurrency(viewing.paidAmount)}</p><p><strong>Outstanding balance:</strong> {formatCurrency(viewing.balanceAmount)}</p>{viewing.attachmentOriginalName && <div className="attachment-actions"><Button size="sm" variant="outline" onClick={() => void openAttachment(viewing)}><FileText size={14} /> Preview</Button><Button size="sm" variant="outline" onClick={() => void openAttachment(viewing, true)}><Download size={14} /> Download</Button><span>{viewing.attachmentOriginalName}</span></div>}{viewing.notes && <p><strong>Notes:</strong> {viewing.notes}</p>}</div>}</Modal>
    <ConfirmDialog open={!!approving} title="Approve Supplier Invoice" message={`Approve ${approving?.invoiceNumber ?? ''}? The invoice will be locked and its outstanding balance will become payable.`} confirmLabel="Approve & Lock" onCancel={() => setApproving(null)} onConfirm={() => void approve()} />
    <style>{`.invoice-form{display:grid;gap:1rem}.invoice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}.invoice-match{display:flex;gap:1.5rem;padding:.75rem;background:var(--color-bg-secondary);border-radius:.5rem}.invoice-summary{display:grid;gap:.65rem}.attachment-actions{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}.form-error{color:var(--color-danger)}@media(max-width:700px){.invoice-grid{grid-template-columns:1fr}.invoice-match{flex-direction:column;gap:.4rem}}`}</style>
  </div>;
}
