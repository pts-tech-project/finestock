const User = require('./User');
const Company = require('./Company');
const RolePermission = require('./RolePermission');

Company.hasMany(User, {
  foreignKey: 'companyId',
  as: 'users',
});

User.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

module.exports = {
  User,
  Company,
  RolePermission,
};
