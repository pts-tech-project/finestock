import { useEffect, useState } from 'react';
import { Badge, Card, formatCurrency } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { listStockMovements, type StockMovementDto } from '../../api/stock';

export function StockMovementsPage() {
  const [rows, setRows] = useState<StockMovementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { void listStockMovements().then(setRows).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load movements')).finally(() => setLoading(false)); }, []);
  const columns: Column<StockMovementDto>[] = [
    { key: 'movementDate', header: 'Date', render: (row) => new Date(row.movementDate).toLocaleString('en-GB') },
    { key: 'item', header: 'Ingredient', render: (row) => `${row.item.itemCode} — ${row.item.name}` },
    { key: 'movementType', header: 'Movement', render: () => <Badge variant="success">Purchase Receipt</Badge> },
    { key: 'quantity', header: 'Quantity', render: (row) => <strong style={{ color: 'var(--color-success)' }}>+{row.quantity} {row.item.unit}</strong> },
    { key: 'unitCost', header: 'Unit Cost', align: 'right', render: (row) => formatCurrency(row.unitCost) },
    { key: 'totalCost', header: 'Total Cost', align: 'right', render: (row) => formatCurrency(row.totalCost) },
    { key: 'referenceNumber', header: 'Reference' },
  ];
  return <div className="page"><div className="page-header"><div><h1 className="page-title">Stock Movements</h1><p className="page-subtitle">Audit trail created by approved goods receipts</p></div></div><Card>{loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading movements…</p> : error ? <p style={{ color: 'var(--color-danger)' }}>{error}</p> : <DataTable columns={columns} data={rows} keyField="id" emptyTitle="No stock movements" emptyDescription="Approve a goods receipt to create the first movement." />}</Card></div>;
}
