const cron = require('node-cron');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('cron');

function tryRequire(mod) {
  try { return require(mod); } catch { return null; }
}

function startScheduler() {
  log.info('Starting cron scheduler...');

  // ── 6:00 AM — Morning sync (Oura, Gmail, iMessage) ────────
  cron.schedule('0 6 * * *', async () => {
    log.info('Running morning sync...');

    // Oura
    const oura = tryRequire('../services/ouraService');
    if (oura?.isConfigured()) {
      try {
        await oura.syncDailyData();
        log.info('Oura sync complete');
      } catch (err) { log.error(`Oura sync failed: ${err.message}`); }
    }

    // Gmail
    const gmail = tryRequire('../services/gmailService');
    if (gmail?.hasTokens()) {
      try {
        await gmail.syncInbox(50);
        log.info('Gmail sync complete');
      } catch (err) { log.error(`Gmail sync failed: ${err.message}`); }
    }

    // iMessage
    const imessage = tryRequire('../services/imessageService');
    if (imessage?.isConfigured()) {
      try {
        imessage.syncToDb();
        log.info('iMessage sync complete');
      } catch (err) { log.error(`iMessage sync failed: ${err.message}`); }
    }
  });

  // ── 7:00 AM — Generate daily executive brief ──────────────
  cron.schedule('0 7 * * *', () => {
    log.info('Generating morning executive brief...');
    try {
      const briefService = require('../services/executiveBriefService');
      const brief = briefService.generateBrief();
      log.info(`Executive brief generated: score=${brief.executive_score}, grade=${brief.grade}`);
    } catch (err) {
      log.error(`Brief generation failed: ${err.message}`);
    }
  });

  // ── 12:00 PM — Midday sync ────────────────────────────────
  cron.schedule('0 12 * * *', async () => {
    log.info('Running midday sync...');
    const gmail = tryRequire('../services/gmailService');
    if (gmail?.hasTokens()) {
      try { await gmail.syncInbox(30); } catch (err) { log.error(`Midday Gmail: ${err.message}`); }
    }

    const imessage = tryRequire('../services/imessageService');
    if (imessage?.isConfigured()) {
      try { imessage.syncToDb(); } catch (err) { log.error(`Midday iMessage: ${err.message}`); }
    }
  });

  // ── 6:00 PM — Auto-todo generation ────────────────────────
  cron.schedule('0 18 * * *', () => {
    log.info('Running auto-todo generation...');
    try {
      const todoService = require('../services/todoAutomationService');
      const result = todoService.generateAllTodos();
      log.info(`Auto-todos: ${result.inserted} new of ${result.candidates} candidates`);
    } catch (err) {
      log.error(`Auto-todo failed: ${err.message}`);
    }
  });

  // ── 11:00 PM — Nightly finance snapshot ───────────────────
  cron.schedule('0 23 * * *', () => {
    log.info('Running finance snapshot...');
    try {
      const financeService = require('../services/financeService');
      const { getDb } = require('../config/database');
      const db = getDb();
      const burn = financeService.getBurnRate(30);
      const runway = financeService.getRunwayMonths();
      db.prepare(`
        INSERT INTO financial_snapshots (date, total_spend_30d, runway_months, liquid_assets, burn_trend_percent, recurring_ratio)
        VALUES (date('now'), ?, ?, ?, ?, ?)
      `).run(burn.monthly_burn, runway.runway_months, runway.liquid_assets, runway.burn_trend_percent, 0);
      log.info('Finance snapshot saved');
    } catch (err) {
      log.error(`Finance snapshot failed: ${err.message}`);
    }
  });

  // ── 11:30 PM — Anomaly detection ─────────────────────────
  cron.schedule('30 23 * * *', () => {
    log.info('Running anomaly detection...');
    try {
      const anomalyService = require('../services/anomalyService');
      const results = anomalyService.runAllDetections();
      log.info(`Anomaly detection: ${results.length} anomalies found`);
    } catch (err) {
      log.error(`Anomaly detection failed: ${err.message}`);
    }
  });

  log.info('Cron scheduler started:');
  log.info('  06:00 — Morning sync (Oura, Gmail, iMessage)');
  log.info('  07:00 — Executive brief generation');
  log.info('  12:00 — Midday sync (Gmail, iMessage)');
  log.info('  18:00 — Auto-todo generation');
  log.info('  23:00 — Finance snapshot');
  log.info('  23:30 — Anomaly detection');
}

module.exports = { startScheduler };
