const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SYSTEM_ROLES = ['Owner', 'Manager', 'Accountant', 'Staff'];

const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_system',
    },
  },
  {
    tableName: 'roles',
    underscored: true,
    timestamps: true,
  }
);

Role.SYSTEM_ROLES = SYSTEM_ROLES;

module.exports = Role;
