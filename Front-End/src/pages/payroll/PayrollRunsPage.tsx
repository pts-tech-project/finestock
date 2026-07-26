import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { Card, Badge, formatCurrency } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { mockPayrollRuns } from '../../data/payrollMock';
import type { PayrollRun, PayrollRunStatus } from '../../types';

export function PayrollRunsPage() {
  const [runs] = useState(mockPayrollRuns);

  const statusVariant = (s: PayrollRunStatus) => {
    if (s === 'Paid') return 'success' as const;
    if (s === 'Approved') return 'info' as const;
    if (s === 'Calculated') return 'warning' as const;
    return 'neutral' as const;
  };

  const columns: Column<PayrollRun>[] = [
    { key: 'period', header: 'Payroll Period' },
    {
      key: 'employeeCount',
      header: 'Employees',
      align: 'right',
    },
    {
      key: 'grossPay',
      header: 'Gross Pay',
      align: 'right',
      render: (r) => formatCurrency(r.grossPay),
    },
    {
      key: 'totalTax',
      header: 'Total Tax',
      align: 'right',
      render: (r) => formatCurrency(r.totalTax),
    },
    {
      key: 'totalNi',
      header: 'Total NI',
      align: 'right',
      render: (r) => formatCurrency(r.totalNi),
    },
    {
      key: 'totalPension',
      header: 'Total Pension',
      align: 'right',
      render: (r) => formatCurrency(r.totalPension),
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
      render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Link to={`/payroll/runs/${r.id}`}>
          <Button size="sm" variant="ghost"><Eye size={14} /> Open</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Run</h1>
          <p className="page-subtitle">Create, calculate, approve and pay payroll periods</p>
        </div>
        <Link to="/payroll/runs/new">
          <Button><Plus size={16} /> Create Payroll</Button>
        </Link>
      </div>

      <Card>
        <DataTable columns={columns} data={runs} keyField="id" />
      </Card>
    </div>
  );
}
