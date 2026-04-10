<<<<<<< HEAD
# OMEN — Intelligent Web Vulnerability Scanner

AI-powered DAST scanner with OpenAI remediation, OWASP ZAP + Burp Suite integration, and a real-time Next.js dashboard.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Node API | Express.js, JWT auth, Redis caching |
| Scan Engine | Python FastAPI, OWASP ZAP, Nikto |
| AI Fixes | OpenAI GPT-4o |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Infra | Docker Compose, Terraform (AWS), Kubernetes |

## Quick Start

```bash
# 1. Copy and fill in env files for each service
cp frontend/.env.example frontend/.env
cp backend-node/.env.example backend-node/.env
cp backend-python/.env.example backend-python/.env

# 2. Start everything
docker compose up --build
```

- Frontend: http://localhost:3000
- Node API: http://localhost:4000
- Python API: http://localhost:8000/docs  (Swagger UI)
- ZAP: http://localhost:8080

## Environment Variables

Each service has its own `.env.example`. Copy it to `.env` and fill in secrets.

| Service | File |
|---|---|
| Frontend (Next.js) | `frontend/.env` |
| Node API | `backend-node/.env` |
| Python Scan Engine | `backend-python/.env` |

> Never commit `.env` files. They are gitignored.

Key rules:
- `NEXT_PUBLIC_*` vars are embedded at build time and exposed to the browser.
- All other vars are server-side only.
- Secrets (JWT_SECRET, OPENAI_API_KEY, etc.) must never use `NEXT_PUBLIC_` prefix.

## Project Structure

```
omen/
├── frontend/                  # Next.js app
│   ├── src/
│   │   ├── pages/             # Dashboard, Login, Reports, Settings, Scan detail
│   │   ├── components/        # VulnTable, ScanProgress, StatsBar, Header
│   │   └── types/             # Shared TypeScript interfaces
│   └── .env.example
├── backend-node/              # Express API (auth, scan proxy, issues CRUD)
│   ├── src/
│   │   ├── routes/            # auth.js, scans.js, issues.js
│   │   ├── middleware/        # JWT auth guard
│   │   └── config/            # DB pool, Redis client, schema.sql
│   └── .env.example
├── backend-python/            # FastAPI scan engine + AI remediation
│   ├── main.py                # /scan, /scan/{id}/results, /remediate
│   ├── scan_engine.py         # ZAP REST + Burp GraphQL (async, threaded)
│   ├── ai_remediation.py      # OpenAI GPT-4o fix generation
│   ├── db.py                  # psycopg2 helpers
│   ├── schemas.py             # Pydantic models
│   └── .env.example
├── infra/
│   ├── terraform/             # AWS RDS + ElastiCache
│   └── k8s/                   # Kubernetes deployments
├── .github/workflows/         # CI/CD (lint → test → build → push)
└── docker-compose.yml
```

## Running Without Docker

```bash
# Frontend
cd frontend && npm install && npm run dev

# Node backend
cd backend-node && npm install && npm run dev

# Python backend
cd backend-python && pip install -r requirements.txt && uvicorn main:app --reload
```

## Adding a New Scanner

1. Add a new function in `backend-python/scan_engine.py` following the `_run_zap_scan` pattern.
2. Add it to `run_scan()` alongside the existing `asyncio.gather` calls.
3. Add any new env vars to `backend-python/.env.example`.

## Adding a New Frontend Page

1. Create `frontend/src/pages/your-page.tsx`.
2. Add a `<Link>` entry in `frontend/src/components/Header.tsx`.
 
FOR START 

cd C:\Users\SAGE\Desktop\PROJECTS\CLG\2nd\OMEN\omen\frontend
npm run dev

cd C:\Users\SAGE\Desktop\PROJECTS\CLG\2nd\OMEN\omen\backend-node
npm run dev

cd C:\Users\SAGE\Desktop\PROJECTS\CLG\2nd\OMEN\omen\backend-python
python -m uvicorn main:app --reload