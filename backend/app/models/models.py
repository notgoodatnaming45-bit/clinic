"""
Database Models — SQLAlchemy ORM
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    String, Text, Boolean, Integer, BigInteger, Date,
    DateTime, ForeignKey, Enum as SAEnum, DECIMAL, JSON
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


# ── Enums ──────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    admin = "admin"
    physician = "physician"
    medical_assistant = "medical_assistant"
    legal_liaison = "legal_liaison"


class UserStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    pending_mfa = "pending_mfa"


class CaseStatus(str, enum.Enum):
    intake = "intake"
    processing = "processing"
    review = "review"
    finalized = "finalized"
    archived = "archived"


class CasePriority(str, enum.Enum):
    routine = "routine"
    urgent = "urgent"
    stat = "stat"


class DocType(str, enum.Enum):
    pdf = "pdf"
    dicom = "dicom"
    scan = "scan"
    lab_result = "lab_result"
    referral = "referral"
    legal = "legal"


class DocStatus(str, enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    extracted = "extracted"
    failed = "failed"


class ReportType(str, enum.Enum):
    clinical_summary = "clinical_summary"
    legal_report = "legal_report"


class ReportStatus(str, enum.Enum):
    draft = "draft"
    physician_review = "physician_review"
    approved = "approved"
    finalized = "finalized"
    rejected = "rejected"


class AuditAction(str, enum.Enum):
    record_viewed = "record_viewed"
    record_created = "record_created"
    record_edited = "record_edited"
    record_exported = "record_exported"
    document_uploaded = "document_uploaded"
    document_downloaded = "document_downloaded"
    report_approved = "report_approved"
    report_rejected = "report_rejected"
    login_success = "login_success"
    login_failed = "login_failed"
    mfa_verified = "mfa_verified"
    permission_denied = "permission_denied"
    patient_created = "patient_created"
    ai_extraction_run = "ai_extraction_run"


# ── Models ─────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=False, default=UserRole.medical_assistant)
    status: Mapped[UserStatus] = mapped_column(SAEnum(UserStatus), default=UserStatus.pending_mfa)
    mfa_secret: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    patients: Mapped[list["Patient"]] = relationship("Patient", back_populates="assigned_physician", foreign_keys="Patient.assigned_physician_id")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    first_name_encrypted: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    last_name_encrypted: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    date_of_birth_encrypted: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    mrn: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    injury_date: Mapped[Optional[datetime]] = mapped_column(
        Date,
        nullable=True,
    )
    case_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    case_status: Mapped[CaseStatus] = mapped_column(
        SAEnum(CaseStatus, name="case_status"),
        default=CaseStatus.intake,
    )

    priority: Mapped[CasePriority] = mapped_column(
        SAEnum(CasePriority, name="case_priority"),
        default=CasePriority.routine,
    )

    assigned_physician_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
    )

    assigned_physician: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="patients",
        foreign_keys=[assigned_physician_id],
    )

    documents: Mapped[list["Document"]] = relationship(
        "Document",
        back_populates="patient",
    )

    reports: Mapped[list["Report"]] = relationship(
        "Report",
        back_populates="patient",
    )

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    s3_key: Mapped[str] = mapped_column(Text, nullable=False)
    s3_bucket: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[DocType] = mapped_column(SAEnum(DocType, name="doc_type"),nullable=False,)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    checksum_sha256: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_latest_version: Mapped[bool] = mapped_column(Boolean, default=True)
    doc_status: Mapped[DocStatus] = mapped_column(SAEnum(DocStatus, name="doc_status"),nullable=False,default=DocStatus.uploaded,)
    provider_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    document_date: Mapped[Optional[datetime]] = mapped_column(Date, nullable=True)
    uploaded_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True),ForeignKey("users.id"),nullable=True,)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="documents")


class AIExtraction(Base):
    __tablename__ = "ai_extractions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    extraction_type: Mapped[str] = mapped_column(String(50), nullable=False)
    raw_ai_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    structured_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    gcs_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    injury_markers: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    symptom_progression: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    neuro_psych_results: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 4), nullable=True)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    extraction_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("ai_extractions.id"), nullable=True)
    ai_draft: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    physician_edited_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    finalized_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    digital_signature: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    patient: Mapped["Patient"] = relationship("Patient", back_populates="reports")
    report_type: Mapped[ReportType] = mapped_column(SAEnum(ReportType, name="report_type"),nullable=False,)
    report_status: Mapped[ReportStatus] = mapped_column(SAEnum(ReportStatus, name="report_status"),default=ReportStatus.draft,)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action: Mapped[AuditAction] = mapped_column(SAEnum(AuditAction, name="audit_action"),nullable=False,)
    resource_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    resource_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    details: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)