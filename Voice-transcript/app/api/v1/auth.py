from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlmodel import Session
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
import re

from app.database import get_session
from app.core.dependencies import get_current_user, require_admin
from app.models.base import User
from app.services.auth_service import AuthService
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(prefix="/auth", tags=["Auth"])
service = AuthService()


# ── Schemas ───────────────────────────────────────────────────────────────────

# def _validate_password(v: str) -> str:
#     if len(v) < 8: raise ValueError("Min 8 chars.")
#     if not re.search(r"[A-Z]", v): raise ValueError("Need uppercase.")
#     if not re.search(r"[a-z]", v): raise ValueError("Need lowercase.")
#     if not re.search(r"\d", v): raise ValueError("Need a digit.")
#     if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v): raise ValueError("Need special char.")
#     return v


class OrgCreateRequest(BaseModel):
    org_name: str = Field(..., min_length=2, max_length=255)
    plan: Optional[str] = "free"
    bus_type: Optional[str] = None
    calls_destination: Optional[str] = None
    num_agents: Optional[int] = 1
    max_phone_numbers: Optional[int] = 2
    primary_phone_number: Optional[str] = None  # E.164 format, optional
    secondary_phone_number: Optional[str] = None  # E.164 format, optional

    @field_validator("primary_phone_number", "secondary_phone_number")
    @classmethod
    def validate_phone_format(cls, v):
        if v is None:
            return v
        if not re.match(r"^\+[1-9]\d{1,14}$", v):
            raise ValueError("Phone number must be in E.164 format (e.g., +972501234567).")
        return v


class OrgResponse(BaseModel):
    org_id: UUID
    org_name: str
    plan: str
    is_active: bool
    num_agents: int
    max_phone_numbers: int
    created_at: datetime
    model_config = {"from_attributes": True}


class UserCreateRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str
    role: Optional[str] = "member"
    org_id: UUID                       

    # @field_validator("password")
    # @classmethod
    # def strong(cls, v): return _validate_password(v)

    @field_validator("role")
    @classmethod
    def valid_role(cls, v):
        if v not in {"owner", "admin", "member", "viewer"}:
            raise ValueError("Invalid role.")
        return v


class UserResponse(BaseModel):
    user_id: UUID
    org_id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class AdminCreateRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str
    org_id: UUID

    # @field_validator("password")
    # @classmethod
    # def strong(cls, v): return _validate_password(v)
    
class RegisterRequest(BaseModel):
    # Organization
    org_name: str = Field(..., min_length=2, max_length=255)
    plan: Optional[str] = "free"
    bus_type: Optional[str] = None
    calls_destination: Optional[str] = None
    num_agents: Optional[int] = 1
    max_phone_numbers: Optional[int] = 2
    primary_phone_number: Optional[str] = None  # E.164 format, optional
    secondary_phone_number: Optional[str] = None  # E.164 format, optional

    # User
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str

    @field_validator("primary_phone_number", "secondary_phone_number")
    @classmethod
    def validate_phone_format(cls, v):
        if v is None:
            return v
        if not re.match(r"^\+[1-9]\d{1,14}$", v):
            raise ValueError("Phone number must be in E.164 format (e.g., +972501234567).")
        return v

    #@field_validator("password")
    #@classmethod
    #def strong(cls, v): return _validate_password(v)


class RegisterResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: UUID
    org_id: UUID
    role: str
    model_config = {"from_attributes": True}


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"



# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/organizations", response_model=OrgResponse, status_code=201)
async def create_organization(
    payload: OrgCreateRequest,
    request: Request,
    db: AsyncSession = Depends(get_session),
):
    return await service.create_organization(
        db=db,
        org_name=payload.org_name,
        plan=payload.plan,
        bus_type=payload.bus_type,
        calls_destination=payload.calls_destination,
        num_agents=payload.num_agents,
        max_phone_numbers=payload.max_phone_numbers,
        primary_phone_number=payload.primary_phone_number,
        secondary_phone_number=payload.secondary_phone_number,
    )

@router.post("/CreateUsers", response_model=UserResponse, status_code=201)
async def create_user(
    payload: UserCreateRequest,
    db: AsyncSession = Depends(get_session)
    
    ):
    return await service.create_user(
        db=db,
        org_id=payload.org_id,
        email=payload.email,
        full_name=payload.full_name,
        password=payload.password,
        role=payload.role,
    )

@router.post("/sign-in")
async def sign_in(
    payload: SignInRequest,
    request: Request,
    response: Response,                          # ← add Response
    db: Session = Depends(get_session),
):
    result = await service.sign_in(
        db=db,
        email=payload.email,
        password=payload.password,
        request=request,
    )
    # Only refresh_token goes in HttpOnly cookie
    # access_token is returned in the body → frontend stores in localStorage
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=False,       # True in production (HTTPS only)
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )
    return result


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,                          # ← add Response
    db: AsyncSession = Depends(get_session),
):
    result = await service.register(db=db, payload=payload, request=request)
    # Only refresh_token goes in HttpOnly cookie
    # access_token is returned in the body → frontend stores in localStorage
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=False,       # True in production (HTTPS only)
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )
    return result


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_session),
):
    # Read refresh_token from HttpOnly cookie only
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing.")

    result = await service.refresh_token(db=db, refresh_token=token)
    # Rotate refresh_token cookie
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=False,       # True in production (HTTPS only)
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )
    # Return new access_token in body → frontend updates localStorage
    return result


@router.post("/sign-out")
async def sign_out(
    response: Response,                          # ← add Response
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await service.sign_out(db=db, current_user=current_user)
    # Clear only the refresh_token cookie
    response.delete_cookie("refresh_token")
    return result


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=list[UserResponse])
async def get_org_users(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return all users belonging to the current user's organization."""
    return await service.get_org_users(db=db, org_id=current_user.org_id)