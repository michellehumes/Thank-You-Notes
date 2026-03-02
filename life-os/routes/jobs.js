const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');

router.get('/', (req, res) => {
  const { tier, status, limit } = req.query;
  res.json(jobService.getRoles({
    tier: tier ? parseInt(tier) : undefined,
    status,
    limit: limit ? parseInt(limit) : 50
  }));
});

router.get('/analytics', (req, res) => {
  res.json(jobService.getPipelineAnalytics());
});

router.get('/:roleId', (req, res) => {
  const role = jobService.getRole(req.params.roleId);
  if (!role) return res.status(404).json({ error: 'Role not found' });
  res.json(role);
});

router.post('/', (req, res) => {
  if (!req.body.company || !req.body.title) {
    return res.status(400).json({ error: 'company and title are required' });
  }
  const result = jobService.addRole(req.body);
  res.status(201).json(result);
});

router.patch('/:roleId/status', (req, res) => {
  const { status, stage, notes } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  const result = jobService.updateStatus(req.params.roleId, status, stage, notes);
  res.json({ updated: result.changes });
});

module.exports = router;
