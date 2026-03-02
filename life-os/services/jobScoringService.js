const { getDb } = require('../config/database');
const logger = require('../config/logger');

// Hard exclusion list — reject immediately, do not score or log
const EXCLUSION_LIST = [
  'omnicom', 'ipg', 'initiative', 'cmi', 'phreesia', 'mediasense'
];

// Seniority levels below Director trigger hard gate
const SENIORITY_BELOW_DIRECTOR = [
  'associate director', 'senior manager', 'manager', 'coordinator',
  'specialist', 'analyst', 'associate', 'assistant'
];

// Seniority scoring map (factor: seniority_match, max 18)
const SENIORITY_SCORES = {
  svp: 18,
  'senior vice president': 18,
  vp: 16,
  'vice president': 16,
  'head of': 17,
  'head': 17,
  'senior director': 14,
  director: 8
};

// Compensation scoring tiers (factor: compensation_alignment, max 20)
const COMP_TIERS = [
  { min: 250000, max: Infinity, points: 20, label: 'above_250k' },
  { min: 230000, max: 249999, points: 18, label: '230k_to_250k' },
  { min: 215000, max: 229999, points: 14, label: '215k_to_230k' },
  { min: 200000, max: 214999, points: 10, label: '200k_to_215k_negotiable' },
  { min: 0, max: 199999, points: 0, label: 'below_200k' }
];

// Interview probability base rates by keyword match percentage
const KEYWORD_MATCH_BASES = [
  { min: 90, base: 55 },
  { min: 70, base: 40 },
  { min: 50, base: 25 },
  { min: 0, base: 10 }
];

// Interview probability modifiers
const POSITIVE_MODIFIERS = {
  referral: 1.8,
  recruiter_inbound: 1.6,
  alumni_connection: 1.5,
  exact_title_match: 1.3,
  brand_portfolio_overlap: 1.25,
  industry_vertical_match: 1.2,
  applied_within_48hrs: 1.15
};

const NEGATIVE_MODIFIERS = {
  overqualified: 0.7,
  location_mismatch: 0.5,
  agency_to_brand_friction: 0.8,
  stale_posting: 0.6,
  cold_application: 0.6
};

// Composite weights
const PRIORITY_WEIGHT = 0.6;
const PROBABILITY_WEIGHT = 0.4;

// Tier thresholds
const TIER_THRESHOLDS = [
  { min: 75, tier: 1 },
  { min: 55, tier: 2 },
  { min: 35, tier: 3 },
  { min: 0, tier: 4 }
];

const jobScoringService = {
  /**
   * Score a role and return full breakdown.
   * @param {Object} role - Role object with fields like company, title, compensation_max,
   *   compensation_min, seniority, remote, industry, budget, reporting_to, growth_stage,
   *   revenue_impact, keyword_match_pct, source, modifiers (array of modifier keys),
   *   comp_undisclosed, comp_likely_above_215k, is_negotiable, is_recruiter_outreach,
   *   is_fortune_500, is_pe_backed, posting_age_days
   * @returns {Object} { priority_score, interview_probability, composite_score, tier,
   *   resume_version, disqualified, disqualification_reason, factor_breakdown }
   */
  scoreRole(role) {
    // Step 1: Check hard exclusion
    if (this._isExcluded(role.company)) {
      return {
        priority_score: 0,
        interview_probability: 0,
        composite_score: 0,
        tier: null,
        resume_version: null,
        disqualified: true,
        disqualification_reason: `Company "${role.company}" is on the hard exclusion list`,
        factor_breakdown: null
      };
    }

    // Step 2: Check hard gates
    const gateResult = this._checkHardGates(role);

    // Step 3: Calculate scores regardless (for data purposes)
    const { priority_score, factor_breakdown } = this._calculatePriorityScore(role);
    const interview_probability = this._calculateInterviewProbability(role);

    const composite_score = Math.round(
      (priority_score * PRIORITY_WEIGHT) + (interview_probability * PROBABILITY_WEIGHT)
    );

    // Step 4: Hard gates override tier to 4
    let tier;
    if (gateResult.gated) {
      tier = 4;
    } else {
      tier = this._determineTier(composite_score);
    }

    // Step 5: Select resume version
    const resume_version = this._selectResume(role);

    const result = {
      priority_score,
      interview_probability,
      composite_score,
      tier,
      resume_version,
      disqualified: gateResult.gated,
      disqualification_reason: gateResult.gated ? gateResult.reasons.join('; ') : null,
      factor_breakdown
    };

    logger.info('Job scored', {
      company: role.company,
      title: role.title,
      composite_score,
      tier,
      disqualified: gateResult.gated
    });

    return result;
  },

  /**
   * Check if company is on the hard exclusion list.
   * Exclusion means: reject, do not score, do not log.
   */
  _isExcluded(company) {
    if (!company) return false;
    const normalized = company.toLowerCase().trim();
    return EXCLUSION_LIST.some(exc => normalized.includes(exc));
  },

  /**
   * Check hard gates: comp floor, seniority floor, location/remote requirement.
   * Returns { gated: boolean, reasons: string[] }
   */
  _checkHardGates(role) {
    const reasons = [];

    // Gate 1: Compensation floor — comp max < $200K
    // Exception: undisclosed comp with signals suggesting $215K+
    if (role.compensation_max && role.compensation_max < 200000) {
      if (!(role.comp_undisclosed && role.comp_likely_above_215k)) {
        reasons.push('Compensation below $200K floor');
      }
    }

    // Gate 2: Seniority floor — Associate Director or below
    if (role.seniority) {
      const normalizedSeniority = role.seniority.toLowerCase().trim();
      const isBelowDirector = SENIORITY_BELOW_DIRECTOR.some(level =>
        normalizedSeniority === level || normalizedSeniority.includes(level)
      );
      if (isBelowDirector) {
        reasons.push('Seniority below Director floor');
      }
    }

    // Gate 3: Location — not remote
    // Exception: hybrid with <2 days/week in NYC metro may proceed if other factors are Tier 1
    if (role.remote === false || role.remote === 'no') {
      const isHybridNycException = role.hybrid_days_per_week &&
        role.hybrid_days_per_week <= 2 &&
        role.location && role.location.toLowerCase().includes('nyc');
      if (!isHybridNycException) {
        reasons.push('Role requires in-office / not remote');
      }
    }

    return {
      gated: reasons.length > 0,
      reasons
    };
  },

  /**
   * Calculate priority score across 7 weighted factors. Max 100.
   * Returns { priority_score: number, factor_breakdown: Object }
   */
  _calculatePriorityScore(role) {
    const factors = {};

    // 1. Compensation alignment (max 20)
    factors.compensation_alignment = this._scoreCompensation(role);

    // 2. Seniority match (max 18)
    factors.seniority_match = this._scoreSeniority(role);

    // 3. Oncology / HCP alignment (max 20)
    factors.oncology_hcp_alignment = this._scoreOncologyHcp(role);

    // 4. Enterprise budget oversight (max 12)
    factors.enterprise_budget_oversight = this._scoreBudget(role);

    // 5. Strategic authority (max 12)
    factors.strategic_authority = this._scoreAuthority(role);

    // 6. Company growth trajectory (max 10)
    factors.company_growth_trajectory = this._scoreGrowth(role);

    // 7. Revenue impact visibility (max 8)
    factors.revenue_impact_visibility = this._scoreRevenueImpact(role);

    const priority_score = Object.values(factors).reduce((sum, v) => sum + v, 0);

    return {
      priority_score: Math.max(0, Math.min(100, priority_score)),
      factor_breakdown: factors
    };
  },

  _scoreCompensation(role) {
    // Handle undisclosed compensation
    if (role.comp_undisclosed) {
      if (role.comp_likely_above_215k) {
        return role.is_negotiable ? 11 : 12;
      }
      return 0; // Undisclosed with no positive signal
    }

    const comp = role.compensation_max || role.compensation_min || 0;
    for (const tier of COMP_TIERS) {
      if (comp >= tier.min && comp <= tier.max) {
        return tier.points;
      }
    }
    return 0;
  },

  _scoreSeniority(role) {
    if (!role.seniority) return 0;
    const normalized = role.seniority.toLowerCase().trim();

    // Check each key in order of specificity
    for (const [key, points] of Object.entries(SENIORITY_SCORES)) {
      if (normalized.includes(key)) {
        return points;
      }
    }
    return 0;
  },

  _scoreOncologyHcp(role) {
    if (!role.industry) return 0;
    const ind = role.industry.toLowerCase();
    const desc = (role.description || '').toLowerCase();

    // Oncology + HCP primary focus
    if ((ind.includes('oncology') || desc.includes('oncology')) &&
        (ind.includes('hcp') || desc.includes('hcp'))) {
      return 20;
    }
    // Oncology adjacent or specialty pharma
    if (ind.includes('oncology') || ind.includes('specialty pharma') ||
        desc.includes('oncology')) {
      return 15;
    }
    // Healthtech with HCP component
    if ((ind.includes('healthtech') || ind.includes('health tech') ||
         ind.includes('healthcare saas')) &&
        (ind.includes('hcp') || desc.includes('hcp'))) {
      return 13;
    }
    // General pharma with HCP
    if ((ind.includes('pharma') || ind.includes('pharmaceutical')) &&
        (ind.includes('hcp') || desc.includes('hcp'))) {
      return 11;
    }
    // General pharma without HCP
    if (ind.includes('pharma') || ind.includes('pharmaceutical') || ind.includes('biotech')) {
      return 11;
    }
    // Healthtech without HCP
    if (ind.includes('healthtech') || ind.includes('health tech') || ind.includes('healthcare')) {
      return 8;
    }

    return 0; // No HCP or pharma relevance
  },

  _scoreBudget(role) {
    const budget = role.budget || 0;
    if (budget >= 50000000) return 12;
    if (budget >= 20000000) return 10;
    if (budget >= 10000000) return 8;
    if (budget >= 5000000) return 4;
    return 2; // Under 5M or unknown
  },

  _scoreAuthority(role) {
    if (!role.reporting_to) return 6; // Unclear reporting
    const rt = role.reporting_to.toLowerCase();

    if (rt.includes('cmo') || rt.includes('cco') || rt.includes('ceo') ||
        rt.includes('chief')) {
      return 12;
    }
    if (rt.includes('svp') || rt.includes('vp') || rt.includes('senior vice') ||
        rt.includes('vice president')) {
      return 9;
    }
    if (rt.includes('director')) return 5;
    return 6; // Unclear
  },

  _scoreGrowth(role) {
    if (!role.growth_stage) return 4; // Default to early/uncertain
    const gs = role.growth_stage.toLowerCase();

    if (gs.includes('high growth') || gs.includes('ipo') || gs.includes('well funded')) return 10;
    if (gs.includes('fortune 500') || gs.includes('enterprise') || gs.includes('stable')) return 8;
    if (gs.includes('mid market') || gs.includes('mid-market') || gs.includes('growth stage')) return 7;
    if (gs.includes('early stage') || gs.includes('uncertain') || gs.includes('startup')) return 4;
    if (gs.includes('declining') || gs.includes('restructuring')) return 2;
    return 4;
  },

  _scoreRevenueImpact(role) {
    if (!role.revenue_impact) return 4; // Unclear
    const ri = role.revenue_impact.toLowerCase();

    if (ri.includes('p&l') || ri.includes('p and l') || ri.includes('revenue ownership') ||
        ri.includes('direct revenue')) return 8;
    if (ri.includes('media investment') || ri.includes('influences revenue') ||
        ri.includes('revenue influence')) return 6;
    if (ri.includes('cost center')) return 3;
    return 4; // Unclear
  },

  /**
   * Calculate interview probability.
   * Formula: min(base * modifier_product, 95)
   * Base from keyword match %, modifiers from role signals.
   */
  _calculateInterviewProbability(role) {
    // Determine base from keyword match percentage
    const matchPct = role.keyword_match_pct || 0;
    let base = 10; // Default lowest
    for (const tier of KEYWORD_MATCH_BASES) {
      if (matchPct >= tier.min) {
        base = tier.base;
        break;
      }
    }

    // Collect applicable modifiers
    let multiplier = 1.0;
    const appliedModifiers = role.modifiers || [];

    // Positive modifiers
    if (appliedModifiers.includes('referral') || role.source === 'referral') {
      multiplier *= POSITIVE_MODIFIERS.referral;
    }
    if (appliedModifiers.includes('recruiter_inbound') || role.is_recruiter_outreach) {
      multiplier *= POSITIVE_MODIFIERS.recruiter_inbound;
    }
    if (appliedModifiers.includes('alumni_connection')) {
      multiplier *= POSITIVE_MODIFIERS.alumni_connection;
    }
    if (appliedModifiers.includes('exact_title_match')) {
      multiplier *= POSITIVE_MODIFIERS.exact_title_match;
    }
    if (appliedModifiers.includes('brand_portfolio_overlap')) {
      multiplier *= POSITIVE_MODIFIERS.brand_portfolio_overlap;
    }
    if (appliedModifiers.includes('industry_vertical_match')) {
      multiplier *= POSITIVE_MODIFIERS.industry_vertical_match;
    }
    if (appliedModifiers.includes('applied_within_48hrs')) {
      multiplier *= POSITIVE_MODIFIERS.applied_within_48hrs;
    }

    // Negative modifiers
    if (appliedModifiers.includes('overqualified')) {
      multiplier *= NEGATIVE_MODIFIERS.overqualified;
    }
    if (appliedModifiers.includes('location_mismatch') ||
        (role.remote === false && !appliedModifiers.includes('referral'))) {
      multiplier *= NEGATIVE_MODIFIERS.location_mismatch;
    }
    if (appliedModifiers.includes('agency_to_brand_friction')) {
      multiplier *= NEGATIVE_MODIFIERS.agency_to_brand_friction;
    }
    if (appliedModifiers.includes('stale_posting') ||
        (role.posting_age_days && role.posting_age_days > 30)) {
      multiplier *= NEGATIVE_MODIFIERS.stale_posting;
    }
    if (appliedModifiers.includes('cold_application') || role.source === 'cold') {
      multiplier *= NEGATIVE_MODIFIERS.cold_application;
    }

    const probability = Math.round(base * multiplier);
    return Math.min(probability, 95); // Hard cap at 95%
  },

  /**
   * Select the optimal resume version based on role characteristics.
   * Decision tree from resume_matching_logic in scoring_model.json.
   */
  _selectResume(role) {
    const industry = (role.industry || '').toLowerCase();
    const seniority = (role.seniority || '').toLowerCase();
    const budget = role.budget || 0;

    // Rule 1: Pharma/Oncology/Biotech + VP/SVP/Head-of + budget > $10M
    const isPharmaOncoBio = industry.includes('pharma') || industry.includes('oncology') ||
      industry.includes('biotech');
    const isVpSvpHead = seniority.includes('svp') || seniority.includes('vp') ||
      seniority.includes('vice president') || seniority.includes('head');
    if (isPharmaOncoBio && isVpSvpHead && budget > 10000000) {
      return 'v1_vp_svp_enterprise';
    }

    // Rule 2: Healthtech or Healthcare SaaS or platform/tech vendor
    if (industry.includes('healthtech') || industry.includes('health tech') ||
        industry.includes('healthcare saas') || industry.includes('platform') ||
        industry.includes('technology vendor') || industry.includes('saas')) {
      return 'v2_healthtech_saas_pivot';
    }

    // Rule 3: SVP or C-suite adjacent + Fortune 500 or PE-backed
    const isSvpOrCsuite = seniority.includes('svp') || seniority.includes('senior vice') ||
      seniority.includes('c-suite') || seniority.includes('chief');
    if (isSvpOrCsuite && (role.is_fortune_500 || role.is_pe_backed)) {
      return 'v3_ultra_executive';
    }

    // Rule 4: Recruiter outreach or executive search firm
    if (role.is_recruiter_outreach || role.source === 'executive_search') {
      return 'v3_ultra_executive';
    }

    // Default: strongest comprehensive version
    return 'v1_vp_svp_enterprise';
  },

  /**
   * Map composite score to tier.
   * Tier 1: 75+, Tier 2: 55-74, Tier 3: 35-54, Tier 4: <35
   */
  _determineTier(composite) {
    for (const { min, tier } of TIER_THRESHOLDS) {
      if (composite >= min) return tier;
    }
    return 4;
  }
};

module.exports = jobScoringService;
