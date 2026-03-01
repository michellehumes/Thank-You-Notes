const express = require('express');
const router = express.Router();

// Stub — requires Oura Personal Access Token in .env
router.get('/today', (req, res) => {
  res.json({ status: 'not_configured', message: 'Set OURA_TOKEN in .env to enable health sync' });
});

router.get('/trend', (req, res) => {
  res.json({ status: 'not_configured', data: [] });
});

router.post('/sync', (req, res) => {
  res.json({ status: 'not_configured', message: 'Oura integration pending setup' });
});

module.exports = router;
