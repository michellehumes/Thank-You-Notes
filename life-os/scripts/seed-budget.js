#!/usr/bin/env node
/**
 * Seed budget_items table from finance dashboard data
 */
const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('seed-budget');

const FIXED_EXPENSES = [
  { name: 'Rent (12 Harbor St)', amount: 7500, card_account: 'Venmo/Zelle to Alexis', who_pays: 'Both ($3,750 each)' },
  { name: 'BMW X3 Payment', amount: 751, card_account: 'Auto-debit checking', who_pays: 'Gray' },
  { name: 'Car Insurance (Geico)', amount: 153, card_account: 'Venture', who_pays: 'Gray' },
  { name: 'Electricity (PSEG)', amount: 235, card_account: 'Venture', who_pays: 'Gray' },
  { name: 'Internet (Optimum)', amount: 100, card_account: 'Venture', who_pays: 'Gray' },
  { name: 'Garbage (Maggio)', amount: 75, card_account: 'Venture', who_pays: 'Gray' },
  { name: 'Heating Oil (seasonal avg)', amount: 200, card_account: 'Venture', who_pays: 'Gray' },
  { name: 'Storage (Goodfriend)', amount: 211, card_account: 'Venture', who_pays: 'Gray' },
  { name: 'Ring/Lemonade Insurance', amount: 51, card_account: 'Venture', who_pays: 'Gray' },
];

const VARIABLE_EXPENSES = [
  { name: 'Shared Groceries', amount: 700, card_account: 'Amex Gold (4X)' },
  { name: 'Shared Dining Out', amount: 600, card_account: 'Amex Gold (4X)' },
  { name: 'Shared Delivery/Uber Eats', amount: 300, card_account: 'Amex Gold (4X)' },
  { name: 'Gas / Car Wash', amount: 150, card_account: 'Venture (2X)' },
  { name: 'Tolls / E-ZPass', amount: 75, card_account: 'Venture (2X)' },
  { name: 'Shared Home / Target', amount: 200, card_account: 'Chase UR ...1041' },
  { name: 'Shared Travel (avg)', amount: 232, card_account: 'Venture (2X)' },
];

function run() {
  const db = getDb();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO budget_items (name, amount, category, card_account, who_pays, frequency)
    VALUES (?, ?, ?, ?, ?, 'monthly')
  `);

  const insert = db.transaction(() => {
    for (const item of FIXED_EXPENSES) {
      stmt.run(item.name, item.amount, 'fixed', item.card_account, item.who_pays);
    }
    for (const item of VARIABLE_EXPENSES) {
      stmt.run(item.name, item.amount, 'variable', item.card_account, item.who_pays || 'Shared');
    }
  });

  insert();

  const fixedTotal = FIXED_EXPENSES.reduce((s, i) => s + i.amount, 0);
  const variableTotal = VARIABLE_EXPENSES.reduce((s, i) => s + i.amount, 0);

  log.info(`Budget seeded: ${FIXED_EXPENSES.length} fixed ($${fixedTotal}/mo) + ${VARIABLE_EXPENSES.length} variable ($${variableTotal}/mo) = $${fixedTotal + variableTotal}/mo total`);
}

if (require.main === module) {
  run();
}

module.exports = { run };
