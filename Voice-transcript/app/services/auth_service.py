from datetime import datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, status, Request
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func

from app.models.base import Organization, User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_token,
)
from app.core.config import settings

ROLE_HIERARCHY = {"owner": 4, "admin": 3, "member": 2, "viewer": 1}
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


class AuthService:

    # ── CREATE ORGANIZATION ───────────────────────────────────────────────────

    async def create_organization(
        self,
        db: AsyncSession,
        org_name: str,
        plan: str,
        bus_type: str,
        calls_destination: str,
        num_agents: int = 1, 
    ) -> Organization:

        result = await db.execute(select(Organization).where(Organization.org_name == org_name))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Organization '{org_name}' already exists.",
            )

        org = Organization(
            org_name=org_name,
            plan=plan or "free",
            bus_type=bus_type,
            calls_destination=calls_destination,
            num_agents=num_agents,
        )
        db.add(org)
        await db.commit()
        await db.refresh(org)
        return org

    # ── CREATE USER ───────────────────────────────────────────────────────────
    async def create_user(
    self,
    db: AsyncSession,
    org_id: UUID,
    email: str,
    full_name: str,
    password: str,
    role: str
    ) -> User:

        # Guard: org must exist
        org_result = await db.execute(select(Organization).where(Organization.org_id == org_id))
        org = org_result.scalars().first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Organization '{org_id}' not found.",
            )

        # Guard: check if max agents reached
        count_result = await db.execute(
            select(func.count(User.user_id)).where(
                User.org_id == org_id,
                User.is_active == True        # only count active users
            )
        )
        current_count = count_result.scalar()
        if current_count >= org.num_agents:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Organization has reached its maximum number of agents ({org.num_agents}). "
                   f"Please upgrade your plan or increase the agent limit.",
            )


        # Guard: email must be unique
        result = await db.execute(select(User).where(User.email == email.lower()))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )
        
        # Guard: cannot assign role >= your own (skip for first user registration)
        #if current_user and ROLE_HIERARCHY.get(role, 0) >= ROLE_HIERARCHY.get(current_user.role, 0):
        #    raise HTTPException(
        #        status_code=status.HTTP_403_FORBIDDEN,
        #        detail=f"Cannot assign role '{role}' — it equals or exceeds your own.",
        #    )


        user = User(
            org_id=org_id,                  # ← use the one from request
            email=email.lower(),
            full_name=full_name,
            hashed_password=hash_password(password),
            role=role,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    # -- SIGN UP ----------------------
    async def register(self, db: AsyncSession, payload, request: Request):

        # Guard: email already exists
        email_result = await db.execute(select(User).where(User.email == payload.email.lower()))
        if email_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        # Guard: org name already exists
        org_result = await db.execute(select(Organization).where(Organization.org_name == payload.org_name))
        if org_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Organization '{payload.org_name}' already exists.",
            )

        # Create Organization
        org = Organization(
            org_name=payload.org_name,
            plan=payload.plan or "free",
            bus_type=payload.bus_type,
            calls_destination=payload.calls_destination,
            num_agents=payload.num_agents or 1,
        )
        db.add(org)
        await db.flush()        # get org_id before creating user

        # Create Owner user
        user = User(
            org_id=org.org_id,
            email=payload.email.lower(),
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            role="owner",       # first user is always owner
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        await db.refresh(org)

        # Issue tokens so user is logged in immediately
        token_data = {
            "sub": str(user.user_id),
            "org": str(user.org_id),
            "role": user.role,
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user.refresh_token_hash = hash_token(refresh_token)
        await db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": str(user.user_id),
            "org_id": str(org.org_id),
            "role": user.role,
        }
    # ── SIGN IN ───────────────────────────────────────────────────────────────

    async def sign_in(
        self,
        db: AsyncSession,
        email: str,
        password: str,
        request: Request,
    ):
        result = await db.execute(select(User).where(User.email == email.lower()))
        user = result.scalars().first()

        _fail = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

        if not user:
            raise _fail

        if user.locked_until and datetime.utcnow() < user.locked_until:
            mins = int((user.locked_until - datetime.utcnow()).total_seconds() // 60) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account locked. Try again in {mins} min.",
            )

        if not verify_password(password, user.hashed_password):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= MAX_ATTEMPTS:
                user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
                user.failed_login_attempts = 0
            await db.commit()
            raise _fail

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account deactivated.",
            )

        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.utcnow()
        user.last_login_ip = request.client.host

        token_data = {
            "sub": str(user.user_id),
            "org": str(user.org_id),
            "role": user.role,
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user.refresh_token_hash = hash_token(refresh_token)
        await db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    # ── REFRESH TOKEN ─────────────────────────────────────────────────────────

    async def refresh_token(self, db: AsyncSession, refresh_token: str):
        from jose import JWTError
        from app.core.security import decode_refresh_token, verify_token_hash

        exc = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

        try:
            payload = decode_refresh_token(refresh_token)
            user_id: str = payload.get("sub")
            if not user_id:
                raise exc
        except JWTError:
            raise exc

        result = await db.execute(
            select(User).where(User.user_id == UUID(user_id), User.is_active == True)
        )
        user = result.scalars().first()
        if not user or not user.refresh_token_hash:
            raise exc

        if not verify_token_hash(refresh_token, user.refresh_token_hash):
            raise exc

        # Rotate tokens
        token_data = {
            "sub": str(user.user_id),
            "org": str(user.org_id),
            "role": user.role,
        }
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        user.refresh_token_hash = hash_token(new_refresh_token)
        await db.commit()

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
        }

    # ── GET ORG USERS ─────────────────────────────────────────────────────────

    async def get_org_users(self, db: AsyncSession, org_id: UUID) -> list[User]:
        result = await db.execute(
            select(User)
            .where(User.org_id == org_id)
            .order_by(User.created_at)
        )
        return result.scalars().all()

    # ── SIGN OUT ──────────────────────────────────────────────────────────────

    async def sign_out(self, db: AsyncSession, current_user: User):
        current_user.refresh_token_hash = None
        await db.commit()
        return {"message": "Signed out successfully."}