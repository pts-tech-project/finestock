const authService = require('../services/auth.service');
const roleService = require('../services/role.service');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const result = await authService.login(email, password);
    const permissions = await roleService.getRolePermissions(result.user.role);
    const allowed = await roleService.getPermissionsForRole(result.user.role);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        ...result,
        permissions,
        allowed,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const permissions = await roleService.getRolePermissions(req.user.role);
    const allowed = await roleService.getPermissionsForRole(req.user.role);

    return res.json({
      success: true,
      data: {
        user: req.user.toSafeJSON(),
        permissions,
        allowed,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name, email } = req.body;
    const user = await authService.updateProfile(req.user, { name, email });
    const permissions = await roleService.getRolePermissions(user.role);
    const allowed = await roleService.getPermissionsForRole(user.role);

    return res.json({
      success: true,
      message: 'Profile updated',
      data: {
        user,
        permissions,
        allowed,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user, { currentPassword, newPassword });

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return next(error);
  }
}

async function register(req, res, next) {
  try {
    const { name, email, role, status, companyId, password } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'name, email and role are required',
      });
    }

    const result = await authService.registerUser(
      { name, email, role, status, companyId, password },
      { sendEmail: true }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered. Login credentials have been emailed.',
      data: {
        user: result.user,
        emailSent: Boolean(result.email?.queued),
        emailProvider: result.email?.provider || null,
        previewUrl: result.email?.previewUrl || null,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  me,
  updateMe,
  changePassword,
  register,
};
