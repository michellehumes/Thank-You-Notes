const express = require('express');
const router = express.Router();
const imessageService = require('../services/imessageService');
const contactsService = require('../services/contactsService');

// GET /api/messages/pending
router.get('/pending', (req, res) => {
  if (!imessageService.isConfigured()) {
    return res.json({ status: 'not_configured', pending: [], message: 'iMessage DB not accessible — grant Full Disk Access' });
  }
  const pending = imessageService.getPendingMessages();
  res.json({ pending, count: pending.length });
});

// GET /api/messages/stats
router.get('/stats', (req, res) => {
  if (!imessageService.isConfigured()) {
    return res.json({ status: 'not_configured', unanswered_count: 0 });
  }
  const score = imessageService.getRelationshipScore();
  res.json(score);
});

// GET /api/messages/recent?hours=48
router.get('/recent', (req, res) => {
  if (!imessageService.isConfigured()) {
    return res.json({ status: 'not_configured', messages: [] });
  }
  try {
    const hours = parseInt(req.query.hours) || 48;
    const messages = imessageService.getUnansweredMessages(hours);
    res.json({ messages, count: messages.length });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/messages/sync
router.post('/sync', (req, res) => {
  if (!imessageService.isConfigured()) {
    return res.json({ status: 'not_configured', message: 'iMessage not accessible' });
  }
  try {
    const result = imessageService.syncToDb();
    res.json({ status: 'success', ...result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── Contacts ────────────────────────────────────────
// GET /api/messages/contacts
router.get('/contacts', (req, res) => {
  const contacts = contactsService.getContacts(req.query);
  res.json(contacts);
});

// POST /api/messages/contacts
router.post('/contacts', (req, res) => {
  const result = contactsService.addContact(req.body);
  res.json(result);
});

// GET /api/messages/contacts/stale?days=14
router.get('/contacts/stale', (req, res) => {
  const days = parseInt(req.query.days) || 14;
  const stale = contactsService.getStaleContacts(days);
  res.json(stale);
});

module.exports = router;
