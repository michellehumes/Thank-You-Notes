const logger = require('../config/logger');
const { getDb } = require('../config/database');

/**
 * Oura Ring v2 API Integration Service
 * Fetches daily sleep, readiness, and activity scores and stores in database
 */

const OURA_API_BASE = 'https://api.ouraring.com/v2';

/**
 * Fetch data from Oura v2 API endpoint with error handling
 */
async function fetchOuraEndpoint(endpoint, accessToken) {
  const url = `${OURA_API_BASE}/${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Oura authentication failed - invalid or expired token');
      }
      if (response.status === 429) {
        throw new Error('Oura API rate limit exceeded');
      }
      throw new Error(`Oura API error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    logger.error(`Oura API fetch error for ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Fetch and merge all Oura data streams
 */
async function fetchAllOuraData(accessToken) {
  if (!accessToken) {
    logger.warn('OURA_ACCESS_TOKEN not configured');
    return null;
  }

  try {
    logger.info('Fetching Oura Ring data...');

    // Fetch all endpoints in parallel
    const [sleepData, readinessData, activityData] = await Promise.all([
      fetchOuraEndpoint('usercollection/daily_sleep', accessToken),
      fetchOuraEndpoint('usercollection/daily_readiness', accessToken),
      fetchOuraEndpoint('usercollection/daily_activity', accessToken)
    ]);

    // Merge by date
    const byDate = {};

    // Process sleep data
    sleepData.forEach(item => {
      if (!byDate[item.day]) byDate[item.day] = {};
      byDate[item.day].sleep_score = item.score || null;
      byDate[item.day].day = item.day;
    });

    // Process readiness data
    readinessData.forEach(item => {
      if (!byDate[item.day]) byDate[item.day] = {};
      byDate[item.day].readiness_score = item.score || null;
      byDate[item.day].day = item.day;
    });

    // Process activity data
    activityData.forEach(item => {
      if (!byDate[item.day]) byDate[item.day] = {};
      byDate[item.day].activity_score = item.score || null;
      byDate[item.day].hrv_avg = item.contributors?.hrv_balance || null;
      byDate[item.day].resting_hr = item.contributors?.resting_heart_rate || null;
      byDate[item.day].body_temperature_delta = item.contributors?.body_temperature || null;
      byDate[item.day].day = item.day;
    });

    logger.info(`Merged ${Object.keys(byDate).length} days of Oura data`);
    return Object.values(byDate);
  } catch (error) {
    logger.error('Failed to fetch Oura data:', error.message);
    throw error;
  }
}

/**
 * Upsert Oura data into database
 */
function upsertOuraData(data) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      INSERT INTO oura_daily (
        day, sleep_score, readiness_score, activity_score,
        hrv_avg, resting_hr, body_temperature_delta
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(day) DO UPDATE SET
        sleep_score = COALESCE(excluded.sleep_score, sleep_score),
        readiness_score = COALESCE(excluded.readiness_score, readiness_score),
        activity_score = COALESCE(excluded.activity_score, activity_score),
        hrv_avg = COALESCE(excluded.hrv_avg, hrv_avg),
        resting_hr = COALESCE(excluded.resting_hr, resting_hr),
        body_temperature_delta = COALESCE(excluded.body_temperature_delta, body_temperature_delta)
    `);

    const inserted = data.reduce((count, item) => {
      stmt.run(
        item.day,
        item.sleep_score,
        item.readiness_score,
        item.activity_score,
        item.hrv_avg,
        item.resting_hr,
        item.body_temperature_delta
      );
      return count + 1;
    }, 0);

    logger.info(`Upserted ${inserted} Oura daily records`);
    return inserted;
  } catch (error) {
    logger.error('Failed to upsert Oura data:', error.message);
    throw error;
  }
}

/**
 * Update sync state in database
 */
function updateSyncState(status, error = null) {
  const db = getDb();

  try {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO sync_state (service, last_sync_at, last_sync_status, error_message)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(service) DO UPDATE SET
        last_sync_at = excluded.last_sync_at,
        last_sync_status = excluded.last_sync_status,
        error_message = excluded.error_message
    `).run('oura', now, status, error);
  } catch (err) {
    logger.error('Failed to update sync state:', err.message);
  }
}

/**
 * Main sync function - orchestrates entire Oura data sync
 */
async function syncOuraData(accessToken) {
  try {
    const data = await fetchAllOuraData(accessToken);
    
    if (!data) {
      updateSyncState('skipped');
      return { success: false, reason: 'No token configured' };
    }

    const inserted = upsertOuraData(data);
    updateSyncState('success');

    logger.info('Oura data sync completed successfully');
    return { success: true, recordsProcessed: inserted };
  } catch (error) {
    updateSyncState('error', error.message);
    logger.error('Oura sync failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get latest Oura scores for dashboard
 */
function getLatestScores() {
  const db = getDb();

  try {
    const latest = db.prepare(`
      SELECT
        day,
        sleep_score,
        readiness_score,
        activity_score,
        hrv_avg,
        resting_hr,
        body_temperature_delta
      FROM oura_daily
      WHERE day IS NOT NULL
      ORDER BY day DESC
      LIMIT 1
    `).get();

    return latest || null;
  } catch (error) {
    logger.error('Failed to get latest Oura scores:', error.message);
    return null;
  }
}

/**
 * Get Oura history for specified number of days
 */
function getOuraHistory(days = 30) {
  const db = getDb();

  try {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    const thresholdStr = threshold.toISOString().split('T')[0];

    return db.prepare(`
      SELECT
        day,
        sleep_score,
        readiness_score,
        activity_score,
        hrv_avg,
        resting_hr,
        body_temperature_delta
      FROM oura_daily
      WHERE day >= ?
      ORDER BY day DESC
    `).all(thresholdStr);
  } catch (error) {
    logger.error('Failed to get Oura history:', error.message);
    return [];
  }
}

module.exports = {
  syncOuraData,
  getLatestScores,
  getOuraHistory,
  fetchAllOuraData,
  upsertOuraData,
  updateSyncState
};
