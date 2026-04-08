import os
import sqlite3
import time
from typing import Optional

DB_PATH = os.environ.get("DB_URL", "sqlite:///omen.db").replace("sqlite:///", "")


def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")   # safe concurrent access with Node
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    with get_conn() as conn:
        conn.executescript("""
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
        """)
        # migrate older DBs that may be missing columns
        for sql in [
            "ALTER TABLE scans ADD COLUMN duration_s REAL DEFAULT 0",
            "ALTER TABLE vulnerabilities ADD COLUMN source TEXT",
            "ALTER TABLE vulnerabilities ADD COLUMN ai_fix TEXT",
        ]:
            try:
                conn.execute(sql)
            except Exception:
                pass  # column already exists


def update_scan_status(scan_id: int, status: str, duration_s: float = 0):
    with get_conn() as conn:
        conn.execute(
            "UPDATE scans SET status = ?, duration_s = ? WHERE scan_id = ?",
            (status, duration_s, scan_id)
        )


def save_vulnerabilities(scan_id: int, vulns: list):
    if not vulns:
        return
    with get_conn() as conn:
        conn.executemany(
            """INSERT INTO vulnerabilities
               (scan_id, url, param, issue, severity, cvss_score, evidence, source)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            [(
                scan_id,
                v.get("url", ""), v.get("param", ""), v.get("issue", "Unknown"),
                int(v.get("severity", 0)), float(v.get("cvss_score", 0.0)),
                v.get("evidence", ""), v.get("source", "FastScan"),
            ) for v in vulns]
        )


def get_vulnerabilities(scan_id: int) -> Optional[list]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM vulnerabilities WHERE scan_id = ? ORDER BY cvss_score DESC",
            (scan_id,)
        ).fetchall()
    return [dict(r) for r in rows]


def get_scan_meta(scan_id: int):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT scan_id, target, status, duration_s, created_at FROM scans WHERE scan_id = ?",
            (scan_id,)
        ).fetchone()
    return dict(row) if row else None
