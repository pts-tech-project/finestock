import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Eye } from 'lucide-react';
import { Card, Badge, SearchInput, Pagination, formatCurrency } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { mockPayrollEmployees } from '../../data/payrollMock';
import type {
  EmploymentType,
  PayFrequency,
  PayType,
  PayrollEmployee,
  PayrollEmployeeStatus,
} from '../../types';

const emptyForm = {
  name: '',
  position: '',
  startDate: '',
  employmentType: 'Full-time' as EmploymentType,
  payType: 'Salary' as PayType,
  salaryOrRate: '',
  payFrequency: 'Monthly' as PayFrequency,
  taxCode: '1257L',
  niNumber: '',
  bankAccount: '',
  pensionEnrolled: 'Yes',
  status: 'Active' as PayrollEmployeeStatus,
};

export function PayrollEmployeesPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState(mockPayrollEmployees);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PayrollEmployee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pageSize = 6;

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [employees, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (emp: PayrollEmployee) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      position: emp.position,
      startDate: emp.startDate,
      employmentType: emp.employmentType,
      payType: emp.payType,
      salaryOrRate: String(emp.salaryOrRate),
      payFrequency: emp.payFrequency,
      taxCode: emp.taxCode,
      niNumber: emp.niNumber,
      bankAccount: emp.bankAccount,
      pensionEnrolled: emp.pensionEnrolled ? 'Yes' : 'No',
      status: emp.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.position.trim()) next.position = 'Position is required';
    if (!form.startDate) next.startDate = 'Start date is required';
    if (!form.salaryOrRate || Number(form.salaryOrRate) <= 0) next.salaryOrRate = 'Enter a valid rate';
    if (!form.taxCode.trim()) next.taxCode = 'Tax code is required';
    if (!form.niNumber.trim()) next.niNumber = 'NI number is required';
    return next;
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload: Omit<PayrollEmployee, 'id' | 'employeeId'> = {
      name: form.name.trim(),
      position: form.position.trim(),
      startDate: form.startDate,
      employmentType: form.employmentType,
      payType: form.payType,
      salaryOrRate: Number(form.salaryOrRate),
      payFrequency: form.payFrequency,
      taxCode: form.taxCode.trim(),
      niNumber: form.niNumber.trim().toUpperCase(),
      bankAccount: form.bankAccount.trim() || '****0000',
      pensionEnrolled: form.pensionEnrolled === 'Yes',
      status: form.status,
    };

    if (editing) {
      setEmployees((prev) => prev.map((emp) => (emp.id === editing.id ? { ...emp, ...payload } : emp)));
      toast('Employee payroll profile updated');
    } else {
      const n = employees.length + 1;
      setEmployees((prev) => [
        {
          id: crypto.randomUUID(),
          employeeId: `EMP-${String(n).padStart(3, '0')}`,
          ...payload,
        },
        ...prev,
      ]);
      toast('Employee added to payroll');
    }
    setModalOpen(false);
  };

  const columns: Column<PayrollEmployee>[] = [
    { key: 'employeeId', header: 'Employee ID' },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'position', header: 'Position' },
    { key: 'employmentType', header: 'Employment Type' },
    { key: 'payType', header: 'Pay Type' },
    {
      key: 'salaryOrRate',
      header: 'Salary / Rate',
      align: 'right',
      render: (r) =>
        r.payType === 'Salary'
          ? formatCurrency(r.salaryOrRate)
          : `${formatCurrency(r.salaryOrRate)}/hr`,
    },
    { key: 'taxCode', header: 'Tax Code' },
    { key: 'niNumber', header: 'NI Number' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Active' ? 'success' : 'neutral'}>{r.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Link to={`/payroll/employees/${r.id}`}>
            <Button size="sm" variant="ghost"><Eye size={14} /></Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
            <Pencil size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Payroll-related employee details only — not a full HR module</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} /> Add Employee</Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search employees..." />
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: 150 }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
        <DataTable columns={columns} data={pageData} keyField="id" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Payroll Profile' : 'Add Employee'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Add Employee'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="form-grid">
          <Field label="Full Name" htmlFor="pe-name" error={errors.name}>
            <Input id="pe-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} />
          </Field>
          <Field label="Position" htmlFor="pe-pos" error={errors.position}>
            <Input id="pe-pos" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} error={!!errors.position} />
          </Field>
          <Field label="Start Date" htmlFor="pe-start" error={errors.startDate}>
            <Input id="pe-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} error={!!errors.startDate} />
          </Field>
          <Field label="Employment Type" htmlFor="pe-emp">
            <Select id="pe-emp" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value as EmploymentType })}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Casual</option>
            </Select>
          </Field>
          <Field label="Pay Type" htmlFor="pe-pay">
            <Select id="pe-pay" value={form.payType} onChange={(e) => setForm({ ...form, payType: e.target.value as PayType })}>
              <option>Salary</option>
              <option>Hourly</option>
            </Select>
          </Field>
          <Field label={form.payType === 'Salary' ? 'Annual Salary' : 'Hourly Rate'} htmlFor="pe-rate" error={errors.salaryOrRate}>
            <Input id="pe-rate" type="number" step="0.01" value={form.salaryOrRate} onChange={(e) => setForm({ ...form, salaryOrRate: e.target.value })} error={!!errors.salaryOrRate} />
          </Field>
          <Field label="Pay Frequency" htmlFor="pe-freq">
            <Select id="pe-freq" value={form.payFrequency} onChange={(e) => setForm({ ...form, payFrequency: e.target.value as PayFrequency })}>
              <option>Weekly</option>
              <option>Fortnightly</option>
              <option>Monthly</option>
            </Select>
          </Field>
          <Field label="Tax Code" htmlFor="pe-tax" error={errors.taxCode}>
            <Input id="pe-tax" value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} error={!!errors.taxCode} />
          </Field>
          <Field label="National Insurance Number" htmlFor="pe-ni" error={errors.niNumber}>
            <Input id="pe-ni" value={form.niNumber} onChange={(e) => setForm({ ...form, niNumber: e.target.value })} error={!!errors.niNumber} />
          </Field>
          <Field label="Bank Account" htmlFor="pe-bank">
            <Input id="pe-bank" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} placeholder="****1234" />
          </Field>
          <Field label="Pension Enrolled" htmlFor="pe-pen">
            <Select id="pe-pen" value={form.pensionEnrolled} onChange={(e) => setForm({ ...form, pensionEnrolled: e.target.value })}>
              <option>Yes</option>
              <option>No</option>
            </Select>
          </Field>
          <Field label="Status" htmlFor="pe-status">
            <Select id="pe-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PayrollEmployeeStatus })}>
              <option>Active</option>
              <option>Inactive</option>
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  );
}
