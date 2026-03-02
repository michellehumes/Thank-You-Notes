const anomalyService = require('../services/anomalyService');
const logger = require('../config/logger');

module.exports = {
  run() {
    try {
      const result = anomalyService.runFinancialAnomalyDetection();
      logger.info('Daily finance check complete', { anomalies: result.length });
      return result;
    } catch (err) {
      logger.error('Daily finance check failed', err);
      return { error: err.message };
    }
  }
};
