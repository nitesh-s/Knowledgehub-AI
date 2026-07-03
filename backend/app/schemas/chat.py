from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ChatRequest(BaseModel):
    conversation_id: UUID | None = None; message: str; model: str = "llama3.1"; department_id: UUID | None = None


class ChatResponse(BaseModel):
    conversation_id: UUID; message_id: UUID; content: str; sources: list[dict] | None = None; latency_ms: float | None = None


class ConversationResponse(BaseModel):
    id: UUID; title: str | None; model: str; created_at: datetime; updated_at: datetime
    class Config: from_attributes = True


class MessageResponse(BaseModel):
    id: UUID; role: str; content: str; sources: str | None; created_at: datetime
    class Config: from_attributes = True
