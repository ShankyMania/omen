/**
 * db.js — better-sqlite3 wrapper
 * Points to the SAME omen.db that Python writes to.
 * DB_URL in .env must be an absolute path or relative to backend-node/.
 */
const Database = require('better-sqlite3')
const path = require('path')
const fs   = require('fs')

// Resolve shared DB path — default: sibling backend-python/omen.db
const DB_PATH = process.env.DB_URL
  ? path.resolve(process.env.DB_URL)
  : path.resolve(__dirname, '../../..', 'backend-python', 'omen.db')

// Ensure directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')   // safe concurrent reads from Python + Node
db.pragma('foreign_keys = ON')

// Bootstrap tables + migrate existing DBs
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    scan_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    target     TEXT NOT NULL,
    status     TEXT DEFAULT 'pending',
    duration_s REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS vulnerabilities (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id        INTEGER NOT NULL,
    url            TEXT,
    param          TEXT,
    issue          TEXT,
    severity       INTEGER DEFAULT 0,
    cvss_score     REAL DEFAULT 0.0,
    evidence       TEXT,
    screenshot_url TEXT,
    cve_id         TEXT,
    ai_fix         TEXT,
    source         TEXT,
    FOREIGN KEY (scan_id) REFERENCES scans(scan_id)
  );
`)

// Migrate: add columns that may not exist in older DBs
const migrations = [
  `ALTER TABLE scans ADD COLUMN duration_s REAL DEFAULT 0`,
  `ALTER TABLE vulnerabilities ADD COLUMN source TEXT`,
  `ALTER TABLE vulnerabilities ADD COLUMN ai_fix TEXT`,
]
for (const sql of migrations) {
  try { db.exec(sql) } catch { /* column already exists — ignore */ }
}

module.exports = {
  run(sql, params = []) {
    return db.prepare(sql).run(params)
  },
  get(sql, params = []) {
    return db.prepare(sql).get(params)
  },
  all(sql, params = []) {
    return db.prepare(sql).all(params)
  },
  insert(sql, params = []) {
    const info = db.prepare(sql).run(params)
    return info.lastInsertRowid
  },
}
