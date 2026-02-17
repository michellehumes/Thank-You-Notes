# Role Evaluation Engine — Operating Manual

## PURPOSE
Score, rank, match, and action every role that enters the pipeline. No role is logged without a score. No application is sent without a resume match and cover letter.

---

## INTAKE WORKFLOW

When a role is provided (URL, description, or job title + company):

### Step 1: Extract
- Company name
- Title
- Compensation (stated or estimated)
- Location / remote status
- Industry vertical
- Seniority level
- Reporting structure (if known)
- Budget authority (if stated)
- HCP / oncology relevance
- Posting age

### Step 2: Exclusion Check
Reject immediately if company matches:
- Omnicom (or any subsidiary)
- Interpublic Group / IPG (or any subsidiary)
- Initiative
- CMI (already applied)
- Phreesia (not moving forward)
- MediaSense (interviewed, not selected)

### Step 3: Score
Apply the Priority Score formula (7 factors, 100-point scale):

| Factor | Weight | Score Range |
|--------|--------|-------------|
| Compensation Alignment | 20 | 0–20 |
| Seniority Match | 18 | 0–18 |
| Oncology/HCP Alignment | 18 | 0–18 |
| Enterprise Budget Oversight | 14 | 0–14 |
| Strategic Authority | 12 | 0–12 |
| Company Growth Trajectory | 10 | 0–10 |
| Revenue Impact Visibility | 8 | 0–8 |

### Step 4: Interview Probability
Calculate base probability from keyword match density, then apply modifiers:

```
Interview_Probability = Base_Probability × Π(applicable_modifiers)
```

**Base Probability (keyword match):**
- 90%+ match → 55% base
- 70–89% match → 40% base
- 50–69% match → 25% base
- Below 50% match → 10% base

**Positive Modifiers:** Referral (1.8x), Recruiter inbound (1.6x), Exact title match (1.3x), Brand overlap (1.25x), Industry match (1.2x), Early application (1.15x)

**Negative Modifiers:** Overqualified (0.7x), Location mismatch (0.5x), Agency-to-brand friction (0.8x), Stale posting (0.6x)

### Step 5: Composite Rank
```
Composite = (Priority_Score × 0.6) + (Interview_Probability × 0.4)
```

### Step 6: Tier Assignment

| Tier | Composite Score | Action |
|------|----------------|--------|
| Tier 1 — Immediate | 75–100 | Apply within 24 hrs. Tailored cover letter. Outreach draft. |
| Tier 2 — High Priority | 55–74 | Apply within 48 hrs. Standard cover letter. |
| Tier 3 — Opportunistic | 35–54 | Apply within 72 hrs if pipeline allows. |
| Tier 4 — Archive | 0–34 | Log only. Revisit if pipeline thins. |

### Step 7: Resume Assignment
Apply matching rules from scoring_model.json:
1. Pharma/Oncology/Biotech + VP/SVP + $10M+ budget → **V1 Enterprise**
2. Healthtech/SaaS/Platform company → **V2 Healthtech Pivot**
3. SVP/C-suite + Fortune 500/PE-backed → **V3 Ultra-Executive**
4. Recruiter outreach → **V3 Ultra-Executive**
5. Default → **V1 Enterprise**

### Step 8: Cover Letter Generation
Generate a tailored cover letter emphasizing:
- The 2–3 strongest resume-to-role alignment points
- Specific metrics from the assigned resume version
- Company-specific language mirroring the JD
- A confident, peer-level tone (not supplicant)

### Step 9: Outreach Draft (Approval Required)
Draft LinkedIn or email outreach targeting:
- Hiring manager (preferred)
- Talent acquisition lead
- Internal connection

**OUTREACH IS NEVER SENT WITHOUT EXPLICIT APPROVAL.**

### Step 10: Log to Pipeline
Add complete entry to job_pipeline.json with all scores, assignments, and status.

---

## PIPELINE ENTRY SCHEMA

```json
{
  "id": "ROLE_001",
  "company": "Company Name",
  "title": "VP, Media Strategy",
  "compensation_range": "$230K–$270K",
  "location": "Remote US",
  "industry": "Pharma",
  "seniority": "VP",
  "reporting_to": "CMO",
  "budget_authority": "$25M+",
  "hcp_relevance": "High — oncology portfolio",
  "posting_url": "https://...",
  "posting_age_days": 3,
  "date_identified": "2026-02-17",
  "priority_score": 87,
  "priority_breakdown": {
    "compensation": 18,
    "seniority": 16,
    "oncology_hcp": 18,
    "budget": 12,
    "authority": 12,
    "growth": 8,
    "revenue_visibility": 3
  },
  "interview_probability": 62,
  "probability_calc": {
    "base": 40,
    "modifiers_applied": ["industry_match_1.2x", "early_application_1.15x"],
    "negative_modifiers": ["agency_to_brand_0.8x"],
    "final": 62
  },
  "composite_score": 77.0,
  "tier": 1,
  "resume_version": "v1_vp_svp_enterprise",
  "cover_letter_generated": true,
  "outreach_drafted": true,
  "outreach_approved": false,
  "outreach_sent": false,
  "status": "Ready to Apply",
  "stage": "Application",
  "notes": "",
  "last_updated": "2026-02-17"
}
```

---

## OPTIMIZATION LOOP (After 10 Applications)

### Metrics to Analyze:
1. **Title Distribution** — Are we skewing Director vs VP? Adjust targeting.
2. **Industry Clustering** — Over-indexed on agency roles? Shift to brand-side/healthtech.
3. **Compensation Patterns** — Are we hitting 215K+ consistently? If not, recalibrate filters.
4. **Resume Version Performance** — Which version generates the most callbacks? Double down.
5. **Interview Probability Distribution** — If avg probability is below 30%, we need warmer channels.
6. **Time-to-Response** — Track days between application and first response.
7. **Tier 1 Conversion Rate** — % of Tier 1 applications that convert to interviews.

### Recommended Actions per Finding:
| Finding | Action |
|---------|--------|
| Too many Director-level roles | Raise seniority filter; add "Head of" and "Lead" to search |
| Low interview probability avg | Prioritize referral/warm intro channels |
| V2 outperforming V1 | Shift healthtech/SaaS targeting weight upward |
| Stale postings dominating | Filter to "past week" only |
| Agency roles over-represented | Add brand-side companies to target list |
| Below 215K roles entering pipeline | Harden compensation floor in scoring |

---

## CSV EXPORT FORMAT

Export pipeline to CSV with these columns:
```
id, company, title, compensation_range, location, industry, seniority,
priority_score, interview_probability, composite_score, tier,
resume_version, status, stage, date_identified, posting_url, notes
```
