"""Check Nesta system status — embeddings, Redis, Supabase, Claude.
Run: docker compose exec backend python -m scripts.check_status
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.config import get_settings

settings = get_settings()


def main():
    print("🦋 Nesta System Status")
    print("=" * 50)

    # 1. Embedding provider
    print(f"\n📡 Embeddings: {settings.EMBEDDING_PROVIDER}")
    if settings.EMBEDDING_PROVIDER == "vertex_ai":
        print(f"   Project: {settings.GOOGLE_CLOUD_PROJECT}")
    try:
        from app.knowledge.embeddings import embeddings
        result = embeddings.embed_query("test")
        print(f"   ✅ Working — {len(result)} dimensions")
    except Exception as e:
        if "RESOURCE_EXHAUSTED" in str(e):
            print(f"   ❌ Rate limited — wait 60 seconds")
        else:
            print(f"   ❌ Error: {e}")

    # 2. Supabase
    print(f"\n💾 Supabase:")
    try:
        from app.knowledge.supabase_client import get_supabase
        supabase = get_supabase()
        count = supabase.table("kb_chunks").select("id", count="exact").execute()
        print(f"   ✅ Connected — {count.count} chunks in knowledge base")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # 3. Redis
    print(f"\n⚡ Redis:")
    try:
        from app.cache.redis_client import get_redis
        r = get_redis()
        if r:
            keys = r.keys("nesta:response:*")
            print(f"   ✅ Connected — {len(keys)} cached responses")
        else:
            print(f"   ⚠️ Not available — running without cache")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # 4. Claude
    print(f"\n🤖 Claude: {settings.CLAUDE_MODEL}")
    print(f"   API key: {'✅ Set' if settings.ANTHROPIC_API_KEY else '❌ Missing'}")

    # 5. Feature flags
    print(f"\n🚦 Feature flags:")
    print(f"   NESTA_ENABLED: {'✅ ON' if settings.NESTA_ENABLED else '❌ OFF'}")
    print(f"   REDIS_ENABLED: {'✅ ON' if settings.REDIS_ENABLED else '❌ OFF'}")
    print(f"   RERANKER_ENABLED: {'✅ ON' if settings.RERANKER_ENABLED else '❌ OFF'}")

    print(f"\n{'=' * 50}")
    print("✅ Status check complete")


if __name__ == "__main__":
    main()