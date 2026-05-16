"""Vision AI — uses Claude to describe charts, graphs, tables in PDFs."""
import anthropic
import base64
from app.config import get_settings

settings = get_settings()

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

VISION_PROMPT = """Look at this image from a PDF document about careers, employment, or AI.
Describe ALL of the following in detail:

1. What type of visual is this? (bar chart, table, scatter plot, diagram, slide, infographic)
2. What is the title or heading?
3. List ALL numbers, percentages, and data points you can see — be exact, do not round
4. What are the axis labels or column headers?
5. What is the key insight or takeaway?
6. What is the source if visible?

Be specific with every number. Do not summarize — extract everything.
Write your response as a continuous paragraph, not a list."""


async def describe_image(image_bytes: bytes) -> str:
    """Send an image to Claude Vision and get a text description."""
    try:
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": VISION_PROMPT,
                        },
                    ],
                }
            ],
        )

        if message.content and message.content[0].text:
            return message.content[0].text.strip()

        return ""

    except Exception as e:
        print(f"      ⚠️ Vision AI failed: {e}")
        return ""