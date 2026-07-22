const { User } = require('../models');
const { generatePassword, hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { sendWelcomeCredentials } = require('./email.service');

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

  if (!User.ROLES.includes(payload.role)) {
    const err = new Error(`Role must be one of: ${User.ROLES.join(', ')}`);
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

module.exports = {
  login,
  registerUser,
};
