"""7 hard limits — checks Claude's response AFTER generation."""
import re

# Prices that don't exist in our knowledge base
FAKE_PRICE_PATTERN = re.compile(r'\$\d{1,2},?\d{3}(?:\s*[-–]\s*\$\d{1,2},?\d{3})?')

# Guarantee words
GUARANTEE_WORDS = [
    "you will get a job", "guaranteed", "you will be hired",
    "100% of participants", "everyone gets", "promise you",
    "definitely get hired", "certainly find",
]

# Track confusion signals
TRACK_CONFUSION = [
    ("hertechready", "start your own business"),
    ("hertechready", "build your own"),
    ("hertechready", "freelance"),
    ("hertechtable", "get hired"),
    ("hertechtable", "employer"),
    ("hertechtable", "resume"),
    ("mamanest", "your career"),
    ("mamanest", "get a job"),
    ("mamanest", "pivot"),
]


def check_hard_limits(response: str) -> dict:
    """Check if Claude's response violates any hard limits.
    
    Returns dict with violations found (empty = safe).
    """
    violations = []
    response_lower = response.lower()

    # Limit 1: Never invent prices
    if FAKE_PRICE_PATTERN.search(response):
        if "target" not in response_lower and "median" not in response_lower and "average" not in response_lower:
            violations.append({
                "limit": 1,
                "rule": "Never invent program details",
                "detail": "Response contains a price not from knowledge base",
            })

    # Limit 2: Never guarantee outcomes
    for phrase in GUARANTEE_WORDS:
        if phrase in response_lower:
            violations.append({
                "limit": 2,
                "rule": "Never guarantee outcomes",
                "detail": f"Found guarantee language: '{phrase}'",
            })
            break

    # Limit 4: Never confuse tracks
    for program, wrong_signal in TRACK_CONFUSION:
        if program in response_lower and wrong_signal in response_lower:
            violations.append({
                "limit": 4,
                "rule": "Never confuse the two tracks",
                "detail": f"'{program}' mentioned with '{wrong_signal}'",
            })
            break

    return {
        "safe": len(violations) == 0,
        "violations": violations,
    }