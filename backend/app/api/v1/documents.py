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
from arq.connections import create_pool
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])
settings = get_settings()


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), department_id: str | None = None, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if not file.size or file.size > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large or size unknown")
    content = await file.read()
    try:
        dept_uuid = uuid.UUID(department_id) if department_id else None
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid department_id")
    doc = await DocumentService(session).upload(filename=file.filename or "untitled", content=content, mime_type=file.content_type, user_id=current_user.id, department_id=dept_uuid)
    try:
        pool = await create_pool(settings.redis_url)
        await pool.enqueue_job("process_document", str(doc.id))
        await pool.close()
    except Exception:
        pass
    return DocumentUploadResponse(id=doc.id, filename=doc.filename, status=doc.status)


@router.get("/", response_model=list[DocumentResponse])
async def list_documents(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Document).order_by(Document.created_at.desc()))
    return list(result.scalars().all())


@router.post("/{document_id}/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        uid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid document_id")
    result = await session.execute(select(Document).where(Document.id == uid))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    await session.delete(doc)
    return None


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    try:
        uid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid document_id")
    result = await session.execute(select(Document).where(Document.id == uid))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc
