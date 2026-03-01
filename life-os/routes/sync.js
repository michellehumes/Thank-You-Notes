const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');
const gmailService = require('../services/gmailService');
const ouraService = require('../services/ouraService');
const imessageService = require('../services/imessageService');
const todoAutomation = require('../services/todoAutomationService');

// GET /api/sync/status
router.get('/status', (req, res) => {
  const db = getDb();
  const services = ['oura', 'gmail', 'imessage', 'contacts', 'finance_snapshot', 'executive_brief'];

  const statuses = {};
  for (const svc of services) {
    const row = db.prepare('SELECT * FROM sync_log WHERE service = ? ORDER BY synced_at DESC LIMIT 1').get(svc);
    statuses[svc] = {
      ...(row || { service: svc, status: 'never_run', last_run: null }),
      configured: svc === 'oura' ? ouraService.isConfigured()
        : svc === 'gmail' ? gmailService.isConfigured()
        : svc === 'imessage' ? imessageService.isConfigured()
        : true
    };
  }

  res.json({ services: statuses, checked_at: new Date().toISOString() });
});

// POST /api/sync/run-all
router.post('/run-all', async (req, res) => {
  const results = {};

  // Oura
  if (ouraService.isConfigured()) {
    try { results.oura = await ouraService.syncDailyData(); } catch (e) { results.oura = { error: e.message }; }
  } else { results.oura = { skipped: 'not_configured' }; }

  // Gmail
  if (gmailService.hasTokens()) {
    try { results.gmail = await gmailService.syncInbox(); } catch (e) { results.gmail = { error: e.message }; }
  } else { results.gmail = { skipped: 'not_authenticated' }; }

  // iMessage
  if (imessageService.isConfigured()) {
    try { results.imessage = imessageService.syncToDb(); } catch (e) { results.imessage = { error: e.message }; }
  } else { results.imessage = { skipped: 'not_configured' }; }

  // Auto-todos
  try { results.todos = todoAutomation.generateAllTodos(); } catch (e) { results.todos = { error: e.message }; }

  res.json({ status: 'complete', results });
});

// ── Gmail OAuth Flow ────────────────────────────────
// GET /api/sync/gmail/auth — get authorization URL
router.get('/gmail/auth', (req, res) => {
  if (!gmailService.isConfigured()) {
    return res.json({ status: 'not_configured', message: 'Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env' });
  }
  res.json({ auth_url: gmailService.getAuthUrl() });
});

// GET /api/sync/gmail/callback?code=XXX — exchange code for tokens
router.get('/gmail/callback', async (req, res) => {
  try {
    const tokens = await gmailService.exchangeCode(req.query.code);
    res.json({ status: 'authenticated', expires_in: tokens.expires_in });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// POST /api/sync/gmail/sync — sync inbox
router.post('/gmail/sync', async (req, res) => {
  try {
    const result = await gmailService.syncInbox(parseInt(req.query.max) || 50);
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/sync/gmail/inbox — inbox stats
router.get('/gmail/inbox', (req, res) => {
  res.json(gmailService.getInboxStats());
});

// GET /api/sync/gmail/recruiters — recruiter emails
router.get('/gmail/recruiters', (req, res) => {
  res.json(gmailService.getRecruiterEmails());
});

module.exports = router;
