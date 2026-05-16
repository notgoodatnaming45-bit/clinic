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