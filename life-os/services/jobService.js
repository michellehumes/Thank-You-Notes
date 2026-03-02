const logger = require('../config/logger');
const { getDb } = require('../config/database');
const jobScoringService = require('./jobScoringService');

/**
 * Job Service
 * 
 * Manages job pipeline with auto-scoring via jobScoringService.
 * Handles role intake, pipeline progression, and analytics.
 */

/**
 * Add a new role to the job pipeline with auto-scoring
 */
function addRole(roleData) {
  const db = getDb();

  try {
    // Auto-score the role
    const scoreResult = jobScoringService.scoreRole(roleData);

    const stmt = db.prepare(`
      INSERT INTO job_listings (
        company, title, compensation, seniority_level, 
        remote_status, industry, budget, authority_level, 
        growth_potential, revenue_visibility, referral_source,
        priority_score, interview_probability, composite_score,
        tier, resume_version, status, stage, 
        matched_keywords, notes, url, source_date
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const now = new Date().toISOString().split('T')[0];
    
    const result = stmt.run(
      roleData.company || 'Unknown',
      roleData.title || '',
      roleData.compensation || null,
      roleData.seniorityLevel || null,
      roleData.remoteStatus || 'unknown',
      roleData.industry || null,
      roleData.budget || 0,
      roleData.authorityLevel || null,
      roleData.growthPotential || 0,
      roleData.revenueVisibility || 0,
      roleData.referralSource || null,
      scoreResult.priorityScore,
      scoreResult.interviewProbability,
      scoreResult.compositeScore,
      scoreResult.tier,
      scoreResult.recommendedResume,
      'pipeline',  // Initial status
      'intake',     // Initial stage
      JSON.stringify(roleData.matchedKeywords || []),
      roleData.notes || null,
      roleData.url || null,
      now
    );

    logger.info(`Added job: ${roleData.company} - ${roleData.title} (Tier ${scoreResult.tier}, Score ${scoreResult.compositeScore})`);
    
    return {
      success: true,
      roleId: result.lastInsertRowid,
      scoring: scoreResult
    };
  } catch (error) {
    logger.error('Failed to add job role:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get roles with optional filtering
 */
function getRoles(filters = {}) {
  const db = getDb();

  try {
    let query = 'SELECT * FROM job_listings WHERE 1=1';
    const params = [];

    if (filters.tier) {
      query += ' AND tier = ?';
      params.push(filters.tier);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.stage) {
      query += ' AND stage = ?';
      params.push(filters.stage);
    }

    if (filters.minScore) {
      query += ' AND composite_score >= ?';
      params.push(filters.minScore);
    }

    query += ' ORDER BY composite_score DESC, priority_score DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const stmt = db.prepare(query);
    return stmt.all(...params);
  } catch (error) {
    logger.error('Failed to get job roles:', error.message);
    return [];
  }
}

/**
 * Update job status/stage
 */
function updateStatus(roleId, status, stage = null) {
  const db = getDb();

  try {
    let query = 'UPDATE job_listings SET status = ? WHERE id = ?';
    const params = [status, roleId];

    if (stage) {
      query = 'UPDATE job_listings SET status = ?, stage = ? WHERE id = ?';
      params = [status, stage, roleId];
    }

    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return { success: false, error: 'Role not found' };
    }

    logger.info(`Updated role ${roleId}: status=${status}${stage ? `, stage=${stage}` : ''}`);
    return { success: true, roleId };
  } catch (error) {
    logger.error('Failed to update job status:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get pipeline analytics for dashboard
 */
function getPipelineAnalytics() {
  const db = getDb();

  try {
    const stats = {
      totalRoles: 0,
      byTier: {},
      byStatus: {},
      byStage: {},
      topRoles: [],
      tierBreakdown: {}
    };

    // Get tier distribution
    const tiers = db.prepare(`
      SELECT tier, COUNT(*) as count, AVG(composite_score) as avg_score
      FROM job_listings
      WHERE status = 'pipeline'
      GROUP BY tier
    `).all();

    let tier1Count = 0;
    tiers.forEach(t => {
      stats.byTier[`tier_${t.tier}`] = t.count;
      stats.tierBreakdown[`tier_${t.tier}`] = {
        count: t.count,
        avgScore: Math.round(t.avg_score || 0)
      };
      if (t.tier === 1) tier1Count = t.count;
    });

    // Get status distribution
    const statuses = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM job_listings
      GROUP BY status
    `).all();

    statuses.forEach(s => {
      stats.byStatus[s.status] = s.count;
    });

    // Get stage distribution
    const stages = db.prepare(`
      SELECT stage, COUNT(*) as count
      FROM job_listings
      WHERE status = 'pipeline'
      GROUP BY stage
    `).all();

    stages.forEach(s => {
      stats.byStage[s.stage] = s.count;
    });

    // Get top 5 roles
    stats.topRoles = db.prepare(`
      SELECT
        id, company, title, composite_score, tier, stage
      FROM job_listings
      WHERE status = 'pipeline'
      ORDER BY composite_score DESC
      LIMIT 5
    `).all();

    // Count total
    const total = db.prepare('SELECT COUNT(*) as count FROM job_listings').get();
    stats.totalRoles = total.count;

    // Calculate summary metrics
    const activeRoles = db.prepare(`
      SELECT COUNT(*) as count FROM job_listings
      WHERE status = 'pipeline'
    `).get();

    stats.activeRoles = activeRoles.count;
    stats.tier1Count = tier1Count;
    stats.conversionRate = activeRoles.count > 0 
      ? Math.round((tier1Count / activeRoles.count) * 100) 
      : 0;

    logger.info(`Pipeline analytics: ${stats.activeRoles} active, ${tier1Count} Tier 1 roles`);
    return stats;
  } catch (error) {
    logger.error('Failed to get pipeline analytics:', error.message);
    return null;
  }
}

/**
 * Get role details by ID
 */
function getRoleById(roleId) {
  const db = getDb();

  try {
    const role = db.prepare('SELECT * FROM job_listings WHERE id = ?').get(roleId);
    
    if (role && role.matched_keywords) {
      try {
        role.matched_keywords = JSON.parse(role.matched_keywords);
      } catch (e) {
        role.matched_keywords = [];
      }
    }

    return role || null;
  } catch (error) {
    logger.error('Failed to get role details:', error.message);
    return null;
  }
}

/**
 * Bulk import roles from array
 */
function importRoles(roles) {
  let successCount = 0;
  const errors = [];

  roles.forEach((role, index) => {
    try {
      const result = addRole(role);
      if (result.success) {
        successCount++;
      } else {
        errors.push(`Row ${index + 1}: ${result.error}`);
      }
    } catch (error) {
      errors.push(`Row ${index + 1}: ${error.message}`);
    }
  });

  logger.info(`Imported ${successCount}/${roles.length} roles`);
  
  return {
    successCount,
    totalCount: roles.length,
    errors
  };
}

module.exports = {
  addRole,
  getRoles,
  getRoleById,
  updateStatus,
  getPipelineAnalytics,
  importRoles
};
