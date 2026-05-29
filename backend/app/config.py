import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Claude — conversations
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # Gemini — embeddings
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")

    # Supabase — database
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Redis — cache
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    # Feature flags
    NESTA_ENABLED: bool = os.getenv("NESTA_ENABLED", "true").lower() == "true"
    RERANKER_ENABLED: bool = os.getenv("RERANKER_ENABLED", "false").lower() == "true"
    REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "true").lower() == "true"

    # Models
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-opus-4-6")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "gemini-embedding-2")

    # Embedding provider: "google_ai_studio" or "vertex_ai"
    EMBEDDING_PROVIDER: str = os.getenv("EMBEDDING_PROVIDER", "google_ai_studio")
    
    # Debug
    DEBUG_KEY: str = os.getenv("DEBUG_KEY", "")


@lru_cache()
def get_settings() -> Settings:
    return Settings()