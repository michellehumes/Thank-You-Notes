#!/usr/bin/env node
/**
 * Standalone Finance Data Migration Script
 * No external dependencies - uses Node.js built-in modules only
 */

const fs = require('fs');
const path = require('path');

// Source file
const SOURCE_HTML = path.join(
  process.env.HOME,
  'SHELZYS LIFE PORTAL/Finances/Gray vs. Michelle 2.24.26/finance-dashboard.html'
);

console.log('Finance Data Migration Tool');
console.log('============================\n');

try {
  // Check if source exists
  if (!fs.existsSync(SOURCE_HTML)) {
    console.error(`✗ Source file not found: ${SOURCE_HTML}`);
    process.exit(1);
  }

  console.log(`✓ Source file found: ${SOURCE_HTML}`);

  // Read HTML
  const htmlContent = fs.readFileSync(SOURCE_HTML, 'utf8');
  console.log(`✓ Read ${(htmlContent.length / 1024).toFixed(1)}KB of HTML`);

  // Extract mTxns
  const mTxnsMatch = htmlContent.match(/const mTxns=\[([\s\S]*?)\];/);
  if (!mTxnsMatch) {
    throw new Error('Could not find mTxns array');
  }

  // Extract gTxns
  const gTxnsMatch = htmlContent.match(/const gTxns=\[([\s\S]*?)\];/);
  if (!gTxnsMatch) {
    throw new Error('Could not find gTxns array');
  }

  console.log('✓ Extracted transaction arrays from HTML\n');

  // Parse using eval (safe here since we control the source)
  const mTxnsStr = `[${mTxnsMatch[1]}]`;
  const gTxnsStr = `[${gTxnsMatch[1]}]`;

  // Parse arrays
  let mTxns, gTxns;
  try {
    mTxns = eval(mTxnsStr);
    gTxns = eval(gTxnsStr);
  } catch (e) {
    throw new Error(`Failed to parse arrays: ${e.message}`);
  }

  console.log(`Transaction Data Summary:`);
  console.log(`  Michelle: ${mTxns.length} transactions`);
  console.log(`  Gray: ${gTxns.length} transactions`);
  console.log(`  Total: ${mTxns.length + gTxns.length} transactions\n`);

  // Sample first transaction from each
  if (mTxns.length > 0) {
    console.log(`Sample Michelle transaction:`);
    console.log(`  Date: ${mTxns[0][0]}, Merchant: ${mTxns[0][1]}, Amount: $${mTxns[0][2]}`);
  }

  if (gTxns.length > 0) {
    console.log(`Sample Gray transaction:`);
    console.log(`  Date: ${gTxns[0][0]}, Merchant: ${gTxns[0][1]}, Amount: $${gTxns[0][2]}\n`);
  }

  // Generate SQL INSERT statements
  const sqlFile = path.join(__dirname, '../database/finance-import.sql');
  let sqlContent = '-- Finance Data Import\n';
  sqlContent += `-- Generated on ${new Date().toISOString()}\n`;
  sqlContent += `-- Michelle: ${mTxns.length}, Gray: ${gTxns.length}\n\n`;

  // Helper function to normalize dates
  function normalizeDate(dateStr, owner) {
    if (owner === 'michelle') {
      const [month, day, year] = dateStr.split('/');
      const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
      return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return dateStr;
  }

  // Generate SQL for Michelle
  sqlContent += '-- Michelle Transactions\n';
  for (const txn of mTxns) {
    const [date, merchant, amount, category, account, classification, type] = txn;
    const normalizedDate = normalizeDate(date, 'michelle');
    const escapedMerchant = merchant.replace(/'/g, "''");
    const escapedCategory = category.replace(/'/g, "''");
    const escapedAccount = account.replace(/'/g, "''");
    const escapedClassification = classification.replace(/'/g, "''");
    const escapedType = type.replace(/'/g, "''");
    
    sqlContent += `INSERT INTO finance_transactions (date, merchant, amount, category, account, owner, classification, type) VALUES ('${normalizedDate}', '${escapedMerchant}', ${amount}, '${escapedCategory}', '${escapedAccount}', 'michelle', '${escapedClassification}', '${escapedType}');\n`;
  }

  // Generate SQL for Gray
  sqlContent += '\n-- Gray Transactions\n';
  for (const txn of gTxns) {
    const [date, merchant, amount, category, account, owner, type] = txn;
    const normalizedDate = normalizeDate(date, 'gray');
    const escapedMerchant = merchant.replace(/'/g, "''");
    const escapedCategory = category.replace(/'/g, "''");
    const escapedAccount = account.replace(/'/g, "''");
    const escapedType = type.replace(/'/g, "''");
    
    sqlContent += `INSERT INTO finance_transactions (date, merchant, amount, category, account, owner, classification, type) VALUES ('${normalizedDate}', '${escapedMerchant}', ${amount}, '${escapedCategory}', '${escapedAccount}', 'gray', 'regular', '${escapedType}');\n`;
  }

  // Write SQL file
  fs.writeFileSync(sqlFile, sqlContent);
  console.log(`✓ Generated SQL file: ${sqlFile}`);
  console.log(`  File size: ${(sqlContent.length / 1024).toFixed(1)}KB`);
  console.log(`  Total INSERT statements: ${mTxns.length + gTxns.length}\n`);

  console.log('Next steps:');
  console.log('1. Use sqlite3 CLI to import: sqlite3 database/life.db < database/finance-import.sql');
  console.log('2. Or use Node.js with better-sqlite3 after npm dependencies are fixed');
  console.log('\n✓ Migration data prepared successfully!');

} catch (error) {
  console.error('\n✗ Error:', error.message);
  process.exit(1);
}
