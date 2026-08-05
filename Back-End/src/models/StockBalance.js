const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockBalance = sequelize.define('StockBalance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId: { type: DataTypes.UUID, allowNull: false },
  itemId: { type: DataTypes.UUID, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(14, 3), allowNull: false, defaultValue: 0 },
  averageCost: { type: DataTypes.DECIMAL(14, 4), allowNull: false, defaultValue: 0 },
  lastMovementAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'stock_balances', timestamps: true, indexes: [{ unique: true, fields: ['companyId', 'itemId'] }] });

module.exports = StockBalance;
