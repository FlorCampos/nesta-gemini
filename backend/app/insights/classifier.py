"""Prompt-based theme classification using Claude."""
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import get_settings
from app.insights.taxonomy import THEMES

settings = get_settings()

classifier_llm = ChatAnthropic(
    api_key=settings.ANTHROPIC_API_KEY,
    model=settings.CLAUDE_MODEL,
    max_tokens=50,
    temperature=0,
)

CLASSIFICATION_PROMPT = """Classify this question into exactly ONE theme.

Themes:
{themes}

Question: "{question}"

Respond with ONLY the theme name, nothing else. No explanation."""


async def classify_question(question: str) -> str:
    """Classify a question into one of 6 themes."""
    try:
        themes_text = "\n".join(
            f"- {name}: {description}" for name, description in THEMES.items()
        )

        messages = [
            SystemMessage(content="You are a question classifier. Respond with only the theme name."),
            HumanMessage(content=CLASSIFICATION_PROMPT.format(
                themes=themes_text,
                question=question,
            )),
        ]

        response = await classifier_llm.ainvoke(messages)
        theme = response.content.strip()

        # Validate it's a real theme
        if theme in THEMES:
            return theme

        # If Claude returned something close, try to match
        for valid_theme in THEMES:
            if valid_theme.lower() in theme.lower():
                return valid_theme

        return "Career"  # default fallback

    except Exception as e:
        print(f"  ⚠️ Classification failed: {e}")
        return "Career"