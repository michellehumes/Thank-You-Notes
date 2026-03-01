/**
 * iMessage Service — reads from macOS Messages database
 * Requires Full Disk Access for the running process
 * Copies ~/Library/Messages/chat.db to /tmp to avoid locking issues
 */
const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const log = createServiceLogger('imessage');

const IMESSAGE_DB = process.env.IMESSAGE_DB_PATH || path.join(process.env.HOME, 'Library/Messages/chat.db');
const TEMP_COPY = '/tmp/life-os-chat.db';

function isConfigured() {
  return fs.existsSync(IMESSAGE_DB);
}

function copyDatabase() {
  try {
    fs.copyFileSync(IMESSAGE_DB, TEMP_COPY);
    // Also copy WAL/SHM if they exist
    const wal = IMESSAGE_DB + '-wal';
    const shm = IMESSAGE_DB + '-shm';
    if (fs.existsSync(wal)) fs.copyFileSync(wal, TEMP_COPY + '-wal');
    if (fs.existsSync(shm)) fs.copyFileSync(shm, TEMP_COPY + '-shm');
    return true;
  } catch (err) {
    log.error(`Cannot copy iMessage DB: ${err.message}`);
    log.error('Grant Full Disk Access to Terminal/Node in System Settings > Privacy & Security');
    return false;
  }
}

function openMessageDb() {
  if (!copyDatabase()) throw new Error('Cannot access iMessage database — grant Full Disk Access');
  return new Database(TEMP_COPY, { readonly: true });
}

function getRecentMessages(hours = 48) {
  const msgDb = openMessageDb();

  // Apple epoch: 2001-01-01 00:00:00 UTC
  const appleEpochOffset = 978307200;
  const cutoff = (Date.now() / 1000 - appleEpochOffset - hours * 3600) * 1e9;

  const rows = msgDb.prepare(`
    SELECT
      m.ROWID as msg_id,
      m.text,
      m.is_from_me,
      m.date as apple_date,
      m.date_read,
      h.id as contact_id,
      h.uncanonicalized_id as display_id,
      c.display_name as chat_name,
      c.chat_identifier
    FROM message m
    LEFT JOIN handle h ON m.handle_id = h.ROWID
    LEFT JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
    LEFT JOIN chat c ON cmj.chat_id = c.ROWID
    WHERE m.date > ?
    ORDER BY m.date DESC
    LIMIT 500
  `).all(cutoff);

  msgDb.close();

  return rows.map(r => ({
    msg_id: r.msg_id,
    text: r.text,
    is_from_me: r.is_from_me === 1,
    timestamp: new Date((r.apple_date / 1e9 + appleEpochOffset) * 1000).toISOString(),
    contact: r.contact_id || r.chat_identifier,
    display: r.display_id || r.chat_identifier,
    chat_name: r.chat_name
  }));
}

function getUnansweredMessages(hours = 72) {
  const messages = getRecentMessages(hours);

  // Group by contact, find conversations where last message is NOT from me
  const byContact = {};
  for (const msg of messages) {
    const key = msg.contact;
    if (!key) continue;
    if (!byContact[key]) byContact[key] = [];
    byContact[key].push(msg);
  }

  const unanswered = [];
  for (const [contact, msgs] of Object.entries(byContact)) {
    // Sort by time ascending
    msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const lastMsg = msgs[msgs.length - 1];

    if (!lastMsg.is_from_me && lastMsg.text) {
      unanswered.push({
        contact,
        display: lastMsg.display,
        chat_name: lastMsg.chat_name,
        last_message: lastMsg.text.substring(0, 200),
        received_at: lastMsg.timestamp,
        waiting_hours: Math.round((Date.now() - new Date(lastMsg.timestamp).getTime()) / 3600000)
      });
    }
  }

  // Sort by longest waiting first
  unanswered.sort((a, b) => b.waiting_hours - a.waiting_hours);
  return unanswered;
}

function syncToDb() {
  if (!isConfigured()) throw new Error('iMessage database not found');

  const unanswered = getUnansweredMessages();
  const db = getDb();

  // Clear old pending and re-insert
  db.prepare('DELETE FROM messages_pending WHERE source = ?').run('imessage');

  const insert = db.prepare(`
    INSERT INTO messages_pending (contact_identifier, contact_name, last_message, received_at, waiting_hours, source, platform)
    VALUES (?, ?, ?, ?, ?, 'imessage', 'imessage')
  `);

  const batch = db.transaction((msgs) => {
    for (const m of msgs) {
      insert.run(m.contact, m.display || m.contact, m.last_message, m.received_at, m.waiting_hours);
    }
  });

  batch(unanswered);

  db.prepare(`
    INSERT INTO sync_log (service, status, records_synced, started_at, completed_at)
    VALUES ('imessage', 'success', ?, datetime('now'), datetime('now'))
  `).run(unanswered.length);

  log.info(`iMessage sync: ${unanswered.length} unanswered conversations`);
  return { synced: unanswered.length, unanswered };
}

function getPendingMessages() {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM messages_pending
    WHERE source = 'imessage' AND status = 'pending'
    ORDER BY waiting_hours DESC
  `).all();
}

function getRelationshipScore() {
  const db = getDb();
  const pending = db.prepare("SELECT COUNT(*) as cnt FROM messages_pending WHERE source = 'imessage' AND status = 'pending'").get().cnt;
  const overdue = db.prepare("SELECT COUNT(*) as cnt FROM messages_pending WHERE source = 'imessage' AND status = 'pending' AND waiting_hours > 24").get().cnt;

  // 10 points max: 0 pending = 10, <3 = 8, <5 = 6, <10 = 3, else 0
  let score = 0;
  if (pending === 0) score = 10;
  else if (pending < 3) score = 8;
  else if (pending < 5) score = 6;
  else if (pending < 10) score = 3;

  return { score, max: 10, pending, overdue_24h: overdue };
}

module.exports = { isConfigured, syncToDb, getPendingMessages, getUnansweredMessages, getRelationshipScore };
