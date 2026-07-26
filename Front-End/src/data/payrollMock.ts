import type {
  PayrollEmployee,
  TimesheetEntry,
  PayrollRun,
  PayslipRecord,
} from '../types';

export const mockPayrollEmployees: PayrollEmployee[] = [
  {
    id: 'pe1',
    employeeId: 'EMP-001',
    name: 'James Walker',
    position: 'Head Chef',
    startDate: '2023-04-01',
    employmentType: 'Full-time',
    payType: 'Salary',
    salaryOrRate: 42000,
    payFrequency: 'Monthly',
    taxCode: '1257L',
    niNumber: 'QQ123456C',
    bankAccount: '****4521',
    pensionEnrolled: true,
    status: 'Active',
  },
  {
    id: 'pe2',
    employeeId: 'EMP-002',
    name: 'Amelia Brown',
    position: 'Restaurant Manager',
    startDate: '2022-09-12',
    employmentType: 'Full-time',
    payType: 'Salary',
    salaryOrRate: 38000,
    payFrequency: 'Monthly',
    taxCode: '1257L',
    niNumber: 'QQ654321A',
    bankAccount: '****8810',
    pensionEnrolled: true,
    status: 'Active',
  },
  {
    id: 'pe3',
    employeeId: 'EMP-003',
    name: 'Omar Hassan',
    position: 'Kitchen Assistant',
    startDate: '2024-01-15',
    employmentType: 'Part-time',
    payType: 'Hourly',
    salaryOrRate: 12.5,
    payFrequency: 'Monthly',
    taxCode: '1257L',
    niNumber: 'QQ998877B',
    bankAccount: '****2290',
    pensionEnrolled: false,
    status: 'Active',
  },
  {
    id: 'pe4',
    employeeId: 'EMP-004',
    name: 'Sophie Clarke',
    position: 'Front of House',
    startDate: '2024-06-03',
    employmentType: 'Casual',
    payType: 'Hourly',
    salaryOrRate: 11.8,
    payFrequency: 'Weekly',
    taxCode: '1257L',
    niNumber: 'QQ112233C',
    bankAccount: '****7744',
    pensionEnrolled: false,
    status: 'Active',
  },
  {
    id: 'pe5',
    employeeId: 'EMP-005',
    name: 'Daniel Price',
    position: 'Sous Chef',
    startDate: '2021-11-20',
    employmentType: 'Full-time',
    payType: 'Salary',
    salaryOrRate: 32000,
    payFrequency: 'Monthly',
    taxCode: '1257L',
    niNumber: 'QQ445566D',
    bankAccount: '****3301',
    pensionEnrolled: true,
    status: 'Inactive',
  },
];

export const mockTimesheets: TimesheetEntry[] = [
  {
    id: 'ts1',
    employeeId: 'pe3',
    employeeName: 'Omar Hassan',
    date: '2026-07-14',
    hoursWorked: 7.5,
    overtimeHours: 1,
    notes: 'Dinner rush cover',
    status: 'Approved',
  },
  {
    id: 'ts2',
    employeeId: 'pe3',
    employeeName: 'Omar Hassan',
    date: '2026-07-15',
    hoursWorked: 6,
    overtimeHours: 0,
    notes: '',
    status: 'Approved',
  },
  {
    id: 'ts3',
    employeeId: 'pe4',
    employeeName: 'Sophie Clarke',
    date: '2026-07-16',
    hoursWorked: 8,
    overtimeHours: 2,
    notes: 'Event service',
    status: 'Submitted',
  },
  {
    id: 'ts4',
    employeeId: 'pe4',
    employeeName: 'Sophie Clarke',
    date: '2026-07-17',
    hoursWorked: 5,
    overtimeHours: 0,
    notes: '',
    status: 'Draft',
  },
];

const julyLines = [
  {
    employeeId: 'pe1',
    employeeName: 'James Walker',
    payBasis: 'Salary £42,000 / yr',
    grossPay: 3500,
    payeTax: 458.2,
    employeeNi: 287.4,
    pension: 175,
    otherDeductions: 0,
    netPay: 2579.4,
  },
  {
    employeeId: 'pe2',
    employeeName: 'Amelia Brown',
    payBasis: 'Salary £38,000 / yr',
    grossPay: 3166.67,
    payeTax: 391.33,
    employeeNi: 254.0,
    pension: 158.33,
    otherDeductions: 0,
    netPay: 2363.01,
  },
  {
    employeeId: 'pe3',
    employeeName: 'Omar Hassan',
    payBasis: '86.5 hrs @ £12.50',
    grossPay: 1081.25,
    payeTax: 64.25,
    employeeNi: 42.1,
    pension: 0,
    otherDeductions: 0,
    netPay: 974.9,
  },
  {
    employeeId: 'pe4',
    employeeName: 'Sophie Clarke',
    payBasis: '52 hrs @ £11.80',
    grossPay: 613.6,
    payeTax: 18.72,
    employeeNi: 12.4,
    pension: 0,
    otherDeductions: 0,
    netPay: 582.48,
  },
];

export const mockPayrollRuns: PayrollRun[] = [
  {
    id: 'pr1',
    period: 'July 2026',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-31',
    payDate: '2026-07-28',
    employeeCount: 4,
    grossPay: 8361.52,
    totalTax: 932.5,
    totalNi: 595.9,
    totalPension: 333.33,
    netPay: 6499.79,
    status: 'Paid',
    lines: julyLines,
  },
  {
    id: 'pr2',
    period: 'August 2026',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    payDate: '2026-08-28',
    employeeCount: 4,
    grossPay: 8361.52,
    totalTax: 932.5,
    totalNi: 595.9,
    totalPension: 333.33,
    netPay: 6499.79,
    status: 'Approved',
    lines: julyLines.map((l) => ({ ...l })),
  },
  {
    id: 'pr3',
    period: 'September 2026',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    payDate: '2026-09-28',
    employeeCount: 4,
    grossPay: 0,
    totalTax: 0,
    totalNi: 0,
    totalPension: 0,
    netPay: 0,
    status: 'Draft',
    lines: [],
  },
];

export const mockPayslips: PayslipRecord[] = julyLines.map((line, i) => ({
  id: `ps${i + 1}`,
  payrollRunId: 'pr1',
  employeeId: line.employeeId,
  employeeName: line.employeeName,
  period: 'July 2026',
  grossPay: line.grossPay,
  payeTax: line.payeTax,
  employeeNi: line.employeeNi,
  pension: line.pension,
  otherDeductions: line.otherDeductions,
  netPay: line.netPay,
  status: i === 0 ? 'Sent' : 'Ready',
}));

export const currentPayrollOverview = {
  period: 'August 2026',
  totalEmployees: 4,
  totalGross: 8361.52,
  totalDeductions: 1861.73,
  totalNet: 6499.79,
  status: 'Approved' as const,
  upcomingPayday: '28 Aug 2026',
};

/** Simple frontend mock of backend payroll calculation for hourly / salary staff. */
export function mockCalculatePayroll(employees: PayrollEmployee[]): PayrollRun['lines'] {
  return employees
    .filter((e) => e.status === 'Active')
    .map((e) => {
      const gross =
        e.payType === 'Salary'
          ? Number((e.salaryOrRate / 12).toFixed(2))
          : Number((e.salaryOrRate * 80).toFixed(2)); // mock monthly hours
      const payeTax = Number((gross * 0.12).toFixed(2));
      const employeeNi = Number((gross * 0.08).toFixed(2));
      const pension = e.pensionEnrolled ? Number((gross * 0.05).toFixed(2)) : 0;
      const otherDeductions = 0;
      const netPay = Number((gross - payeTax - employeeNi - pension - otherDeductions).toFixed(2));
      return {
        employeeId: e.id,
        employeeName: e.name,
        payBasis:
          e.payType === 'Salary'
            ? `Salary £${e.salaryOrRate.toLocaleString()} / yr`
            : `Hourly £${e.salaryOrRate.toFixed(2)} (est. hours)`,
        grossPay: gross,
        payeTax,
        employeeNi,
        pension,
        otherDeductions,
        netPay,
      };
    });
}
