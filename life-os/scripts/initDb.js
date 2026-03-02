require('dotenv').config();
const { initializeDb, closeDb } = require('../config/database');

console.log('Initializing Executive Life OS database...');
try {
  initializeDb();
  console.log('Database initialized successfully.');
} catch (err) {
  console.error('Database initialization failed:', err.message);
  process.exit(1);
} finally {
  closeDb();
}
