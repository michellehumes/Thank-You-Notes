const express = require('express');
const router = express.Router();

// Stub — requires macOS Full Disk Access for iMessage DB
router.get('/pending', (req, res) => {
  res.json({ status: 'not_configured', pending: [], message: 'iMessage integration requires Full Disk Access' });
});

router.get('/stats', (req, res) => {
  res.json({ status: 'not_configured', unanswered_count: 0 });
});

router.post('/sync', (req, res) => {
  res.json({ status: 'not_configured', message: 'iMessage sync pending setup' });
});

module.exports = router;
