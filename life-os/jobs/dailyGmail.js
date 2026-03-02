const gmailService = require('../services/gmailService');
const logger = require('../config/logger');

module.exports = {
  async run() {
    try {
      const result = await gmailService.syncInbox();
      logger.info('Daily gmail sync complete', { result });
      return result;
    } catch (err) {
      logger.error('Daily gmail sync failed', err);
      return { error: err.message };
    }
  }
};
