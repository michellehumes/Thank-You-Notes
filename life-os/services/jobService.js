const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('jobs');

// ── Hard Exclusions (from job_pipeline.json) ────────
const EXCLUSIONS = ['omnicom', 'interpublic group', 'ipg', 'initiative', 'cmi', 'phreesia', 'mediasense'];

// ── Scoring Model (ported from scoring_model.json) ──
const SCORING = {
  compensation: {
    weight: 20,
    score(comp) {
      if (!comp) return 12; // undisclosed, likely above 215k
      const val = typeof comp === 'string' ? parseInt(comp.replace(/[^0-9]/g, '')) : comp;
      if (val >= 250000) return 20;
      if (val >= 230000) return 18;
      if (val >= 215000) return 14;
      if (val >= 200000) return 10;
      return 0;
    }
  },
  seniority: {
    weight: 18,
    score(title) {
      if (!title) return 6;
      const t = title.toLowerCase();
      if (t.includes('svp') || t.includes('senior vice president')) return 18;
      if (t.includes('head of')) return 17;
      if (t.includes('vp') || t.includes('vice president')) return 16;
      if (t.includes('senior director')) return 14;
      if (t.includes('director')) return 8;
      return 0;
    }
  },
  oncology_hcp: {
    weight: 20,
    score(industry, hcp) {
      const ind = (industry || '').toLowerCase();
      const h = (hcp || '').toLowerCase();
      if (ind.includes('oncology') && h.includes('hcp')) return 20;
      if (ind.includes('pharma') && h.includes('specialty')) return 15;
      if (ind.includes('healthtech') && h.includes('hcp')) return 13;
      if (ind.includes('pharma') && h.includes('hcp')) return 11;
      if (ind.includes('pharma') || ind.includes('biotech')) return 8;
      if (ind.includes('health')) return 5;
      return 0;
    }
  },
  budget_oversight: {
    weight: 12,
    score(budget) {
      if (!budget) return 6;
      const val = typeof budget === 'string' ? parseInt(budget.replace(/[^0-9]/g, '')) : budget;
      if (val >= 50000000) return 12;
      if (val >= 20000000) return 10;
      if (val >= 10000000) return 8;
      if (val >= 5000000) return 4;
      return 2;
    }
  },
  strategic_authority: {
    weight: 12,
    score(reporting) {
      if (!reporting) return 6;
      const r = reporting.toLowerCase();
      if (r.includes('cmo') || r.includes('cco') || r.includes('ceo')) return 12;
      if (r.includes('svp') || r.includes('vp')) return 9;
      if (r.includes('director')) return 5;
      return 6;
    }
  },
  growth_trajectory: {
    weight: 10,
    score(growth) {
      if (!growth) return 7;
      const g = growth.toLowerCase();
      if (g.includes('ipo') || g.includes('high-growth')) return 10;
      if (g.includes('fortune 500') || g.includes('stable')) return 8;
      if (g.includes('mid-market')) return 7;
      if (g.includes('early')) return 4;
      return 5;
    }
  },
  revenue_impact: {
    weight: 8,
    score(impact) {
      if (!impact) return 4;
      const i = impact.toLowerCase();
      if (i.includes('p&l') || i.includes('direct')) return 8;
      if (i.includes('media') || i.includes('influence')) return 6;
      if (i.includes('cost center')) return 3;
      return 4;
    }
  }
};

// ── Hard Gates ──────────────────────────────────────
function checkHardGates(role) {
  const gates = [];

  // Compensation floor
  if (role.compensation_range) {
    const comp = parseInt(String(role.compensation_range).replace(/[^0-9]/g, ''));
    if (comp > 0 && comp < 200000) {
      gates.push({ gate: 'compensation_floor', message: `Compensation $${comp.toLocaleString()} below $200K floor` });
    }
  }

  // Seniority floor
  if (role.seniority) {
    const s = role.seniority.toLowerCase();
    if (s.includes('associate') || s.includes('manager') || s.includes('coordinator') || s.includes('analyst')) {
      gates.push({ gate: 'seniority_floor', message: `Seniority "${role.seniority}" below Director minimum` });
    }
  }

  // Exclusion list
  if (role.company && EXCLUSIONS.some(e => role.company.toLowerCase().includes(e))) {
    gates.push({ gate: 'exclusion_list', message: `Company "${role.company}" is on exclusion list` });
  }

  // Location gate
  if (role.location && !role.location.toLowerCase().includes('remote')) {
    gates.push({ gate: 'location_gate', message: `Location "${role.location}" is not remote US` });
  }

  return gates;
}

// ── Score a Role ────────────────────────────────────
function scoreRole(role) {
  const gates = checkHardGates(role);
  if (gates.length > 0) {
    return {
      priority_score: 0,
      interview_probability: 0,
      composite_score: 0,
      tier: 4,
      resume_version: 'V1',
      hard_gate_failures: gates,
      priority_breakdown: {},
      probability_calc: {}
    };
  }

  // Priority Score
  const breakdown = {};
  let totalScore = 0;
  breakdown.compensation = SCORING.compensation.score(role.compensation_range);
  breakdown.seniority = SCORING.seniority.score(role.title || role.seniority);
  breakdown.oncology_hcp = SCORING.oncology_hcp.score(role.industry, role.hcp_relevance);
  breakdown.budget_oversight = SCORING.budget_oversight.score(role.budget_authority);
  breakdown.strategic_authority = SCORING.strategic_authority.score(role.reporting_to);
  breakdown.growth_trajectory = SCORING.growth_trajectory.score(role.growth_trajectory);
  breakdown.revenue_impact = SCORING.revenue_impact.score(role.revenue_impact);

  for (const [key, val] of Object.entries(breakdown)) {
    totalScore += val;
  }

  // Interview Probability
  let baseProb = 25; // default
  if (totalScore >= 75) baseProb = 55;
  else if (totalScore >= 55) baseProb = 40;
  else if (totalScore >= 35) baseProb = 25;
  else baseProb = 10;

  // Modifiers
  let probMultiplier = 1.0;
  if (role.source === 'referral') probMultiplier *= 1.8;
  if (role.source === 'recruiter_inbound') probMultiplier *= 1.6;
  if (role.posting_age_days && role.posting_age_days > 30) probMultiplier *= 0.6;

  const interviewProb = Math.min(95, Math.round(baseProb * probMultiplier));

  // Composite
  const composite = (totalScore * 0.6) + (interviewProb * 0.4);

  // Tier
  let tier;
  if (composite >= 75) tier = 1;
  else if (composite >= 55) tier = 2;
  else if (composite >= 35) tier = 3;
  else tier = 4;

  // Resume version
  let resume = 'V1';
  const ind = (role.industry || '').toLowerCase();
  const sen = (role.seniority || role.title || '').toLowerCase();
  if (ind.includes('healthtech') || ind.includes('saas') || ind.includes('platform')) resume = 'V2';
  else if (sen.includes('svp') || sen.includes('c-suite') || role.source === 'recruiter_inbound') resume = 'V3';

  return {
    priority_score: totalScore,
    interview_probability: interviewProb,
    composite_score: Math.round(composite * 10) / 10,
    tier,
    resume_version: resume,
    hard_gate_failures: [],
    priority_breakdown: breakdown,
    probability_calc: { base: baseProb, multiplier: probMultiplier, final: interviewProb }
  };
}

// ── Pipeline CRUD ───────────────────────────────────
function addRole(roleData) {
  const db = getDb();
  const scoring = scoreRole(roleData);
  const id = roleData.id || `ROLE_${String(Date.now()).slice(-6)}`;

  db.prepare(`
    INSERT OR REPLACE INTO jobs (id, company, title, compensation_range, location, industry, seniority, reporting_to, budget_authority, hcp_relevance, posting_url, posting_age_days, date_identified, priority_score, priority_breakdown, interview_probability, probability_calc, composite_score, tier, resume_version, status, stage, notes, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, roleData.company, roleData.title, roleData.compensation_range,
    roleData.location, roleData.industry, roleData.seniority,
    roleData.reporting_to, roleData.budget_authority, roleData.hcp_relevance,
    roleData.posting_url, roleData.posting_age_days,
    roleData.date_identified || new Date().toISOString().split('T')[0],
    scoring.priority_score, JSON.stringify(scoring.priority_breakdown),
    scoring.interview_probability, JSON.stringify(scoring.probability_calc),
    scoring.composite_score, scoring.tier, scoring.resume_version,
    roleData.status || 'New', roleData.stage || 'Identified',
    roleData.notes, roleData.source || 'manual'
  );

  log.info(`Role added: ${roleData.company} — ${roleData.title} (Tier ${scoring.tier}, Score ${scoring.composite_score})`);
  return { id, ...scoring };
}

function getPipeline({ tier, status, stage, industry, sort = 'composite_score', order = 'DESC' } = {}) {
  const db = getDb();
  const conditions = [];
  const params = [];

  if (tier) { conditions.push('tier = ?'); params.push(tier); }
  if (status) { conditions.push('status = ?'); params.push(status); }
  if (stage) { conditions.push('stage = ?'); params.push(stage); }
  if (industry) { conditions.push('industry LIKE ?'); params.push(`%${industry}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const allowedSorts = ['composite_score', 'priority_score', 'date_identified', 'company', 'tier'];
  const sortCol = allowedSorts.includes(sort) ? sort : 'composite_score';

  return db.prepare(`SELECT * FROM jobs ${where} ORDER BY ${sortCol} ${order === 'ASC' ? 'ASC' : 'DESC'}`).all(...params);
}

function updateRoleStatus(id, status, stage) {
  const db = getDb();
  const updates = ['last_updated = datetime(\'now\')'];
  const params = [];
  if (status) { updates.push('status = ?'); params.push(status); }
  if (stage) { updates.push('stage = ?'); params.push(stage); }
  params.push(id);
  return db.prepare(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`).run(...params);
}

function getAnalytics() {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as c FROM jobs').get().c;
  const byTier = db.prepare('SELECT tier, COUNT(*) as count FROM jobs GROUP BY tier ORDER BY tier').all();
  const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM jobs GROUP BY status').all();
  const byIndustry = db.prepare('SELECT industry, COUNT(*) as count FROM jobs GROUP BY industry ORDER BY count DESC').all();
  const byResume = db.prepare('SELECT resume_version, COUNT(*) as count FROM jobs GROUP BY resume_version').all();
  const avgComposite = db.prepare('SELECT AVG(composite_score) as avg, MIN(composite_score) as min, MAX(composite_score) as max FROM jobs').get();
  const avgProb = db.prepare('SELECT AVG(interview_probability) as avg FROM jobs').get();

  return { total, by_tier: byTier, by_status: byStatus, by_industry: byIndustry, by_resume: byResume, composite_stats: avgComposite, avg_interview_probability: avgProb.avg };
}

module.exports = { scoreRole, addRole, getPipeline, updateRoleStatus, getAnalytics, checkHardGates, EXCLUSIONS };
