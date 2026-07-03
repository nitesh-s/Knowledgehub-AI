from app.config import get_settings
from app.services.ingestion import IngestionService

settings = get_settings()


async def process_document(ctx, document_id: str):
    from sqlalchemy import select
    from app.db.session import async_session_factory
    from app.models.document import Document
    import uuid
    async with async_session_factory() as session:
        result = await session.execute(select(Document).where(Document.id == uuid.UUID(document_id)))
        document = result.scalar_one_or_none()
        if not document:
            return {"error": "Document not found"}
        service = IngestionService()
        await service.process_document(document)
        await session.flush()
        return {"status": "processed", "document_id": document_id}


class WorkerSettings:
    redis_settings = settings.redis_url
    functions = [process_document]
    poll_delay = 1.0
    max_jobs = 5
