const logger = require('../config/logger');
const { getDb } = require('../config/database');

const OURA_BASE = 'https://api.ouraring.com/v2/usercollection';

const ouraService = {
  async syncDaily(dateStr) {
    const token = process.env.OURA_ACCESS_TOKEN;
    if (!token) {
      logger.warn('OURA_ACCESS_TOKEN not configured — skipping sync');
      return { skipped: true, reason: 'no_token' };
    }

    const date = dateStr || new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const startDate = dateStr || yesterday;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [sleepRes, readinessRes, activityRes] = await Promise.all([
        fetch(`${OURA_BASE}/daily_sleep?start_date=${startDate}&end_date=${date}`, { headers }),
        fetch(`${OURA_BASE}/daily_readiness?start_date=${startDate}&end_date=${date}`, { headers }),
        fetch(`${OURA_BASE}/daily_activity?start_date=${startDate}&end_date=${date}`, { headers })
      ]);

      if (!sleepRes.ok) throw new Error(`Oura sleep API: ${sleepRes.status}`);
      if (!readinessRes.ok) throw new Error(`Oura readiness API: ${readinessRes.status}`);
      if (!activityRes.ok) throw new Error(`Oura activity API: ${activityRes.status}`);

      const [sleep, readiness, activity] = await Promise.all([
        sleepRes.json(), readinessRes.json(), activityRes.json()
      ]);

      const db = getDb();
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO oura_daily (date, sleep_score, readiness_score, activity_score, hrv_avg, resting_hr, body_temperature_delta)
        VALUES (@date, @sleep_score, @readiness_score, @activity_score, @hrv_avg, @resting_hr, @body_temperature_delta)
      `);

      // Merge by date
      const dateMap = {};
      for (const s of (sleep.data || [])) {
        dateMap[s.day] = dateMap[s.day] || {};
        dateMap[s.day].sleep_score = s.score;
        dateMap[s.day].hrv_avg = s.contributors?.hrv_balance || null;
        dateMap[s.day].resting_hr = s.contributors?.resting_heart_rate || null;
      }
      for (const r of (readiness.data || [])) {
        dateMap[r.day] = dateMap[r.day] || {};
        dateMap[r.day].readiness_score = r.score;
        dateMap[r.day].body_temperature_delta = r.contributors?.body_temperature || null;
      }
      for (const a of (activity.data || [])) {
        dateMap[a.day] = dateMap[a.day] || {};
        dateMap[a.day].activity_score = a.score;
      }

      let upserted = 0;
      const upsertAll = db.transaction(() => {
        for (const [day, data] of Object.entries(dateMap)) {
          stmt.run({
            date: day,
            sleep_score: data.sleep_score || null,
            readiness_score: data.readiness_score || null,
            activity_score: data.activity_score || null,
            hrv_avg: data.hrv_avg || null,
            resting_hr: data.resting_hr || null,
            body_temperature_delta: data.body_temperature_delta || null
          });
          upserted++;
        }
      });
      upsertAll();

      // Update sync state
      db.prepare(`UPDATE sync_state SET last_sync_at = datetime('now'), last_sync_status = 'success' WHERE service = 'oura'`).run();

      logger.info(`Oura sync complete: ${upserted} days upserted`);
      return { upserted, dates: Object.keys(dateMap) };
    } catch (err) {
      const db = getDb();
      db.prepare(`UPDATE sync_state SET last_sync_at = datetime('now'), last_sync_status = 'error', error_message = @msg WHERE service = 'oura'`).run({ msg: err.message });
      throw err;
    }
  },

  getLatest(days = 7) {
    const db = getDb();
    return db.prepare('SELECT * FROM oura_daily ORDER BY date DESC LIMIT ?').all(days);
  }
};

module.exports = ouraService;
