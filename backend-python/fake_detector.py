"""
OMEN Fake / Phishing Website Detector
Combines domain-based heuristics + live availability check.
"""
import re, requests
from urllib.parse import urlparse
from typing import TypedDict, List

_SESSION = requests.Session()
_SESSION.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
_TIMEOUT = 8

# ── Canonical real domains for known brands ───────────────────────────────────
CANONICAL = {
    "sbi":       "sbi.co.in",
    "onlinesbi": "onlinesbi.sbi",
    "sbicard":   "sbicard.com",
    "hdfc":      "hdfcbank.com",
    "icici":     "icicibank.com",
    "axis":      "axisbank.com",
    "kotak":     "kotak.com",
    "paytm":     "paytm.com",
    "phonepe":   "phonepe.com",
    "google":    "google.com",
    "facebook":  "facebook.com",
    "instagram": "instagram.com",
    "amazon":    "amazon.com",
    "apple":     "apple.com",
    "microsoft": "microsoft.com",
    "paypal":    "paypal.com",
    "netflix":   "netflix.com",
    "youtube":   "youtube.com",
    "linkedin":  "linkedin.com",
    "github":    "github.com",
    "twitter":   "twitter.com",
    "flipkart":  "flipkart.com",
    "irctc":     "irctc.co.in",
}

# ── Known fake domains ────────────────────────────────────────────────────────
KNOWN_FAKE = {
    "sbi.com", "sbionline.com", "sbi-bank.com", "sbi-online.com",
    "onlinesbi.com", "onlinesbi.net", "sbinetbanking.com",
    "hdfcbank.net", "hdfc-bank.com", "icicibank.net",
    "paypal-secure.com", "paypal-login.com",
    "amazon-login.com", "amazon-secure.com",
}

# ── Suspicious TLDs ───────────────────────────────────────────────────────────
SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".click",
    ".loan", ".work", ".date", ".racing", ".win", ".download",
    ".stream", ".bid", ".trade", ".icu", ".vip", ".monster",
}

# ── Phishing keywords ─────────────────────────────────────────────────────────
PHISH_KEYWORDS = [
    "secure", "login", "signin", "account", "update", "verify",
    "banking", "netbanking", "support", "alert", "suspended",
    "recover", "password", "credential", "wallet",
]


class FakeCheckResult(TypedDict):
    is_fake: bool
    confidence: int
    verdict: str
    reasons: List[str]
    checks: dict


def check_fake(url: str) -> FakeCheckResult:
    raw = url.strip()
    if not raw.startswith("http"):
        raw = "https://" + raw

    parsed   = urlparse(raw)
    scheme   = parsed.scheme.lower()
    hostname = (parsed.hostname or "").lower()
    domain   = hostname.replace("www.", "")
    parts    = domain.split(".")
    root     = ".".join(parts[-2:]) if len(parts) >= 2 else domain
    tld      = "." + parts[-1] if parts else ""

    reasons: List[str] = []
    score = 0

    checks = {
        "has_https":      scheme == "https",
        "ssl_valid":      False,
        "redirect_count": 0,
        "status_code":    None,
        "final_domain":   domain,
        "page_title":     "",
        "has_login_form": False,
    }

    # ── 1. Known fake blocklist ───────────────────────────────────────────────
    if domain in KNOWN_FAKE or root in KNOWN_FAKE:
        score += 80
        reasons.append(f"'{domain}' is a known fake/phishing domain")

    # ── 2. Canonical domain check ─────────────────────────────────────────────
    for brand, canonical in CANONICAL.items():
        if brand in domain:
            canonical_clean = canonical.replace("www.", "")
            if domain == canonical_clean or domain == "www." + canonical_clean:
                # Real domain — give safety bonus
                score = max(0, score - 10)
                reasons.append(f"Domain matches real {brand.upper()} site ({canonical_clean}) ✓")
            else:
                score += 60
                reasons.append(
                    f"Contains '{brand}' but is NOT the real {brand.upper()} site "
                    f"(real: {canonical_clean}) — likely impersonation"
                )
            break

    # ── 3. Suspicious TLD ─────────────────────────────────────────────────────
    if tld in SUSPICIOUS_TLDS:
        score += 25
        reasons.append(f"Suspicious TLD '{tld}' — commonly used in phishing")

    # ── 4. IP address as hostname ─────────────────────────────────────────────
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", hostname):
        score += 35
        reasons.append("URL uses a raw IP address instead of a domain name")

    # ── 5. Phishing keywords ──────────────────────────────────────────────────
    kw_hits = [k for k in PHISH_KEYWORDS if k in domain]
    if len(kw_hits) >= 2:
        score += 20
        reasons.append(f"Multiple phishing keywords in domain: {', '.join(kw_hits[:3])}")
    elif len(kw_hits) == 1:
        score += 10
        reasons.append(f"Phishing keyword '{kw_hits[0]}' found in domain")

    # ── 6. No HTTPS ───────────────────────────────────────────────────────────
    if scheme != "https":
        score += 15
        reasons.append("No HTTPS — site is not using SSL/TLS encryption")

    # ── 7. Live availability check ────────────────────────────────────────────
    try:
        r = _SESSION.get(raw, timeout=_TIMEOUT, allow_redirects=True)
        checks["status_code"]    = r.status_code
        checks["redirect_count"] = len(r.history)
        checks["ssl_valid"]      = scheme == "https"
        checks["final_domain"]   = urlparse(r.url).hostname or domain

        import re as _re
        m = _re.search(r"<title[^>]*>(.*?)</title>", r.text, _re.IGNORECASE | _re.DOTALL)
        checks["page_title"] = m.group(1).strip()[:80] if m else ""

        checks["has_login_form"] = bool(
            _re.search(r'<input[^>]+type=["\']password["\']', r.text, _re.IGNORECASE)
        )

        if r.status_code >= 500:
            score += 10
            reasons.append(f"Server returned error (HTTP {r.status_code})")

        # Title mentions a brand the domain doesn't match
        for brand in CANONICAL:
            if brand in checks["page_title"].lower() and brand not in domain:
                score += 25
                reasons.append(
                    f"Page title mentions '{brand}' but domain is unrelated — impersonation"
                )
                break

    except requests.exceptions.SSLError:
        checks["ssl_valid"] = False
        score += 25
        reasons.append("SSL certificate error — site may be fake or misconfigured")
    except requests.exceptions.ConnectionError:
        score += 50
        reasons.append("Cannot connect — website does not exist or is down")
    except requests.exceptions.Timeout:
        score += 30
        reasons.append("Website timed out — may be down or unreachable")
    except Exception as e:
        score += 20
        reasons.append(f"Could not reach website: {str(e)[:80]}")

    # ── Verdict ───────────────────────────────────────────────────────────────
    score = max(0, min(score, 100))

    if score >= 55:
        verdict = "FAKE"
        is_fake = True
    elif score >= 30:
        verdict = "SUSPICIOUS"
        is_fake = False
    else:
        verdict = "ONLINE"
        is_fake = False

    if not reasons:
        reasons.append("No suspicious signals detected — domain appears legitimate")

    return FakeCheckResult(
        is_fake=is_fake,
        confidence=score,
        verdict=verdict,
        reasons=reasons,
        checks=checks,
    )
