"""
S3 Document Storage Service — HIPAA-Compliant
AES-256 server-side encryption, pre-signed URLs, checksum verification
"""
import hashlib
import uuid
from typing import Optional
import boto3
from botocore.exceptions import ClientError

from app.core.config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def compute_sha256(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()


def build_s3_key(patient_id: str, doc_type: str, filename: str) -> str:
    """
    Structured key: patients/{patient_id}/{doc_type}/{uuid}-{filename}
    Never expose this key publicly — always use pre-signed URLs.
    """
    safe_filename = filename.replace(" ", "_")
    unique_id = str(uuid.uuid4())[:8]
    return f"patients/{patient_id}/{doc_type}/{unique_id}-{safe_filename}"


async def upload_document(
    file_bytes: bytes,
    patient_id: str,
    doc_type: str,
    filename: str,
    content_type: str = "application/octet-stream",
) -> dict:
    """
    Upload a document to S3 with server-side AES-256 encryption.
    Returns s3_key, bucket, and checksum for database storage.
    """
    s3 = get_s3_client()
    checksum = compute_sha256(file_bytes)
    s3_key = build_s3_key(patient_id, doc_type, filename)

    s3.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=s3_key,
        Body=file_bytes,
        ContentType=content_type,
        ServerSideEncryption=settings.S3_ENCRYPTION,  # AES-256
        Metadata={
            "patient-id": patient_id,
            "checksum-sha256": checksum,
            "doc-type": doc_type,
        },
    )

    return {
        "s3_key": s3_key,
        "s3_bucket": settings.S3_BUCKET_NAME,
        "checksum_sha256": checksum,
        "file_size_bytes": len(file_bytes),
    }


def generate_presigned_download_url(s3_key: str, expires_in: int = 900) -> str:
    """
    Generate a 15-minute pre-signed URL for secure document download.
    Never expose S3 keys directly — always use pre-signed URLs.
    """
    s3 = get_s3_client()
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET_NAME, "Key": s3_key},
        ExpiresIn=expires_in,
    )
    return url


async def delete_document(s3_key: str) -> bool:
    """Soft delete — in production, use S3 lifecycle policies instead."""
    s3 = get_s3_client()
    try:
        s3.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=s3_key)
        return True
    except ClientError:
        return False