const { getDb } = require('../config/database');
const logger = require('../config/logger');

const anomalyService = {
  runFinancialAnomalyDetection() {
    const db = getDb();
    const anomalies = [];

    // 1. Spend spike: current month > 3-month avg + 20%
    const monthlySpend = db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as spend
      FROM finance_transactions
      WHERE classification NOT IN ('transfer', 'investment') AND type != 'income'
      GROUP BY month ORDER BY month DESC LIMIT 4
    `).all();

    if (monthlySpend.length >= 2) {
      const current = monthlySpend[0];
      const historical = monthlySpend.slice(1);
      const avg = historical.reduce((s, m) => s + m.spend, 0) / historical.length;
      if (current.spend > avg * 1.2) {
        anomalies.push({
          domain: 'finance', type: 'spend_spike',
          severity: current.spend > avg * 1.5 ? 'critical' : 'warning',
          description: `Monthly spend $${Math.round(current.spend)} exceeds 3-month avg $${Math.round(avg)} by ${Math.round(((current.spend / avg) - 1) * 100)}%`,
          value: current.spend, threshold: avg * 1.2
        });
      }
    }

    // 2. New merchants (not seen in prior 90 days)
    const newMerchants = db.prepare(`
      SELECT DISTINCT merchant FROM finance_transactions
      WHERE date >= date('now', '-30 days')
        AND merchant NOT IN (
          SELECT DISTINCT merchant FROM finance_transactions
          WHERE date < date('now', '-30 days') AND date >= date('now', '-120 days')
        )
        AND classification NOT IN ('transfer', 'investment')
        AND type != 'income'
    `).all();

    if (newMerchants.length > 5) {
      anomalies.push({
        domain: 'finance', type: 'new_merchants', severity: 'info',
        description: `${newMerchants.length} new merchants in last 30 days: ${newMerchants.slice(0, 5).map(m => m.merchant).join(', ')}`,
        value: newMerchants.length, threshold: 5
      });
    }

    // 3. Large single payment (> 2x median)
    const medianResult = db.prepare(`
      SELECT ABS(amount) as abs_amount FROM finance_transactions
      WHERE amount < 0 AND classification NOT IN ('transfer', 'investment')
      ORDER BY abs_amount LIMIT 1 OFFSET (
        SELECT COUNT(*) / 2 FROM finance_transactions
        WHERE amount < 0 AND classification NOT IN ('transfer', 'investment')
      )
    `).get();

    if (medianResult) {
      const threshold = medianResult.abs_amount * 2;
      const largePayments = db.prepare(`
        SELECT * FROM finance_transactions
        WHERE ABS(amount) > @threshold AND amount < 0
          AND classification NOT IN ('transfer', 'investment')
          AND date >= date('now', '-7 days')
      `).all({ threshold });

      for (const p of largePayments) {
        anomalies.push({
          domain: 'finance', type: 'large_payment', severity: 'warning',
          description: `Large payment: ${p.merchant} $${Math.abs(p.amount)} (>2x median $${Math.round(medianResult.abs_amount)})`,
          value: Math.abs(p.amount), threshold
        });
      }
    }

    // 4. Subscription count increase
    const subCount = db.prepare('SELECT COUNT(*) as cnt FROM recurring_subscriptions WHERE is_active = 1').get();
    if (subCount && subCount.cnt > 15) {
      anomalies.push({
        domain: 'finance', type: 'subscription_increase', severity: 'info',
        description: `${subCount.cnt} active subscriptions detected`,
        value: subCount.cnt, threshold: 15
      });
    }

    // Persist anomalies
    const today = new Date().toISOString().split('T')[0];
    const insertStmt = db.prepare(`
      INSERT INTO anomaly_log (date, domain, type, severity, description, value, threshold)
      VALUES (@date, @domain, @type, @severity, @description, @value, @threshold)
    `);
    const insertAll = db.transaction((items) => {
      for (const item of items) insertStmt.run({ ...item, date: today });
    });
    insertAll(anomalies);

    logger.info(`Anomaly detection complete: ${anomalies.length} anomalies found`);
    return anomalies;
  },

  getRecentAnomalies(days = 7) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM anomaly_log
      WHERE date >= date('now', '-' || @days || ' days')
      ORDER BY created_at DESC
    `).all({ days });
  },

  acknowledgeAnomaly(id) {
    const db = getDb();
    return db.prepare('UPDATE anomaly_log SET acknowledged = 1 WHERE id = @id').run({ id });
  }
};

module.exports = anomalyService;
