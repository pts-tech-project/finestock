require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');
require('./models');
const { seedDefaultsIfEmpty, ensureSystemRoles } = require('./services/role.service');

const PORT = process.env.PORT || 5080;

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

/**
 * Sequelize sync({ alter: true }) repeatedly adds UNIQUE on users.email
 * until MySQL hits "Too many keys specified; max 64 keys allowed".
 * Keep one unique index; drop the rest.
 */
async function cleanupDuplicateUserEmailIndexes() {
  try {
    const [rows] = await sequelize.query('SHOW INDEX FROM `users`');
    const emailUnique = rows.filter(
      (r) => r.Column_name === 'email' && Number(r.Non_unique) === 0 && r.Key_name !== 'PRIMARY'
    );
    const names = [...new Set(emailUnique.map((r) => r.Key_name))];
    if (names.length <= 1) return;

    for (const name of names.slice(1)) {
      await sequelize.query(`ALTER TABLE \`users\` DROP INDEX \`${name}\``);
      console.log(`[schema] dropped duplicate users index: ${name}`);
    }
    console.log(`[schema] kept users email unique index: ${names[0]} (${names.length - 1} duplicates removed)`);
  } catch (err) {
    console.warn('[schema] email index cleanup skipped:', err.message);
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    await cleanupDuplicateUserEmailIndexes();

    // Never use alter:true on every boot — it duplicates UNIQUE indexes on MySQL.
    // Opt in with DB_SYNC_ALTER=true, or run: npm run db:sync
    const useAlter = process.env.DB_SYNC_ALTER === 'true';
    if (useAlter) {
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

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`FinStock listening on http://0.0.0.0:${PORT} (API + frontend)`);
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
