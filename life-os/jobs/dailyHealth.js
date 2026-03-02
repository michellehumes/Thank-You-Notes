const ouraService = require('../services/ouraService');
const logger = require('../config/logger');

module.exports = {
  async run() {
    try {
      const result = await ouraService.syncDaily();
      logger.info('Daily health sync complete', { result });
      return result;
    } catch (err) {
      logger.error('Daily health sync failed', err);
      return { error: err.message };
    }
  }
};
