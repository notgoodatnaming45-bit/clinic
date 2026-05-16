# """Document upload and patient document routes."""
# import hashlib
# import os
# import uuid
# from datetime import datetime, date
# from typing import Optional, Any

# from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
# from pydantic import BaseModel
# from sqlalchemy import select
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.core.database import get_db
# from app.api.routes.auth import get_current_user
# from app.models.models import Document, Patient, DocType, DocStatus

# router = APIRouter()

# STORAGE_DIR = "storage/documents"


# class DocumentResponse(BaseModel):
#     id: str
#     patient_id: str
#     filename: str
#     file_type: str
#     file_size_bytes: Optional[int]
#     doc_status: str
#     provider_name: Optional[str]
#     document_date: Optional[str]
#     created_at: str


# def get_user_id(current_user: Any):
#     if isinstance(current_user, dict):
#         user_id = current_user.get("id")
#     else:
#         user_id = getattr(current_user, "id", None)

#     if isinstance(user_id, uuid.UUID):
#         return user_id

#     return None


# def guess_doc_type(filename: str) -> DocType:
#     lower = filename.lower()

#     if lower.endswith(".pdf"):
#         return DocType.pdf
#     if lower.endswith(".dcm"):
#         return DocType.dicom
#     if lower.endswith((".png", ".jpg", ".jpeg", ".tif", ".tiff")):
#         return DocType.scan
#     if "lab" in lower:
#         return DocType.lab_result
#     if "legal" in lower or "claim" in lower:
#         return DocType.legal

#     return DocType.referral


# @router.post("/upload", response_model=DocumentResponse)
# async def upload_document(
#     patient_id: str = Form(...),
#     provider_name: Optional[str] = Form(None),
#     document_date: Optional[date] = Form(None),
#     file: UploadFile = File(...),
#     current_user: Any = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     result = await db.execute(
#         select(Patient).where(Patient.id == uuid.UUID(patient_id))
#     )
#     patient = result.scalar_one_or_none()

#     if not patient:
#         raise HTTPException(status_code=404, detail="Patient not found")

#     contents = await file.read()

#     if not contents:
#         raise HTTPException(status_code=400, detail="Empty file")

#     checksum = hashlib.sha256(contents).hexdigest()
#     extension = os.path.splitext(file.filename or "")[1]
#     stored_name = f"{uuid.uuid4()}{extension}"

#     os.makedirs(STORAGE_DIR, exist_ok=True)

#     storage_path = os.path.join(STORAGE_DIR, stored_name)

#     with open(storage_path, "wb") as f:
#         f.write(contents)

#     current_user_id = get_user_id(current_user)

#     document = Document(
#         patient_id=patient.id,
#         filename=file.filename or stored_name,
#         s3_key=storage_path,
#         s3_bucket="local-dev-storage",
#         file_type=guess_doc_type(file.filename or ""),
#         file_size_bytes=len(contents),
#         checksum_sha256=checksum,
#         doc_status=DocStatus.uploaded,
#         provider_name=provider_name,
#         document_date=document_date,
#         uploaded_by=current_user_id,
#     )

#     db.add(document)
#     await db.commit()
#     await db.refresh(document)

#     return DocumentResponse(
#         id=str(document.id),
#         patient_id=str(document.patient_id),
#         filename=document.filename,
#         file_type=document.file_type.value,
#         file_size_bytes=document.file_size_bytes,
#         doc_status=document.doc_status.value,
#         provider_name=document.provider_name,
#         document_date=str(document.document_date) if document.document_date else None,
#         created_at=str(document.created_at),
#     )


# @router.get("/patient/{patient_id}", response_model=list[DocumentResponse])
# async def get_patient_documents(
#     patient_id: str,
#     current_user: Any = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     result = await db.execute(
#         select(Document)
#         .where(Document.patient_id == uuid.UUID(patient_id))
#         .order_by(Document.created_at.desc())
#     )

#     documents = result.scalars().all()

#     return [
#         DocumentResponse(
#             id=str(doc.id),
#             patient_id=str(doc.patient_id),
#             filename=doc.filename,
#             file_type=doc.file_type.value,
#             file_size_bytes=doc.file_size_bytes,
#             doc_status=doc.doc_status.value,
#             provider_name=doc.provider_name,
#             document_date=str(doc.document_date) if doc.document_date else None,
#             created_at=str(doc.created_at),
#         )
#         for doc in documents
#     ]

"""Document upload, listing, and download routes."""
import hashlib
import mimetypes
import os
import uuid
from datetime import date
from typing import Optional, Any
import fitz
import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import (
    Document,
    Patient,
    DocType,
    DocStatus,
    AIExtraction,
    Report,
    ReportType,
    ReportStatus,
)
from app.services.ai_service import (
    extract_clinical_summary,
    extract_legal_report,
)

router = APIRouter()

STORAGE_DIR = "storage/documents"


class DocumentResponse(BaseModel):
    id: str
    patient_id: str
    filename: str
    file_type: str
    file_size_bytes: Optional[int]
    doc_status: str
    provider_name: Optional[str]
    document_date: Optional[str]
    created_at: str

def extract_text_from_pdf(path: str) -> str:
    text_parts = []

    with fitz.open(path) as pdf:
        for page in pdf:
            text_parts.append(page.get_text())

    return "\n".join(text_parts).strip()

def get_user_id(current_user: Any):
    if isinstance(current_user, dict):
        user_id = current_user.get("id")
    else:
        user_id = getattr(current_user, "id", None)

    if isinstance(user_id, uuid.UUID):
        return user_id

    return None


def guess_doc_type(filename: str) -> DocType:
    lower = filename.lower()

    if lower.endswith(".pdf"):
        return DocType.pdf
    if lower.endswith(".dcm"):
        return DocType.dicom
    if lower.endswith((".png", ".jpg", ".jpeg", ".tif", ".tiff")):
        return DocType.scan
    if "lab" in lower:
        return DocType.lab_result
    if "legal" in lower or "claim" in lower:
        return DocType.legal

    return DocType.referral


def document_response(doc: Document) -> DocumentResponse:
    return DocumentResponse(
        id=str(doc.id),
        patient_id=str(doc.patient_id),
        filename=doc.filename,
        file_type=doc.file_type.value,
        file_size_bytes=doc.file_size_bytes,
        doc_status=doc.doc_status.value,
        provider_name=doc.provider_name,
        document_date=str(doc.document_date) if doc.document_date else None,
        created_at=str(doc.created_at),
    )


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    patient_id: str = Form(...),
    provider_name: Optional[str] = Form(None),
    document_date: Optional[date] = Form(None),
    file: UploadFile = File(...),
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Patient).where(Patient.id == uuid.UUID(patient_id))
    )
    patient = result.scalar_one_or_none()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    contents = await file.read()

    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    checksum = hashlib.sha256(contents).hexdigest()
    extension = os.path.splitext(file.filename or "")[1]
    stored_name = f"{uuid.uuid4()}{extension}"

    os.makedirs(STORAGE_DIR, exist_ok=True)

    storage_path = os.path.join(STORAGE_DIR, stored_name)

    with open(storage_path, "wb") as f:
        f.write(contents)

    current_user_id = get_user_id(current_user)

    document = Document(
        patient_id=patient.id,
        filename=file.filename or stored_name,
        s3_key=storage_path,
        s3_bucket="local-dev-storage",
        file_type=guess_doc_type(file.filename or ""),
        file_size_bytes=len(contents),
        checksum_sha256=checksum,
        doc_status=DocStatus.uploaded,
        provider_name=provider_name,
        document_date=document_date,
        uploaded_by=current_user_id,
    )

    db.add(document)
    await db.commit()
    await db.refresh(document)

    return document_response(document)


@router.get("/patient/{patient_id}", response_model=list[DocumentResponse])
async def get_patient_documents(
    patient_id: str,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document)
        .where(Document.patient_id == uuid.UUID(patient_id))
        .order_by(Document.created_at.desc())
    )

    documents = result.scalars().all()

    return [document_response(doc) for doc in documents]


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == uuid.UUID(document_id))
    )

    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(document.s3_key):
        raise HTTPException(status_code=404, detail="File missing from storage")

    media_type, _ = mimetypes.guess_type(document.filename)

    return FileResponse(
        path=document.s3_key,
        filename=document.filename,
        media_type=media_type or "application/octet-stream",
        content_disposition_type="inline",
    )

@router.post("/{document_id}/extract-text")
async def extract_document_text(
    document_id: str,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == uuid.UUID(document_id))
    )

    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(document.s3_key):
        raise HTTPException(status_code=404, detail="File missing from storage")

    if document.file_type != DocType.pdf:
        raise HTTPException(
            status_code=400,
            detail="Text extraction currently supports PDF only",
        )

    text = extract_text_from_pdf(document.s3_key)

    if not text:
        return {
            "document_id": str(document.id),
            "filename": document.filename,
            "text": "",
            "message": "No readable text found. This may be a scanned PDF and will require OCR.",
        }

    return {
        "document_id": str(document.id),
        "filename": document.filename,
        "text": text[:15000],
        "characters": len(text),
    }
@router.post("/{document_id}/analyze-clinical")
async def analyze_document_clinical(
    document_id: str,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == uuid.UUID(document_id))
    )

    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(document.s3_key):
        raise HTTPException(status_code=404, detail="File missing from storage")

    if document.file_type != DocType.pdf:
        raise HTTPException(
            status_code=400,
            detail="Clinical analysis currently supports PDF only",
        )

    text = extract_text_from_pdf(document.s3_key)

    if not text:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in document",
        )

    patient_result = await db.execute(
        select(Patient).where(Patient.id == document.patient_id)
    )

    patient = patient_result.scalar_one_or_none()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    try:
        ai_result = await extract_clinical_summary(
            document_text=text,
            patient_mrn=patient.mrn,
        )
    except Exception as e:
        ai_result = {
            "error": "AI service failed",
            "detail": str(e),
            "extraction_type": "clinical_summary",
            "structured_data": {
                "message": "Text extraction worked, but Azure OpenAI is not configured yet.",
                "preview": text[:1200],
            },
        }

    extraction = AIExtraction(
    patient_id=patient.id,
    document_id=document.id,
    extraction_type="clinical_summary",
    raw_ai_output=json.dumps(ai_result),
    structured_data=ai_result,
    model_version="azure-openai",
    )

    db.add(extraction)
    await db.flush()

    report = Report(
    patient_id=patient.id,
    extraction_id=extraction.id,
    report_type=ReportType.clinical_summary,
    ai_draft=json.dumps(ai_result, indent=2),
    report_status=ReportStatus.physician_review,
    )

    db.add(report)

    await db.commit()
    await db.refresh(extraction)
    await db.refresh(report)

    return {
        "document_id": str(document.id),
        "filename": document.filename,
        "patient_mrn": patient.mrn,
        "analysis": ai_result,
        "extraction_id": str(extraction.id),
        "report_id": str(report.id),
    }

@router.post("/{document_id}/analyze-legal")
async def analyze_document_legal(
    document_id: str,
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == uuid.UUID(document_id))
    )

    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(document.s3_key):
        raise HTTPException(status_code=404, detail="File missing from storage")

    if document.file_type != DocType.pdf:
        raise HTTPException(
            status_code=400,
            detail="Legal analysis currently supports PDF only",
        )

    text = extract_text_from_pdf(document.s3_key)

    if not text:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in document",
        )

    patient_result = await db.execute(
        select(Patient).where(Patient.id == document.patient_id)
    )

    patient = patient_result.scalar_one_or_none()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    try:
        ai_result = await extract_legal_report(
            document_text=text,
            patient_mrn=patient.mrn,
        )
    except Exception as e:
        ai_result = {
            "error": "AI service failed",
            "detail": str(e),
            "extraction_type": "legal_report",
            "structured_data": {
                "message": "Text extraction worked, but Azure OpenAI is not configured yet.",
                "preview": text[:1200],
            },
        }


    extraction = AIExtraction(
    patient_id=patient.id,
    document_id=document.id,
    extraction_type="clinical_summary",
    raw_ai_output=json.dumps(ai_result),
    structured_data=ai_result,
    model_version="azure-openai",
    )

    db.add(extraction)
    await db.flush()

    report = Report(
    patient_id=patient.id,
    extraction_id=extraction.id,
    report_type=ReportType.clinical_summary,
    ai_draft=json.dumps(ai_result, indent=2),
    report_status=ReportStatus.physician_review,
    )

    db.add(report)

    await db.commit()
    await db.refresh(extraction)
    await db.refresh(report)

    return {
        "document_id": str(document.id),
        "filename": document.filename,
        "patient_mrn": patient.mrn,
        "analysis": ai_result,
        "extraction_id": str(extraction.id),
        "report_id": str(report.id),
    }