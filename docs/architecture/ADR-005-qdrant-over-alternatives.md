# ADR-005: Qdrant over Chroma, pgvector, or Pinecone

**Status:** Accepted

**Context:** Need vector database for embedding search.

**Decision:** Qdrant — purpose-built, rich payload filtering, HNSW indexing, self-hostable single container. Chroma is slower, pgvector lacks filter indices.

**Trade-offs:** Another service to manage, but best-in-class vector search.
