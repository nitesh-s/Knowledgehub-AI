from app.rag.engine import RAGEngine


class HybridSearch:
    def __init__(self, engine: RAGEngine): self.engine = engine

    async def search(self, query: str, filters: dict | None = None) -> list[dict]:
        return await self.engine._retrieve(query, filters)
