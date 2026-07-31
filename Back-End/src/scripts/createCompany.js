require('dotenv').config();

const sequelize = require('../config/database');
const { Company } = require('../models');

async function createCompany() {
  try {
    await sequelize.authenticate();

    const companyName = process.argv[2] || 'My Restaurant';

    const [company, created] = await Company.findOrCreate({
      where: {
        name: companyName,
      },
      defaults: {
        tradingName: companyName,
        country: 'United Kingdom',
        currency: 'GBP',
        financialYear: 'April – March',
        vatScheme: 'Standard',
      },
    });

    if (created) {
      console.log('Company created successfully');
    } else {
      console.log('Company already exists');
    }

    console.log(`Company ID: ${company.id}`);
    console.log(`Company name: ${company.name}`);
  } catch (error) {
    console.error('Failed to create company:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

createCompany();