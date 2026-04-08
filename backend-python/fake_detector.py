"""
Website Availability Checker
Simply checks if a website is reachable/live.
If it returns a valid HTTP response → it's UP.
If it fails to connect / returns error → show warning popup.
"""
import requests
from urllib.parse import urlparse
from typing import TypedDict

_SESSION = requests.Session()
_SESSION.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
_TIMEOUT = 8


class FakeCheckResult(TypedDict):
    is_fake: bool
    confidence: int
    verdict: str        # "ONLINE" | "OFFLINE" | "ERROR"
    reasons: list
    checks: dict


def check_fake(url: str) -> FakeCheckResult:
    raw = url.strip()
    if not raw.startswith("http"):
        raw = "https://" + raw

    parsed   = urlparse(raw)
    hostname = parsed.hostname or ""

    checks = {
        "url":          raw,
        "hostname":     hostname,
        "has_https":    parsed.scheme == "https",
        "ssl_valid":    False,
        "redirect_count": 0,
        "final_domain": hostname,
        "status_code":  None,
        "page_title":   "",
        "has_login_form": False,
    }

    try:
        r = _SESSION.get(raw, timeout=_TIMEOUT, allow_redirects=True)

        checks["status_code"]    = r.status_code
        checks["redirect_count"] = len(r.history)
        checks["final_domain"]   = urlparse(r.url).hostname or hostname
        checks["ssl_valid"]      = raw.startswith("https")

        # Try to get page title
        import re
        m = re.search(r"<title[^>]*>(.*?)</title>", r.text, re.IGNORECASE | re.DOTALL)
        checks["page_title"] = m.group(1).strip()[:80] if m else ""

        # Check for login form
        checks["has_login_form"] = bool(
            re.search(r'<input[^>]+type=["\']password["\']', r.text, re.IGNORECASE)
        )

        # Site is reachable
        if r.status_code < 500:
            return FakeCheckResult(
                is_fake=False,
                confidence=0,
                verdict="ONLINE",
                reasons=[f"Website is live and reachable (HTTP {r.status_code})"],
                checks=checks,
            )
        else:
            return FakeCheckResult(
                is_fake=False,
                confidence=50,
                verdict="ERROR",
                reasons=[f"Website returned server error (HTTP {r.status_code})"],
                checks=checks,
            )

    except requests.exceptions.SSLError:
        checks["ssl_valid"] = False
        return FakeCheckResult(
            is_fake=True,
            confidence=80,
            verdict="OFFLINE",
            reasons=["SSL certificate error — website may be fake or misconfigured"],
            checks=checks,
        )

    except requests.exceptions.ConnectionError:
        return FakeCheckResult(
            is_fake=True,
            confidence=90,
            verdict="OFFLINE",
            reasons=["Cannot connect to this website — it may not exist or is currently down"],
            checks=checks,
        )

    except requests.exceptions.Timeout:
        return FakeCheckResult(
            is_fake=True,
            confidence=70,
            verdict="OFFLINE",
            reasons=["Website did not respond within 8 seconds — it may be down or unreachable"],
            checks=checks,
        )

    except Exception as e:
        return FakeCheckResult(
            is_fake=True,
            confidence=60,
            verdict="OFFLINE",
            reasons=[f"Could not reach website: {str(e)[:100]}"],
            checks=checks,
        )
