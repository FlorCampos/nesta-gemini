"""Crisis detection — two levels: distress (empathy) and crisis (resources)."""

# Level 1: Emotional distress — needs empathy, NOT crisis resources
DISTRESS_SIGNALS = [
    "hopeless", "worthless", "nobody cares", "no one cares",
    "give up", "can't go on", "falling apart", "overwhelmed",
    "lost", "stuck", "failing", "broken",
]

# Level 2: Actual crisis — needs professional resources
CRISIS_SIGNALS = [
    "want to die", "kill myself", "end my life", "suicide",
    "self harm", "self-harm", "cutting myself",
    "no reason to live",
]

DISTRESS_RESPONSE = (
    "I hear you — that sounds really heavy, and I want you to know "
    "those feelings are valid. A lot of women navigating career changes "
    "go through moments like this, and you're not alone in it. "
    "If you'd like, I'm here to talk through what's going on and see "
    "if there's a way I can help you find a path forward. "
    "What's weighing on you the most right now?"
)

CRISIS_RESPONSE = (
    "I hear you, and what you're feeling matters. You don't have to "
    "go through this alone. Please reach out to someone who can help:\n\n"
    "Talk Suicide Canada: 1-833-456-4566 (24/7)\n"
    "Crisis Text Line: Text HOME to 741741\n"
    "Quebec crisis line: 1-866-APPELLE (277-3553)\n\n"
    "These are free and confidential. "
    "I'm here for career conversations whenever you're ready."
)


def check_wellbeing(message: str) -> dict:
    """Check message for distress or crisis signals.
    
    Returns: {"level": "none" | "distress" | "crisis", "response": str | None}
    """
    message_lower = message.lower()

    # Check crisis first (higher priority)
    if any(signal in message_lower for signal in CRISIS_SIGNALS):
        return {"level": "crisis", "response": CRISIS_RESPONSE}

    # Check distress
    if any(signal in message_lower for signal in DISTRESS_SIGNALS):
        return {"level": "distress", "response": DISTRESS_RESPONSE}

    return {"level": "none", "response": None}