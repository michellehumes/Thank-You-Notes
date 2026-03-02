const express = require('express');
const router = express.Router();
const todoAutomationService = require('../services/todoAutomationService');

router.get('/', (req, res) => {
  const { status, priority, limit } = req.query;
  res.json(todoAutomationService.getTodos({
    status,
    priority: priority ? parseInt(priority) : undefined,
    limit: limit ? parseInt(limit) : 50
  }));
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['pending', 'in_progress', 'done', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Valid status required: pending, in_progress, done, dismissed' });
  }
  const result = todoAutomationService.updateTodoStatus(parseInt(req.params.id), status);
  res.json({ updated: result.changes });
});

router.post('/generate', (req, res) => {
  const result = todoAutomationService.generateAutoTodos();
  res.json(result);
});

module.exports = router;
