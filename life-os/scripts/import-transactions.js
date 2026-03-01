#!/usr/bin/env node
/**
 * Transaction Import Script
 * Sources:
 *   1. Embedded mTxns/gTxns arrays from finance-dashboard.html
 *   2. Gray CSV: Transactions_2026-02-24T10-13-59.csv
 *   3. Michelle CSV: transactions (11).csv
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('import');

// ── Date Normalization ──────────────────────────────
function normalizeDate(raw) {
  if (!raw) return null;
  const s = raw.trim();

  // YYYY-MM-DD already correct
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // M/D/YY or M/D/YYYY
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdy) {
    let [, m, d, y] = mdy;
    if (y.length === 2) y = (parseInt(y) > 50 ? '19' : '20') + y;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try Date parse as fallback
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  log.warn(`Could not parse date: "${s}"`);
  return s;
}

// ── Extract Embedded Arrays from HTML ───────────────
function extractEmbeddedData(htmlPath) {
  if (!fs.existsSync(htmlPath)) {
    log.warn(`HTML file not found: ${htmlPath}`);
    return { mTxns: [], gTxns: [] };
  }

  const html = fs.readFileSync(htmlPath, 'utf-8');

  function extractArray(varName) {
    const regex = new RegExp(`const\\s+${varName}\\s*=\\s*\\[`, 's');
    const match = html.match(regex);
    if (!match) {
      log.warn(`Could not find ${varName} in HTML`);
      return [];
    }

    const startIdx = match.index + match[0].length - 1;
    let depth = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < html.length; i++) {
      if (html[i] === '[') depth++;
      if (html[i] === ']') depth--;
      if (depth === 0) { endIdx = i + 1; break; }
    }

    try {
      return JSON.parse(html.substring(startIdx, endIdx));
    } catch (err) {
      log.error(`Failed to parse ${varName}: ${err.message}`);
      return [];
    }
  }

  return {
    mTxns: extractArray('mTxns'),
    gTxns: extractArray('gTxns')
  };
}

// ── Import Michelle Embedded Transactions ───────────
function importMichelleEmbedded(db, rows) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO transactions (date, merchant, amount, category, account, type, classification, owner, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'michelle', 'dashboard_embed')
  `);

  let count = 0;
  const insert = db.transaction((rows) => {
    for (const r of rows) {
      try {
        const date = normalizeDate(r[0]);
        stmt.run(date, r[1], r[2], r[3], r[4], r[5], r[6]);
        count++;
      } catch (err) {
        if (!err.message.includes('UNIQUE constraint')) {
          log.error(`Michelle embed row error: ${err.message}`, { row: r });
        }
      }
    }
  });

  insert(rows);
  log.info(`Michelle embedded: ${count} rows imported`);
  return count;
}

// ── Import Gray Embedded Transactions ────────────────
function importGrayEmbedded(db, rows) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO transactions (date, merchant, amount, category, account, owner, classification, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'dashboard_embed')
  `);

  let count = 0;
  const insert = db.transaction((rows) => {
    for (const r of rows) {
      try {
        const date = normalizeDate(r[0]);
        const owner = (r[5] || '').toLowerCase().includes('michelle') ? 'michelle' : 'gray';
        stmt.run(date, r[1], r[2], r[3], r[4], owner, r[6]);
        count++;
      } catch (err) {
        if (!err.message.includes('UNIQUE constraint')) {
          log.error(`Gray embed row error: ${err.message}`, { row: r });
        }
      }
    }
  });

  insert(rows);
  log.info(`Gray embedded: ${count} rows imported`);
  return count;
}

// ── Import Gray CSV ─────────────────────────────────
function importGrayCSV(db, csvPath) {
  if (!fs.existsSync(csvPath)) {
    log.warn(`Gray CSV not found: ${csvPath}`);
    return 0;
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO transactions (date, merchant, amount, category, account, original_statement, notes, tags, owner, classification, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'csv_gray')
  `);

  let count = 0;
  const insert = db.transaction((records) => {
    for (const r of records) {
      try {
        const date = normalizeDate(r['Date'] || r['date']);
        const merchant = r['Merchant'] || r['merchant'] || '';
        const amount = parseFloat(r['Amount'] || r['amount'] || 0);
        const category = r['Category'] || r['category'] || '';
        const account = r['Account'] || r['account'] || '';
        const statement = r['Original Statement'] || '';
        const notes = r['Notes'] || r['notes'] || '';
        const tags = r['Tags'] || r['tags'] || '';
        const owner = (r['Owner'] || 'gray').toLowerCase().includes('michelle') ? 'michelle' : 'gray';

        // Classify based on patterns
        let classification = 'personal';
        const cat = category.toLowerCase();
        const merch = merchant.toLowerCase();
        if (cat.includes('transfer') || cat.includes('payment')) classification = 'transfer';
        else if (cat.includes('income') || amount > 0 && cat.includes('payroll')) classification = 'transfer';
        else if (merch.includes('morgan stanley') || merch.includes('fundrise')) classification = 'investment';

        stmt.run(date, merchant, amount, category, account, statement, notes, tags, owner, classification);
        count++;
      } catch (err) {
        if (!err.message.includes('UNIQUE constraint')) {
          log.error(`Gray CSV row error: ${err.message}`);
        }
      }
    }
  });

  insert(records);
  log.info(`Gray CSV: ${count} rows imported from ${csvPath}`);
  return count;
}

// ── Import Michelle CSV ─────────────────────────────
function importMichelleCSV(db, csvPath) {
  if (!fs.existsSync(csvPath)) {
    log.warn(`Michelle CSV not found: ${csvPath}`);
    return 0;
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(raw, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true });

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO transactions (date, merchant, amount, category, parent_category, account, account_mask, type, tags, notes, recurring, owner, classification, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'michelle', ?, 'csv_michelle')
  `);

  let count = 0;
  const insert = db.transaction((records) => {
    for (const r of records) {
      try {
        const date = normalizeDate(r['date'] || r['Date']);
        const merchant = r['name'] || r['Name'] || r['merchant'] || r['Merchant'] || '';
        const amount = parseFloat(r['amount'] || r['Amount'] || 0);
        const category = r['category'] || r['Category'] || '';
        const parentCat = r['parent category'] || r['Parent Category'] || '';
        const account = r['account'] || r['Account'] || '';
        const accountMask = r['account mask'] || r['Account Mask'] || '';
        const type = r['type'] || r['Type'] || '';
        const tags = r['tags'] || r['Tags'] || '';
        const notes = r['note'] || r['Note'] || r['notes'] || '';
        const recurring = (r['recurring'] || r['Recurring'] || '').toLowerCase() === 'true' ? 1 : 0;

        // Classify
        let classification = 'personal';
        const cat = category.toLowerCase();
        if (cat.includes('transfer') || cat.includes('payment')) classification = 'transfer';
        else if (cat.includes('investment')) classification = 'investment';
        else if (cat.includes('business') || merchant.toLowerCase().includes('shelzy')) classification = 'business';

        stmt.run(date, merchant, amount, category, parentCat, account, accountMask, type, tags, notes, recurring, classification);
        count++;
      } catch (err) {
        if (!err.message.includes('UNIQUE constraint')) {
          log.error(`Michelle CSV row error: ${err.message}`);
        }
      }
    }
  });

  insert(records);
  log.info(`Michelle CSV: ${count} rows imported from ${csvPath}`);
  return count;
}

// ── Main ────────────────────────────────────────────
function run() {
  const db = getDb();

  const repoRoot = path.resolve(__dirname, '..', '..');
  const financeDir = path.join(repoRoot, 'SHELZYS LIFE PORTAL', 'Finances', 'Gray vs. Michelle 2.24.26');
  const htmlPath = path.join(financeDir, 'finance-dashboard.html');

  log.info('Starting transaction import...');

  // 1. Extract and import embedded data
  const { mTxns, gTxns } = extractEmbeddedData(htmlPath);
  const mEmbedCount = importMichelleEmbedded(db, mTxns);
  const gEmbedCount = importGrayEmbedded(db, gTxns);

  // 2. Import CSVs
  const gCsvPath = path.join(financeDir, 'Transactions_2026-02-24T10-13-59.csv');
  const mCsvPath = path.join(financeDir, 'transactions (11).csv');
  const gCsvCount = importGrayCSV(db, gCsvPath);
  const mCsvCount = importMichelleCSV(db, mCsvPath);

  // 3. Summary
  const total = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  const byOwner = db.prepare('SELECT owner, COUNT(*) as count FROM transactions GROUP BY owner').all();

  log.info('=== Import Complete ===');
  log.info(`Total transactions: ${total}`);
  byOwner.forEach(r => log.info(`  ${r.owner}: ${r.count}`));
  log.info(`Sources: embed_m=${mEmbedCount}, embed_g=${gEmbedCount}, csv_g=${gCsvCount}, csv_m=${mCsvCount}`);

  return total;
}

if (require.main === module) {
  run();
}

module.exports = { run, normalizeDate };
