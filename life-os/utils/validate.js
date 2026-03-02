/**
 * Sanitize string input - trim and limit length
 */
function sanitizeString(val, maxLength = 500) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

/**
 * Validate and parse positive integer
 */
function parsePositiveInt(val, defaultVal = 0) {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : defaultVal;
}

/**
 * Validate date string (YYYY-MM-DD)
 */
function isValidDate(val) {
  if (typeof val !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val));
}

/**
 * Validate owner field
 */
function isValidOwner(val) {
  return ['michelle', 'gray', 'shared'].includes(val?.toLowerCase());
}

/**
 * Validate transaction input
 */
function validateTransaction(body) {
  const errors = [];
  if (!body.date || !isValidDate(body.date)) errors.push('Invalid date (YYYY-MM-DD required)');
  if (!body.merchant || typeof body.merchant !== 'string') errors.push('Merchant required');
  if (body.amount === undefined || typeof body.amount !== 'number') errors.push('Amount must be a number');
  if (!body.owner || !isValidOwner(body.owner)) errors.push('Owner must be michelle, gray, or shared');
  return errors;
}

module.exports = { sanitizeString, parsePositiveInt, isValidDate, isValidOwner, validateTransaction };
