/**
 * Auto-Todo Generation Service
 * Generates actionable todos from data signals across all subsystems
 */
const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('auto-todo');

function tryRequire(mod) {
  try { return require(mod); } catch { return null; }
}

function generateFinanceTodos() {
  const todos = [];
  const financeService = require('./financeService');
  const anomalyService = require('./anomalyService');

  // Check anomalies
  const anomalies = anomalyService.getActiveAnomalies();
  const critical = anomalies.filter(a => a.severity === 'critical');
  if (critical.length > 0) {
    todos.push({
      title: `Review ${critical.length} critical financial anomal${critical.length === 1 ? 'y' : 'ies'}`,
      category: 'finance',
      priority: 1,
      source: 'auto:anomaly',
      detail: critical.map(a => a.description).join('; ')
    });
  }

  // Check runway
  const runway = financeService.getRunwayMonths();
  if (runway.runway_months < 6) {
    todos.push({
      title: `Runway below 6 months (${runway.runway_months}mo) — review spending`,
      category: 'finance',
      priority: 1,
      source: 'auto:runway'
    });
  }

  // Check burn trend
  if (Math.abs(runway.burn_trend_percent) > 15) {
    todos.push({
      title: `Burn rate trending ${runway.burn_trend_percent > 0 ? 'up' : 'down'} ${Math.abs(Math.round(runway.burn_trend_percent))}% — investigate`,
      category: 'finance',
      priority: 2,
      source: 'auto:burn_trend'
    });
  }

  return todos;
}

function generateCareerTodos() {
  const todos = [];
  const jobService = require('./jobService');

  const analytics = jobService.getAnalytics();

  // No tier 1 roles
  const t1 = (analytics.by_tier || []).find(t => t.tier === 1);
  if (!t1 || t1.count === 0) {
    todos.push({
      title: 'No Tier 1 roles in pipeline — source new opportunities',
      category: 'career',
      priority: 1,
      source: 'auto:pipeline'
    });
  }

  // Stale pipeline (all watching, none active)
  const active = (analytics.by_status || []).find(s => s.status === 'active' || s.status === 'interviewing');
  if (!active || active.count === 0) {
    todos.push({
      title: 'No active applications — move top roles to applied',
      category: 'career',
      priority: 2,
      source: 'auto:pipeline_stale'
    });
  }

  return todos;
}

function generateMessageTodos() {
  const todos = [];
  const imessage = tryRequire('./imessageService');

  if (imessage && imessage.isConfigured()) {
    try {
      const pending = imessage.getPendingMessages();
      const overdue = pending.filter(m => m.waiting_hours > 24);

      if (overdue.length > 0) {
        todos.push({
          title: `Reply to ${overdue.length} overdue message${overdue.length === 1 ? '' : 's'} (24h+)`,
          category: 'relationships',
          priority: 2,
          source: 'auto:imessage',
          detail: overdue.slice(0, 3).map(m => m.contact_name || m.contact_identifier).join(', ')
        });
      }
    } catch (err) {
      log.debug(`iMessage todos skipped: ${err.message}`);
    }
  }

  return todos;
}

function generateHealthTodos() {
  const todos = [];
  const oura = tryRequire('./ouraService');

  if (oura && oura.isConfigured()) {
    try {
      const today = oura.getToday();
      if (today && today.sleep_score && today.sleep_score < 70) {
        todos.push({
          title: `Low sleep score (${today.sleep_score}) — prioritize recovery today`,
          category: 'health',
          priority: 2,
          source: 'auto:oura'
        });
      }
      if (today && today.readiness_score && today.readiness_score < 60) {
        todos.push({
          title: `Low readiness (${today.readiness_score}) — reduce workload today`,
          category: 'health',
          priority: 2,
          source: 'auto:oura'
        });
      }
    } catch (err) {
      log.debug(`Oura todos skipped: ${err.message}`);
    }
  }

  return todos;
}

function generateAllTodos() {
  const allTodos = [
    ...generateFinanceTodos(),
    ...generateCareerTodos(),
    ...generateMessageTodos(),
    ...generateHealthTodos()
  ];

  const db = getDb();

  // Only insert if not already exists (match by source + similar title)
  let inserted = 0;
  for (const todo of allTodos) {
    const existing = db.prepare(
      "SELECT id FROM todos WHERE source = ? AND completed = 0 AND title = ?"
    ).get(todo.source, todo.title);

    if (!existing) {
      db.prepare(
        'INSERT INTO todos (title, category, priority, source, due_date) VALUES (?, ?, ?, ?, date(\'now\'))'
      ).run(todo.title, todo.category, todo.priority, todo.source);
      inserted++;
    }
  }

  log.info(`Auto-todo: generated ${allTodos.length} candidates, ${inserted} new inserted`);
  return { candidates: allTodos.length, inserted, todos: allTodos };
}

module.exports = { generateAllTodos, generateFinanceTodos, generateCareerTodos, generateMessageTodos, generateHealthTodos };
