from fastapi import APIRouter, Depends
from app.models.user import User
from app.core.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/health")
async def admin_health(_: User = Depends(require_admin)):
    return {"status": "ok"}
