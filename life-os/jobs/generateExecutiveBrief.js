const scoringService = require('../services/scoringService');
const financeService = require('../services/financeService');
const anomalyService = require('../services/anomalyService');
const todoAutomationService = require('../services/todoAutomationService');
const { getDb } = require('../config/database');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

module.exports = {
  run() {
    try {
      // 1. Generate auto-todos
      const todoResult = todoAutomationService.generateAutoTodos();

      // 2. Calculate executive score
      const score = scoringService.calculateExecutiveScore();

      // 3. Run anomaly detection
      const anomalies = anomalyService.runFinancialAnomalyDetection();

      // 4. Gather data
      const db = getDb();
      const pendingTodos = todoAutomationService.getTodos({ status: 'pending' });

      // Get total liquid assets from accounts for runway calculation
      const liquidRow = db.prepare("SELECT COALESCE(SUM(balance), 50000) as total FROM accounts WHERE type IN ('checking', 'savings')").get();
      const runway = financeService.getRunway(liquidRow.total);

      const latestHealth = db.prepare('SELECT * FROM oura_daily ORDER BY date DESC LIMIT 1').get();
      const activeJobs = db.prepare("SELECT COUNT(*) as cnt FROM job_listings WHERE status NOT IN ('Rejected', 'Archived')").get();
      const tier1Jobs = db.prepare("SELECT COUNT(*) as cnt FROM job_listings WHERE tier = 1 AND status != 'Rejected'").get();

      // 5. Build brief
      const today = new Date().toISOString().split('T')[0];
      const brief = {
        date: today,
        executive_score: score.overall_score,
        status: score.overall_score >= 70 ? 'GREEN' : score.overall_score >= 50 ? 'YELLOW' : 'RED',
        risk_flags: score.risk_flags,
        primary_focus: score.primary_focus_area,
        financial: {
          runway_months: runway.runway_months,
          avg_monthly_burn: runway.avg_burn,
          anomaly_count: anomalies.length,
          critical_anomalies: anomalies.filter(a => a.severity === 'critical')
        },
        career: {
          active_pipeline: activeJobs.cnt,
          tier_1_roles: tier1Jobs.cnt
        },
        health: latestHealth ? {
          sleep_score: latestHealth.sleep_score,
          readiness: latestHealth.readiness_score,
          activity: latestHealth.activity_score
        } : null,
        todos: {
          pending_count: pendingTodos.length,
          critical: pendingTodos.filter(t => t.priority <= 2),
          new_auto_generated: todoResult.created
        },
        breakdown: score.breakdown
      };

      // 6. Generate natural language summary
      brief.summary = this._generateSummary(brief);

      // 7. Save to DB
      db.prepare(`
        INSERT OR REPLACE INTO executive_brief (date, executive_score, summary_text, brief_json)
        VALUES (@date, @executive_score, @summary, @brief_json)
      `).run({
        date: today,
        executive_score: brief.executive_score,
        summary: brief.summary,
        brief_json: JSON.stringify(brief)
      });

      // 8. Write JSON files for dashboard
      const dataDir = path.join(__dirname, '..', 'public', 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

      fs.writeFileSync(path.join(dataDir, 'executive-brief.json'), JSON.stringify(brief, null, 2));
      fs.writeFileSync(path.join(dataDir, 'executive-score.json'), JSON.stringify(score, null, 2));
      fs.writeFileSync(path.join(dataDir, 'todos.json'), JSON.stringify(pendingTodos, null, 2));
      fs.writeFileSync(path.join(dataDir, 'anomalies.json'), JSON.stringify(anomalies, null, 2));

      logger.info('Executive brief generated', { score: brief.executive_score, status: brief.status });
      return brief;
    } catch (err) {
      logger.error('Executive brief generation failed', err);
      return { error: err.message };
    }
  },

  _generateSummary(brief) {
    const parts = [];
    parts.push(`Executive Score: ${brief.executive_score}/100 (${brief.status}).`);
    parts.push(`Focus Area: ${brief.primary_focus || 'balanced'}.`);

    if (brief.financial.runway_months !== null) {
      parts.push(`Financial Runway: ${brief.financial.runway_months} months at $${Math.round(brief.financial.avg_monthly_burn).toLocaleString()}/mo burn.`);
    }

    if (brief.financial.anomaly_count > 0) {
      parts.push(`${brief.financial.anomaly_count} financial anomal${brief.financial.anomaly_count === 1 ? 'y' : 'ies'} detected.`);
    }

    parts.push(`Career Pipeline: ${brief.career.active_pipeline} active roles, ${brief.career.tier_1_roles} Tier 1.`);

    if (brief.health) {
      parts.push(`Health: Sleep ${brief.health.sleep_score || 'N/A'}, Readiness ${brief.health.readiness || 'N/A'}, Activity ${brief.health.activity || 'N/A'}.`);
    }

    parts.push(`Todos: ${brief.todos.pending_count} pending (${brief.todos.critical.length} critical).`);

    if (brief.risk_flags && brief.risk_flags.length > 0) {
      parts.push(`Risk Flags: ${brief.risk_flags.join(', ')}.`);
    }

    return parts.join(' ');
  }
};
