const cron = require('node-cron');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('cron');

function startScheduler() {
  log.info('Starting cron scheduler...');

  // Daily finance snapshot at 11:00 PM
  cron.schedule('0 23 * * *', () => {
    log.info('Running finance snapshot...');
    try {
      const financeService = require('../services/financeService');
      const { getDb } = require('../config/database');
      const db = getDb();
      const burn = financeService.getBurnRate(30);
      const runway = financeService.getRunwayMonths();
      db.prepare(`
        INSERT INTO financial_snapshots (date, monthly_burn, runway_months, liquid_assets, recurring_total, burn_trend)
        VALUES (date('now'), ?, ?, ?, ?, ?)
      `).run(burn.monthly_burn, runway.runway_months, runway.liquid_assets, 0, runway.burn_trend_percent);
      log.info('Finance snapshot saved');
    } catch (err) {
      log.error(`Finance snapshot failed: ${err.message}`);
    }
  });

  // Daily anomaly detection at 11:30 PM
  cron.schedule('30 23 * * *', () => {
    log.info('Running anomaly detection...');
    try {
      const anomalyService = require('../services/anomalyService');
      const results = anomalyService.runAllDetections();
      log.info(`Anomaly detection complete: ${results.length} anomalies found`);
    } catch (err) {
      log.error(`Anomaly detection failed: ${err.message}`);
    }
  });

  log.info('Cron scheduler started — finance snapshot (23:00), anomaly detection (23:30)');
}

module.exports = { startScheduler };
