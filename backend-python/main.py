import os
import asyncio
import time
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from schemas import ScanRequest, RemediationRequest
from scan_engine import run_scan, get_scan_progress
from ai_remediation import generate_fix
from db import save_vulnerabilities, update_scan_status, get_vulnerabilities, init_db, get_scan_meta
from report_generator import generate_pdf
from fake_detector import check_fake

app = FastAPI(title="OMEN Scanner API", version="0.1.0")

@app.on_event("startup")
def on_startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/scan", status_code=202)
async def start_scan(req: ScanRequest, background_tasks: BackgroundTasks):
    update_scan_status(req.scan_id, "running")
    background_tasks.add_task(_run_scan_task, req)
    return {"scan_id": req.scan_id, "status": "running"}


async def _run_scan_task(req: ScanRequest):
    start = time.time()
    try:
        vulns = await run_scan(req.target_url, req.scan_id)
        save_vulnerabilities(req.scan_id, vulns)
        duration = round(time.time() - start, 1)
        update_scan_status(req.scan_id, "completed", duration)
        _generate_and_save_report(req.scan_id, req.target_url, vulns)
    except Exception as e:
        print(f"Scan {req.scan_id} failed: {e}")
        update_scan_status(req.scan_id, "failed", round(time.time() - start, 1))


def _generate_and_save_report(scan_id: int, target_url: str, vulns: list):
    try:
        pdf_bytes = generate_pdf(scan_id, target_url, vulns)
        reports_dir = os.path.join(os.path.dirname(__file__), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        path = os.path.join(reports_dir, f"scan_{scan_id}.pdf")
        with open(path, "wb") as f:
            f.write(pdf_bytes)
        print(f"Report saved: {path}")
    except Exception as e:
        print(f"Report generation failed for scan {scan_id}: {e}")


@app.get("/scan/{scan_id}/results")
def get_results(scan_id: int):
    vulns = get_vulnerabilities(scan_id)
    if vulns is None:
        raise HTTPException(status_code=404, detail="Scan not found")
    return vulns


@app.get("/scan/{scan_id}/progress")
def get_progress(scan_id: int):
    return get_scan_progress(scan_id)


@app.get("/scan/{scan_id}/report")
def download_report(scan_id: int):
    """Download the PDF report for a scan. Generates on-demand if not cached."""
    # try cached file first
    reports_dir = os.path.join(os.path.dirname(__file__), "reports")
    path = os.path.join(reports_dir, f"scan_{scan_id}.pdf")

    if not os.path.exists(path):
        # generate on demand
        meta = get_scan_meta(scan_id)
        if not meta:
            raise HTTPException(status_code=404, detail="Scan not found")
        vulns = get_vulnerabilities(scan_id) or []
        pdf_bytes = generate_pdf(scan_id, meta["target"], vulns)
        os.makedirs(reports_dir, exist_ok=True)
        with open(path, "wb") as f:
            f.write(pdf_bytes)
    else:
        with open(path, "rb") as f:
            pdf_bytes = f.read()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="omen-scan-{scan_id}.pdf"'},
    )


@app.post("/remediate")
async def remediate(req: RemediationRequest):
    fix = await generate_fix(req)
    return {"vuln_id": req.vuln_id, "ai_fix": fix}


@app.post("/check-fake")
def check_fake_website(payload: dict):
    url = payload.get("url", "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="url is required")
    result = check_fake(url)
    return result
