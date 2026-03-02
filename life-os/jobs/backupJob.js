const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

module.exports = {
  run() {
    try {
      const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '_');
      const destDir = path.join(backupDir, today);

      // Create backup directory
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      // 1. Backup database
      const dbPath = path.join(__dirname, '..', 'database', 'life.db');
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, path.join(destDir, 'life.db'));
        logger.info('Database backed up');
      }

      // 2. Backup JSON data files
      const dataDir = path.join(__dirname, '..', 'public', 'data');
      if (fs.existsSync(dataDir)) {
        const jsonDataDir = path.join(destDir, 'data');
        if (!fs.existsSync(jsonDataDir)) fs.mkdirSync(jsonDataDir, { recursive: true });

        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          fs.copyFileSync(path.join(dataDir, file), path.join(jsonDataDir, file));
        }
        logger.info(`Backed up ${files.length} JSON data files`);
      }

      // 3. Backup .env (if exists)
      const envPath = path.join(__dirname, '..', '.env');
      if (fs.existsSync(envPath)) {
        fs.copyFileSync(envPath, path.join(destDir, '.env.backup'));
      }

      // 4. Prune old backups (>30 days)
      const entries = fs.readdirSync(backupDir, { withFileTypes: true })
        .filter(e => e.isDirectory() && /^\d{4}_\d{2}_\d{2}$/.test(e.name))
        .map(e => ({ name: e.name, path: path.join(backupDir, e.name) }));

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = cutoff.toISOString().split('T')[0].replace(/-/g, '_');

      let pruned = 0;
      for (const entry of entries) {
        if (entry.name < cutoffStr) {
          fs.rmSync(entry.path, { recursive: true, force: true });
          pruned++;
        }
      }

      if (pruned > 0) logger.info(`Pruned ${pruned} old backups`);

      logger.info(`Backup complete: ${destDir}`);
      return { destination: destDir, pruned };
    } catch (err) {
      logger.error('Backup failed', err);
      return { error: err.message };
    }
  }
};
