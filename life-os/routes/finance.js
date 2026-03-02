const express = require('express');
const router = express.Router();
const financeService = require('../services/financeService');

// GET /api/finance/transactions
router.get('/transactions', (req, res) => {
  const { owner, category, classification, startDate, endDate, limit } = req.query;
  const filters = {};
  if (owner) filters.owner = owner;
  if (category) filters.category = category;
  if (classification) filters.classification = classification;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  if (limit) filters.limit = parseInt(limit);
  res.json(financeService.getTransactions(filters));
});

// POST /api/finance/transactions
router.post('/transactions', (req, res) => {
  const txn = req.body;
  if (!txn.date || !txn.merchant || txn.amount === undefined) {
    return res.status(400).json({ error: 'date, merchant, and amount are required' });
  }
  const result = financeService.insertTransaction(txn);
  res.status(201).json({ id: result.lastInsertRowid });
});

// GET /api/finance/burn-rate
router.get('/burn-rate', (req, res) => {
  const months = parseInt(req.query.months) || 3;
  res.json(financeService.getBurnRate(months));
});

// GET /api/finance/runway
router.get('/runway', (req, res) => {
  const { getDb } = require('../config/database');
  const db = getDb();
  const liquidRow = db.prepare("SELECT COALESCE(SUM(balance), 50000) as total FROM accounts WHERE type IN ('checking', 'savings')").get();
  res.json(financeService.getRunway(liquidRow.total));
});

// GET /api/finance/categories
router.get('/categories', (req, res) => {
  const owner = req.query.owner || null;
  const months = parseInt(req.query.months) || 3;
  res.json(financeService.getCategoryBreakdown(owner, months));
});

// GET /api/finance/shared-summary
router.get('/shared-summary', (req, res) => {
  const months = parseInt(req.query.months) || 1;
  res.json(financeService.getSharedExpenseSummary(months));
});

// GET /api/finance/budget
router.get('/budget', (req, res) => {
  const { getDb } = require('../config/database');
  const db = getDb();
  res.json(db.prepare('SELECT * FROM budget_items ORDER BY type, name').all());
});

module.exports = router;
