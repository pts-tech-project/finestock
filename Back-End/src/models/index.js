const User = require('./User');
const Company = require('./Company');
const RolePermission = require('./RolePermission');
const Item = require('./Item');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderLine = require('./PurchaseOrderLine');
const GoodsReceipt = require('./GoodsReceipt');
const GoodsReceiptLine = require('./GoodsReceiptLine');
const StockBalance = require('./StockBalance');
const StockMovement = require('./StockMovement');

Company.hasMany(User, {
  foreignKey: 'companyId',
  as: 'users',
});

User.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

Company.hasMany(Item, {
  foreignKey: 'companyId',
  as: 'items',
  onDelete: 'CASCADE',
});

Item.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

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

module.exports = {
  User,
  Company,
  RolePermission,
  Item,
  PurchaseOrder,
  PurchaseOrderLine,
  GoodsReceipt,
  GoodsReceiptLine,
  StockBalance,
  StockMovement,
};
