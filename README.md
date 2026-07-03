# KnowledgeHub AI

**Enterprise AI Knowledge Platform powered by Agentic RAG**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Enterprise AI knowledge platform with agentic RAG, multi-user auth, document ingestion, LangGraph agents, and full observability — all self-hosted.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, shadcn/ui, Tailwind CSS |
| Backend | FastAPI, Pydantic v2, SQLAlchemy |
| AI Agents | LangGraph |
| RAG | Direct Ollama API + Qdrant |
| Embeddings | BAAI/bge-m3 |
| LLM | Ollama (self-hosted) |
| Vector DB | Qdrant |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 + Arq |
| Observability | Arize Phoenix, Prometheus, Grafana |
| Auth | JWT (RBAC: admin, manager, employee) |
| Deployment | Docker Compose + Portainer |

## Quick Start

```bash
cp .env.example .env
docker compose up -d
docker compose exec backend alembic upgrade head
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Phoenix | http://localhost:3001 |
| Grafana | http://localhost:3002 |

## Project Structure

```
knowledgehub-ai/
├── backend/       # FastAPI application
├── frontend/      # Next.js application
├── docker/        # Nginx, Prometheus, Grafana configs
├── docs/          # Architecture Decision Records
└── docker-compose.yml
```
