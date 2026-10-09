# Implementation-plan audit

Cross-check date: **8 October 2026**. Task IDs below correspond to the numbered tasks in the [implementation plan](../IMPLEMENTATION_PLAN.md). This is the current record; earlier runs in [implementation status](IMPLEMENTATION_STATUS.md) remain historical evidence.

**Tested** means implemented and exercised within the declared local synthetic scope. **Partial** means a concrete part exists but the task's full acceptance conditions are open. **Pending** means the required artifact, review or operation has not happened. No complete phase exit is claimed. Code tests cannot substitute for clinical, bilingual, ethics, hosted security or partner approval.

## Current phase position

| Phase | Current state | Uncompleted exit dependency |
| --- | --- | --- |
| 0 Scope | Written scope/research and consent boundaries; partial | Named maintainers, clinical/bilingual/data owners, institutional determination and budget |
| 1 Data/evaluation | Synthetic registry, rubric, 40-family/200-variant development baseline tested; partial | Independent annotations/adjudication, applicable permissions and untouched qualification data |
| 2 Foundation | Local web/API/PostgreSQL slice tested; partial | Remote CI and hosted security/retention/recovery operations |
| 3 Rules/guidance | Shared draft screening and dated public resource directory tested; partial | Reviewed policy/language/templates, operational contact verification and maintenance owner |
| 4–5 Semantics/generation | Pending | Reviewed data/policy, provider privacy/cost review and comparative qualification |
| 6 Journals/context | Journal create/edit/delete and optional mood/history slice tested; partial | Consented context, trend check-ins/cooldowns and temporal comparison |
| 7 Languages/resources | Input locale labels, draft fixtures and manually selected India directory tested; partial | Independent language/response review, broader operational verification and resource owner |
| 8 Review/referral | Pending | Purpose-limited reviewer operation and actual partner coverage |
| 9 Research qualification | Development harness and local regression evidence exist; partial | Frozen blinded study, ablations, human review, end-to-end measurements and academic pack |
| 10 Pilot | Pending | Actual clinical/ethics approval and staffed protocol before recruitment |
| 11 Market/release | Literature/competitor review exists; partial | Observed discovery, buyer/economics evidence, legal review and release operations |

## Phases 0–3: task-by-task cross-check

| Task | State | Existing evidence | Remaining work |
| --- | --- | --- | --- |
| 0.1 Intended scope | Partial | [Project brief](PROJECT_BRIEF.md): adults18+, text first, submitted chat/journal, five initial locale routes; local notice/eligibility flow | Owner acceptance, first institutional segment and reviewer-approved language boundary |
| 0.2 Literature/claims | Partial | [Source coverage](research/SOURCE_COVERAGE.md), synthesis, three paper reviews and market corrections; all24 original hashes unchanged | Guide reviews corrected future academic claims; originals preserved |
| 0.3 Named ownership | Pending | [Review packet](review/REVIEW_PACKET.md) specifies recommended qualified clinical and independent language roles; no appointment assumed | Assign named maintainers/reviewers and escalation process |
| 0.4 Actions/limits | Partial | [Annotation handbook](ANNOTATION_HANDBOOK.md), draft policy and explicit uncertainty/unavailability; no dispatch | Clinical review of action taxonomy and permissible support |
| 0.5 Consent/data flow | Partial | Local default-off saving, consent revisions, export/withdrawal/deletion and derived-check clearing | Concrete expiry, backups/restores, provider processing, memory/review/research consent boundaries |
| 0.6 Ethics determination | Pending | Planned study limits documented | Record institution's actual determination and approved scope |
| 0.7 Budget/capacity | Partial | Plan's stated assumptions, pinned local toolchain, no model/GPU purchase | Accepted budget, actual hours, reviewer allocation and hosting/provider decision |
| 1.1 Dataset registry | Tested (synthetic) | [Registry](../Datasets/registry.json): one authored fixture set; six external candidates on hold | Populate exact licensed revisions/permissions before external use |
| 1.2 Permission resolution | Pending | Candidates explicitly held; no external corpus acquired/translated | Obtain permission for each intended use and derivative |
| 1.3 Annotation pilot | Partial | 40 authored scenario families/200 language variants, negation/quotes/idioms/history/code mixing in development fixtures | Independent authentic-language additions and annotation pilot |
| 1.4 Independent review | Pending | [400 blank A/B tasks](review/annotation-sheet.v0.csv) prepared for 200 development variants; judgments/reviewer/date fields remain blank | Actual independent labels, clinical adjudication and agreement report |
| 1.5 Leakage/holdout | Partial | Evaluator groups family/translations, checks schemas and duplicates | Independent validation and an untouched, inaccessible-to-tuning qualification set |
| 1.6 Small evaluator | Tested (rules only) | [Evaluator](../evaluation/run_baseline.py),24 offline tests,200-case reproducible run with hashes, action/abstention metrics and rule-only latency | Generated-response failures, temporal endpoints and full component latency when implemented |
| 1.7 Annotation scale | Pending | Prospective targets in [evaluation plan](EVALUATION_PLAN.md) | Actual reviewer capacity, staged independent annotation and locked endpoints |
| 2.1 Runtimes/locks/setup | Tested locally | npm/uv lockfiles, [setup/start/check scripts](../scripts), [Windows reproduction guide](LOCAL_DEVELOPMENT.md) | Supported PostgreSQL security patch and hosted environment qualification |
| 2.2 App/API/migrations | Tested locally | Next.js/FastAPI/PostgreSQL; migrations 0001–0003; empty dedicated database UP/DOWN/UP; additive application upgrades | Physical-device/accessibility tasks and hosted operations |
| 2.3 Accounts/ownership | Tested locally | Established auth library, revocable HttpOnly sessions, adult/notice gates, consent CAS, owner filters/FORCE RLS | Deployment security review; actual email verification/reset delivery if exposed |
| 2.4 Shared event contract | Tested locally | Shared `/events`, UUIDs, sequence, keyed idempotency, input bounds, save/tombstone states | Release ordering for future generated responses |
| 2.5 Security/configuration | Partial | Secret/environment handling, strict Origin, bounded requests/rate budget, input-free errors/logging and restricted local roles/ACLs | Hosted HTTPS/CSP, shared limiting, storage protection and redacted operational telemetry |
| 2.6 Export/deletion/isolation | Tested for live records | API/database/browser checks for cross-user access, consent withdrawal, account/entry deletion and delayed-response invalidation | Expiry, deletion on restore and future vectors/summaries/caches |
| 2.7 CI/checks | Partial | Repeatable local build/type/lint/test/audit script; checks passed | Git/remote CI has not been configured or run; no push/publish |
| 3.1 Shared submission/screen | Tested (draft) | [Runtime adapter](../services/api/lumen_api/screening.py) calls the same [baseline](../evaluation/baseline.py) for both sources; original retained text stays unchanged under consent | Clinical qualification of normalization/policy |
| 3.2 Reviewed lexicons | Partial | Versioned five-route draft rules and negation/quotation tests | Independent bilingual review; draft patterns are not supported-language qualification |
| 3.3 Reviewed actions | Partial | Strict versioned result contract separates rule-only, uncertain and unavailable; unavailable has no action, faults never become Low | Clinician-reviewed decision table/operating policy |
| 3.4 Templates/resources | Partial | Public India directory: ministry-source facts for Tele-MANAS/ERSS, dated contacts, manual selection, strict expiry and disabled-entry controls | Reviewed templates, named registry owner, operational/language/eligibility/accessibility checks and campus confirmation |
| 3.5 Immediate guidance | Pending | Explicit authored sentinels reach draft Critical consistently across chat/journal | Reviewed immediate-concern guidance and verified choices; a draft label is not guidance |
| 3.6 Decision evidence | Tested (draft) | Rule IDs, policy version/hash, baseline hash and bounded normalized code-point spans; no clinical probability | Human review of explanations and future restricted reviewer access |
| 3.7 Reliability/support UI | Partial | Public support link independent of account/API; native details/keyboard/phone layouts, unavailable cards, shared retry/privacy paths; confirmed changes distinguish failed refresh from lost write acknowledgement | Reviewed immediate guidance, broader operational outages and physical-device QA |

## Later tasks: no hidden completion claims

| Task(s) | State | Cross-check |
| --- | --- | --- |
| 4.1–4.6 | Pending; owner deferred AI | No semantic provider/classifier, structured model output, context comparison, threshold qualification or emotion ablation connected |
| 5.1–5.6 | Pending; owner deferred AI | No generator/terms, prompts, whole-output guards, regeneration, reviewed support responses or adversarial generation suite |
| 6.1 | Tested locally | Journal create/edit/delete; shared rescreening; optional self-report mood under saving consent; content/consent CAS and convergent lost-response retries |
| 6.2–6.4 | Pending | No chronological model context, pgvector retrieval, independent memory controls or derived-memory deletion |
| 6.5 | Partial | Responsive 14-day latest daily ratings with gaps and bounded points; opt-in trend check-ins/cooldowns remain |
| 6.6 | Partial | Edit concurrency, ownership, postcommit deletion/withdrawal and delayed mood invalidation tested; temporal trajectories/ablation and memory correction/resurrection remain |
| 7.1–7.3 | Pending | Draft fixtures/review packet do not complete independent language judgment, translation-loss comparison or reviewed response quality |
| 7.4 | Partial | Dated official-source India contacts with expiry/disable guards; operational verification, language/eligibility/accessibility evidence, campus options and named owner remain |
| 7.5 | Partial | Five input labels, uncertainty and manually opened India directory; country not inferred from language. Language qualification and additional regions remain |
| 7.6 | Partial | Expiry/future/disabled/invalid-calendar guards, no-account/API independence and narrow/keyboard/browser checks; real contact outages/response times and physical shared-device QA remain |
| 8.1,8.3–8.6 | Pending | No reviewer dashboard/adjudication workflow, release approval/rollback operation, handoff/coverage, institutional aggregates or incident operation |
| 8.2 | Partial | Current development uses synthetic examples; purpose-limited human review and approved real-content review are absent |
| 9.1–9.3 | Pending | No final blinded benchmark, temporal/model/output ablations, confirmatory intervals or human response-safety ratings. Current visible development scores are not qualification |
| 9.4 | Partial | Input ordering, auth, export/delete, journal CAS, privacy/mood races, resource expiry and database/screen faults tested; model/output boundary drift and hosted failures remain |
| 9.5 | Partial | Local rule-only latency reported; no complete response/provider/concurrency cost measurement |
| 9.6 | Partial | Keyboard, reduced-motion and desktop-engine viewport checks; no approved participant usability/assistive-tech/device study |
| 9.7 | Partial | Literature, methodology/evaluation plan, architecture and current GUI/code evidence exist; final diagrams, white book, presentations/logbook and frozen academic results remain |
| 10.1–10.6 | Pending | No recruitment, participant/pilot outcome, staffed protocol or clinical effectiveness evidence |
| 11.1–11.3 | Pending | Literature comparison does not constitute interviews, observed prototype demand, buyer requirements or willingness to pay |
| 11.4 | Partial | Illustrative cost arithmetic exists; measured utilization/quotes/staffing and commercial brand checks absent |
| 11.5–11.7 | Pending | No commissioned intended-use/legal review, hosted recovery/retention operations or limited public release |

## Requirement traceability now

| Requirement | Present implementation/evidence | Still unearned |
| --- | --- | --- |
| R01 Shared input | Common authenticated event and draft screen for chat/journal; parity/concurrency tests | Reviewed safety/guidance and later confirmed voice path |
| R02 Independent detector | Rule baseline independent of any generator; explicit failures | Comparative semantic detector and reviewed degraded support |
| R03 Languages | Five draft routes/labels, per-slice synthetic error reports | Authentic independent and blinded language qualification |
| R04 Context | Conservative single-event normalization/clause/quote heuristics | Consented recent/cross-source temporal evidence and measured benefit |
| R05 Safe generation | No generated response released | Generator, whole-response checks and reviewed adversarial suite |
| R06 Support routing | Accessible public India directory with official facts, manual geography and expiry guards | Reviewed immediate guidance, operational contact verification/owner and real handoff coverage |
| R07 Journal/mood | Journal create/edit/delete, optional self-report ratings and 14-day missing-data view; shared rescreen/CAS/privacy checks | Consented context, opt-in trend check-ins/cooldowns and temporal qualification |
| R08 Explanations | Draft cards, rule/evidence/version details, no probability | Reviewed explanation fidelity and authorized reviewer view |
| R09 Privacy/agency | Default-off saving; unsaved check not persisted; saved check cleared with text; RLS/export/delete/race checks | Memory/review/research controls, backup/expiry and future derived stores |
| R10 Reviewed improvement | Static versioned policy/hash pinned per process; retries preserve retained original decision | Human approval, rollback operation and adjudication workflow |
| R11 Reliability | Honest receipts; unavailable/null action; DB503; ordering/idempotency/privacy fault checks | Reviewed fallback, provider faults, hosted recovery and full latency |
| R12 Evidence | Reproduction commands, dated runs, source hashes and task audit | Blinded comparative/academic/pilot evidence |

## Current verification and next work

Current commands/results are recorded in [implementation status](IMPLEMENTATION_STATUS.md) and local `artifacts/runs/journal-mood/verification.json`. Earlier `phase1-*` and `phase3-runtime` reports remain historical. Current screenshot directories are refreshed by the browser suites; do not relabel historical verification files as tests of newer source.

**Latest passing checks:** 24 offline tests, 30 API/schema/PostgreSQL tests (98.82% combined API statement/branch coverage) and 63 unique browser checks:12 live Chrome API/account checks, 36 mocked workspace checks and 15 public landing/support checks across Chrome/Firefox/WebKit. After a final support skip-link style correction, its three-engine check passed again; these rechecks are not added to the 63 count. Production build/types, Python lint/format, web format and both dependency audits passed. All 24 supplied sources are unchanged. These are engineering checks; the 200 synthetic language variants remain a separate development run, not independent clinical cases.

The landing page and mobile art are implemented; the repeated development/prototype branding and limitation banners were removed from product-facing pages at the owner's request. No additional capability is inferred from that presentation change. The complete outstanding work is retained in this audit.

The next review deliverable is **clinically reviewed policy/templates and independent language judgments** (3.2–3.5), using the prepared packet. Assign the reviewers and registry maintainer, obtain labels/operational verification, and release a reviewed version with regression evidence. The owner explicitly deferred AI connection for the next stack step; no provider/deployment was selected. Next engineering dependencies are consented chronological context and deletion-safe output release, complete-response guards/evaluation, and hosted CI/security/expiry/recovery once a target exists. Trend check-ins, reviewer/referral operations, independent qualification, pilot and market evidence remain open at their stated gates.
