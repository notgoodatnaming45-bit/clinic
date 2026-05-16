"""
AI Engine Service — Azure OpenAI Clinical Extraction
Handles: OCR text → Clinical Summary | Legal Report generation
HIPAA: No patient data sent to public models. Azure OpenAI with BAA only.
"""
import json
from typing import Optional
from openai import AzureOpenAI

from app.core.config import settings


# ── Azure OpenAI Client (HIPAA-eligible) ───────────────────────
def get_ai_client() -> AzureOpenAI:
    return AzureOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )


# ── System Prompts ─────────────────────────────────────────────

CLINICAL_SYSTEM_PROMPT = """
You are a clinical documentation assistant for a TBI (Traumatic Brain Injury) specialty clinic.
Your role is to extract and synthesize key clinical information from medical records.

CRITICAL RULES:
1. Extract ONLY information explicitly present in the documents. Do NOT infer or fabricate.
2. Flag any ambiguous or unclear information with [NEEDS PHYSICIAN REVIEW].
3. Always output structured JSON matching the schema provided.
4. You are a COPILOT — a physician must review and approve all output before use.

Focus on:
- Glasgow Coma Scale (GCS) scores
- Loss of consciousness duration
- Post-traumatic amnesia
- Symptom timeline and progression  
- Neuroimaging findings
- Neuropsychological test results
- Current functional impairments
"""

LEGAL_SYSTEM_PROMPT = """
You are a medical-legal documentation assistant for a TBI specialty clinic.
Your role is to extract information relevant to legal causality and impairment assessment.

CRITICAL RULES:
1. Extract ONLY information explicitly present in the documents. Do NOT infer or fabricate.
2. Flag any ambiguous or unclear information with [NEEDS PHYSICIAN REVIEW].
3. Always output structured JSON matching the schema provided.
4. You are a COPILOT — a physician must review and approve all output before use.
5. Focus on causal relationships, functional impairments, and prognosis.

Focus on:
- Mechanism of injury and causation
- Objective injury markers linked to date of incident
- Degree of impairment (cognitive, physical, vocational)
- Prognosis and permanency
- Treatment necessity and future care needs
"""


# ── Extraction Functions ───────────────────────────────────────

async def extract_clinical_summary(document_text: str, patient_mrn: str) -> dict:
    """
    Generate a clinical summary from extracted document text.
    Returns structured JSON for the physician review interface.
    """
    client = get_ai_client()

    output_schema = {
        "gcs_score": "integer or null",
        "loss_of_consciousness": {"occurred": "bool", "duration_minutes": "int or null"},
        "post_traumatic_amnesia": {"occurred": "bool", "duration": "string or null"},
        "injury_markers": ["list of clinical findings"],
        "symptom_progression": [{"date": "YYYY-MM-DD", "symptoms": ["list"]}],
        "neuroimaging_findings": ["list of findings"],
        "neuro_psych_results": {"tests": [{"name": "string", "score": "string", "interpretation": "string"}]},
        "current_impairments": ["list"],
        "narrative_summary": "string — 2-3 paragraph clinical synthesis",
        "flags_for_review": ["items needing physician attention"],
        "confidence_notes": "string — areas of uncertainty"
    }

    prompt = f"""
    Analyze the following medical records and extract clinical information.
    Patient Reference: {patient_mrn} (use this ID only, not any PII from documents)
    
    OUTPUT SCHEMA (respond ONLY with valid JSON, no preamble):
    {json.dumps(output_schema, indent=2)}
    
    MEDICAL RECORD TEXT:
    {document_text[:12000]}  
    """

    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=[
            {"role": "system", "content": CLINICAL_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,  # Low temperature for factual extraction
        max_tokens=3000,
        response_format={"type": "json_object"},
    )

    raw_output = response.choices[0].message.content
    tokens_used = response.usage.total_tokens

    try:
        structured = json.loads(raw_output)
    except json.JSONDecodeError:
        structured = {"error": "Failed to parse AI output", "raw": raw_output}

    return {
        "raw_output": raw_output,
        "structured_data": structured,
        "tokens_used": tokens_used,
        "model_version": settings.AZURE_OPENAI_DEPLOYMENT,
        "extraction_type": "clinical_summary",
    }


async def extract_legal_report(document_text: str, patient_mrn: str) -> dict:
    """
    Generate a medical-legal report from extracted document text.
    Returns structured JSON for attorney-facing reporting.
    """
    client = get_ai_client()

    output_schema = {
        "mechanism_of_injury": "string",
        "causation_analysis": "string — connects injury mechanism to documented findings",
        "objective_injury_markers": ["list with dates"],
        "functional_impairments": {
            "cognitive": ["list"],
            "physical": ["list"],
            "vocational": ["list"],
            "activities_of_daily_living": ["list"],
        },
        "prognosis": {"permanency": "string", "expected_recovery": "string"},
        "future_care_needs": ["list of anticipated treatments/costs"],
        "legal_summary": "string — 2-3 paragraph attorney-facing narrative",
        "flags_for_review": ["items needing physician attention"],
        "confidence_notes": "string"
    }

    prompt = f"""
    Analyze the following medical records for medical-legal reporting purposes.
    Patient Reference: {patient_mrn}
    
    OUTPUT SCHEMA (respond ONLY with valid JSON, no preamble):
    {json.dumps(output_schema, indent=2)}
    
    MEDICAL RECORD TEXT:
    {document_text[:12000]}
    """

    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=[
            {"role": "system", "content": LEGAL_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        max_tokens=3000,
        response_format={"type": "json_object"},
    )

    raw_output = response.choices[0].message.content
    tokens_used = response.usage.total_tokens

    try:
        structured = json.loads(raw_output)
    except json.JSONDecodeError:
        structured = {"error": "Failed to parse AI output", "raw": raw_output}

    return {
        "raw_output": raw_output,
        "structured_data": structured,
        "tokens_used": tokens_used,
        "model_version": settings.AZURE_OPENAI_DEPLOYMENT,
        "extraction_type": "legal_report",
    }