"""Redis cache client — caches responses + tracks costs in Supabase."""
import hashlib
import redis
from app.config import get_settings

settings = get_settings()

_redis_client = None
_total_saved = 0.0
_total_spent = 0.0
_last_real_cost = 0.0

# Claude Opus 4.6 pricing
COST_PER_1M_INPUT = 5.00
COST_PER_1M_OUTPUT = 25.00
AVG_INPUT_TOKENS = 2000
AVG_OUTPUT_TOKENS = 200

# Gemini embedding-2 pricing (Vertex AI)
GEMINI_COST_PER_1M_TOKENS = 0.20 # Verifica siempre  https://ai.google.dev/gemini-api/docs/pricing

def calculate_cost_gemini(tokens: int = 0) -> float:
    """Calculate Gemini embedding cost."""
    return round((tokens / 1_000_000) * GEMINI_COST_PER_1M_TOKENS, 8)


def calculate_cost(input_tokens: int = 0, output_tokens: int = 0) -> float:
    input_cost = (input_tokens / 1_000_000) * COST_PER_1M_INPUT
    output_cost = (output_tokens / 1_000_000) * COST_PER_1M_OUTPUT
    return round(input_cost + output_cost, 6)


def _estimate_cost() -> float:
    return calculate_cost(AVG_INPUT_TOKENS, AVG_OUTPUT_TOKENS)


def get_redis():
    global _redis_client
    if _redis_client is None and settings.REDIS_URL:
        try:
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2,
            )
            _redis_client.ping()
            print("🔧 Redis: connected")
        except Exception as e:
            print(f"⚠️ Redis: not available ({e}) — running without cache")
            _redis_client = None
    return _redis_client


def _make_key(message: str) -> str:
    normalized = message.strip().lower()
    hash = hashlib.md5(normalized.encode()).hexdigest()[:12]
    return f"nesta:response:{hash}"


def _log_cost_to_supabase(message_hash: str, cached: bool, input_tokens: int, output_tokens: int, cost: float, saved: float, embedding_cost: float = 0):
    """Fire-and-forget: log cost to Supabase."""
    try:
        from app.knowledge.supabase_client import get_supabase
        supabase = get_supabase()
        supabase.table("cost_tracking").insert({
            "message_hash": message_hash,
            "cached": cached,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost,
            "saved_usd": saved,
            "provider": settings.CLAUDE_MODEL,
            "embedding_cost": embedding_cost,
            "embedding_provider": settings.EMBEDDING_MODEL,
        }).execute()
    except Exception as e:
        print(f"  ⚠️ Cost tracking failed (non-blocking): {e}")


def get_cached_response(message: str) -> str | None:
    global _total_saved, _last_real_cost
    r = get_redis()
    if not r or not settings.REDIS_ENABLED:
        return None

    try:
        key = _make_key(message)
        cached = r.get(key)
        if cached:
            saved = _last_real_cost if _last_real_cost > 0 else _estimate_cost()
            _total_saved += saved
            print(f"  ⚡ Cache HIT: {message[:50]}... → $0.00 (saved ${saved:.4f} | total saved: ${_total_saved:.4f})")
            _log_cost_to_supabase(key[-12:], True, 0, 0, 0, saved, embedding_cost=0)
            return cached
        print(f"  💨 Cache MISS: {message[:50]}...")
        return None
    except Exception:
        return None


def cache_response(message: str, response: str, ttl: int = 259200, input_tokens: int = 0, output_tokens: int = 0):
    global _total_spent, _last_real_cost
    r = get_redis()

    if input_tokens > 0:
        cost = calculate_cost(input_tokens, output_tokens)
        _last_real_cost = cost
        _total_spent += cost
        print(f"  💰 Claude call: ${cost:.6f} ({input_tokens} in + {output_tokens} out tokens | total spent: ${_total_spent:.4f})")
    else:
        cost = _estimate_cost()
        _total_spent += cost
        print(f"  💰 Claude call: ~${cost:.4f} (estimated | total spent: ${_total_spent:.4f})")

    key = _make_key(message)
    # Gemini embedding cost: ~50 tokens per query (always applies on MISS)
    emb_cost = calculate_cost_gemini(50)
    _log_cost_to_supabase(key[-12:], False, input_tokens, output_tokens, cost, 0, embedding_cost=emb_cost)

    if not r or not settings.REDIS_ENABLED:
        return

    try:
        r.setex(key, ttl, response)
    except Exception:
        pass


def get_stats() -> dict:
    total = _total_spent + _total_saved
    return {
        "total_spent": round(_total_spent, 4),
        "total_saved": round(_total_saved, 4),
        "net_savings_percent": round((_total_saved / total * 100), 1) if total > 0 else 0,
    }


def clear_cache():
    r = get_redis()
    if not r:
        return 0
    try:
        keys = r.keys("nesta:response:*")
        if keys:
            r.delete(*keys)
        return len(keys)
    except Exception:
        return 0