/**
 * Executive Brief Service
 * Generates daily digest combining all system data into an actionable brief
 */
const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');
const financeService = require('./financeService');
const anomalyService = require('./anomalyService');
const jobService = require('./jobService');
const scoringService = require('./scoringService');
const todoAutomation = require('./todoAutomationService');

const log = createServiceLogger('brief');

function tryRequire(mod) {
  try { return require(mod); } catch { return null; }
}

function generateBrief() {
  const today = new Date().toISOString().split('T')[0];
  log.info(`Generating executive brief for ${today}`);

  // Calculate executive score first
  const score = scoringService.calculateExecutiveScore();

  // Generate auto-todos
  const autoTodos = todoAutomation.generateAllTodos();

  // Finance section
  const runway = financeService.getRunwayMonths();
  const burn = financeService.getBurnRate(30);
  const drift = financeService.getDriftDetection();
  const anomalies = anomalyService.getActiveAnomalies();

  const financeSection = {
    title: 'Financial Health',
    score: score.components.financial_stability.score,
    max: 30,
    highlights: [
      `Runway: ${runway.runway_months} months at $${Math.round(runway.monthly_burn_avg).toLocaleString()}/mo`,
      `30-day burn: $${Math.round(burn.monthly_burn).toLocaleString()} (${burn.daily_burn ? '$' + Math.round(burn.daily_burn) + '/day' : 'N/A'})`,
      `Burn trend: ${runway.burn_trend_percent > 0 ? '+' : ''}${Math.round(runway.burn_trend_percent || 0)}%`,
      `Active anomalies: ${anomalies.length} (${anomalies.filter(a => a.severity === 'critical').length} critical)`,
      `Drift flags: ${drift.flags?.length || 0}`
    ]
  };

  // Career section
  const analytics = jobService.getAnalytics();
  const t1 = (analytics.by_tier || []).find(t => t.tier === 1);

  const careerSection = {
    title: 'Career Pipeline',
    score: score.components.career_momentum.score,
    max: 25,
    highlights: [
      `Total roles: ${analytics.total || 0}`,
      `Tier 1: ${t1?.count || 0}`,
      `Avg composite: ${analytics.composite_stats?.avg ? Math.round(analytics.composite_stats.avg) : 'N/A'}`,
      `Interviewing: ${(analytics.by_status || []).find(s => s.status === 'interviewing')?.count || 0}`
    ]
  };

  // Health section
  const oura = tryRequire('./ouraService');
  let healthSection = { title: 'Health', score: 0, max: 15, highlights: ['Oura not configured'] };
  if (oura && oura.isConfigured()) {
    try {
      const trend = oura.getTrend(7);
      healthSection.highlights = [
        `Sleep: ${trend.averages.sleep_score || 'N/A'}`,
        `Readiness: ${trend.averages.readiness_score || 'N/A'}`,
        `Activity: ${trend.averages.activity_score || 'N/A'}`,
        `Avg sleep: ${trend.averages.sleep_hours || 'N/A'}h`
      ];
      healthSection.score = score.components.health_readiness.score;
    } catch {}
  }

  // Messages section
  const imessage = tryRequire('./imessageService');
  let msgSection = { title: 'Messages', score: 0, max: 10, highlights: ['iMessage not configured'] };
  if (imessage && imessage.isConfigured()) {
    try {
      const pending = imessage.getPendingMessages();
      msgSection.highlights = [
        `Unanswered: ${pending.length}`,
        `Overdue (24h+): ${pending.filter(m => m.waiting_hours > 24).length}`
      ];
      msgSection.score = score.components.relationship_hygiene.score;
    } catch {}
  }

  // Build action items from auto-todos
  const actionItems = autoTodos.todos.map(t => ({
    text: t.title,
    category: t.category,
    priority: t.priority
  }));

  // Risk flags
  const riskFlags = [];
  if (runway.runway_months < 6) riskFlags.push({ level: 'critical', text: `Low runway: ${runway.runway_months} months` });
  if (anomalies.filter(a => a.severity === 'critical').length > 0) riskFlags.push({ level: 'critical', text: `${anomalies.filter(a => a.severity === 'critical').length} critical anomalies` });
  if (drift.flags?.length > 2) riskFlags.push({ level: 'warning', text: `${drift.flags.length} drift flags active` });
  if ((!t1 || t1.count === 0)) riskFlags.push({ level: 'warning', text: 'No Tier 1 roles in pipeline' });

  const sections = {
    finance: financeSection,
    career: careerSection,
    health: healthSection,
    messages: msgSection
  };

  // Derive status label from grade
  const statusLabel = score.grade === 'A' ? 'Excellent' : score.grade === 'B' ? 'Good' : score.grade === 'C' ? 'Fair' : score.grade === 'D' ? 'Needs Attention' : 'Critical';

  // Build summaries for DB columns
  const financialSummary = financeSection.highlights.join('; ');
  const careerSummary = careerSection.highlights.join('; ');
  const healthSummary = healthSection.highlights.join('; ');

  // Inbox priority
  const gmail = tryRequire('./gmailService');
  let inboxPriority = 'Not configured';
  if (gmail && gmail.hasTokens()) {
    try {
      const stats = gmail.getInboxStats();
      inboxPriority = JSON.stringify(stats);
    } catch {}
  }

  // Messages to reply
  const messagesToReply = msgSection.highlights.join('; ');

  // Birthdays
  const db = getDb();
  let birthdaysSoon = '';
  try {
    const upcoming = db.prepare(`
      SELECT full_name, birthday FROM contacts
      WHERE birthday IS NOT NULL
      ORDER BY birthday ASC LIMIT 5
    `).all();
    birthdaysSoon = JSON.stringify(upcoming);
  } catch {}

  // Top 3 actions from auto-todos
  const top3Actions = JSON.stringify(actionItems.slice(0, 3));

  // Natural language brief
  const naturalLanguage = `Executive Score: ${score.overall}/100 (${statusLabel}). ` +
    `Financial: ${financeSection.highlights[0]}. ` +
    `Career: ${careerSection.highlights[0]}. ` +
    `${riskFlags.length > 0 ? 'Risks: ' + riskFlags.map(r => r.text).join(', ') + '.' : 'No active risks.'}`;

  // Persist brief
  try {
    db.prepare(`
      INSERT OR REPLACE INTO executive_briefs (date, executive_score, status_label, health_summary, financial_summary, career_summary, inbox_priority, messages_to_reply, birthdays_soon, risk_flags, top_3_actions, natural_language, generated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      today,
      score.overall,
      statusLabel,
      healthSummary,
      financialSummary,
      careerSummary,
      inboxPriority,
      messagesToReply,
      birthdaysSoon,
      JSON.stringify(riskFlags),
      top3Actions,
      naturalLanguage
    );
  } catch (err) {
    log.error(`Failed to persist brief: ${err.message}`);
  }

  log.info(`Brief generated: score=${score.overall}, actions=${actionItems.length}, risks=${riskFlags.length}`);

  return {
    date: today,
    executive_score: score.overall,
    status_label: statusLabel,
    health_summary: healthSummary,
    financial_summary: financialSummary,
    career_summary: careerSummary,
    inbox_priority: inboxPriority,
    messages_to_reply: messagesToReply,
    birthdays_soon: birthdaysSoon,
    risk_flags: riskFlags,
    top_3_actions: actionItems.slice(0, 3),
    natural_language: naturalLanguage,
    score_breakdown: score.components,
    generated_at: new Date().toISOString()
  };
}

module.exports = { generateBrief };
