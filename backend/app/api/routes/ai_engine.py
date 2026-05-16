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