from dataclasses import replace

import pytest
from pydantic import ValidationError

from lumen_api import screening
from lumen_api.schemas import EventCreate, EvidenceSpan, ScreeningResult


def event(text="Synthetic normal entry."):
    return EventCreate(source="journal", locale="en", text=text, expected_consent_revision=1)


def test_development_gate_and_bounded_evidence():
    disabled = screening.screen_event(event(), development=False)
    assert disabled["status"] == "unavailable" and disabled["reason"] == "development_only"
    assert disabled["action"] is None and disabled["policy_sha256"] is None
    result = screening.screen_event(event("I feel sad. " * 100), development=True)
    assert result["evidence_truncated"] and len(result["evidence_spans"]) == 50
    assert result["rule_ids"] == ["en_distress"]


def test_invalid_output_and_control_input_cannot_become_low(monkeypatch):
    result = screening.screen_event(event("Unsupported\x01control"), development=True)
    assert result["status"] == "unavailable" and result["action"] is None
    baseline, code_hash = screening.get_baseline()
    original = baseline.screen
    monkeypatch.setattr(
        baseline,
        "screen",
        lambda *args, **kwargs: replace(original(*args, **kwargs), status="invented", action="Low"),
    )
    result = screening.screen_event(event(), development=True)
    assert result["status"] == "unavailable" and result["action"] is None
    assert code_hash not in str(result)


def test_screening_schema_rejects_false_actions_and_invalid_offsets():
    result = screening.screen_event(event(), development=True)
    for extra in (
        {"status": "unavailable"},
        {"status": "uncertain"},
        {"action": "Uncertain"},
        {"policy_sha256": None},
    ):
        with pytest.raises(ValidationError):
            ScreeningResult(**(result | extra))
    with pytest.raises(ValidationError):
        EvidenceSpan(rule_id="en_distress", start=10, end=2)
