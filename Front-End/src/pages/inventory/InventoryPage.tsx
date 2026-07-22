import { useMemo, useState } from 'react';
import { Card, Badge, SearchInput, Pagination, formatCurrency } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Select } from '../../components/ui/Input';
import { mockStockItems } from '../../data/mockData';
import type { StockItem } from '../../types';

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return mockStockItems.filter((i) => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || i.category === category;
      const matchStatus = status === 'All' || i.status === status;
      return matchSearch && matchCat && matchStatus;
    });
  }, [search, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const statusVariant = (s: StockItem['status']) => {
    if (s === 'Available') return 'success' as const;
    if (s === 'Low Stock') return 'warning' as const;
    return 'danger' as const;
  };

  const columns: Column<StockItem>[] = [
    { key: 'name', header: 'Item Name', sortable: true },
    { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Quantity', align: 'right' },
    { key: 'unit', header: 'Unit' },
    {
      key: 'costPerUnit',
      header: 'Cost',
      align: 'right',
      render: (r) => `${formatCurrency(r.costPerUnit)}/${r.unit.toLowerCase()}`,
    },
    {
      key: 'stockValue',
      header: 'Stock Value',
      align: 'right',
      render: (r) => formatCurrency(r.quantity * r.costPerUnit),
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
          <h1 className="page-title">Stock Items</h1>
          <p className="page-subtitle">Current inventory levels and valuation</p>
        </div>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search items..." />
          <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} style={{ width: 160 }}>
            <option value="All">All Categories</option>
            <option>Meat</option>
            <option>Dairy</option>
            <option>Bakery</option>
            <option>Produce</option>
            <option>Dry Goods</option>
          </Select>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ width: 160 }}>
            <option value="All">All Status</option>
            <option>Available</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </Select>
        </div>
        <DataTable columns={columns} data={pageData} keyField="id" emptyTitle="No stock items found" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}
