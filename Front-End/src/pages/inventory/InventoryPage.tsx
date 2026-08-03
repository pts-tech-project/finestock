import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, SearchInput, formatCurrency } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { listStockBalances, type StockBalanceDto } from '../../api/stock';

export function InventoryPage() {
  const [items, setItems] = useState<StockBalanceDto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { void listStockBalances().then(setItems).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load stock')).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => items.filter((item) => `${item.itemCode} ${item.name} ${item.category ?? ''}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const stockStatus = (item: StockBalanceDto) => item.quantity <= 0 ? 'Out of Stock' : item.quantity <= item.reorderLevel ? 'Low Stock' : 'Available';
  const columns: Column<StockBalanceDto>[] = [
    { key: 'itemCode', header: 'Code' }, { key: 'name', header: 'Ingredient' }, { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Quantity', align: 'right' }, { key: 'unit', header: 'Unit' },
    { key: 'averageCost', header: 'Average Cost', align: 'right', render: (row) => formatCurrency(row.averageCost) },
    { key: 'stockValue', header: 'Stock Value', align: 'right', render: (row) => formatCurrency(row.quantity * row.averageCost) },
    { key: 'status', header: 'Status', render: (row) => { const value = stockStatus(row); return <Badge variant={value === 'Available' ? 'success' : value === 'Low Stock' ? 'warning' : 'danger'}>{value}</Badge>; } },
  ];
  return <div className="page"><div className="page-header"><div><h1 className="page-title">Stock Items</h1><p className="page-subtitle">Stock updated by approved goods receipts</p></div></div><Card><div className="toolbar" style={{ marginBottom: '1rem' }}><SearchInput value={search} onChange={setSearch} placeholder="Search ingredients..." /></div>{loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading stock…</p> : error ? <p style={{ color: 'var(--color-danger)' }}>{error}</p> : <DataTable columns={columns} data={filtered} keyField="id" emptyTitle="No ingredient stock" emptyDescription="Approve a goods receipt to add stock." />}</Card></div>;
}
