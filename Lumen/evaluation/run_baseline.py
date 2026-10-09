"""Run the draft rule baseline on explicitly synthetic development data."""

import argparse
from collections import Counter
import csv
from dataclasses import asdict
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import platform
import sys
from time import perf_counter_ns
import uuid

from evaluation.baseline import (
    ACTIONS,
    IDENTIFIER,
    LOCALES,
    SOURCES,
    RuleBaseline,
    read_json,
    validate_text,
)

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CASES = ROOT / "Datasets/development/pilot.v0.json"
DEFAULT_POLICY = ROOT / "policies/rules.v0.json"
WARNING = "Synthetic development results with unreviewed labels and rules; not clinical validation or language qualification."


def load_cases(path: Path, split: str) -> tuple[list[dict], dict]:
    if split not in ("development", "interim"):
        raise ValueError(
            "Final qualification is not enabled in this development runner."
        )
    data, raw = read_json(path)
    if (
        not isinstance(data, dict)
        or type(data.get("schema_version")) is not int
        or data["schema_version"] != 1
    ):
        raise ValueError("Unsupported dataset schema.")
    dataset_id = data.get("dataset_id")
    if not isinstance(dataset_id, str) or not IDENTIFIER.fullmatch(dataset_id):
        raise ValueError("Invalid dataset ID.")
    if (
        data.get("provenance") != "ai_authored_synthetic"
        or data.get("label_status") != "draft_unreviewed"
        or data.get("language_review_status") != "draft_unreviewed"
    ):
        raise ValueError(
            "This runner accepts only explicitly unreviewed synthetic engineering data."
        )
    families = data.get("families")
    if not isinstance(families, list) or not families or len(families) > 5000:
        raise ValueError("Dataset requires 1–5000 families.")
    seen = set()
    cases = []
    for family in families:
        if not isinstance(family, dict):
            raise ValueError("Invalid scenario family.")
        family_id = family.get("id")
        if (
            not isinstance(family_id, str)
            or not IDENTIFIER.fullmatch(family_id)
            or family_id in seen
        ):
            raise ValueError("Duplicate, leaked or invalid family ID.")
        seen.add(family_id)
        if (
            family.get("split") not in ("development", "interim", "test")
            or family.get("source") not in SOURCES
            or family.get("expected_action") not in ACTIONS
        ):
            raise ValueError("Invalid family split, source or reference action.")
        category = family.get("category")
        if not isinstance(category, str) or not IDENTIFIER.fullmatch(category):
            raise ValueError("Invalid category.")
        variants = family.get("variants")
        if (
            not isinstance(variants, dict)
            or not variants
            or any(locale not in LOCALES for locale in variants)
        ):
            raise ValueError("Invalid language variants.")
        for locale, text in variants.items():
            validate_text(text)
            if family["split"] == split:
                cases.append(
                    {
                        "id": f"{family_id}-{locale}",
                        "family_id": family_id,
                        "locale": locale,
                        "source": family["source"],
                        "split": split,
                        "category": category,
                        "text": text,
                        "expected_action": family["expected_action"],
                    }
                )
    if not cases:
        raise ValueError("Selected split contains no cases.")
    metadata = {
        key: data[key]
        for key in (
            "dataset_id",
            "provenance",
            "label_status",
            "language_review_status",
        )
    }
    metadata.update({"dataset_sha256": hashlib.sha256(raw).hexdigest(), "split": split})
    return cases, metadata


def run_cases(cases: list[dict], baseline: RuleBaseline) -> list[dict]:
    results = []
    for case in cases:
        started = perf_counter_ns()
        try:
            decision = baseline.screen(
                case["text"], source=case["source"], locale=case["locale"]
            )
            detail = asdict(decision)
            predicted = (
                "Unavailable" if decision.status == "unavailable" else decision.action
            )
        except Exception as error:
            # Preserve attempted-case accounting; omit exception text that may contain private input.
            detail = {
                "status": "unavailable",
                "reason": "screening_exception",
                "error_type": type(error).__name__,
                "rule_ids": (),
            }
            predicted = "Unavailable"
        results.append(
            {
                **{
                    key: case[key]
                    for key in (
                        "id",
                        "family_id",
                        "locale",
                        "source",
                        "category",
                        "expected_action",
                    )
                },
                "predicted_action": predicted,
                "status": detail["status"],
                "reason": detail["reason"],
                "rule_ids": list(detail["rule_ids"]),
                "error_type": detail.get("error_type"),
                "latency_ms": (perf_counter_ns() - started) / 1_000_000,
            }
        )
    return results


def ratio(numerator: int, denominator: int) -> float | None:
    return numerator / denominator if denominator else None


def binary_metrics(results: list[dict], positive_actions: set[str]) -> dict:
    counts = Counter(tp=0, fp=0, fn=0, tn=0, negative_abstentions=0)
    excluded = 0
    for result in results:
        expected = result["expected_action"]
        if expected == "Uncertain":
            excluded += 1
            continue
        positive = expected in positive_actions
        predicted_positive = result["predicted_action"] in positive_actions
        abstained = result["status"] in ("uncertain", "unavailable")
        if positive:
            counts["tp" if predicted_positive and not abstained else "fn"] += 1
        elif abstained:
            counts["negative_abstentions"] += 1
        else:
            counts["fp" if predicted_positive else "tn"] += 1
    positives = counts["tp"] + counts["fn"]
    negatives = counts["tn"] + counts["fp"] + counts["negative_abstentions"]
    return {
        **dict(counts),
        "reference_positives": positives,
        "reference_negatives": negatives,
        "ambiguous_reference_excluded": excluded,
        "sensitivity": ratio(counts["tp"], positives),
        "specificity": ratio(counts["tn"], negatives),
        "precision": ratio(counts["tp"], counts["tp"] + counts["fp"]),
        "fpr": ratio(counts["fp"], negatives),
        "fnr": ratio(counts["fn"], positives),
    }


def summarize(results: list[dict]) -> dict:
    matrix = {
        action: {predicted: 0 for predicted in (*ACTIONS, "Unavailable")}
        for action in ACTIONS
    }
    for result in results:
        matrix[result["expected_action"]][result["predicted_action"]] += 1
    latency = sorted(result["latency_ms"] for result in results)

    def percentile(percent):
        if not latency:
            return None
        return latency[max(0, math.ceil(percent * len(latency)) - 1)]

    return {
        "attempted": len(results),
        "family_groups": len({result["family_id"] for result in results}),
        "unavailable": sum(result["status"] == "unavailable" for result in results),
        "uncertain": sum(result["status"] == "uncertain" for result in results),
        "action_agreement": ratio(
            sum(
                result["predicted_action"] == result["expected_action"]
                for result in results
            ),
            len(results),
        ),
        "confusion_matrix": matrix,
        "concern": binary_metrics(results, {"Elevated", "Critical"}),
        "urgent": binary_metrics(results, {"Critical"}),
        "screening_only_latency_ms": {
            "p50": percentile(0.50),
            "p95": percentile(0.95),
            "p99": percentile(0.99),
        },
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY)
    parser.add_argument(
        "--split", choices=("development", "interim"), default="development"
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="New output directory; existing directories are never overwritten.",
    )
    arguments = parser.parse_args(argv)
    try:
        cases, metadata = load_cases(arguments.cases, arguments.split)
        baseline = RuleBaseline(arguments.policy)
        results = run_cases(cases, baseline)
        report = {
            "schema_version": 1,
            "created_utc": datetime.now(timezone.utc).isoformat(),
            "runner": "offline_rules_development_v0",
            "warning": WARNING,
            "clinical_validation": False,
            "language_qualification": False,
            **metadata,
            "policy_version": baseline.version,
            "policy_review_status": "draft_unreviewed",
            "policy_sha256": baseline.sha256,
            "code_sha256": {
                path.name: hashlib.sha256(path.read_bytes()).hexdigest()
                for path in (Path(__file__), Path(__file__).with_name("baseline.py"))
            },
            "python_version": platform.python_version(),
            "measurement_scope": "Single-process rule screening only; no model, network, generation or referral latency.",
            "denominator_notes": "All attempted cases count in agreement. Binary endpoints exclude reference-Uncertain cases explicitly; positive abstentions count as FN, negative abstentions remain in specificity/FPR denominators and do not count as TN. Translations are correlated, not independent observations.",
            "overall": summarize(results),
            "by_locale": {
                locale: summarize(
                    [result for result in results if result["locale"] == locale]
                )
                for locale in sorted({result["locale"] for result in results})
            },
            "by_source": {
                source: summarize(
                    [result for result in results if result["source"] == source]
                )
                for source in sorted({result["source"] for result in results})
            },
            "by_category": {
                category: summarize(
                    [result for result in results if result["category"] == category]
                )
                for category in sorted({result["category"] for result in results})
            },
        }
        output = arguments.output or ROOT / "artifacts/runs" / (
            datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
            + "-"
            + uuid.uuid4().hex[:8]
        )
        output.mkdir(parents=True, exist_ok=False)
        fields = (
            "id",
            "family_id",
            "locale",
            "source",
            "category",
            "expected_action",
            "predicted_action",
            "status",
            "reason",
            "rule_ids",
            "error_type",
            "latency_ms",
        )
        with (output / "decisions.csv").open(
            "w", encoding="utf-8", newline=""
        ) as stream:
            writer = csv.DictWriter(stream, fieldnames=fields)
            writer.writeheader()
            writer.writerows(
                {**result, "rule_ids": "|".join(result["rule_ids"])}
                for result in results
            )
        (output / "summary.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(WARNING)
        print(
            f"Evaluated {len(results)} cases from {report['overall']['family_groups']} development family groups."
        )
        print(f"Report: {output.resolve() / 'summary.json'}")
        return 3 if report["overall"]["unavailable"] else 0
    except (OSError, ValueError) as error:
        print(
            f"Baseline run rejected: {type(error).__name__}. Check paths, schema, split and output directory. No clinical result was produced.",
            file=sys.stderr,
        )
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
