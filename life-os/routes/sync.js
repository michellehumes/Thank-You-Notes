const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// GET /api/sync/status
router.get('/status', (req, res) => {
  const db = getDb();
  const services = ['oura', 'gmail', 'imessage', 'contacts', 'finance_snapshot', 'executive_brief', 'job_scan'];

  const statuses = {};
  for (const svc of services) {
    const row = db.prepare('SELECT * FROM sync_log WHERE service = ? ORDER BY started_at DESC LIMIT 1').get(svc);
    statuses[svc] = row || { service: svc, status: 'never_run', last_run: null };
  }

  res.json({ services: statuses, checked_at: new Date().toISOString() });
});

// POST /api/sync/run/:service
router.post('/run/:service', (req, res) => {
  const service = req.params.service;
  const configured = ['finance_snapshot'];

  if (!configured.includes(service)) {
    return res.json({ status: 'not_configured', message: `${service} integration not yet configured` });
  }

  res.json({ status: 'triggered', service });
});

module.exports = router;
