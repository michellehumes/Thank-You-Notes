const { getDb } = require('../config/database');
const logger = require('../config/logger');

const todoAutomationService = {
  generateAutoTodos() {
    const db = getDb();
    const todos = [];

    // 1. Unread recruiter email needing response
    const recruiterEmails = db.prepare(`
      SELECT * FROM gmail_threads
      WHERE is_recruiter = 1 AND is_read = 0 AND needs_response = 1
    `).all();
    for (const email of recruiterEmails) {
      todos.push({
        title: `Respond to recruiter: ${email.subject || email.from_name}`,
        description: `From: ${email.from_name} <${email.from_email}>`,
        priority: 2, source: 'auto', trigger_type: 'recruiter_email',
        trigger_ref: email.thread_id, due_date: this._addDays(1)
      });
    }

    // 2. Unanswered iMessage > 24h from priority contact
    const unanswered = db.prepare(`
      SELECT * FROM imessage_threads
      WHERE unanswered_hours > 24 AND last_message_is_from_me = 0 AND is_priority_contact = 1
    `).all();
    for (const msg of unanswered) {
      todos.push({
        title: `Reply to ${msg.contact_name || msg.phone_or_email}`,
        description: `Unanswered for ${Math.round(msg.unanswered_hours)} hours`,
        priority: 3, source: 'auto', trigger_type: 'unanswered_message',
        trigger_ref: msg.handle_id, due_date: this._addDays(0)
      });
    }

    // 3. Birthday within 7 days
    const upcomingBirthdays = db.prepare(`
      SELECT * FROM birthdays
      WHERE birthday >= strftime('%m-%d', 'now')
        AND birthday <= strftime('%m-%d', date('now', '+7 days'))
        AND (last_wished_year IS NULL OR last_wished_year < CAST(strftime('%Y', 'now') AS INTEGER))
    `).all();
    for (const bday of upcomingBirthdays) {
      todos.push({
        title: `Send birthday message to ${bday.name}`,
        description: `Birthday: ${bday.birthday}${bday.relationship ? ' (' + bday.relationship + ')' : ''}`,
        priority: 3, source: 'auto', trigger_type: 'birthday',
        trigger_ref: String(bday.id),
        due_date: `${new Date().getFullYear()}-${bday.birthday}`
      });
    }

    // 4. High-match job > 85 composite, Tier 1
    const hotJobs = db.prepare(`
      SELECT * FROM job_listings
      WHERE composite_score >= 85 AND status = 'Identified' AND tier = 1
    `).all();
    for (const job of hotJobs) {
      todos.push({
        title: `Apply NOW: ${job.title} at ${job.company}`,
        description: `Composite: ${job.composite_score}, Tier 1. ${job.compensation_range || ''}`,
        priority: 1, source: 'auto', trigger_type: 'job_match',
        trigger_ref: job.role_id, due_date: this._addDays(1)
      });
    }

    // 5. Unacknowledged burn rate spike
    const burnSpike = db.prepare(`
      SELECT * FROM anomaly_log
      WHERE type = 'spend_spike' AND severity IN ('warning', 'critical')
        AND acknowledged = 0 AND date >= date('now', '-3 days')
    `).all();
    for (const spike of burnSpike) {
      todos.push({
        title: 'Review spending spike',
        description: spike.description,
        priority: 2, source: 'auto', trigger_type: 'burn_spike',
        trigger_ref: String(spike.id), due_date: this._addDays(1)
      });
    }

    // Deduplicate: don't create if same trigger_ref + trigger_type exists and is still pending
    const insertStmt = db.prepare(`
      INSERT INTO todos (title, description, priority, source, trigger_type, trigger_ref, status, due_date)
      SELECT @title, @description, @priority, @source, @trigger_type, @trigger_ref, 'pending', @due_date
      WHERE NOT EXISTS (
        SELECT 1 FROM todos
        WHERE trigger_type = @trigger_type AND trigger_ref = @trigger_ref AND status IN ('pending', 'in_progress')
      )
    `);

    let created = 0;
    const insertAll = db.transaction((items) => {
      for (const item of items) {
        const result = insertStmt.run(item);
        if (result.changes > 0) created++;
      }
    });
    insertAll(todos);

    logger.info(`Auto-todo generation: ${created} new todos created from ${todos.length} candidates`);
    return { total_candidates: todos.length, created };
  },

  _addDays(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  },

  getTodos({ status, priority, limit = 50 } = {}) {
    const db = getDb();
    let sql = 'SELECT * FROM todos WHERE 1=1';
    const params = {};
    if (status) { sql += ' AND status = @status'; params.status = status; }
    if (priority) { sql += ' AND priority <= @priority'; params.priority = priority; }
    sql += ' ORDER BY priority ASC, due_date ASC LIMIT @limit';
    params.limit = limit;
    return db.prepare(sql).all(params);
  },

  updateTodoStatus(id, status) {
    const db = getDb();
    const extra = status === 'done' ? ", completed_at = datetime('now')" : '';
    return db.prepare(`UPDATE todos SET status = @status${extra} WHERE id = @id`).run({ id, status });
  }
};

module.exports = todoAutomationService;
