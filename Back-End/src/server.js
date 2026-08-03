require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');
require('./models');
const { seedDefaultsIfEmpty, ensureSystemRoles } = require('./services/role.service');

const PORT = process.env.PORT || 5001;
const isDev = process.env.NODE_ENV !== 'production';

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[uncaughtException]', error);
});

/** MySQL ENUM → VARCHAR so custom role names can be stored */
async function widenRoleColumns() {
  try {
    await sequelize.query(
      "ALTER TABLE `users` MODIFY COLUMN `role` VARCHAR(80) NOT NULL DEFAULT 'Staff'"
    );
  } catch (err) {
    console.warn('[schema] users.role widen skipped:', err.message);
  }
  try {
    await sequelize.query(
      'ALTER TABLE `role_permissions` MODIFY COLUMN `role` VARCHAR(80) NOT NULL'
    );
  } catch (err) {
    console.warn('[schema] role_permissions.role widen skipped:', err.message);
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Avoid alter:true on every boot in production — it is slow and can lock tables.
    // Use `npm run db:sync` when you intentionally want schema changes.
    if (isDev) {
      await sequelize.sync({ alter: true });
      console.log('Database models synced (alter)');
    } else {
      await sequelize.sync();
      console.log('Database models synced');
    }

    await widenRoleColumns();
    await ensureSystemRoles();

    const seed = await seedDefaultsIfEmpty();
    if (seed.seeded) {
      console.log(`Seeded ${seed.count} default role permissions`);
    }

    const server = app.listen(PORT, () => {
      console.log(`FinStock API listening on http://localhost:${PORT}`);
      if (process.env.RESEND_API_KEY) {
        console.log('Email: Resend (real delivery)');
      } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('Email: custom SMTP');
      } else {
        console.log('Email: Ethereal (free test inbox — preview URLs in API responses)');
      }
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or change PORT.`);
      } else {
        console.error('HTTP server error:', error);
      }
      process.exit(1);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down…`);
      server.close(async () => {
        try {
          await sequelize.close();
        } catch (err) {
          console.error('Error closing database:', err.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
