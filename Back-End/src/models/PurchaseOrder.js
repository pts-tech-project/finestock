const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId: { type: DataTypes.UUID, allowNull: false },
  supplierId: { type: DataTypes.UUID, allowNull: true },
  supplierName: { type: DataTypes.STRING(200), allowNull: false },
  poNumber: { type: DataTypes.STRING(50), allowNull: false },
  orderDate: { type: DataTypes.DATEONLY, allowNull: false },
  expectedDeliveryDate: { type: DataTypes.DATEONLY, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('DRAFT', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'DRAFT',
  },
  subtotal: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  vatAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  receivedAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  balanceAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  approvedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'purchase_orders',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['companyId', 'poNumber'] },
    { fields: ['companyId', 'status'] },
    { fields: ['companyId', 'orderDate'] },
  ],
});

module.exports = PurchaseOrder;
