# """
# Reports Routes — Physician Review, Approval, Digital Signature
# Module 4: The most critical module for physician liability protection.
# """
# import uuid
# import hashlib
# from datetime import datetime, timezone
# from typing import Optional
# from fastapi import APIRouter, Depends, HTTPException, Request
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select, update
# from pydantic import BaseModel

# from app.core.database import get_db
# from app.api.routes.auth import get_current_user
# from app.models.models import (
#     Report, AIExtraction, User, UserRole, ReportType, ReportStatus, AuditAction
# )
# from app.services.audit import log_audit_event

# router = APIRouter()


# class ReportCreate(BaseModel):
#     patient_id: str
#     extraction_id: str
#     report_type: ReportType


# class ReportEdit(BaseModel):
#     physician_edited_content: str


# class ReportApproval(BaseModel):
#     approved: bool
#     rejection_reason: Optional[str] = None


# def create_digital_signature(report_id: str, user_id: str, content: str, timestamp: str) -> str:
#     """
#     Create a cryptographic hash as a digital signature.
#     In production: use a proper PKI signing mechanism or DocuSign API.
#     """
#     payload = f"{report_id}:{user_id}:{timestamp}:{hashlib.sha256(content.encode()).hexdigest()}"
#     return hashlib.sha256(payload.encode()).hexdigest()


# @router.post("/")
# async def create_report_from_extraction(
#     request: Request,
#     body: ReportCreate,
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     # Fetch extraction
#     result = await db.execute(select(AIExtraction).where(AIExtraction.id == uuid.UUID(body.extraction_id)))
#     extraction = result.scalar_one_or_none()
#     if not extraction:
#         raise HTTPException(status_code=404, detail="Extraction not found")

#     # Build AI draft from structured data
#     ai_draft = extraction.raw_ai_output or "No AI output available."

#     report = Report(
#         patient_id=uuid.UUID(body.patient_id),
#         extraction_id=extraction.id,
#         report_type=body.report_type,
#         ai_draft=ai_draft,
#         report_status=ReportStatus.physician_review,
#     )
#     db.add(report)
#     await db.flush()

#     await log_audit_event(
#         db, current_user["id"], AuditAction.record_created,
#         resource_type="report", resource_id=report.id,
#         ip=request.client.host,
#     )

#     return {"id": str(report.id), "report_type": body.report_type.value, "status": "physician_review"}


# @router.get("/{report_id}")
# async def get_report(
#     report_id: str,
#     request: Request,
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     result = await db.execute(select(Report).where(Report.id == uuid.UUID(report_id)))
#     report = result.scalar_one_or_none()
#     if not report:
#         raise HTTPException(status_code=404, detail="Report not found")

#     await log_audit_event(
#         db, current_user["id"], AuditAction.record_viewed,
#         resource_type="report", resource_id=report.id,
#         ip=request.client.host,
#     )

#     return {
#         "id": str(report.id),
#         "patient_id": str(report.patient_id),
#         "report_type": report.report_type.value,
#         "ai_draft": report.ai_draft,
#         "physician_edited_content": report.physician_edited_content,
#         "finalized_content": report.finalized_content,
#         "report_status": report.report_status.value,
#         "digital_signature": report.digital_signature,
#         "approved_at": str(report.approved_at) if report.approved_at else None,
#     }


# @router.patch("/{report_id}/edit")
# async def edit_report(
#     report_id: str,
#     request: Request,
#     body: ReportEdit,
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     """Physician edits the AI-generated draft."""
#     if current_user.role not in [UserRole.physician, UserRole.admin]:
#         raise HTTPException(status_code=403, detail="Only physicians can edit reports")

#     result = await db.execute(select(Report).where(Report.id == uuid.UUID(report_id)))
#     report = result.scalar_one_or_none()
#     if not report:
#         raise HTTPException(status_code=404, detail="Report not found")

#     if report.report_status == ReportStatus.finalized:
#         raise HTTPException(status_code=400, detail="Cannot edit a finalized report")

#     await db.execute(
#         update(Report)
#         .where(Report.id == uuid.UUID(report_id))
#         .values(
#             physician_edited_content=body.physician_edited_content,
#             reviewed_by=current_user["id"],
#         )
#     )

#     await log_audit_event(
#         db, current_user["id"], AuditAction.record_edited,
#         resource_type="report", resource_id=uuid.UUID(report_id),
#         ip=request.client.host,
#     )

#     return {"message": "Report updated", "id": report_id}


# @router.post("/{report_id}/approve")
# async def approve_report(
#     report_id: str,
#     request: Request,
#     body: ReportApproval,
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     """Physician gives final approval with digital signature."""
#     if current_user.role not in [UserRole.physician, UserRole.admin]:
#         raise HTTPException(status_code=403, detail="Only physicians can approve reports")

#     result = await db.execute(select(Report).where(Report.id == uuid.UUID(report_id)))
#     report = result.scalar_one_or_none()
#     if not report:
#         raise HTTPException(status_code=404, detail="Report not found")

#     if not body.approved:
#         await db.execute(
#             update(Report)
#             .where(Report.id == uuid.UUID(report_id))
#             .values(report_status=ReportStatus.rejected)
#         )
#         await log_audit_event(
#             db, current_user["id"], AuditAction.report_rejected,
#             resource_type="report", resource_id=uuid.UUID(report_id),
#             ip=request.client.host,
#             details={"reason": body.rejection_reason},
#         )
#         return {"message": "Report rejected", "id": report_id}

#     # Final content is physician-edited version, or AI draft if not edited
#     final_content = report.physician_edited_content or report.ai_draft
#     approved_at = datetime.now(timezone.utc)

#     # Create digital signature
#     signature = create_digital_signature(
#         report_id=report_id,
#         user_id=str(current_user["id"]),
#         content=final_content,
#         timestamp=approved_at.isoformat(),
#     )

#     await db.execute(
#         update(Report)
#         .where(Report.id == uuid.UUID(report_id))
#         .values(
#             report_status=ReportStatus.finalized,
#             finalized_content=final_content,
#             approved_by=current_user["id"],
#             digital_signature=signature,
#             approved_at=approved_at,
#         )
#     )

#     await log_audit_event(
#         db, current_user["id"], AuditAction.report_approved,
#         resource_type="report", resource_id=uuid.UUID(report_id),
#         ip=request.client.host,
#         details={"signature": signature[:16] + "..."},
#     )

#     return {
#         "message": "Report finalized and signed",
#         "id": report_id,
#         "digital_signature": signature,
#         "approved_at": approved_at.isoformat(),
#     }


# @router.get("/patient/{patient_id}")
# async def list_patient_reports(
#     patient_id: str,
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     result = await db.execute(
#         select(Report)
#         .where(Report.patient_id == uuid.UUID(patient_id))
#         .order_by(Report.created_at.desc())
#     )
#     reports = result.scalars().all()

#     return [
#         {
#             "id": str(r.id),
#             "report_type": r.report_type.value,
#             "report_status": r.report_status.value,
#             "approved_at": str(r.approved_at) if r.approved_at else None,
#             "created_at": str(r.created_at),
#         }
#         for r in reports
#     ]

"""Reports Routes — Physician Review, Approval, Digital Signature."""
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.models import (
    AIExtraction,
    AuditAction,
    Report,
    ReportStatus,
    ReportType,
    UserRole,
)
from app.services.audit import log_audit_event

router = APIRouter()


class ReportCreate(BaseModel):
    patient_id: str
    extraction_id: str
    report_type: ReportType


class ReportEdit(BaseModel):
    physician_edited_content: str


class ReportApproval(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None


def get_current_user_id(current_user: Any):
    if isinstance(current_user, dict):
        return current_user.get("id")
    return getattr(current_user, "id", None)


def get_current_user_role(current_user: Any):
    if isinstance(current_user, dict):
        return current_user.get("role")
    return getattr(current_user, "role", None)


def require_physician_or_admin(current_user: Any):
    role = get_current_user_role(current_user)

    if role not in [UserRole.physician, UserRole.admin, "physician", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only physicians or admins can perform this action",
        )


def create_digital_signature(
    report_id: str,
    user_id: str,
    content: str,
    timestamp: str,
) -> str:
    payload = (
        f"{report_id}:{user_id}:{timestamp}:"
        f"{hashlib.sha256(content.encode()).hexdigest()}"
    )
    return hashlib.sha256(payload.encode()).hexdigest()


@router.post("/")
async def create_report_from_extraction(
    request: Request,
    body: ReportCreate,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIExtraction).where(AIExtraction.id == uuid.UUID(body.extraction_id))
    )
    extraction = result.scalar_one_or_none()

    if not extraction:
        raise HTTPException(status_code=404, detail="Extraction not found")

    report = Report(
        patient_id=uuid.UUID(body.patient_id),
        extraction_id=extraction.id,
        report_type=body.report_type,
        ai_draft=extraction.raw_ai_output or "No AI output available.",
        report_status=ReportStatus.physician_review,
    )

    db.add(report)
    await db.flush()

    await log_audit_event(
        db,
        get_current_user_id(current_user),
        AuditAction.record_created,
        resource_type="report",
        resource_id=report.id,
        ip=request.client.host if request.client else None,
    )

    return {
        "id": str(report.id),
        "report_type": body.report_type.value,
        "status": "physician_review",
    }


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    request: Request,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Report).where(Report.id == uuid.UUID(report_id)))
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    await log_audit_event(
        db,
        get_current_user_id(current_user),
        AuditAction.record_viewed,
        resource_type="report",
        resource_id=report.id,
        ip=request.client.host if request.client else None,
    )

    return {
        "id": str(report.id),
        "patient_id": str(report.patient_id),
        "report_type": report.report_type.value,
        "ai_draft": report.ai_draft,
        "physician_edited_content": report.physician_edited_content,
        "finalized_content": report.finalized_content,
        "report_status": report.report_status.value,
        "digital_signature": report.digital_signature,
        "approved_at": str(report.approved_at) if report.approved_at else None,
    }


@router.patch("/{report_id}/edit")
async def edit_report(
    report_id: str,
    request: Request,
    body: ReportEdit,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_physician_or_admin(current_user)

    result = await db.execute(select(Report).where(Report.id == uuid.UUID(report_id)))
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.report_status == ReportStatus.finalized:
        raise HTTPException(status_code=400, detail="Cannot edit a finalized report")

    user_id = get_current_user_id(current_user)

    await db.execute(
        update(Report)
        .where(Report.id == uuid.UUID(report_id))
        .values(
            physician_edited_content=body.physician_edited_content,
            reviewed_by=user_id,
        )
    )

    await log_audit_event(
        db,
        user_id,
        AuditAction.record_edited,
        resource_type="report",
        resource_id=uuid.UUID(report_id),
        ip=request.client.host if request.client else None,
    )

    return {"message": "Report updated", "id": report_id}


@router.post("/{report_id}/approve")
async def approve_report(
    report_id: str,
    request: Request,
    body: ReportApproval,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_physician_or_admin(current_user)

    result = await db.execute(select(Report).where(Report.id == uuid.UUID(report_id)))
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    user_id = get_current_user_id(current_user)

    if not body.approved:
        await db.execute(
            update(Report)
            .where(Report.id == uuid.UUID(report_id))
            .values(report_status=ReportStatus.rejected)
        )

        await log_audit_event(
            db,
            user_id,
            AuditAction.report_rejected,
            resource_type="report",
            resource_id=uuid.UUID(report_id),
            ip=request.client.host if request.client else None,
            details={"reason": body.rejection_reason},
        )

        return {"message": "Report rejected", "id": report_id}

    final_content = report.physician_edited_content or report.ai_draft or ""
    approved_at = datetime.now(timezone.utc)

    signature = create_digital_signature(
        report_id=report_id,
        user_id=str(user_id),
        content=final_content,
        timestamp=approved_at.isoformat(),
    )

    await db.execute(
        update(Report)
        .where(Report.id == uuid.UUID(report_id))
        .values(
            report_status=ReportStatus.finalized,
            finalized_content=final_content,
            approved_by=user_id,
            digital_signature=signature,
            approved_at=approved_at,
        )
    )

    await log_audit_event(
        db,
        user_id,
        AuditAction.report_approved,
        resource_type="report",
        resource_id=uuid.UUID(report_id),
        ip=request.client.host if request.client else None,
        details={"signature": signature[:16] + "..."},
    )

    return {
        "message": "Report finalized and signed",
        "id": report_id,
        "digital_signature": signature,
        "approved_at": approved_at.isoformat(),
    }


@router.get("/patient/{patient_id}")
async def list_patient_reports(
    patient_id: str,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report)
        .where(Report.patient_id == uuid.UUID(patient_id))
        .order_by(Report.created_at.desc())
    )

    reports = result.scalars().all()

    return [
        {
            "id": str(r.id),
            "report_type": r.report_type.value,
            "report_status": r.report_status.value,
            "approved_at": str(r.approved_at) if r.approved_at else None,
            "created_at": str(r.created_at),
        }
        for r in reports
    ]