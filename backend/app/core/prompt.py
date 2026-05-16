"""Prompt engine — loads and assembles system prompt from 7 .txt files."""
import os

PROMPTS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "prompts"
)

PROMPT_FILES = [
    "identity.txt",
    "personality.txt",
    "brand_context.txt",
    "mode1_conference.txt",
    "mode2_career.txt",
    "guardrails.txt",
    "response_rules.txt",
]


def load_system_prompt() -> str:
    """Load and concatenate all prompt .txt files into one system prompt."""
    parts = []
    for filename in PROMPT_FILES:
        filepath = os.path.join(PROMPTS_DIR, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    section = filename.replace(".txt", "").upper()
                    parts.append(f"[{section}]\n{content}\n[END {section}]")
    return "\n\n".join(parts)


def format_context_with_delimiters(documents: list[dict]) -> str:
    """Format retrieved documents with source delimiters."""
    if not documents:
        return "No relevant documents found in the knowledge base."

    parts = []
    for doc in documents:
        source = doc.get("source", "unknown")
        text = doc.get("text", "")
        similarity = doc.get("similarity", 0)
        parts.append(f"[SOURCE: {source} | relevance: {similarity:.2f}]\n{text}\n[END SOURCE]")

    return "\n\n".join(parts)