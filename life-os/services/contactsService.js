/**
 * Contacts Service — manages relationship tracking
 * Maps phone numbers/emails to names and categories
 */
const { getDb } = require('../config/database');
const { createServiceLogger } = require('../config/logger');

const log = createServiceLogger('contacts');

function addContact(data) {
  const db = getDb();
  const { name, phone, email, relationship, priority, notes } = data;

  const result = db.prepare(`
    INSERT OR REPLACE INTO contacts (name, phone, email, relationship, priority, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, phone || null, email || null, relationship || 'other', priority || 3, notes || null);

  return { id: result.lastInsertRowid };
}

function getContacts(filters = {}) {
  const db = getDb();
  let sql = 'SELECT * FROM contacts WHERE 1=1';
  const params = [];

  if (filters.relationship) {
    sql += ' AND relationship = ?';
    params.push(filters.relationship);
  }
  if (filters.priority) {
    sql += ' AND priority <= ?';
    params.push(parseInt(filters.priority));
  }
  if (filters.search) {
    sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }

  sql += ' ORDER BY priority ASC, name ASC';
  return db.prepare(sql).all(...params);
}

function findContact(identifier) {
  const db = getDb();
  // Try phone first, then email, then name
  return db.prepare('SELECT * FROM contacts WHERE phone = ? OR email = ? OR name LIKE ?')
    .get(identifier, identifier, `%${identifier}%`) || null;
}

function updateLastContact(identifier) {
  const db = getDb();
  const contact = findContact(identifier);
  if (contact) {
    db.prepare('UPDATE contacts SET last_contact = datetime(\'now\') WHERE id = ?').run(contact.id);
  }
  return contact;
}

function getStaleContacts(daysSinceContact = 14) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM contacts
    WHERE priority <= 2
    AND (last_contact IS NULL OR last_contact < datetime('now', '-' || ? || ' days'))
    ORDER BY priority ASC, last_contact ASC
  `).all(daysSinceContact);
}

function seedDefaultContacts() {
  const db = getDb();
  const defaults = [
    { name: 'Gray', relationship: 'partner', priority: 1 },
    { name: 'Mom', relationship: 'family', priority: 1 },
    { name: 'Dad', relationship: 'family', priority: 1 }
  ];

  for (const c of defaults) {
    const exists = db.prepare('SELECT id FROM contacts WHERE name = ?').get(c.name);
    if (!exists) {
      addContact(c);
      log.info(`Added default contact: ${c.name}`);
    }
  }
}

module.exports = { addContact, getContacts, findContact, updateLastContact, getStaleContacts, seedDefaultContacts };
