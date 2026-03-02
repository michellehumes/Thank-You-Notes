const path = require('path');
const chokidar = require('chokidar');
const logger = require('../config/logger');
const { getDb } = require('../config/database');

/**
 * File Watcher Service
 * 
 * Monitors Desktop folder for new contract/offer documents.
 * Auto-creates todos when job-related files are detected.
 * 
 * Monitored file types: PDF, DOCX, DOC
 * Keywords: contract, offer, agreement, employment
 */

const WATCH_PATH = process.env.DESKTOP_WATCH_PATH || 
  path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop');

const MONITORED_EXTENSIONS = ['.pdf', '.docx', '.doc'];
const TRIGGER_KEYWORDS = [
  'contract', 'offer', 'agreement', 'employment',
  'job', 'position', 'role', 'compensation',
  'salary', 'benefits', 'terms'
];

let watcher = null;
let isInitialized = false;

/**
 * Check if filename matches job-related patterns
 */
function isJobRelatedFile(filename) {
  const lower = filename.toLowerCase();
  
  // Check extension
  const ext = path.extname(lower);
  if (!MONITORED_EXTENSIONS.includes(ext)) {
    return false;
  }

  // Check for keywords
  return TRIGGER_KEYWORDS.some(keyword => lower.includes(keyword));
}

/**
 * Create auto-todo for detected file
 */
function createFileDetectionTodo(filename, filepath) {
  const db = getDb();

  try {
    // Check for duplicates
    const existing = db.prepare(`
      SELECT id FROM todos
      WHERE trigger_type = 'file_detection'
      AND trigger_ref = ?
      AND status IN ('pending', 'in_progress')
    `).get(filepath);

    if (existing) {
      logger.info(`Todo already exists for ${filename}`);
      return { success: false, reason: 'duplicate' };
    }

    // Extract company/position from filename
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    const title = `Review ${nameWithoutExt}`;

    const stmt = db.prepare(`
      INSERT INTO todos (
        title, priority, source, trigger_type, trigger_ref,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      1,  // priority 1 = high
      'auto',
      'file_detection',
      filepath,
      'pending',
      new Date().toISOString()
    );

    logger.info(`Created auto-todo for file: ${filename}`);
    return { success: true, todoId: result.lastInsertRowid };
  } catch (error) {
    logger.error('Failed to create file detection todo:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Handle new file added
 */
function handleFileAdded(filepath) {
  const filename = path.basename(filepath);

  logger.debug(`File detected: ${filepath}`);

  if (!isJobRelatedFile(filename)) {
    return;
  }

  logger.info(`Job-related file detected: ${filename}`);
  createFileDetectionTodo(filename, filepath);
}

/**
 * Initialize file watcher
 */
function initialize() {
  if (isInitialized) {
    logger.warn('File watcher already initialized');
    return { success: false, reason: 'already_initialized' };
  }

  try {
    logger.info(`Initializing file watcher on: ${WATCH_PATH}`);

    watcher = chokidar.watch(WATCH_PATH, {
      ignored: /(^|[\/\\])\./,  // Ignore hidden files
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,  // Wait 2s for file to stabilize
        pollInterval: 100
      },
      ignoreInitial: true  // Don't process existing files on startup
    });

    watcher
      .on('add', handleFileAdded)
      .on('error', (error) => {
        logger.error('File watcher error:', error.message);
      });

    isInitialized = true;
    logger.info('File watcher initialized successfully');

    return { success: true };
  } catch (error) {
    logger.error('Failed to initialize file watcher:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Stop file watcher
 */
function stop() {
  if (!watcher) {
    return { success: false, reason: 'not_initialized' };
  }

  try {
    watcher.close();
    isInitialized = false;
    logger.info('File watcher stopped');
    return { success: true };
  } catch (error) {
    logger.error('Failed to stop file watcher:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get watcher status
 */
function getStatus() {
  return {
    isInitialized,
    watchPath: WATCH_PATH,
    monitoredExtensions: MONITORED_EXTENSIONS,
    triggerKeywords: TRIGGER_KEYWORDS
  };
}

/**
 * Scan existing files in watch path (useful after startup)
 */
function scanExistingFiles() {
  const fs = require('fs');

  try {
    if (!fs.existsSync(WATCH_PATH)) {
      logger.warn(`Watch path does not exist: ${WATCH_PATH}`);
      return { success: false, reason: 'path_not_found' };
    }

    const files = fs.readdirSync(WATCH_PATH, { withFileTypes: true });
    let jobFilesFound = 0;

    files.forEach(file => {
      if (file.isFile() && isJobRelatedFile(file.name)) {
        const filepath = path.join(WATCH_PATH, file.name);
        const result = createFileDetectionTodo(file.name, filepath);
        if (result.success) jobFilesFound++;
      }
    });

    logger.info(`Scan complete: found ${jobFilesFound} job-related files`);
    return { success: true, filesFound: jobFilesFound };
  } catch (error) {
    logger.error('Failed to scan existing files:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  initialize,
  stop,
  getStatus,
  scanExistingFiles,
  isJobRelatedFile,
  WATCH_PATH,
  MONITORED_EXTENSIONS,
  TRIGGER_KEYWORDS
};
