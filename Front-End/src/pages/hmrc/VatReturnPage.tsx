import { useState } from 'react';
import { CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import { Card, StatCard, Badge, formatCurrency } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { mockVatReturns } from '../../data/mockData';
import type { VatReturn } from '../../types';

/**
 * Guided by GOV.UK VAT browse:
 * https://www.gov.uk/browse/tax/vat
 */
export function VatReturnPage() {
  const { toast } = useToast();
  const [connected, setConnected] = useState(true);
  const [returns, setReturns] = useState(mockVatReturns);
  const [submitId, setSubmitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setConnected(true);
    setLoading(false);
    toast('Connected to HMRC successfully');
  };

  const statusVariant = (s: VatReturn['status']) => {
    if (s === 'Accepted') return 'success' as const;
    if (s === 'Submitted') return 'info' as const;
    return 'neutral' as const;
  };

  const columns: Column<VatReturn>[] = [
    { key: 'period', header: 'Period' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => formatCurrency(r.amount),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {r.status === 'Draft' && (
            <>
              <Button size="sm" variant="outline" onClick={() => toast('VAT return generated')}>
                Generate Return
              </Button>
              <Button size="sm" onClick={() => setSubmitId(r.id)}>
                Submit To HMRC
              </Button>
            </>
          )}
          {r.status !== 'Draft' && (
            <Button size="sm" variant="ghost" onClick={() => toast(`Viewing submission for ${r.period}`, 'info')}>
              View Submission
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">VAT Return</h1>
          <p className="page-subtitle">
            Charge, reclaim and submit VAT — including Making Tax Digital returns
          </p>
        </div>
        <a href="https://www.gov.uk/browse/tax/vat" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            GOV.UK VAT <ExternalLink size={14} />
          </Button>
        </a>
      </div>

      <div className="grid-2">
        <Card title="HMRC Integration">
          <div className="hmrc-status">
            <div className="hmrc-row">
              <span className="text-muted">Status</span>
              {connected ? (
                <span className="connected"><CheckCircle2 size={16} /> Connected</span>
              ) : (
                <Badge variant="warning">Disconnected</Badge>
              )}
            </div>
            <div className="hmrc-row">
              <span className="text-muted">VAT Number</span>
              <strong>GB123456789</strong>
            </div>
            <div className="hmrc-row">
              <span className="text-muted">Last Connected</span>
              <strong>22/07/2026</strong>
            </div>
            <Button
              variant={connected ? 'outline' : 'primary'}
              onClick={connect}
              loading={loading}
              style={{ marginTop: '1rem' }}
            >
              <Link2 size={16} /> {connected ? 'Reconnect HMRC' : 'Connect HMRC'}
            </Button>
          </div>
        </Card>

        <Card title="VAT Dashboard">
          <div className="grid-2" style={{ gap: '0.85rem' }}>
            <StatCard label="Current VAT Period" value="Q3 2026" />
            <StatCard label="Sales VAT" value={formatCurrency(8000)} />
            <StatCard label="Purchase VAT" value={formatCurrency(2000)} />
            <StatCard label="VAT Payable" value={formatCurrency(6000)} change="Due 07/11/2026" />
          </div>
        </Card>
      </div>

      <Card title="VAT Returns">
        <DataTable columns={columns} data={returns} keyField="id" />
      </Card>

      <ConfirmDialog
        open={!!submitId}
        title="Submit VAT Return"
        message="Submit this VAT return to HMRC? This action cannot be undone once accepted."
        confirmLabel="Submit To HMRC"
        onCancel={() => setSubmitId(null)}
        onConfirm={() => {
          setReturns((prev) =>
            prev.map((r) => (r.id === submitId ? { ...r, status: 'Submitted' } : r))
          );
          setSubmitId(null);
          toast('VAT return submitted to HMRC');
        }}
      />

      <style>{`
        .hmrc-status { display: flex; flex-direction: column; gap: 0.85rem; }
        .hmrc-row { display: flex; justify-content: space-between; align-items: center; }
        .connected {
          display: inline-flex; align-items: center; gap: 0.35rem;
          color: var(--color-success); font-weight: 600;
        }
      `}</style>
    </div>
  );
}
