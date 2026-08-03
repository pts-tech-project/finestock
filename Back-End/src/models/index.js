const User = require('./User');
const Company = require('./Company');
const Role = require('./Role');
const RolePermission = require('./RolePermission');
const Supplier = require('./Supplier');
const CompanySupplier = require('./CompanySupplier');

Company.hasMany(User, {
  foreignKey: 'companyId',
  as: 'users',
});

User.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

Company.belongsToMany(Supplier, {
  through: CompanySupplier,
  foreignKey: 'companyId',
  otherKey: 'supplierId',
  as: 'suppliers',
});

Supplier.belongsToMany(Company, {
  through: CompanySupplier,
  foreignKey: 'supplierId',
  otherKey: 'companyId',
  as: 'companies',
});

CompanySupplier.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

CompanySupplier.belongsTo(Supplier, {
  foreignKey: 'supplierId',
  as: 'supplier',
});

module.exports = {
  User,
  Company,
  Role,
  RolePermission,
  Supplier,
  CompanySupplier,
};
