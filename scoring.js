/**
 * ShelzyScoring — Universal Job Acquisition Scoring Module
 *
 * Works in browser (<script> tag) and Google Apps Script (copy-paste).
 * No browser/Node-specific APIs. IIFE pattern attaches to globalThis.
 *
 * Usage:
 *   const result = ShelzyScoring.evaluateRole(listing, config);
 *   const csv = ShelzyScoring.flattenForCSV(result);
 */
(function (root) {
  "use strict";

  var ShelzyScoring = {};

  // ─── HARD EXCLUSIONS ───────────────────────────────────────────────
  var EXCLUDED_COMPANIES = [
    "omnicom", "omnicom group", "omd", "phd media", "hearts & science",
    "hearts and science", "tbwa", "ddb", "ddb health",
    "ipg", "interpublic", "interpublic group", "initiative", "um worldwide",
    "universal mccann", "mediabrands", "fcb", "mccann", "um", "craft",
    "momentum", "huge", "r/ga",
    "cmi", "cmi media", "cmi media group",
    "phreesia", "phreesia network",
    "mediasense", "media sense"
  ];

  ShelzyScoring.isExcluded = function (listing, customExclusions) {
    var text = [
      listing.company || "",
      listing.role || "",
      listing.notes || ""
    ].join(" ").toLowerCase();

    var patterns = EXCLUDED_COMPANIES.slice();
    if (customExclusions && customExclusions.patterns) {
      patterns = patterns.concat(customExclusions.patterns);
    }
    if (customExclusions && customExclusions.companies) {
      for (var i = 0; i < customExclusions.companies.length; i++) {
        patterns.push(customExclusions.companies[i].toLowerCase());
      }
    }

    for (var j = 0; j < patterns.length; j++) {
      if (text.indexOf(patterns[j]) !== -1) return true;
    }
    return false;
  };

  // ─── COMPENSATION PARSING ──────────────────────────────────────────
  ShelzyScoring.parseCompensation = function (payString) {
    if (!payString) return { floor: 0, ceiling: 0 };
    var s = String(payString).replace(/,/g, "").toLowerCase();

    // Match patterns like "$230k", "$230K-$240K", "~$175k", "$230,000-$240,000"
    var nums = [];
    var re = /\$?\~?(\d+\.?\d*)\s*k?\b/g;
    var m;
    while ((m = re.exec(s)) !== null) {
      var val = parseFloat(m[1]);
      // If number < 1000, assume it's in thousands (e.g., "230k" captured as "230")
      if (val < 1000) val = val * 1000;
      nums.push(val);
    }

    if (nums.length === 0) return { floor: 0, ceiling: 0 };
    if (nums.length === 1) return { floor: nums[0], ceiling: nums[0] };
    return {
      floor: Math.min.apply(null, nums),
      ceiling: Math.max.apply(null, nums)
    };
  };

  // ─── FIT SCORING (1-5) ────────────────────────────────────────────
  // Matches the logic in apps_script/job_alerts.gs evaluateOpportunity_
  var FIT_KEYWORDS = [
    { term: "oncology", weight: 3 },
    { term: "hcp", weight: 2 },
    { term: "hcc", weight: 2 },
    { term: "omnichannel", weight: 2 },
    { term: "multi-channel", weight: 1 },
    { term: "healthcare", weight: 1 },
    { term: "health care", weight: 1 },
    { term: "pharma", weight: 1 },
    { term: "biopharma", weight: 1 },
    { term: "biotech", weight: 1 },
    { term: "life sciences", weight: 1 },
    { term: "medical", weight: 1 },
    { term: "patient", weight: 1 },
    { term: "provider", weight: 1 },
    { term: "payer", weight: 1 },
    { term: "integrated", weight: 1 },
    { term: "investment strategy", weight: 2 },
    { term: "media transformation", weight: 2 },
    { term: "measurement", weight: 1 },
    { term: "analytics", weight: 1 },
    { term: "governance", weight: 1 },
    { term: "operating model", weight: 2 },
    { term: "transformation", weight: 1 },
    { term: "consulting", weight: 1 }
  ];

  var FIT_PENALTIES = [
    "retail", "ecommerce", "e-commerce", "d2c", "consumer goods", "cpg",
    "growth marketer", "affiliate", "amazon ads", "tiktok ads", "shopify"
  ];

  function computeFitScore(text) {
    var totalWeight = 0;
    for (var i = 0; i < FIT_KEYWORDS.length; i++) {
      if (text.indexOf(FIT_KEYWORDS[i].term) !== -1) {
        totalWeight += FIT_KEYWORDS[i].weight;
      }
    }

    var fit;
    if (totalWeight >= 10) fit = 5;
    else if (totalWeight >= 6) fit = 4;
    else if (totalWeight >= 3) fit = 3;
    else if (totalWeight >= 1) fit = 2;
    else fit = 1;

    for (var j = 0; j < FIT_PENALTIES.length; j++) {
      if (text.indexOf(FIT_PENALTIES[j]) !== -1) {
        fit = Math.max(1, fit - 1);
        break;
      }
    }
    return fit;
  }

  // ─── SCOPE SCORING (1-5) ──────────────────────────────────────────
  var SCOPE_5 = ["svp", "senior vice president", "head of", "global head", "chief", "general manager", "evp", "executive vice president"];
  var SCOPE_4 = ["vp", "vice president", "principal", "client director", "senior director", "group director", "director, strategy", "director of"];
  var SCOPE_3 = ["director"];
  var SCOPE_PENALTIES = ["manager", "associate", "coordinator", "specialist", "analyst"];

  function computeScopeScore(text) {
    var scope = 3;
    var i;

    for (i = 0; i < SCOPE_5.length; i++) {
      if (text.indexOf(SCOPE_5[i]) !== -1) { scope = 5; break; }
    }
    if (scope < 5) {
      for (i = 0; i < SCOPE_4.length; i++) {
        if (text.indexOf(SCOPE_4[i]) !== -1) { scope = Math.max(scope, 4); break; }
      }
    }
    if (scope < 4) {
      for (i = 0; i < SCOPE_3.length; i++) {
        if (text.indexOf(SCOPE_3[i]) !== -1) { scope = Math.max(scope, 3); break; }
      }
    }

    for (i = 0; i < SCOPE_PENALTIES.length; i++) {
      if (text.indexOf(SCOPE_PENALTIES[i]) !== -1) {
        scope = Math.min(scope, 2);
        break;
      }
    }
    return scope;
  }

  // ─── TRACK INFERENCE ──────────────────────────────────────────────
  function inferTrack(text) {
    if (text.indexOf("consulting") !== -1 || text.indexOf("advisory") !== -1 || text.indexOf("transformation") !== -1) {
      return "Consulting";
    }
    if (text.indexOf("agency") !== -1) return "Agency";
    if (text.indexOf("in-house") !== -1 || text.indexOf("biotech") !== -1 ||
        text.indexOf("pharma") !== -1 || text.indexOf("biopharma") !== -1) {
      if (text.indexOf("agency") === -1 && text.indexOf("client services") === -1) {
        return "In-House";
      }
    }
    return "Consulting"; // default
  }

  // ─── WORK MODE INFERENCE ──────────────────────────────────────────
  function inferWorkMode(text, existing) {
    if (existing) return existing;
    if (text.indexOf("remote") !== -1) return "Remote";
    if (text.indexOf("hybrid") !== -1) return "Hybrid";
    if (text.indexOf("onsite") !== -1 || text.indexOf("on-site") !== -1) return "Onsite";
    return "";
  }

  // ─── 7-DIMENSION MATCH SCORES (each 0-10) ────────────────────────

  function computeCompAlignment(app, config) {
    var comp = ShelzyScoring.parseCompensation(app.pay);
    var targetMin = (config && config.target_comp_min) || 215000;
    var targetIdeal = (config && config.target_comp_ideal) || 230000;
    var targetStretch = (config && config.target_comp_stretch) || 240000;

    if (comp.ceiling === 0 && comp.floor === 0) return 5; // unknown = neutral

    if (comp.ceiling >= targetStretch) return 10;
    if (comp.ceiling >= targetIdeal) return 9;
    if (comp.ceiling >= targetMin) return 7;
    if (comp.floor >= targetMin) return 6;
    if (comp.ceiling >= 200000) return 4;
    if (comp.ceiling >= 175000) return 3;
    return 1;
  }

  function computeOncologyDepth(text) {
    var score = 0;
    if (text.indexOf("oncology") !== -1) score += 3;
    if (text.indexOf("hcp") !== -1) score += 2;
    if (text.indexOf("hcc") !== -1) score += 2;
    if (text.indexOf("pharma") !== -1) score += 1;
    if (text.indexOf("biopharma") !== -1) score += 1;
    if (text.indexOf("healthcare") !== -1 || text.indexOf("health care") !== -1) score += 1;
    if (text.indexOf("biotech") !== -1) score += 1;
    if (text.indexOf("medical device") !== -1) score += 1;
    if (text.indexOf("patient") !== -1) score += 1;
    if (text.indexOf("provider") !== -1) score += 1;
    if (text.indexOf("life sciences") !== -1) score += 1;
    return Math.min(10, score);
  }

  function computeBudgetSignals(text) {
    var score = 0;
    if (text.indexOf("investment strategy") !== -1 || text.indexOf("investment planning") !== -1) score += 3;
    if (text.indexOf("budget") !== -1) score += 2;
    if (text.indexOf("portfolio") !== -1) score += 2;
    if (text.indexOf("governance") !== -1) score += 2;
    if (text.indexOf("p&l") !== -1 || text.indexOf("pnl") !== -1) score += 3;
    if (text.indexOf("$") !== -1) score += 1;
    if (text.indexOf("million") !== -1 || text.indexOf("mm") !== -1) score += 2;
    return Math.min(10, score);
  }

  function computeStrategicAuthority(text) {
    var score = 0;
    if (text.indexOf("strategic") !== -1) score += 2;
    if (text.indexOf("transformation") !== -1) score += 2;
    if (text.indexOf("operating model") !== -1) score += 3;
    if (text.indexOf("advisory") !== -1) score += 2;
    if (text.indexOf("consulting") !== -1) score += 2;
    if (text.indexOf("executive") !== -1) score += 2;
    if (text.indexOf("leadership") !== -1) score += 2;
    if (text.indexOf("c-suite") !== -1 || text.indexOf("c suite") !== -1) score += 3;
    if (text.indexOf("enterprise") !== -1) score += 1;
    return Math.min(10, score);
  }

  function computeCompanyGrowth(text) {
    // Mostly manual; provide baseline heuristics
    var score = 5; // default neutral
    if (text.indexOf("series") !== -1 || text.indexOf("startup") !== -1 || text.indexOf("growth stage") !== -1) score = 7;
    if (text.indexOf("fortune 500") !== -1 || text.indexOf("fortune500") !== -1) score = 6;
    if (text.indexOf("established") !== -1) score = 5;
    return Math.min(10, score);
  }

  function computeRevenueVisibility(text) {
    var score = 0;
    if (text.indexOf("measurement") !== -1) score += 2;
    if (text.indexOf("analytics") !== -1) score += 2;
    if (text.indexOf("roi") !== -1) score += 2;
    if (text.indexOf("attribution") !== -1) score += 2;
    if (text.indexOf("performance") !== -1) score += 1;
    if (text.indexOf("outcomes") !== -1) score += 1;
    if (text.indexOf("kpi") !== -1) score += 1;
    if (text.indexOf("reporting") !== -1) score += 1;
    return Math.min(10, score);
  }

  ShelzyScoring.computeMatchScores = function (app, config) {
    var text = [
      app.role || "", app.company || "", app.notes || "",
      app.location || "", app.track || ""
    ].join(" ").toLowerCase();

    return {
      compensation_alignment: computeCompAlignment(app, config),
      oncology_hcp_depth: computeOncologyDepth(text),
      enterprise_budget_signals: computeBudgetSignals(text),
      strategic_authority: computeStrategicAuthority(text),
      company_growth: computeCompanyGrowth(text),
      revenue_impact_visibility: computeRevenueVisibility(text),
      // network_proximity is always manually set; preserve if exists
      network_proximity: (app.match_scores && app.match_scores.network_proximity) || 0
    };
  };

  // ─── PRIORITY SCORE (0-100) ───────────────────────────────────────
  var PRIORITY_WEIGHTS = {
    fit_score: 0.20,
    scope_score: 0.15,
    compensation_alignment: 0.15,
    oncology_hcp_depth: 0.12,
    enterprise_budget_signals: 0.10,
    strategic_authority: 0.10,
    company_growth: 0.05,
    revenue_impact_visibility: 0.05,
    network_proximity: 0.08
  };

  ShelzyScoring.computePriorityScore = function (app) {
    var score = 0;
    var ms = app.match_scores || {};

    score += ((app.fit_score || 3) / 5) * 100 * PRIORITY_WEIGHTS.fit_score;
    score += ((app.scope_score || 3) / 5) * 100 * PRIORITY_WEIGHTS.scope_score;
    score += (ms.compensation_alignment || 5) * 10 * PRIORITY_WEIGHTS.compensation_alignment;
    score += (ms.oncology_hcp_depth || 0) * 10 * PRIORITY_WEIGHTS.oncology_hcp_depth;
    score += (ms.enterprise_budget_signals || 0) * 10 * PRIORITY_WEIGHTS.enterprise_budget_signals;
    score += (ms.strategic_authority || 0) * 10 * PRIORITY_WEIGHTS.strategic_authority;
    score += (ms.company_growth || 5) * 10 * PRIORITY_WEIGHTS.company_growth;
    score += (ms.revenue_impact_visibility || 0) * 10 * PRIORITY_WEIGHTS.revenue_impact_visibility;
    score += (ms.network_proximity || 0) * 10 * PRIORITY_WEIGHTS.network_proximity;

    return Math.round(Math.min(100, Math.max(0, score)));
  };

  // ─── INTERVIEW PROBABILITY (0-100) ────────────────────────────────
  ShelzyScoring.computeInterviewProbability = function (app) {
    var prob = 30; // base rate
    var ms = app.match_scores || {};

    // Fit alignment
    if ((app.fit_score || 0) >= 4) prob += 15;
    else if ((app.fit_score || 0) >= 3) prob += 8;

    // Scope alignment
    if ((app.scope_score || 0) >= 4) prob += 12;
    else if ((app.scope_score || 0) >= 3) prob += 6;

    // Warm intro available
    if ((ms.network_proximity || 0) >= 7) prob += 15;
    else if ((ms.network_proximity || 0) >= 4) prob += 8;

    // Compensation alignment
    if ((ms.compensation_alignment || 0) >= 7) prob += 8;

    // Work mode match (remote preferred)
    if (app.work_mode === "Remote") prob += 5;

    // Track match
    if (app.track === "In-House" || app.track === "Consulting") prob += 5;

    // Oncology depth
    if ((ms.oncology_hcp_depth || 0) >= 7) prob += 10;

    return Math.min(100, Math.max(0, prob));
  };

  // ─── RESUME VERSION ASSIGNMENT ────────────────────────────────────
  ShelzyScoring.assignResumeVersion = function (app) {
    var ms = app.match_scores || {};
    var role = (app.role || "").toLowerCase();

    // Healthtech/SaaS pivot for tech-adjacent in-house roles
    if (app.track === "In-House" && ((ms.company_growth || 0) >= 7 || (ms.revenue_impact_visibility || 0) >= 7)) {
      return "healthtech";
    }

    // Executive condensed for SVP+/Head-of roles
    if ((app.scope_score || 0) >= 5 ||
        role.match(/\bsvp\b/) || role.indexOf("senior vice president") !== -1 ||
        role.indexOf("chief") !== -1 || role.indexOf("head of") !== -1) {
      return "executive";
    }

    // Default: enterprise VP/SVP resume
    return "enterprise";
  };

  // ─── PRIORITY LABEL ───────────────────────────────────────────────
  ShelzyScoring.priorityLabel = function (score) {
    if (score >= 70) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  };

  // ─── AUTO-NO CHECK ────────────────────────────────────────────────
  var CHANNEL_NO = [
    "paid search", "sem", "ppc", "google ads", "search specialist",
    "performance marketing specialist", "paid social", "social specialist",
    "media buyer", "programmatic specialist", "trader", "ad ops",
    "campaign manager", "trafficker", "implementation", "activation specialist",
    "biddable"
  ];

  var TOO_JUNIOR = ["coordinator", "entry level", "junior", "intern"];

  var CONTRACT = ["contract", "temporary", "temp", "1099", "freelance"];

  ShelzyScoring.checkAutoNo = function (listing, exclusions) {
    var reasons = [];
    var text = [
      listing.company || "", listing.role || "",
      listing.notes || "", listing.location || ""
    ].join(" ").toLowerCase();

    // Excluded companies
    if (ShelzyScoring.isExcluded(listing, exclusions)) {
      reasons.push("Excluded company detected.");
    }

    // Channel-only roles
    for (var i = 0; i < CHANNEL_NO.length; i++) {
      if (text.indexOf(CHANNEL_NO[i]) !== -1) {
        reasons.push("Channel execution / specialist role detected.");
        break;
      }
    }

    // Too junior
    for (var j = 0; j < TOO_JUNIOR.length; j++) {
      if (text.indexOf(TOO_JUNIOR[j]) !== -1) {
        reasons.push("Below Director level.");
        break;
      }
    }

    // Contract/temp
    for (var k = 0; k < CONTRACT.length; k++) {
      if (text.indexOf(CONTRACT[k]) !== -1) {
        reasons.push("Contract/temporary role.");
        break;
      }
    }

    return {
      auto_no: reasons.length > 0,
      auto_no_reason: reasons.join(" ")
    };
  };

  // ─── FULL ROLE EVALUATION ─────────────────────────────────────────
  ShelzyScoring.evaluateRole = function (listing, config) {
    config = config || {};
    var exclusions = config.exclusions || {};

    // 1. Auto-NO check
    var autoNo = ShelzyScoring.checkAutoNo(listing, exclusions);

    // 2. Build text for scoring
    var text = [
      listing.role || "", listing.company || "",
      listing.notes || "", listing.location || ""
    ].join(" ").toLowerCase();

    // 3. Fit and scope
    var fit = listing.fit_score || computeFitScore(text);
    var scope = listing.scope_score || computeScopeScore(text);

    // 4. Track and work mode
    var track = listing.track || inferTrack(text);
    var workMode = inferWorkMode(text, listing.work_mode);

    // 5. Compensation parsing
    var comp = ShelzyScoring.parseCompensation(listing.pay);

    // 6. Build enhanced entry
    var enhanced = {};
    var keys = Object.keys(listing);
    for (var i = 0; i < keys.length; i++) {
      enhanced[keys[i]] = listing[keys[i]];
    }

    enhanced.fit_score = fit;
    enhanced.scope_score = scope;
    enhanced.track = track;
    enhanced.work_mode = workMode;
    enhanced.comp_floor = comp.floor;
    enhanced.comp_ceiling = comp.ceiling;
    enhanced.auto_no = autoNo.auto_no;
    enhanced.auto_no_reason = autoNo.auto_no_reason;

    // 7. Match scores
    enhanced.match_scores = ShelzyScoring.computeMatchScores(enhanced, config);

    // 8. Priority score
    enhanced.priority_score = ShelzyScoring.computePriorityScore(enhanced);
    enhanced.priority = ShelzyScoring.priorityLabel(enhanced.priority_score);

    // 9. Interview probability
    enhanced.interview_probability = ShelzyScoring.computeInterviewProbability(enhanced);

    // 10. Resume version
    enhanced.resume_version_assigned = ShelzyScoring.assignResumeVersion(enhanced);

    // 11. Metadata
    var today = new Date().toISOString().slice(0, 10);
    enhanced.created_at = enhanced.created_at || today;
    enhanced.updated_at = today;

    // 12. Cover letter / outreach defaults
    enhanced.cover_letter_status = enhanced.cover_letter_status || "none";
    enhanced.outreach_status = enhanced.outreach_status || "none";

    // 13. ID
    if (!enhanced.id) {
      enhanced.id = "OPP-" + today.replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    }

    return enhanced;
  };

  // ─── BATCH EVALUATE ───────────────────────────────────────────────
  ShelzyScoring.evaluateBatch = function (listings, config) {
    var results = [];
    for (var i = 0; i < listings.length; i++) {
      results.push(ShelzyScoring.evaluateRole(listings[i], config));
    }
    // Sort by priority_score descending
    results.sort(function (a, b) { return (b.priority_score || 0) - (a.priority_score || 0); });
    return results;
  };

  // ─── FLATTEN FOR CSV ──────────────────────────────────────────────
  ShelzyScoring.flattenForCSV = function (app) {
    var ms = app.match_scores || {};
    return {
      id: app.id || "",
      company: app.company || "",
      role: app.role || "",
      location: app.location || "",
      pay: app.pay || "",
      status: app.status || "",
      priority: app.priority || "",
      priority_score: app.priority_score || "",
      interview_probability: app.interview_probability || "",
      fit_score: app.fit_score || "",
      scope_score: app.scope_score || "",
      track: app.track || "",
      work_mode: app.work_mode || "",
      resume_version: app.resume_version_assigned || "",
      cover_letter_status: app.cover_letter_status || "",
      outreach_status: app.outreach_status || "",
      comp_floor: app.comp_floor || "",
      comp_ceiling: app.comp_ceiling || "",
      compensation_alignment: ms.compensation_alignment || "",
      oncology_hcp_depth: ms.oncology_hcp_depth || "",
      enterprise_budget_signals: ms.enterprise_budget_signals || "",
      strategic_authority: ms.strategic_authority || "",
      company_growth: ms.company_growth || "",
      revenue_impact_visibility: ms.revenue_impact_visibility || "",
      network_proximity: ms.network_proximity || "",
      auto_no: app.auto_no ? "YES" : "",
      auto_no_reason: app.auto_no_reason || "",
      source_url: app.source_url || "",
      applied_date: app.appliedDate || "",
      follow_up: app.followUp || "",
      created_at: app.created_at || "",
      updated_at: app.updated_at || "",
      notes: app.notes || ""
    };
  };

  // ─── EXPORT ───────────────────────────────────────────────────────
  root.ShelzyScoring = ShelzyScoring;

})(typeof globalThis !== "undefined" ? globalThis : this);
