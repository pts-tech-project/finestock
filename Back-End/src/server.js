require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');
require('./models');
const { seedDefaultsIfEmpty } = require('./services/role.service');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    await sequelize.sync({ alter: true });
    console.log('Database models synced');

    const seed = await seedDefaultsIfEmpty();
    if (seed.seeded) {
      console.log(`Seeded ${seed.count} default role permissions`);
    }

    app.listen(PORT, () => {
      console.log(`FinStock API listening on http://localhost:${PORT}`);
      if (process.env.RESEND_API_KEY) {
        console.log('Email: Resend (real delivery)');
      } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('Email: custom SMTP');
      } else {
        console.log('Email: Ethereal (free test inbox — preview URLs in API responses)');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
