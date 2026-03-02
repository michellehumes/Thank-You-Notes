const chokidar = require('chokidar');
const path = require('path');
const logger = require('../config/logger');
const todoAutomationService = require('./todoAutomationService');
const { getDb } = require('../config/database');

const CONTRACT_KEYWORDS = ['contract', 'offer', 'agreement', 'employment', 'compensation', 'nda', 'non-compete'];

const fileWatcherService = {
  watcher: null,

  start() {
    const watchPath = process.env.DESKTOP_WATCH_PATH || path.join(process.env.HOME, 'Desktop');

    this.watcher = chokidar.watch(watchPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      depth: 1
    });

    this.watcher.on('add', (filePath) => {
      const fileName = path.basename(filePath).toLowerCase();
      const ext = path.extname(fileName);

      // Only watch for PDFs and DOCs
      if (!['.pdf', '.doc', '.docx'].includes(ext)) return;

      // Check if filename contains contract/offer keywords
      const isContractRelated = CONTRACT_KEYWORDS.some(kw => fileName.includes(kw));
      if (!isContractRelated) return;

      logger.info(`Contract-related file detected: ${filePath}`);

      // Create auto-todo
      const db = getDb();
      const existing = db.prepare(
        "SELECT 1 FROM todos WHERE trigger_type = 'file_detected' AND trigger_ref = @ref AND status IN ('pending','in_progress')"
      ).get({ ref: filePath });

      if (!existing) {
        db.prepare(`
          INSERT INTO todos (title, description, priority, source, trigger_type, trigger_ref, status, due_date)
          VALUES (@title, @description, @priority, @source, @trigger_type, @trigger_ref, 'pending', @due_date)
        `).run({
          title: `Review: ${path.basename(filePath)}`,
          description: `New contract/offer document detected on Desktop: ${filePath}`,
          priority: 2,
          source: 'auto',
          trigger_type: 'file_detected',
          trigger_ref: filePath,
          due_date: new Date().toISOString().split('T')[0]
        });
        logger.info(`Auto-todo created for contract file: ${path.basename(filePath)}`);
      }
    });

    this.watcher.on('error', (err) => {
      logger.error('File watcher error:', err);
    });

    logger.info(`File watcher started on ${watchPath}`);
  },

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      logger.info('File watcher stopped');
    }
  }
};

module.exports = fileWatcherService;
