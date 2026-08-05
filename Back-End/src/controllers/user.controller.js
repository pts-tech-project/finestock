const { Op } = require('sequelize');
const { User } = require('../models');
const authService = require('../services/auth.service');
const { generatePassword, hashPassword } = require('../utils/password');
const { sendWelcomeCredentials, sendPasswordResetCredentials } = require('../services/email.service');

async function listUsers(req, res, next) {
  try {
    const { search, role, status } = req.query;
    const where = {};

    if (role && role !== 'All') where.role = role;
    if (status && status !== 'All') where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: users.map((u) => u.toSafeJSON()),
    });
  } catch (error) {
    return next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: user.toSafeJSON() });
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, role, status, companyId } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'name, email and role are required',
      });
    }

    const result = await authService.registerUser(
      {
        name,
        email,
        role,
        status,
        companyId: companyId || req.user.companyId,
      },
      { sendEmail: true }
    );

    return res.status(201).json({
      success: true,
      message: 'User created. Login credentials have been emailed.',
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

async function updateUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, role, status, companyId } = req.body;

    if (email && email.toLowerCase() !== user.email) {
      const taken = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (taken) {
        return res.status(409).json({ success: false, message: 'A user with this email already exists' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name !== undefined) user.name = name.trim();
    if (role !== undefined) {
      const roleService = require('../services/role.service');
      const exists = await roleService.roleExists(role);
      if (!exists) {
        const names = await roleService.listRoleNames();
        return res.status(400).json({
          success: false,
          message: `Role must be one of: ${names.join(', ')}`,
        });
      }
      user.role = role;
    }
    if (status !== undefined) {
      if (!User.STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${User.STATUSES.join(', ')}`,
        });
      }
      user.status = status;
    }
    if (companyId !== undefined) user.companyId = companyId;

    await user.save();

    return res.json({
      success: true,
      message: 'User updated',
      data: user.toSafeJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function deactivateUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    user.status = 'Inactive';
    await user.save();

    return res.json({
      success: true,
      message: 'User deactivated',
      data: user.toSafeJSON(),
    });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const plainPassword = generatePassword(12);
    user.passwordHash = await hashPassword(plainPassword);
    await user.save();

    const emailResult = await sendPasswordResetCredentials({
      name: user.name,
      email: user.email,
      password: plainPassword,
      role: user.role,
    });

    return res.json({
      success: true,
      message: 'Password reset. New credentials have been emailed.',
      data: {
        user: user.toSafeJSON(),
        emailSent: Boolean(emailResult?.queued),
        emailProvider: emailResult?.provider || null,
        previewUrl: emailResult?.previewUrl || null,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser,
  resetPassword,
};
