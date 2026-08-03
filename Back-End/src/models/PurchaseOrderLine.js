const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrderLine = sequelize.define('PurchaseOrderLine', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  purchaseOrderId: { type: DataTypes.UUID, allowNull: false },
  itemId: { type: DataTypes.UUID, allowNull: false },
  itemCode: { type: DataTypes.STRING(50), allowNull: false },
  itemName: { type: DataTypes.STRING(150), allowNull: false },
  unit: { type: DataTypes.STRING(30), allowNull: false },
  orderedQuantity: { type: DataTypes.DECIMAL(14, 3), allowNull: false },
  receivedQuantity: { type: DataTypes.DECIMAL(14, 3), allowNull: false, defaultValue: 0 },
  balanceQuantity: { type: DataTypes.DECIMAL(14, 3), allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(14, 4), allowNull: false },
  vatRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
  lineSubtotal: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  vatAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  lineTotal: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  receivedAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  balanceAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
}, {
  tableName: 'purchase_order_lines',
  timestamps: true,
  indexes: [{ fields: ['purchaseOrderId'] }, { fields: ['itemId'] }],
});

module.exports = PurchaseOrderLine;
