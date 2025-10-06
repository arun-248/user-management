const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Ensure data folder exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Path for DB file
const dbPath = path.join(dataDir, 'app.db');

// Create database
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS managers (
  manager_id TEXT PRIMARY KEY,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users (
  user_id    TEXT PRIMARY KEY,
  full_name  TEXT NOT NULL,
  mob_num    TEXT NOT NULL,
  pan_num    TEXT NOT NULL,
  manager_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_active  INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (manager_id) REFERENCES managers(manager_id)
);
`);

// Seed managers
const countManagers = db.prepare('SELECT COUNT(*) AS c FROM managers').get().c;
if (countManagers === 0) {
  const seedManagers = [
    { manager_id: '3f1c1a50-0c9c-4a7d-9f56-9a0e6b96b8ab', is_active: 1 },
    { manager_id: 'a6e6b813-0b91-4e1b-8d2e-7cdd2fbd3b45', is_active: 1 },
    { manager_id: '5b2c9e6d-0f7a-4c13-9e6a-2d3c4b5a6e7f', is_active: 1 }
  ];
  const insert = db.prepare('INSERT INTO managers (manager_id, is_active) VALUES (?, ?)');
  const trx = db.transaction((rows) => rows.forEach(r => insert.run(r.manager_id, r.is_active)));
  trx(seedManagers);
}

function nowISO() { return new Date().toISOString(); }

const stmts = {
  insertUser: db.prepare(`
    INSERT INTO users (user_id, full_name, mob_num, pan_num, manager_id, created_at, updated_at, is_active)
    VALUES (@user_id, @full_name, @mob_num, @pan_num, @manager_id, @created_at, @updated_at, @is_active)
  `),
  getAllUsers: db.prepare(`SELECT * FROM users`),
  getUsersByManager: db.prepare(`SELECT * FROM users WHERE manager_id = ?`),
  getUserById: db.prepare(`SELECT * FROM users WHERE user_id = ?`),
  getUsersByMob: db.prepare(`SELECT * FROM users WHERE mob_num = ?`),
  deleteUserById: db.prepare(`DELETE FROM users WHERE user_id = ?`),
  deleteUserByMob: db.prepare(`DELETE FROM users WHERE mob_num = ?`),
  isManagerActive: db.prepare(`SELECT is_active FROM managers WHERE manager_id = ?`),
  updateUserFull: db.prepare(`
    UPDATE users
    SET full_name = @full_name,
        mob_num = @mob_num,
        pan_num = @pan_num,
        manager_id = @manager_id,
        updated_at = @updated_at
    WHERE user_id = @user_id
  `),
  softDeactivateUser: db.prepare(`
    UPDATE users SET is_active = 0, updated_at = @updated_at WHERE user_id = @user_id
  `)
};

module.exports = { db, stmts, nowISO };
