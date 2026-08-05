const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ROLES = ['Owner', 'Manager', 'Accountant', 'Staff'];
const STATUSES = ['Active', 'Inactive'];

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    role: {
      // STRING so custom roles can be assigned (was ENUM)
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'Staff',
    },
    status: {
      type: DataTypes.ENUM(...STATUSES),
      allowNull: false,
      defaultValue: 'Active',
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'company_id',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
    passwordResetToken: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'password_reset_token',
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_reset_expires',
    },
  },
  {
    tableName: 'users',
    underscored: true,
    timestamps: true,
  }
);

User.ROLES = ROLES; // system roles (legacy); custom roles live in `roles` table
User.SYSTEM_ROLES = ROLES;
User.STATUSES = STATUSES;

User.prototype.toSafeJSON = function toSafeJSON() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    companyId: this.companyId,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = User;
