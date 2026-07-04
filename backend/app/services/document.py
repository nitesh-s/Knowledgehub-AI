import os
from uuid import UUID
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import get_settings
from app.models.document import Document, DocumentStatus
import aiofiles

settings = get_settings()


class DocumentService:
    def __init__(self, session: AsyncSession): self.session = session

    async def upload(self, filename: str, content: bytes, user_id: UUID, department_id: UUID | None = None, mime_type: str | None = None) -> Document:
        safe_name = os.path.basename(filename)
        upload_path = Path(settings.upload_dir) / user_id.hex
        upload_path.mkdir(parents=True, exist_ok=True)
        file_path = upload_path / safe_name
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)
        doc = Document(filename=safe_name, original_filename=filename, file_path=str(file_path), file_size=len(content), mime_type=mime_type, uploaded_by=user_id, department_id=department_id, status=DocumentStatus.pending)
        self.session.add(doc)
        await self.session.flush()
        return doc
