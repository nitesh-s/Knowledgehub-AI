from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from app.models.user import UserRole


class UserResponse(BaseModel):
    id: UUID; email: str; username: str; full_name: str | None; role: UserRole; department_id: UUID | None; is_active: bool; created_at: datetime
    class Config: from_attributes = True


class UserUpdateRequest(BaseModel):
    full_name: str | None = None; role: UserRole | None = None; department_id: UUID | None = None; is_active: bool | None = None
