#!/usr/bin/env node
/**
 * Initialize the Life OS database
 * Creates schema, imports transactions, seeds budget
 */
const fs = require('fs');
const path = require('path');
const { getDb, DB_PATH } = require('../config/database');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('init-db');

function run() {
  log.info('Initializing Life OS database...');
  log.info(`Database path: ${DB_PATH}`);

  const db = getDb();

  // 1. Run schema
  const schemaPath = path.join(__dirname, '..', 'database', 'init.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  log.info('Schema created');

  // 2. Import transactions
  try {
    const { run: importTxns } = require('./import-transactions');
    importTxns();
  } catch (err) {
    log.error(`Transaction import failed: ${err.message}`);
  }

  // 3. Seed budget
  try {
    const { run: seedBudget } = require('./seed-budget');
    seedBudget();
  } catch (err) {
    log.error(`Budget seeding failed: ${err.message}`);
  }

  // 4. Summary
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
  log.info(`Database initialized with ${tables.length} tables: ${tables.map(t => t.name).join(', ')}`);

  const txnCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get().c;
  const budgetCount = db.prepare('SELECT COUNT(*) as c FROM budget_items').get().c;
  log.info(`Data: ${txnCount} transactions, ${budgetCount} budget items`);
}

run();
