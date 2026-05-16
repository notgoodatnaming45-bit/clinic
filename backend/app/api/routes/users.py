"""Users management routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import User, UserRole, UserStatus
from app.core.security import hash_password, validate_password_strength

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    password: str


@router.post("/")
async def create_user(
    body: UserCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only")

    if not validate_password_strength(body.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be 12+ chars with uppercase, lowercase, digit, and special character"
        )

    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
        status=UserStatus.pending_mfa,
    )
    db.add(user)
    await db.flush()

    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "status": "pending_mfa — user must set up authenticator app"
    }


@router.get("/")
async def list_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only")

    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value,
            "status": u.status.value,
            "mfa_enabled": u.mfa_enabled,
            "last_login": str(u.last_login) if u.last_login else None,
        }
        for u in users
    ]