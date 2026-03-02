const logger = require('../config/logger');
const { getDb } = require('../config/database');

/**
 * Contacts Service
 * 
 * Manages contacts including birthdays and relationship tracking.
 * Integrates with iMessage service for priority contact designation.
 */

/**
 * Add a new contact/birthday
 */
function addBirthday(name, birthday, relationship = null) {
  const db = getDb();

  try {
    // Birthday should be in MM-DD format for recurring matching
    const normalized = birthday;
    if (!/^\d{2}-\d{2}$/.test(normalized)) {
      throw new Error('Birthday must be in MM-DD format');
    }

    const stmt = db.prepare(`
      INSERT INTO birthdays (name, birthday, relationship, last_wished_year)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(name, normalized, relationship, null);

    logger.info(`Added birthday: ${name} (${normalized})`);
    return { success: true, contactId: result.lastInsertRowid };
  } catch (error) {
    logger.error('Failed to add birthday:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get all birthdays
 */
function getBirthdays() {
  const db = getDb();

  try {
    return db.prepare(`
      SELECT * FROM birthdays ORDER BY birthday ASC
    `).all();
  } catch (error) {
    logger.error('Failed to get birthdays:', error.message);
    return [];
  }
}

/**
 * Get upcoming birthdays (within N days)
 */
function getUpcomingBirthdays(daysAhead = 30) {
  const db = getDb();

  try {
    const birthdays = db.prepare('SELECT * FROM birthdays').all();
    const today = new Date();
    const upcoming = [];

    birthdays.forEach(bd => {
      const [month, day] = bd.birthday.split('-').map(Number);
      
      // Create date for this year
      let bdDate = new Date(today.getFullYear(), month - 1, day);
      
      // If birthday has already passed this year, use next year
      if (bdDate < today) {
        bdDate = new Date(today.getFullYear() + 1, month - 1, day);
      }

      const daysUntil = Math.floor((bdDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= daysAhead) {
        upcoming.push({
          ...bd,
          daysUntil,
          nextDate: bdDate.toISOString().split('T')[0]
        });
      }
    });

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  } catch (error) {
    logger.error('Failed to get upcoming birthdays:', error.message);
    return [];
  }
}

/**
 * Mark birthday as wished (update year)
 */
function markBirthdayWished(contactId) {
  const db = getDb();

  try {
    const currentYear = new Date().getFullYear();
    
    const result = db.prepare(`
      UPDATE birthdays
      SET last_wished_year = ?
      WHERE id = ?
    `).run(currentYear, contactId);

    if (result.changes === 0) {
      return { success: false, error: 'Contact not found' };
    }

    logger.info(`Marked birthday wished for contact ${contactId}`);
    return { success: true, contactId };
  } catch (error) {
    logger.error('Failed to mark birthday wished:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Update contact details
 */
function updateContact(contactId, updates) {
  const db = getDb();

  try {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.birthday !== undefined) {
      fields.push('birthday = ?');
      values.push(updates.birthday);
    }

    if (updates.relationship !== undefined) {
      fields.push('relationship = ?');
      values.push(updates.relationship);
    }

    if (fields.length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    values.push(contactId);

    const query = `UPDATE birthdays SET ${fields.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...values);

    if (result.changes === 0) {
      return { success: false, error: 'Contact not found' };
    }

    logger.info(`Updated contact ${contactId}`);
    return { success: true, contactId };
  } catch (error) {
    logger.error('Failed to update contact:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a contact
 */
function deleteContact(contactId) {
  const db = getDb();

  try {
    const result = db.prepare('DELETE FROM birthdays WHERE id = ?').run(contactId);

    if (result.changes === 0) {
      return { success: false, error: 'Contact not found' };
    }

    logger.info(`Deleted contact ${contactId}`);
    return { success: true, contactId };
  } catch (error) {
    logger.error('Failed to delete contact:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Mark contact as priority in iMessage
 */
function setPriorityContact(imessageHandleId, isPriority = true) {
  const db = getDb();

  try {
    const result = db.prepare(`
      UPDATE imessage_threads
      SET is_priority_contact = ?
      WHERE handle_id = ?
    `).run(isPriority ? 1 : 0, imessageHandleId);

    if (result.changes === 0) {
      return { success: false, error: 'iMessage handle not found' };
    }

    logger.info(`Set priority contact: ${imessageHandleId} = ${isPriority}`);
    return { success: true, handleId: imessageHandleId };
  } catch (error) {
    logger.error('Failed to set priority contact:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  addBirthday,
  getBirthdays,
  getUpcomingBirthdays,
  markBirthdayWished,
  updateContact,
  deleteContact,
  setPriorityContact
};
