from pydantic import BaseModel, HttpUrl
from typing import Optional, List


class ScanRequest(BaseModel):
    target_url: str
    scan_id: int
    auth_token: Optional[str] = None


class Vulnerability(BaseModel):
    url: str
    param: Optional[str] = None
    issue: str
    severity: int           # 0-10
    cvss_score: float
    evidence: Optional[str] = None
    screenshot_url: Optional[str] = None
    cve_id: Optional[str] = None


class ScanResult(BaseModel):
    scan_id: int
    status: str
    vulnerabilities: List[Vulnerability]


class RemediationRequest(BaseModel):
    vuln_id: int
    issue: str
    url: str
    param: Optional[str] = None
    evidence: Optional[str] = None
