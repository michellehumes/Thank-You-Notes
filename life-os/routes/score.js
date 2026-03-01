const express = require('express');
const router = express.Router();
const financeService = require('../services/financeService');
const jobService = require('../services/jobService');

// GET /api/score/current — partial executive score (finance + career components only)
router.get('/current', (req, res) => {
  const runway = financeService.getRunwayMonths();
  const drift = financeService.getDriftDetection();
  const pipeline = jobService.getPipeline({ tier: 1 });

  const financialScore = Math.min(100, Math.max(0,
    (runway.runway_months >= 12 ? 30 : runway.runway_months >= 6 ? 20 : runway.runway_months >= 3 ? 10 : 0) +
    (drift.flags.length === 0 ? 10 : drift.flags.length <= 2 ? 5 : 0)
  ));

  const careerScore = Math.min(25, pipeline.length * 5);

  res.json({
    overall: financialScore + careerScore,
    max_possible: 55,
    components: {
      financial_stability: { score: financialScore, max: 30, details: { runway_months: runway.runway_months, drift_flags: drift.flags.length } },
      career_momentum: { score: careerScore, max: 25, details: { tier1_roles: pipeline.length } },
      health_readiness: { score: 0, max: 15, status: 'not_configured' },
      inbox_load: { score: 0, max: 10, status: 'not_configured' },
      relationship_hygiene: { score: 0, max: 10, status: 'not_configured' },
      system_integrity: { score: 0, max: 10, status: 'not_configured' }
    },
    calculated_at: new Date().toISOString()
  });
});

module.exports = router;
