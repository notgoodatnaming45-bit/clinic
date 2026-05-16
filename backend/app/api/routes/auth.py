"""Authentication routes."""
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12

DEV_ADMIN_ID = os.getenv(
    "DEV_ADMIN_ID",
    "11111111-1111-1111-1111-111111111111",
)

DEV_ADMIN_EMAIL = os.getenv("DEV_ADMIN_EMAIL", "admin@ruf.ai")
DEV_ADMIN_PASSWORD = os.getenv("DEV_ADMIN_PASSWORD", "admin123")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, stored_password: str):
    # Dev fallback: compare plain text env password.
    # Later we will replace this with database hashed passwords.
    return plain_password == stored_password


async def get_current_user(token: str = Depends(oauth2_scheme)):
    if token == "dev-token":
        return {
            "id": uuid.UUID(DEV_ADMIN_ID),
            "name": "Admin User",
            "email": DEV_ADMIN_EMAIL,
            "role": "admin",
        }

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role", "admin")
        name = payload.get("name", "Admin User")

        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        return {
            "id": uuid.UUID(user_id),
            "name": name,
            "email": email,
            "role": role,
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    email = form_data.username
    password = form_data.password

    if email != DEV_ADMIN_EMAIL or not verify_password(password, DEV_ADMIN_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(
        {
            "sub": DEV_ADMIN_ID,
            "email": DEV_ADMIN_EMAIL,
            "name": "Admin User",
            "role": "admin",
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": DEV_ADMIN_ID,
            "name": "Admin User",
            "email": DEV_ADMIN_EMAIL,
            "role": "admin",
        },
    }


@router.get("/me")
async def me(current_user: Any = Depends(get_current_user)):
    return current_user



# from fastapi import APIRouter, Depends
# from fastapi.security import OAuth2PasswordBearer

# router = APIRouter()

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     return {
#         "id": 1,
#         "name": "Admin User",
#         "email": "admin@ruf.ai",
#         "role": "admin"
#     }

# @router.post("/login")
# async def login():
#     return {
#         "access_token": "dev-token",
#         "token_type": "bearer",
#         "user": {
#             "id": 1,
#             "name": "Admin User",
#             "email": "admin@ruf.ai",
#             "role": "admin"
#         }
#     }








# from fastapi import APIRouter

# router = APIRouter()

# @router.post("/login")
# async def login():
#     return {
#         "access_token": "dev-token",
#         "token_type": "bearer",
#         "user": {
#             "id": 1,
#             "name": "Admin User",
#             "email": "admin@ruf.ai",
#             "role": "admin"
#         }
#     }




# """
# Authentication Routes — Login, MFA Setup, Token Refresh
# """
# from fastapi import APIRouter, Depends, HTTPException, status, Request
# from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select
# from datetime import datetime, timezone
# from pydantic import BaseModel, EmailStr

# from app.core.database import get_db
# from app.core.security import (
#     verify_password, create_access_token, decode_token,
#     generate_mfa_secret, generate_mfa_qr_base64, verify_totp
# )
# from app.models.models import User, UserStatus, AuditLog, AuditAction
# from app.services.audit import log_audit_event

# router = APIRouter()
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# # ── Schemas ────────────────────────────────────────────────────

# class LoginResponse(BaseModel):
#     access_token: str
#     token_type: str = "bearer"
#     requires_mfa: bool
#     user_role: str


# class MFAVerifyRequest(BaseModel):
#     temp_token: str
#     totp_code: str


# class MFASetupResponse(BaseModel):
#     qr_code_base64: str
#     secret: str


# # ── Dependencies ───────────────────────────────────────────────

# async def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: AsyncSession = Depends(get_db)
# ) -> User:
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = decode_token(token)
#         user_id: str = payload.get("sub")
#         if user_id is None:
#             raise credentials_exception
#     except ValueError:
#         raise credentials_exception

#     result = await db.execute(select(User).where(User.id == user_id))
#     user = result.scalar_one_or_none()

#     if user is None or user.status != UserStatus.active:
#         raise credentials_exception
#     return user


# async def require_role(*roles):
#     """Role-based access control decorator factory."""
#     async def check_role(current_user: User = Depends(get_current_user)):
#         if current_user.role not in roles:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail=f"Access denied. Required roles: {[r.value for r in roles]}"
#             )
#         return current_user
#     return check_role


# # ── Routes ─────────────────────────────────────────────────────

# @router.post("/login", response_model=LoginResponse)
# async def login(
#     request: Request,
#     form_data: OAuth2PasswordRequestForm = Depends(),
#     db: AsyncSession = Depends(get_db)
# ):
#     result = await db.execute(select(User).where(User.email == form_data.username))
#     user = result.scalar_one_or_none()

#     if not user or not verify_password(form_data.password, user.hashed_password):
#         await log_audit_event(
#             db, None, AuditAction.login_failed,
#             ip=request.client.host, details={"email": form_data.username}
#         )
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect email or password"
#         )

#     if user.status == UserStatus.suspended:
#         raise HTTPException(status_code=403, detail="Account suspended. Contact administrator.")

#     # Issue temp token if MFA is enabled (must verify TOTP next)
#     requires_mfa = user.mfa_enabled
#     token_data = {
#         "sub": str(user.id),
#         "role": user.role.value,
#         "mfa_verified": not requires_mfa,
#         "temp": requires_mfa,
#     }

#     token = create_access_token(data=token_data)

#     if not requires_mfa:
#         await db.execute(
#             User.__table__.update()
#             .where(User.id == user.id)
#             .values(last_login=datetime.now(timezone.utc))
#         )
#         await log_audit_event(db, user.id, AuditAction.login_success, ip=request.client.host)

#     return LoginResponse(
#         access_token=token,
#         requires_mfa=requires_mfa,
#         user_role=user.role.value,
#     )


# @router.post("/mfa/verify")
# async def verify_mfa(
#     request: Request,
#     body: MFAVerifyRequest,
#     db: AsyncSession = Depends(get_db)
# ):
#     try:
#         payload = decode_token(body.temp_token)
#     except ValueError:
#         raise HTTPException(status_code=401, detail="Invalid token")

#     if not payload.get("temp"):
#         raise HTTPException(status_code=400, detail="MFA already verified")

#     user_id = payload.get("sub")
#     result = await db.execute(select(User).where(User.id == user_id))
#     user = result.scalar_one_or_none()

#     if not user or not user.mfa_secret:
#         raise HTTPException(status_code=400, detail="MFA not configured")

#     if not verify_totp(user.mfa_secret, body.totp_code):
#         await log_audit_event(db, user.id, AuditAction.login_failed,
#                               ip=request.client.host, details={"reason": "invalid_totp"})
#         raise HTTPException(status_code=401, detail="Invalid MFA code")

#     full_token = create_access_token({
#         "sub": str(user.id),
#         "role": user.role.value,
#         "mfa_verified": True,
#     })

#     await log_audit_event(db, user.id, AuditAction.mfa_verified, ip=request.client.host)
#     return {"access_token": full_token, "token_type": "bearer"}


# @router.post("/mfa/setup", response_model=MFASetupResponse)
# async def setup_mfa(
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db)
# ):
#     """Generate a new MFA secret and QR code for the current user."""
#     secret = generate_mfa_secret()
#     qr = generate_mfa_qr_base64(secret, current_user.email)

#     # Store unconfirmed secret — user must confirm with a TOTP code
#     await db.execute(
#         User.__table__.update()
#         .where(User.id == current_user.id)
#         .values(mfa_secret=secret)
#     )

#     return MFASetupResponse(qr_code_base64=qr, secret=secret)


# @router.post("/mfa/confirm")
# async def confirm_mfa(
#     totp_code: str,
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db)
# ):
#     """Confirm MFA setup by verifying user scanned QR correctly."""
#     if not current_user.mfa_secret:
#         raise HTTPException(status_code=400, detail="Run /mfa/setup first")

#     if not verify_totp(current_user.mfa_secret, totp_code):
#         raise HTTPException(status_code=401, detail="Invalid TOTP code")

#     await db.execute(
#         User.__table__.update()
#         .where(User.id == current_user.id)
#         .values(mfa_enabled=True, status=UserStatus.active)
#     )
#     return {"message": "MFA enabled successfully"}


# @router.get("/me")
# async def get_me(current_user: User = Depends(get_current_user)):
#     return {
#         "id": str(current_user.id),
#         "email": current_user.email,
#         "full_name": current_user.full_name,
#         "role": current_user.role.value,
#         "mfa_enabled": current_user.mfa_enabled,
#         "last_login": current_user.last_login,
#     }