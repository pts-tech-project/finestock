import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, StatCard, formatCurrency } from '../components/ui/Card';
import { Field, Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { salesChartData, monthlySalesData } from '../data/mockData';

type ReportTab = 'sales' | 'pl' | 'food' | 'stock';

export function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('sales');
  const [from, setFrom] = useState('2026-07-01');
  const [to, setTo] = useState('2026-07-22');

  const tabs: { id: ReportTab; label: string }[] = [
    { id: 'sales', label: 'Sales Report' },
    { id: 'pl', label: 'Profit & Loss' },
    { id: 'food', label: 'Food Cost' },
    { id: 'stock', label: 'Stock Report' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Financial and operational reporting</p>
        </div>
      </div>

      <div className="report-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`report-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1.25rem' }}>
          <Field label="From" htmlFor="r-from">
            <Input id="r-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To" htmlFor="r-to">
            <Input id="r-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <div style={{ alignSelf: 'flex-end' }}>
            <Button variant="outline">Apply Filters</Button>
          </div>
        </div>

        {tab === 'sales' && (
          <div className="grid-2">
            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Daily Sales</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Line type="monotone" dataKey="sales" stroke="#0f766e" strokeWidth={2.5} name="Sales" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Monthly Sales</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="sales" fill="#0c1929" radius={[6, 6, 0, 0]} name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === 'pl' && (
          <div className="pl-report">
            <div className="grid-4">
              <StatCard label="Revenue" value={formatCurrency(45000)} />
              <StatCard label="Sales" value={formatCurrency(45000)} />
              <StatCard label="Expenses" value={formatCurrency(20900)} />
              <StatCard label="Gross Profit" value={formatCurrency(24100)} change="Net Profit £18,400" />
            </div>
            <div className="pl-rows" style={{ marginTop: '1.5rem' }}>
              {[
                ['Revenue / Sales', 45000],
                ['Cost of Goods Sold', -12500],
                ['Gross Profit', 32500],
                ['Operating Expenses', -8400],
                ['Net Profit', 24100],
              ].map(([label, amount]) => (
                <div key={String(label)} className="pl-row">
                  <span>{label}</span>
                  <strong className={Number(amount) < 0 ? 'neg' : ''}>{formatCurrency(Number(amount))}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'food' && (
          <div className="grid-4">
            <StatCard label="Sales" value={formatCurrency(45000)} />
            <StatCard label="Food Purchases" value={formatCurrency(12500)} />
            <StatCard label="Food Cost %" value="27.8%" />
            <StatCard label="Gross Margin" value="72.2%" change="+1.2% vs last month" />
          </div>
        )}

        {tab === 'stock' && (
          <div className="grid-4">
            <StatCard label="Opening Stock" value={formatCurrency(11200)} />
            <StatCard label="Purchases" value={formatCurrency(8500)} />
            <StatCard label="Usage" value={formatCurrency(7200)} />
            <StatCard label="Closing Stock" value={formatCurrency(12500)} />
          </div>
        )}
      </Card>

      <style>{`
        .report-tabs {
          display: flex; gap: 0.35rem; flex-wrap: wrap;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0.35rem;
        }
        .report-tab {
          padding: 0.55rem 1rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .report-tab:hover { background: var(--color-bg-muted); color: var(--color-text); }
        .report-tab.active { background: var(--color-accent); color: white; }
        .pl-rows { display: flex; flex-direction: column; max-width: 480px; }
        .pl-row {
          display: flex; justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        .pl-row:last-child { border-bottom: none; font-size: 1.1rem; }
        .pl-row .neg { color: var(--color-danger); }
      `}</style>
    </div>
  );
}
