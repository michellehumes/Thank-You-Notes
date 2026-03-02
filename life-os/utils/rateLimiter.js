const logger = require('../config/logger');

/**
 * Simple in-memory rate limiter
 * @param {Object} opts
 * @param {number} opts.windowMs - Time window in ms (default 60000 = 1 min)
 * @param {number} opts.max - Max requests per window (default 60)
 */
function rateLimiter(opts = {}) {
  const { windowMs = 60000, max = 60 } = opts;
  const hits = new Map();

  // Cleanup old entries every window period
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of hits) {
      if (now - data.start > windowMs) hits.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip || '127.0.0.1';
    const now = Date.now();
    let record = hits.get(key);

    if (!record || now - record.start > windowMs) {
      record = { count: 0, start: now };
      hits.set(key, record);
    }

    record.count++;

    if (record.count > max) {
      logger.warn('Rate limit exceeded', { ip: key, count: record.count });
      return res.status(429).json({ error: 'Too many requests' });
    }

    next();
  };
}

module.exports = { rateLimiter };
