import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export function PayrollPage() {
  const { toast } = useToast();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle">Run payroll and manage employee pay (add-on module)</p>
        </div>
      </div>

      <Card title="Coming soon">
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', maxWidth: 520 }}>
          Payroll tools will live here once this add-on is configured for your account — employee
          records, pay runs and HMRC submissions.
        </p>
        <Button variant="outline" onClick={() => toast('Payroll details will be added later', 'info')}>
          Notify me when ready
        </Button>
      </Card>
    </div>
  );
}
