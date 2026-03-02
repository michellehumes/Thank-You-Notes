require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { initializeDb, getDb, closeDb } = require('../config/database');
const financeService = require('../services/financeService');
const logger = require('../config/logger');

const FINANCE_HTML_PATH = path.join(__dirname, '..', '..', 'SHELZYS LIFE PORTAL', 'Finances', 'Gray vs. Michelle 2.24.26', 'finance-dashboard.html');

// ---------------------------------------------------------------------------
// Extract JS array from HTML source using JSON.parse after cleanup
// ---------------------------------------------------------------------------
function extractArrayFromHtml(html, varName) {
  const regex = new RegExp(`const\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`);
  const match = html.match(regex);
  if (!match) throw new Error(`Could not find ${varName} in HTML`);
  // The arrays are already valid JSON (arrays of arrays with strings/numbers)
  // Just need to ensure it parses correctly
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    // If JSON.parse fails, try minor cleanup: replace single quotes if any
    const cleaned = match[1].replace(/'/g, '"');
    return JSON.parse(cleaned);
  }
}

// ---------------------------------------------------------------------------
// Normalize Michelle transaction row
// Columns: [date(M/D/YY), merchant, amount, category, account, type, classification]
// ---------------------------------------------------------------------------
function normalizeMichelleTxn(row) {
  const [dateStr, merchant, amount, category, account, type, classification] = row;
  // Parse M/D/YY -> YYYY-MM-DD
  const parts = dateStr.split('/');
  const year = parseInt(parts[2]) + 2000;
  const month = parts[0].padStart(2, '0');
  const day = parts[1].padStart(2, '0');
  const date = `${year}-${month}-${day}`;
  const mask = account.match(/\d{4}/)?.[0] || '';
  return {
    date,
    merchant,
    amount,
    category,
    account,
    account_mask: mask,
    owner: 'michelle',
    classification,
    type: type || 'regular',
    is_recurring: 0,
    notes: null,
    source: 'html_migration'
  };
}

// ---------------------------------------------------------------------------
// Normalize Gray transaction row
// Columns: [date(YYYY-MM-DD), merchant, amount, category, account, owner_name, classification]
// Note: owner_name field can be "Gray Perkins", "Michelle Humes", or "Shared"
// ---------------------------------------------------------------------------
function normalizeGrayTxn(row) {
  const [date, merchant, amount, category, account, ownerName, classification] = row;
  const mask = account.match(/\d{4}/)?.[0] || '';
  // Some of Gray's transactions are actually Michelle's (e.g. "YouTube TV (Michelle)")
  const actualOwner = (ownerName || '').toLowerCase().includes('michelle') ? 'michelle' : 'gray';
  return {
    date,
    merchant,
    amount,
    category,
    account,
    account_mask: mask,
    owner: actualOwner,
    classification,
    type: (amount > 0 && (category === 'Income' || category === 'Payment')) ? 'income' : 'regular',
    is_recurring: 0,
    notes: null,
    source: 'html_migration'
  };
}

// ---------------------------------------------------------------------------
// Migrate budget items
// ---------------------------------------------------------------------------
function migrateBudgetItems() {
  const db = getDb();
  const budgetItems = [
    { name: 'Rent (12 Harbor St)', amount: 7500, type: 'fixed', card_account: 'Venmo/Zelle', who_pays: 'Both ($3,750 each)', notes: null },
    { name: 'BMW X3 Payment', amount: 751, type: 'fixed', card_account: 'Auto-debit checking', who_pays: 'Gray', notes: null },
    { name: 'Car Insurance (Geico)', amount: 153, type: 'fixed', card_account: 'Venture', who_pays: 'Gray', notes: null },
    { name: 'Electricity (PSEG)', amount: 235, type: 'fixed', card_account: 'Venture', who_pays: 'Gray', notes: null },
    { name: 'Internet (Optimum)', amount: 100, type: 'fixed', card_account: 'Venture', who_pays: 'Gray', notes: null },
    { name: 'Garbage (Maggio)', amount: 75, type: 'fixed', card_account: 'Venture', who_pays: 'Gray', notes: null },
    { name: 'Heating Oil (seasonal avg)', amount: 200, type: 'fixed', card_account: 'Venture', who_pays: 'Gray', notes: null },
    { name: 'Storage (Goodfriend)', amount: 211, type: 'fixed', card_account: 'Venture', who_pays: 'Gray', notes: null },
    { name: 'Ring/Lemonade Insurance', amount: 51, type: 'fixed', card_account: 'Venture', who_pays: 'Gray', notes: null },
    { name: 'Shared Groceries', amount: 700, type: 'variable', card_account: 'Amex Gold (4X)', who_pays: 'Shared', notes: null },
    { name: 'Shared Dining Out', amount: 600, type: 'variable', card_account: 'Amex Gold (4X)', who_pays: 'Shared', notes: null },
    { name: 'Shared Delivery/Uber Eats', amount: 300, type: 'variable', card_account: 'Amex Gold (4X)', who_pays: 'Shared', notes: null },
    { name: 'Gas / Car Wash', amount: 150, type: 'variable', card_account: 'Venture (2X)', who_pays: 'Shared', notes: null },
    { name: 'Tolls / E-ZPass', amount: 75, type: 'variable', card_account: 'Venture (2X)', who_pays: 'Shared', notes: null },
    { name: 'Shared Home / Target', amount: 200, type: 'variable', card_account: 'Chase UR 1041', who_pays: 'Shared', notes: null },
    { name: 'Shared Travel (avg)', amount: 232, type: 'variable', card_account: 'Venture (2X)', who_pays: 'Shared', notes: null }
  ];

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO budget_items (name, amount, type, card_account, who_pays, notes)
    VALUES (@name, @amount, @type, @card_account, @who_pays, @notes)
  `);

  const insertAll = db.transaction(() => {
    for (const item of budgetItems) {
      stmt.run(item);
    }
  });
  insertAll();

  logger.info(`Migrated ${budgetItems.length} budget items`);
  return budgetItems.length;
}

// ---------------------------------------------------------------------------
// Migrate accounts
// ---------------------------------------------------------------------------
function migrateAccounts() {
  const db = getDb();
  const accounts = [
    // Michelle's accounts
    { name: 'PNC Bugs Checking', mask: '3045', owner: 'michelle', type: 'checking', purpose: 'Primary checking', balance: null, notes: null },
    { name: 'Chase Ultimate Rewards', mask: '9759', owner: 'michelle', type: 'credit', purpose: 'Rewards card', balance: null, notes: null },
    { name: 'Chase Ultimate Rewards', mask: '1041', owner: 'michelle', type: 'credit', purpose: 'Rewards card (shared)', balance: null, notes: null },
    { name: 'Prime Visa', mask: '5990', owner: 'michelle', type: 'credit', purpose: 'Amazon purchases', balance: null, notes: null },
    { name: 'Marriott Bonvoy Amex', mask: '5005', owner: 'michelle', type: 'credit', purpose: 'Travel rewards', balance: null, notes: null },
    { name: 'USAA', mask: '443', owner: 'michelle', type: 'credit', purpose: 'General', balance: null, notes: null },
    { name: 'Bluevine (Shelzys Designs)', mask: '5301', owner: 'michelle', type: 'business_checking', purpose: 'Business account', balance: null, notes: null },
    { name: 'Interest Checking', mask: '1583', owner: 'michelle', type: 'checking', purpose: 'Savings/interest', balance: null, notes: null },

    // Gray's accounts
    { name: 'WF Checking', mask: '4688', owner: 'gray', type: 'checking', purpose: 'Primary checking', balance: null, notes: null },
    { name: 'Capital One Venture', mask: '4522', owner: 'gray', type: 'credit', purpose: 'Travel rewards (2X)', balance: null, notes: null },
    { name: 'Amex Gold', mask: '2003', owner: 'gray', type: 'credit', purpose: 'Dining/groceries (4X)', balance: null, notes: null },
    { name: 'Amex Platinum', mask: '1007', owner: 'gray', type: 'credit', purpose: 'Travel/premium', balance: null, notes: null }
  ];

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO accounts (name, mask, owner, type, purpose, balance, last_updated, notes)
    VALUES (@name, @mask, @owner, @type, @purpose, @balance, datetime('now'), @notes)
  `);

  const insertAll = db.transaction(() => {
    for (const acct of accounts) {
      stmt.run(acct);
    }
  });
  insertAll();

  logger.info(`Migrated ${accounts.length} accounts`);
  return accounts.length;
}

// ---------------------------------------------------------------------------
// Main migration orchestrator
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== Finance Data Migration ===\n');

  // 1. Check source file exists
  if (!fs.existsSync(FINANCE_HTML_PATH)) {
    console.error(`Source HTML not found: ${FINANCE_HTML_PATH}`);
    process.exit(1);
  }
  console.log(`Source: ${FINANCE_HTML_PATH}`);

  // 2. Initialize DB
  initializeDb();
  console.log('Database initialized.\n');

  try {
    // 3. Read and parse HTML
    const html = fs.readFileSync(FINANCE_HTML_PATH, 'utf8');
    console.log('HTML file read successfully.');

    const mTxns = extractArrayFromHtml(html, 'mTxns');
    const gTxns = extractArrayFromHtml(html, 'gTxns');
    console.log(`Extracted: ${mTxns.length} Michelle txns, ${gTxns.length} Gray txns\n`);

    // 4. Clear existing migration data to allow re-runs
    const db = getDb();
    db.prepare("DELETE FROM finance_transactions WHERE source = 'html_migration'").run();
    console.log('Cleared previous migration data (if any).');

    // 5. Normalize and insert Michelle's transactions
    const michelleNormalized = mTxns.map(normalizeMichelleTxn);
    const mCount = financeService.insertMany(michelleNormalized);
    console.log(`Inserted ${mCount} Michelle transactions.`);

    // 6. Normalize and insert Gray's transactions
    const grayNormalized = gTxns.map(normalizeGrayTxn);
    const gCount = financeService.insertMany(grayNormalized);
    console.log(`Inserted ${gCount} Gray transactions.`);

    // 7. Migrate budget items
    const bCount = migrateBudgetItems();
    console.log(`Inserted ${bCount} budget items.`);

    // 8. Migrate accounts
    const aCount = migrateAccounts();
    console.log(`Inserted ${aCount} accounts.`);

    // 9. Update sync state
    db.prepare(`UPDATE sync_state SET last_sync_at = datetime('now'), last_sync_status = 'success', records_synced = @count WHERE service = 'finance'`)
      .run({ count: mCount + gCount });

    // 10. Summary
    console.log('\n=== Migration Summary ===');
    console.log(`Michelle transactions: ${mCount}`);
    console.log(`Gray transactions:     ${gCount}`);
    console.log(`Total transactions:    ${mCount + gCount}`);
    console.log(`Budget items:          ${bCount}`);
    console.log(`Accounts:              ${aCount}`);
    console.log('\nMigration complete!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    logger.error('Migration failed', { error: err.message, stack: err.stack });
    process.exit(1);
  } finally {
    closeDb();
  }
}

main();
