const express = require('express');
const router = express.Router();
const ouraService = require('../services/ouraService');

// GET /api/health/today
router.get('/today', (req, res) => {
  if (!ouraService.isConfigured()) {
    return res.json({ status: 'not_configured', message: 'Set OURA_TOKEN in .env to enable health sync' });
  }
  const data = ouraService.getToday();
  res.json(data || { status: 'no_data', message: 'No health data for today — run /api/health/sync first' });
});

// GET /api/health/trend?days=14
router.get('/trend', (req, res) => {
  if (!ouraService.isConfigured()) {
    return res.json({ status: 'not_configured', data: [] });
  }
  const days = parseInt(req.query.days) || 14;
  res.json(ouraService.getTrend(days));
});

// GET /api/health/score
router.get('/score', (req, res) => {
  res.json(ouraService.getHealthScore());
});

// POST /api/health/sync
router.post('/sync', async (req, res) => {
  if (!ouraService.isConfigured()) {
    return res.json({ status: 'not_configured', message: 'Set OURA_TOKEN in .env' });
  }
  try {
    const date = req.body.date || undefined;
    const result = await ouraService.syncDailyData(date);
    res.json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/health/sync-range
router.post('/sync-range', async (req, res) => {
  if (!ouraService.isConfigured()) {
    return res.json({ status: 'not_configured', message: 'Set OURA_TOKEN in .env' });
  }
  try {
    const { start_date, end_date } = req.body;
    const results = await ouraService.syncDateRange(start_date, end_date);
    res.json({ status: 'success', synced: results.length });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
