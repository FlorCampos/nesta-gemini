"""Async fire-and-forget insight logger — writes to Supabase insights table."""
from datetime import datetime, timezone
from app.knowledge.supabase_client import get_supabase
from app.insights.anonymiser import anonymise
from app.insights.classifier import classify_question


async def log_insight(question: str, consent: bool, mode: str = "conversation"):
    """Anonymise, classify, and store a question. Fire-and-forget.

    Rules:
    1. If consent is False, do nothing
    2. Anonymise BEFORE classifying
    3. If anything fails, fail silently — never block Nesta's response
    """
    if not consent:
        return

    try:
        # Step 1: Anonymise
        anon_question = anonymise(question)

        # Step 2: Classify
        theme = await classify_question(anon_question)

        # Step 3: Store in Supabase
        supabase = get_supabase()
        supabase.table("insights").insert({
            "created_at": datetime.now(timezone.utc).isoformat(),
            "theme": theme,
            "sub_theme": None,
            "anon_question": anon_question,
            "consent_given": consent,
            "mode": mode,
        }).execute()

    except Exception as e:
        # Rule 3: fail silently
        print(f"  ⚠️ Insight logging failed (non-blocking): {e}")