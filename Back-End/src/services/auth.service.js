const { User } = require('../models');
const { generatePassword, hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { sendWelcomeCredentials } = require('./email.service');
const roleService = require('./role.service');

async function login(email, password) {
  const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  if (user.status !== 'Active') {
    const err = new Error('This account is inactive. Contact an administrator.');
    err.status = 403;
    throw err;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  return { token, user: user.toSafeJSON() };
}

async function registerUser(payload, { sendEmail = true } = {}) {
  const email = payload.email.toLowerCase().trim();
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const err = new Error('A user with this email already exists');
    err.status = 409;
    throw err;
  }

  const exists = await roleService.roleExists(payload.role);
  if (!exists) {
    const names = await roleService.listRoleNames();
    const err = new Error(`Role must be one of: ${names.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const plainPassword = payload.password || generatePassword(12);
  const passwordHash = await hashPassword(plainPassword);

  const user = await User.create({
    name: payload.name.trim(),
    email,
    passwordHash,
    role: payload.role,
    status: payload.status || 'Active',
    companyId: payload.companyId || null,
  });

  let emailResult = null;
  if (sendEmail) {
    emailResult = await sendWelcomeCredentials({
      name: user.name,
      email: user.email,
      password: plainPassword,
      role: user.role,
    });
  }

  return {
    user: user.toSafeJSON(),
    temporaryPassword: plainPassword,
    email: emailResult,
  };
}

async function updateProfile(user, { name, email } = {}) {
  if (email !== undefined) {
    const nextEmail = String(email).toLowerCase().trim();
    if (!nextEmail || !nextEmail.includes('@')) {
      const err = new Error('Enter a valid email address');
      err.status = 400;
      throw err;
    }
    if (nextEmail !== user.email) {
      const taken = await User.findOne({ where: { email: nextEmail } });
      if (taken) {
        const err = new Error('A user with this email already exists');
        err.status = 409;
        throw err;
      }
      user.email = nextEmail;
    }
  }

  if (name !== undefined) {
    const nextName = String(name).trim();
    if (!nextName) {
      const err = new Error('Name is required');
      err.status = 400;
      throw err;
    }
    user.name = nextName;
  }

  await user.save();
  return user.toSafeJSON();
}

async function changePassword(user, { currentPassword, newPassword } = {}) {
  if (!currentPassword || !newPassword) {
    const err = new Error('Current password and new password are required');
    err.status = 400;
    throw err;
  }
  if (String(newPassword).length < 8) {
    const err = new Error('New password must be at least 8 characters');
    err.status = 400;
    throw err;
  }

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  return true;
}

module.exports = {
  login,
  registerUser,
  updateProfile,
  changePassword,
};
