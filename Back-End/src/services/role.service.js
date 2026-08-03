const { Role, RolePermission, User } = require('../models');

let systemRolesPromise = null;
let defaultsSeeded = false;

async function ensureSystemRoles() {
  if (!systemRolesPromise) {
    systemRolesPromise = (async () => {
      const existing = await Role.findAll({
        where: { name: Role.SYSTEM_ROLES },
      });
      const have = new Set(existing.map((r) => r.name));
      const missing = Role.SYSTEM_ROLES.filter((name) => !have.has(name));
      if (missing.length) {
        await Role.bulkCreate(
          missing.map((name) => ({ name, isSystem: true })),
          { ignoreDuplicates: true }
        );
      }
    })().catch((err) => {
      systemRolesPromise = null;
      throw err;
    });
  }
  await systemRolesPromise;
}

async function listRoleNames() {
  await ensureSystemRoles();
  const roles = await Role.findAll({
    attributes: ['name'],
    order: [['name', 'ASC']],
  });
  return roles.map((r) => r.name);
}

async function roleExists(name) {
  await ensureSystemRoles();
  const role = await Role.findOne({
    attributes: ['id'],
    where: { name },
  });
  return Boolean(role);
}

function emptyPermissions() {
  const map = {};
  for (const permission of RolePermission.PERMISSIONS) {
    map[permission] = false;
  }
  return map;
}

async function seedDefaultsIfEmpty() {
  if (defaultsSeeded) return { seeded: false, count: 0 };

  await ensureSystemRoles();
  const existing = await RolePermission.findAll({ attributes: ['role', 'permission'] });
  const existingKeys = new Set(existing.map((row) => `${row.role}:${row.permission}`));
  const rows = [];
  for (const role of Role.SYSTEM_ROLES) {
    for (const permission of RolePermission.PERMISSIONS) {
      if (existingKeys.has(`${role}:${permission}`)) continue;
      rows.push({
        role,
        permission,
        allowed: Boolean(RolePermission.DEFAULT_PERMISSIONS[role]?.[permission]),
      });
    }
  }

  if (rows.length) await RolePermission.bulkCreate(rows, { ignoreDuplicates: true });
  defaultsSeeded = true;
  return { seeded: rows.length > 0, count: rows.length };
}

function buildMatrix(roleNames, rows) {
  const matrix = {};
  for (const role of roleNames) {
    matrix[role] = emptyPermissions();
  }
  for (const row of rows) {
    if (!matrix[row.role]) {
      matrix[row.role] = emptyPermissions();
    }
    if (RolePermission.PERMISSIONS.includes(row.permission)) {
      matrix[row.role][row.permission] = Boolean(row.allowed);
    }
  }
  return matrix;
}

async function getPermissionsMatrix() {
  await seedDefaultsIfEmpty();

  const [roles, rows] = await Promise.all([
    Role.findAll({ attributes: ['name'], order: [['name', 'ASC']] }),
    RolePermission.findAll(),
  ]);

  return buildMatrix(
    roles.map((r) => r.name),
    rows
  );
}

async function getRolePermissions(role) {
  const exists = await roleExists(role);
  if (!exists) {
    const err = new Error(`Unknown role: ${role}`);
    err.status = 400;
    throw err;
  }

  await seedDefaultsIfEmpty();
  const rows = await RolePermission.findAll({ where: { role } });
  const map = emptyPermissions();
  for (const row of rows) {
    if (RolePermission.PERMISSIONS.includes(row.permission)) {
      map[row.permission] = Boolean(row.allowed);
    }
  }
  return map;
}

async function updateRolePermissions(role, permissionsInput) {
  const exists = await roleExists(role);
  if (!exists) {
    const err = new Error(`Unknown role: ${role}`);
    err.status = 400;
    throw err;
  }

  if (!permissionsInput || typeof permissionsInput !== 'object') {
    const err = new Error('permissions object is required');
    err.status = 400;
    throw err;
  }

  await seedDefaultsIfEmpty();

  const existing = await RolePermission.findAll({ where: { role } });
  const byPermission = new Map(existing.map((row) => [row.permission, row]));
  const updates = [];

  for (const permission of RolePermission.PERMISSIONS) {
    if (permissionsInput[permission] === undefined) continue;
    const allowed = Boolean(permissionsInput[permission]);
    const row = byPermission.get(permission);
    if (row) {
      if (row.allowed !== allowed) {
        row.allowed = allowed;
        updates.push(row.save());
      }
    } else {
      updates.push(RolePermission.create({ role, permission, allowed }));
    }
  }

  await Promise.all(updates);
  return getRolePermissions(role);
}

async function getPermissionsForRole(role) {
  const perms = await getRolePermissions(role);
  return RolePermission.PERMISSIONS.filter((p) => perms[p]);
}

async function createRole({ name, permissions } = {}) {
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    const err = new Error('Role name is required');
    err.status = 400;
    throw err;
  }
  if (trimmed.length > 80) {
    const err = new Error('Role name must be 80 characters or fewer');
    err.status = 400;
    throw err;
  }

  await ensureSystemRoles();

  const allRoles = await Role.findAll({ attributes: ['name'] });
  const clash = allRoles.find((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  if (clash) {
    const err = new Error('A role with this name already exists');
    err.status = 409;
    throw err;
  }

  if (Role.SYSTEM_ROLES.map((r) => r.toLowerCase()).includes(trimmed.toLowerCase())) {
    const err = new Error('Cannot recreate a system role');
    err.status = 400;
    throw err;
  }

  const role = await Role.create({ name: trimmed, isSystem: false });

  const permissionMap = emptyPermissions();
  if (permissions && typeof permissions === 'object') {
    for (const permission of RolePermission.PERMISSIONS) {
      if (permissions[permission] !== undefined) {
        permissionMap[permission] = Boolean(permissions[permission]);
      }
    }
  }

  await RolePermission.bulkCreate(
    RolePermission.PERMISSIONS.map((permission) => ({
      role: role.name,
      permission,
      allowed: permissionMap[permission],
    }))
  );

  return {
    id: role.id,
    name: role.name,
    isSystem: role.isSystem,
    permissions: permissionMap,
  };
}

async function deleteRole(name) {
  const role = await Role.findOne({ where: { name } });
  if (!role) {
    const err = new Error('Role not found');
    err.status = 404;
    throw err;
  }
  if (role.isSystem || Role.SYSTEM_ROLES.includes(role.name)) {
    const err = new Error('System roles cannot be deleted');
    err.status = 400;
    throw err;
  }

  const usersWithRole = await User.count({ where: { role: role.name } });
  if (usersWithRole > 0) {
    const err = new Error(`Cannot delete role while ${usersWithRole} user(s) still use it`);
    err.status = 400;
    throw err;
  }

  await RolePermission.destroy({ where: { role: role.name } });
  await role.destroy();
  return true;
}

async function listRolesDetailed() {
  await seedDefaultsIfEmpty();

  const [roles, rows] = await Promise.all([
    Role.findAll({ order: [['isSystem', 'DESC'], ['name', 'ASC']] }),
    RolePermission.findAll(),
  ]);

  const matrix = buildMatrix(
    roles.map((r) => r.name),
    rows
  );

  return {
    roles: roles.map((r) => ({
      id: r.id,
      name: r.name,
      isSystem: Boolean(r.isSystem),
      permissions: matrix[r.name] || emptyPermissions(),
    })),
    permissions: RolePermission.PERMISSIONS,
    matrix,
  };
}

module.exports = {
  ensureSystemRoles,
  listRoleNames,
  roleExists,
  seedDefaultsIfEmpty,
  getPermissionsMatrix,
  getRolePermissions,
  updateRolePermissions,
  getPermissionsForRole,
  createRole,
  deleteRole,
  listRolesDetailed,
};
