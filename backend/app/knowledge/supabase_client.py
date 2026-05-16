from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _client