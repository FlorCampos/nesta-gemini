"""Embeddings — supports Google AI Studio (free) and Vertex AI (production).
Both use GoogleGenerativeAIEmbeddings — only authentication differs.
"""
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.config import get_settings

settings = get_settings()


def _create_embeddings():
    provider = settings.EMBEDDING_PROVIDER

    if provider == "vertex_ai":
        print(f"🔧 Embeddings: Vertex AI (project: {settings.GOOGLE_CLOUD_PROJECT})")
        return GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            project=settings.GOOGLE_CLOUD_PROJECT,
        )
    else:
        print(f"🔧 Embeddings: Google AI Studio (free tier — 1,000/day limit)")
        return GoogleGenerativeAIEmbeddings(
            google_api_key=settings.GOOGLE_API_KEY,
            model=settings.EMBEDDING_MODEL,
        )


embeddings = _create_embeddings()


async def embed_text(text: str) -> list[float]:
    try:
        return await embeddings.aembed_query(text)
    except Exception as e:
        if "RESOURCE_EXHAUSTED" in str(e):
            print("")
            print("=" * 60)
            print("⚠️  EMBEDDING QUOTA EXHAUSTED!")
            print(f"   Provider: {settings.EMBEDDING_PROVIDER}")
            print("=" * 60)
            if settings.EMBEDDING_PROVIDER == "google_ai_studio":
                print("To fix: switch to Vertex AI in backend/.env:")
                print("")
                print("  EMBEDDING_PROVIDER=vertex_ai")
                print(f"  GOOGLE_CLOUD_PROJECT={settings.GOOGLE_CLOUD_PROJECT}")
                print("")
                print("Then restart: docker compose down && docker compose up -d")
            else:
                print("Vertex AI per-minute rate limit hit.")
                print("This is temporary — wait 60 seconds and retry.")
                print("During the conference this won't happen")
                print("(requests are spread across 3 hours).")
            print("=" * 60)
            print("")
        raise


async def embed_texts(texts: list[str]) -> list[list[float]]:
    try:
        return await embeddings.aembed_documents(texts)
    except Exception as e:
        if "RESOURCE_EXHAUSTED" in str(e):
            print("")
            print("=" * 60)
            print("⚠️  EMBEDDING QUOTA EXHAUSTED!")
            print(f"   Provider: {settings.EMBEDDING_PROVIDER}")
            print("=" * 60)
            if settings.EMBEDDING_PROVIDER == "google_ai_studio":
                print("To fix: switch to Vertex AI in backend/.env:")
                print("")
                print("  EMBEDDING_PROVIDER=vertex_ai")
                print(f"  GOOGLE_CLOUD_PROJECT={settings.GOOGLE_CLOUD_PROJECT}")
                print("")
                print("Then restart: docker compose down && docker compose up -d")
            else:
                print("Vertex AI per-minute rate limit hit.")
                print("This is temporary — wait 60 seconds and retry.")
                print("During the conference this won't happen")
                print("(requests are spread across 3 hours).")
            print("=" * 60)
            print("")
        raise