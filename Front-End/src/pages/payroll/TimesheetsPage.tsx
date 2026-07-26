import { useMemo, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Card, Badge, SearchInput, Pagination } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { mockPayrollEmployees, mockTimesheets } from '../../data/payrollMock';
import type { TimesheetEntry, TimesheetStatus } from '../../types';

const hourlyEmployees = mockPayrollEmployees.filter((e) => e.payType === 'Hourly' && e.status === 'Active');

export function TimesheetsPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState(mockTimesheets);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: hourlyEmployees[0]?.id ?? '',
    date: '',
    hoursWorked: '',
    overtimeHours: '0',
    notes: '',
    status: 'Draft' as TimesheetStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pageSize = 8;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setForm({
      employeeId: hourlyEmployees[0]?.id ?? '',
      date: '',
      hoursWorked: '',
      overtimeHours: '0',
      notes: '',
      status: 'Draft',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.employeeId) next.employeeId = 'Select an employee';
    if (!form.date) next.date = 'Date is required';
    if (!form.hoursWorked || Number(form.hoursWorked) <= 0) next.hoursWorked = 'Enter hours worked';
    setErrors(next);
    if (Object.keys(next).length) return;

    const emp = hourlyEmployees.find((x) => x.id === form.employeeId);
    setRows((prev) => [
      {
        id: crypto.randomUUID(),
        employeeId: form.employeeId,
        employeeName: emp?.name ?? 'Unknown',
        date: form.date,
        hoursWorked: Number(form.hoursWorked),
        overtimeHours: Number(form.overtimeHours) || 0,
        notes: form.notes,
        status: form.status,
      },
      ...prev,
    ]);
    setModalOpen(false);
    toast('Timesheet entry saved');
  };

  const statusVariant = (s: TimesheetStatus) => {
    if (s === 'Approved') return 'success' as const;
    if (s === 'Submitted') return 'info' as const;
    return 'neutral' as const;
  };

  const columns: Column<TimesheetEntry>[] = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'date', header: 'Date' },
    { key: 'hoursWorked', header: 'Hours Worked', align: 'right' },
    { key: 'overtimeHours', header: 'Overtime Hours', align: 'right' },
    { key: 'notes', header: 'Notes' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
    },
  ];

  if (hourlyEmployees.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Timesheets</h1>
            <p className="page-subtitle">Only required when employees are paid hourly</p>
          </div>
        </div>
        <Card>
          <p className="text-muted">
            No hourly employees on payroll. Timesheets can be skipped while everyone is on monthly salary.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Timesheets</h1>
          <p className="page-subtitle">Hours used for wage calculation of hourly-paid staff</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} /> Add Entry</Button>
      </div>

      <Card>
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search timesheets..." />
        </div>
        <DataTable columns={columns} data={pageData} keyField="id" />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Timesheet Entry"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Entry</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="form-grid">
          <Field label="Employee" htmlFor="ts-emp" error={errors.employeeId}>
            <Select id="ts-emp" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
              {hourlyEmployees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date" htmlFor="ts-date" error={errors.date}>
            <Input id="ts-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} error={!!errors.date} />
          </Field>
          <Field label="Hours Worked" htmlFor="ts-hrs" error={errors.hoursWorked}>
            <Input id="ts-hrs" type="number" step="0.25" value={form.hoursWorked} onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })} error={!!errors.hoursWorked} />
          </Field>
          <Field label="Overtime Hours" htmlFor="ts-ot">
            <Input id="ts-ot" type="number" step="0.25" value={form.overtimeHours} onChange={(e) => setForm({ ...form, overtimeHours: e.target.value })} />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Notes" htmlFor="ts-notes">
              <Textarea id="ts-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
          <Field label="Status" htmlFor="ts-status">
            <Select id="ts-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TimesheetStatus })}>
              <option>Draft</option>
              <option>Submitted</option>
              <option>Approved</option>
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  );
}
