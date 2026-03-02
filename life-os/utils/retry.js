const logger = require('../config/logger');

/**
 * Retry with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} opts - Options
 * @param {number} opts.maxRetries - Max retry attempts (default 3)
 * @param {number} opts.baseDelay - Base delay in ms (default 1000)
 * @param {number} opts.maxDelay - Max delay in ms (default 30000)
 * @param {string} opts.label - Label for logging
 */
async function retry(fn, opts = {}) {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, label = 'operation' } = opts;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt > maxRetries) break;

      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const jitter = delay * (0.5 + Math.random() * 0.5);
      logger.warn(`${label} failed (attempt ${attempt}/${maxRetries + 1}), retrying in ${Math.round(jitter)}ms`, {
        error: err.message
      });
      await new Promise(resolve => setTimeout(resolve, jitter));
    }
  }

  logger.error(`${label} failed after ${maxRetries + 1} attempts`, { error: lastError.message });
  throw lastError;
}

module.exports = { retry };
