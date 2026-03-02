const express = require('express');
const router = express.Router();
const scoringService = require('../services/scoringService');
const { getDb } = require('../config/database');

router.get('/latest', (req, res) => {
  const score = scoringService.calculateExecutiveScore();
  res.json(score);
});

router.get('/history', (req, res) => {
  const db = getDb();
  const days = parseInt(req.query.days) || 30;
  const history = db.prepare('SELECT * FROM executive_score_history ORDER BY date DESC LIMIT ?').all(days);
  res.json(history);
});

module.exports = router;
