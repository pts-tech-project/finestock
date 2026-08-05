const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GoodsReceiptLine = sequelize.define('GoodsReceiptLine', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  goodsReceiptId: { type: DataTypes.UUID, allowNull: false },
  purchaseOrderLineId: { type: DataTypes.UUID, allowNull: false },
  itemId: { type: DataTypes.UUID, allowNull: false },
  itemCode: { type: DataTypes.STRING(50), allowNull: false },
  itemName: { type: DataTypes.STRING(150), allowNull: false },
  unit: { type: DataTypes.STRING(30), allowNull: false },
  quantityReceived: { type: DataTypes.DECIMAL(14, 3), allowNull: false },
  unitCost: { type: DataTypes.DECIMAL(14, 4), allowNull: false },
  lineAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
}, { tableName: 'goods_receipt_lines', timestamps: true, indexes: [{ fields: ['goodsReceiptId'] }, { fields: ['purchaseOrderLineId'] }] });

module.exports = GoodsReceiptLine;
