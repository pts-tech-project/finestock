const { RolePermission } = require('../models');
const roleService = require('../services/role.service');

async function listRoles(req, res, next) {
  try {
    const data = await roleService.listRolesDetailed();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function listPermissions(req, res, next) {
  try {
    return res.json({
      success: true,
      data: RolePermission.PERMISSIONS,
    });
  } catch (error) {
    return next(error);
  }
}

async function getRole(req, res, next) {
  try {
    const role = req.params.role;
    const permissions = await roleService.getRolePermissions(role);
    const record = (await roleService.listRolesDetailed()).roles.find((r) => r.name === role);

    return res.json({
      success: true,
      data: {
        id: record?.id,
        name: role,
        isSystem: Boolean(record?.isSystem),
        permissions,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function createRole(req, res, next) {
  try {
    const { name, permissions } = req.body;
    const role = await roleService.createRole({ name, permissions });

    return res.status(201).json({
      success: true,
      message: `Role "${role.name}" created`,
      data: role,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateRolePermissions(req, res, next) {
  try {
    const role = req.params.role;
    const permissions = req.body.permissions || req.body;

    const updated = await roleService.updateRolePermissions(role, permissions);

    return res.json({
      success: true,
      message: `${role} permissions updated`,
      data: {
        name: role,
        permissions: updated,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteRole(req, res, next) {
  try {
    await roleService.deleteRole(req.params.role);
    return res.json({
      success: true,
      message: `Role "${req.params.role}" deleted`,
    });
  } catch (error) {
    return next(error);
  }
}

async function myPermissions(req, res, next) {
  try {
    const permissions = await roleService.getRolePermissions(req.user.role);
    const allowed = await roleService.getPermissionsForRole(req.user.role);

    return res.json({
      success: true,
      data: {
        role: req.user.role,
        permissions,
        allowed,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listRoles,
  listPermissions,
  getRole,
  createRole,
  updateRolePermissions,
  deleteRole,
  myPermissions,
};
