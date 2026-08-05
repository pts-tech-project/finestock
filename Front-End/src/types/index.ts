export type UserRole = string;

export type ModuleId = 'core' | 'hmrc' | 'payroll' | 'ai';

export interface AppModule {
  id: ModuleId;
  name: string;
  description: string;
  /** Included in base purchase vs requires additional payment */
  billing: 'included' | 'add-on';
  homePath: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  companyId: string | null;
  /** Modules unlocked for this account’s subscription */
  modules: ModuleId[];
}

export interface CompanyProfile {
  id?: string;
  name: string;
  tradingName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  vatNumber: string;
  companyNumber: string;
  currency: string;
  financialYear: string;
  vatScheme: string;
  notes: string;
}

export interface Product {
  id: string;
  itemCode: string;
  name: string;
  itemType: 'INGREDIENT' | 'MENU_ITEM';
  category: string;
  unit: string;
  sellingPrice: number | null;
  vatRate: number | null;
  costPerUnit: number | null;
  reorderLevel: number | null;
  status: 'Active' | 'Inactive';
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  cost: number;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  minStock: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
}

export interface StockMovement {
  id: string;
  date: string;
  item: string;
  type: 'Purchase' | 'Sale Usage' | 'Adjustment' | 'Waste';
  quantity: string;
  reference: string;
}

export interface DailySale {
  id: string;
  date: string;
  transactions: number;
  grossSales: number;
  vat: number;
  netSales: number;
  source: string;
  status: 'Imported' | 'Pending' | 'Error';
  tips?: number;
  fees?: number;
  averageOrder?: number;
  categories?: SquareCategorySale[];
}

export type SalesImportMethod = 'csv' | 'txt' | 'screenshot';

export interface SquareCategorySale {
  category: string;
  itemsSold: number;
  netSales: number;
}

export interface SquareParsedReport {
  businessName?: string;
  date: string;
  period?: string;
  netSales: number;
  grossSales: number;
  taxes: number;
  tips: number;
  fees: number;
  totalSales: number;
  totalOrders: number;
  averageOrder: number;
  categories: SquareCategorySale[];
  orderSource?: string;
}

export interface SalesImport {
  id: string;
  fileName: string;
  uploadDate: string;
  records: number;
  status: 'Success' | 'Failed' | 'Processing';
  method?: SalesImportMethod;
  report?: SquareParsedReport;
}

export interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  vatNumber: string | null;
  openingBalance: number;
  balance: number;
  status: 'Active' | 'Inactive';
  address?: string | null;
  paymentTerms?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string | null;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  notes: string | null;
  status: 'DRAFT' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  receivedAmount: number;
  balanceAmount: number;
  approvedAt: string | null;
  lines: PurchaseOrderLine[];
}

export interface PurchaseOrderLine {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  balanceQuantity: number;
  unitPrice: number;
  vatRate: number;
  lineSubtotal: number;
  vatAmount: number;
  lineTotal: number;
  receivedAmount: number;
  balanceAmount: number;
  item?: Product;
}

export interface GoodsReceipt {
  id: string;
  purchaseOrderId: string;
  grnNumber: string;
  receiptDate: string;
  deliveryNoteNumber: string | null;
  notes: string | null;
  status: 'DRAFT' | 'APPROVED';
  totalAmount: number;
  approvedAt: string | null;
  purchaseOrder: { id: string; poNumber: string; supplierName: string; status: PurchaseOrder['status'] };
  lines: GoodsReceiptLine[];
  invoiceExpected?: { netAmount: number; vatAmount: number; totalAmount: number };
}

export interface GoodsReceiptLine {
  id: string;
  purchaseOrderLineId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  quantityReceived: number;
  unitCost: number;
  lineAmount: number;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string | null;
  supplierName: string;
  purchaseOrderId: string;
  goodsReceiptId: string;
  invoiceDate: string;
  dueDate: string | null;
  notes: string | null;
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
  approvedAt: string | null;
  attachmentOriginalName: string | null;
  attachmentMimeType: string | null;
  attachmentSize: number | null;
  attachmentSha256: string | null;
  goodsReceipt: { id: string; grnNumber: string; receiptDate: string; totalAmount: number; status: GoodsReceipt['status'] };
  purchaseOrder: { id: string; poNumber: string; supplierId: string | null; supplierName: string };
}

export interface Expense {
  id: string;
  expenseNumber: string;
  expenseDate: string;
  category: 'Rent' | 'Utilities' | 'Cleaning' | 'Maintenance' | 'Other';
  description: string;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Direct Debit' | 'Other';
  status: 'DRAFT' | 'APPROVED';
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  status: string;
}

export interface VatReturn {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'Draft' | 'Submitted' | 'Accepted';
}

export interface AuditLog {
  id: string;
  date: string;
  user: string;
  action: string;
  module: string;
  description: string;
}

export interface NavItem {
  label: string;
  path?: string;
  icon?: string;
  children?: { label: string; path: string }[];
}

/* ── Payroll module ─────────────────────────────────────────── */

export type EmploymentType = 'Full-time' | 'Part-time' | 'Casual';
export type PayType = 'Salary' | 'Hourly';
export type PayFrequency = 'Weekly' | 'Fortnightly' | 'Monthly';
export type PayrollEmployeeStatus = 'Active' | 'Inactive';
export type TimesheetStatus = 'Draft' | 'Submitted' | 'Approved';
export type PayrollRunStatus = 'Draft' | 'Calculated' | 'Approved' | 'Paid';
export type DashboardPayrollStatus = 'Draft' | 'Approved' | 'Completed';

export interface PayrollEmployee {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  startDate: string;
  employmentType: EmploymentType;
  payType: PayType;
  salaryOrRate: number;
  payFrequency: PayFrequency;
  taxCode: string;
  niNumber: string;
  bankAccount: string;
  pensionEnrolled: boolean;
  status: PayrollEmployeeStatus;
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hoursWorked: number;
  overtimeHours: number;
  notes: string;
  status: TimesheetStatus;
}

export interface PayrollLineItem {
  employeeId: string;
  employeeName: string;
  payBasis: string;
  grossPay: number;
  payeTax: number;
  employeeNi: number;
  pension: number;
  otherDeductions: number;
  netPay: number;
}

export interface PayrollRun {
  id: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  employeeCount: number;
  grossPay: number;
  totalTax: number;
  totalNi: number;
  totalPension: number;
  netPay: number;
  status: PayrollRunStatus;
  lines: PayrollLineItem[];
}

export interface PayslipRecord {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  period: string;
  grossPay: number;
  payeTax: number;
  employeeNi: number;
  pension: number;
  otherDeductions: number;
  netPay: number;
  status: 'Ready' | 'Sent';
}

