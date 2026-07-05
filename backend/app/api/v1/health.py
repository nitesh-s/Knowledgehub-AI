import asyncio
from fastapi import APIRouter
from sqlalchemy import text
from redis.asyncio import Redis
from app.db.session import async_session_factory
from app.config import get_settings
import httpx

router = APIRouter(prefix="/health", tags=["health"])
settings = get_settings()


async def check_postgres() -> dict:
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "healthy", "message": "Connected"}
    except Exception as e:
        return {"status": "unhealthy", "message": str(e)}


async def check_redis() -> dict:
    try:
        r = Redis.from_url(settings.redis_url, socket_connect_timeout=3)
        await r.ping()
        await r.aclose()
        return {"status": "healthy", "message": "Connected"}
    except Exception as e:
        return {"status": "unhealthy", "message": str(e)}


async def check_qdrant() -> dict:
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{settings.qdrant_url}/healthz")
        return {"status": "healthy" if r.is_success else "unhealthy", "message": "Connected" if r.is_success else f"HTTP {r.status_code}"}
    except Exception as e:
        return {"status": "unhealthy", "message": f"Connection failed: {e}"}


async def check_ollama() -> dict:
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{settings.ollama_base_url}/api/tags")
            if r.is_success:
                models = [m["name"] for m in r.json().get("models", [])]
                return {"status": "healthy", "message": f"Available: {', '.join(models) if models else 'no models found'}", "models": models}
            return {"status": "unhealthy", "message": f"HTTP {r.status_code}"}
    except Exception as e:
        return {"status": "unhealthy", "message": f"Connection failed: {e}"}


@router.get("/")
async def health_check():
    postgres, redis_, qdrant, ollama = await asyncio.gather(check_postgres(), check_redis(), check_qdrant(), check_ollama())
    services = {"postgres": postgres, "redis": redis_, "qdrant": qdrant, "ollama": ollama}
    overall = "healthy" if all(s["status"] == "healthy" for s in services.values()) else "degraded"
    unhealthy = [name for name, s in services.items() if s["status"] != "healthy"]
    return {"status": overall, "services": services, "details": f"Unhealthy services: {', '.join(unhealthy)}" if unhealthy else "All services healthy"}
