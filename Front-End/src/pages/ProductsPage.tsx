import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Eye, Pencil, Plus, Power } from 'lucide-react';
import { Badge, Card, Pagination, SearchInput, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { createItem, listItems, updateItem, updateItemStatus, type ItemInput } from '../api/items';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';

type ItemForm = {
  itemCode: string;
  name: string;
  itemType: Product['itemType'];
  category: string;
  unit: string;
  sellingPrice: string;
  costPerUnit: string;
  reorderLevel: string;
  vatRate: string;
  description: string;
  status: Product['status'];
};

const emptyForm: ItemForm = {
  itemCode: '', name: '', itemType: 'MENU_ITEM', category: '', unit: 'PCS',
  sellingPrice: '', costPerUnit: '', reorderLevel: '', vatRate: '20',
  description: '', status: 'Active',
};

function toNullableNumber(value: string) {
  return value === '' ? null : Number(value);
}

export function ProductsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [itemType, setItemType] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [statusItem, setStatusItem] = useState<Product | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pageSize = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await listItems({
        search: debouncedSearch,
        itemType: itemType === 'All' ? '' : itemType,
        status: status === 'All' ? '' : status,
        page,
        pageSize,
      });
      setItems(response.data);
      setTotalPages(response.pagination?.totalPages ?? 1);
      setTotal(response.pagination?.total ?? response.data.length);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, itemType, status, page]);

  useEffect(() => { void loadItems(); }, [loadItems]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item: Product) => {
    setEditing(item);
    setForm({
      itemCode: item.itemCode,
      name: item.name,
      itemType: item.itemType,
      category: item.category ?? '',
      unit: item.unit,
      sellingPrice: item.sellingPrice === null ? '' : String(item.sellingPrice),
      costPerUnit: item.costPerUnit === null ? '' : String(item.costPerUnit),
      reorderLevel: item.reorderLevel === null ? '' : String(item.reorderLevel),
      vatRate: item.vatRate === null ? '0' : String(item.vatRate),
      description: item.description ?? '',
      status: item.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.itemCode.trim()) next.itemCode = 'Item code is required';
    if (!form.name.trim()) next.name = 'Item name is required';
    if (!form.unit.trim()) next.unit = 'Unit is required';
    if (form.itemType === 'MENU_ITEM' && (form.sellingPrice === '' || Number(form.sellingPrice) < 0)) {
      next.sellingPrice = 'Enter a valid selling price';
    }
    if (form.costPerUnit !== '' && Number(form.costPerUnit) < 0) next.costPerUnit = 'Cost cannot be negative';
    if (form.reorderLevel !== '' && Number(form.reorderLevel) < 0) next.reorderLevel = 'Reorder level cannot be negative';
    const vat = Number(form.vatRate);
    if (!Number.isFinite(vat) || vat < 0 || vat > 100) next.vatRate = 'VAT must be between 0 and 100';
    return next;
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload: ItemInput = {
      itemCode: form.itemCode.trim(),
      name: form.name.trim(),
      itemType: form.itemType,
      category: form.category.trim(),
      unit: form.unit.trim(),
      sellingPrice: toNullableNumber(form.sellingPrice),
      costPerUnit: toNullableNumber(form.costPerUnit),
      reorderLevel: toNullableNumber(form.reorderLevel),
      vatRate: toNullableNumber(form.vatRate),
      description: form.description.trim() || null,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateItem(editing.id, payload);
        toast('Item updated');
      } else {
        await createItem(payload);
        toast('Item created');
      }
      setModalOpen(false);
      await loadItems();
    } catch (error) {
      setErrors({ server: error instanceof Error ? error.message : 'Unable to save item' });
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async () => {
    if (!statusItem) return;
    const nextStatus = statusItem.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateItemStatus(statusItem.id, nextStatus);
      toast(`Item ${nextStatus === 'Active' ? 'activated' : 'deactivated'}`);
      setStatusItem(null);
      await loadItems();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to update status', 'error');
    }
  };

  const columns: Column<Product>[] = [
    { key: 'itemCode', header: 'Code', sortable: true },
    { key: 'name', header: 'Item Name', sortable: true },
    { key: 'itemType', header: 'Type', render: (r) => r.itemType === 'MENU_ITEM' ? 'Menu Item' : 'Ingredient' },
    { key: 'category', header: 'Category' },
    { key: 'unit', header: 'Unit' },
    {
      key: 'price', header: 'Price / Cost', align: 'right',
      render: (r) => r.itemType === 'MENU_ITEM'
        ? (r.sellingPrice === null ? '—' : formatCurrency(r.sellingPrice))
        : (r.costPerUnit === null ? '—' : formatCurrency(r.costPerUnit)),
    },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Active' ? 'success' : 'neutral'}>{r.status}</Badge> },
    {
      key: 'actions', header: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="ghost" onClick={() => setViewing(r)} title="View"><Eye size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title="Edit"><Pencil size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={() => setStatusItem(r)} title={r.status === 'Active' ? 'Deactivate' : 'Activate'}><Power size={14} /></Button>
          {r.itemType === 'MENU_ITEM' && <Link to={`/products/${r.id}/recipe`}><Button size="sm" variant="ghost" title="Recipe"><ChefHat size={14} /></Button></Link>}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Items & Products</h1><p className="page-subtitle">Manage menu items and ingredients</p></div>
        <Button onClick={openAdd}><Plus size={16} /> Add Item</Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search code, name or category..." />
          <Select value={itemType} onChange={(e) => { setItemType(e.target.value); setPage(1); }} style={{ width: 170 }}>
            <option value="All">All Types</option><option value="MENU_ITEM">Menu Items</option><option value="INGREDIENT">Ingredients</option>
          </Select>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ width: 150 }}>
            <option value="All">All Statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
          </Select>
        </div>
        {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading items…</p> : loadError ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{loadError}</p><Button variant="outline" onClick={() => void loadItems()}>Try again</Button></div>
        ) : <DataTable columns={columns} data={items} keyField="id" emptyTitle="No items found" emptyDescription="Add your first menu item or ingredient." />}
        {!loading && !loadError && <><p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>{total} item{total === 1 ? '' : 's'}</p><Pagination page={page} totalPages={totalPages} onChange={setPage} /></>}
      </Card>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Item'} size="lg"
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" form="item-form" loading={saving}>Save Item</Button></>}>
        <form id="item-form" onSubmit={handleSave} className="form-grid">
          <Field label="Item Code" htmlFor="itemCode" error={errors.itemCode}><Input id="itemCode" value={form.itemCode} onChange={(e) => setForm({ ...form, itemCode: e.target.value })} error={!!errors.itemCode} placeholder="e.g. MENU-001" /></Field>
          <Field label="Item Name" htmlFor="name" error={errors.name}><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} /></Field>
          <Field label="Item Type" htmlFor="itemType"><Select id="itemType" value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value as Product['itemType'] })}><option value="MENU_ITEM">Menu Item</option><option value="INGREDIENT">Ingredient</option></Select></Field>
          <Field label="Category" htmlFor="category"><Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Food, Meat, Drinks" /></Field>
          <Field label="Unit" htmlFor="unit" error={errors.unit}><Select id="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}><option>PCS</option><option>KG</option><option>G</option><option>L</option><option>ML</option><option>PORTION</option><option>GLASS</option></Select></Field>
          {form.itemType === 'MENU_ITEM' ? <Field label="Selling Price" htmlFor="sellingPrice" error={errors.sellingPrice}><Input id="sellingPrice" type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} error={!!errors.sellingPrice} /></Field> : <Field label="Reorder Level" htmlFor="reorderLevel" error={errors.reorderLevel}><Input id="reorderLevel" type="number" min="0" step="0.001" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} error={!!errors.reorderLevel} /></Field>}
          <Field label="Cost Per Unit" htmlFor="costPerUnit" error={errors.costPerUnit}><Input id="costPerUnit" type="number" min="0" step="0.01" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} error={!!errors.costPerUnit} /></Field>
          <Field label="VAT Rate (%)" htmlFor="vatRate" error={errors.vatRate}><Input id="vatRate" type="number" min="0" max="100" step="0.01" value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: e.target.value })} error={!!errors.vatRate} /></Field>
          <Field label="Status" htmlFor="status"><Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product['status'] })}><option value="Active">Active</option><option value="Inactive">Inactive</option></Select></Field>
          <div style={{ gridColumn: '1 / -1' }}><Field label="Description" htmlFor="description"><Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field></div>
          {errors.server && <p style={{ gridColumn: '1 / -1', color: 'var(--color-danger)' }}>{errors.server}</p>}
        </form>
        <style>{`.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; } @media(max-width:560px){.form-grid{grid-template-columns:1fr;}}`}</style>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Item Details" footer={<Button variant="outline" onClick={() => setViewing(null)}>Close</Button>}>
        {viewing && <div className="details-grid">
          <strong>Code</strong><span>{viewing.itemCode}</span><strong>Name</strong><span>{viewing.name}</span><strong>Type</strong><span>{viewing.itemType === 'MENU_ITEM' ? 'Menu Item' : 'Ingredient'}</span><strong>Category</strong><span>{viewing.category || '—'}</span><strong>Unit</strong><span>{viewing.unit}</span><strong>Selling Price</strong><span>{viewing.sellingPrice === null ? '—' : formatCurrency(viewing.sellingPrice)}</span><strong>Cost Per Unit</strong><span>{viewing.costPerUnit === null ? '—' : formatCurrency(viewing.costPerUnit)}</span><strong>Reorder Level</strong><span>{viewing.reorderLevel ?? '—'}</span><strong>VAT</strong><span>{viewing.vatRate ?? 0}%</span><strong>Status</strong><span>{viewing.status}</span><strong>Description</strong><span>{viewing.description || '—'}</span>
          <style>{`.details-grid{display:grid;grid-template-columns:140px 1fr;gap:.75rem}.details-grid strong{color:var(--color-text-secondary)}`}</style>
        </div>}
      </Modal>

      <ConfirmDialog open={!!statusItem} title={`${statusItem?.status === 'Active' ? 'Deactivate' : 'Activate'} Item`} message={`Are you sure you want to ${statusItem?.status === 'Active' ? 'deactivate' : 'activate'} ${statusItem?.name ?? 'this item'}?`} confirmLabel={statusItem?.status === 'Active' ? 'Deactivate' : 'Activate'} danger={statusItem?.status === 'Active'} onCancel={() => setStatusItem(null)} onConfirm={() => void changeStatus()} />
    </div>
  );
}
