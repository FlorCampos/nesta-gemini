"""LangChain RAG chain — Claude for conversations + Gemini vector search + Redis cache."""
import json
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from app.config import get_settings
from app.core.prompt import load_system_prompt, format_context_with_delimiters
from app.knowledge.search import search_knowledge_base
from app.cache.redis_client import get_cached_response, cache_response

settings = get_settings()

llm = ChatAnthropic(
    api_key=settings.ANTHROPIC_API_KEY,
    model=settings.CLAUDE_MODEL,
    max_tokens=500,
    temperature=0.7,
    stream_usage=True,
)

conversation_history: dict[str, list] = {}
SYSTEM_PROMPT = load_system_prompt()


async def generate_response(message: str, session_id: str = "default") -> str:
    # Check cache first
    cached = get_cached_response(message)
    if cached:
        return cached

    context_docs = await search_knowledge_base(message)
    context = format_context_with_delimiters(context_docs)
    messages = _build_messages(session_id, message, context)
    response = await llm.ainvoke(messages)
    _store_history(session_id, message, response.content)

    # Cache with real token count
    input_tokens = response.usage.input_tokens if hasattr(response, 'usage') and response.usage else 0
    output_tokens = response.usage.output_tokens if hasattr(response, 'usage') and response.usage else 0
    cache_response(message, response.content, input_tokens=input_tokens, output_tokens=output_tokens)

    return response.content


async def generate_response_stream(message: str, session_id: str = "default"):
    # Check cache first
    cached = get_cached_response(message)
    if cached:
        yield f"data: {json.dumps({'text': cached})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
        return

    context_docs = await search_knowledge_base(message)
    context = format_context_with_delimiters(context_docs)
    messages = _build_messages(session_id, message, context)

    full_response = ""
    total_input_tokens = 0
    total_output_tokens = 0

    try:
        async for chunk in llm.astream(messages):
            if chunk.content:
                full_response += chunk.content
                yield f"data: {json.dumps({'text': chunk.content})}\n\n"
            if hasattr(chunk, 'usage_metadata') and chunk.usage_metadata:
                um = chunk.usage_metadata
                if isinstance(um, dict):
                    total_input_tokens = um.get('input_tokens', 0) or total_input_tokens
                    total_output_tokens = um.get('output_tokens', 0) or total_output_tokens
                else:
                    total_input_tokens = getattr(um, 'input_tokens', 0) or total_input_tokens
                    total_output_tokens = getattr(um, 'output_tokens', 0) or total_output_tokens
            if hasattr(chunk, 'response_metadata') and chunk.response_metadata:
                usage = chunk.response_metadata.get('usage', {})
                if usage:
                    total_input_tokens = usage.get('input_tokens', 0) or total_input_tokens
                    total_output_tokens = usage.get('output_tokens', 0) or total_output_tokens
    except Exception as e:
        print(f"  ⚠️ Claude streaming error: {e}")
        if not full_response:
            full_response = "I'm having trouble connecting right now. Please try again in a moment."
            yield f"data: {json.dumps({'text': full_response})}\n\n"

    _store_history(session_id, message, full_response)
    cache_response(message, full_response, input_tokens=total_input_tokens, output_tokens=total_output_tokens)

    yield f"data: {json.dumps({'done': True})}\n\n"


def _build_messages(session_id: str, message: str, context: str) -> list:
    messages = [
        SystemMessage(content=f"{SYSTEM_PROMPT}\n\n[RETRIEVED CONTEXT]\n{context}\n[END RETRIEVED CONTEXT]"),
    ]
    history = conversation_history.get(session_id, [])
    for msg in history[-10:]:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))
    messages.append(HumanMessage(content=message))
    return messages


def _store_history(session_id: str, user_message: str, ai_response: str):
    if session_id not in conversation_history:
        conversation_history[session_id] = []
    conversation_history[session_id].append({"role": "user", "content": user_message})
    conversation_history[session_id].append({"role": "assistant", "content": ai_response})
    if len(conversation_history[session_id]) > 20:
        conversation_history[session_id] = conversation_history[session_id][-20:]