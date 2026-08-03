const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define(
  'Item',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    itemCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    itemType: {
      type: DataTypes.ENUM('INGREDIENT', 'MENU_ITEM'),
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    unit: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    sellingPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    costPerUnit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    reorderLevel: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: true,
    },

    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
  },
  {
    tableName: 'items',
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ['companyId', 'itemCode'],
      },
      {
        fields: ['companyId', 'itemType'],
      },
      {
        fields: ['companyId', 'status'],
      },
    ],
  }
);

module.exports = Item;