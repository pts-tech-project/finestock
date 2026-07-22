import { Card, Badge } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { mockStockMovements } from '../../data/mockData';
import type { StockMovement } from '../../types';

export function StockMovementsPage() {
  const typeVariant = (t: StockMovement['type']) => {
    if (t === 'Purchase') return 'success' as const;
    if (t === 'Sale Usage') return 'info' as const;
    if (t === 'Waste') return 'danger' as const;
    return 'warning' as const;
  };

  const columns: Column<StockMovement>[] = [
    { key: 'date', header: 'Date', sortable: true },
    { key: 'item', header: 'Item' },
    {
      key: 'type',
      header: 'Movement Type',
      render: (r) => <Badge variant={typeVariant(r.type)}>{r.type}</Badge>,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (r) => (
        <span style={{ color: r.quantity.startsWith('+') ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
          {r.quantity}
        </span>
      ),
    },
    { key: 'reference', header: 'Reference' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Movements</h1>
          <p className="page-subtitle">Purchase, usage, adjustments and waste</p>
        </div>
      </div>
      <Card>
        <DataTable columns={columns} data={mockStockMovements} keyField="id" />
      </Card>
    </div>
  );
}
