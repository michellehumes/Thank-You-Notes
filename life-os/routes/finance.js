const express = require('express');
const router = express.Router();
const financeService = require('../services/financeService');
const anomalyService = require('../services/anomalyService');

// GET /api/finance/transactions
router.get('/transactions', (req, res) => {
  const result = financeService.getTransactions(req.query);
  res.json(result);
});

// GET /api/finance/summary
router.get('/summary', (req, res) => {
  const result = financeService.getSpendingSummary(req.query);
  res.json(result);
});

// GET /api/finance/burn-rate
router.get('/burn-rate', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  res.json(financeService.getBurnRate(days));
});

// GET /api/finance/runway
router.get('/runway', (req, res) => {
  const assets = req.query.assets ? parseFloat(req.query.assets) : undefined;
  res.json(financeService.getRunwayMonths(assets));
});

// GET /api/finance/monthly-flow
router.get('/monthly-flow', (req, res) => {
  const months = parseInt(req.query.months) || 6;
  res.json(financeService.getMonthlyNetFlow(months));
});

// GET /api/finance/drift
router.get('/drift', (req, res) => {
  res.json(financeService.getDriftDetection());
});

// GET /api/finance/shared-expenses
router.get('/shared-expenses', (req, res) => {
  res.json(financeService.getSharedExpensesSummary(req.query));
});

// GET /api/finance/split
router.get('/split', (req, res) => {
  const ratio = parseInt(req.query.ratio) || 50;
  res.json(financeService.getSplitCalculation(ratio));
});

// GET /api/finance/anomalies
router.get('/anomalies', (req, res) => {
  res.json(anomalyService.getActiveAnomalies());
});

// POST /api/finance/anomalies/detect
router.post('/anomalies/detect', (req, res) => {
  const results = anomalyService.runAllDetections();
  res.json({ detected: results.length, anomalies: results });
});

// POST /api/finance/anomalies/:id/acknowledge
router.post('/anomalies/:id/acknowledge', (req, res) => {
  const result = anomalyService.acknowledgeAnomaly(req.params.id);
  res.json({ success: result.changes > 0 });
});

module.exports = router;
