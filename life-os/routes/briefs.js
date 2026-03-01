const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');
const executiveBriefService = require('../services/executiveBriefService');

// Helper to parse JSON fields safely
function parseBrief(brief) {
  if (!brief) return null;
  try { brief.risk_flags = JSON.parse(brief.risk_flags || '[]'); } catch { brief.risk_flags = []; }
  try { brief.top_3_actions = JSON.parse(brief.top_3_actions || '[]'); } catch { brief.top_3_actions = []; }
  try { brief.birthdays_soon = JSON.parse(brief.birthdays_soon || '[]'); } catch { brief.birthdays_soon = []; }
  return brief;
}

// GET /api/briefs/today
router.get('/today', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const brief = db.prepare('SELECT * FROM executive_briefs WHERE date = ? ORDER BY generated_at DESC LIMIT 1').get(today);
  if (brief) {
    res.json(parseBrief(brief));
  } else {
    res.json({ status: 'no_brief', message: 'No brief generated yet — POST /api/briefs/generate', date: today });
  }
});

// POST /api/briefs/generate
router.post('/generate', (req, res) => {
  try {
    const brief = executiveBriefService.generateBrief();
    res.json(brief);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/briefs/history?limit=7
router.get('/history', (req, res) => {
  const db = getDb();
  const limit = parseInt(req.query.limit) || 7;
  const rows = db.prepare('SELECT * FROM executive_briefs ORDER BY date DESC LIMIT ?').all(limit);
  res.json(rows.map(r => parseBrief(r)));
});

module.exports = router;
