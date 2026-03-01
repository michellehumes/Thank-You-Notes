/**
 * Executive Scoring Service
 * Composite 0-100 score across 6 dimensions:
 *   Financial Stability  30%
 *   Career Momentum      25%
 *   Health Readiness      15%
 *   Inbox Load            10%
 *   Relationship Hygiene  10%
 *   System Integrity      10%
 */
const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');
const financeService = require('./financeService');
const jobService = require('./jobService');

const log = createServiceLogger('scoring');

// Lazy-load optional services to avoid crashes if not configured
function tryRequire(mod) {
  try { return require(mod); } catch { return null; }
}

function calculateFinancialScore() {
  try {
    const runway = financeService.getRunwayMonths();
    const drift = financeService.getDriftDetection();
    const burn = financeService.getBurnRate(30);

    let score = 0;

    // Runway component (0-15 pts)
    if (runway.runway_months >= 12) score += 15;
    else if (runway.runway_months >= 9) score += 12;
    else if (runway.runway_months >= 6) score += 9;
    else if (runway.runway_months >= 3) score += 5;
    else score += 2;

    // Burn stability (0-10 pts)
    const trendPct = Math.abs(runway.burn_trend_percent || 0);
    if (trendPct < 5) score += 10;
    else if (trendPct < 10) score += 7;
    else if (trendPct < 20) score += 4;
    else score += 1;

    // Drift flags (0-5 pts)
    const flags = drift.flags?.length || 0;
    if (flags === 0) score += 5;
    else if (flags <= 2) score += 3;
    else score += 1;

    return { score: Math.min(30, score), max: 30, details: { runway_months: runway.runway_months, burn_trend: trendPct, drift_flags: flags } };
  } catch (err) {
    log.error(`Financial score error: ${err.message}`);
    return { score: 0, max: 30, error: err.message };
  }
}

function calculateCareerScore() {
  try {
    const analytics = jobService.getAnalytics();
    let score = 0;

    // Tier 1 roles (0-10 pts)
    const t1 = (analytics.by_tier || []).find(t => t.tier === 1);
    const t1Count = t1?.count || 0;
    if (t1Count >= 5) score += 10;
    else if (t1Count >= 3) score += 7;
    else if (t1Count >= 1) score += 4;

    // Interview activity (0-8 pts)
    const interviewing = (analytics.by_status || []).find(s => s.status === 'interviewing');
    const interviewCount = interviewing?.count || 0;
    if (interviewCount >= 3) score += 8;
    else if (interviewCount >= 1) score += 5;
    else score += 1;

    // Pipeline breadth (0-7 pts)
    const total = analytics.total || 0;
    if (total >= 15) score += 7;
    else if (total >= 10) score += 5;
    else if (total >= 5) score += 3;
    else if (total >= 1) score += 1;

    return { score: Math.min(25, score), max: 25, details: { tier1_roles: t1Count, interviewing: interviewCount, pipeline_total: total } };
  } catch (err) {
    log.error(`Career score error: ${err.message}`);
    return { score: 0, max: 25, error: err.message };
  }
}

function calculateHealthScore() {
  const oura = tryRequire('./ouraService');
  if (!oura || !oura.isConfigured()) return { score: 0, max: 15, status: 'not_configured' };
  try {
    return oura.getHealthScore();
  } catch (err) {
    return { score: 0, max: 15, error: err.message };
  }
}

function calculateInboxScore() {
  const gmail = tryRequire('./gmailService');
  if (!gmail || !gmail.hasTokens()) return { score: 0, max: 10, status: 'not_configured' };
  try {
    return gmail.getInboxScore();
  } catch (err) {
    return { score: 0, max: 10, error: err.message };
  }
}

function calculateRelationshipScore() {
  const imessage = tryRequire('./imessageService');
  if (!imessage || !imessage.isConfigured()) return { score: 0, max: 10, status: 'not_configured' };
  try {
    return imessage.getRelationshipScore();
  } catch (err) {
    return { score: 0, max: 10, error: err.message };
  }
}

function calculateSystemScore() {
  const db = getDb();

  let score = 0;

  // DB has data (3 pts)
  const txnCount = db.prepare('SELECT COUNT(*) as cnt FROM transactions').get().cnt;
  if (txnCount > 0) score += 3;

  // Recent sync (4 pts)
  const recentSync = db.prepare("SELECT COUNT(*) as cnt FROM sync_log WHERE synced_at > datetime('now', '-1 day')").get().cnt;
  if (recentSync > 0) score += 4;

  // No errors in sync log (3 pts)
  const errors = db.prepare("SELECT COUNT(*) as cnt FROM sync_log WHERE status = 'error' AND synced_at > datetime('now', '-1 day')").get().cnt;
  if (errors === 0) score += 3;

  return { score: Math.min(10, score), max: 10, details: { transactions: txnCount, recent_syncs: recentSync, recent_errors: errors } };
}

function calculateExecutiveScore() {
  const financial = calculateFinancialScore();
  const career = calculateCareerScore();
  const health = calculateHealthScore();
  const inbox = calculateInboxScore();
  const relationship = calculateRelationshipScore();
  const system = calculateSystemScore();

  const overall = financial.score + career.score + health.score + inbox.score + relationship.score + system.score;

  const result = {
    overall,
    max: 100,
    grade: overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : overall >= 40 ? 'D' : 'F',
    components: {
      financial_stability: financial,
      career_momentum: career,
      health_readiness: health,
      inbox_load: inbox,
      relationship_hygiene: relationship,
      system_integrity: system
    },
    calculated_at: new Date().toISOString()
  };

  // Persist to DB
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO executive_scores (date, overall_score, financial_stability, career_momentum, health_readiness, inbox_load, relationship_hygiene, system_integrity, risk_flags, primary_focus_area, breakdown)
      VALUES (date('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      overall, financial.score, career.score, health.score, inbox.score, relationship.score, system.score,
      null, null, JSON.stringify(result.components)
    );
  } catch (err) {
    // Might fail on duplicate date — that's OK
    log.debug(`Score persist: ${err.message}`);
  }

  return result;
}

function getScoreHistory(days = 30) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM executive_scores
    ORDER BY date DESC LIMIT ?
  `).all(days);
}

module.exports = { calculateExecutiveScore, getScoreHistory };
