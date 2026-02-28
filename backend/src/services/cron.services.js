/**
 * modaic/backend/src/services/cron.service.js
 * Cron jobs — daily trend alert generation
 * Uses node-cron (already in package.json or we add it)
 */

const logger = require('../config/logger');

let cron;
try {
  cron = require('node-cron');
} catch {
  logger.warn('node-cron not installed — cron jobs disabled');
  cron = null;
}

const { generateTrendAlertsForAllUsers } = require('./trends.service');

/**
 * Initialize all cron jobs
 * Called once on server startup
 */
const initCronJobs = () => {
  if (!cron) {
    logger.warn('Cron jobs skipped — node-cron not available');
    return;
  }

  // Run daily at 2 AM UTC — generates trend alerts for all users
  cron.schedule('0 2 * * *', async () => {
    logger.info('⏰ Cron: starting daily trend alert generation');
    try {
      const result = await generateTrendAlertsForAllUsers();
      logger.info(`⏰ Cron: trend alerts done — ${result.success}/${result.total} users`);
    } catch (err) {
      logger.error(`⏰ Cron error: ${err.message}`);
    }
  }, { timezone: 'UTC' });

  logger.info('✦ Cron jobs initialized (trend alerts: daily 2AM UTC)');
};

module.exports = { initCronJobs };