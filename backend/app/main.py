"""
TBI Clinic AI Platform — FastAPI Backend
Entry Point
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings
from app.api.routes import documents
from app.core.database import engine, Base
from app.middleware.audit import AuditMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.api.routes import auth, patients, documents, ai_engine, reports, users, website



# ── App Init ──────────────────────────────────────────────────
app = FastAPI(
    title="TBI Clinic AI Platform",
    description="HIPAA-Compliant AI-Assisted TBI Clinical Workflow",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,   # Disable docs in prod
    redoc_url="/redoc" if settings.DEBUG else None,
)

# ── Middleware (order matters) ─────────────────────────────────
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(AuditMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# if settings.APP_ENV == "production":
#     app.add_middleware(
#         TrustedHostMiddleware,
#         allowed_hosts=["app.yourdomain.com", "*.yourdomain.com"],
#     )

if settings.APP_ENV == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "localhost",
            "127.0.0.1",
            "*.railway.app",
            "*.up.railway.app",
            "clinic-production-6bce.up.railway.app",
        ],
    )

# ── Routers ───────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/api/v1/auth",      tags=["Authentication"])
app.include_router(users.router,      prefix="/api/v1/users",     tags=["Users"])
app.include_router(patients.router,   prefix="/api/v1/patients",  tags=["Patients"])
app.include_router(documents.router,  prefix="/api/v1/documents", tags=["Documents"])
app.include_router(ai_engine.router,  prefix="/api/v1/ai",        tags=["AI Engine"])
app.include_router(reports.router,    prefix="/api/v1/reports",   tags=["Reports"])
app.include_router(website.router,    prefix="/api/v1/website",   tags=["Website"])
app.include_router(
    documents.router,
    prefix="/api/v1/documents",
    tags=["documents"],
)

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "TBI Clinic API"}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )