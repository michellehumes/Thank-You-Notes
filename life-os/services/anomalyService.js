const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');
const financeService = require('./financeService');

const log = createServiceLogger('anomaly');

function detectBurnSpike() {
  const burn30 = financeService.getBurnRate(30);
  const burn90 = financeService.getBurnRate(90);
  const anomalies = [];

  if (burn90.monthly_burn > 0) {
    const variance = ((burn30.monthly_burn - burn90.monthly_burn) / burn90.monthly_burn) * 100;
    if (variance > 20) {
      anomalies.push({
        type: 'burn_spike',
        severity: variance > 40 ? 'critical' : 'warning',
        description: `Monthly burn $${Math.round(burn30.monthly_burn)} is ${Math.round(variance)}% above 3-month average of $${Math.round(burn90.monthly_burn)}`,
        amount: burn30.monthly_burn
      });
    }
  }
  return anomalies;
}

function detectNewMerchants() {
  const db = getDb();
  const cutoff30 = new Date(); cutoff30.setDate(cutoff30.getDate() - 30);
  const cutoff120 = new Date(); cutoff120.setDate(cutoff120.getDate() - 120);

  const newMerchants = db.prepare(`
    SELECT merchant, SUM(ABS(amount)) as total, COUNT(*) as count
    FROM transactions
    WHERE date >= ? AND amount < 0 AND classification NOT IN ('transfer','investment')
    AND merchant NOT IN (
      SELECT DISTINCT merchant FROM transactions WHERE date >= ? AND date < ? AND amount < 0
    )
    GROUP BY merchant ORDER BY total DESC
  `).all(cutoff30.toISOString().split('T')[0], cutoff120.toISOString().split('T')[0], cutoff30.toISOString().split('T')[0]);

  return newMerchants.map(m => ({
    type: 'new_merchant',
    severity: m.total > 200 ? 'warning' : 'info',
    description: `New merchant: ${m.merchant} — $${m.total.toFixed(2)} across ${m.count} transactions`,
    merchant: m.merchant,
    amount: m.total
  }));
}

function detectSubscriptionCreep() {
  const db = getDb();
  const anomalies = [];

  // Count recurring merchants in last 30 vs prior 30 days
  const cutoff30 = new Date(); cutoff30.setDate(cutoff30.getDate() - 30);
  const cutoff60 = new Date(); cutoff60.setDate(cutoff60.getDate() - 60);

  const recentSubs = db.prepare(`
    SELECT COUNT(DISTINCT merchant) as count FROM transactions
    WHERE date >= ? AND recurring = 1 AND amount < 0
  `).get(cutoff30.toISOString().split('T')[0]);

  const priorSubs = db.prepare(`
    SELECT COUNT(DISTINCT merchant) as count FROM transactions
    WHERE date >= ? AND date < ? AND recurring = 1 AND amount < 0
  `).get(cutoff60.toISOString().split('T')[0], cutoff30.toISOString().split('T')[0]);

  if (recentSubs.count > priorSubs.count) {
    const diff = recentSubs.count - priorSubs.count;
    anomalies.push({
      type: 'subscription_increase',
      severity: diff > 3 ? 'warning' : 'info',
      description: `Subscription count increased from ${priorSubs.count} to ${recentSubs.count} (+${diff})`,
      amount: null
    });
  }

  return anomalies;
}

function detectLargePayments() {
  const db = getDb();
  const cutoff30 = new Date(); cutoff30.setDate(cutoff30.getDate() - 30);

  const results = db.prepare(`
    SELECT t.date, t.merchant, ABS(t.amount) as amount, avg_tbl.avg_amount, avg_tbl.cnt
    FROM transactions t
    JOIN (
      SELECT merchant, AVG(ABS(amount)) as avg_amount, COUNT(*) as cnt
      FROM transactions WHERE amount < 0 AND classification NOT IN ('transfer','investment')
      GROUP BY merchant HAVING cnt >= 2
    ) avg_tbl ON t.merchant = avg_tbl.merchant
    WHERE t.date >= ? AND t.amount < 0 AND ABS(t.amount) > avg_tbl.avg_amount * 2
    ORDER BY ABS(t.amount) DESC LIMIT 20
  `).all(cutoff30.toISOString().split('T')[0]);

  return results.map(r => ({
    type: 'large_payment',
    severity: r.amount > r.avg_amount * 3 ? 'critical' : 'warning',
    description: `${r.merchant}: $${r.amount.toFixed(2)} is ${(r.amount / r.avg_amount).toFixed(1)}x the average $${r.avg_amount.toFixed(2)}`,
    merchant: r.merchant,
    amount: r.amount
  }));
}

function runAllDetections() {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const allAnomalies = [
    ...detectBurnSpike(),
    ...detectNewMerchants(),
    ...detectSubscriptionCreep(),
    ...detectLargePayments()
  ];

  const stmt = db.prepare(`
    INSERT INTO anomalies (date, type, description, severity, amount, merchant)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insert = db.transaction(() => {
    for (const a of allAnomalies) {
      stmt.run(today, a.type, a.description, a.severity, a.amount || null, a.merchant || null);
    }
  });

  insert();
  log.info(`Detected ${allAnomalies.length} anomalies`);
  return allAnomalies;
}

function getActiveAnomalies() {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM anomalies WHERE acknowledged = 0 ORDER BY
    CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END, date DESC
  `).all();
}

function acknowledgeAnomaly(id) {
  const db = getDb();
  return db.prepare('UPDATE anomalies SET acknowledged = 1 WHERE id = ?').run(id);
}

module.exports = { detectBurnSpike, detectNewMerchants, detectSubscriptionCreep, detectLargePayments, runAllDetections, getActiveAnomalies, acknowledgeAnomaly };
