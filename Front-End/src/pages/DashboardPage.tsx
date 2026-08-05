import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { PoundSterling, TrendingUp, Package, Landmark } from 'lucide-react';
import { Card, StatCard, Badge, formatCurrency } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import {
  salesChartData,
} from '../data/mockData';
import type { StockItem, Transaction } from '../types';
import { listStockBalances, listStockMovements, type StockBalanceDto, type StockMovementDto } from '../api/stock';
import { useAuth } from '../context/AuthContext';
import { getExpenseSummary } from '../api/expenses';

export function DashboardPage() {
  const { hasPermission } = useAuth();
  const canViewInventory = hasPermission('Manage Inventory');
  const canViewExpenses = hasPermission('Manage Expenses');
  const [balances, setBalances] = useState<StockBalanceDto[]>([]);
  const [movements, setMovements] = useState<StockMovementDto[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(canViewInventory);
  const [inventoryError, setInventoryError] = useState('');
  const [expenseData, setExpenseData] = useState<{ category: string; amount: number }[]>([]);
  const [expenseLoading, setExpenseLoading] = useState(canViewExpenses);
  const [expenseError, setExpenseError] = useState('');

  useEffect(() => {
    if (!canViewInventory) return;
    let cancelled = false;
    Promise.all([listStockBalances(), listStockMovements()])
      .then(([nextBalances, nextMovements]) => {
        if (cancelled) return;
        setBalances(nextBalances);
        setMovements(nextMovements);
      })
      .catch((error) => {
        if (!cancelled) setInventoryError(error instanceof Error ? error.message : 'Unable to load inventory activity');
      })
      .finally(() => {
        if (!cancelled) setInventoryLoading(false);
      });
    return () => { cancelled = true; };
  }, [canViewInventory]);

  useEffect(() => {
    if (!canViewExpenses) return;
    let cancelled = false;
    getExpenseSummary()
      .then((response) => { if (!cancelled) setExpenseData(response.data.categories); })
      .catch((error) => { if (!cancelled) setExpenseError(error instanceof Error ? error.message : 'Unable to load expense summary'); })
      .finally(() => { if (!cancelled) setExpenseLoading(false); });
    return () => { cancelled = true; };
  }, [canViewExpenses]);

  const lowStock = useMemo<StockItem[]>(() => balances
    .filter((item) => item.quantity <= item.reorderLevel)
    .sort((a, b) => (a.quantity / Math.max(a.reorderLevel, 1)) - (b.quantity / Math.max(b.reorderLevel, 1)))
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      name: `${item.itemCode} — ${item.name}`,
      category: item.category ?? '',
      quantity: item.quantity,
      unit: item.unit,
      costPerUnit: item.averageCost,
      minStock: item.reorderLevel,
      status: item.quantity <= 0 ? 'Out of Stock' : 'Low Stock',
    })), [balances]);

  const recentTransactions = useMemo<Transaction[]>(() => movements.slice(0, 8).map((movement) => ({
    id: movement.id,
    date: new Date(movement.movementDate).toLocaleDateString('en-GB'),
    type: movement.movementType === 'PURCHASE_RECEIPT' ? 'Purchase Receipt' : movement.movementType.replaceAll('_', ' '),
    description: `${movement.item.itemCode} — ${movement.item.name} (${movement.referenceNumber})`,
    amount: movement.totalCost,
    status: 'Posted',
  })), [movements]);

  const lowStockCols: Column<StockItem>[] = [
    { key: 'name', header: 'Product' },
    {
      key: 'quantity',
      header: 'Current Stock',
      render: (r) => `${r.quantity}${r.unit.toLowerCase()}`,
    },
    {
      key: 'minStock',
      header: 'Minimum Stock',
      render: (r) => `${r.minStock}${r.unit.toLowerCase()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Out of Stock' ? 'danger' : 'warning'}>{r.status === 'Low Stock' ? 'LOW' : 'OUT'}</Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: () => (
        <Link to="/purchase-orders">
          <Button size="sm" variant="outline">Order</Button>
        </Link>
      ),
    },
  ];

  const txCols: Column<Transaction>[] = [
    { key: 'date', header: 'Date' },
    { key: 'type', header: 'Type' },
    { key: 'description', header: 'Description' },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => formatCurrency(r.amount),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Paid' || r.status === 'Imported' || r.status === 'Posted' ? 'success' : 'warning'}>
          {r.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Restaurant owner overview — {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      <div className="grid-4">
        <StatCard
          label="Today's Sales"
          value={formatCurrency(3500)}
          change="+12% compared yesterday"
          icon={<PoundSterling size={18} />}
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(45000)}
          change="+8% vs last month"
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="Inventory Value"
          value={formatCurrency(12500)}
          icon={<Package size={18} />}
        />
        <StatCard
          label="VAT Due"
          value={formatCurrency(6000)}
          change="Q3 2026 period"
          icon={<Landmark size={18} />}
        />
      </div>

      <div className="grid-2">
        <Card title="Sales Chart">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v))}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  dot={{ fill: '#0f766e', r: 4 }}
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Expense Chart">
          <div style={{ height: 260 }}>
            {expenseLoading ? <p className="text-muted" style={{ padding: '1rem' }}>Loading expenses…</p> : expenseError ? <p style={{ color: 'var(--color-danger)', padding: '1rem' }}>{expenseError}</p> : !canViewExpenses ? <p className="text-muted" style={{ padding: '1rem' }}>Expense permission is required.</p> : expenseData.length === 0 ? <p className="text-muted" style={{ padding: '1rem' }}>No approved expenses for this month.</p> : <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v))}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="amount" fill="#0c1929" radius={[6, 6, 0, 0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>}
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Low Stock Alert" action={canViewInventory ? <Link to="/inventory"><Button size="sm" variant="ghost">View all</Button></Link> : undefined}>
          {inventoryLoading ? <p className="text-muted" style={{ padding: '1rem' }}>Loading stock…</p> : inventoryError ? <p style={{ color: 'var(--color-danger)', padding: '1rem' }}>{inventoryError}</p> : !canViewInventory ? <p className="text-muted" style={{ padding: '1rem' }}>Inventory permission is required.</p> : <DataTable columns={lowStockCols} data={lowStock} keyField="id" emptyTitle="Stock levels are healthy" emptyDescription="No ingredients are at or below their reorder level." />}
        </Card>
        <Card title="Recent Transactions">
          {inventoryLoading ? <p className="text-muted" style={{ padding: '1rem' }}>Loading transactions…</p> : inventoryError ? <p style={{ color: 'var(--color-danger)', padding: '1rem' }}>{inventoryError}</p> : !canViewInventory ? <p className="text-muted" style={{ padding: '1rem' }}>Inventory permission is required.</p> : <DataTable columns={txCols} data={recentTransactions} keyField="id" emptyTitle="No recent transactions" emptyDescription="Approved Goods Receipts will appear here." />}
        </Card>
      </div>
    </div>
  );
}
