from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.core.dependencies import get_current_user
from app.services.document import DocumentService
from app.config import get_settings
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])
settings = get_settings()


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), department_id: str | None = None, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if file.size and file.size > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")
    content = await file.read()
    doc = await DocumentService(session).upload(filename=file.filename or "untitled", content=content, user_id=current_user.id, department_id=uuid.UUID(department_id) if department_id else None)
    return DocumentUploadResponse(id=doc.id, filename=doc.filename, status=doc.status)


@router.get("/", response_model=list[DocumentResponse])
async def list_documents(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Document).order_by(Document.created_at.desc()))
    return list(result.scalars().all())


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Document).where(Document.id == uuid.UUID(document_id)))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc
