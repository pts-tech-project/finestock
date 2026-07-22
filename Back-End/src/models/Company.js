const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define(
  'Company',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    tradingName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'trading_name',
    },
    addressLine1: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'address_line1',
    },
    addressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'address_line2',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postcode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'United Kingdom',
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    vatNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'vat_number',
    },
    companyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'company_number',
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'GBP',
    },
    financialYear: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'financial_year',
      defaultValue: 'April – March',
    },
    vatScheme: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'vat_scheme',
      defaultValue: 'Standard',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'companies',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Company;
