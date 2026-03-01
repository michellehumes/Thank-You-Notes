const express = require('express');
const router = express.Router();
const scoringService = require('../services/scoringService');

// GET /api/score/current — full executive score
router.get('/current', (req, res) => {
  const score = scoringService.calculateExecutiveScore();
  res.json(score);
});

// GET /api/score/history?days=30
router.get('/history', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  res.json(scoringService.getScoreHistory(days));
});

module.exports = router;
