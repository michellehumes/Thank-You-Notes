const imessageService = require('../services/imessageService');
const logger = require('../config/logger');

module.exports = {
  async run() {
    try {
      const result = imessageService.syncThreads();
      logger.info('Daily iMessage sync complete', { result });
      return result;
    } catch (err) {
      logger.error('Daily iMessage sync failed', err);
      return { error: err.message };
    }
  }
};
