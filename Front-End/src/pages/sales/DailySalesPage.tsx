import { useMemo, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { Card, Badge, SearchInput, Pagination, formatCurrency } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { mockDailySales } from '../../data/mockData';
import type { DailySale } from '../../types';

export function DailySalesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<DailySale | null>(null);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const pageSize = 5;

  const filtered = useMemo(() => {
    let rows = [...mockDailySales];
    if (search) {
      rows = rows.filter((r) =>
        r.date.includes(search) || r.source.toLowerCase().includes(search.toLowerCase())
      );
    }
    rows.sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortKey] ?? '');
      const bv = String((b as unknown as Record<string, unknown>)[sortKey] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return rows;
  }, [search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const columns: Column<DailySale>[] = [
    { key: 'date', header: 'Date', sortable: true },
    { key: 'transactions', header: 'Total Transactions', align: 'right', sortable: true },
    {
      key: 'grossSales',
      header: 'Gross Sales',
      align: 'right',
      sortable: true,
      render: (r) => formatCurrency(r.grossSales),
    },
    {
      key: 'vat',
      header: 'VAT',
      align: 'right',
      render: (r) => formatCurrency(r.vat),
    },
    {
      key: 'netSales',
      header: 'Net Sales',
      align: 'right',
      render: (r) => formatCurrency(r.netSales),
    },
    { key: 'source', header: 'Source' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant="success">{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Button size="sm" variant="ghost" onClick={() => setDetail(r)}>
          <Eye size={14} /> View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Sales</h1>
          <p className="page-subtitle">Sales imported from EPOS</p>
        </div>
        <Button variant="outline" onClick={() => toast('CSV export started', 'info')}>
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <Field label="From" htmlFor="from">
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To" htmlFor="to">
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <div style={{ alignSelf: 'flex-end' }}>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search sales..." />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={pageData}
          keyField="id"
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={`Sales Details — ${detail?.date}`}
        footer={<Button onClick={() => setDetail(null)}>Close</Button>}
      >
        {detail && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><span className="text-muted">Transactions</span><div style={{ fontWeight: 700 }}>{detail.transactions}</div></div>
            <div><span className="text-muted">Source</span><div style={{ fontWeight: 700 }}>{detail.source}</div></div>
            <div><span className="text-muted">Gross Sales</span><div style={{ fontWeight: 700 }}>{formatCurrency(detail.grossSales)}</div></div>
            <div><span className="text-muted">VAT</span><div style={{ fontWeight: 700 }}>{formatCurrency(detail.vat)}</div></div>
            <div><span className="text-muted">Net Sales</span><div style={{ fontWeight: 700 }}>{formatCurrency(detail.netSales)}</div></div>
            <div><span className="text-muted">Status</span><div><Badge variant="success">{detail.status}</Badge></div></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
