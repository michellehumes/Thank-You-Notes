const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('finance');

// ── Transactions ────────────────────────────────────
function getTransactions({ owner, category, classification, from, to, account, search, page = 1, limit = 50, sort = 'date', order = 'DESC' } = {}) {
  const db = getDb();
  const conditions = [];
  const params = [];

  if (owner) { conditions.push('owner = ?'); params.push(owner); }
  if (category) { conditions.push('category = ?'); params.push(category); }
  if (classification) { conditions.push('classification = ?'); params.push(classification); }
  if (account) { conditions.push('account LIKE ?'); params.push(`%${account}%`); }
  if (from) { conditions.push('date >= ?'); params.push(from); }
  if (to) { conditions.push('date <= ?'); params.push(to); }
  if (search) { conditions.push('(merchant LIKE ? OR category LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const allowedSorts = ['date', 'amount', 'merchant', 'category'];
  const sortCol = allowedSorts.includes(sort) ? sort : 'date';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM transactions ${where}`).get(...params);
  const rows = db.prepare(`SELECT * FROM transactions ${where} ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`).all(...params, limit, offset);

  return { transactions: rows, total: countRow.total, page, limit, pages: Math.ceil(countRow.total / limit) };
}

// ── Spending Summary ────────────────────────────────
function getSpendingSummary({ owner, from, to } = {}) {
  const db = getDb();
  const conditions = ["amount < 0", "classification NOT IN ('transfer','investment')"];
  const params = [];

  if (owner) { conditions.push('owner = ?'); params.push(owner); }
  if (from) { conditions.push('date >= ?'); params.push(from); }
  if (to) { conditions.push('date <= ?'); params.push(to); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const byCategory = db.prepare(`
    SELECT category, SUM(ABS(amount)) as total, COUNT(*) as count
    FROM transactions ${where}
    GROUP BY category ORDER BY total DESC
  `).all(...params);

  const byClassification = db.prepare(`
    SELECT classification, SUM(ABS(amount)) as total, COUNT(*) as count
    FROM transactions ${where}
    GROUP BY classification ORDER BY total DESC
  `).all(...params);

  const totalSpend = db.prepare(`SELECT SUM(ABS(amount)) as total FROM transactions ${where}`).get(...params);

  return { by_category: byCategory, by_classification: byClassification, total_spend: totalSpend.total || 0 };
}

// ── Burn Rate ───────────────────────────────────────
function getBurnRate(days = 30) {
  const db = getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const result = db.prepare(`
    SELECT SUM(ABS(amount)) as total_burn, COUNT(DISTINCT date) as active_days
    FROM transactions
    WHERE date >= ? AND amount < 0 AND classification NOT IN ('transfer','investment')
  `).get(cutoffStr);

  const totalBurn = result.total_burn || 0;
  const activeDays = result.active_days || 1;
  const dailyBurn = totalBurn / days;
  const monthlyBurn = dailyBurn * 30;

  return { period_days: days, total_burn: Math.round(totalBurn * 100) / 100, daily_burn: Math.round(dailyBurn * 100) / 100, monthly_burn: Math.round(monthlyBurn * 100) / 100, active_days: activeDays };
}

// ── Runway ──────────────────────────────────────────
function getRunwayMonths(liquidAssets) {
  const assets = liquidAssets || parseFloat(process.env.LIQUID_ASSETS) || 50000;
  const burn90 = getBurnRate(90);
  const monthlyBurn = burn90.monthly_burn || 1;
  const runway = assets / monthlyBurn;

  // Burn trend: compare 30-day vs 90-day average
  const burn30 = getBurnRate(30);
  const burnTrend = burn90.monthly_burn > 0
    ? ((burn30.monthly_burn - burn90.monthly_burn) / burn90.monthly_burn) * 100
    : 0;

  // Recurring ratio
  const db = getDb();
  const recurringTotal = db.prepare(`
    SELECT SUM(ABS(amount)) as total FROM transactions
    WHERE recurring = 1 AND amount < 0
  `).get();
  const recurringRatio = burn30.total_burn > 0
    ? (recurringTotal.total || 0) / burn30.total_burn
    : 0;

  return {
    liquid_assets: assets,
    monthly_burn_avg: Math.round(monthlyBurn * 100) / 100,
    runway_months: Math.round(runway * 10) / 10,
    burn_trend_percent: Math.round(burnTrend * 10) / 10,
    recurring_ratio: Math.round(recurringRatio * 100) / 100,
    burn_30d: burn30,
    burn_90d: burn90
  };
}

// ── Monthly Net Flow ────────────────────────────────
function getMonthlyNetFlow(months = 6) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN amount > 0 AND classification != 'transfer' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN amount < 0 AND classification NOT IN ('transfer','investment') THEN ABS(amount) ELSE 0 END) as expenses,
      SUM(CASE WHEN classification = 'investment' THEN ABS(amount) ELSE 0 END) as investments
    FROM transactions
    GROUP BY month
    ORDER BY month DESC
    LIMIT ?
  `).all(months);

  return rows.map(r => ({
    ...r,
    net: Math.round((r.income - r.expenses) * 100) / 100
  })).reverse();
}

// ── Shared Expenses Summary ─────────────────────────
function getSharedExpensesSummary({ from, to } = {}) {
  const db = getDb();
  const conditions = ["classification = 'shared'", "amount < 0"];
  const params = [];

  if (from) { conditions.push('date >= ?'); params.push(from); }
  if (to) { conditions.push('date <= ?'); params.push(to); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const total = db.prepare(`SELECT SUM(ABS(amount)) as total FROM transactions ${where}`).get(...params);
  const byCategory = db.prepare(`
    SELECT category, SUM(ABS(amount)) as total, COUNT(*) as count
    FROM transactions ${where}
    GROUP BY category ORDER BY total DESC
  `).all(...params);

  // Budget items
  const budgetItems = db.prepare('SELECT * FROM budget_items WHERE active = 1 ORDER BY category, amount DESC').all();
  const fixedTotal = budgetItems.filter(b => b.category === 'fixed').reduce((s, b) => s + b.amount, 0);
  const variableTotal = budgetItems.filter(b => b.category === 'variable').reduce((s, b) => s + b.amount, 0);

  return {
    actual_spend: total.total || 0,
    budget_fixed: fixedTotal,
    budget_variable: variableTotal,
    budget_total: fixedTotal + variableTotal,
    by_category: byCategory,
    budget_items: budgetItems
  };
}

// ── Split Calculator ────────────────────────────────
function getSplitCalculation(ratio = 50) {
  const shared = getSharedExpensesSummary();
  const total = shared.budget_total;
  const netEach = parseFloat(process.env.MONTHLY_NET_EACH) || 11500;

  const michelleShare = Math.round(total * ratio / 100);
  const grayShare = total - michelleShare;

  return {
    total_shared: total,
    ratio: { michelle: ratio, gray: 100 - ratio },
    michelle_contribution: michelleShare,
    gray_contribution: grayShare,
    michelle_remaining: netEach - michelleShare,
    gray_remaining: netEach - grayShare,
    net_each: netEach
  };
}

// ── Drift Detection ─────────────────────────────────
function getDriftDetection() {
  const db = getDb();
  const flags = [];

  // 1. Burn spike: 30-day vs 90-day avg
  const burn30 = getBurnRate(30);
  const burn90 = getBurnRate(90);
  if (burn90.monthly_burn > 0) {
    const variance = ((burn30.monthly_burn - burn90.monthly_burn) / burn90.monthly_burn) * 100;
    if (variance > 20) {
      flags.push({
        type: 'burn_spike',
        severity: variance > 40 ? 'critical' : 'warning',
        description: `Monthly spend $${burn30.monthly_burn.toLocaleString()} is ${Math.round(variance)}% above 3-month average`,
        value: Math.round(variance)
      });
    }
  }

  // 2. New merchants in last 30 days not seen in prior 90
  const cutoff30 = new Date(); cutoff30.setDate(cutoff30.getDate() - 30);
  const cutoff120 = new Date(); cutoff120.setDate(cutoff120.getDate() - 120);
  const newMerchants = db.prepare(`
    SELECT DISTINCT merchant FROM transactions
    WHERE date >= ? AND amount < 0 AND classification NOT IN ('transfer','investment')
    AND merchant NOT IN (
      SELECT DISTINCT merchant FROM transactions
      WHERE date >= ? AND date < ? AND amount < 0
    )
  `).all(cutoff30.toISOString().split('T')[0], cutoff120.toISOString().split('T')[0], cutoff30.toISOString().split('T')[0]);

  if (newMerchants.length > 3) {
    flags.push({
      type: 'new_merchants',
      severity: 'info',
      description: `${newMerchants.length} new merchants in the last 30 days`,
      merchants: newMerchants.map(m => m.merchant).slice(0, 10)
    });
  }

  // 3. Large payments (>2x merchant average)
  const largePayments = db.prepare(`
    SELECT t.date, t.merchant, ABS(t.amount) as amount, avg_tbl.avg_amount
    FROM transactions t
    JOIN (
      SELECT merchant, AVG(ABS(amount)) as avg_amount, COUNT(*) as cnt
      FROM transactions WHERE amount < 0
      GROUP BY merchant HAVING cnt >= 3
    ) avg_tbl ON t.merchant = avg_tbl.merchant
    WHERE t.date >= ? AND t.amount < 0 AND ABS(t.amount) > avg_tbl.avg_amount * 2
    ORDER BY t.date DESC LIMIT 10
  `).all(cutoff30.toISOString().split('T')[0]);

  for (const p of largePayments) {
    flags.push({
      type: 'large_payment',
      severity: 'warning',
      description: `${p.merchant}: $${p.amount.toFixed(2)} is ${(p.amount / p.avg_amount).toFixed(1)}x the average $${p.avg_amount.toFixed(2)}`,
      merchant: p.merchant,
      amount: p.amount,
      date: p.date
    });
  }

  return { flags, checked_at: new Date().toISOString() };
}

module.exports = {
  getTransactions,
  getSpendingSummary,
  getBurnRate,
  getRunwayMonths,
  getMonthlyNetFlow,
  getSharedExpensesSummary,
  getSplitCalculation,
  getDriftDetection
};
