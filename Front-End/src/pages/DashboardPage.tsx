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
  expenseChartData,
  mockStockItems,
  mockTransactions,
} from '../data/mockData';
import type { StockItem, Transaction } from '../types';

export function DashboardPage() {
  const lowStock = mockStockItems.filter((i) => i.status !== 'Available');

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
        <Badge variant={r.status === 'Paid' || r.status === 'Imported' ? 'success' : 'warning'}>
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
          <p className="page-subtitle">Restaurant owner overview — 22 July 2026</p>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v))}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="amount" fill="#0c1929" radius={[6, 6, 0, 0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Low Stock Alert" action={<Link to="/inventory"><Button size="sm" variant="ghost">View all</Button></Link>}>
          <DataTable columns={lowStockCols} data={lowStock} keyField="id" />
        </Card>
        <Card title="Recent Transactions">
          <DataTable columns={txCols} data={mockTransactions} keyField="id" />
        </Card>
      </div>
    </div>
  );
}
