import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, ChefHat } from 'lucide-react';
import { Card, Badge, SearchInput, Pagination, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { mockProducts } from '../data/mockData';
import type { Product } from '../types';

const emptyForm = {
  name: '',
  category: 'Food',
  sellingPrice: '',
  vatRate: '20',
  cost: '',
  description: '',
  status: 'Active' as Product['status'],
};

export function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState(mockProducts);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      sellingPrice: String(p.sellingPrice),
      vatRate: String(p.vatRate),
      cost: String(p.cost),
      description: p.description ?? '',
      status: p.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) e.sellingPrice = 'Enter a valid price';
    return e;
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                name: form.name,
                category: form.category,
                sellingPrice: Number(form.sellingPrice),
                vatRate: Number(form.vatRate),
                cost: Number(form.cost) || 0,
                description: form.description,
                status: form.status,
              }
            : p
        )
      );
      toast('Product updated');
    } else {
      setProducts((prev) => [
        {
          id: crypto.randomUUID(),
          name: form.name,
          category: form.category,
          sellingPrice: Number(form.sellingPrice),
          vatRate: Number(form.vatRate),
          cost: Number(form.cost) || 0,
          description: form.description,
          status: form.status,
        },
        ...prev,
      ]);
      toast('Product created');
    }
    setModalOpen(false);
  };

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Product Name', sortable: true },
    { key: 'category', header: 'Category' },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      align: 'right',
      render: (r) => formatCurrency(r.sellingPrice),
    },
    {
      key: 'vatRate',
      header: 'VAT Rate',
      render: (r) => `${r.vatRate}%`,
    },
    {
      key: 'cost',
      header: 'Cost',
      align: 'right',
      render: (r) => formatCurrency(r.cost),
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
      render: (r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title="Edit">
            <Pencil size={14} />
          </Button>
          <Link to={`/products/${r.id}/recipe`}>
            <Button size="sm" variant="ghost" title="Recipe">
              <ChefHat size={14} />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage menu products and pricing</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} /> Add Product</Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search product..." />
          <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} style={{ width: 160 }}>
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Drinks">Drinks</option>
            <option value="Dessert">Dessert</option>
          </Select>
        </div>
        <DataTable columns={columns} data={pageData} keyField="id" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="form-grid">
          <Field label="Product Name" htmlFor="name" error={errors.name}>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} />
          </Field>
          <Field label="Category" htmlFor="category">
            <Select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Food</option>
              <option>Drinks</option>
              <option>Dessert</option>
            </Select>
          </Field>
          <Field label="Selling Price" htmlFor="price" error={errors.sellingPrice}>
            <Input id="price" type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} error={!!errors.sellingPrice} />
          </Field>
          <Field label="VAT Rate" htmlFor="vat">
            <Select id="vat" value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: e.target.value })}>
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="20">20%</option>
            </Select>
          </Field>
          <Field label="Cost" htmlFor="cost">
            <Input id="cost" type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product['status'] })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Description" htmlFor="desc">
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
        </form>
        <style>{`
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          @media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } }
        `}</style>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          setProducts((prev) => prev.filter((p) => p.id !== deleteId));
          setDeleteId(null);
          toast('Product deleted');
        }}
      />
    </div>
  );
}
