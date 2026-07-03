from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "KnowledgeHub AI"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://knowledgehub:changeme@postgres:5432/knowledgehub"
    redis_url: str = "redis://redis:6379/0"
    qdrant_url: str = "http://qdrant:6333"
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "llama3.1"
    embedding_model: str = "BAAI/bge-m3"
    secret_key: str = "changeme"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    phoenix_collector_endpoint: str = "http://phoenix:6006"
    upload_dir: str = "/app/uploads"
    max_upload_size_mb: int = 50

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
