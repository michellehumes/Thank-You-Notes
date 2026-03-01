-- Executive Life OS — Database Schema
-- SQLite with WAL mode for concurrent reads

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ═══════════════════════════════════════════════════
-- FINANCIAL
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    merchant TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT,
    parent_category TEXT,
    account TEXT,
    account_mask TEXT,
    owner TEXT NOT NULL,
    type TEXT,
    classification TEXT,
    tags TEXT,
    original_statement TEXT,
    notes TEXT,
    recurring INTEGER DEFAULT 0,
    source TEXT,
    imported_at TEXT DEFAULT (datetime('now')),
    UNIQUE(date, merchant, amount, account, owner)
);

CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_txn_owner ON transactions(owner);
CREATE INDEX IF NOT EXISTS idx_txn_classification ON transactions(classification);
CREATE INDEX IF NOT EXISTS idx_txn_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_txn_merchant ON transactions(merchant);
CREATE INDEX IF NOT EXISTS idx_txn_date_owner ON transactions(date, owner);

CREATE TABLE IF NOT EXISTS budget_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    card_account TEXT,
    who_pays TEXT,
    frequency TEXT DEFAULT 'monthly',
    active INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS financial_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    liquid_assets REAL,
    investment_assets REAL,
    total_spend_30d REAL,
    total_spend_90d_avg REAL,
    runway_months REAL,
    net_monthly REAL,
    shared_expenses REAL,
    personal_expenses_michelle REAL,
    personal_expenses_gray REAL,
    burn_trend_percent REAL,
    recurring_ratio REAL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recurring_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant TEXT NOT NULL,
    amount REAL NOT NULL,
    frequency TEXT DEFAULT 'monthly',
    category TEXT,
    account TEXT,
    owner TEXT NOT NULL,
    classification TEXT,
    first_seen TEXT,
    last_seen TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════
-- ANOMALY DETECTION
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS anomalies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'info',
    amount REAL,
    merchant TEXT,
    acknowledged INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_anomaly_date ON anomalies(date);
CREATE INDEX IF NOT EXISTS idx_anomaly_ack ON anomalies(acknowledged);

-- ═══════════════════════════════════════════════════
-- CAREER / JOB PIPELINE
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    compensation_range TEXT,
    location TEXT,
    industry TEXT,
    seniority TEXT,
    reporting_to TEXT,
    budget_authority TEXT,
    hcp_relevance TEXT,
    posting_url TEXT,
    posting_age_days INTEGER,
    date_identified TEXT,
    priority_score INTEGER,
    priority_breakdown TEXT,
    interview_probability INTEGER,
    probability_calc TEXT,
    composite_score REAL,
    tier INTEGER,
    resume_version TEXT,
    cover_letter_generated INTEGER DEFAULT 0,
    outreach_drafted INTEGER DEFAULT 0,
    outreach_approved INTEGER DEFAULT 0,
    outreach_sent INTEGER DEFAULT 0,
    status TEXT DEFAULT 'New',
    stage TEXT DEFAULT 'Identified',
    notes TEXT,
    source TEXT,
    last_updated TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jobs_tier ON jobs(tier);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_composite ON jobs(composite_score);

-- ═══════════════════════════════════════════════════
-- HEALTH (Oura Ring)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS health_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    readiness_score INTEGER,
    sleep_score INTEGER,
    sleep_hours REAL,
    hrv_avg REAL,
    hrv_max REAL,
    resting_hr INTEGER,
    body_temp_deviation REAL,
    activity_score INTEGER,
    steps INTEGER,
    raw_json TEXT,
    synced_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_health_date ON health_daily(date);

-- ═══════════════════════════════════════════════════
-- GMAIL
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    thread_id TEXT,
    from_addr TEXT,
    from_name TEXT,
    subject TEXT,
    date TEXT,
    is_recruiter INTEGER DEFAULT 0,
    is_job_related INTEGER DEFAULT 0,
    is_urgent INTEGER DEFAULT 0,
    is_unread INTEGER DEFAULT 1,
    labels TEXT,
    snippet TEXT,
    action_needed TEXT,
    synced_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_recruiter ON emails(is_recruiter);
CREATE INDEX IF NOT EXISTS idx_email_unread ON emails(is_unread);
CREATE INDEX IF NOT EXISTS idx_email_date ON emails(date);

-- ═══════════════════════════════════════════════════
-- iMESSAGE
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS messages_pending (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_name TEXT,
    phone_or_email TEXT,
    last_message_preview TEXT,
    last_message_date TEXT,
    hours_unanswered REAL,
    is_from_me INTEGER DEFAULT 0,
    resolved INTEGER DEFAULT 0,
    detected_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════
-- CONTACTS
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    birthday TEXT,
    birthday_year TEXT,
    relationship_tag TEXT,
    last_contact_date TEXT,
    notes TEXT,
    synced_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contacts_birthday ON contacts(birthday);

-- ═══════════════════════════════════════════════════
-- TODOS (Auto-generated)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL,
    source_ref TEXT,
    priority INTEGER DEFAULT 3,
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    completed_at TEXT,
    dismissed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);

-- ═══════════════════════════════════════════════════
-- EXECUTIVE INTELLIGENCE
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS executive_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    overall_score REAL,
    financial_stability REAL,
    career_momentum REAL,
    health_readiness REAL,
    inbox_load REAL,
    relationship_hygiene REAL,
    system_integrity REAL,
    risk_flags TEXT,
    primary_focus_area TEXT,
    breakdown TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scores_date ON executive_scores(date);

CREATE TABLE IF NOT EXISTS executive_briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    executive_score REAL,
    status_label TEXT,
    health_summary TEXT,
    financial_summary TEXT,
    career_summary TEXT,
    inbox_priority TEXT,
    messages_to_reply TEXT,
    birthdays_soon TEXT,
    risk_flags TEXT,
    top_3_actions TEXT,
    natural_language TEXT,
    generated_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════
-- SYSTEM
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT NOT NULL,
    status TEXT NOT NULL,
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER,
    synced_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sync_service ON sync_log(service);
CREATE INDEX IF NOT EXISTS idx_sync_date ON sync_log(synced_at);
