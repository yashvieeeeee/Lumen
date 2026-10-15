"""Reuse the offline draft baseline only for this synthetic development application."""

import hashlib
from functools import lru_cache
from pathlib import Path

from evaluation.baseline import RuleBaseline

from .schemas import EventCreate, ScreeningResult

ROOT = Path(__file__).resolve().parents[3]


@lru_cache(maxsize=1)
def get_baseline():
    # A process pins one policy; reviewed version changes require an explicit restart.
    return RuleBaseline(ROOT / "policies/rules.v0.json"), hashlib.sha256(
        (ROOT / "evaluation/baseline.py").read_bytes()
    ).hexdigest()


def screen_event(event: EventCreate, *, development: bool) -> dict:
    unavailable = {
        "status": "unavailable",
        "action": None,
        "reason": "development_only" if not development else "screening_unavailable",
        "source": event.source,
        "locale": event.locale,
    }
    if development:
        try:
            baseline, code_hash = get_baseline()
            decision = baseline.screen(event.text, source=event.source, locale=event.locale)
            result = ScreeningResult(
                status=decision.status,
                action=None if decision.status == "unavailable" else decision.action,
                reason=decision.reason,
                source=decision.source,
                locale=decision.locale,
                policy_version=decision.policy_version,
                policy_sha256=baseline.sha256,
                baseline_sha256=code_hash,
                policy_review_status=decision.policy_review_status,
                rule_ids=list(decision.rule_ids),
                evidence_spans=[
                    {"rule_id": rule_id, "start": start, "end": end}
                    for rule_id, start, end in decision.evidence_spans[:50]
                ],
                evidence_truncated=len(decision.evidence_spans) > 50,
            )
            return result.model_dump(mode="json")
        except Exception:  # noqa: BLE001 - unexpected checker faults must become unavailable.
            # No raw text, exception detail or false Low fallback leaves this boundary.
            return ScreeningResult(**unavailable).model_dump(mode="json")
    return ScreeningResult(**unavailable).model_dump(mode="json")
