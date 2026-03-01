const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');

// GET /api/jobs - list pipeline
router.get('/', (req, res) => {
  const result = jobService.getPipeline(req.query);
  res.json(result);
});

// GET /api/jobs/analytics
router.get('/analytics', (req, res) => {
  res.json(jobService.getAnalytics());
});

// GET /api/jobs/scoring-model
router.get('/scoring-model', (req, res) => {
  const model = {};
  for (const [key, val] of Object.entries(require('../services/jobService').EXCLUSIONS ? {} : {})) {
    model[key] = val;
  }
  res.json({
    factors: ['compensation', 'seniority', 'oncology_hcp', 'budget_oversight', 'strategic_authority', 'growth_trajectory', 'revenue_impact'],
    weights: { compensation: 20, seniority: 18, oncology_hcp: 20, budget_oversight: 12, strategic_authority: 12, growth_trajectory: 10, revenue_impact: 8 },
    hard_gates: ['compensation_floor ($200K)', 'seniority_floor (Director+)', 'exclusion_list', 'location_gate (remote US)'],
    tiers: { 1: '75-100', 2: '55-74', 3: '35-54', 4: '0-34' },
    exclusions: jobService.EXCLUSIONS
  });
});

// POST /api/jobs/evaluate - score a role without saving
router.post('/evaluate', (req, res) => {
  const scoring = jobService.scoreRole(req.body);
  res.json(scoring);
});

// POST /api/jobs - add a role
router.post('/', (req, res) => {
  const result = jobService.addRole(req.body);
  res.json(result);
});

// PATCH /api/jobs/:id/status
router.patch('/:id/status', (req, res) => {
  const { status, stage } = req.body;
  const result = jobService.updateRoleStatus(req.params.id, status, stage);
  res.json({ success: result.changes > 0 });
});

module.exports = router;
