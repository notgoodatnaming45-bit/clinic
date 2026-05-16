# """
# AI Engine Routes — Extraction trigger, status, results
# """
# import uuid
# from fastapi import APIRouter, Depends, HTTPException, Request
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select
# from pydantic import BaseModel

# from app.core.database import get_db
# from app.api.routes.auth import get_current_user
# from app.models.models import Patient, Document, AIExtraction, User, AuditAction
# from app.services.audit import log_audit_event
# from app.services.ai_service import extract_clinical_summary, extract_legal_report

# router = APIRouter()


# class ExtractionRequest(BaseModel):
#     patient_id: str
#     document_id: str
#     extraction_type: str    # "clinical_summary" | "legal_report"


# @router.post("/extract")
# async def trigger_extraction(
#     request: Request,
#     body: ExtractionRequest,
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     # Fetch patient and document
#     patient_result = await db.execute(select(Patient).where(Patient.id == uuid.UUID(body.patient_id)))
#     patient = patient_result.scalar_one_or_none()
#     if not patient:
#         raise HTTPException(status_code=404, detail="Patient not found")

#     doc_result = await db.execute(select(Document).where(Document.id == uuid.UUID(body.document_id)))
#     doc = doc_result.scalar_one_or_none()
#     if not doc:
#         raise HTTPException(status_code=404, detail="Document not found")

#     # In production: download document from S3 and run OCR
#     # For now, placeholder text extraction
#     document_text = f"[Document: {doc.filename}] — Connect OCR pipeline to extract text from S3 document"

#     # Run AI extraction
#     if body.extraction_type == "clinical_summary":
#         result = await extract_clinical_summary(document_text, patient.mrn)
#     elif body.extraction_type == "legal_report":
#         result = await extract_legal_report(document_text, patient.mrn)
#     else:
#         raise HTTPException(status_code=400, detail="extraction_type must be 'clinical_summary' or 'legal_report'")

#     # Save extraction
#     extraction = AIExtraction(
#         patient_id=patient.id,
#         document_id=doc.id,
#         extraction_type=body.extraction_type,
#         raw_ai_output=result["raw_output"],
#         structured_data=result["structured_data"],
#         model_version=result["model_version"],
#         tokens_used=result["tokens_used"],
#     )
#     db.add(extraction)
#     await db.flush()

#     await log_audit_event(
#         db, current_user.id, AuditAction.ai_extraction_run,
#         resource_type="ai_extraction", resource_id=extraction.id,
#         ip=request.client.host,
#         details={"extraction_type": body.extraction_type, "tokens": result["tokens_used"]}
#     )

#     return {
#         "extraction_id": str(extraction.id),
#         "extraction_type": body.extraction_type,
#         "structured_data": result["structured_data"],
#         "tokens_used": result["tokens_used"],
#         "model_version": result["model_version"],
#         "status": "complete",
#     }


# @router.get("/extractions/{patient_id}")
# async def list_extractions(
#     patient_id: str,
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db),
# ):
#     result = await db.execute(
#         select(AIExtraction)
#         .where(AIExtraction.patient_id == uuid.UUID(patient_id))
#         .order_by(AIExtraction.created_at.desc())
#     )
#     extractions = result.scalars().all()

#     return [
#         {
#             "id": str(e.id),
#             "extraction_type": e.extraction_type,
#             "model_version": e.model_version,
#             "tokens_used": e.tokens_used,
#             "created_at": str(e.created_at),
#         }
#         for e in extractions
#     ]

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()


class AIAnalyzeRequest(BaseModel):
    patient_id: str
    patient_name: str
    analysis_type: str
    documents: List[dict]


class AIAnalyzeResponse(BaseModel):
    patient_id: str
    patient_name: str
    analysis_type: str
    generated_at: str
    summary: str
    findings: List[str]
    missing_information: List[str]
    recommendations: List[str]
    review_required: bool


def detect_findings(text: str) -> List[str]:
    lower = text.lower()

    checks = {
        "Headache": ["headache", "migraine"],
        "Dizziness": ["dizziness", "dizzy", "vertigo"],
        "Memory Issues": ["memory", "recall", "forgetful"],
        "Sleep Disturbance": ["sleep", "insomnia", "fatigue"],
        "Loss of Consciousness": ["loss of consciousness", "unconscious", "loc"],
        "Nausea": ["nausea", "vomiting"],
        "Vision Problems": ["vision", "blurred", "photophobia"],
        "Cognitive Symptoms": ["confusion", "brain fog", "concentration"],
        "Imaging Reference": ["mri", "ct", "radiology", "imaging"],
        "Legal / Claim Reference": ["attorney", "claim", "insurance", "workers compensation"],
    }

    return [
        label
        for label, words in checks.items()
        if any(word in lower for word in words)
    ]


@router.post("/analyze", response_model=AIAnalyzeResponse)
async def analyze_documents(payload: AIAnalyzeRequest):
    combined_text = "\n\n".join(
        doc.get("extractedText", "") or doc.get("extracted_text", "")
        for doc in payload.documents
    ).strip()

    findings = detect_findings(combined_text)

    missing = []
    if "mri" not in combined_text.lower() and "ct" not in combined_text.lower():
        missing.append("No imaging reference found.")
    if "injury" not in combined_text.lower():
        missing.append("Injury mechanism/date details may be missing.")
    if "neuropsych" not in combined_text.lower():
        missing.append("No neuropsychological evaluation reference found.")
    if not combined_text:
        missing.append("No extracted document text was provided.")

    summary = (
        f"{payload.analysis_type} generated for {payload.patient_name}. "
        f"{len(payload.documents)} document(s) reviewed. "
        f"{len(findings)} relevant clinical/legal marker(s) detected. "
        "This is an AI-assisted draft and requires physician review."
    )

    recommendations = [
        "Physician should verify all extracted findings against source documents.",
        "Do not finalize report until unsupported claims are removed.",
        "Attach relevant imaging, ER notes, and neuropsychological records if available.",
        "Send this analysis to Physician Review before report generation.",
    ]

    return AIAnalyzeResponse(
        patient_id=payload.patient_id,
        patient_name=payload.patient_name,
        analysis_type=payload.analysis_type,
        generated_at=datetime.utcnow().isoformat(),
        summary=summary,
        findings=findings,
        missing_information=missing,
        recommendations=recommendations,
        review_required=True,
    )