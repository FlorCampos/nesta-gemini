"""Process all 12 PDFs with text extraction + Vision AI, then load into Supabase.
Run: docker compose exec backend python -m scripts.process_pdfs
"""
import asyncio
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.knowledge.pdf_processor import process_pdf
from app.knowledge.embeddings import embed_text
from app.knowledge.supabase_client import get_supabase

RAW_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "content", "resources", "raw"
)

PROCESSED_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "content", "resources", "processed"
)


async def main():
    print("🦋 Nesta PDF Processor + Vision AI")
    print("=" * 50)

    pdf_files = [f for f in os.listdir(RAW_DIR) if f.endswith(".pdf")]
    print(f"  📚 Found {len(pdf_files)} PDFs\n")

    supabase = get_supabase()

    # Check which sources are already loaded
    existing = supabase.table("kb_chunks").select("source").eq("type", "research").execute()
    loaded_sources = set(row["source"] for row in existing.data) if existing.data else set()
    if loaded_sources:
        print(f"  📋 Already loaded: {', '.join(sorted(loaded_sources))}")
        print(f"  ⏭️ Will skip these and process only new PDFs\n")

    total_chunks = 0
    total_vision = 0

    for i, pdf_file in enumerate(sorted(pdf_files)):
        filepath = os.path.join(RAW_DIR, pdf_file)
        print(f"\n  [{i + 1}/{len(pdf_files)}] {pdf_file}")

        # Skip if already loaded
        from app.knowledge.pdf_processor import get_source_name
        source = get_source_name(pdf_file)
        if source in loaded_sources:
            print(f"    ⏭️ Already loaded — skipping")
            continue

        chunks = await process_pdf(filepath)

        if not chunks:
            print(f"    ⚠️ No content extracted — skipping")
            continue

        # Save processed chunks to JSON
        processed_file = os.path.join(
            PROCESSED_DIR,
            pdf_file.replace(".pdf", "_chunks.json").replace(" ", "_")
        )
        with open(processed_file, "w", encoding="utf-8") as f:
            json.dump({"chunks": chunks}, f, indent=2, ensure_ascii=False)

        # Embed and store
        for j, chunk in enumerate(chunks):
            print(f"    ⏳ Embedding chunk {j + 1}/{len(chunks)}...")
            try:
                vector = await embed_text(chunk["text"])
                supabase.table("kb_chunks").insert({
                    "content": chunk["text"],
                    "source": chunk["source"],
                    "page": chunk["page"],
                    "type": chunk["type"],
                    "embedding": vector,
                }).execute()
                await asyncio.sleep(4) # Rate limit for embedding model
            except Exception as e:
                print(f"    ⚠️ Failed chunk {j + 1}: {e}")
                continue

        total_chunks += len(chunks)
        print(f"    ✅ {len(chunks)} chunks loaded")

    print(f"\n{'=' * 50}")
    print(f"✅ Done! {len(pdf_files)} PDFs → {total_chunks} chunks loaded")
    print(f"📊 Total chunks in knowledge base: 48 (programs) + {total_chunks} (research)")


if __name__ == "__main__":
    asyncio.run(main())