const { getDb } = require('../config/database');
const logger = require('../config/logger');

const financeService = {
  insertTransaction(txn) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO finance_transactions (date, merchant, amount, category, account, account_mask, owner, classification, type, is_recurring, notes, source)
      VALUES (@date, @merchant, @amount, @category, @account, @account_mask, @owner, @classification, @type, @is_recurring, @notes, @source)
    `);
    return stmt.run({
      date: txn.date,
      merchant: txn.merchant || null,
      amount: txn.amount,
      category: txn.category || null,
      account: txn.account || null,
      account_mask: txn.account_mask || null,
      owner: txn.owner,
      classification: txn.classification || null,
      type: txn.type || 'regular',
      is_recurring: txn.is_recurring || 0,
      notes: txn.notes || null,
      source: txn.source || 'manual'
    });
  },

  insertMany(transactions) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO finance_transactions (date, merchant, amount, category, account, account_mask, owner, classification, type, is_recurring, notes, source)
      VALUES (@date, @merchant, @amount, @category, @account, @account_mask, @owner, @classification, @type, @is_recurring, @notes, @source)
    `);
    let count = 0;
    const insertAll = db.transaction((txns) => {
      for (const txn of txns) {
        stmt.run({
          date: txn.date,
          merchant: txn.merchant || null,
          amount: txn.amount,
          category: txn.category || null,
          account: txn.account || null,
          account_mask: txn.account_mask || null,
          owner: txn.owner,
          classification: txn.classification || null,
          type: txn.type || 'regular',
          is_recurring: txn.is_recurring || 0,
          notes: txn.notes || null,
          source: txn.source || 'manual'
        });
        count++;
      }
    });
    insertAll(transactions);
    logger.info(`Inserted ${count} transactions`);
    return count;
  },

  getTransactions({ owner, category, classification, startDate, endDate, limit = 200 } = {}) {
    const db = getDb();
    let sql = 'SELECT * FROM finance_transactions WHERE 1=1';
    const params = {};
    if (owner) { sql += ' AND owner = @owner'; params.owner = owner; }
    if (category) { sql += ' AND category = @category'; params.category = category; }
    if (classification) { sql += ' AND classification = @classification'; params.classification = classification; }
    if (startDate) { sql += ' AND date >= @startDate'; params.startDate = startDate; }
    if (endDate) { sql += ' AND date <= @endDate'; params.endDate = endDate; }
    sql += ' ORDER BY date DESC LIMIT @limit';
    params.limit = limit;
    return db.prepare(sql).all(params);
  },

  getMonthlyTotals(owner, months = 6) {
    const db = getDb();
    return db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spend,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income,
        COUNT(*) as transaction_count
      FROM finance_transactions
      WHERE owner = @owner
        AND date >= date('now', '-' || @months || ' months')
        AND classification NOT IN ('transfer', 'investment')
      GROUP BY month
      ORDER BY month DESC
    `).all({ owner, months });
  },

  getBurnRate(months = 3) {
    const db = getDb();
    const result = db.prepare(`
      SELECT AVG(monthly_spend) as avg_burn FROM (
        SELECT strftime('%Y-%m', date) as month,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as monthly_spend
        FROM finance_transactions
        WHERE classification NOT IN ('transfer', 'investment')
          AND type != 'income'
          AND date >= date('now', '-' || @months || ' months')
        GROUP BY month
      )
    `).get({ months });
    return {
      avg_burn: Math.round((result?.avg_burn || 0) * 100) / 100,
      months_analyzed: months
    };
  },

  getRunway(liquidAssets) {
    const burnRate = this.getBurnRate();
    const runway = burnRate.avg_burn > 0 ? liquidAssets / burnRate.avg_burn : Infinity;
    return {
      liquid_assets: liquidAssets,
      avg_burn: burnRate.avg_burn,
      runway_months: Math.round(runway * 10) / 10,
      status: runway >= 12 ? 'healthy' : runway >= 6 ? 'caution' : 'critical'
    };
  },

  getCategoryBreakdown(owner, months = 3) {
    const db = getDb();
    return db.prepare(`
      SELECT category, SUM(ABS(amount)) as total, COUNT(*) as count
      FROM finance_transactions
      WHERE owner = @owner AND amount < 0
        AND classification NOT IN ('transfer', 'investment')
        AND date >= date('now', '-' || @months || ' months')
      GROUP BY category
      ORDER BY total DESC
    `).all({ owner, months });
  },

  getSharedExpenseSummary(months = 3) {
    const db = getDb();
    const grayTotal = db.prepare(`
      SELECT SUM(ABS(amount)) as total FROM finance_transactions
      WHERE owner = 'gray' AND amount < 0
        AND classification NOT IN ('transfer', 'investment')
        AND date >= date('now', '-' || @months || ' months')
    `).get({ months });
    const michelleTotal = db.prepare(`
      SELECT SUM(ABS(amount)) as total FROM finance_transactions
      WHERE owner = 'michelle' AND amount < 0
        AND classification NOT IN ('transfer', 'investment')
        AND date >= date('now', '-' || @months || ' months')
    `).get({ months });
    return {
      gray_spend: Math.round((grayTotal?.total || 0) * 100) / 100,
      michelle_spend: Math.round((michelleTotal?.total || 0) * 100) / 100,
      months_analyzed: months
    };
  }
};

module.exports = financeService;
