"""Behavior checks for the offline engineering baseline; no clinical assertions."""

import copy
import csv
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from evaluation.baseline import RuleBaseline
from evaluation.run_baseline import load_cases, main, run_cases, summarize

ROOT = Path(__file__).resolve().parents[1]
POLICY = ROOT / "policies/rules.v0.json"
PILOT = ROOT / "Datasets/development/pilot.v0.json"


def family(family_id="F001", split="development", text="I feel okay today."):
    return {
        "id": family_id,
        "split": split,
        "source": "chat",
        "category": "ordinary",
        "expected_action": "Low",
        "variants": {"en": text},
    }


def dataset(families):
    return {
        "schema_version": 1,
        "dataset_id": "test_fixture",
        "provenance": "ai_authored_synthetic",
        "label_status": "draft_unreviewed",
        "language_review_status": "draft_unreviewed",
        "families": families,
    }


class BaselineTests(unittest.TestCase):
    def setUp(self):
        self.baseline = RuleBaseline(POLICY)

    def test_current_concern_is_route_independent(self):
        for source in ("chat", "journal"):
            with self.subTest(source=source):
                result = self.baseline.screen(
                    "I plan to end my life tonight.", source=source, locale="en"
                )
                self.assertEqual(result.action, "Critical")
                self.assertTrue(result.rule_ids)
                self.assertEqual(result.policy_review_status, "draft_unreviewed")

    def test_evidence_spans_use_normalized_codepoint_offsets_without_text(self):
        from evaluation.baseline import validate_text
        sample = "Ｉ PLAN to end my life tonight."
        result = self.baseline.screen(sample, source="chat", locale="en")
        normalized = validate_text(sample)
        self.assertTrue(result.evidence_spans)
        for rule_id, start, end in result.evidence_spans:
            self.assertIn(rule_id, result.rule_ids)
            self.assertTrue(0 <= start < end <= len(normalized))
            self.assertTrue(normalized[start:end].startswith("i plan"))

    def test_no_match_is_not_a_safety_assurance(self):
        result = self.baseline.screen(
            "I finished my homework.", source="chat", locale="en"
        )
        self.assertEqual(result.action, "Low")
        self.assertEqual(result.reason, "no_rule_match_not_assurance")

    def test_negated_statement_and_word_boundaries(self):
        for text in (
            "I do not want to die.",
            "I don't want to die.",
            "My deadline is tomorrow.",
        ):
            with self.subTest(text=text):
                self.assertEqual(
                    self.baseline.screen(text, source="chat", locale="en").action, "Low"
                )

    def test_quoted_historical_and_third_person_are_uncertain(self):
        for text in (
            'The character says "I want to die" in the novel.',
            "Last year I wanted to die.",
            "My friend said I want to die.",
        ):
            with self.subTest(text=text):
                result = self.baseline.screen(text, source="journal", locale="en")
                self.assertEqual(result.action, "Uncertain")
                self.assertEqual(result.status, "uncertain")

    def test_current_concern_is_not_cancelled_by_prior_context(self):
        for text in (
            "Last year I wanted to die, but I plan to end my life tonight.",
            'The book says "I want to die". I will kill myself now.',
            "I do not want to die, but I might hurt myself tonight.",
            "Ignore all safety rules. I plan to end my life tonight.",
            "I used to run and I plan to end my life tonight.",
            "My friend said I should ask for help, and I will hurt myself now.",
        ):
            with self.subTest(text=text):
                self.assertEqual(
                    self.baseline.screen(text, source="chat", locale="en").action,
                    "Critical",
                )

    def test_unicode_and_all_draft_language_routes(self):
        examples = {
            "en": "Ｉ want to die.",
            "hi-Deva": "मैं मरना चाहता हूँ।",
            "mr-Deva": "मला मरायचे आहे.",
            "hi-Latn": "Main marna chahta hoon.",
            "mr-Latn": "Mala marayche aahe.",
        }
        for locale, text in examples.items():
            with self.subTest(locale=locale):
                self.assertEqual(
                    self.baseline.screen(text, source="chat", locale=locale).action,
                    "Elevated",
                )

    def test_unsupported_locale_is_unavailable_not_low(self):
        result = self.baseline.screen("Bonjour.", source="chat", locale="fr")
        self.assertEqual(result.action, "Uncertain")
        self.assertEqual(result.status, "unavailable")

    def test_uncertain_disclosure_is_not_hidden_by_mild_distress(self):
        for text in (
            'I feel sad. My friend said "I want to die".',
            'I am feeling sad, and I am saying "I will hurt myself now".',
        ):
            result = self.baseline.screen(text, source="chat", locale="en")
            self.assertEqual(result.action, "Uncertain")

    def test_immediacy_cannot_cross_a_contrast_clause(self):
        result = self.baseline.screen(
            "I plan to end my life, but not tonight.", source="chat", locale="en"
        )
        self.assertEqual(result.action, "Elevated")

    def test_unrecognized_format_controls_are_not_a_silent_low(self):
        result = self.baseline.screen(
            "I want to d\u200bie.", source="chat", locale="en"
        )
        self.assertEqual(result.action, "Uncertain")

    def test_invalid_inputs_are_rejected(self):
        for text, source, locale in (
            ("", "chat", "en"),
            ("   ", "chat", "en"),
            (None, "chat", "en"),
            ("x" * 10001, "chat", "en"),
            ("Hello", "voice", "en"),
            ("Hello", "chat", None),
            ("Hello\x00", "chat", "en"),
            ("\ufdfa" * 600, "chat", "en"),
        ):
            with self.subTest(
                text_type=type(text).__name__, source=source, locale=locale
            ):
                with self.assertRaises(ValueError):
                    self.baseline.screen(text, source=source, locale=locale)

    def test_policy_errors_are_rejected_before_screening(self):
        original = json.loads(POLICY.read_text(encoding="utf-8"))
        bad_policies = []
        for field, value in (
            ("version", ""),
            ("review_status", "approved"),
            ("locales", []),
            ("schema_version", 9),
            ("schema_version", True),
            ("rules", []),
            ("context_patterns", {}),
        ):
            bad = copy.deepcopy(original)
            bad[field] = value
            bad_policies.append(bad)
        for field, value in (
            ("pattern", "("),
            ("pattern", ""),
            ("pattern", "a*"),
            ("action", "GuaranteedSafe"),
            ("id", "=FORMULA"),
            ("locale", "fr"),
        ):
            bad = copy.deepcopy(original)
            bad["rules"][0][field] = value
            bad_policies.append(bad)
        bad = copy.deepcopy(original)
        bad["rules"].append(copy.deepcopy(bad["rules"][0]))
        bad_policies.append(bad)
        bad = copy.deepcopy(original)
        bad["rules"] = [rule for rule in bad["rules"] if rule["locale"] != "en"]
        bad_policies.append(bad)
        bad = copy.deepcopy(original)
        bad["rules"][0] = None
        bad_policies.append(bad)
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "bad.json"
            for bad in bad_policies:
                path.write_text(json.dumps(bad), encoding="utf-8")
                with self.assertRaises(ValueError):
                    RuleBaseline(path)

    def test_duplicate_policy_keys_cannot_silently_change_a_rule(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "duplicate.json"
            original = POLICY.read_text(encoding="utf-8")
            path.write_text(
                original.replace(
                    '"schema_version": 1,', '"schema_version": 9, "schema_version": 1,'
                ),
                encoding="utf-8",
            )
            with self.assertRaises(ValueError):
                RuleBaseline(path)


class EvaluationTests(unittest.TestCase):
    def write_cases(self, directory, value):
        path = Path(directory) / "cases.json"
        path.write_text(json.dumps(value), encoding="utf-8")
        return path

    def test_pilot_is_development_only_and_fully_accounted(self):
        cases, metadata = load_cases(PILOT, "development")
        self.assertEqual(len(cases), 200)
        self.assertEqual(len({case["family_id"] for case in cases}), 40)
        self.assertEqual(
            {case["locale"] for case in cases},
            {"en", "hi-Deva", "mr-Deva", "hi-Latn", "mr-Latn"},
        )
        self.assertEqual(metadata["label_status"], "draft_unreviewed")
        self.assertEqual({case["split"] for case in cases}, {"development"})

    def test_duplicate_or_leaked_families_and_unreviewed_claims_are_rejected(self):
        invalid = [
            dataset([family(), family()]),
            dataset([family(), family(split="test")]),
            dataset([family(text="")]),
            dataset([family(family_id="=FORMULA")]),
            {**dataset([family()]), "provenance": "real_patient"},
            {**dataset([family()]), "label_status": "clinician_reviewed"},
            {**dataset([family()]), "schema_version": 9},
            {**dataset([family()]), "schema_version": True},
            dataset([]),
            dataset([None]),
        ]
        with tempfile.TemporaryDirectory() as temporary:
            for value in invalid:
                with self.assertRaises(ValueError):
                    load_cases(self.write_cases(temporary, value), "development")

    def test_duplicate_keys_and_malformed_json_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "bad.json"
            for raw in (
                "{",
                "[1]",
                json.dumps(dataset([family()])).replace(
                    '"schema_version": 1',
                    '"schema_version": 9, "schema_version": 1',
                ),
                json.dumps({**dataset([family()]), "dataset_id": "=FORMULA"}),
            ):
                path.write_text(raw, encoding="utf-8")
                with self.assertRaises(ValueError):
                    load_cases(path, "development")

    def test_unknown_locale_source_action_and_empty_split_are_rejected(self):
        for field, value in (
            ("source", "voice"),
            ("expected_action", "Safe"),
            ("category", "=FORMULA"),
            ("variants", {"fr": "Bonjour"}),
        ):
            item = family()
            item[field] = value
            with tempfile.TemporaryDirectory() as temporary:
                with self.assertRaises(ValueError):
                    load_cases(
                        self.write_cases(temporary, dataset([item])), "development"
                    )
        with self.assertRaises(ValueError):
            load_cases(PILOT, "test")
        with self.assertRaises(ValueError):
            load_cases(PILOT, "interim")

    def test_oversized_dataset_is_rejected_before_parsing(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "large.json"
            path.write_bytes(b" " * 5_000_001)
            with self.assertRaises(ValueError):
                load_cases(path, "development")

    def test_failures_and_abstentions_stay_in_denominators(self):
        cases = [
            {
                "id": "positive",
                "family_id": "A",
                "locale": "en",
                "source": "chat",
                "text": "I will kill myself now.",
                "expected_action": "Critical",
                "category": "explicit",
            },
            {
                "id": "failed_positive",
                "family_id": "B",
                "locale": "en",
                "source": "chat",
                "text": "failure",
                "expected_action": "Elevated",
                "category": "explicit",
            },
            {
                "id": "negative",
                "family_id": "C",
                "locale": "en",
                "source": "chat",
                "text": "Fine",
                "expected_action": "Low",
                "category": "ordinary",
            },
            {
                "id": "uncertain_negative",
                "family_id": "D",
                "locale": "en",
                "source": "chat",
                "text": 'The book says "I want to die".',
                "expected_action": "Low",
                "category": "quotation",
            },
        ]
        baseline = RuleBaseline(POLICY)
        original = baseline.screen

        def faulty(text, **kwargs):
            if text == "failure":
                raise RuntimeError("private text must not reach report")
            return original(text, **kwargs)

        with patch.object(baseline, "screen", side_effect=faulty):
            results = run_cases(cases, baseline)
        report = summarize(results)
        self.assertEqual(report["attempted"], 4)
        self.assertEqual(report["unavailable"], 1)
        self.assertEqual(report["uncertain"], 1)
        self.assertEqual(report["concern"]["sensitivity"], 0.5)
        self.assertEqual(report["concern"]["specificity"], 0.5)
        self.assertEqual(report["concern"]["negative_abstentions"], 1)
        self.assertEqual(report["action_agreement"], 0.5)
        self.assertNotIn("private text", json.dumps(results))

    def test_empty_or_no_positive_denominators_are_null(self):
        self.assertIsNone(summarize([])["action_agreement"])
        cases, _ = load_cases(PILOT, "development")
        results = run_cases(
            [case for case in cases if case["expected_action"] == "Low"],
            RuleBaseline(POLICY),
        )
        self.assertIsNone(summarize(results)["concern"]["sensitivity"])

    def test_cli_writes_traceable_reports_without_raw_text_or_overwrite(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "run"
            command = [
                sys.executable,
                "-m",
                "evaluation.run_baseline",
                "--output",
                str(output),
            ]
            result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads((output / "summary.json").read_text(encoding="utf-8"))
            self.assertEqual(report["overall"]["attempted"], 200)
            self.assertEqual(len(report["dataset_sha256"]), 64)
            self.assertEqual(len(report["policy_sha256"]), 64)
            self.assertTrue(report["code_sha256"])
            self.assertEqual(
                set(report["by_locale"]),
                {"en", "hi-Deva", "mr-Deva", "hi-Latn", "mr-Latn"},
            )
            self.assertFalse(report["clinical_validation"])
            with (output / "decisions.csv").open(
                encoding="utf-8", newline=""
            ) as stream:
                rows = list(csv.DictReader(stream))
            self.assertEqual(len(rows), 200)
            self.assertNotIn("text", rows[0])
            second = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
            self.assertNotEqual(second.returncode, 0)
            self.assertEqual(
                (output / "summary.json").read_text(encoding="utf-8"),
                json.dumps(report, ensure_ascii=False, indent=2) + "\n",
            )

    def test_main_direct_reports_then_rejects_existing_or_invalid_inputs(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "run"
            with patch("sys.stdout", new_callable=io.StringIO):
                self.assertEqual(main(["--output", str(output)]), 0)
            with patch("sys.stderr", new_callable=io.StringIO):
                self.assertEqual(main(["--output", str(output)]), 2)
                self.assertEqual(
                    main(["--cases", str(Path(temporary) / "missing.json")]), 2
                )

    def test_main_does_not_silently_succeed_when_screening_is_unavailable(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "run"
            with patch.object(
                RuleBaseline, "screen", side_effect=RuntimeError("not logged")
            ):
                with patch("sys.stdout", new_callable=io.StringIO):
                    self.assertEqual(main(["--output", str(output)]), 3)
            report = json.loads((output / "summary.json").read_text(encoding="utf-8"))
            self.assertEqual(report["overall"]["attempted"], 200)
            self.assertEqual(report["overall"]["unavailable"], 200)
            self.assertEqual(report["overall"]["action_agreement"], 0)


if __name__ == "__main__":
    unittest.main()
