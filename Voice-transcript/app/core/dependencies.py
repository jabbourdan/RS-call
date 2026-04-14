from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError
from uuid import UUID
from typing import Optional

from app.database import get_session
from app.core.security import decode_access_token
from app.models.base import User

bearer_scheme = HTTPBearer(auto_error=False)

ROLE_HIERARCHY = {"owner": 4, "admin": 3, "member": 2, "viewer": 1}


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_session),
) -> User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # access_token comes ONLY from the Authorization: Bearer header
    # (frontend stores it in localStorage and sends it on every request)
    if not credentials:
        raise exc

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise exc
    except JWTError:
        raise exc

    result = await db.execute(
        select(User).where(User.user_id == UUID(user_id), User.is_active == True)
    )
    user = result.scalars().first()
    if not user:
        raise exc
    return user


def require_role(*roles: str):
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {list(roles)}",
            )
        return current_user
    return _check


require_owner = require_role("owner")
require_admin = require_role("owner", "admin")
require_member = require_role("owner", "admin", "member")