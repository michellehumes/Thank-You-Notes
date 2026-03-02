const { getDb } = require('../config/database');
const logger = require('../config/logger');

const WEIGHTS = {
  financial: 0.30,
  career: 0.25,
  health: 0.15,
  inbox: 0.10,
  relationships: 0.10,
  system: 0.10
};

const scoringService = {
  calculateExecutiveScore() {
    const db = getDb();
    const scores = {};
    const riskFlags = [];

    // Financial (30%)
    scores.financial = this._scoreFinancial(db, riskFlags);
    // Career (25%)
    scores.career = this._scoreCareer(db, riskFlags);
    // Health (15%)
    scores.health = this._scoreHealth(db, riskFlags);
    // Inbox (10%)
    scores.inbox = this._scoreInbox(db, riskFlags);
    // Relationships (10%)
    scores.relationships = this._scoreRelationships(db, riskFlags);
    // System (10%)
    scores.system = this._scoreSystem(db, riskFlags);

    const overall = Math.round(
      Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + (scores[key] * weight), 0)
    );

    // Find weakest domain
    const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
    const primaryFocus = weakest[0];

    const result = {
      overall_score: overall,
      breakdown: scores,
      risk_flags: riskFlags,
      primary_focus_area: primaryFocus,
      calculated_at: new Date().toISOString()
    };

    // Persist
    const today = new Date().toISOString().split('T')[0];
    try {
      db.prepare(`
        INSERT OR REPLACE INTO executive_score_history
        (date, overall_score, financial_score, career_score, health_score, inbox_score, relationship_score, system_score, risk_flags, primary_focus_area)
        VALUES (@date, @overall, @financial, @career, @health, @inbox, @relationships, @system, @risk_flags, @primary_focus)
      `).run({
        date: today,
        overall,
        financial: scores.financial,
        career: scores.career,
        health: scores.health,
        inbox: scores.inbox,
        relationships: scores.relationships,
        system: scores.system,
        risk_flags: JSON.stringify(riskFlags),
        primary_focus: primaryFocus
      });
    } catch (e) {
      logger.error('Failed to persist executive score', e);
    }

    return result;
  },

  _scoreFinancial(db, riskFlags) {
    let score = 80; // Base score
    // Check recent anomalies
    const anomalies = db.prepare(`
      SELECT COUNT(*) as cnt FROM anomaly_log
      WHERE date >= date('now', '-7 days') AND acknowledged = 0
    `).get();
    if (anomalies.cnt > 0) score -= anomalies.cnt * 5;
    if (anomalies.cnt >= 3) riskFlags.push('Multiple unacknowledged financial anomalies');

    // Check burn rate trend (if data exists)
    const months = db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as spend
      FROM finance_transactions
      WHERE classification NOT IN ('transfer', 'investment') AND type != 'income'
        AND date >= date('now', '-3 months')
      GROUP BY month ORDER BY month DESC LIMIT 3
    `).all();
    if (months.length >= 2 && months[0].spend > months[1].spend * 1.15) {
      score -= 10;
      riskFlags.push('Spending trending upward');
    }

    return Math.max(0, Math.min(100, score));
  },

  _scoreCareer(db, riskFlags) {
    let score = 50; // Neutral base
    const tier1 = db.prepare("SELECT COUNT(*) as cnt FROM job_listings WHERE tier = 1 AND status NOT IN ('Rejected', 'Archived')").get();
    const active = db.prepare("SELECT COUNT(*) as cnt FROM job_listings WHERE status NOT IN ('Rejected', 'Archived')").get();
    const interviews = db.prepare("SELECT COUNT(*) as cnt FROM job_listings WHERE stage IN ('Interview', 'Final Round')").get();

    score += Math.min(tier1.cnt * 8, 24); // Up to +24 for tier 1 roles
    score += Math.min(active.cnt * 2, 16); // Up to +16 for active pipeline
    score += interviews.cnt * 10; // +10 per active interview

    if (tier1.cnt === 0) riskFlags.push('No Tier 1 roles in pipeline');
    if (active.cnt < 5) riskFlags.push('Pipeline thin — fewer than 5 active roles');

    return Math.max(0, Math.min(100, score));
  },

  _scoreHealth(db, riskFlags) {
    const latest = db.prepare('SELECT * FROM oura_daily ORDER BY date DESC LIMIT 1').get();
    if (!latest) return 50; // No data = neutral

    let score = 0;
    if (latest.sleep_score) score += (latest.sleep_score / 100) * 40;
    if (latest.readiness_score) score += (latest.readiness_score / 100) * 35;
    if (latest.activity_score) score += (latest.activity_score / 100) * 25;

    if (latest.sleep_score && latest.sleep_score < 60) riskFlags.push(`Low sleep score: ${latest.sleep_score}`);
    if (latest.readiness_score && latest.readiness_score < 60) riskFlags.push(`Low readiness: ${latest.readiness_score}`);

    return Math.round(Math.max(0, Math.min(100, score)));
  },

  _scoreInbox(db, riskFlags) {
    let score = 90; // Start high
    const unread = db.prepare("SELECT COUNT(*) as cnt FROM gmail_threads WHERE is_read = 0").get();
    const needsResponse = db.prepare("SELECT COUNT(*) as cnt FROM gmail_threads WHERE needs_response = 1 AND is_read = 0").get();

    score -= Math.min(unread.cnt, 20); // -1 per unread, max -20
    score -= needsResponse.cnt * 5; // -5 per needs-response

    if (needsResponse.cnt > 3) riskFlags.push(`${needsResponse.cnt} emails need response`);

    return Math.max(0, Math.min(100, score));
  },

  _scoreRelationships(db, riskFlags) {
    let score = 85; // Start high
    const unanswered = db.prepare("SELECT COUNT(*) as cnt FROM imessage_threads WHERE unanswered_hours > 24 AND last_message_is_from_me = 0 AND is_priority_contact = 1").get();
    score -= unanswered.cnt * 10;

    if (unanswered.cnt > 0) riskFlags.push(`${unanswered.cnt} priority messages unanswered >24h`);

    // Check upcoming birthdays
    const birthdays = db.prepare(`
      SELECT COUNT(*) as cnt FROM birthdays
      WHERE birthday >= strftime('%m-%d', 'now')
        AND birthday <= strftime('%m-%d', date('now', '+3 days'))
    `).get();
    if (birthdays.cnt > 0) score -= 5; // Gentle nudge

    return Math.max(0, Math.min(100, score));
  },

  _scoreSystem(db, riskFlags) {
    let score = 100;
    const staleServices = db.prepare(`
      SELECT service FROM sync_state
      WHERE last_sync_at < datetime('now', '-2 days') OR last_sync_status = 'error'
    `).all();

    score -= staleServices.length * 15;
    if (staleServices.length > 0) {
      riskFlags.push(`Stale syncs: ${staleServices.map(s => s.service).join(', ')}`);
    }

    return Math.max(0, Math.min(100, score));
  },

  getLatestScore() {
    const db = getDb();
    return db.prepare('SELECT * FROM executive_score_history ORDER BY date DESC LIMIT 1').get();
  },

  getScoreHistory(days = 30) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM executive_score_history
      WHERE date >= date('now', '-' || @days || ' days')
      ORDER BY date ASC
    `).all({ days });
  }
};

module.exports = scoringService;
