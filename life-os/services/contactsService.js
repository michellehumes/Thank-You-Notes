const { getDb } = require('../config/database');
const logger = require('../config/logger');

const contactsService = {
  addBirthday(name, birthday, relationship = null) {
    const db = getDb();
    return db.prepare(`
      INSERT OR REPLACE INTO birthdays (name, birthday, relationship)
      VALUES (@name, @birthday, @relationship)
    `).run({ name, birthday, relationship });
  },

  getUpcoming(days = 30) {
    const db = getDb();
    const today = new Date();
    const results = db.prepare('SELECT * FROM birthdays').all();

    return results.filter(b => {
      const [mm, dd] = b.birthday.split('-').map(Number);
      const thisYear = new Date(today.getFullYear(), mm - 1, dd);
      const diffDays = Math.ceil((thisYear - today) / 86400000);
      return diffDays >= 0 && diffDays <= days;
    }).sort((a, b) => {
      const [am, ad] = a.birthday.split('-').map(Number);
      const [bm, bd] = b.birthday.split('-').map(Number);
      return (am * 100 + ad) - (bm * 100 + bd);
    });
  },

  markWished(id) {
    const db = getDb();
    const year = new Date().getFullYear();
    return db.prepare('UPDATE birthdays SET last_wished_year = ? WHERE id = ?').run(year, id);
  },

  getAll() {
    const db = getDb();
    return db.prepare('SELECT * FROM birthdays ORDER BY birthday').all();
  },

  remove(id) {
    const db = getDb();
    return db.prepare('DELETE FROM birthdays WHERE id = ?').run(id);
  }
};

module.exports = contactsService;
