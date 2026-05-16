"""Website API — HIPAA-compliant contact form"""
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()


class ContactForm(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    # Do NOT collect PHI on the public contact form


@router.post("/contact")
async def submit_contact(body: ContactForm):
    """
    Public contact form submission.
    In production: send notification email via SendGrid.
    Note: This form does NOT collect PHI — it routes to scheduling only.
    """
    # TODO: Send email via SendGrid
    return {"status": "received", "message": "We'll be in touch within 1 business day."}


@router.get("/resources")
async def get_resources():
    """Educational TBI resources for the public website."""
    return {
        "resources": [
            {
                "title": "Understanding Traumatic Brain Injury",
                "category": "Patient Education",
                "url": "https://www.brainline.org",
            },
            {
                "title": "Concussion Recovery Guidelines",
                "category": "Recovery",
                "url": "https://www.cdc.gov/heads-up",
            },
            {
                "title": "Brain Injury Association of America",
                "category": "Support",
                "url": "https://www.biausa.org",
            },
        ]
    }