-- OMEN Database Schema

CREATE TABLE IF NOT EXISTS users (
  user_id       SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'developer',
  created_at    TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  project_id  SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  owner_id    INTEGER REFERENCES users(user_id),
  created_at  TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scans (
  scan_id     SERIAL PRIMARY KEY,
  project_id  INTEGER REFERENCES projects(project_id),
  target_url  TEXT,
  started_at  TIMESTAMP DEFAULT now(),
  finished_at TIMESTAMP,
  status      TEXT DEFAULT 'pending'   -- pending | running | completed | failed
);

CREATE TABLE IF NOT EXISTS vulnerabilities (
  vuln_id        SERIAL PRIMARY KEY,
  scan_id        INTEGER REFERENCES scans(scan_id) ON DELETE CASCADE,
  url            TEXT,
  param          TEXT,
  issue          TEXT,
  severity       INTEGER,
  cvss_score     NUMERIC(4,1),
  evidence       TEXT,
  screenshot_url TEXT,
  cve_id         TEXT,
  ai_fix         TEXT,
  assignee_id    INTEGER REFERENCES users(user_id),
  resolved       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_comments (
  comment_id  SERIAL PRIMARY KEY,
  vuln_id     INTEGER REFERENCES vulnerabilities(vuln_id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(user_id),
  comment     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vulns_scan_id    ON vulnerabilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_vulns_cvss       ON vulnerabilities(cvss_score DESC);
CREATE INDEX IF NOT EXISTS idx_scans_project_id ON scans(project_id);
