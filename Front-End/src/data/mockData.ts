import type {
  Product,
  StockItem,
  StockMovement,
  DailySale,
  SalesImport,
  Supplier,
  PurchaseOrder,
  GoodsReceipt,
  Expense,
  Transaction,
  VatReturn,
  AuditLog,
  User,
  RecipeIngredient,
} from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@restaurant.com',
    role: 'Owner',
    status: 'Active',
    companyId: null,
    modules: ['core', 'hmrc', 'payroll', 'ai'],
  },
  {
    id: '2',
    name: 'Sarah Jones',
    email: 'sarah@restaurant.com',
    role: 'Manager',
    status: 'Active',
    companyId: null,
    modules: ['core'],
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@restaurant.com',
    role: 'Accountant',
    status: 'Active',
    companyId: null,
    modules: ['core', 'hmrc'],
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma@restaurant.com',
    role: 'Staff',
    status: 'Inactive',
    companyId: null,
    modules: ['core'],
  },
];

export const mockProducts: Product[] = [
  { id: '1', itemCode: 'MENU-001', name: 'Chicken Burger', itemType: 'MENU_ITEM', category: 'Food', unit: 'PCS', sellingPrice: 12.99, vatRate: 20, costPerUnit: 3.0, reorderLevel: null, status: 'Active', description: 'Grilled chicken breast burger with cheese' },
  { id: '2', itemCode: 'MENU-002', name: 'Margherita Pizza', itemType: 'MENU_ITEM', category: 'Food', unit: 'PCS', sellingPrice: 11.5, vatRate: 20, costPerUnit: 2.8, reorderLevel: null, status: 'Active' },
  { id: '3', itemCode: 'MENU-003', name: 'Caesar Salad', itemType: 'MENU_ITEM', category: 'Food', unit: 'PCS', sellingPrice: 9.99, vatRate: 20, costPerUnit: 2.2, reorderLevel: null, status: 'Active' },
  { id: '4', itemCode: 'MENU-004', name: 'Cola 330ml', itemType: 'MENU_ITEM', category: 'Drinks', unit: 'PCS', sellingPrice: 2.5, vatRate: 20, costPerUnit: 0.6, reorderLevel: null, status: 'Active' },
  { id: '5', itemCode: 'MENU-005', name: 'House Wine Glass', itemType: 'MENU_ITEM', category: 'Drinks', unit: 'GLASS', sellingPrice: 5.5, vatRate: 20, costPerUnit: 1.4, reorderLevel: null, status: 'Active' },
  { id: '6', itemCode: 'MENU-006', name: 'Tiramisu', itemType: 'MENU_ITEM', category: 'Dessert', unit: 'PCS', sellingPrice: 6.99, vatRate: 20, costPerUnit: 1.8, reorderLevel: null, status: 'Inactive' },
];

export const mockRecipe: RecipeIngredient[] = [
  { id: '1', name: 'Chicken Breast', quantity: '150g', cost: 1.5 },
  { id: '2', name: 'Bread', quantity: '1 piece', cost: 0.3 },
  { id: '3', name: 'Cheese', quantity: '1 slice', cost: 0.2 },
];

export const mockStockItems: StockItem[] = [
  { id: '1', name: 'Chicken Breast', category: 'Meat', quantity: 5, unit: 'KG', costPerUnit: 5, minStock: 10, status: 'Low Stock' },
  { id: '2', name: 'Mozzarella', category: 'Dairy', quantity: 25, unit: 'KG', costPerUnit: 8, minStock: 5, status: 'Available' },
  { id: '3', name: 'Burger Buns', category: 'Bakery', quantity: 80, unit: 'PCS', costPerUnit: 0.25, minStock: 40, status: 'Available' },
  { id: '4', name: 'Lettuce', category: 'Produce', quantity: 0, unit: 'KG', costPerUnit: 2, minStock: 3, status: 'Out of Stock' },
  { id: '5', name: 'Cooking Oil', category: 'Dry Goods', quantity: 12, unit: 'L', costPerUnit: 3.5, minStock: 5, status: 'Available' },
  { id: '6', name: 'Tomatoes', category: 'Produce', quantity: 4, unit: 'KG', costPerUnit: 2.2, minStock: 8, status: 'Low Stock' },
];

export const mockStockMovements: StockMovement[] = [
  { id: '1', date: '22/07/2026', item: 'Chicken Breast', type: 'Purchase', quantity: '+50kg', reference: 'PO1001' },
  { id: '2', date: '22/07/2026', item: 'Chicken Breast', type: 'Sale Usage', quantity: '-8kg', reference: 'SALE-2207' },
  { id: '3', date: '21/07/2026', item: 'Mozzarella', type: 'Purchase', quantity: '+20kg', reference: 'PO1002' },
  { id: '4', date: '21/07/2026', item: 'Lettuce', type: 'Waste', quantity: '-2kg', reference: 'WASTE-03' },
  { id: '5', date: '20/07/2026', item: 'Cooking Oil', type: 'Adjustment', quantity: '-1L', reference: 'ADJ-12' },
];

export const mockDailySales: DailySale[] = [
  { id: '1', date: '22/07/2026', transactions: 250, grossSales: 3500, vat: 700, netSales: 2800, source: 'EPOS', status: 'Imported' },
  { id: '2', date: '21/07/2026', transactions: 230, grossSales: 3120, vat: 624, netSales: 2496, source: 'EPOS', status: 'Imported' },
  { id: '3', date: '20/07/2026', transactions: 275, grossSales: 3890, vat: 778, netSales: 3112, source: 'EPOS', status: 'Imported' },
  { id: '4', date: '19/07/2026', transactions: 198, grossSales: 2650, vat: 530, netSales: 2120, source: 'EPOS', status: 'Imported' },
  { id: '5', date: '18/07/2026', transactions: 310, grossSales: 4200, vat: 840, netSales: 3360, source: 'EPOS', status: 'Imported' },
];

export const mockSalesImports: SalesImport[] = [
  { id: '1', fileName: 'epos_sales_22072026.csv', uploadDate: '22/07/2026 09:15', records: 250, status: 'Success', method: 'csv' },
  { id: '2', fileName: 'epos_sales_21072026.xlsx', uploadDate: '21/07/2026 09:02', records: 230, status: 'Success', method: 'csv' },
  { id: '3', fileName: 'epos_sales_20072026.csv', uploadDate: '20/07/2026 09:30', records: 0, status: 'Failed', method: 'csv' },
];

export const mockSuppliers: Supplier[] = [
  { id: '1', supplierCode: 'SUP-001', name: 'Fresh Foods Ltd', contact: 'David Brown', email: 'david@freshfoods.co.uk', phone: '020 7123 4567', vatNumber: 'GB123456789', openingBalance: 1250, balance: 1250, status: 'Active', paymentTerms: 'Net 30' },
  { id: '2', supplierCode: 'SUP-002', name: 'Dairy Direct', contact: 'Lisa Green', email: 'lisa@dairydirect.com', phone: '0161 987 6543', vatNumber: 'GB987654321', openingBalance: 480, balance: 480, status: 'Active', paymentTerms: 'Net 14' },
  { id: '3', supplierCode: 'SUP-003', name: 'Beverage Wholesale', contact: 'Tom Hughes', email: 'tom@bevwholesale.com', phone: '0113 555 1212', vatNumber: 'GB555121234', openingBalance: 0, balance: 0, status: 'Active', paymentTerms: 'Net 30' },
  { id: '4', supplierCode: 'SUP-004', name: 'Old Supplier Co', contact: 'Jane Doe', email: 'jane@oldsup.com', phone: '020 1111 2222', vatNumber: 'GB111222333', openingBalance: 0, balance: 0, status: 'Inactive' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: '1', poNumber: 'PO-2026-00001', supplierId: null, supplierName: 'Fresh Foods Ltd', orderDate: '2026-07-20', expectedDeliveryDate: null, notes: null, subtotal: 708.33, vatAmount: 141.67, totalAmount: 850, receivedAmount: 850, balanceAmount: 0, approvedAt: '2026-07-20', status: 'RECEIVED', lines: [] },
];

export const mockGoodsReceipts: GoodsReceipt[] = [];

export const mockExpenses: Expense[] = [
  { id: '1', expenseNumber: 'EXP-2026-00001', expenseDate: '2026-07-01', category: 'Rent', description: 'Monthly restaurant rent', netAmount: 4500, vatAmount: 0, grossAmount: 4500, paymentMethod: 'Bank Transfer', status: 'APPROVED' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', date: '22/07/2026', type: 'Purchase', description: 'Food Supplier Invoice', amount: 500, status: 'Paid' },
  { id: '2', date: '22/07/2026', type: 'Sale', description: 'EPOS Daily Sales', amount: 3500, status: 'Imported' },
  { id: '3', date: '21/07/2026', type: 'Expense', description: 'Utilities Payment', amount: 680, status: 'Paid' },
  { id: '4', date: '20/07/2026', type: 'Purchase', description: 'Dairy Direct Invoice', amount: 420, status: 'Pending' },
];

export const mockVatReturns: VatReturn[] = [
  { id: '1', period: 'Q1 2026', startDate: '01/01/2026', endDate: '31/03/2026', amount: 5800, status: 'Accepted' },
  { id: '2', period: 'Q2 2026', startDate: '01/04/2026', endDate: '30/06/2026', amount: 6200, status: 'Submitted' },
  { id: '3', period: 'Q3 2026', startDate: '01/07/2026', endDate: '30/09/2026', amount: 6000, status: 'Draft' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: '1', date: '22/07/2026 14:32', user: 'John Smith', action: 'Updated Product', module: 'Inventory', description: 'Changed stock level for Chicken Breast' },
  { id: '2', date: '22/07/2026 10:15', user: 'Sarah Jones', action: 'Imported Sales', module: 'Sales', description: 'Imported epos_sales_22072026.csv' },
  { id: '3', date: '21/07/2026 16:45', user: 'Mike Chen', action: 'Created PO', module: 'Purchases', description: 'Created purchase order PO1003' },
  { id: '4', date: '21/07/2026 09:20', user: 'John Smith', action: 'Added Expense', module: 'Expenses', description: 'Added fridge repair expense' },
  { id: '5', date: '20/07/2026 11:00', user: 'Sarah Jones', action: 'Updated Supplier', module: 'Suppliers', description: 'Updated Fresh Foods Ltd contact details' },
];

export const salesChartData = [
  { date: '1 Jul', sales: 2800 },
  { date: '4 Jul', sales: 3100 },
  { date: '7 Jul', sales: 2650 },
  { date: '10 Jul', sales: 3400 },
  { date: '13 Jul', sales: 3900 },
  { date: '16 Jul', sales: 3200 },
  { date: '19 Jul', sales: 2650 },
  { date: '22 Jul', sales: 3500 },
];

export const expenseChartData = [
  { category: 'Food', amount: 12500 },
  { category: 'Utilities', amount: 2100 },
  { category: 'Rent', amount: 4500 },
  { category: 'Other', amount: 1800 },
];

export const monthlySalesData = [
  { month: 'Jan', sales: 38000 },
  { month: 'Feb', sales: 36000 },
  { month: 'Mar', sales: 41000 },
  { month: 'Apr', sales: 39500 },
  { month: 'May', sales: 43000 },
  { month: 'Jun', sales: 45000 },
  { month: 'Jul', sales: 28000 },
];
