import { Link } from 'react-router-dom';
import { Users, PoundSterling, Wallet, CalendarClock } from 'lucide-react';
import { Card, StatCard, Badge, formatCurrency } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { currentPayrollOverview, mockPayrollRuns } from '../../data/payrollMock';

export function PayrollDashboardPage() {
  const recent = mockPayrollRuns.slice(0, 3);

  const statusVariant = (s: string) => {
    if (s === 'Completed' || s === 'Paid') return 'success' as const;
    if (s === 'Approved') return 'info' as const;
    return 'neutral' as const;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Dashboard</h1>
          <p className="page-subtitle">Overview of the current payroll period</p>
        </div>
        <Link to="/payroll/runs/new">
          <Button>Create Payroll</Button>
        </Link>
      </div>

      <div className="grid-4">
        <StatCard
          label="Employees"
          value={String(currentPayrollOverview.totalEmployees)}
          icon={<Users size={16} />}
        />
        <StatCard
          label="Gross Pay"
          value={formatCurrency(currentPayrollOverview.totalGross)}
          icon={<PoundSterling size={16} />}
        />
        <StatCard
          label="Deductions"
          value={formatCurrency(currentPayrollOverview.totalDeductions)}
          icon={<Wallet size={16} />}
        />
        <StatCard
          label="Net Pay"
          value={formatCurrency(currentPayrollOverview.totalNet)}
          change={`Payday ${currentPayrollOverview.upcomingPayday}`}
          icon={<CalendarClock size={16} />}
        />
      </div>

      <div className="grid-2">
        <Card title="Current Period">
          <div className="payroll-kv">
            <div>
              <span className="text-muted">Payroll period</span>
              <strong>{currentPayrollOverview.period}</strong>
            </div>
            <div>
              <span className="text-muted">Status</span>
              <Badge variant={statusVariant(currentPayrollOverview.status)}>
                {currentPayrollOverview.status}
              </Badge>
            </div>
            <div>
              <span className="text-muted">Upcoming payday</span>
              <strong>{currentPayrollOverview.upcomingPayday}</strong>
            </div>
            <div>
              <span className="text-muted">Total net pay</span>
              <strong>{formatCurrency(currentPayrollOverview.totalNet)}</strong>
            </div>
          </div>
        </Card>

        <Card
          title="Recent Payroll Runs"
          action={
            <Link to="/payroll/runs">
              <Button size="sm" variant="ghost">View all</Button>
            </Link>
          }
        >
          <ul className="payroll-recent">
            {recent.map((run) => (
              <li key={run.id}>
                <div>
                  <strong>{run.period}</strong>
                  <span className="text-muted">{run.employeeCount} employees · Pay {run.payDate}</span>
                </div>
                <div className="payroll-recent-right">
                  <strong>{formatCurrency(run.netPay)}</strong>
                  <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <style>{`
        .payroll-kv {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.1rem;
        }
        .payroll-kv > div {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .payroll-kv span { font-size: 0.8rem; font-weight: 600; }
        .payroll-recent {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .payroll-recent li {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--color-border);
        }
        .payroll-recent li:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .payroll-recent li > div:first-child {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .payroll-recent li span { font-size: 0.8rem; }
        .payroll-recent-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.35rem;
        }
        @media (max-width: 700px) {
          .payroll-kv { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
