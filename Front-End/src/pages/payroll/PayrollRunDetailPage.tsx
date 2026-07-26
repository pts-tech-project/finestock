import { useParams, Link } from 'react-router-dom';
import { Card, Badge, formatCurrency } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { mockPayrollRuns } from '../../data/payrollMock';

export function PayrollRunDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const run = mockPayrollRuns.find((r) => r.id === id);

  if (!run) {
    return (
      <div className="page">
        <p>Payroll run not found.</p>
        <Link to="/payroll/runs"><Button variant="outline">Back</Button></Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{run.period}</h1>
          <p className="page-subtitle">Pay date {run.payDate} · {run.employeeCount} employees</p>
        </div>
        <Badge variant={run.status === 'Paid' ? 'success' : run.status === 'Approved' ? 'info' : 'neutral'}>
          {run.status}
        </Badge>
      </div>

      <div className="grid-4">
        <Card><div className="mini-stat"><span>Gross</span><strong>{formatCurrency(run.grossPay)}</strong></div></Card>
        <Card><div className="mini-stat"><span>Tax</span><strong>{formatCurrency(run.totalTax)}</strong></div></Card>
        <Card><div className="mini-stat"><span>NI</span><strong>{formatCurrency(run.totalNi)}</strong></div></Card>
        <Card><div className="mini-stat"><span>Net</span><strong>{formatCurrency(run.netPay)}</strong></div></Card>
      </div>

      <Card title="Employee Lines">
        {run.lines.length === 0 ? (
          <div>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>No lines yet — open create flow to calculate.</p>
            <Link to="/payroll/runs/new"><Button>Continue Draft</Button></Link>
          </div>
        ) : (
          <table className="calc-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Basis</th>
                <th className="text-right">Gross</th>
                <th className="text-right">PAYE</th>
                <th className="text-right">NI</th>
                <th className="text-right">Pension</th>
                <th className="text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {run.lines.map((l) => (
                <tr key={l.employeeId}>
                  <td>{l.employeeName}</td>
                  <td>{l.payBasis}</td>
                  <td className="text-right">{formatCurrency(l.grossPay)}</td>
                  <td className="text-right">{formatCurrency(l.payeTax)}</td>
                  <td className="text-right">{formatCurrency(l.employeeNi)}</td>
                  <td className="text-right">{formatCurrency(l.pension)}</td>
                  <td className="text-right">{formatCurrency(l.netPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={() => toast('Recalculation will call backend later', 'info')}>Calculate Payroll</Button>
          <Button variant="outline" onClick={() => toast('Draft saved')}>Save Draft</Button>
          <Button onClick={() => toast('Payroll approved')}>Approve Payroll</Button>
          <Button variant="secondary" onClick={() => toast('Marked as paid')}>Mark as Paid</Button>
        </div>
      </Card>

      <style>{`
        .mini-stat { display: flex; flex-direction: column; gap: 0.35rem; }
        .mini-stat span { font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; }
        .mini-stat strong { font-family: var(--font-display); font-size: 1.25rem; }
        .calc-table { width: 100%; font-size: 0.875rem; }
        .calc-table th, .calc-table td {
          padding: 0.7rem 0.5rem;
          border-bottom: 1px solid var(--color-border);
          text-align: left;
        }
        .calc-table th {
          font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em;
          color: var(--color-text-secondary); background: var(--color-bg-muted);
        }
      `}</style>
    </div>
  );
}
