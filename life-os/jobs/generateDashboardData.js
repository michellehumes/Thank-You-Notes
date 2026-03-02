const financeService = require('../services/financeService');
const jobService = require('../services/jobService');
const ouraService = require('../services/ouraService');
const { getDb } = require('../config/database');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

module.exports = {
  run() {
    try {
      const db = getDb();
      const dataDir = path.join(__dirname, '..', 'public', 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

      // 1. Finance overview
      const burnRate = financeService.getBurnRate(3);
      const liquidRow = db.prepare("SELECT COALESCE(SUM(balance), 50000) as total FROM accounts WHERE type IN ('checking', 'savings')").get();
      const runway = financeService.getRunway(liquidRow.total);
      const categories = financeService.getCategoryBreakdown(null, 3);
      const sharedSummary = financeService.getSharedExpenseSummary(1);

      fs.writeFileSync(path.join(dataDir, 'finance-overview.json'), JSON.stringify({
        burn_rate: burnRate,
        runway,
        categories,
        shared_summary: sharedSummary,
        updated_at: new Date().toISOString()
      }, null, 2));

      // 2. Transactions (last 200 each)
      const mTxns = financeService.getTransactions({ owner: 'michelle', limit: 200 });
      const gTxns = financeService.getTransactions({ owner: 'gray', limit: 200 });
      fs.writeFileSync(path.join(dataDir, 'transactions-michelle.json'), JSON.stringify(mTxns, null, 2));
      fs.writeFileSync(path.join(dataDir, 'transactions-gray.json'), JSON.stringify(gTxns, null, 2));

      // 3. Budget and accounts
      const budget = db.prepare('SELECT * FROM budget_items ORDER BY type, name').all();
      const accounts = db.prepare('SELECT * FROM accounts ORDER BY owner, type').all();
      fs.writeFileSync(path.join(dataDir, 'budget.json'), JSON.stringify(budget, null, 2));
      fs.writeFileSync(path.join(dataDir, 'accounts.json'), JSON.stringify(accounts, null, 2));

      // 4. Sync status
      const syncStates = db.prepare('SELECT * FROM sync_state ORDER BY service').all();
      fs.writeFileSync(path.join(dataDir, 'sync-status.json'), JSON.stringify(syncStates, null, 2));

      // 5. Career
      const analytics = jobService.getPipelineAnalytics();
      fs.writeFileSync(path.join(dataDir, 'career.json'), JSON.stringify(analytics, null, 2));

      // 6. Health (last 30 days)
      const healthData = ouraService.getLatest(30);
      fs.writeFileSync(path.join(dataDir, 'health.json'), JSON.stringify(healthData, null, 2));

      logger.info('Dashboard data generated: 9 JSON files');
      return { files: 9 };
    } catch (err) {
      logger.error('Dashboard data generation failed', err);
      return { error: err.message };
    }
  }
};
