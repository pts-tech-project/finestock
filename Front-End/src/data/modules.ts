import type { AppModule, ModuleId, NavItem } from '../types';

export const ALL_MODULES: ModuleId[] = ['core', 'hmrc', 'payroll', 'ai'];

export const APP_MODULES: AppModule[] = [
  {
    id: 'core',
    name: 'Restaurant Finance',
    description: 'Sales, inventory, purchasing, expenses, reports and company settings.',
    billing: 'included',
    homePath: '/dashboard',
  },
  {
    id: 'hmrc',
    name: 'HMRC',
    description: 'Corporation Tax, VAT returns and PAYE Online for employers.',
    billing: 'add-on',
    homePath: '/hmrc',
  },
  {
    id: 'payroll',
    name: 'Payroll Management',
    description: 'Run payroll, manage employees and submit payroll data.',
    billing: 'add-on',
    homePath: '/payroll',
  },
  {
    id: 'ai',
    name: 'AI Assistant',
    description: 'AI-powered insights and automation for your restaurant finances.',
    billing: 'add-on',
    homePath: '/ai',
  },
];

export const coreNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  {
    label: 'Sales',
    icon: 'sales',
    children: [
      { label: 'Daily Sales', path: '/sales/daily' },
      { label: 'Sales Import', path: '/sales/import' },
    ],
  },
  {
    label: 'Inventory',
    icon: 'inventory',
    children: [
      { label: 'Products', path: '/products' },
      { label: 'Stock Items', path: '/inventory' },
      { label: 'Stock Movements', path: '/inventory/movements' },
    ],
  },
  {
    label: 'Purchasing',
    icon: 'purchasing',
    children: [
      { label: 'Suppliers', path: '/suppliers' },
      { label: 'Purchase Orders', path: '/purchase-orders' },
      { label: 'Goods Receipt', path: '/goods-receipt' },
      { label: 'Supplier Invoices', path: '/supplier-invoices' },
    ],
  },
  { label: 'Expenses', path: '/expenses', icon: 'expenses' },
  { label: 'Reports', path: '/reports', icon: 'reports' },
  {
    label: 'Settings',
    icon: 'settings',
    children: [
      { label: 'My Profile', path: '/settings/profile' },
      { label: 'Company Profile', path: '/settings/company' },
      { label: 'Users', path: '/settings/users' },
      { label: 'Roles & Permissions', path: '/settings/roles' },
    ],
  },
  { label: 'Audit Logs', path: '/audit', icon: 'audit' },
];

export const hmrcNavItems: NavItem[] = [
  { label: 'HMRC Overview', path: '/hmrc', icon: 'hmrc' },
  { label: 'Corporation Tax', path: '/hmrc/corporation-tax', icon: 'corporation' },
  { label: 'VAT Return', path: '/hmrc/vat-return', icon: 'vat' },
  { label: 'PAYE', path: '/hmrc/paye', icon: 'paye' },
];

export const payrollNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/payroll', icon: 'dashboard' },
  { label: 'Employees', path: '/payroll/employees', icon: 'employees' },
  { label: 'Timesheets', path: '/payroll/timesheets', icon: 'timesheet' },
  { label: 'Payroll Run', path: '/payroll/runs', icon: 'payroll' },
  { label: 'Payslips', path: '/payroll/payslips', icon: 'payslip' },
  { label: 'Reports', path: '/payroll/reports', icon: 'reports' },
];

export const aiNavItems: NavItem[] = [
  { label: 'AI Assistant', path: '/ai', icon: 'ai' },
];

export function navForModule(moduleId: ModuleId): NavItem[] {
  switch (moduleId) {
    case 'hmrc':
      return hmrcNavItems;
    case 'payroll':
      return payrollNavItems;
    case 'ai':
      return aiNavItems;
    case 'core':
    default:
      return coreNavItems;
  }
}
