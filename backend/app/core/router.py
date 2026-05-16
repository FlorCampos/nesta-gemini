"""Router — determines which program to recommend based on conversation signals."""

ROUTING_SIGNALS = {
    "hertechready": [
        "get a job", "find a job", "work at a company", "get hired",
        "employment", "employer", "resume", "linkedin", "interview",
        "pivot to tech", "transition into tech", "career change",
        "tech career", "data science", "software", "developer",
        "work in tech", "join a company", "job search", "job market",
    ],
    "hertechtable": [
        "start my own", "my own business", "freelance", "self-employed",
        "be my own boss", "build my", "consulting", "clients",
        "entrepreneur", "startup", "independent", "solo",
        "build a business", "own company", "service", "pricing",
    ],
    "mamanest": [
        "my kids", "my children", "my daughter", "my son",
        "raise future", "prepare my kids", "kids and tech",
        "parenting", "family learning", "future-ready kids",
    ],
}


def detect_routing_signals(message: str) -> dict:
    """Analyze a message for routing signals.
    
    Returns dict with scores for each program and the recommended route.
    """
    message_lower = message.lower()

    scores = {}
    for program, signals in ROUTING_SIGNALS.items():
        scores[program] = sum(1 for signal in signals if signal in message_lower)

    # Determine route
    if scores["mamanest"] > 0 and scores["hertechready"] == 0 and scores["hertechtable"] == 0:
        route = "mamanest"
    elif scores["hertechtable"] > scores["hertechready"]:
        route = "hertechtable"
    elif scores["hertechready"] > 0:
        route = "hertechready"
    elif scores["mamanest"] > 0:
        # Mom mentioned but also career signals — default to career
        route = "hertechready"
    else:
        route = "the_nest"  # Not enough signals yet — explore

    return {
        "scores": scores,
        "route": route,
        "confidence": max(scores.values()) if scores.values() else 0,
        "needs_clarification": max(scores.values()) < 2 if scores.values() else True,
    }