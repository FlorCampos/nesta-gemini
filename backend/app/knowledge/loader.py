"""Content loader — loads JSON knowledge base into Supabase pgvector."""
import json
import os
import asyncio
from app.knowledge.embeddings import embed_text
from app.knowledge.supabase_client import get_supabase

CONTENT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "content"
)


async def load_all_content():
    """Load all JSON content into Supabase pgvector."""
    supabase = get_supabase()
    all_chunks = []

    # Scan all subdirectories for JSON files
    for root, dirs, files in os.walk(CONTENT_DIR):
        for filename in sorted(files):
            if not filename.endswith(".json"):
                continue

            filepath = os.path.join(root, filename)
            print(f"  📄 Reading {filename}...")

            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            chunks = data.get("chunks", [])
            for chunk in chunks:
                text = chunk.get("text", "").strip()
                if not text:
                    continue
                all_chunks.append({
                    "content": text,
                    "source": chunk.get("source", filename.replace(".json", "")),
                    "page": chunk.get("page", 0),
                    "type": chunk.get("type", "text"),
                })

    if not all_chunks:
        print("  ⚠️ No content found to load!")
        return

    print(f"\n  🔢 Embedding and storing {len(all_chunks)} chunks one by one...")

    # Embed and store one at a time (safer, easier to debug)
    for i, chunk in enumerate(all_chunks):
        print(f"  ⏳ {i + 1}/{len(all_chunks)} — {chunk['source']}")

        # Embed this chunk
        vector = await embed_text(chunk["content"])

        # Store in Supabase
        supabase.table("kb_chunks").insert({
            "content": chunk["content"],
            "source": chunk["source"],
            "page": chunk["page"],
            "type": chunk["type"],
            "embedding": vector,
        }).execute()

        # Small delay to avoid rate limits
        await asyncio.sleep(0.5)

    print(f"\n  ✅ Loaded {len(all_chunks)} chunks successfully!")


async def clear_all():
    """Delete ALL chunks from the knowledge base."""
    supabase = get_supabase()
    print("  🗑️ Clearing entire knowledge base...")
    supabase.table("kb_chunks").delete().neq("id", 0).execute()
    print("  ✅ Knowledge base cleared!")