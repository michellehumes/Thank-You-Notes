const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const DB_PATH = path.join(__dirname, '..', 'database', 'life.db');
let db = null;

function initializeDb() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  // Run schema
  const schemaPath = path.join(dbDir, 'init.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    logger.info('Database schema applied');
  }

  logger.info('Database initialized', { path: DB_PATH });
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initializeDb() first.');
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
    logger.info('Database closed');
  }
}

module.exports = { initializeDb, getDb, closeDb };
