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
Today is {today_str}. The current time in Montreal is {time_str}.

Her Career Conference 2026 has two parts:
1. Main event (IN-PERSON): {conference_date} at {conference_location}, 1:30 PM - 5:00 PM
2. Online workshops (VIRTUAL): June 1-5, 2026 — different speaker each day

When the user asks "what's happening now" or "what conference is on right now":
- Compare the current time ({time_str}) with the session times in the retrieved context
- Find the session that matches the current time window
- Respond with: the session title, the speaker name, and whether it is in-person or online
- Example: "Right now, Mahsa Rezaei is presenting the Opening Keynote at District3 (in-person). This session runs from 2:15 to 2:45 PM."

When the user asks "what's next":
- Find the next upcoming session AFTER the current time
- Tell them the title, speaker, time, and format (in-person or online)

Format rules for events:
- May 30 sessions → always say "in-person at {conference_location}"
- June 1-5 workshops → always say "online / virtual"

Date logic:
- If today is BEFORE {conference_date}: tell users the conference is coming up on {conference_date}
- If today IS {conference_date}: help navigate the live agenda based on current time ({time_str})
- If today is between May 30 and June 5: tell users about upcoming online workshops
- If today matches a workshop day (June 1-5): tell them which workshop is happening today
- If today is AFTER June 5: the conference has ended, suggest exploring programs

CRITICAL: NEVER invent future conference dates, locations, or events not in your context.
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