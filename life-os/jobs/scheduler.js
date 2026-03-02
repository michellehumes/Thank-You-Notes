const cron = require('node-cron');
const logger = require('../config/logger');

function startScheduler() {
  // Daily at 6:00 AM — health sync
  cron.schedule('0 6 * * *', () => {
    logger.info('Running daily health sync');
    require('./dailyHealth').run();
  });

  // Daily at 6:15 AM — gmail sync
  cron.schedule('15 6 * * *', () => {
    logger.info('Running daily gmail sync');
    require('./dailyGmail').run();
  });

  // Daily at 6:30 AM — iMessage sync
  cron.schedule('30 6 * * *', () => {
    logger.info('Running daily messages sync');
    require('./dailyMessages').run();
  });

  // Daily at 6:45 AM — finance anomaly check
  cron.schedule('45 6 * * *', () => {
    logger.info('Running daily finance check');
    require('./dailyFinance').run();
  });

  // Daily at 7:00 AM — generate executive brief
  cron.schedule('0 7 * * *', () => {
    logger.info('Generating executive brief');
    require('./generateExecutiveBrief').run();
  });

  // Daily at 2:00 AM — backup
  cron.schedule('0 2 * * *', () => {
    logger.info('Running daily backup');
    require('./backupJob').run();
  });

  // Every 4 hours — job pipeline refresh
  cron.schedule('0 */4 * * *', () => {
    logger.info('Running job pipeline check');
    require('./dailyJobs').run();
  });

  logger.info('Cron scheduler started — 7 jobs registered');
}

module.exports = { startScheduler };
