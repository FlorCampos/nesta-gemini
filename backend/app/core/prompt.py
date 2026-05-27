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
    from datetime import datetime
    import pytz

    # Timezone from env var — defaults to Montreal
    tz_name = os.getenv("NESTA_TIMEZONE", "America/Montreal")
    local_tz = pytz.timezone(tz_name)
    now = datetime.now(local_tz)
    today_str = now.strftime("%A, %B %d, %Y")
    time_str = now.strftime("%I:%M %p")
    conference_date = os.getenv("CONFERENCE_DATE", "Saturday, May 30, 2026")
    conference_location = os.getenv("CONFERENCE_LOCATION", "District3, Montreal")

    date_context = f"""[CURRENT_DATE_TIME]
Today is {today_str}. The current time is {time_str}.
The main conference day is {conference_date} at {conference_location}.
If today is not {conference_date}, inform users about the upcoming conference date.
If today IS {conference_date}, help users navigate the live agenda based on the current time.
[END CURRENT_DATE_TIME]"""

    parts = [date_context]

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