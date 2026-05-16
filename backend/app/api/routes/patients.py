"""Patient case management routes."""
import uuid
from datetime import date
from typing import Optional, Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import Patient, CaseStatus, CasePriority, AuditAction
from app.services.audit import log_audit_event

router = APIRouter()


class PatientCreate(BaseModel):
    first_name_encrypted: str
    last_name_encrypted: str
    date_of_birth_encrypted: str
    mrn: str
    injury_date: Optional[date] = None
    priority: CasePriority = CasePriority.routine
    assigned_physician_id: Optional[str] = None
    case_notes: Optional[str] = None


class PatientUpdate(BaseModel):
    first_name_encrypted: Optional[str] = None
    last_name_encrypted: Optional[str] = None
    date_of_birth_encrypted: Optional[str] = None
    mrn: Optional[str] = None
    injury_date: Optional[date] = None
    case_status: Optional[CaseStatus] = None
    priority: Optional[CasePriority] = None
    assigned_physician_id: Optional[str] = None
    case_notes: Optional[str] = None


def get_user_id(current_user: Any):
    if isinstance(current_user, dict):
        user_id = current_user.get("id")
    else:
        user_id = getattr(current_user, "id", None)

    if isinstance(user_id, uuid.UUID):
        return user_id

    return None


def patient_response(patient: Patient):
    return {
        "id": str(patient.id),
        "first_name_encrypted": patient.first_name_encrypted,
        "last_name_encrypted": patient.last_name_encrypted,
        "date_of_birth_encrypted": patient.date_of_birth_encrypted,
        "mrn": patient.mrn,
        "case_status": patient.case_status.value,
        "priority": patient.priority.value,
        "injury_date": str(patient.injury_date) if patient.injury_date else None,
        "assigned_physician_id": str(patient.assigned_physician_id)
        if patient.assigned_physician_id
        else None,
        "case_notes": patient.case_notes,
        "created_at": str(patient.created_at),
        "updated_at": str(patient.updated_at),
    }


@router.post("/")
async def create_patient(
    body: PatientCreate,
    request: Request,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Patient).where(Patient.mrn == body.mrn))

    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="MRN already exists")

    current_user_id = get_user_id(current_user)

    patient = Patient(
        first_name_encrypted=body.first_name_encrypted,
        last_name_encrypted=body.last_name_encrypted,
        date_of_birth_encrypted=body.date_of_birth_encrypted,
        mrn=body.mrn,
        injury_date=body.injury_date,
        priority=body.priority,
        assigned_physician_id=uuid.UUID(body.assigned_physician_id)
        if body.assigned_physician_id
        else None,
        case_notes=body.case_notes,
        created_by=current_user_id,
    )

    db.add(patient)
    await db.flush()

    await log_audit_event(
        db,
        current_user_id,
        AuditAction.patient_created,
        resource_type="patient",
        resource_id=patient.id,
        ip=request.client.host if request.client else None,
    )

    await db.commit()
    await db.refresh(patient)

    return patient_response(patient)


@router.get("/")
async def list_patients(
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Patient).order_by(Patient.created_at.desc()))
    patients = result.scalars().all()

    return [patient_response(patient) for patient in patients]


@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    request: Request,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Patient).where(Patient.id == uuid.UUID(patient_id))
    )

    patient = result.scalar_one_or_none()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    current_user_id = get_user_id(current_user)

    await log_audit_event(
        db,
        current_user_id,
        AuditAction.record_viewed,
        resource_type="patient",
        resource_id=patient.id,
        ip=request.client.host if request.client else None,
    )

    await db.commit()

    return patient_response(patient)


@router.patch("/{patient_id}")
async def update_patient(
    patient_id: str,
    body: PatientUpdate,
    request: Request,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    values = body.model_dump(exclude_unset=True)

    if "assigned_physician_id" in values and values["assigned_physician_id"]:
        values["assigned_physician_id"] = uuid.UUID(values["assigned_physician_id"])

    result = await db.execute(
        select(Patient).where(Patient.id == uuid.UUID(patient_id))
    )

    patient = result.scalar_one_or_none()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if values:
        await db.execute(
            update(Patient).where(Patient.id == patient.id).values(**values)
        )

    current_user_id = get_user_id(current_user)

    await log_audit_event(
        db,
        current_user_id,
        AuditAction.record_edited,
        resource_type="patient",
        resource_id=patient.id,
        ip=request.client.host if request.client else None,
        details={"fields": list(values.keys())},
    )

    await db.commit()

    return {"message": "Patient updated", "id": patient_id}


@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: str,
    request: Request,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Patient).where(Patient.id == uuid.UUID(patient_id))
    )

    patient = result.scalar_one_or_none()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    await db.delete(patient)

    current_user_id = get_user_id(current_user)

    await log_audit_event(
        db,
        current_user_id,
        AuditAction.record_edited,
        resource_type="patient",
        resource_id=patient.id,
        ip=request.client.host if request.client else None,
        details={"deleted": True},
    )

    await db.commit()

    return {"message": "Patient deleted", "id": patient_id}