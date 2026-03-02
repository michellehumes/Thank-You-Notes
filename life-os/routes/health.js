const express = require('express');
const router = express.Router();
const ouraService = require('../services/ouraService');

router.get('/', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  res.json(ouraService.getLatest(days));
});

router.post('/sync', async (req, res) => {
  try {
    const result = await ouraService.syncDaily(req.query.date);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
