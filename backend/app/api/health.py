"""Health and status endpoints."""
from fastapi import APIRouter
from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/status")
async def status():
    """Full system status — like check_status.py but via HTTP."""
    result = {
        "nesta_enabled": settings.NESTA_ENABLED,
        "claude_model": settings.CLAUDE_MODEL,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "redis_enabled": settings.REDIS_ENABLED,
        "reranker_enabled": settings.RERANKER_ENABLED,
    }

    # Check Supabase
    try:
        from app.knowledge.supabase_client import get_supabase
        supabase = get_supabase()
        count = supabase.table("kb_chunks").select("id", count="exact").execute()
        result["supabase"] = {"status": "ok", "chunks": count.count}
    except Exception as e:
        result["supabase"] = {"status": "error", "error": str(e)}

    # Check Redis
    try:
        from app.cache.redis_client import get_redis, get_stats
        r = get_redis()
        if r:
            keys = r.keys("nesta:response:*")
            stats = get_stats()
            result["redis"] = {
                "status": "ok",
                "cached_responses": len(keys),
                "total_spent": stats["total_spent"],
                "total_saved": stats["total_saved"],
                "savings_percent": stats["net_savings_percent"],
            }
        else:
            result["redis"] = {"status": "not available"}
    except Exception as e:
        result["redis"] = {"status": "error", "error": str(e)}

    # Check Embeddings
    try:
        from app.knowledge.embeddings import embeddings
        test = embeddings.embed_query("test")
        result["embeddings"] = {"status": "ok", "dimensions": len(test)}
    except Exception as e:
        if "RESOURCE_EXHAUSTED" in str(e):
            result["embeddings"] = {"status": "rate_limited"}
        else:
            result["embeddings"] = {"status": "error", "error": str(e)}

    return result