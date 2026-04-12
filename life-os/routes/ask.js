const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');
const aiService = require('../services/aiService');
const scoringService = require('../services/scoringService');
const financeService = require('../services/financeService');
const jobService = require('../services/jobService');

function tryRequire(mod) {
  try { return require(mod); } catch { return null; }
}

// POST /api/ask
// Body: { "q": "Why is my score low?" }
router.post('/', async (req, res) => {
  const question = (req.body?.q || '').trim();
  if (!question) {
    return res.status(400).json({ error: 'Missing field: q' });
  }

  // Gather live context
  let score, finance, career, health, messages, latestBrief;

  try { score = scoringService.calculateExecutiveScore(); } catch {}

  try {
    const runway = financeService.getRunwayMonths();
    const burn = financeService.getBurnRate(30);
    finance = { ...runway, ...burn };
  } catch {}

  try {
    const analytics = jobService.getAnalytics();
    career = analytics;
  } catch {}

  const oura = tryRequire('../services/ouraService');
  if (oura?.isConfigured()) {
    try {
      const trend = oura.getTrend(7);
      health = `sleep=${trend.averages.sleep_score}, readiness=${trend.averages.readiness_score}, activity=${trend.averages.activity_score}`;
    } catch {}
  }

  const imessage = tryRequire('../services/imessageService');
  if (imessage?.isConfigured()) {
    try {
      const pending = imessage.getPendingMessages();
      messages = `${pending.length} unanswered, ${pending.filter(m => m.waiting_hours > 24).length} overdue`;
    } catch {}
  }

  try {
    const db = getDb();
    const brief = db.prepare('SELECT natural_language FROM executive_briefs ORDER BY generated_at DESC LIMIT 1').get();
    latestBrief = brief?.natural_language ?? null;
  } catch {}

  const answer = await aiService.askQuestion(question, { score, finance, career, health, messages, latestBrief });

  if (!answer) {
    return res.status(503).json({
      error: 'AI unavailable — set ANTHROPIC_API_KEY to enable /api/ask',
      question,
    });
  }

  res.json({ question, answer });
});

module.exports = router;
