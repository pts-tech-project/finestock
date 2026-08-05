const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupplierInvoice = sequelize.define('SupplierInvoice', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId: { type: DataTypes.UUID, allowNull: false },
  supplierId: { type: DataTypes.UUID, allowNull: true },
  supplierName: { type: DataTypes.STRING(200), allowNull: false },
  purchaseOrderId: { type: DataTypes.UUID, allowNull: false },
  goodsReceiptId: { type: DataTypes.UUID, allowNull: false },
  invoiceNumber: { type: DataTypes.STRING(100), allowNull: false },
  invoiceDate: { type: DataTypes.DATEONLY, allowNull: false },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  netAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  vatAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  paidAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  balanceAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('DRAFT', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'DRAFT',
  },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  approvedBy: { type: DataTypes.UUID, allowNull: true },
  attachmentOriginalName: { type: DataTypes.STRING(255), allowNull: true },
  attachmentStoredName: { type: DataTypes.STRING(100), allowNull: true },
  attachmentMimeType: { type: DataTypes.STRING(100), allowNull: true },
  attachmentSize: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  attachmentSha256: { type: DataTypes.STRING(64), allowNull: true },
}, {
  tableName: 'supplier_invoices',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['companyId', 'supplierName', 'invoiceNumber'] },
    { unique: true, fields: ['companyId', 'goodsReceiptId'] },
    { fields: ['companyId', 'status'] },
    { fields: ['companyId', 'invoiceDate'] },
  ],
});

module.exports = SupplierInvoice;
