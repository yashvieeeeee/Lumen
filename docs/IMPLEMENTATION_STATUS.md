# Implementation status

Started **8 October 2026** under the [phase-by-phase plan](../IMPLEMENTATION_PLAN.md). The [task-by-task audit](PLAN_AUDIT.md) records every numbered task and requirement. This file distinguishes implemented engineering behavior from pending human review and later product work.

## Operating scope for the first milestone

The implementation begins with an **offline, synthetic-data research baseline**. Future product scope remains consenting adults aged 18+, text-first web support, submitted chat/journal processing, optional storage/memory and English/Hindi/Marathi qualification. It will provide non-diagnostic reflection/support and reviewed resource choices, with no automatic dispatch, surveillance or promised human response. These are working scope defaults carried forward from the plan, not clinical approval.

The offline runner uses synthetic development fixtures. The application implements landing, workspace, accounts, PostgreSQL, shared draft screening, journal edits, voluntary mood/history and an account-independent India public-service directory. AI/provider integration is deferred at the owner's request; personal contextual memory, generated guidance and participant collection are not enabled. Product-facing pages use concise Lumen presentation; their appearance does not establish additional capability.

## Phase 0 responsibility and data decisions

| Responsibility / dependency | Current assignment or state | Action required |
| --- | --- | --- |
| Product/project owner | Requesting project owner; individual name not recorded | Confirm team availability and intended first institution |
| Engineering implementation | Codex implementation work in this workspace | Team assigns maintainers for UI, API, models and evidence |
| Faculty guide | Dr. Prachi Raut, listed in supplied logbook S01 | Guide reviews academic scope; clinical authority is not inferred from this role |
| Clinical policy/incident owner | Qualified clinician role recommended; appointment pending | [Assign and complete the review packet](review/REVIEW_PACKET.md) |
| Hindi/Marathi review | Two independent competent reviewers per language recommended; appointment pending |400 blank A/B judgments prepared across all 200 development variants |
| Resource maintenance | Dated official-source directory implemented; named owner pending | Appoint maintainer/second verifier and complete operational contact checks before extending 8 November deadline |
| Data-governance/ethics owner | Pending | Obtain institution's actual decision for planned human/data work |
| Budget and reviewer capacity | Pending | Set monthly ceiling, annotation allocation and approved providers |
| Partner coverage/handoff | No agreement or integration | Verify service responsibilities before promising staffed support |

The supplied Group 14 team is **Yashvie Mahey, Shravani Lad, Harshit Behl and Rahil Kirtikar** (S01/S02; [source record](research/SOURCE_COVERAGE.md)). Their actual UI/API/model/evidence assignments and weekly availability have not been specified, so responsibilities are not allocated by guesswork. The faculty guide's academic role does not establish a clinical partnership, ethics approval or incident coverage.

The offline evaluation flow performs no external transmission. Synthetic fixtures/reports stay local; reports omit original scenario text and exception messages. Public resource links open only on user action, with no entry/account parameters and suppressed referrers. External datasets remain on hold. No real participant conversations have been collected for this unreviewed runner.

Consent boundaries distinguish processing, saving, future memory, purpose-specific human sharing and research. Saving is separate and defaults off; engineering checks use synthetic accounts/entries. Live withdrawal/deletion clears journal text, checks and mood; expiry/backups/restores and future derived stores remain operational dependencies. Ordinary logs do not contain entry text. Memory/review/research consent and provider-processing conditions remain separate future controls.

Clinical review questions remain open: exact action taxonomy; negation/timeframe/third-person resolution; contradictory or repeated disclosures; safe fallback wording; supported language scope; resource/handoff coverage; acceptable false-alert burden; and pilot inclusion/exclusion/stop conditions. No numerical threshold is clinical approval.

**Phase 0 exit is not claimed complete:** named clinical/bilingual/data responsibilities, institutional review determination and budget are still pending. Independent local engineering can proceed; those dependencies cannot be fabricated by code.

## Implemented Phase 1 engineering

- [Dataset registry](../Datasets/registry.json) with one created synthetic fixture set and six external candidates on hold.
- [Annotation handbook](ANNOTATION_HANDBOOK.md) with provisional actions, independent-review requirements and split rules.
- [Draft rules](../policies/rules.v0.json): versioned patterns for five locale routes, explicitly unreviewed.
- [Shared rule baseline](../evaluation/baseline.py): source/text/configuration validation, Unicode normalization, bounded context/quote handling, unsupported-format/locale uncertainty, and no numerical clinical risk score.
- [Evaluator](../evaluation/run_baseline.py): family-group/schema checks, duplicate-key rejection, development/interim selection, explicit unavailability/abstention accounting, source/language/category reports, hashes and measured rule-only latency.
- [Behavior tests](../evaluation/test_baseline.py): route consistency, current concern preservation, uncertainty, contrast/quotation, failure denominators, input/configuration errors and actual CLI report generation.

This is a **single-event rule baseline**, now reused by the Phase 3 runtime adapter. It has no semantic detector, reliable general language understanding, longitudinal memory, output guardrails, temporal-study results or referral service. The application enforces local storage consent/ownership; complete hosted consent/retention operations are pending. Rules and labels require review even when their software behavior is reproducible.

**Phase 1 exit is not claimed complete:** two independent annotations, clinical adjudication, authentic-language additions, usable licensed assets as needed, and an untouched qualification set are outstanding. The engineering harness and draft rubric pilot are implemented and runnable.

## Historical first development result

On 8 October 2026, **23 behavior/integration tests passed**. Coverage.py measured **100%** combined statement/branch coverage for the screening module, **99%** for the evaluator and **99%** overall. Ruff passed and the Python files were formatted with the already-installed Black tool. Runtime code and the unittest suite require no third-party packages; the formatter/linter/coverage tools are optional developer checks.

TDD evidence: the initial tests failed because the screening implementation was absent; additional reproductions then failed for context priority, current-versus-historical scope, contrast-negated immediacy, duplicate JSON keys, boolean schema versions and invisible formatting. The fixes were applied to the shared path and the same tests now pass. A separate read-only code review independently reran the concrete reproductions and found no remaining blocking issue for this limited offline milestone. Passing code tests does not validate the policy's clinical judgment.

The final recorded run uses `rules-0.1.1-draft`. Local evidence: [summary JSON](../artifacts/runs/phase1-v0-1-1/summary.json), [per-case decisions CSV](../artifacts/runs/phase1-v0-1-1/decisions.csv). These local outputs are Git-ignored; recreate them with the documented command and a new output directory. An earlier `phase1-initial` debugging run predates hardening and is not the current code/configuration.

| Draft slice | Attempted | Exact action agreement | Concern TP / reference positives | Urgent TP / reference positives |
| --- | --- | --- | --- | --- |
| English | 40 | 32/40 | 10/10 | 6/6 |
| Hindi, Devanagari | 40 | 28/40 | 8/10 | 5/6 |
| Hindi, Romanized/code mixed | 40 | 30/40 | 8/10 | 5/6 |
| Marathi, Devanagari | 40 | 30/40 | 9/10 | 5/6 |
| Marathi, Romanized/code mixed | 40 | 31/40 | 9/10 | 5/6 |

All **200 attempts** are recorded: 151 exact draft-action matches, 40 uncertain decisions and no unavailable attempts. Binary endpoints explicitly exclude the 60 reference-Uncertain cases; they remain in the full action matrix and agreement denominator. Positive abstentions count as misses; negative abstentions stay in the denominator and never count as successful negatives. Concern means reference Elevated/Critical, while urgent means reference Critical; these are draft operational actions, not diagnosed outcomes.

Failures include indirect farewells/changed behavior, unresolved prior references, dependency pressure, grief/sleep/sarcasm wording and four immediate-concern language variants. They are retained as errors rather than removed or converted into successes. These are same-author, visible, unreviewed synthetic fixtures with only ten concern-positive and six urgent-positive families per slice. The English zero-miss result cannot support a real-world recall claim, and 200 translations are not 200 independent people or clinically independent cases. No release gate is passed by this table.

On this single-process Windows/Python 3.11.7 run, screening-only p95 was about **0.060 ms**. This measures tiny local regex operations only; it says nothing about model/API latency, complete supportive responses or referral time. Exact timings, source/policy/code hashes and Python revision are in the report.

## Requirement coverage at the Phase 2 checkpoint

This historical table predates runtime checks. [The current R01–R12 cross-check](PLAN_AUDIT.md#requirement-traceability-now) includes the implemented Phase 3 rule/evidence path and its remaining review gates.

| Requirement | Present evidence | Remaining implementation |
| --- | --- | --- |
| R01–R02 | Offline source parity; authenticated common journal/chat receipt contract; no generator dependency | Reviewed runtime screening pipeline and independent semantic screen |
| R03 | Five draft locale routes and separate fixture reports | Authentic bilingual review and blinded language qualification |
| R04 | Limited single-clause/quotation heuristics | Consented recent and cross-source temporal context |
| R05–R08 | No generated response or resources currently released | Output guards, verified support, journals/mood and user/reviewer explanations |
| R09–R11 | Local accounts, database ownership/RLS, bounded input, consent revisions, ordered idempotent events, export/deletion, cross-tab and outage regressions | Hosted security/retention operations, provider/privacy review and generated-response ordering |
| R12 | Runnable tests/evaluator, source hashes and first measured development run | Held-out comparative evidence and truthful academic deliverables |

## Implemented Phase 2 local engineering

The application runs at **http://localhost:3180**, backed by a private FastAPI service on127.0.0.1:8060 and a separate Lumen PostgreSQL cluster on127.0.0.1:55432. Source is in [apps/web](../apps/web) and [services/api](../services/api); [setup and repeatable commands](LOCAL_DEVELOPMENT.md) explain the pinned runtimes, local credentials and startup.

Implemented behavior:

- Adult/notice-confirmed sample registration and established FastAPI Users password authentication. HttpOnly, SameSite=Strict, revocable database sessions expire after one hour. Production configuration requires HTTPS/secure cookies; local HTTP is explicitly configured. Password reset and verification delivery are not offered.
- One journal/chat input contract with five input-language labels, bounded bodies/text, strict boolean consent, duplicate-key rejection, immutable event IDs, server sequence numbers, keyed payload digests and per-owner idempotency. Input text is retained only while explicit saving consent is enabled.
- Versioned consent changes use compare-and-swap checks and an account row lock shared with event/deletion writes. Withdrawal clears live saved text. Entry tombstones prevent retry resurrection; account deletion cascades consent, entries and sessions. JSON exports contain only that account's current data.
- Application SQL owner filters plus FORCE RLS on event and consent tables. The tested application role has no superuser, RLS bypass or schema-creation privilege; pooled transaction context is cleared. Authentication tables are accessible to the trusted service before identity is known.
- Fixed web proxy routes, exact-Origin checks on mutations, body/rate bounds, input-free validation errors, no token/draft localStorage, restricted local database/credential/log ACLs, and suppressed statement/parameter/access logging. The single-process loopback rate budget is an explicit local ceiling.
- Responsive writing/history/privacy interface with labels, keyboard focus, skip link, live save/error messages and explicit deletion/export controls. Account consistency headers, client epochs, cross-tab invalidation and focus reconciliation prevent obsolete private data from being restored after deletion or session changes.

On 8 October 2026, **23 offline baseline tests, 11 API/schema/PostgreSQL/local-boundary tests and 10 production-browser journeys passed**. API combined statement/branch coverage is **98%**; authentication, database, request schemas, configuration and application endpoints each measured100%. Boundary coverage is93%; the unexercised branches concern non-HTTP/disconnect and limiter aging. These figures measure code exercise, not clinical correctness. Local helper/test URL checks reject other hosts, ports, databases, roles, drivers and query overrides before connecting or running migrations.

Next.js production build, TypeScript, Ruff, Python/web formatting, npm audit and pip-audit passed. Audits reported no known advisories at the time of the check. The initial empty-database migration passed **UP / DOWN / UP** in a dedicated `lumen_migration_check` database, with a guard against downgrading a database containing accounts. All **24 supplied source-file hashes remain unchanged**. Local browser screenshots, synthetic export and coverage evidence are under ignored `artifacts/runs/phase2-browser`.

TDD/review evidence includes initially failing request-contract tests; a shared-cookie account-change reproduction that previously accepted an entry for the wrong intended account; strict-confirmation/duplicate-JSON failures; deletion/withdrawal refresh-failure browser regressions; and a delayed-history response that initially restored old account content after another tab signed out. The fixes apply to the shared boundary/state paths. An independent read-only review additionally passed **seven fully mocked browser race checks**, including delayed export (no download after invalidation), focus during privacy mutations and an obsolete verification failure after a new account authenticates. Those independent checks did not write application records and complement the real database/browser journeys.

**Phase 2 local foundation is usable; the complete hosted exit gate is not claimed passed.** Git/remote CI publishing is not configured, and CI itself has not run. The local check script provides the reproducible build/test/audit commands. PostgreSQL18.3 on this machine needs a current security patch before hosted/personal-data use. Deployment HTTPS/CSP, shared rate limiting, storage encryption, backup/restore expiry, redacted operational telemetry and an independent deployment security review remain required. Deletion clears live records; it does not guarantee immediate erasure from database files/WAL or downloaded copies. No public deployment, participant collection or clinical validation has occurred.

## UI refinement on 8 October 2026

The web interface now uses mobile-first CSS, a thumb-reachable fixed phone navigation bar, larger touch controls,16px form fields, safe-area spacing and stronger typography. Wider screens use compact top navigation and a privacy margin. Custom orbit artwork and a matching favicon accompany finite page/art entrances, notification and switch transitions, and loading placeholders. Reduced-motion preferences disable animations and transitions; forced-colors mode retains active-navigation and switch cues. No animation library, remote fonts or stock imagery were added.

Password visibility is reversible and resets when access mode/session changes. Samples focus the writing field; mobile view changes return to the new content; cancelling deletion restores focus to its trigger. Drafts survive view changes, notification close controls remain reachable, and notifications sit above phone navigation. Existing authentication, consent, deletion and cross-tab privacy controls are preserved.

Verification: **18 presentation checks across Chrome, Firefox and WebKit**, covering320/390/768/1440px, plus the existing **10 Chrome account/privacy/browser regressions**. Production build, TypeScript, formatting and npm audit passed; the audit reported no known advisories on this date. An independent read-only review checked nine viewport/keyboard profiles and the long-history navigation/cancel-focus behavior without writing application records. Screenshots are in ignored `artifacts/runs/ui-refinement`. This is desktop browser-engine and viewport evidence; physical iOS/Android keyboard, safe-area and assistive-technology testing is outstanding. At that checkpoint Phase 3 screening had not been connected; subsequent runtime work is recorded below. UI polish does not establish clinical capability.

## Implemented Phase 3 runtime and landing page

Both chat and journal sources now call [one runtime adapter](../services/api/lumen_api/screening.py), which reuses the offline [rule baseline](../evaluation/baseline.py). Its validated result includes rule-only/uncertain/unavailable status, operational action/reason, rule IDs, policy version/SHA and baseline SHA. Unavailable always has a null action; the unreviewed baseline is disabled outside development mode. No numeric probability or model dependence was added. The process pins its policy; changing a version requires restart.

Evidence spans use **NFKC/casefold/whitespace-normalized Unicode codepoints**, not original-text offsets. At most50 spans are retained and truncation is explicit. Original saved text is unchanged. Migration0002 adds nullable JSONB and a database constraint permitting retained checks only with saved text; old receipts are not rescreened or backfilled. The dedicated empty migration-check database passed UP/DOWN/UP with0002. The existing application database was upgraded additively, without resetting accounts or the machine's separate PostgreSQL service.

With saving off, an initial response can display an ephemeral entry check; text/check details are not stored and retries return only the current receipt. With saving on, history/export include the original retained check without rerunning a new policy. Withdrawal and entry deletion clear text/check details together; account deletion cascades them. SQL and native connection failures return sanitized503 rather than a successful receipt. Checker/configuration/output faults are unavailable rather than silently Low.

The client removes obsolete cards on editing, source/language/view changes, submission start, focus/session invalidation and privacy changes. It reconciles a successful POST with freshly read receipt state and consent before displaying its check or save message. Regression tests cover privacy changes immediately after commit and deletion/withdrawal before that follow-up read, preventing either response from restoring removed check details.

The dedicated landing-page agent built `/` with custom orbit/journal art, a writing workflow, privacy section, feature overview, native FAQ and direct account links. The existing application is at `/workspace`; `/workspace?mode=signin` opens sign-in. Product copy now presents Lumen's actual writing/history/privacy features, with development labels and limitation banners removed from landing, onboarding, workspace, footer and metadata. The informational footer entry remains accessible; reviewed guidance/resource routing is still an open Phase 3 task.

Current verification evidence is in local `artifacts/runs/phase3-runtime/verification.json`, API coverage there, the `phase3-rule-regression` run, and landing/workspace screenshots. The latest offline run still has **200 attempts/40 authored families,151 exact draft-action matches,40 uncertain and zero unavailable**; the action matrix is unchanged from the recorded Phase 1 baseline. The known indirect and language misses remain. Adding evidence offsets and connecting an API does not improve that result or qualify the policy.

Latest passing checks: **24 offline tests, 22 API/schema/PostgreSQL tests and 55 browser checks**. Browser coverage comprises10 real database-backed Chrome journeys,33 fully mocked workspace checks and12 landing checks across Chrome/Firefox/WebKit. Combined API statement/branch coverage is **98.66%**; the authentication/database/application/schema/runtime-adapter modules each measured100%, with the existing boundary module93%. Production build, TypeScript, Ruff, Python/web formatting and npm/pip dependency audits passed; both audits reported no known advisories at this check. All 24 original source hashes are unchanged. An independent read-only reviewer checked36 normalized span cases and identified the postcommit/client reconciliation issues; failing regression tests reproduced them before their fixes. The agent's final follow-up stopped at its usage limit; the corrected source was verified by the final passing automated suites. Desktop browser-engine/viewport evidence does not replace physical-device or clinical review.

## Journal, mood and resource directory engineering

On 8 October 2026, the independent Phase 6 slice adds saved-journal editing and optional integer mood 1–5. Edits use content/consent compare-and-swap and the shared screen. An acknowledged identical edit can be retried without rerunning screening; competing edits get 409. Creation retries remain compatible and return the current edited/deleted receipt. Source, sequence and submission/authored time stay immutable. Migration 0003 adds revision/mood/update timestamp and database constraints; the dedicated empty migration database passed UP/DOWN/UP, and the application was upgraded additively without resetting records.

Mood is voluntary self-report, retained only with journal saving. It is not fed to the rule baseline or treated as a clinical estimate. Withdrawal/delete/export/account removal include mood with text/checks. The bounded owner-scoped `/moods` route accepts aware intervals up to 32 days, returns at most 1000 points and marks truncation. The responsive 14-day view uses local-calendar submission days, displays the latest rating per day and leaves missing days empty. Personal memory, inferred emotion and trend check-ins/cooldowns remain unimplemented.

Review identified a pre-existing focus/acknowledgement race that could leave the loading screen stuck. A shared privacy-read invalidation helper now completes its loading state and scrubs editor/check/mood state. Another regression distinguishes a lost mutation response from an acknowledged mutation followed by a failed refresh: only the latter asks the user to reload. This avoids presenting a completed saving withdrawal as something to retry by toggling saving back on.

`/support` is available from landing and workspace without an account/API request. Native region details require manually opening India; language does not infer location. Tele-MANAS 14416 and ERSS 112 facts were checked against their official ministry sources on 8 October. No test call, service-backend integration, availability promise, forwarded entry or partner agreement exists. Strict canonical dates, enabled status and a review deadline suppress future/invalid/disabled/expired telephone contacts. Eligible expired entries retain checked official links; invalid/disabled/future entries do not. Dynamic rendering recomputes this on each request. [The review/maintenance packet](review/REVIEW_PACKET.md) records sources, unverified service fields and the 8 November review deadline.

The same packet recommends qualified clinical review and independent Hindi/Marathi judgments, and contains 400 blank tasks for 200 synthetic variants / 40 families. Reviewer identities, judgments and approvals are blank; this prepares review rather than substituting for it. The owner deferred AI connection for the next stack step, so no provider, API credential, model adapter or deployment was added.

Final checks: 24 offline tests, 30 API/schema/PostgreSQL tests and 63 unique browser checks passed. The browser matrix includes 12 live Chrome API/account checks (11 account/database journeys plus one web-boundary check), 36 mocked workspace checks and 15 public landing/support checks across Chrome/Firefox/WebKit. A final isolated support skip-link class correction was rebuilt and its three-engine check passed again; those rechecks do not increase the 63 count. Combined API statement/branch coverage is 98.82% (statements 99.28%, branches 96.67%); application/auth/database/schema/screening modules measure 100%, boundary 93%. Build/types, Python lint/format, web format and both dependency audits passed, with no known advisories reported. All 24 supplied sources retain their hashes. Current source hashes/coverage/checks are recorded under ignored `artifacts/runs/journal-mood/verification.json`. Screenshots are in the landing/UI directories. Independent review passed six intercepted privacy/race cases, three confirmed-write feedback retests, nine registry boundaries and the 400-row packet integrity checks, without writing application records; it closed with no actionable issue. Physical-device and clinical/language review remain separate.

## Next dependency-ready work

Complete reviewed lexicons/decision policy, fixed guidance and independent language judgments using the packet; appoint the resource maintainer and verify operational fields. The next AI stack work requires consented bounded context, deletion-safe response release, whole-response guards, qualified comparisons and provider/deployment decisions. Phase0 responsibilities/ethics/budget, Phase1 independent labels/holdout/permissions and Phase2 remote CI/hosted security/expiry/recovery remain open. Trend check-ins, reviewer/referral operations, independent research qualification, pilot and market evidence retain their gates. [The complete pending record](PLAN_AUDIT.md) includes every numbered task.
