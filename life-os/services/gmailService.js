/**
 * Gmail Service — OAuth 2.0 with recruiter detection
 * Uses googleapis npm package for Gmail API access
 *
 * Setup: Create OAuth credentials at console.cloud.google.com
 *        Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI in .env
 *        Run /api/sync/gmail/auth to get authorization URL
 *        Paste code at /api/sync/gmail/callback to complete OAuth flow
 */
const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');
const fs = require('fs');
const path = require('path');

const log = createServiceLogger('gmail');
const TOKEN_PATH = path.join(__dirname, '..', 'tokens.json');

// Recruiter detection heuristics
const RECRUITER_SIGNALS = {
  domains: [
    'linkedin.com', 'lever.co', 'greenhouse.io', 'ashbyhq.com',
    'smartrecruiters.com', 'workday.com', 'icims.com', 'jobvite.com',
    'recruitee.com', 'breezy.hr', 'jazz.co', 'bamboohr.com'
  ],
  subjectPatterns: [
    /\b(opportunity|role|position|opening|hiring|recruit|career)\b/i,
    /\b(director|vp|head of|senior|lead)\b.*\b(marketing|media|digital|brand|growth)\b/i,
    /\b(interested in|reaching out|your background|your experience)\b/i,
    /\b(schedule|interview|call|chat|connect)\b.*\b(role|position|opportunity)\b/i
  ],
  bodyPatterns: [
    /\b(compensation|salary|base|total comp|equity|bonus)\b.*\$?\d/i,
    /\b(remote|hybrid|on-?site)\b/i,
    /\b(your (linkedin|profile|resume|background|experience))\b/i,
    /\b(I('m| am) (a |)(recruiter|sourcer|headhunter|talent))\b/i,
    /\b(on behalf of|client|confidential|stealth)\b/i
  ],
  titlePatterns: [
    /recruiter|sourcer|talent|HR|human resources|people ops/i
  ]
};

function isConfigured() {
  return !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET);
}

function hasTokens() {
  try {
    return fs.existsSync(TOKEN_PATH);
  } catch { return false; }
}

function loadTokens() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

function getAuthUrl() {
  if (!isConfigured()) return null;
  const params = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID,
    redirect_uri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3045/api/sync/gmail/callback',
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    access_type: 'offline',
    prompt: 'consent'
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function exchangeCode(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      redirect_uri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3045/api/sync/gmail/callback',
      grant_type: 'authorization_code'
    })
  });
  const tokens = await res.json();
  if (tokens.error) throw new Error(`OAuth error: ${tokens.error_description || tokens.error}`);
  saveTokens(tokens);
  return tokens;
}

async function refreshAccessToken() {
  const tokens = loadTokens();
  if (!tokens?.refresh_token) throw new Error('No refresh token available');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: tokens.refresh_token,
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      grant_type: 'refresh_token'
    })
  });
  const newTokens = await res.json();
  if (newTokens.error) throw new Error(`Refresh error: ${newTokens.error}`);
  saveTokens({ ...tokens, ...newTokens });
  return newTokens.access_token;
}

async function gmailFetch(endpoint) {
  let tokens = loadTokens();
  if (!tokens) throw new Error('Gmail not authenticated');

  let accessToken = tokens.access_token;

  // Check if token expired
  if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
    accessToken = await refreshAccessToken();
  }

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.status === 401) {
    accessToken = await refreshAccessToken();
    const retry = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return retry.json();
  }

  return res.json();
}

function scoreRecruiterLikelihood(email) {
  let score = 0;
  const fromAddr = (email.from || '').toLowerCase();
  const subject = email.subject || '';
  const snippet = email.snippet || '';

  // Domain check
  if (RECRUITER_SIGNALS.domains.some(d => fromAddr.includes(d))) score += 30;

  // Subject patterns
  RECRUITER_SIGNALS.subjectPatterns.forEach(p => { if (p.test(subject)) score += 15; });

  // Body patterns
  RECRUITER_SIGNALS.bodyPatterns.forEach(p => { if (p.test(snippet)) score += 10; });

  // Sender title patterns
  RECRUITER_SIGNALS.titlePatterns.forEach(p => { if (p.test(fromAddr)) score += 20; });

  return Math.min(100, score);
}

async function syncInbox(maxResults = 50) {
  if (!hasTokens()) throw new Error('Gmail not authenticated — visit /api/sync/gmail/auth');

  log.info(`Syncing Gmail inbox (max ${maxResults})...`);

  const listRes = await gmailFetch(`messages?maxResults=${maxResults}&labelIds=INBOX`);
  const messages = listRes.messages || [];

  const db = getDb();
  let synced = 0;
  let recruiterCount = 0;

  for (const msg of messages) {
    const existing = db.prepare('SELECT id FROM emails WHERE gmail_id = ?').get(msg.id);
    if (existing) continue;

    const full = await gmailFetch(`messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`);
    const headers = full.payload?.headers || [];
    const from = headers.find(h => h.name === 'From')?.value || '';
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';

    const email = { from, subject, snippet: full.snippet || '', date };
    const recruiterScore = scoreRecruiterLikelihood(email);
    const isRecruiter = recruiterScore >= 40;

    db.prepare(`
      INSERT OR IGNORE INTO emails (gmail_id, from_address, subject, snippet, received_at, is_recruiter, recruiter_score, labels, needs_response)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      msg.id, from, subject, full.snippet || '',
      date ? new Date(date).toISOString() : new Date().toISOString(),
      isRecruiter ? 1 : 0, recruiterScore,
      JSON.stringify(full.labelIds || []),
      1
    );

    synced++;
    if (isRecruiter) recruiterCount++;
  }

  db.prepare(`
    INSERT INTO sync_log (service, status, records_synced, started_at, completed_at)
    VALUES ('gmail', 'success', ?, datetime('now'), datetime('now'))
  `).run(synced);

  log.info(`Gmail sync: ${synced} new emails, ${recruiterCount} recruiter messages`);
  return { synced, recruiterCount, total: messages.length };
}

function getInboxStats() {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as cnt FROM emails').get().cnt;
  const unread = db.prepare('SELECT COUNT(*) as cnt FROM emails WHERE needs_response = 1').get().cnt;
  const recruiter = db.prepare('SELECT COUNT(*) as cnt FROM emails WHERE is_recruiter = 1 AND needs_response = 1').get().cnt;

  return { total, needs_response: unread, recruiter_messages: recruiter };
}

function getRecruiterEmails() {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM emails WHERE is_recruiter = 1
    ORDER BY recruiter_score DESC, received_at DESC LIMIT 50
  `).all();
}

function getInboxScore() {
  const stats = getInboxStats();
  // 10 points max: 0 pending = 10, <5 = 8, <15 = 5, <30 = 3, else 0
  const pending = stats.needs_response;
  let score = 0;
  if (pending === 0) score = 10;
  else if (pending < 5) score = 8;
  else if (pending < 15) score = 5;
  else if (pending < 30) score = 3;

  return { score, max: 10, pending, recruiter: stats.recruiter_messages };
}

module.exports = {
  isConfigured, hasTokens, getAuthUrl, exchangeCode,
  syncInbox, getInboxStats, getRecruiterEmails, getInboxScore
};
