const Database = require('better-sqlite3');
const path = require('path');
const logger = require('../config/logger');
const { getDb } = require('../config/database');

const APPLE_EPOCH_OFFSET = 978307200;

const imessageService = {
  _getMessagesDb() {
    const dbPath = process.env.IMESSAGE_DB_PATH || path.join(process.env.HOME, 'Library', 'Messages', 'chat.db');
    try {
      return new Database(dbPath, { readonly: true, fileMustExist: true });
    } catch (err) {
      if (err.code === 'SQLITE_CANTOPEN') {
        logger.error('Cannot open iMessage database. Grant Full Disk Access to Terminal in System Settings > Privacy & Security');
      }
      throw err;
    }
  },

  _appleToDate(timestamp) {
    if (!timestamp) return null;
    // Handle both seconds and nanoseconds formats
    const seconds = timestamp > 1e15 ? timestamp / 1e9 : timestamp;
    return new Date((seconds + APPLE_EPOCH_OFFSET) * 1000);
  },

  syncThreads() {
    let msgDb;
    try {
      msgDb = this._getMessagesDb();
    } catch (err) {
      logger.warn('iMessage sync skipped: ' + err.message);
      const db = getDb();
      db.prepare(`UPDATE sync_state SET last_sync_at = datetime('now'), last_sync_status = 'error', error_message = @msg WHERE service = 'imessage'`).run({ msg: err.message });
      return { skipped: true, reason: err.message };
    }

    try {
      // Get recent conversations (last 7 days)
      const threads = msgDb.prepare(`
        SELECT
          h.id as handle_id,
          h.ROWID as handle_rowid,
          COALESCE(h.uncanonicalized_id, h.id) as contact_id,
          MAX(m.date) as last_message_date,
          m.text as last_text,
          m.is_from_me as last_is_from_me,
          COUNT(m.ROWID) as message_count
        FROM handle h
        JOIN chat_handle_join chj ON chj.handle_id = h.ROWID
        JOIN chat_message_join cmj ON cmj.chat_id = chj.chat_id
        JOIN message m ON m.ROWID = cmj.message_id
        WHERE m.date > ?
        GROUP BY h.id
        ORDER BY last_message_date DESC
      `).all((Date.now() / 1000 - APPLE_EPOCH_OFFSET - 7 * 86400) * 1e9);

      const db = getDb();
      const upsertStmt = db.prepare(`
        INSERT OR REPLACE INTO imessage_threads (handle_id, contact_name, last_message, last_message_at, is_from_me, unanswered_hours, is_priority_contact, message_count)
        VALUES (@handle_id, @contact_name, @last_message, @last_message_at, @is_from_me, @unanswered_hours, @is_priority_contact, @message_count)
      `);

      let synced = 0;
      const upsertAll = db.transaction(() => {
        for (const thread of threads) {
          const lastDate = this._appleToDate(thread.last_message_date);
          const hoursAgo = lastDate ? (Date.now() - lastDate.getTime()) / 3600000 : null;
          const unanswered = (!thread.last_is_from_me && hoursAgo) ? Math.round(hoursAgo * 10) / 10 : 0;

          upsertStmt.run({
            handle_id: thread.handle_id,
            contact_name: thread.contact_id, // Will be phone/email until we add Contacts lookup
            last_message: thread.last_text ? thread.last_text.substring(0, 500) : null,
            last_message_at: lastDate ? lastDate.toISOString() : null,
            is_from_me: thread.last_is_from_me ? 1 : 0,
            unanswered_hours: unanswered,
            is_priority_contact: 0, // User can mark priority contacts manually
            message_count: thread.message_count
          });
          synced++;
        }
      });
      upsertAll();

      db.prepare(`UPDATE sync_state SET last_sync_at = datetime('now'), last_sync_status = 'success' WHERE service = 'imessage'`).run();
      logger.info(`iMessage sync: ${synced} threads updated`);

      if (msgDb) msgDb.close();
      return { synced };
    } catch (err) {
      if (msgDb) msgDb.close();
      const db = getDb();
      db.prepare(`UPDATE sync_state SET last_sync_at = datetime('now'), last_sync_status = 'error', error_message = @msg WHERE service = 'imessage'`).run({ msg: err.message });
      throw err;
    }
  },

  getUnansweredPriority(hoursThreshold = 24) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM imessage_threads
      WHERE is_priority_contact = 1 AND unanswered_hours > ? AND is_from_me = 0
      ORDER BY unanswered_hours DESC
    `).all(hoursThreshold);
  },

  setPriorityContact(handleId, isPriority) {
    const db = getDb();
    return db.prepare('UPDATE imessage_threads SET is_priority_contact = @p WHERE handle_id = @h').run({ p: isPriority ? 1 : 0, h: handleId });
  }
};

module.exports = imessageService;
