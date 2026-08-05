const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId: { type: DataTypes.UUID, allowNull: false },
  expenseNumber: { type: DataTypes.STRING(50), allowNull: false },
  expenseDate: { type: DataTypes.DATEONLY, allowNull: false },
  category: { type: DataTypes.ENUM('Rent', 'Utilities', 'Cleaning', 'Maintenance', 'Other'), allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: false },
  netAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  vatAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  grossAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  paymentMethod: { type: DataTypes.ENUM('Cash', 'Card', 'Bank Transfer', 'Direct Debit', 'Other'), allowNull: false, defaultValue: 'Bank Transfer' },
  status: { type: DataTypes.ENUM('DRAFT', 'APPROVED'), allowNull: false, defaultValue: 'DRAFT' },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  approvedBy: { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'expenses', timestamps: true, indexes: [{ unique: true, fields: ['companyId', 'expenseNumber'] }, { fields: ['companyId', 'status'] }] });

module.exports = Expense;
