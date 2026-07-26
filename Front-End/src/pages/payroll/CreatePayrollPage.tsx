import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, formatCurrency } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { mockCalculatePayroll, mockPayrollEmployees } from '../../data/payrollMock';
import type { PayrollLineItem } from '../../types';

export function CreatePayrollPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [period, setPeriod] = useState('September 2026');
  const [payDate, setPayDate] = useState('2026-09-28');
  const [lines, setLines] = useState<PayrollLineItem[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeEmployees = useMemo(
    () => mockPayrollEmployees.filter((e) => e.status === 'Active'),
    []
  );

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, l) => ({
        gross: acc.gross + l.grossPay,
        tax: acc.tax + l.payeTax,
        ni: acc.ni + l.employeeNi,
        pension: acc.pension + l.pension,
        net: acc.net + l.netPay,
      }),
      { gross: 0, tax: 0, ni: 0, pension: 0, net: 0 }
    );
  }, [lines]);

  const loadEmployees = () => {
    if (!period.trim() || !payDate) {
      toast('Select payroll period and pay date', 'error');
      return;
    }
    setLines(
      activeEmployees.map((e) => ({
        employeeId: e.id,
        employeeName: e.name,
        payBasis:
          e.payType === 'Salary'
            ? `Salary £${e.salaryOrRate.toLocaleString()} / yr`
            : `Hourly £${e.salaryOrRate.toFixed(2)}`,
        grossPay: 0,
        payeTax: 0,
        employeeNi: 0,
        pension: 0,
        otherDeductions: 0,
        netPay: 0,
      }))
    );
    setCalculated(false);
    setStep(2);
  };

  const calculate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLines(mockCalculatePayroll(activeEmployees));
    setCalculated(true);
    setLoading(false);
    setStep(3);
    toast('Payroll calculated (mock backend results)');
  };

  const saveDraft = () => {
    toast('Payroll saved as Draft');
    navigate('/payroll/runs');
  };

  const approve = () => {
    if (!calculated) {
      toast('Calculate payroll before approving', 'error');
      return;
    }
    toast('Payroll approved');
    navigate('/payroll/runs');
  };

  const markPaid = () => {
    if (!calculated) {
      toast('Calculate and approve payroll first', 'error');
      return;
    }
    toast('Payroll marked as Paid');
    navigate('/payroll/payslips');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Payroll</h1>
          <p className="page-subtitle">Step {step} of 3 — frontend displays calculated results from payroll engine</p>
        </div>
        <Link to="/payroll/runs"><Button variant="outline">Cancel</Button></Link>
      </div>

      <div className="steps">
        <span className={step >= 1 ? 'on' : ''}>1. Period</span>
        <span className={step >= 2 ? 'on' : ''}>2. Employees</span>
        <span className={step >= 3 ? 'on' : ''}>3. Calculation</span>
      </div>

      {step === 1 && (
        <Card title="Select Payroll Period">
          <div className="form-grid" style={{ maxWidth: 560 }}>
            <Field label="Payroll Period" htmlFor="pr-period">
              <Input id="pr-period" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="September 2026" />
            </Field>
            <Field label="Pay Date" htmlFor="pr-date">
              <Input id="pr-date" type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <Button onClick={loadEmployees}>Continue — Load Employees</Button>
          </div>
        </Card>
      )}

      {step >= 2 && (
        <Card
          title={`Employees · ${period}`}
          action={<Button size="sm" variant="outline" onClick={() => setStep(1)}>Edit period</Button>}
        >
          <table className="calc-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Salary / Hours</th>
                <th className="text-right">Gross Pay</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.employeeId}>
                  <td>{l.employeeName}</td>
                  <td>{l.payBasis}</td>
                  <td className="text-right">{formatCurrency(l.grossPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {step === 2 && (
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <Button onClick={calculate} loading={loading}>Calculate Payroll</Button>
              <Button variant="outline" onClick={saveDraft}>Save Draft</Button>
            </div>
          )}
        </Card>
      )}

      {step === 3 && (
        <Card title="Payroll Calculation">
          <table className="calc-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="text-right">Gross Pay</th>
                <th className="text-right">PAYE Tax</th>
                <th className="text-right">Employee NI</th>
                <th className="text-right">Pension</th>
                <th className="text-right">Other</th>
                <th className="text-right">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.employeeId}>
                  <td>{l.employeeName}</td>
                  <td className="text-right">{formatCurrency(l.grossPay)}</td>
                  <td className="text-right">{formatCurrency(l.payeTax)}</td>
                  <td className="text-right">{formatCurrency(l.employeeNi)}</td>
                  <td className="text-right">{formatCurrency(l.pension)}</td>
                  <td className="text-right">{formatCurrency(l.otherDeductions)}</td>
                  <td className="text-right"><strong>{formatCurrency(l.netPay)}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Totals</strong></td>
                <td className="text-right"><strong>{formatCurrency(totals.gross)}</strong></td>
                <td className="text-right"><strong>{formatCurrency(totals.tax)}</strong></td>
                <td className="text-right"><strong>{formatCurrency(totals.ni)}</strong></td>
                <td className="text-right"><strong>{formatCurrency(totals.pension)}</strong></td>
                <td className="text-right">—</td>
                <td className="text-right"><strong>{formatCurrency(totals.net)}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={calculate} loading={loading}>Recalculate</Button>
            <Button variant="outline" onClick={saveDraft}>Save Draft</Button>
            <Button onClick={approve}>Approve Payroll</Button>
            <Button variant="secondary" onClick={markPaid}>Mark as Paid</Button>
          </div>
        </Card>
      )}

      <style>{`
        .steps {
          display: flex; gap: 0.75rem; flex-wrap: wrap;
          font-size: 0.82rem; font-weight: 700;
        }
        .steps span {
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          background: var(--color-bg-muted);
          color: var(--color-text-muted);
        }
        .steps span.on {
          background: var(--color-accent-soft);
          color: var(--color-accent-text);
        }
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
        .calc-table tfoot td { border-bottom: none; padding-top: 0.9rem; }
      `}</style>
    </div>
  );
}
