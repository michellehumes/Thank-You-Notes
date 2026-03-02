const logger = require('../config/logger');
const { getDb } = require('../config/database');

/**
 * Gmail Integration Service (Stub)
 * 
 * This service provides a stub for Gmail integration. The full OAuth flow
 * is set up manually via the Google Cloud Console. See docs/GMAIL_SETUP.md
 * for complete setup instructions.
 * 
 * Once configured, this service will:
 * - Fetch email threads from authenticated user's Gmail
 * - Identify recruiter emails and responses
 * - Persist thread metadata to gmail_threads table
 * - Track sync state for dashboard
 */

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1/users/me';

/**
 * Check if Gmail is configured
 */
function isConfigured() {
  return !!process.env.GMAIL_REFRESH_TOKEN;
}

/**
 * Initialize Gmail service - checks configuration
 */
function initialize() {
  if (!isConfigured()) {
    logger.warn('Gmail service not configured. See docs/GMAIL_SETUP.md for setup instructions.');
    return false;
  }

  logger.info('Gmail service configured and ready');
  return true;
}

/**
 * Update sync state in database
 */
function updateSyncState(status, error = null) {
  const db = getDb();

  try {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO sync_state (service, last_sync_at, last_sync_status, error_message)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(service) DO UPDATE SET
        last_sync_at = excluded.last_sync_at,
        last_sync_status = excluded.last_sync_status,
        error_message = excluded.error_message
    `).run('gmail', now, status, error);
  } catch (err) {
    logger.error('Failed to update Gmail sync state:', err.message);
  }
}

/**
 * Main sync function - stub that acknowledges not being fully configured
 * 
 * In production, this would:
 * 1. Use GMAIL_REFRESH_TOKEN to get access token
 * 2. Fetch Gmail threads with pagination
 * 3. Parse thread subjects, senders, labels
 * 4. Identify recruiter emails (common recruiter domains)
 * 5. Check for unread/flagged status
 * 6. Upsert to gmail_threads table
 */
async function syncGmailData() {
  if (!isConfigured()) {
    logger.warn('Gmail sync skipped - service not configured');
    updateSyncState('skipped');
    return {
      success: false,
      reason: 'Gmail service not configured. See docs/GMAIL_SETUP.md'
    };
  }

  try {
    logger.info('Gmail sync placeholder - full implementation requires manual OAuth setup');
    updateSyncState('pending');
    
    return {
      success: true,
      recordsProcessed: 0,
      note: 'Awaiting OAuth configuration'
    };
  } catch (error) {
    updateSyncState('error', error.message);
    logger.error('Gmail sync error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Gmail thread statistics
 */
function getThreadStats() {
  const db = getDb();

  try {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_threads,
        COUNT(CASE WHEN is_recruiter THEN 1 END) as recruiter_threads,
        COUNT(CASE WHEN needs_response THEN 1 END) as needs_response_count
      FROM gmail_threads
    `).get();

    return stats || { total_threads: 0, recruiter_threads: 0, needs_response_count: 0 };
  } catch (error) {
    logger.error('Failed to get Gmail thread stats:', error.message);
    return null;
  }
}

/**
 * Get recent Gmail threads requiring response
 */
function getNeedsResponseThreads(limit = 10) {
  const db = getDb();

  try {
    return db.prepare(`
      SELECT
        thread_id,
        subject,
        from_email,
        is_recruiter,
        needs_response
      FROM gmail_threads
      WHERE needs_response = 1
      ORDER BY rowid DESC
      LIMIT ?
    `).all(limit);
  } catch (error) {
    logger.error('Failed to get needs-response threads:', error.message);
    return [];
  }
}

module.exports = {
  isConfigured,
  initialize,
  syncGmailData,
  getThreadStats,
  getNeedsResponseThreads,
  updateSyncState
};
