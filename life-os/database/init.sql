-- Executive Life OS Schema v3.0

-- Oura Ring daily health metrics
CREATE TABLE IF NOT EXISTS oura_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  sleep_score INTEGER,
  readiness_score INTEGER,
  activity_score INTEGER,
  hrv_avg REAL,
  resting_hr INTEGER,
  total_sleep_minutes INTEGER,
  deep_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  steps INTEGER,
  active_calories INTEGER,
  body_temperature_delta REAL,
  raw_json TEXT,
  synced_at TEXT DEFAULT (datetime('now'))
);

-- Gmail thread tracking
CREATE TABLE IF NOT EXISTS gmail_threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT NOT NULL UNIQUE,
  message_id TEXT,
  subject TEXT,
  from_name TEXT,
  from_email TEXT,
  snippet TEXT,
  date TEXT,
  is_recruiter INTEGER DEFAULT 0,
  is_read INTEGER DEFAULT 0,
  needs_response INTEGER DEFAULT 0,
  labels TEXT,
  raw_json TEXT,
  synced_at TEXT DEFAULT (datetime('now'))
);

-- Job pipeline listings
CREATE TABLE IF NOT EXISTS job_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id TEXT UNIQUE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  seniority TEXT,
  compensation_range TEXT,
  compensation_min INTEGER,
  compensation_max INTEGER,
  location TEXT,
  is_remote INTEGER DEFAULT 0,
  industry TEXT,
  therapeutic_area TEXT,
  has_oncology_hcp INTEGER DEFAULT 0,
  budget_oversight TEXT,
  direct_reports INTEGER,
  revenue_visibility TEXT,
  growth_trajectory TEXT,
  source TEXT,
  source_contact TEXT,
  referral_strength TEXT,
  priority_score REAL,
  interview_probability REAL,
  composite_score REAL,
  tier INTEGER,
  resume_version TEXT,
  status TEXT DEFAULT 'Identified',
  stage TEXT DEFAULT 'Pipeline',
  notes TEXT,
  applied_at TEXT,
  last_activity TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- iMessage thread tracking
CREATE TABLE IF NOT EXISTS imessage_threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handle_id TEXT NOT NULL,
  phone_or_email TEXT,
  contact_name TEXT,
  last_message TEXT,
  last_message_date TEXT,
  last_message_is_from_me INTEGER DEFAULT 0,
  unanswered_hours REAL DEFAULT 0,
  is_priority_contact INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  synced_at TEXT DEFAULT (datetime('now'))
);

-- Birthday tracking
CREATE TABLE IF NOT EXISTS birthdays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  birthday TEXT NOT NULL,
  relationship TEXT,
  last_wished_year INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Financial transactions
CREATE TABLE IF NOT EXISTS finance_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  merchant TEXT,
  amount REAL NOT NULL,
  category TEXT,
  account TEXT,
  account_mask TEXT,
  owner TEXT NOT NULL,
  classification TEXT,
  type TEXT DEFAULT 'regular',
  is_recurring INTEGER DEFAULT 0,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Recurring subscriptions
CREATE TABLE IF NOT EXISTS recurring_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  category TEXT,
  account TEXT,
  owner TEXT,
  is_active INTEGER DEFAULT 1,
  last_charged TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Budget items
CREATE TABLE IF NOT EXISTS budget_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  card_account TEXT,
  who_pays TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Account tracking
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mask TEXT,
  owner TEXT NOT NULL,
  type TEXT NOT NULL,
  purpose TEXT,
  balance REAL,
  last_updated TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(name, mask, owner)
);

-- Auto-generated and manual todos
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 3,
  source TEXT DEFAULT 'manual',
  trigger_type TEXT,
  trigger_ref TEXT,
  status TEXT DEFAULT 'pending',
  due_date TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Executive score history
CREATE TABLE IF NOT EXISTS executive_score_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  overall_score REAL NOT NULL,
  financial_score REAL,
  career_score REAL,
  health_score REAL,
  inbox_score REAL,
  relationship_score REAL,
  system_score REAL,
  risk_flags TEXT,
  primary_focus_area TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Anomaly detection log
CREATE TABLE IF NOT EXISTS anomaly_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  domain TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  description TEXT,
  value REAL,
  threshold REAL,
  acknowledged INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Daily executive brief
CREATE TABLE IF NOT EXISTS executive_brief (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  executive_score REAL,
  summary_text TEXT,
  brief_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sync state tracking
CREATE TABLE IF NOT EXISTS sync_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service TEXT NOT NULL UNIQUE,
  last_sync_at TEXT,
  last_sync_status TEXT DEFAULT 'never',
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed sync state for all services
INSERT OR IGNORE INTO sync_state (service) VALUES ('oura');
INSERT OR IGNORE INTO sync_state (service) VALUES ('gmail');
INSERT OR IGNORE INTO sync_state (service) VALUES ('imessage');
INSERT OR IGNORE INTO sync_state (service) VALUES ('finance');
INSERT OR IGNORE INTO sync_state (service) VALUES ('jobs');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_transactions(date);
CREATE INDEX IF NOT EXISTS idx_finance_owner ON finance_transactions(owner);
CREATE INDEX IF NOT EXISTS idx_finance_classification ON finance_transactions(classification);
CREATE INDEX IF NOT EXISTS idx_finance_category ON finance_transactions(category);
CREATE INDEX IF NOT EXISTS idx_jobs_tier ON job_listings(tier);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_listings(status);
CREATE INDEX IF NOT EXISTS idx_jobs_composite ON job_listings(composite_score);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_anomaly_date ON anomaly_log(date);
CREATE INDEX IF NOT EXISTS idx_oura_date ON oura_daily(date);
