import { useState } from 'react';
import { Eye, Download, Mail } from 'lucide-react';
import { Card, Badge, formatCurrency } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { mockPayslips } from '../../data/payrollMock';
import type { PayslipRecord } from '../../types';

export function PayslipsPage() {
  const { toast } = useToast();
  const [payslips] = useState(mockPayslips);
  const [preview, setPreview] = useState<PayslipRecord | null>(null);

  const columns: Column<PayslipRecord>[] = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'period', header: 'Payroll Period' },
    {
      key: 'grossPay',
      header: 'Gross Pay',
      align: 'right',
      render: (r) => formatCurrency(r.grossPay),
    },
    {
      key: 'netPay',
      header: 'Net Pay',
      align: 'right',
      render: (r) => formatCurrency(r.netPay),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Sent' ? 'success' : 'info'}>{r.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Button size="sm" variant="ghost" onClick={() => setPreview(r)}>
            <Eye size={14} /> View
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast('PDF download will be wired to backend', 'info')}>
            <Download size={14} /> PDF
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast(`Payslip emailed for ${r.employeeName}`, 'info')}>
            <Mail size={14} /> Email
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payslips</h1>
          <p className="page-subtitle">Available after payroll is approved</p>
        </div>
      </div>

      <Card>
        <DataTable columns={columns} data={payslips} keyField="id" />
      </Card>

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Payslip Preview"
        size="md"
        footer={<Button variant="outline" onClick={() => setPreview(null)}>Close</Button>}
      >
        {preview && (
          <div className="payslip">
            <div className="payslip-brand">
              <strong>The Harbour Kitchen</strong>
              <span>Payslip</span>
            </div>
            <div className="payslip-meta">
              <div>
                <span>Employee</span>
                <strong>{preview.employeeName}</strong>
              </div>
              <div>
                <span>Payroll Period</span>
                <strong>{preview.period}</strong>
              </div>
            </div>
            <table className="payslip-table">
              <tbody>
                <tr><td>Gross Pay</td><td>{formatCurrency(preview.grossPay)}</td></tr>
                <tr><td>PAYE</td><td>{formatCurrency(preview.payeTax)}</td></tr>
                <tr><td>National Insurance</td><td>{formatCurrency(preview.employeeNi)}</td></tr>
                <tr><td>Pension</td><td>{formatCurrency(preview.pension)}</td></tr>
                {preview.otherDeductions > 0 && (
                  <tr><td>Other Deductions</td><td>{formatCurrency(preview.otherDeductions)}</td></tr>
                )}
                <tr className="net"><td>Net Pay</td><td>{formatCurrency(preview.netPay)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <style>{`
        .payslip-brand {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 2px solid var(--color-sidebar);
        }
        .payslip-brand strong {
          font-family: var(--font-display);
          font-size: 1.25rem;
        }
        .payslip-brand span {
          font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted);
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .payslip-meta {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .payslip-meta span {
          display: block; font-size: 0.72rem; font-weight: 700;
          color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.25rem;
        }
        .payslip-table { width: 100%; }
        .payslip-table td {
          padding: 0.55rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        .payslip-table td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
        .payslip-table tr.net td {
          border-bottom: none;
          padding-top: 0.9rem;
          font-weight: 700;
          font-size: 1.05rem;
        }
      `}</style>
    </div>
  );
}
