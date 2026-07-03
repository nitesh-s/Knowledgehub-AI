from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conversation import Conversation, Message, MessageRole


class ChatService:
    def __init__(self, session: AsyncSession): self.session = session

    async def get_or_create_conversation(self, conversation_id: UUID | None, user_id: UUID, title: str | None = None, model: str = "llama3.1") -> Conversation:
        if conversation_id:
            result = await self.session.execute(select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id))
            conv = result.scalar_one_or_none()
            if conv: return conv
        conv = Conversation(user_id=user_id, title=title or "New conversation", model=model)
        self.session.add(conv)
        await self.session.flush()
        return conv

    async def add_message(self, conversation_id: UUID, role: MessageRole, content: str, sources: str | None = None, latency_ms: float | None = None) -> Message:
        msg = Message(conversation_id=conversation_id, role=role, content=content, sources=sources, latency_ms=str(latency_ms) if latency_ms else None)
        self.session.add(msg)
        await self.session.flush()
        conv_result = await self.session.execute(select(Conversation).where(Conversation.id == conversation_id))
        conv = conv_result.scalar_one()
        conv.updated_at = datetime.now(timezone.utc)
        return msg

    async def get_conversation_messages(self, conversation_id: UUID, user_id: UUID) -> list[Message]:
        result = await self.session.execute(select(Message).join(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id).order_by(Message.created_at))
        return list(result.scalars().all())

    async def get_user_conversations(self, user_id: UUID) -> list[Conversation]:
        result = await self.session.execute(select(Conversation).where(Conversation.user_id == user_id).order_by(desc(Conversation.updated_at)))
        return list(result.scalars().all())
