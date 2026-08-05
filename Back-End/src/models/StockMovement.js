const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockMovement = sequelize.define('StockMovement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId: { type: DataTypes.UUID, allowNull: false },
  itemId: { type: DataTypes.UUID, allowNull: false },
  movementType: { type: DataTypes.ENUM('PURCHASE_RECEIPT', 'ADJUSTMENT', 'USAGE', 'WASTE'), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(14, 3), allowNull: false },
  unitCost: { type: DataTypes.DECIMAL(14, 4), allowNull: false },
  totalCost: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  referenceType: { type: DataTypes.STRING(50), allowNull: false },
  referenceId: { type: DataTypes.UUID, allowNull: false },
  referenceNumber: { type: DataTypes.STRING(50), allowNull: false },
  movementDate: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'stock_movements', timestamps: true, indexes: [{ unique: true, fields: ['referenceId', 'itemId'] }, { fields: ['companyId', 'movementDate'] }] });

module.exports = StockMovement;
