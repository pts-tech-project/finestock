require('dotenv').config();

const sequelize = require('../config/database');
const { User } = require('../models');
const { generatePassword, hashPassword } = require('../utils/password');
const { sendWelcomeCredentials } = require('../services/email.service');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const email = (process.argv[2] || 'owner@finstock.local').toLowerCase();
    const name = process.argv[3] || 'FinStock Owner';

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log(`Owner already exists: ${email}`);
      process.exit(0);
    }

    const plainPassword = generatePassword(12);
    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(plainPassword),
      role: 'Owner',
      status: 'Active',
    });

    await sendWelcomeCredentials({
      name: user.name,
      email: user.email,
      password: plainPassword,
      role: user.role,
    });

    console.log('Owner created');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${plainPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create owner:', error.message);
    process.exit(1);
  }
})();
