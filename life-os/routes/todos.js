const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// Ensure category column exists (ALTER TABLE is idempotent-safe with try/catch)
try {
  const db = getDb();
  db.prepare('ALTER TABLE todos ADD COLUMN category TEXT DEFAULT \'general\'').run();
} catch (err) {
  // Column already exists — ignore "duplicate column name" error
}

// GET /api/todos
router.get('/', (req, res) => {
  const db = getDb();
  const filter = req.query.status;

  let rows;
  if (filter === 'done') {
    rows = db.prepare('SELECT * FROM todos WHERE completed = 1 ORDER BY completed_at DESC').all();
  } else if (filter === 'dismissed') {
    rows = db.prepare('SELECT * FROM todos WHERE dismissed = 1 ORDER BY created_at DESC').all();
  } else if (filter === 'pending') {
    rows = db.prepare('SELECT * FROM todos WHERE completed = 0 AND dismissed = 0 ORDER BY priority ASC, created_at DESC').all();
  } else {
    rows = db.prepare('SELECT * FROM todos ORDER BY completed ASC, dismissed ASC, priority ASC, created_at DESC').all();
  }
  res.json(rows);
});

// POST /api/todos
router.post('/', (req, res) => {
  const db = getDb();
  const { title, description, category, priority, due_date, source, source_ref } = req.body;
  const result = db.prepare(
    'INSERT INTO todos (title, description, category, priority, due_date, source, source_ref) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(title, description || null, category || 'general', priority || 3, due_date || null, source || 'manual', source_ref || null);
  res.json({ id: result.lastInsertRowid });
});

// PATCH /api/todos/:id
router.patch('/:id', (req, res) => {
  const db = getDb();
  const { completed, dismissed } = req.body;
  let result;

  if (completed !== undefined) {
    result = db.prepare(
      'UPDATE todos SET completed = ?, completed_at = CASE WHEN ? = 1 THEN datetime(\'now\') ELSE NULL END WHERE id = ?'
    ).run(completed ? 1 : 0, completed ? 1 : 0, req.params.id);
  } else if (dismissed !== undefined) {
    result = db.prepare(
      'UPDATE todos SET dismissed = ? WHERE id = ?'
    ).run(dismissed ? 1 : 0, req.params.id);
  } else {
    return res.status(400).json({ error: 'Provide completed or dismissed field' });
  }

  res.json({ success: result.changes > 0 });
});

module.exports = router;
