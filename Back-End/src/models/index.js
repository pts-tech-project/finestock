const User = require('./User');
const Company = require('./Company');
const Role = require('./Role');
const RolePermission = require('./RolePermission');
const Supplier = require('./Supplier');
const CompanySupplier = require('./CompanySupplier');
const Item = require('./Item');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderLine = require('./PurchaseOrderLine');
const GoodsReceipt = require('./GoodsReceipt');
const GoodsReceiptLine = require('./GoodsReceiptLine');
const StockBalance = require('./StockBalance');
const StockMovement = require('./StockMovement');
const Expense = require('./Expense');
const SupplierInvoice = require('./SupplierInvoice');

Company.hasMany(User, { foreignKey: 'companyId', as: 'users' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.belongsToMany(Supplier, { through: CompanySupplier, foreignKey: 'companyId', otherKey: 'supplierId', as: 'suppliers' });
Supplier.belongsToMany(Company, { through: CompanySupplier, foreignKey: 'supplierId', otherKey: 'companyId', as: 'companies' });
CompanySupplier.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
CompanySupplier.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

Company.hasMany(Item, { foreignKey: 'companyId', as: 'items', onDelete: 'CASCADE' });
Item.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Company.hasMany(PurchaseOrder, { foreignKey: 'companyId', as: 'purchaseOrders', onDelete: 'CASCADE' });
PurchaseOrder.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
PurchaseOrder.hasMany(PurchaseOrderLine, { foreignKey: 'purchaseOrderId', as: 'lines', onDelete: 'CASCADE' });
PurchaseOrderLine.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });
Item.hasMany(PurchaseOrderLine, { foreignKey: 'itemId', as: 'purchaseOrderLines' });
PurchaseOrderLine.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
Company.hasMany(GoodsReceipt, { foreignKey: 'companyId', as: 'goodsReceipts', onDelete: 'CASCADE' });
GoodsReceipt.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
PurchaseOrder.hasMany(GoodsReceipt, { foreignKey: 'purchaseOrderId', as: 'goodsReceipts' });
GoodsReceipt.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });
GoodsReceipt.hasMany(GoodsReceiptLine, { foreignKey: 'goodsReceiptId', as: 'lines', onDelete: 'CASCADE' });
GoodsReceiptLine.belongsTo(GoodsReceipt, { foreignKey: 'goodsReceiptId', as: 'goodsReceipt' });
PurchaseOrderLine.hasMany(GoodsReceiptLine, { foreignKey: 'purchaseOrderLineId', as: 'goodsReceiptLines' });
GoodsReceiptLine.belongsTo(PurchaseOrderLine, { foreignKey: 'purchaseOrderLineId', as: 'purchaseOrderLine' });
Item.hasOne(StockBalance, { foreignKey: 'itemId', as: 'stockBalance' });
StockBalance.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
Item.hasMany(StockMovement, { foreignKey: 'itemId', as: 'stockMovements' });
StockMovement.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
Company.hasMany(Expense, { foreignKey: 'companyId', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Company.hasMany(SupplierInvoice, { foreignKey: 'companyId', as: 'supplierInvoices', onDelete: 'CASCADE' });
SupplierInvoice.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Supplier.hasMany(SupplierInvoice, { foreignKey: 'supplierId', as: 'invoices' });
SupplierInvoice.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
PurchaseOrder.hasMany(SupplierInvoice, { foreignKey: 'purchaseOrderId', as: 'supplierInvoices' });
SupplierInvoice.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });
GoodsReceipt.hasOne(SupplierInvoice, { foreignKey: 'goodsReceiptId', as: 'supplierInvoice' });
SupplierInvoice.belongsTo(GoodsReceipt, { foreignKey: 'goodsReceiptId', as: 'goodsReceipt' });

module.exports = {
  User, Company, Role, RolePermission, Supplier, CompanySupplier, Item,
  PurchaseOrder, PurchaseOrderLine, GoodsReceipt, GoodsReceiptLine,
  StockBalance, StockMovement, Expense, SupplierInvoice,
};
