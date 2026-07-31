const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanySupplier = sequelize.define(
  'CompanySupplier',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'company_id',
    },

    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'supplier_id',
    },

    supplierCode: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'supplier_code',
    },

    paymentTerms: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Net 30',
      field: 'payment_terms',
    },

    openingBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'opening_balance',
    },

    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
  },
  {
    tableName: 'company_suppliers',
    underscored: true,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'supplier_code'],
        },
    ],
  },
);

module.exports = CompanySupplier;