const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// GET /api/todos
router.get('/', (req, res) => {
  const db = getDb();
  const status = req.query.status;
  const rows = status
    ? db.prepare('SELECT * FROM todos WHERE status = ? ORDER BY priority ASC, created_at DESC').all(status)
    : db.prepare('SELECT * FROM todos ORDER BY status ASC, priority ASC, created_at DESC').all();
  res.json(rows);
});

// POST /api/todos
router.post('/', (req, res) => {
  const db = getDb();
  const { title, category, priority, due_date, source } = req.body;
  const result = db.prepare(
    'INSERT INTO todos (title, category, priority, due_date, source) VALUES (?, ?, ?, ?, ?)'
  ).run(title, category || 'general', priority || 2, due_date || null, source || 'manual');
  res.json({ id: result.lastInsertRowid });
});

// PATCH /api/todos/:id
router.patch('/:id', (req, res) => {
  const db = getDb();
  const { status } = req.body;
  const result = db.prepare('UPDATE todos SET status = ?, completed_at = CASE WHEN ? = \'done\' THEN datetime(\'now\') ELSE NULL END WHERE id = ?')
    .run(status, status, req.params.id);
  res.json({ success: result.changes > 0 });
});

module.exports = router;
