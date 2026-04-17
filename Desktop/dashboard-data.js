// ============================================================
// DASHBOARD DATA FILE -- managed by Life Ops agent
// Agents update THIS FILE ONLY.
// Never edit michelles-life-tracker.html directly.
//
// Update pattern (after each agent run):
//   1. Read relevant state files in /Managed Agents/data/
//   2. Update the constants below
//   3. Update LAST_AGENT_UPDATE timestamp
//   4. Save this file -- dashboard auto-reads it on reload
//
// Data sources:
//   Etsy:      /data/etsy-products/sea-glass-wedding-place-cards/state.json
//              /Managed Agents/agents/MEMORY.md
//   Affiliate: /data/affiliate/state.json + metrics.json
//   Fertility: /data/fertility/state.json
//   Career:    /data/job-tracker/jobs.csv
//   Finance:   agent logs + gmail_log
//   Gmail:     /logs/gmail_log.txt
// ============================================================

window.DASHBOARD_DATA = {

// ── AGENT TIMESTAMP ────────────────────────────────────────
LAST_AGENT_UPDATE: '2026-04-12T12:03:00-06:00',

// ── CRITICAL DEADLINES ─────────────────────────────────────
// Agent: add/remove/update on each run. Format: { label, date 'YYYY-MM-DD', color, icon }
CRITICAL_DEADLINES: [
  { label: 'Tax Deadline',      date: '2026-04-15', color: '#c4605a', icon: '\uD83D\uDCB8' },
  { label: 'Etsy Sale Ends',    date: '2026-04-14', color: '#c4956e', icon: '\uD83C\uDFE6' },
  { label: 'Diana Ships',       date: '2026-04-13', color: '#c27089', icon: '\uD83D\uDCE6' },
  { label: 'Fertile Window',    date: '2026-04-17', color: '#7fb5b8', icon: '\uD83C\uDF38' },
],

// ── ETSY STATS ─────────────────────────────────────────────
// Agent: update after each Etsy stats pull
ETSY_STATS: {
  month: 'April 2026',
  salesCount: 21,
  revenue: 628.95,
  avgOrderValue: 29.95,
  visits: 850,
  cvr: 2.5,
  totalSalesLifetime: 270,
  activeListings: 78,
  reviews: 10,
  adsVisits: 493,
  adsPct: 58,
  abandonedCarts: 21,
  abandonedCartValue: 1363,
  openMessages: 0,
  openOrders: 2,
  adsLaunched: true,
  adsStrategy: 'Efficient spending',
  adsRoas30d: 2.53,
  adsDailyBudget: 17,
  saleEnds: '2026-04-14',
  lastUpdated: '2026-04-12',
  ytd: { revenue: 4525.64, orders: 108, visits: 5563, cvr: 1.9 },
  monthlyHistory: [
    { month: 'Jan', revenue: null, orders: null, note: 'est. ~$970 (Jan+Feb=$1,944)' },
    { month: 'Feb', revenue: null, orders: null, note: 'est. ~$974 (Jan+Feb=$1,944)' },
    { month: 'Mar', revenue: 1952.24, orders: 42, visits: 2184, cvr: 1.9 },
    { month: 'Apr', revenue: 628.95, orders: 21, visits: 850, cvr: 2.5, partial: true },
  ],
  janFebCombined: { revenue: 1944.45, orders: 45 },
  topAdListings: [
    { name: 'Water Bottle (personalized)', roas: 6.73, verdict: 'SCALE' },
    { name: 'Teacher Planner 2026',        roas: 2.00, verdict: 'SCALE' },
    { name: 'Sea Glass Place Cards',       roas: 1.75, verdict: 'FIX' },
    { name: 'ADHD Planner',                roas: 0.48, verdict: 'KILL' },
  ],
  pendingOrders: [
    { customer: 'Diana Carnevale', item: 'Water Bottle x2 (Gabriella/Pecita/Pink)', shipBy: '2026-04-13', urgent: true },
  ],
},

// ── AFFILIATE SITES ─────────────────────────────────────────
// Agent: update articles counts and earnings after each run
AFFILIATE_SITES: [
  {
    id: 'tst', name: 'ToolShedTested', icon: '\uD83D\uDEE0\uFE0F', color: '#c4956e',
    url: 'toolshedtested.com',
    articles: { live: 9, staged: 0, total: 9 },
    amazonTag: 'toolshedtested-20', amazonEarnings: 0.00, amazonStatus: 'active',
    gsc: { avgPosition: 45.8, impressions: 1407, clicks: 0, indexedPages: 253, topPage: 'makita-vs-milwaukee' },
    blocker: 'GSC: michelle.e.humes@gmail.com not authorized -- check Settings > Users',
    nextCheck: '2026-05-10',
    status: 'hold',
    signal: '9 affiliate articles live (Apr 9-12). Scale mode: 2/day. GSC check May 10.',
    lastUpdated: '2026-04-12',
  },
  {
    id: 'chs', name: 'CleverHomeStorage', icon: '\uD83C\uDFE0', color: '#5b8fa8',
    url: 'cleverhomestorage.com',
    articles: { live: 41, staged: 0, total: 41 },
    amazonTag: 'cleverhomestorage-20', amazonEarnings: 0.00, amazonStatus: 'active',
    gsc: null, blocker: null, nextCheck: null, status: 'hold',
    signal: '41 posts live. Tag confirmed active. On hold -- focus is TST until first affiliate clicks.',
    lastUpdated: '2026-04-10',
  },
  {
    id: 'cgf', name: 'CustomGiftFinder', icon: '\uD83C\uDF81', color: '#c27089',
    url: 'customgiftfinder.com',
    articles: { live: 40, staged: 0, total: 40 },
    amazonTag: 'customgiftfinder-20', amazonEarnings: 0.00, amazonStatus: 'active',
    gsc: null, blocker: null, nextCheck: null, status: 'hold',
    signal: '40 posts live. Tag confirmed active. Seasonal -- queue Q4 gift guides Aug 2026.',
    lastUpdated: '2026-04-10',
  },
  {
    id: 'shelzysbeauty', name: 'ShelzysBeauty', icon: '\uD83D\uDC84', color: '#c27089',
    url: 'shelzysbeauty.com',
    articles: { live: 29, staged: 0, total: 29 },
    amazonTag: 'shelzysbeauty-20', amazonEarnings: 0.00, amazonStatus: 'active',
    gsc: { avgPosition: null, impressions: null, clicks: null, indexedPages: null, topPage: null },
    blocker: null, nextCheck: null, status: 'hold',
    signal: '29 articles live. OG images + ItemList schema deployed Mar 26. Tag active. On hold -- TST first.',
    lastUpdated: '2026-04-10',
  },
],

// ── AGENT STATUS ────────────────────────────────────────────
// Agent: update lastRun, metric, metricLabel on each run
AGENT_STATUS: [
  { id: 'career',    name: 'Job Search', icon: '\uD83D\uDCBC', color: '#5b8fa8',  lastRun: '2026-04-12T10:20:00-06:00', status: 'healthy', metric: '10',      metricLabel: 'Roles Sourced' },
  { id: 'etsy',      name: 'Etsy CEO',   icon: '\uD83C\uDFA8', color: '#c27089',  lastRun: '2026-04-12T12:03:00-06:00', status: 'healthy', metric: '$628.95', metricLabel: 'Apr Revenue' },
  { id: 'fertility', name: 'Fertility',  icon: '\uD83C\uDF3C', color: '#7fb5b8',  lastRun: '2026-04-12T10:20:00-06:00', status: 'healthy', metric: 'CD 5',    metricLabel: 'FOLLICULAR' },
  { id: 'affiliate', name: 'Affiliate',  icon: '\uD83D\uDEE0\uFE0F', color: '#c4956e', lastRun: '2026-04-12T11:30:00-06:00', status: 'healthy', metric: '9', metricLabel: 'Articles Live' },
  { id: 'life-ops',  name: 'Life Ops',   icon: '\u2699\uFE0F', color: '#2d2d2d', lastRun: '2026-04-12T10:20:00-06:00', status: 'healthy', metric: '11',       metricLabel: 'Tasks Active' },
],

// ── GMAIL DATA ──────────────────────────────────────────────
// Agent: update after each triage run
GMAIL_DATA: {
  date: 'April 12, 2026',
  time: '10:20 AM MDT',
  unreadScanned: 30,
  actionItems: [
    { priority: 'CRITICAL', title: 'IRS Online Account Notification', body: 'Notification received Apr 12. Tax deadline April 15 in 3 days.', action: 'Log in at irs.gov/account to view before filing.' },
    { priority: 'HIGH', title: 'Diana Carnevale -- Water Bottle Order Ships Apr 13', body: 'Order #4024088662, $86.06. 2x Water Bottle "Gabriella"/Pink/Pecita. Ship by tomorrow.', action: 'Confirm fulfillment and add tracking in Etsy Orders.' },
    { priority: 'HIGH', title: 'Etsy: 3 open Seller Hub conversations', body: 'Diana (open order), Rebecca Dam (Order #4023266408), Joshua Hargrave.', action: 'Reply via Etsy Seller Hub -- Messages.' },
    { priority: 'MEDIUM', title: 'Amex Statement Ready (account 95005)', body: 'Balance $154.80. Due May 8.', action: 'Schedule autopay or manual payment by May 8.' },
    { priority: 'MEDIUM', title: 'Monarch: $3,257 over Personal Spending budget', body: 'Up from $1,734 yesterday. Chase sync expired -- reconnect for accurate data.', action: 'Reauthorize Chase in Monarch app.' },
  ],
  securityFlags: [
    'PHISHING: "Security notice" from zhuldyz.amanzhol21@fizmat.kz -- fake McAfee OTP. Do not engage.',
    'Google OAuth alert: "Untitled project" access granted -- verify was you.',
    'X (Twitter): New login from ChromeDesktop/Mac at East Hampton NY -- verify was you.',
  ],
  financialSummary: '$76.39 Etsy payout deposited. Chase autopay confirmed. $3,257 over Personal Spending budget (Monarch).',
  lowPriority: 25,
},

// ── DECISION QUEUE ──────────────────────────────────────────
// Agent: add/remove items. urgency: 'critical' | 'high' | 'medium'
DECISION_QUEUE: [
  { id: 'dq-irs',        agent: 'financial', urgency: 'critical', text: 'IRS notification in online account -- TAX DEADLINE APR 15 (3 days)', action: 'Log in at irs.gov/account before filing' },
  { id: 'dq-diana',      agent: 'etsy',      urgency: 'critical', text: 'Diana Carnevale order ships TOMORROW (Apr 13) -- 2x Water Bottle', action: 'Confirm fulfillment + add tracking in Etsy Orders' },
  { id: 'dq-bgb',        agent: 'career',    urgency: 'high',     text: 'BGB Group VP -- verify if expired at LinkedIn (likely closed)', action: 'Check linkedin.com/jobs/view/4393957391' },
  { id: 'dq-hemali',     agent: 'career',    urgency: 'high',     text: 'CMI Media Group SVP (9/10 fit) -- reach out to Hemali re: remote BEFORE cold apply', action: 'Review draft at /data/job-tracker/cmi-media-group-svp-engagement-strategy/hemali-outreach-draft.md -- DO NOT SEND without approval' },
  { id: 'dq-klick',      agent: 'career',    urgency: 'high',     text: 'Klick Health SVP Media Strategy -- remote status NOT confirmed', action: 'Check careers.klick.com/roles/36d8c476-5b69-4a51-876d-0ebc239a33e2' },
  { id: 'dq-brio',       agent: 'career',    urgency: 'medium',   text: 'Brio Group follow-up -- Day 11 (threshold 5 days)', action: 'Draft ready at /data/job-tracker/brio-follow-up-draft.md. Approve to send.' },
  { id: 'dq-adhd-ads',   agent: 'etsy',      urgency: 'medium',   text: 'ADHD Planner ads: ROAS 0.48 (losing $2 for every $1 earned) -- pause ads on this listing', action: 'Turn off ads for ADHD Planner in Etsy Ads Manager' },
],

// ── TOMORROW'S PRIORITIES ───────────────────────────────────
// Agent: reset each evening run
TOMORROW_PRIORITIES: [
  'Diana Carnevale order ships TODAY (Apr 13) -- confirm Water Bottle fulfillment in Etsy Orders',
  'IRS online account notification -- 3 days to Apr 15 tax deadline. Log in at irs.gov.',
  'Apply: Real Chemistry VP Strategy Director ($190K-$220K) via Greenhouse',
  'Apply: Regeneron Sr. Director ($216K-$360K) via Workday -- posting 65+ days old',
  'Reach out to Hemali at CMI Media Group re: SVP remote (review draft first -- do NOT send without approval)',
  'Verify Klick Health SVP remote status before full prep',
],

// ── FERTILITY STATE ─────────────────────────────────────────
// Agent: update cycleDay, phase, daysToFertileWindow daily
FERTILITY_STATE: {
  cycleDay: 5,
  cycleStart: '2026-04-08',
  phase: 'early_follicular',
  phaseLabel: 'FOLLICULAR',
  daysToFertileWindow: 5,
  fertileWindowStart: '2026-04-17',
  fertileWindowEnd: '2026-04-22',
  ovulationDate: '2026-04-21',
  peakStart: '2026-04-19',
  peakEnd: '2026-04-21',
  nextPeriod: '2026-05-06',
  earliestTest: '2026-05-01',
  reliableTest: '2026-05-03',
  definitiveTest: '2026-05-05',
  lhSurgeDetected: false,
  bbtConfirmed: false,
  confidence: 'medium',
  cycleNumber: 1,
  lastUpdated: '2026-04-12',
},

// ── FINANCE STATE ───────────────────────────────────────────
// Agent: update after each gmail/financial scan
FINANCE_STATE: {
  overBudget: 3257,
  budgetCategory: 'Personal Spending',
  uiWeeklyBenefit: 869,
  runwayMonths: 16,
  taxDeadline: '2026-04-15',
  irsNotification: true,
  monarchSyncExpired: true,
  amexDue: '2026-05-08',
  amexBalance: 154.80,
  monthlyDeficit: 6000,
  grayIncome: 210000,
  lastUpdated: '2026-04-12',
},

// ── CAREER STATE ────────────────────────────────────────────
// Agent: update after each job scan
CAREER_STATE: {
  targetComp: '$200K-$220K',
  floorComp: '$175K',
  targetDate: '2026-05-13',
  sourcedCount: 10,
  appliedCount: 1,
  screeningCount: 1,
  interviewCount: 0,
  topRoles: [
    { company: 'Real Chemistry',  title: 'VP Strategy Director',         comp: '$190K-$220K',   status: 'apply_now',      tier: 1 },
    { company: 'Regeneron',       title: 'Sr. Dir Commercial Planning',  comp: '$216K-$360K',   status: 'apply_now',      tier: 1 },
    { company: 'CMI Media Group', title: 'SVP Engagement Strategy',      comp: '$140K-$295K',   status: 'outreach_first', tier: 1 },
    { company: 'EVERSANA',        title: 'SVP Strategic Planning',       comp: '$196K-$270K',   status: 'verify_apply',   tier: 1 },
    { company: 'Klick Health',    title: 'SVP Media Strategy',           comp: 'est.$220-$300K',status: 'verify_remote',  tier: 1 },
  ],
  recentActivity: [
    { date: '2026-04-12', note: '3 new Tier 1 roles sourced (CMI, Klick, Amgen)' },
    { date: '2026-04-10', note: 'Avalere Health VP rejected' },
    { date: '2026-04-01', note: 'Brio Group outreach sent -- Day 11, follow-up overdue' },
  ],
  lastUpdated: '2026-04-12',
},

}; // end DASHBOARD_DATA
