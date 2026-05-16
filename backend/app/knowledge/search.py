"""Knowledge base search — vector search via Supabase pgvector."""
from app.knowledge.embeddings import embed_text
from app.knowledge.supabase_client import get_supabase


async def search_knowledge_base(query: str, top_k: int = 5) -> list[dict]:
    """Search the knowledge base for documents relevant to the query.

    Steps:
    1. Convert query to vector using Gemini embeddings
    2. Search Supabase pgvector for similar documents
    3. Return top_k most relevant documents with metadata
    """
    try:
        # Step 1: embed the query
        query_vector = await embed_text(query)

        # Step 2: search Supabase using the match_documents function
        supabase = get_supabase()
        response = supabase.rpc(
            "match_documents",
            {
                "query_embedding": query_vector,
                "match_threshold": 0.3,
                "match_count": top_k,
            },
        ).execute()

        # Step 3: format results
        if response.data:
            return [
                {
                    "text": doc["content"],
                    "source": doc.get("source", "unknown"),
                    "page": doc.get("page", 0),
                    "similarity": doc.get("similarity", 0),
                }
                for doc in response.data
            ]

        return []

    except Exception as e:
        print(f"  ⚠️ Knowledge base search failed: {e}")
        return []