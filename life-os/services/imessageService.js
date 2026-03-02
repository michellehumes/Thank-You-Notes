const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const { getDb } = require('../config/database');

/**
 * iMessage Service
 * 
 * Reads macOS Messages database (chat.db) to extract conversation threads.
 * Identifies priority contacts with unanswered messages.
 * 
 * Requirements:
 * - System Integrity Protection must allow access to ~/Library/Messages/
 * - Grant Full Disk Access permission to Terminal/Node.js in System Preferences
 * - macOS version 10.13+ (messages db structure)
 */

// Apple epoch: Jan 1, 2001 (41 years before Unix epoch of Jan 1, 1970)
const APPLE_EPOCH_OFFSET = 978307200;

/**
 * Get the Messages database path
 */
function getMessagesDbPath() {
  const envPath = process.env.IMESSAGE_DB_PATH;
  if (envPath) {
    return envPath.replace('~', process.env.HOME || os.homedir());
  }
  return path.join(process.env.HOME || os.homedir(), 'Library', 'Messages', 'chat.db');
}

/**
 * Check if Messages database is accessible
 */
function isDatabaseAccessible() {
  const dbPath = getMessagesDbPath();
  
  try {
    return fs.existsSync(dbPath) && fs.accessSync(dbPath, fs.constants.R_OK) === undefined;
  } catch (error) {
    logger.warn(`iMessage database not accessible at ${dbPath}: ${error.message}`);
    return false;
  }
}

/**
 * Convert Apple epoch timestamp to ISO date string
 * Apple timestamps are seconds since Jan 1, 2001
 */
function appleTimestampToDate(appleTimestamp) {
  if (!appleTimestamp) return null;
  
  try {
    // Apple timestamps are often in nanoseconds (multiply by 1000 to convert to ms)
    const milliseconds = (appleTimestamp / 1000) + (APPLE_EPOCH_OFFSET * 1000);
    const date = new Date(milliseconds);
    return date.toISOString().split('T')[0]; // Return date only (YYYY-MM-DD)
  } catch (error) {
    logger.warn(`Failed to convert Apple timestamp ${appleTimestamp}:`, error.message);
    return null;
  }
}

/**
 * Parse handle identifiers (phone number or email)
 */
function parseHandle(handleId) {
  if (!handleId) return null;
  
  // Remove country codes and formatting
  // Examples: +1-415-555-1234 -> 415-555-1234 / email@example.com -> email@example.com
  const normalized = handleId
    .trim()
    .replace(/^\+1/, '')  // Remove +1 country code
    .replace(/[\s()-]/g, ''); // Remove formatting
  
  return normalized;
}

/**
 * Fetch iMessage threads from chat.db
 */
function fetchMessageThreads() {
  if (!isDatabaseAccessible()) {
    logger.warn('iMessage sync skipped - database not accessible');
    logger.info('To enable iMessage sync, grant Full Disk Access permission to Node.js in System Preferences');
    return [];
  }

  const dbPath = getMessagesDbPath();
  
  try {
    // Open database in read-only mode
    const Database = require('better-sqlite3');
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });
    
    // Get the most recent message from each handle
    // Messages table schema varies by macOS version, but core fields are:
    // - message_id, handle_id, date (Apple epoch), text, cache_roomnames, is_from_me
    const query = `
      SELECT 
        h.id as handle_id,
        COALESCE(h.uncanonicalized_id, h.id) as contact_identifier,
        MAX(m.date) as last_message_date,
        MAX(m.date_read) as last_read_date,
        COUNT(*) as message_count,
        COUNT(CASE WHEN m.is_from_me = 0 THEN 1 END) as incoming_count
      FROM message m
      LEFT JOIN handle h ON m.handle_id = h.ROWID
      GROUP BY h.ROWID
      ORDER BY MAX(m.date) DESC
    `;

    const threads = db.prepare(query).all();
    db.close();

    return threads || [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('iMessage database not found. Ensure macOS Messages app is installed.');
    } else {
      logger.error('Failed to read iMessage database:', error.message);
    }
    return [];
  }
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
    `).run('imessage', now, status, error);
  } catch (err) {
    logger.error('Failed to update iMessage sync state:', err.message);
  }
}

/**
 * Upsert thread data into database
 */
function upsertThreads(threads) {
  const db = getDb();
  const now = new Date();

  try {
    const stmt = db.prepare(`
      INSERT INTO imessage_threads (
        handle_id, contact_name, last_message, unanswered_hours, is_priority_contact
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(handle_id) DO UPDATE SET
        last_message = excluded.last_message,
        unanswered_hours = excluded.unanswered_hours
    `);

    let inserted = 0;
    threads.forEach(thread => {
      if (!thread.contact_identifier) return;

      // Calculate hours since last message
      const lastMessageDate = appleTimestampToDate(thread.last_message_date);
      let unansweredHours = 0;

      if (lastMessageDate) {
        const lastDate = new Date(lastMessageDate + 'T00:00:00Z');
        const hoursDiff = (now - lastDate) / (1000 * 60 * 60);
        unansweredHours = Math.round(hoursDiff);
      }

      // Incoming messages with no read timestamp = unanswered
      const isUnanswered = thread.incoming_count > 0 && !thread.last_read_date;

      stmt.run(
        thread.handle_id || thread.contact_identifier,
        parseHandle(thread.contact_identifier),
        lastMessageDate,
        isUnanswered ? unansweredHours : 0,
        0  // is_priority_contact - will be set manually or via contacts service
      );

      inserted++;
    });

    logger.info(`Upserted ${inserted} iMessage threads`);
    return inserted;
  } catch (error) {
    logger.error('Failed to upsert iMessage threads:', error.message);
    throw error;
  }
}

/**
 * Main sync function
 */
async function syncImessageData() {
  try {
    if (!isDatabaseAccessible()) {
      updateSyncState('skipped');
      return {
        success: false,
        reason: 'iMessage database not accessible. Grant Full Disk Access permission.'
      };
    }

    logger.info('Syncing iMessage threads...');
    const threads = fetchMessageThreads();

    if (threads.length === 0) {
      logger.info('No iMessage threads found');
      updateSyncState('success');
      return { success: true, recordsProcessed: 0 };
    }

    const inserted = upsertThreads(threads);
    updateSyncState('success');

    logger.info('iMessage sync completed successfully');
    return { success: true, recordsProcessed: inserted };
  } catch (error) {
    updateSyncState('error', error.message);
    logger.error('iMessage sync failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get unanswered threads (for todos)
 */
function getUnansweredThreads() {
  const db = getDb();

  try {
    return db.prepare(`
      SELECT
        handle_id,
        contact_name,
        last_message,
        unanswered_hours,
        is_priority_contact
      FROM imessage_threads
      WHERE unanswered_hours > 0
      ORDER BY unanswered_hours DESC
    `).all();
  } catch (error) {
    logger.error('Failed to get unanswered threads:', error.message);
    return [];
  }
}

/**
 * Get priority contacts with recent messages
 */
function getPriorityContactThreads() {
  const db = getDb();

  try {
    return db.prepare(`
      SELECT
        handle_id,
        contact_name,
        last_message,
        unanswered_hours
      FROM imessage_threads
      WHERE is_priority_contact = 1
      ORDER BY last_message DESC
      LIMIT 20
    `).all();
  } catch (error) {
    logger.error('Failed to get priority contacts:', error.message);
    return [];
  }
}

module.exports = {
  syncImessageData,
  getUnansweredThreads,
  getPriorityContactThreads,
  isDatabaseAccessible,
  fetchMessageThreads,
  updateSyncState
};
