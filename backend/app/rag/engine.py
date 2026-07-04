import httpx


class RAGEngine:
    def __init__(self, ollama_base_url: str, qdrant_url: str, model: str = "llama3.1"):
        self.ollama_base_url = ollama_base_url
        self.qdrant_url = qdrant_url
        self.model = model

    async def query(self, question: str, filters: dict | None = None) -> dict:
        context = await self._retrieve(question, filters)
        response = await self._generate(question, context)
        return {"response": response, "sources": context}

    async def _retrieve(self, question: str, filters: dict | None = None) -> list[dict]:
        embedding = await self._embed(question)
        from qdrant_client import AsyncQdrantClient
        from qdrant_client.http.models import Filter, FieldCondition, MatchValue
        client = AsyncQdrantClient(url=self.qdrant_url)
        search_filter = None
        if filters and filters.get("department_id"):
            search_filter = Filter(must=[FieldCondition(key="department_id", match=MatchValue(value=filters["department_id"]))])
        results = await client.search(collection_name="documents", query_vector=embedding, limit=5, query_filter=search_filter)
        await client.close()
        return [{"text": r.payload.get("text", ""), "score": r.score, "document_id": r.payload.get("document_id")} for r in results]

    async def _embed(self, text: str) -> list[float]:
        async with httpx.AsyncClient(base_url=self.ollama_base_url) as client:
            response = await client.post("/api/embed", json={"model": "bge-m3", "input": [text]})
            response.raise_for_status()
            return response.json()["embeddings"][0]

    async def _generate(self, question: str, context: list[dict]) -> str:
        context_text = "\n\n".join([f"[Source {i+1}] {c['text']}" for i, c in enumerate(context)])
        prompt = f"You are KnowledgeHub AI. Answer based only on the context.\n\nContext:\n{context_text}\n\nQuestion: {question}\n\nAnswer:"
        async with httpx.AsyncClient(base_url=self.ollama_base_url, timeout=60.0) as client:
            response = await client.post("/api/generate", json={"model": self.model, "prompt": prompt, "stream": False})
            response.raise_for_status()
            return response.json().get("response", "")
