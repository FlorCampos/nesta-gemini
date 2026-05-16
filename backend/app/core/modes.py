"""Mode detection — classifies each question into Mode 1, 2, or 3."""

MODE_SIGNALS = {
    "mode1_conference": [
        "session", "schedule", "agenda", "speaker", "talk", "panel",
        "workshop", "what time", "when is", "where is", "happening now",
        "which room", "networking", "break", "lunch", "registration",
        "district3", "district 3", "may 30", "june 1", "june 2",
        "june 3", "june 4", "june 5", "conference", "event",
    ],
    "mode2_career": [
        "career", "job", "resume", "linkedin", "interview", "hire",
        "hiring", "pivot", "transition", "switch", "change career",
        "program", "hertechready", "hertechtable", "mamanest",
        "cohort", "portfolio", "employer", "salary", "work permit",
        "immigration", "freelance", "business", "self-employed",
        "my own", "start my", "build my", "apply", "tech job",
        "data science", "get into tech", "skills", "upskill",
        "careerzero", "clientzero", "intelligent nest",
    ],
}


def detect_mode(message: str) -> str:
    """Detect the conversation mode from the user's message.
    
    Returns: 'mode1_conference', 'mode2_career', or 'mode3_exploration'
    """
    message_lower = message.lower()

    mode1_score = sum(1 for signal in MODE_SIGNALS["mode1_conference"] if signal in message_lower)
    mode2_score = sum(1 for signal in MODE_SIGNALS["mode2_career"] if signal in message_lower)

    if mode1_score > mode2_score and mode1_score > 0:
        return "mode1_conference"
    elif mode2_score > 0:
        return "mode2_career"
    else:
        return "mode3_exploration"