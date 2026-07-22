export type UserRole = 'Owner' | 'Manager' | 'Accountant' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  vatRate: number;
  cost: number;
  status: 'Active' | 'Inactive';
  description?: string;
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
}

export interface SalesImport {
  id: string;
  fileName: string;
  uploadDate: string;
  records: number;
  status: 'Success' | 'Failed' | 'Processing';
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  vatNumber: string;
  balance: number;
  status: 'Active' | 'Inactive';
  address?: string;
  paymentTerms?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  date: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Completed' | 'Cancelled';
}

export interface GoodsReceipt {
  id: string;
  poNumber: string;
  supplier: string;
  expectedItems: number;
  receivedItems: number;
  status: 'Pending' | 'Partial' | 'Complete';
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  date: string;
  amount: number;
  vat: number;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface Expense {
  id: string;
  date: string;
  category: 'Rent' | 'Utilities' | 'Cleaning' | 'Maintenance' | 'Other';
  description: string;
  amount: number;
  vat: number;
  status: 'Paid' | 'Pending';
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
