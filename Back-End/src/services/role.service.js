const { RolePermission } = require('../models');

function emptyMatrix() {
  const matrix = {};
  for (const role of RolePermission.ROLES) {
    matrix[role] = {};
    for (const permission of RolePermission.PERMISSIONS) {
      matrix[role][permission] = false;
    }
  }
  return matrix;
}

async function seedDefaultsIfEmpty() {
  const count = await RolePermission.count();
  if (count > 0) return { seeded: false, count };

  const rows = [];
  for (const role of RolePermission.ROLES) {
    for (const permission of RolePermission.PERMISSIONS) {
      rows.push({
        role,
        permission,
        allowed: Boolean(RolePermission.DEFAULT_PERMISSIONS[role]?.[permission]),
      });
    }
  }

  await RolePermission.bulkCreate(rows);
  return { seeded: true, count: rows.length };
}

async function getPermissionsMatrix() {
  await seedDefaultsIfEmpty();

  const rows = await RolePermission.findAll();
  const matrix = emptyMatrix();

  for (const row of rows) {
    if (matrix[row.role] && RolePermission.PERMISSIONS.includes(row.permission)) {
      matrix[row.role][row.permission] = Boolean(row.allowed);
    }
  }

  return matrix;
}

async function getRolePermissions(role) {
  if (!RolePermission.ROLES.includes(role)) {
    const err = new Error(`Role must be one of: ${RolePermission.ROLES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const matrix = await getPermissionsMatrix();
  return matrix[role];
}

async function updateRolePermissions(role, permissionsInput) {
  if (!RolePermission.ROLES.includes(role)) {
    const err = new Error(`Role must be one of: ${RolePermission.ROLES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  if (!permissionsInput || typeof permissionsInput !== 'object') {
    const err = new Error('permissions object is required');
    err.status = 400;
    throw err;
  }

  await seedDefaultsIfEmpty();

  for (const permission of RolePermission.PERMISSIONS) {
    if (permissionsInput[permission] === undefined) continue;

    const allowed = Boolean(permissionsInput[permission]);
    const [row] = await RolePermission.findOrCreate({
      where: { role, permission },
      defaults: { allowed },
    });

    if (row.allowed !== allowed) {
      row.allowed = allowed;
      await row.save();
    }
  }

  return getRolePermissions(role);
}

async function getPermissionsForRole(role) {
  const perms = await getRolePermissions(role);
  return RolePermission.PERMISSIONS.filter((p) => perms[p]);
}

module.exports = {
  seedDefaultsIfEmpty,
  getPermissionsMatrix,
  getRolePermissions,
  updateRolePermissions,
  getPermissionsForRole,
};
