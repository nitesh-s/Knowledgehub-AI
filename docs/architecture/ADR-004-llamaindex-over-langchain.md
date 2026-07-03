# ADR-004: LlamaIndex + Direct API over LangChain

**Status:** Accepted

**Context:** Need RAG framework for indexing, chunking, embedding, and retrieval.

**Decision:** LlamaIndex for index/retrieval + direct Ollama HTTP calls. LangChain is overly abstracted and breaks often.

**Trade-offs:** Two frameworks instead of one, but each is purpose-built and stable.
