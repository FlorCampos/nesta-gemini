"""Nesta AI — Minimum critical tests.
Run: docker compose exec backend python -m pytest tests/ -v
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.guardrails.crisis import check_wellbeing
from app.guardrails.filter import is_out_of_scope
from app.core.modes import detect_mode
from app.insights.anonymiser import anonymise


# ============================================
# TEST 1 — Crisis detection (user safety)
# ============================================

def test_crisis_level2_detects_suicidal():
    result = check_wellbeing("I want to end my life")
    assert result["level"] == "crisis"

def test_crisis_level2_detects_self_harm():
    result = check_wellbeing("I want to kill myself")
    assert result["level"] == "crisis"

def test_crisis_level1_detects_distress():
    result = check_wellbeing("I feel hopeless")
    assert result["level"] == "distress"

def test_crisis_level1_detects_worthless():
    result = check_wellbeing("I feel worthless and nobody cares")
    assert result["level"] == "distress"

def test_crisis_none_for_normal_question():
    result = check_wellbeing("What is HerTechReady?")
    assert result["level"] == "none"

def test_crisis_none_for_career_question():
    result = check_wellbeing("I want to pivot into tech")
    assert result["level"] == "none"

def test_crisis_response_has_hotlines():
    result = check_wellbeing("I want to end my life")
    assert "1-833-456-4566" in result["response"]

def test_distress_response_has_no_hotlines():
    result = check_wellbeing("I feel hopeless")
    assert "1-833-456-4566" not in result["response"]


# ============================================
# TEST 2 — Out-of-scope filter
# ============================================

def test_medical_is_out_of_scope():
    assert is_out_of_scope("What medication should I take?") == True

def test_political_is_out_of_scope():
    assert is_out_of_scope("Who should I vote for?") == True

def test_career_is_not_out_of_scope():
    assert is_out_of_scope("How can I pivot into tech?") == False

def test_conference_is_not_out_of_scope():
    assert is_out_of_scope("What time is the panel?") == False


# ============================================
# TEST 3 — Mode detection
# ============================================

def test_conference_mode():
    result = detect_mode("What time is the panel?")
    assert "mode1" in result or "conference" in result.lower()

def test_career_mode():
    result = detect_mode("I want to pivot into tech")
    assert "mode2" in result or "career" in result.lower()

def test_exploration_mode():
    result = detect_mode("What is Intelligent Nest?")
    assert "mode" in result


# ============================================
# TEST 4 — PII Anonymization
# ============================================

def test_anonymise_removes_email():
    result = anonymise("Contact me at maria@gmail.com")
    assert "maria@gmail.com" not in result
    assert "[EMAIL]" in result

def test_anonymise_removes_phone():
    result = anonymise("Call me at 514-555-1234")
    assert "514-555-1234" not in result

def test_anonymise_keeps_normal_text():
    result = anonymise("I want to pivot into tech")
    assert "pivot into tech" in result

def test_anonymise_removes_salary():
    result = anonymise("I make $78,000 per year")
    assert "$78,000" not in result or "[SALARY]" in result