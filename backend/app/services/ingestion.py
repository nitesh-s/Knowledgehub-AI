import aiofiles
from uuid import UUID
from pathlib import Path
from app.config import get_settings
from app.models.document import Document, DocumentStatus

settings = get_settings()


class IngestionService:
    async def process_document(self, document: Document) -> None:
        document.status = DocumentStatus.processing
        try:
            file_path = Path(document.file_path)
            async with aiofiles.open(file_path, "rb") as f:
                content = await f.read()
            chunks = await self._chunk_content(content, document.mime_type)
            embeddings = await self._generate_embeddings(chunks)
            if not embeddings:
                raise ValueError("Embedding generation returned empty results")
            await self._index_to_qdrant(document.id, chunks, embeddings, document.department_id)
            document.status = DocumentStatus.indexed
            document.chunk_count = len(chunks)
        except Exception as e:
            document.status = DocumentStatus.failed
            document.error_message = str(e)

    async def _chunk_content(self, content: bytes, mime_type: str | None) -> list[str]:
        text = self._extract_text(content, mime_type)
        chunks, chunk_size, overlap = [], 512, 64
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunks.append(text[start:end])
            start += chunk_size - overlap
        return chunks if chunks else [text]

    def _extract_text(self, content: bytes, mime_type: str | None) -> str:
        if mime_type == "application/pdf":
            try:
                import unstructured.partition.auto
                import tempfile, os
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                    tmp.write(content)
                    tmp_path = tmp.name
                try:
                    elements = unstructured.partition.auto.partition(filename=tmp_path)
                    return "\n\n".join([str(el) for el in elements])
                finally:
                    os.unlink(tmp_path)
            except Exception:
                pass
        return content.decode("utf-8", errors="replace")

    async def _generate_embeddings(self, chunks: list[str]) -> list[list[float]]:
        import httpx
        async with httpx.AsyncClient(base_url=settings.ollama_base_url) as client:
            response = await client.post("/api/embed", json={"model": settings.embedding_model, "input": chunks})
            response.raise_for_status()
            return response.json().get("embeddings", [])

    async def _index_to_qdrant(self, document_id: UUID, chunks: list[str], embeddings: list[list[float]], department_id: UUID | None) -> None:
        from qdrant_client import AsyncQdrantClient
        from qdrant_client.http.models import PointStruct, VectorParams, Distance
        client = AsyncQdrantClient(url=settings.qdrant_url)
        collection = "documents"
        collections = await client.get_collections()
        if not any(c.name == collection for c in collections.collections):
            await client.create_collection(collection_name=collection, vectors_config=VectorParams(size=len(embeddings[0]), distance=Distance.COSINE))
        points = [PointStruct(id=i, vector=embeddings[i], payload={"document_id": str(document_id), "chunk_index": i, "text": chunks[i], "department_id": str(department_id) if department_id else None}) for i in range(len(chunks))]
        await client.upsert(collection_name=collection, points=points)
        await client.close()
