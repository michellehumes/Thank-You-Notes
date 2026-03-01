/**
 * Oura Ring Health Service
 * Uses Oura Personal Access Token (not OAuth)
 * API v2: https://cloud.ouraring.com/v2/docs
 */
const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('oura');
const OURA_BASE = 'https://api.ouraring.com/v2';

function getToken() {
  return process.env.OURA_TOKEN;
}

function isConfigured() {
  return !!getToken();
}

async function ouraFetch(endpoint, params = {}) {
  const token = getToken();
  if (!token) throw new Error('OURA_TOKEN not configured');

  const url = new URL(`${OURA_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Oura API ${res.status}: ${text}`);
  }

  return res.json();
}

async function syncDailyData(date) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const startDate = targetDate;
  const endDate = targetDate;

  log.info(`Syncing Oura data for ${targetDate}`);

  const [sleepData, readinessData, activityData] = await Promise.all([
    ouraFetch('/usercollection/daily_sleep', { start_date: startDate, end_date: endDate }).catch(e => ({ data: [] })),
    ouraFetch('/usercollection/daily_readiness', { start_date: startDate, end_date: endDate }).catch(e => ({ data: [] })),
    ouraFetch('/usercollection/daily_activity', { start_date: startDate, end_date: endDate }).catch(e => ({ data: [] }))
  ]);

  const sleep = sleepData.data?.[0];
  const readiness = readinessData.data?.[0];
  const activity = activityData.data?.[0];

  if (!sleep && !readiness && !activity) {
    log.warn(`No Oura data available for ${targetDate}`);
    return null;
  }

  const record = {
    date: targetDate,
    sleep_score: sleep?.score || null,
    sleep_hours: sleep?.contributors?.total_sleep ? Math.round(sleep.contributors.total_sleep / 3600 * 10) / 10 : null,
    sleep_efficiency: sleep?.contributors?.efficiency || null,
    hrv_avg: sleep?.contributors?.hrv_balance || null,
    resting_hr: sleep?.contributors?.resting_heart_rate || null,
    readiness_score: readiness?.score || null,
    activity_score: activity?.score || null,
    steps: activity?.steps || null,
    active_calories: activity?.active_calories || null,
    body_temp_deviation: sleep?.contributors?.deep_sleep || null,
    raw_data: JSON.stringify({ sleep, readiness, activity })
  };

  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO health_daily
    (date, sleep_score, sleep_hours, sleep_efficiency, hrv_avg, resting_hr,
     readiness_score, activity_score, steps, active_calories, body_temp_deviation, raw_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.date, record.sleep_score, record.sleep_hours, record.sleep_efficiency,
    record.hrv_avg, record.resting_hr, record.readiness_score, record.activity_score,
    record.steps, record.active_calories, record.body_temp_deviation, record.raw_data
  );

  // Log sync
  db.prepare(`
    INSERT INTO sync_log (service, status, records_synced, started_at, completed_at)
    VALUES ('oura', 'success', 1, datetime('now'), datetime('now'))
  `).run();

  log.info(`Oura sync complete for ${targetDate}: sleep=${record.sleep_score}, readiness=${record.readiness_score}, activity=${record.activity_score}`);
  return record;
}

async function syncDateRange(startDate, endDate) {
  log.info(`Syncing Oura data range: ${startDate} to ${endDate}`);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const results = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    try {
      const r = await syncDailyData(dateStr);
      if (r) results.push(r);
    } catch (err) {
      log.error(`Failed to sync ${dateStr}: ${err.message}`);
    }
  }

  return results;
}

function getToday() {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  return db.prepare('SELECT * FROM health_daily WHERE date = ?').get(today) || null;
}

function getTrend(days = 14) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT date, sleep_score, readiness_score, activity_score, sleep_hours, hrv_avg, resting_hr, steps
    FROM health_daily
    ORDER BY date DESC LIMIT ?
  `).all(days);

  if (rows.length === 0) return { data: [], averages: {} };

  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
  const scores = rows.filter(r => r.sleep_score);

  return {
    data: rows.reverse(),
    averages: {
      sleep_score: avg(scores.map(r => r.sleep_score).filter(Boolean)),
      readiness_score: avg(scores.map(r => r.readiness_score).filter(Boolean)),
      activity_score: avg(scores.map(r => r.activity_score).filter(Boolean)),
      sleep_hours: scores.length ? Math.round(scores.reduce((a, r) => a + (r.sleep_hours || 0), 0) / scores.length * 10) / 10 : null,
      hrv_avg: avg(scores.map(r => r.hrv_avg).filter(Boolean)),
      resting_hr: avg(scores.map(r => r.resting_hr).filter(Boolean)),
      steps: avg(scores.map(r => r.steps).filter(Boolean))
    },
    days: rows.length
  };
}

function getHealthScore() {
  const trend = getTrend(7);
  if (!trend.averages.sleep_score) return { score: 0, max: 15, status: 'no_data' };

  // 15 points max: sleep 6pts, readiness 5pts, activity 4pts
  const sleepPts = Math.min(6, Math.round((trend.averages.sleep_score / 100) * 6));
  const readinessPts = trend.averages.readiness_score ? Math.min(5, Math.round((trend.averages.readiness_score / 100) * 5)) : 0;
  const activityPts = trend.averages.activity_score ? Math.min(4, Math.round((trend.averages.activity_score / 100) * 4)) : 0;

  return {
    score: sleepPts + readinessPts + activityPts,
    max: 15,
    breakdown: { sleep: sleepPts, readiness: readinessPts, activity: activityPts },
    averages: trend.averages
  };
}

module.exports = { isConfigured, syncDailyData, syncDateRange, getToday, getTrend, getHealthScore };
