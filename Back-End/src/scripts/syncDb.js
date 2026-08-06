require('dotenv').config();

const sequelize = require('../config/database');
require('../models');

/**
 * Prefer: npm start (sync without alter).
 * This script uses alter — run only when you intentionally need schema changes.
 * Clean duplicate email indexes first to avoid MySQL's 64-key limit.
 */
(async () => {
  try {
    await sequelize.authenticate();

    const [rows] = await sequelize.query('SHOW INDEX FROM `users`');
    const emailUnique = rows.filter(
      (r) => r.Column_name === 'email' && Number(r.Non_unique) === 0 && r.Key_name !== 'PRIMARY'
    );
    const names = [...new Set(emailUnique.map((r) => r.Key_name))];
    for (const name of names.slice(1)) {
      await sequelize.query(`ALTER TABLE \`users\` DROP INDEX \`${name}\``);
      console.log(`Dropped duplicate index: ${name}`);
    }

    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('Sync failed:', error.message);
    process.exit(1);
  }
})();
