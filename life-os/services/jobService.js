const { getDb } = require('../config/database');
const jobScoringService = require('./jobScoringService');
const logger = require('../config/logger');

const jobService = {
  addRole(roleData) {
    const db = getDb();

    // Auto-score the role
    const scoring = jobScoringService.scoreRole(roleData);

    if (scoring.excluded) {
      logger.info(`Role excluded: ${roleData.company} — ${scoring.exclusion_reason}`);
      return { excluded: true, reason: scoring.exclusion_reason };
    }

    if (scoring.hard_gated) {
      logger.info(`Role hard-gated: ${roleData.company} ${roleData.title} — ${scoring.gate_reason}`);
    }

    const stmt = db.prepare(`
      INSERT INTO job_listings (
        role_id, company, title, compensation_range, seniority_level,
        is_remote, industry, has_oncology, has_hcp, budget_authority,
        team_size, revenue_visibility, growth_trajectory,
        priority_score, interview_probability, composite_score, tier,
        resume_version, status, stage, source, notes,
        hard_gated, gate_reason
      ) VALUES (
        @role_id, @company, @title, @compensation_range, @seniority_level,
        @is_remote, @industry, @has_oncology, @has_hcp, @budget_authority,
        @team_size, @revenue_visibility, @growth_trajectory,
        @priority_score, @interview_probability, @composite_score, @tier,
        @resume_version, @status, @stage, @source, @notes,
        @hard_gated, @gate_reason
      )
    `);

    const roleId = `${roleData.company}-${roleData.title}-${Date.now()}`.replace(/[^a-zA-Z0-9-]/g, '_').substring(0, 100);

    const result = stmt.run({
      role_id: roleId,
      company: roleData.company,
      title: roleData.title,
      compensation_range: roleData.compensation_range || null,
      seniority_level: roleData.seniority_level || null,
      is_remote: roleData.is_remote ? 1 : 0,
      industry: roleData.industry || null,
      has_oncology: roleData.has_oncology ? 1 : 0,
      has_hcp: roleData.has_hcp ? 1 : 0,
      budget_authority: roleData.budget_authority || null,
      team_size: roleData.team_size || null,
      revenue_visibility: roleData.revenue_visibility || null,
      growth_trajectory: roleData.growth_trajectory || null,
      priority_score: scoring.priority_score,
      interview_probability: scoring.interview_probability,
      composite_score: scoring.composite_score,
      tier: scoring.tier,
      resume_version: scoring.resume_version,
      status: roleData.status || 'Identified',
      stage: roleData.stage || 'Research',
      source: roleData.source || 'manual',
      notes: roleData.notes || null,
      hard_gated: scoring.hard_gated ? 1 : 0,
      gate_reason: scoring.gate_reason || null
    });

    logger.info(`Role added: ${roleData.company} ${roleData.title} — Tier ${scoring.tier}, Composite ${scoring.composite_score}`);
    return { id: result.lastInsertRowid, role_id: roleId, scoring };
  },

  getRoles({ tier, status, limit = 50 } = {}) {
    const db = getDb();
    let sql = 'SELECT * FROM job_listings WHERE 1=1';
    const params = {};
    if (tier) { sql += ' AND tier = @tier'; params.tier = tier; }
    if (status) { sql += ' AND status = @status'; params.status = status; }
    sql += ' ORDER BY composite_score DESC LIMIT @limit';
    params.limit = limit;
    return db.prepare(sql).all(params);
  },

  getRole(roleId) {
    const db = getDb();
    return db.prepare('SELECT * FROM job_listings WHERE role_id = ?').get(roleId);
  },

  updateStatus(roleId, status, stage, notes) {
    const db = getDb();
    let sql = 'UPDATE job_listings SET status = @status';
    const params = { role_id: roleId, status };
    if (stage) { sql += ', stage = @stage'; params.stage = stage; }
    if (notes) { sql += ', notes = @notes'; params.notes = notes; }
    sql += ' WHERE role_id = @role_id';
    return db.prepare(sql).run(params);
  },

  getPipelineAnalytics() {
    const db = getDb();
    return {
      byTier: db.prepare("SELECT tier, COUNT(*) as count FROM job_listings WHERE status NOT IN ('Rejected','Archived') GROUP BY tier").all(),
      byStatus: db.prepare("SELECT status, COUNT(*) as count FROM job_listings GROUP BY status").all(),
      topRoles: db.prepare("SELECT company, title, composite_score, tier, status FROM job_listings WHERE status NOT IN ('Rejected','Archived') ORDER BY composite_score DESC LIMIT 10").all(),
      totalActive: db.prepare("SELECT COUNT(*) as cnt FROM job_listings WHERE status NOT IN ('Rejected','Archived')").get().cnt,
      avgComposite: db.prepare("SELECT AVG(composite_score) as avg FROM job_listings WHERE status NOT IN ('Rejected','Archived')").get().avg,
      avgProbability: db.prepare('SELECT AVG(interview_probability) as avg FROM job_listings').get().avg
    };
  }
};

module.exports = jobService;
