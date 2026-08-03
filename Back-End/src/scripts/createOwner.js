require('dotenv').config();

const sequelize = require('../config/database');
const { User, Company } = require('../models');
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

    const company = await Company.findOne({ order: [['createdAt', 'ASC']] });
    if (!company) {
      throw new Error('Create a restaurant before creating the Owner account');
    }

    const plainPassword = generatePassword(12);
    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(plainPassword),
      role: 'Owner',
      status: 'Active',
      companyId: company.id,
    });

    if (process.argv[4] !== '--no-email') {
      await sendWelcomeCredentials({
        name: user.name,
        email: user.email,
        password: plainPassword,
        role: user.role,
      });
    }

    console.log('Owner created');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${plainPassword}`);
    console.log(`Restaurant: ${company.name}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create owner:', error.message);
    process.exit(1);
  }
})();
