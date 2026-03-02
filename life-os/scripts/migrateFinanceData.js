#!/usr/bin/env node
/**
 * Finance Data Migration Script
 * Extracts embedded transaction data from finance-dashboard.html
 * and imports into SQLite database
 */

const fs = require('fs');
const path = require('path');
const { getDb } = require('../config/database');
const logger = require('../config/logger');

// Path to source HTML file
const SOURCE_HTML = path.join(
  process.env.HOME,
  'SHELZYS LIFE PORTAL/Finances/Gray vs. Michelle 2.24.26/finance-dashboard.html'
);

/**
 * Extract JavaScript arrays from HTML script tag
 */
function extractArrays(htmlContent) {
  // Extract mTxns array
  const mTxnsMatch = htmlContent.match(/const mTxns=\[([\s\S]*?)\];/);
  if (!mTxnsMatch) {
    throw new Error('Could not find mTxns array in HTML');
  }

  // Extract gTxns array
  const gTxnsMatch = htmlContent.match(/const gTxns=\[([\s\S]*?)\];/);
  if (!gTxnsMatch) {
    throw new Error('Could not find gTxns array in HTML');
  }

  return {
    mTxnsStr: `[${mTxnsMatch[1]}]`,
    gTxnsStr: `[${gTxnsMatch[1]}]`
  };
}

/**
 * Parse transaction arrays from string
 */
function parseArrays(mTxnsStr, gTxnsStr) {
  const mTxns = eval(mTxnsStr);
  const gTxns = eval(gTxnsStr);
  return { mTxns, gTxns };
}

/**
 * Normalize date formats
 * Michelle: M/D/YY -> YYYY-MM-DD
 * Gray: YYYY-MM-DD (already correct)
 */
function normalizeDate(dateStr, owner) {
  if (owner === 'michelle') {
    // M/D/YY format
    const [month, day, year] = dateStr.split('/');
    const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
    return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  // Gray's format is already YYYY-MM-DD
  return dateStr;
}

/**
 * Insert transactions into database
 */
function insertTransactions(db, mTxns, gTxns) {
  const stmt = db.prepare(`
    INSERT INTO finance_transactions (
      date, merchant, amount, category, account, owner, classification, type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let insertedCount = 0;

  // Insert Michelle's transactions
  for (const txn of mTxns) {
    const [date, merchant, amount, category, account, classification, type] = txn;
    try {
      stmt.run(
        normalizeDate(date, 'michelle'),
        merchant,
        amount,
        category,
        account,
        'michelle',
        classification,
        type
      );
      insertedCount++;
    } catch (err) {
      logger.warn(`Failed to insert Michelle transaction: ${merchant}`, err.message);
    }
  }

  logger.info(`Inserted ${insertedCount} Michelle transactions`);

  let grayInserted = 0;

  // Insert Gray's transactions
  for (const txn of gTxns) {
    const [date, merchant, amount, category, account, owner, type] = txn;
    try {
      stmt.run(
        normalizeDate(date, 'gray'),
        merchant,
        amount,
        category,
        account,
        'gray',
        'regular', // Gray's data doesn't have explicit classification
        type
      );
      grayInserted++;
    } catch (err) {
      logger.warn(`Failed to insert Gray transaction: ${merchant}`, err.message);
    }
  }

  logger.info(`Inserted ${grayInserted} Gray transactions`);
  return insertedCount + grayInserted;
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    logger.info('Starting finance data migration...');

    // Check if source file exists
    if (!fs.existsSync(SOURCE_HTML)) {
      throw new Error(`Source file not found: ${SOURCE_HTML}`);
    }

    // Read HTML file
    logger.info(`Reading source file: ${SOURCE_HTML}`);
    const htmlContent = fs.readFileSync(SOURCE_HTML, 'utf8');

    // Extract arrays
    logger.info('Extracting transaction arrays from HTML...');
    const { mTxnsStr, gTxnsStr } = extractArrays(htmlContent);

    // Parse arrays
    logger.info('Parsing transaction arrays...');
    const { mTxns, gTxns } = parseArrays(mTxnsStr, gTxnsStr);
    logger.info(`Found ${mTxns.length} Michelle transactions and ${gTxns.length} Gray transactions`);

    // Get database connection
    const db = getDb();

    // Insert transactions
    logger.info('Inserting transactions into database...');
    const totalInserted = insertTransactions(db, mTxns, gTxns);

    logger.info(`✓ Migration complete! Inserted ${totalInserted} transactions total`);
    console.log(`\n✓ Successfully migrated ${totalInserted} transactions`);
    console.log(`  - Michelle: ${mTxns.length} transactions`);
    console.log(`  - Gray: ${gTxns.length} transactions`);

  } catch (error) {
    logger.error('Migration failed:', error);
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrate();
