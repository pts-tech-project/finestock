import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, Badge, formatCurrency } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockPayrollEmployees, mockPayslips } from '../../data/payrollMock';

export function PayrollEmployeeProfilePage() {
  const { id } = useParams();
  const employee = mockPayrollEmployees.find((e) => e.id === id);
  const history = mockPayslips.filter((p) => p.employeeId === id);

  if (!employee) {
    return (
      <div className="page">
        <p>Employee not found.</p>
        <Link to="/payroll/employees"><Button variant="outline">Back</Button></Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/payroll/employees" className="back-link">
            <ArrowLeft size={16} /> Employees
          </Link>
          <h1 className="page-title">{employee.name}</h1>
          <p className="page-subtitle">{employee.employeeId} · {employee.position}</p>
        </div>
        <Badge variant={employee.status === 'Active' ? 'success' : 'neutral'}>{employee.status}</Badge>
      </div>

      <div className="grid-2">
        <Card title="Basic Information">
          <dl className="profile-dl">
            <div><dt>Full Name</dt><dd>{employee.name}</dd></div>
            <div><dt>Position</dt><dd>{employee.position}</dd></div>
            <div><dt>Start Date</dt><dd>{employee.startDate}</dd></div>
            <div><dt>Employment Type</dt><dd>{employee.employmentType}</dd></div>
          </dl>
        </Card>

        <Card title="Payroll Information">
          <dl className="profile-dl">
            <div>
              <dt>{employee.payType === 'Salary' ? 'Salary' : 'Hourly Rate'}</dt>
              <dd>
                {employee.payType === 'Salary'
                  ? formatCurrency(employee.salaryOrRate)
                  : `${formatCurrency(employee.salaryOrRate)}/hr`}
              </dd>
            </div>
            <div><dt>Pay Frequency</dt><dd>{employee.payFrequency}</dd></div>
            <div><dt>Tax Code</dt><dd>{employee.taxCode}</dd></div>
            <div><dt>NI Number</dt><dd>{employee.niNumber}</dd></div>
            <div><dt>Bank Account</dt><dd>{employee.bankAccount}</dd></div>
            <div><dt>Pension Enrolled</dt><dd>{employee.pensionEnrolled ? 'Yes' : 'No'}</dd></div>
          </dl>
        </Card>
      </div>

      <Card title="Payroll History">
        {history.length === 0 ? (
          <p className="text-muted">No payslips yet for this employee.</p>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>Payroll Period</th>
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
        .back-link {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.85rem; font-weight: 600; color: var(--color-accent-text);
          margin-bottom: 0.45rem;
        }
        .profile-dl {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .profile-dl dt {
          font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted);
          text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.25rem;
        }
        .profile-dl dd { font-weight: 600; }
        .simple-table { width: 100%; font-size: 0.9rem; }
        .simple-table th, .simple-table td {
          padding: 0.7rem 0.4rem;
          border-bottom: 1px solid var(--color-border);
          text-align: left;
        }
        .simple-table th {
          font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em;
          color: var(--color-text-secondary);
        }
        @media (max-width: 700px) {
          .profile-dl { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
