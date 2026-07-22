const { RolePermission } = require('../models');
const roleService = require('../services/role.service');

async function listRoles(req, res, next) {
  try {
    const matrix = await roleService.getPermissionsMatrix();

    const roles = RolePermission.ROLES.map((role) => ({
      name: role,
      permissions: matrix[role],
    }));

    return res.json({
      success: true,
      data: {
        roles,
        permissions: RolePermission.PERMISSIONS,
        matrix,
      },
    });
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

    return res.json({
      success: true,
      data: {
        name: role,
        permissions,
      },
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
  updateRolePermissions,
  myPermissions,
};
