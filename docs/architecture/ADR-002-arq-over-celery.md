# ADR-002: Arq over Celery

**Status:** Accepted

**Context:** Need background job queue for async document ingestion.

**Decision:** Arq — async-native, only needs Redis, no separate beat process. Celery requires extra broker config and higher memory.

**Trade-offs:** Smaller ecosystem but fits our async FastAPI stack perfectly.
