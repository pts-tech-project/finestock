const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GoodsReceipt = sequelize.define('GoodsReceipt', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId: { type: DataTypes.UUID, allowNull: false },
  purchaseOrderId: { type: DataTypes.UUID, allowNull: false },
  grnNumber: { type: DataTypes.STRING(50), allowNull: false },
  receiptDate: { type: DataTypes.DATEONLY, allowNull: false },
  deliveryNoteNumber: { type: DataTypes.STRING(100), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('DRAFT', 'APPROVED'), allowNull: false, defaultValue: 'DRAFT' },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  approvedBy: { type: DataTypes.UUID, allowNull: true },
  totalAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
}, {
  tableName: 'goods_receipts', timestamps: true,
  indexes: [
    { unique: true, fields: ['companyId', 'grnNumber'] },
    { fields: ['companyId', 'status'] },
    { fields: ['purchaseOrderId'] },
  ],
});

module.exports = GoodsReceipt;
