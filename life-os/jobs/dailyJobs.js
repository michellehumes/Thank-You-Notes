const jobService = require('../services/jobService');
const logger = require('../config/logger');

module.exports = {
  run() {
    try {
      const analytics = jobService.getPipelineAnalytics();
      logger.info('Job pipeline refresh complete', { active: analytics.totalActive });
      return analytics;
    } catch (err) {
      logger.error('Job pipeline refresh failed', err);
      return { error: err.message };
    }
  }
};
