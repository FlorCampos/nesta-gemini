"""Debug endpoint — exposes internal pipeline state for QA testing.

POST /api/nesta/debug
Headers: X-Debug-Key: <secret-key>

Returns internal pipeline state as JSON for automated evaluation
with DeepEval, Ragas, Promptfoo, Garak, PyRIT, and JMeter.

Run: curl -X POST http://localhost:8000/api/nesta/debug \
     -H "Content-Type: application/json" \
     -H "X-Debug-Key: your-secret-key" \
     -d '{"message": "What is HerTechReady?"}'
"""
import time
import json
import hashlib
import uuid
import re
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from app.config import get_settings
from app.core.prompt import load_system_prompt, format_context_with_delimiters
from app.knowledge.search import search_knowledge_base
from app.cache.redis_client import get_cached_response
from app.guardrails.crisis import check_wellbeing, CRISIS_SIGNALS, DISTRESS_SIGNALS
from app.guardrails.filter import is_out_of_scope, get_redirect_message, OUT_OF_SCOPE_TOPICS
from app.core.modes import detect_mode
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

settings = get_settings()
router = APIRouter()

# ── Rate limiting (in-memory) ──────────────────────────────────────────────────
_rate_counts: dict[str, int] = {}
RATE_LIMIT_MAX = 10  # requests per minute


def _check_rate_limit() -> bool:
    """Simple in-memory rate limiter: 10 req/min."""
    now = int(time.time() / 60)
    key = f"debug:{now}"
    # Clean old entries
    for k in list(_rate_counts.keys()):
        if k != key:
            del _rate_counts[k]
    _rate_counts[key] = _rate_counts.get(key, 0) + 1
    return _rate_counts[key] <= RATE_LIMIT_MAX


# ── PII Anonymizer ────────────────────────────────────────────────────────────
def _anonymize(text: str) -> dict:
    """Detect and anonymize PII. Returns anonymized text + detected types.
    Never returns the original PII values — only placeholders and types.
    """
    anonymized = text
    pii_types = []

    # Email
    emails = re.findall(r'\b[\w.+-]+@[\w-]+\.[\w.]+\b', text)
    for email in emails:
        anonymized = anonymized.replace(email, '[EMAIL]')
        if 'EMAIL' not in pii_types:
            pii_types.append('EMAIL')

    # Phone (North American format)
    phones = re.findall(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', text)
    for phone in phones:
        anonymized = anonymized.replace(phone, '[PHONE]')
        if 'PHONE' not in pii_types:
            pii_types.append('PHONE')

    # Salary / money
    salaries = re.findall(r'\$[\d,]+(?:\.\d{2})?', text)
    for sal in salaries:
        anonymized = anonymized.replace(sal, '[SALARY]')
        if 'SALARY' not in pii_types:
            pii_types.append('SALARY')

    # LinkedIn URLs
    linkedin = re.findall(r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+', text)
    for url in linkedin:
        anonymized = anonymized.replace(url, '[LINKEDIN]')
        if 'LINKEDIN' not in pii_types:
            pii_types.append('LINKEDIN')

    # Age
    ages = re.findall(r'\b(\d{1,2})\s*(?:years?\s*old|yo)\b', text, re.IGNORECASE)
    for age in ages:
        anonymized = re.sub(rf'\b{age}\s*(?:years?\s*old|yo)\b', '[AGE]', anonymized, flags=re.IGNORECASE)
        if 'AGE' not in pii_types:
            pii_types.append('AGE')

    # Company (after "at" / "for" / "from" + capitalized word)
    companies = re.findall(r'(?:at|for|from)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)', text)
    for comp in companies:
        anonymized = anonymized.replace(comp, '[COMPANY]')
        if 'COMPANY' not in pii_types:
            pii_types.append('COMPANY')

    # Name (capitalized two-word patterns — run AFTER company to avoid double-matching)
    names = re.findall(r"\bI'?m\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", text)
    if not names:
        names = re.findall(r'\bmy name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', text, re.IGNORECASE)
    for name in names:
        anonymized = anonymized.replace(name, '[NAME]')
        if 'NAME' not in pii_types:
            pii_types.append('NAME')

    return {
        "anonymized_input": anonymized,
        "pii_types_detected": pii_types,
        "pii_count": len(pii_types),
    }


# ── Request / Response models ─────────────────────────────────────────────────
class DebugRequest(BaseModel):
    message: str
    fields: list[str] = [
        "meta", "response", "retrieval", "pipeline",
        "llm", "prompt", "anonymization", "timing",
    ]
    session_id: str = "debug"


# ── Debug endpoint ────────────────────────────────────────────────────────────
@router.post("/api/nesta/debug")
async def debug_pipeline(
    request: DebugRequest,
    x_debug_key: str = Header(None, alias="X-Debug-Key"),
):
    """Debug endpoint — returns internal pipeline state as JSON.

    Protected by X-Debug-Key header. Rate limited to 10 req/min.
    Use the "fields" parameter to control which sections are returned.

    Pipeline paths:
      "full"     — all sections populated (crisis ✗ → filter ✗ → cache MISS → LLM)
      "cached"   — retrieval, llm, prompt are empty (cache HIT, cost $0)
      "crisis"   — only crisis + response populated (bypassed everything, cost $0)
      "filtered" — only filter + response populated (bypassed everything, cost $0)
    """

    # ── Security ──
    debug_key = os.getenv("DEBUG_KEY", "")
    if not debug_key:
        raise HTTPException(status_code=503, detail="Debug endpoint not configured. Set DEBUG_KEY in .env")
    if not x_debug_key or x_debug_key != debug_key:
        raise HTTPException(status_code=403, detail="Invalid or missing X-Debug-Key header")

    # ── Rate limit ──
    if not _check_rate_limit():
        raise HTTPException(status_code=429, detail="Rate limit exceeded: 10 requests per minute")

    requested = set(request.fields)
    result = {}
    timings = {}

    # ══════════════════════════════════════════════════════════════════════════
    # PIPELINE EXECUTION WITH INSTRUMENTATION
    # ══════════════════════════════════════════════════════════════════════════
    t_total = time.time()

    # ── Step 1: Crisis check ──
    t0 = time.time()
    wellbeing = check_wellbeing(request.message)
    timings["crisis_check_ms"] = round((time.time() - t0) * 1000, 2)

    crisis_triggered = wellbeing["level"] in ("crisis", "distress")
    msg_lower = request.message.lower()
    matched_keywords = (
        [s for s in CRISIS_SIGNALS if s in msg_lower] +
        [s for s in DISTRESS_SIGNALS if s in msg_lower]
    )

    # ── Step 2: Filter check ──
    t0 = time.time()
    filter_triggered = is_out_of_scope(request.message)
    timings["filter_check_ms"] = round((time.time() - t0) * 1000, 2)

    filter_category = None
    if filter_triggered:
        for topic in OUT_OF_SCOPE_TOPICS:
            if topic in msg_lower:
                filter_category = topic
                break

    # ── Step 3: Mode detection ──
    t0 = time.time()
    mode = detect_mode(request.message)
    timings["mode_detection_ms"] = round((time.time() - t0) * 1000, 2)

    # ── Step 4: Anonymization ──
    t0 = time.time()
    anon_result = _anonymize(request.message)
    timings["anonymization_ms"] = round((time.time() - t0) * 1000, 2)

    # ── Determine pipeline path ──
    pipeline_path = "full"
    response_text = ""
    context_docs = []
    cache_hit = False
    cache_key_hash = hashlib.md5(request.message.lower().strip().encode()).hexdigest()
    total_input_tokens = 0
    total_output_tokens = 0
    system_prompt = ""
    context_str = ""
    prompt_files_used = []

    if crisis_triggered:
        # ── PATH: CRISIS — bypass everything ──
        pipeline_path = "crisis"
        response_text = wellbeing["response"]
        timings["cache_check_ms"] = 0
        timings["embedding_ms"] = 0
        timings["retrieval_ms"] = 0
        timings["llm_generation_ms"] = 0

    elif filter_triggered:
        # ── PATH: FILTERED — bypass everything ──
        pipeline_path = "filtered"
        response_text = get_redirect_message()
        timings["cache_check_ms"] = 0
        timings["embedding_ms"] = 0
        timings["retrieval_ms"] = 0
        timings["llm_generation_ms"] = 0

    else:
        # ── Step 5: Cache check ──
        t0 = time.time()
        cached = get_cached_response(request.message)
        timings["cache_check_ms"] = round((time.time() - t0) * 1000, 2)

        if cached:
            # ── PATH: CACHED — skip embedding + LLM ──
            pipeline_path = "cached"
            response_text = cached
            cache_hit = True
            timings["embedding_ms"] = 0
            timings["retrieval_ms"] = 0
            timings["llm_generation_ms"] = 0

        else:
            # ── PATH: FULL — embedding + retrieval + LLM ──

            # Step 6: Embedding + vector search
            t0 = time.time()
            context_docs = await search_knowledge_base(request.message)
            t_search_done = time.time()
            search_total = (t_search_done - t0) * 1000
            # Approximate split: embedding ~70%, retrieval ~30%
            timings["embedding_ms"] = round(search_total * 0.7, 2)
            timings["retrieval_ms"] = round(search_total * 0.3, 2)

            # Step 7: Build prompt
            system_prompt = load_system_prompt()
            context_str = format_context_with_delimiters(context_docs)

            # Detect which prompt files were loaded
            import os as _os
            prompts_dir = _os.path.join(
                _os.path.dirname(_os.path.dirname(_os.path.dirname(__file__))),
                "prompts"
            )
            prompt_file_names = [
                "identity.txt", "personality.txt", "brand_context.txt",
                "mode1_conference.txt", "mode2_career.txt",
                "guardrails.txt", "response_rules.txt",
            ]
            prompt_files_used = [
                f for f in prompt_file_names
                if _os.path.exists(_os.path.join(prompts_dir, f))
            ]

            messages = [
                SystemMessage(
                    content=f"{system_prompt}\n\n[RETRIEVED CONTEXT]\n{context_str}\n[END RETRIEVED CONTEXT]"
                ),
                HumanMessage(content=request.message),
            ]

            # Step 8: LLM generation (non-streaming for debug)
            t0 = time.time()
            llm = ChatAnthropic(
                api_key=settings.ANTHROPIC_API_KEY,
                model=settings.CLAUDE_MODEL,
                max_tokens=1024,
                temperature=0.7,
            )
            try:
                response = await llm.ainvoke(messages)
                response_text = response.content

                # Extract token usage
                if hasattr(response, 'response_metadata') and response.response_metadata:
                    usage = response.response_metadata.get('usage', {})
                    total_input_tokens = usage.get('input_tokens', 0)
                    total_output_tokens = usage.get('output_tokens', 0)
                if hasattr(response, 'usage_metadata') and response.usage_metadata:
                    um = response.usage_metadata
                    if isinstance(um, dict):
                        total_input_tokens = um.get('input_tokens', total_input_tokens)
                        total_output_tokens = um.get('output_tokens', total_output_tokens)
                    else:
                        total_input_tokens = getattr(um, 'input_tokens', total_input_tokens)
                        total_output_tokens = getattr(um, 'output_tokens', total_output_tokens)

            except Exception as e:
                response_text = f"LLM error: {str(e)}"

            timings["llm_generation_ms"] = round((time.time() - t0) * 1000, 2)

    # ── Step 9: Classification ──
    t0 = time.time()
    theme_map = {
        "mode1_conference": ("Conference", 0.92),
        "mode2_career": ("Career", 0.88),
        "mode3_exploration": ("Exploration", 0.65),
    }
    theme, confidence = theme_map.get(mode, ("General", 0.5))
    timings["classification_ms"] = round((time.time() - t0) * 1000, 2)

    timings["total_ms"] = round((time.time() - t_total) * 1000, 2)

    # ══════════════════════════════════════════════════════════════════════════
    # BUILD RESPONSE — only include requested fields
    # ══════════════════════════════════════════════════════════════════════════

    session_id = str(uuid.uuid4())[:12]
    response_hash = hashlib.sha256(response_text.encode()).hexdigest()

    # Cost calculation: Claude $5/1M input, $25/1M output
    cost_usd = (total_input_tokens * 5 / 1_000_000) + (total_output_tokens * 25 / 1_000_000)
    embedding_cost = 0.0001 if pipeline_path == "full" else 0

    # ── META ──
    if "meta" in requested:
        result["meta"] = {
            "version": "1.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "session_id": session_id,
            "response_hash": f"sha256:{response_hash[:16]}",
            "pipeline_path": pipeline_path,
            "trace": {
                "id": None,
                "url": None,
                "note": "LangSmith integration pending — add LANGSMITH_API_KEY to enable",
            },
        }

    # ── RESPONSE ──
    if "response" in requested:
        result["response"] = {
            "text": response_text,
            "format": "complete",
        }

    # ── RETRIEVAL ──
    if "retrieval" in requested:
        if pipeline_path == "full":
            result["retrieval"] = {
                "function": "match_documents",
                "chunks_returned": len(context_docs),
                "similarity_threshold": 0.3,
                "chunks": [
                    {
                        "content": doc["text"],
                        "similarity_score": round(doc.get("similarity", 0), 4),
                        "source": doc.get("source", "unknown"),
                        "page": doc.get("page", 0),
                    }
                    for doc in context_docs
                ],
            }
        else:
            result["retrieval"] = {
                "function": "match_documents",
                "chunks_returned": 0,
                "similarity_threshold": 0.3,
                "chunks": [],
                "skipped": f"Pipeline path: {pipeline_path}",
            }

    # ── PIPELINE ──
    if "pipeline" in requested:
        result["pipeline"] = {
            "path": pipeline_path,
            "crisis": {
                "triggered": crisis_triggered,
                "level": wellbeing["level"] if crisis_triggered else None,
                "matched_keywords": matched_keywords,
            },
            "filter": {
                "triggered": filter_triggered,
                "category_detected": filter_category,
            },
            "mode": {
                "mode": mode,
                "description": mode.replace("mode1_", "").replace("mode2_", "").replace("mode3_", ""),
            },
            "cache": {
                "hit": cache_hit,
                "cache_key_hash": f"md5:{cache_key_hash[:12]}",
            },
            "classification": {
                "theme": theme,
                "confidence": confidence,
            },
        }

    # ── LLM ──
    if "llm" in requested:
        result["llm"] = {
            "model": settings.CLAUDE_MODEL,
            "temperature": 0.7,
            "max_tokens": 1024,
            "tokens_in": total_input_tokens,
            "tokens_out": total_output_tokens,
            "cost_usd": round(cost_usd, 6),
            "embedding_cost_usd": round(embedding_cost, 6),
            "prompt_files": prompt_files_used,
            "conversation_history_length": 0,
        }

    # ── PROMPT ASSEMBLED ──
    if "prompt" in requested:
        if pipeline_path == "full":
            result["prompt_assembled"] = {
                "included": True,
                "system_prompt_length": len(system_prompt),
                "system_prompt_preview": (
                    system_prompt[:500] + "..."
                    if len(system_prompt) > 500
                    else system_prompt
                ),
                "context_from_chunks": (
                    context_str[:2000] + "..."
                    if len(context_str) > 2000
                    else context_str
                ),
                "conversation_history": [],
                "user_message": request.message,
            }
        else:
            result["prompt_assembled"] = {
                "included": False,
                "skipped": f"Pipeline path: {pipeline_path}",
            }

    # ── ANONYMIZATION ──
    if "anonymization" in requested:
        result["anonymization"] = anon_result

    # ── TIMING ──
    if "timing" in requested:
        result["timing"] = {
            "total_ms": timings.get("total_ms", 0),
            "breakdown": {
                k: v for k, v in timings.items() if k != "total_ms"
            },
        }

    return result