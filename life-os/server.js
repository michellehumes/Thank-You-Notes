require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./config/logger');
const { initializeDb, closeDb } = require('./config/database');
const { rateLimiter } = require('./utils/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Optional password gate
if (process.env.DASHBOARD_PASSWORD) {
  app.use((req, res, next) => {
    // Allow API health check without auth
    if (req.path === '/api/health-check') return next();
    // Allow login page
    if (req.path === '/login' && req.method === 'GET') {
      return res.send(`
        <form method="POST" action="/login" style="max-width:300px;margin:100px auto;font-family:sans-serif;">
          <h2>Life OS</h2>
          <input type="password" name="password" placeholder="Password" style="width:100%;padding:8px;margin:8px 0;">
          <button type="submit" style="width:100%;padding:8px;">Enter</button>
        </form>
      `);
    }
    if (req.path === '/login' && req.method === 'POST') {
      if (req.body.password === process.env.DASHBOARD_PASSWORD) {
        res.cookie('life_os_auth', 'authenticated', { httpOnly: true, maxAge: 86400000 });
        return res.redirect('/dashboard/');
      }
      return res.status(401).send('Invalid password');
    }
    // Check auth cookie
    if (req.cookies.life_os_auth !== 'authenticated') {
      return res.redirect('/login');
    }
    next();
  });
}

// Static files
app.use('/dashboard', express.static(path.join(__dirname, 'public', 'dashboard')));
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

// Rate limiting for API routes
app.use('/api', rateLimiter({ windowMs: 60000, max: 100 }));

// API Routes
app.use('/api/finance', require('./routes/finance'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/health', require('./routes/health'));
app.use('/api/score', require('./routes/score'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/sync', require('./routes/sync'));

// Health check
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root redirect
app.get('/', (req, res) => res.redirect('/dashboard/'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    method: req.method, 
    path: req.path, 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
function start() {
  initializeDb();

  const server = app.listen(PORT, HOST, () => {
    logger.info(`Executive Life OS running at http://${HOST}:${PORT}`);
  });

  // Start cron scheduler if available
  try {
    const { startScheduler } = require('./jobs/scheduler');
    startScheduler();
  } catch (e) {
    logger.warn('Cron scheduler not available yet', { error: e.message });
  }

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down...');
    server.close(() => {
      closeDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();

module.exports = app;
