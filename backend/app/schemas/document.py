from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from app.models.document import DocumentStatus


class DocumentResponse(BaseModel):
    id: UUID; filename: str; original_filename: str; file_size: int | None; mime_type: str | None; status: DocumentStatus; department_id: UUID | None; collection_id: UUID | None; uploaded_by: UUID; chunk_count: int; error_message: str | None; created_at: datetime; updated_at: datetime
    class Config: from_attributes = True


class DocumentUploadResponse(BaseModel):
    id: UUID; filename: str; status: DocumentStatus; message: str = "File uploaded successfully"
