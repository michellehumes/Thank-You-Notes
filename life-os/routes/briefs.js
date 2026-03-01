const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// GET /api/briefs/today
router.get('/today', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const brief = db.prepare('SELECT * FROM executive_briefs WHERE date = ? ORDER BY generated_at DESC LIMIT 1').get(today);
  if (brief) {
    brief.sections = JSON.parse(brief.sections || '{}');
    brief.action_items = JSON.parse(brief.action_items || '[]');
    brief.risk_flags = JSON.parse(brief.risk_flags || '[]');
    res.json(brief);
  } else {
    res.json({ status: 'no_brief', message: 'No brief generated for today yet', date: today });
  }
});

// GET /api/briefs/history
router.get('/history', (req, res) => {
  const db = getDb();
  const limit = parseInt(req.query.limit) || 7;
  const rows = db.prepare('SELECT date, executive_score, sections, action_items, risk_flags FROM executive_briefs ORDER BY date DESC LIMIT ?').all(limit);
  res.json(rows.map(r => ({
    ...r,
    sections: JSON.parse(r.sections || '{}'),
    action_items: JSON.parse(r.action_items || '[]'),
    risk_flags: JSON.parse(r.risk_flags || '[]')
  })));
});

module.exports = router;
