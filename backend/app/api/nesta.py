"""Nesta AI Assistant — main chat endpoint with guardrails."""
import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.config import get_settings
from app.core.chain import generate_response, generate_response_stream
from app.core.modes import detect_mode
from app.models.schemas import NestaChatRequest, NestaChatResponse
from app.insights.logger import log_insight
from app.guardrails.crisis import check_wellbeing
from app.guardrails.filter import is_out_of_scope, get_redirect_message

router = APIRouter()
settings = get_settings()


async def sse_single_message(text: str):
    """Send a single message as SSE stream (for guardrail responses)."""
    yield f"data: {json.dumps({'text': text})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"


def stream_response(generator):
    """Wrap any generator as SSE StreamingResponse."""
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/api/nesta")
async def chat_with_nesta(request: NestaChatRequest):
    """Main endpoint — SSE streaming with guardrails."""
    if not settings.NESTA_ENABLED:
        return stream_response(
            sse_single_message("Nesta is taking a break. She'll be back soon. 🦋")
        )

    # Wellbeing check — highest priority
    wellbeing = check_wellbeing(request.message)
    if wellbeing["level"] in ("crisis", "distress"):
        return stream_response(sse_single_message(wellbeing["response"]))

    # Out-of-scope check
    if is_out_of_scope(request.message):
        return stream_response(sse_single_message(get_redirect_message()))

    # Detect mode
    mode = detect_mode(request.message)

    # Fire-and-forget: log the insight
    asyncio.create_task(
        log_insight(
            question=request.message,
            consent=request.consent_given,
            mode=mode,
        )
    )

    return stream_response(
        generate_response_stream(
            message=request.message,
            session_id=request.session_id,
        )
    )


@router.post("/api/nesta/simple")
async def chat_simple(request: NestaChatRequest):
    """Non-streaming version for testing."""
    if not settings.NESTA_ENABLED:
        return NestaChatResponse(
            message="Nesta is taking a break. She'll be back soon.",
            status="disabled",
            mode="offline",
        )

    wellbeing = check_wellbeing(request.message)
    if wellbeing["level"] in ("crisis", "distress"):
        return NestaChatResponse(
            message=wellbeing["response"],
            status="ok",
            mode=wellbeing["level"],
        )

    if is_out_of_scope(request.message):
        return NestaChatResponse(
            message=get_redirect_message(),
            status="ok",
            mode="filtered",
        )

    mode = detect_mode(request.message)

    asyncio.create_task(
        log_insight(
            question=request.message,
            consent=request.consent_given,
            mode=mode,
        )
    )

    response = await generate_response(
        message=request.message,
        session_id=request.session_id,
    )

    return NestaChatResponse(
        message=response,
        status="ok",
        mode=mode,
    )