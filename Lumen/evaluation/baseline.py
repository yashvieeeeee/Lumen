"""Draft rule screening for offline synthetic cases, not clinical use."""

from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
import re
import unicodedata

LOCALES = ("en", "hi-Deva", "mr-Deva", "hi-Latn", "mr-Latn")
ACTIONS = ("Low", "Moderate", "Elevated", "Critical", "Uncertain")
SOURCES = ("chat", "journal")
IDENTIFIER = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{0,79}\Z")
MAX_TEXT = 10_000
CLAUSE_BOUNDARY = re.compile(
    r"[.!?।\n;]|(?<!\w)(?:but|लेकिन|पण|lekin|pan)(?!\w)|(?<!\w)(?:and|और|आणि|aur|ani)\s+(?=(?:i|मैं|मी|main|mi)(?!\w))"
)
QUOTATION = re.compile(r'["“][^"”]*["”]')


def read_json(path: Path, limit: int = 5_000_000) -> tuple[object, bytes]:
    with Path(path).open("rb") as stream:
        raw = stream.read(limit + 1)
    if len(raw) > limit:
        raise ValueError("JSON file exceeds the size limit.")

    def unique_keys(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError("Duplicate JSON object key.")
            result[key] = value
        return result

    try:
        return json.loads(raw, object_pairs_hook=unique_keys), raw
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise ValueError("Invalid JSON file.") from error


@dataclass(frozen=True)
class Decision:
    action: str
    status: str
    reason: str
    rule_ids: tuple[str, ...]
    policy_version: str
    policy_review_status: str
    source: str
    locale: str
    evidence_spans: tuple[tuple[str, int, int], ...] = ()


def validate_text(text: object) -> str:
    if not isinstance(text, str) or not text.strip() or len(text) > MAX_TEXT:
        raise ValueError("Text must contain 1–10000 characters.")
    if any(
        unicodedata.category(char) == "Cc" and char not in "\n\r\t" for char in text
    ):
        raise ValueError("Text contains unsupported control characters.")
    normalized = (
        unicodedata.normalize("NFKC", text)
        .casefold()
        .replace("\r\n", "\n")
        .replace("\r", "\n")
    )
    normalized = re.sub(r"[^\S\n]+", " ", normalized).strip()
    if len(normalized) > MAX_TEXT:
        raise ValueError("Normalized text exceeds the character limit.")
    return normalized


class RuleBaseline:
    def __init__(self, path: Path):
        policy, raw = read_json(path, 500_000)
        try:
            if (
                not isinstance(policy, dict)
                or type(policy.get("schema_version")) is not int
                or policy["schema_version"] != 1
            ):
                raise ValueError("Unsupported policy schema.")
            version = policy.get("version")
            if not isinstance(version, str) or not re.fullmatch(
                r"[A-Za-z0-9][A-Za-z0-9_.-]{0,79}", version
            ):
                raise ValueError("Invalid policy version.")
            if (
                policy.get("review_status") != "draft_unreviewed"
                or policy.get("intended_use") != "offline_synthetic_engineering_only"
            ):
                raise ValueError(
                    "This runner accepts draft offline engineering policies only."
                )
            locales = policy.get("locales")
            if (
                not isinstance(locales, list)
                or not locales
                or len(set(locales)) != len(locales)
                or any(locale not in LOCALES for locale in locales)
            ):
                raise ValueError("Invalid policy locales.")
            context_patterns = policy.get("context_patterns")
            if not isinstance(context_patterns, dict) or set(context_patterns) != set(
                locales
            ):
                raise ValueError("Each locale needs an explicit context pattern.")
            self.context = {
                locale: self._compile(context_patterns[locale]) for locale in locales
            }
            rules = policy.get("rules")
            if not isinstance(rules, list) or not rules or len(rules) > 100:
                raise ValueError("Policy requires 1–100 rules.")
            self.rules = []
            seen = set()
            for rule in rules:
                if not isinstance(rule, dict):
                    raise ValueError("Invalid policy rule.")
                rule_id = rule.get("id")
                if (
                    not isinstance(rule_id, str)
                    or not IDENTIFIER.fullmatch(rule_id)
                    or rule_id in seen
                ):
                    raise ValueError("Invalid or duplicate rule ID.")
                if (
                    rule.get("locale") not in locales
                    or rule.get("action") not in ACTIONS[1:]
                ):
                    raise ValueError("Invalid rule locale or action.")
                self.rules.append(
                    (
                        rule_id,
                        rule["locale"],
                        rule["action"],
                        self._compile(rule.get("pattern")),
                    )
                )
                seen.add(rule_id)
            if {rule[1] for rule in self.rules} != set(locales):
                raise ValueError("Each policy locale needs rules.")
        except (json.JSONDecodeError, TypeError, re.error) as error:
            raise ValueError("Invalid policy configuration.") from error
        self.version = version
        self.locales = tuple(locales)
        self.sha256 = hashlib.sha256(raw).hexdigest()

    @staticmethod
    def _compile(pattern: object) -> re.Pattern:
        if not isinstance(pattern, str) or not pattern or len(pattern) > 512:
            raise ValueError("Pattern must contain 1–512 characters.")
        compiled = re.compile(pattern)
        if compiled.search(""):
            raise ValueError("Patterns may not match empty input.")
        return compiled

    def screen(self, text: str, *, source: str, locale: str) -> Decision:
        if source not in SOURCES or not isinstance(locale, str) or not locale:
            raise ValueError("Invalid input source or locale.")
        normalized = validate_text(text)
        evidence = []

        def decision(action, status, reason, ids=()):
            return Decision(
                action,
                status,
                reason,
                tuple(ids),
                self.version,
                "draft_unreviewed",
                source,
                locale,
                tuple(evidence),
            )

        if locale not in self.locales:
            return decision("Uncertain", "unavailable", "unsupported_locale")
        found = []
        quotes = tuple(QUOTATION.finditer(normalized))
        clauses = []
        start = 0
        for boundary in CLAUSE_BOUNDARY.finditer(normalized):
            clauses.append((start, normalized[start : boundary.start()]))
            start = boundary.end()
        clauses.append((start, normalized[start:]))
        for rule_id, rule_locale, action, pattern in self.rules:
            if rule_locale != locale:
                continue
            for offset, clause in clauses:
                for match in pattern.finditer(clause):
                    # ponytail: bounded clause/quote heuristics; semantic review is needed for general context.
                    contextual = any(
                        quote.start() <= offset + match.start()
                        and offset + match.end() <= quote.end()
                        for quote in quotes
                    ) or bool(self.context[locale].search(clause))
                    found.append((rule_id, "Uncertain" if contextual else action))
                    # Coordinates refer to normalized Unicode codepoints, never copied input text.
                    evidence.append((rule_id, offset + match.start(), offset + match.end()))
        if not found:
            if any(unicodedata.category(char) == "Cf" for char in normalized):
                return decision(
                    "Uncertain", "uncertain", "format_controls_require_clarification"
                )
            return decision("Low", "rule_only", "no_rule_match_not_assurance")
        priorities = {"Moderate": 1, "Uncertain": 2, "Elevated": 3, "Critical": 4}
        selected = max((action for _, action in found), key=priorities.get)
        ids = tuple(dict.fromkeys(rule_id for rule_id, _ in found))
        return decision(
            selected,
            "uncertain" if selected == "Uncertain" else "rule_only",
            (
                "context_requires_clarification"
                if selected == "Uncertain"
                else "matched_draft_rule"
            ),
            ids,
        )
