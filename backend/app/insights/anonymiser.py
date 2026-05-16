"""PII detection and anonymisation with typed placeholders.
NER (names, companies) via prompt + Regex (emails, phones, salary).
"""
import re


# Regex patterns for structured PII
PII_PATTERNS = [
    (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]'),
    (r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '[PHONE]'),
    (r'\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b', '[SALARY]'),
    (r'\b\d{1,3}(?:,\d{3})*\s*(?:k|K)\b', '[SALARY]'),
    (r'\b(?:https?://)?linkedin\.com/in/[A-Za-z0-9_-]+\b', '[LINKEDIN]'),
    (r'\b(?:https?://)[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:/\S*)?\b', '[URL]'),
    (r'\b\d{1,2}\s*(?:years?\s*old|ans)\b', '[AGE]'),
    (r'\bI(?:\'m| am)\s+(\d{2,3})\b', '[AGE]'),
]

# Common first names that appear in career contexts (basic NER fallback)
NAME_INDICATORS = [
    r'\b(?:I\'m|my name is|I am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b',
]

COMPANY_INDICATORS = [
    r'\b(?:I work at|I work for|employed at|employed by|working at|working for)\s+([A-Z][A-Za-z\s&]+?)(?:\s+(?:making|earning|as|in|for|and|since|where)|\.|,|$)',
]

INSTITUTION_INDICATORS = [
    r'\b(?:I (?:studied|graduated|went to|attend|enrolled at))\s+(?:at\s+)?([A-Z][A-Za-z\s&]+?)(?:\s+(?:in|for|where|and|with)|\.|,|$)',
]

STATUS_INDICATORS = [
    r'\b(?:I\'m on|I have|I\'m a|on a)\s+((?:work|student|visitor|permanent|temporary)\s*(?:permit|visa|residency|resident|PR))\b',
]


def anonymise(text: str) -> str:
    """Replace PII with typed placeholders. One-way, irreversible."""
    result = text

    # Regex-based patterns (emails, phones, salary, URLs, age)
    for pattern, placeholder in PII_PATTERNS:
        result = re.sub(pattern, placeholder, result, flags=re.IGNORECASE)

    # Name detection
    for pattern in NAME_INDICATORS:
        result = re.sub(pattern, lambda m: m.group(0).replace(m.group(1), '[NAME]'), result)

    # Company detection
    for pattern in COMPANY_INDICATORS:
        result = re.sub(pattern, lambda m: m.group(0).replace(m.group(1), '[COMPANY]'), result, flags=re.IGNORECASE)

    # Institution detection
    for pattern in INSTITUTION_INDICATORS:
        result = re.sub(pattern, lambda m: m.group(0).replace(m.group(1), '[INSTITUTION]'), result, flags=re.IGNORECASE)

    # Immigration status detection
    for pattern in STATUS_INDICATORS:
        result = re.sub(pattern, lambda m: m.group(0).replace(m.group(1), '[STATUS]'), result, flags=re.IGNORECASE)

    return result