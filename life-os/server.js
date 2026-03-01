require('dotenv').config();
const express = require('express');
const path = require('path');
const { getDb, closeDb } = require('./config/database');
const { logger } = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 3045;
const HOST = process.env.HOST || '127.0.0.1';

// ── Middleware ───────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Request logging
app.use((req, res, next) => {
  if (!req.path.startsWith('/dashboard') && !req.path.startsWith('/data')) {
    logger.info(`${req.method} ${req.path}`, { service: 'http' });
  }
  next();
});

// ── Static Files ────────────────────────────────────
app.use('/dashboard', express.static(path.join(__dirname, 'public', 'dashboard')));
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

// ── API Routes ──────────────────────────────────────
app.use('/api/finance', require('./routes/finance'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/health', require('./routes/health'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/score', require('./routes/score'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/briefs', require('./routes/briefs'));
app.use('/api/sync', require('./routes/sync'));

// ── Root redirect ───────────────────────────────────
app.get('/', (req, res) => res.redirect('/dashboard/'));

// ── Health check ────────────────────────────────────
app.get('/api/ping', (req, res) => {
  const db = getDb();
  try {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ── Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { service: 'http', stack: err.stack });
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ── 404 Handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

// ── Start Server ────────────────────────────────────
const server = app.listen(PORT, HOST, () => {
  logger.info(`Life OS running at http://${HOST}:${PORT}`, { service: 'server' });
  logger.info(`Dashboard: http://${HOST}:${PORT}/dashboard/`, { service: 'server' });

  // Start cron scheduler
  try {
    require('./cron/scheduler').start();
    logger.info('Cron scheduler started', { service: 'server' });
  } catch (err) {
    logger.warn(`Cron scheduler not started: ${err.message}`, { service: 'server' });
  }
});

// ── Graceful Shutdown ───────────────────────────────
function shutdown(signal) {
  logger.info(`${signal} received. Shutting down...`, { service: 'server' });
  server.close(() => {
    closeDb();
    logger.info('Server closed', { service: 'server' });
    process.exit(0);
  });
  setTimeout(() => { process.exit(1); }, 5000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
