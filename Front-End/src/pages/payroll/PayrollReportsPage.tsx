import { useMemo, useState } from 'react';
import { Card, StatCard, formatCurrency } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { mockPayrollEmployees, mockPayrollRuns, mockPayslips } from '../../data/payrollMock';

export function PayrollReportsPage() {
  const [employeeId, setEmployeeId] = useState(mockPayrollEmployees[0]?.id ?? '');

  const paidRuns = mockPayrollRuns.filter((r) => r.status === 'Paid' || r.status === 'Approved');
  const latest = paidRuns[0];

  const history = useMemo(() => {
    return mockPayslips.filter((p) => p.employeeId === employeeId);
  }, [employeeId]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Reports</h1>
          <p className="page-subtitle">Monthly summary and employee pay history</p>
        </div>
      </div>

      <Card title={`Monthly Payroll Summary · ${latest?.period ?? '—'}`}>
        <div className="grid-4" style={{ marginTop: '0.25rem' }}>
          <StatCard label="Total Gross Pay" value={formatCurrency(latest?.grossPay ?? 0)} />
          <StatCard label="Total Tax" value={formatCurrency(latest?.totalTax ?? 0)} />
          <StatCard label="Total NI" value={formatCurrency(latest?.totalNi ?? 0)} />
          <StatCard label="Total Pension" value={formatCurrency(latest?.totalPension ?? 0)} />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <StatCard label="Total Net Pay" value={formatCurrency(latest?.netPay ?? 0)} />
        </div>
      </Card>

      <Card title="Employee Payroll History">
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>
            Employee
            <Select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              style={{ display: 'block', marginTop: '0.35rem', width: 280 }}
            >
              {mockPayrollEmployees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </Select>
          </label>
        </div>

        {history.length === 0 ? (
          <p className="text-muted">No payroll history for this employee yet.</p>
        ) : (
          <table className="hist-table">
            <thead>
              <tr>
                <th>Payroll Date / Period</th>
                <th className="text-right">Gross Pay</th>
                <th className="text-right">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{h.period}</td>
                  <td className="text-right">{formatCurrency(h.grossPay)}</td>
                  <td className="text-right">{formatCurrency(h.netPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <style>{`
        .hist-table { width: 100%; font-size: 0.9rem; }
        .hist-table th, .hist-table td {
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid var(--color-border);
          text-align: left;
        }
        .hist-table th {
          font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}
