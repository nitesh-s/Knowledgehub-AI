import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.v1 import auth, users, documents, chat, admin, health

settings = get_settings()
logging.basicConfig(level=logging.INFO if settings.debug else logging.WARNING)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.db.session import engine
    logger.info("Starting KnowledgeHub AI backend...")
    yield
    await engine.dispose()
    logger.info("Shutdown complete.")


app = FastAPI(title=settings.app_name, description="Enterprise AI Knowledge Platform powered by Agentic RAG", version="0.1.0", lifespan=lifespan, docs_url="/docs", redoc_url="/redoc")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")

from app.utils.telemetry import setup_telemetry
setup_telemetry(app)
