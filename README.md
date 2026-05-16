# TBI Clinic Platform

Full-stack HIPAA-focused TBI clinic prototype with a FastAPI backend and Next.js frontend.

## Directory

```text
tbi-clinic-platform/
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py
│       ├── core/
│       ├── services/
│       ├── models/
│       ├── middleware/
│       └── api/routes/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── app/
│   ├── components/
│   └── lib/
├── docker-compose.yml
└── init_db.sql
```

## Run database services

```bash
docker compose up -d postgres redis
```

## Run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

## Run frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend: http://localhost:3000

## Notes

This is a development prototype, not a production-certified HIPAA system. Before real patient use, complete formal security review, BAA/vendor review, logging validation, encryption/key-management review, backups, access-control testing, and deployment hardening.
