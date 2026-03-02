const logger = require('../config/logger');
const { getDb } = require('../config/database');

const gmailService = {
  async syncInbox() {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!clientId || !refreshToken) {
      logger.warn('Gmail not configured — see docs/GMAIL_SETUP.md');
      return { skipped: true, reason: 'not_configured' };
    }

    // TODO: Implement full Gmail sync once OAuth is configured
    // 1. Exchange refresh token for access token
    // 2. Fetch threads from last 24h
    // 3. Classify recruiter emails (from patterns: @greenhouse.io, @lever.co, talent@, recruiting@, etc.)
    // 4. Detect needs_response (unread + from known contact + no reply sent)
    // 5. Upsert into gmail_threads table

    logger.info('Gmail sync: stub — configure OAuth to enable');
    return { skipped: true, reason: 'stub_implementation' };
  },

  getUnreadCount() {
    const db = getDb();
    return db.prepare("SELECT COUNT(*) as cnt FROM gmail_threads WHERE is_read = 0").get().cnt;
  },

  getNeedsResponseCount() {
    const db = getDb();
    return db.prepare("SELECT COUNT(*) as cnt FROM gmail_threads WHERE needs_response = 1 AND is_read = 0").get().cnt;
  },

  getRecruiterEmails(limit = 20) {
    const db = getDb();
    return db.prepare("SELECT * FROM gmail_threads WHERE is_recruiter = 1 ORDER BY received_at DESC LIMIT ?").all(limit);
  }
};

module.exports = gmailService;
