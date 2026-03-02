const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// We need to mock the database module before requiring financeService
let mockDb;

// Set up in-memory database with schema
before(() => {
  mockDb = new Database(':memory:');
  mockDb.pragma('journal_mode = WAL');
  mockDb.pragma('foreign_keys = ON');

  const schemaPath = path.join(__dirname, '..', 'database', 'init.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  mockDb.exec(schema);

  // Mock the database module
  const dbModule = require('../config/database');
  dbModule.getDb = () => mockDb;
});

after(() => {
  if (mockDb) mockDb.close();
});

const financeService = require('../services/financeService');

describe('financeService', () => {
  it('should insert a single transaction', () => {
    const result = financeService.insertTransaction({
      date: '2025-01-15', merchant: 'Whole Foods', amount: -85.50,
      category: 'Groceries', account: 'Amex Gold', account_mask: '2003',
      owner: 'gray', classification: 'essential', type: 'regular'
    });
    assert.strictEqual(result.changes, 1);
  });

  it('should insert many transactions', () => {
    const txns = [
      { date: '2025-01-10', merchant: 'Target', amount: -42.00, owner: 'michelle', category: 'Shopping' },
      { date: '2025-01-11', merchant: 'Uber Eats', amount: -28.50, owner: 'gray', category: 'Dining' },
      { date: '2025-01-12', merchant: 'Salary', amount: 5000, owner: 'michelle', category: 'Income', type: 'income' }
    ];
    const count = financeService.insertMany(txns);
    assert.strictEqual(count, 3);
  });

  it('should retrieve transactions with filters', () => {
    const grayTxns = financeService.getTransactions({ owner: 'gray' });
    assert.ok(grayTxns.length >= 2);
    assert.ok(grayTxns.every(t => t.owner === 'gray'));
  });

  it('should calculate runway', () => {
    // Insert enough data for burn rate calculation
    const txns = [];
    for (let m = 1; m <= 3; m++) {
      const month = String(m).padStart(2, '0');
      txns.push({ date: `2025-${month}-01`, merchant: 'Rent', amount: -3000, owner: 'gray', category: 'Housing' });
      txns.push({ date: `2025-${month}-15`, merchant: 'Food', amount: -500, owner: 'gray', category: 'Groceries' });
    }
    financeService.insertMany(txns);

    const runway = financeService.getRunway(50000);
    assert.ok(typeof runway.avg_burn === 'number');
    assert.ok(typeof runway.runway_months === 'number');
    assert.ok(['healthy', 'caution', 'critical'].includes(runway.status));
  });
});
