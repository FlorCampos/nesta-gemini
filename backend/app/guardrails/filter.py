"""Topic filter — detects out-of-scope questions before sending to Claude."""

OUT_OF_SCOPE_TOPICS = [
    "medical advice", "legal advice", "investment advice",
    "diagnosis", "prescription", "medication",
    "political opinion", "vote for", "election",
    "religion", "religious",
    "dating", "romantic",
]

REDIRECT_MESSAGE = (
    "That's outside what I can help with, but I appreciate you asking. "
    "I'm here to help with career guidance, the conference, and the "
    "Intelligent Nest programs. Is there something along those lines "
    "I can help you with?"
)


def is_out_of_scope(message: str) -> bool:
    """Check if a message is outside Nesta's scope."""
    message_lower = message.lower()
    return any(topic in message_lower for topic in OUT_OF_SCOPE_TOPICS)


def get_redirect_message() -> str:
    """Return the standard redirect message for out-of-scope questions."""
    return REDIRECT_MESSAGE