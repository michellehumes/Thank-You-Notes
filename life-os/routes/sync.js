const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

router.get('/status', (req, res) => {
  const db = getDb();
  const syncStates = db.prepare('SELECT * FROM sync_state ORDER BY service').all();
  res.json(syncStates);
});

router.post('/trigger', async (req, res) => {
  const { service } = req.body;
  if (!service) return res.status(400).json({ error: 'service is required' });

  try {
    let result;
    switch (service) {
      case 'oura':
        result = await require('../services/ouraService').syncDaily();
        break;
      case 'gmail':
        result = await require('../services/gmailService').syncInbox();
        break;
      case 'imessage':
        result = require('../services/imessageService').syncThreads();
        break;
      case 'brief':
        result = require('../jobs/generateExecutiveBrief').run();
        break;
      default:
        return res.status(400).json({ error: `Unknown service: ${service}` });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
