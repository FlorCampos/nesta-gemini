"""Chunker — splits text into smaller pieces for vector search.
For JSONs: chunks are already defined manually in the JSON files.
For PDFs: this splits text automatically into ~500 token pieces.
"""


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into chunks of approximately chunk_size tokens.
    Respects paragraph boundaries when possible.
    """
    if not text or not text.strip():
        return []

    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue

        # Estimate tokens (rough: 1 token ≈ 4 characters)
        current_tokens = len(current_chunk) // 4
        paragraph_tokens = len(paragraph) // 4

        if current_tokens + paragraph_tokens > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            # Keep overlap from end of previous chunk
            words = current_chunk.split()
            overlap_words = words[-overlap:] if len(words) > overlap else []
            current_chunk = " ".join(overlap_words) + "\n\n" + paragraph
        else:
            current_chunk = current_chunk + "\n\n" + paragraph if current_chunk else paragraph

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks