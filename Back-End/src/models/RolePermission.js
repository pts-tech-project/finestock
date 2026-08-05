const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SYSTEM_ROLES = ['Owner', 'Manager', 'Accountant', 'Staff'];

const PERMISSIONS = [
  'View Sales',
  'Manage Inventory',
  'Manage Suppliers',
  'Create Purchase',
  'Approve Purchase',
  'Receive Goods',
  'Approve Goods Receipt',
  'Manage Supplier Invoices',
  'Approve Supplier Invoices',
  'Manage Expenses',
  'Approve Expenses',
  'View Reports',
  'Submit VAT',
];

const DEFAULT_PERMISSIONS = {
  Owner: {
    'View Sales': true,
    'Manage Inventory': true,
    'Manage Suppliers': true,
    'Create Purchase': true,
    'Approve Purchase': true,
    'Receive Goods': true,
    'Approve Goods Receipt': true,
    'Manage Supplier Invoices': true,
    'Approve Supplier Invoices': true,
    'Manage Expenses': true,
    'Approve Expenses': true,
    'View Reports': true,
    'Submit VAT': true,
  },
  Manager: {
    'View Sales': true,
    'Manage Inventory': true,
    'Manage Suppliers': true,
    'Create Purchase': true,
    'Approve Purchase': true,
    'Receive Goods': true,
    'Approve Goods Receipt': true,
    'Manage Supplier Invoices': true,
    'Approve Supplier Invoices': true,
    'Manage Expenses': true,
    'Approve Expenses': true,
    'View Reports': true,
    'Submit VAT': false,
  },
  Accountant: {
    'View Sales': true,
    'Manage Inventory': false,
    'Manage Suppliers': false,
    'Create Purchase': false,
    'Approve Purchase': false,
    'Receive Goods': false,
    'Approve Goods Receipt': false,
    'Manage Supplier Invoices': true,
    'Approve Supplier Invoices': true,
    'Manage Expenses': true,
    'Approve Expenses': true,
    'View Reports': true,
    'Submit VAT': true,
  },
  Staff: {
    'View Sales': true,
    'Manage Inventory': true,
    'Manage Suppliers': false,
    'Create Purchase': false,
    'Approve Purchase': false,
    'Receive Goods': true,
    'Approve Goods Receipt': false,
    'Manage Supplier Invoices': false,
    'Approve Supplier Invoices': false,
    'Manage Expenses': false,
    'Approve Expenses': false,
    'View Reports': false,
    'Submit VAT': false,
  },
};

const RolePermission = sequelize.define(
  'RolePermission',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role: {
      // STRING so custom roles can be created (was ENUM)
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    permission: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'role_permissions',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['role', 'permission'],
      },
    ],
  }
);

RolePermission.SYSTEM_ROLES = SYSTEM_ROLES;
RolePermission.ROLES = SYSTEM_ROLES; // legacy alias
RolePermission.PERMISSIONS = PERMISSIONS;
RolePermission.DEFAULT_PERMISSIONS = DEFAULT_PERMISSIONS;

module.exports = RolePermission;
