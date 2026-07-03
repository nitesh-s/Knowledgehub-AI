# ADR-003: Phoenix over Langfuse

**Status:** Accepted

**Context:** Need LLM observability for tracing, monitoring, and evaluation.

**Decision:** Arize Phoenix — lighter (SQLite, no extra DB), native OpenTelemetry, single container. Langfuse requires separate PostgreSQL.

**Trade-offs:** Smaller feature set but simpler deployment.
