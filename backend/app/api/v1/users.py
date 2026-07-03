from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateRequest
from app.core.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(body: UserUpdateRequest, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    await session.flush()
    return current_user


@router.get("/", response_model=list[UserResponse])
async def list_users(session: AsyncSession = Depends(get_session), _: User = Depends(require_admin)):
    result = await session.execute(select(User).order_by(User.created_at.desc()))
    return list(result.scalars().all())
