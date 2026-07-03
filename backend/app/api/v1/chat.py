import uuid, time
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.user import User
from app.models.conversation import MessageRole
from app.schemas.chat import ChatRequest, ChatResponse, ConversationResponse, MessageResponse
from app.core.dependencies import get_current_user
from app.services.chat import ChatService
from app.rag.engine import RAGEngine
from app.config import get_settings

router = APIRouter(prefix="/chat", tags=["chat"])
settings = get_settings()


@router.post("/", response_model=ChatResponse)
async def chat(body: ChatRequest, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    service = ChatService(session)
    conv = await service.get_or_create_conversation(conversation_id=body.conversation_id, user_id=current_user.id, model=body.model)
    await service.add_message(conv.id, MessageRole.user, body.message)
    start = time.time()
    engine = RAGEngine(ollama_base_url=settings.ollama_base_url, qdrant_url=settings.qdrant_url, model=body.model)
    result = await engine.query(body.message, filters={"department_id": str(body.department_id)} if body.department_id else None)
    latency = (time.time() - start) * 1000
    msg = await service.add_message(conv.id, MessageRole.assistant, result.get("response", ""), sources=str(result.get("sources", [])), latency_ms=latency)
    return ChatResponse(conversation_id=conv.id, message_id=msg.id, content=msg.content, latency_ms=latency)


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    return await ChatService(session).get_user_conversations(current_user.id)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(conversation_id: str, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    return await ChatService(session).get_conversation_messages(uuid.UUID(conversation_id), current_user.id)
