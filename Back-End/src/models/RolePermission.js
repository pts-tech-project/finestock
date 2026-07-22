const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ROLES = ['Owner', 'Manager', 'Accountant', 'Staff'];

const PERMISSIONS = [
  'View Sales',
  'Manage Inventory',
  'Create Purchase',
  'View Reports',
  'Submit VAT',
];

const DEFAULT_PERMISSIONS = {
  Owner: {
    'View Sales': true,
    'Manage Inventory': true,
    'Create Purchase': true,
    'View Reports': true,
    'Submit VAT': true,
  },
  Manager: {
    'View Sales': true,
    'Manage Inventory': true,
    'Create Purchase': true,
    'View Reports': true,
    'Submit VAT': false,
  },
  Accountant: {
    'View Sales': true,
    'Manage Inventory': false,
    'Create Purchase': false,
    'View Reports': true,
    'Submit VAT': true,
  },
  Staff: {
    'View Sales': true,
    'Manage Inventory': true,
    'Create Purchase': false,
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
      type: DataTypes.ENUM(...ROLES),
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

RolePermission.ROLES = ROLES;
RolePermission.PERMISSIONS = PERMISSIONS;
RolePermission.DEFAULT_PERMISSIONS = DEFAULT_PERMISSIONS;

module.exports = RolePermission;
