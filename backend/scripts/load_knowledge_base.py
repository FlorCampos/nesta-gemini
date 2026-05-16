"""Load knowledge base content into Supabase pgvector.
Run: docker compose exec backend python -m scripts.load_knowledge_base
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.knowledge.loader import load_all_content, clear_all


async def main():
    print("🦋 Nesta Knowledge Base Loader")
    print("=" * 50)

    # Clear existing data first
    await clear_all()

    # Load all content
    await load_all_content()

    print("=" * 50)
    print("✅ Done! Nesta's knowledge base is ready.")


if __name__ == "__main__":
    asyncio.run(main())