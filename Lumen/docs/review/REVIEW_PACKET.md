# Clinical and language review packet

Prepared **8 October 2026**. This packet is ready to assign; no person has been appointed and no approval is recorded. AI/provider integration is deferred by the project owner. Review applies to the shared rule path, its explanations, future fixed support wording and the public resource directory.

## Recommended review team

| Responsibility | Recommended reviewer | Concrete output |
| --- | --- | --- |
| Clinical policy and adjudication | Qualified mental-health clinician with adult crisis-assessment and language/cultural-context experience | Approved intended use, action table, uncertainty/failure path, fixed wording and rationale for safety-relevant disagreements |
| Hindi | Two independent competent Hindi/English reviewers, able to assess Devanagari, Hinglish and Romanized Hindi | Separate initial labels, natural-language corrections and cultural-fit review |
| Marathi | Two independent competent Marathi/English reviewers, able to assess Devanagari, Romanized Marathi and code mixing | Separate initial labels, natural-language corrections and cultural-fit review |
| English | Two independent competent reviewers; clinical adjudication follows | Separate initial labels and review of explanation/support wording |
| Resource maintenance | Named project maintainer, with a second verifier | Dated source checks, operational verification where possible, withdrawal/expiry decisions and versioned changes |
| Academic/data oversight | Faculty guide and the institution's designated data/ethics authority | Actual determination for any proposed personal-data or participant work |

Use reviewer slots A/B until names and availability are confirmed. Keep the private reviewer-to-name mapping outside public artifacts. The supplied faculty guide is an academic contact; this packet does not appoint them as a clinician. No external outreach has been sent.

## Materials and frozen starting point

- [Project brief](../PROJECT_BRIEF.md), [architecture](../ARCHITECTURE.md), [annotation handbook](../ANNOTATION_HANDBOOK.md) and [evaluation plan](../EVALUATION_PLAN.md).
- [Annotation sheet](annotation-sheet.v0.csv): **400 blank review tasks**, two slots for each of 200 synthetic variants across 40 families. It omits draft actions, category hints and detector predictions. Every row is development material, not a participant or a blinded qualification case.
- Dataset: `Datasets/development/pilot.v0.json`; SHA-256 `8c7d2ed95fe463ae43d64c8cb3e8b2bb5b8c0d5f14c9e901c98a7b80f44a7ad6`.
- Rules: `policies/rules.v0.json`, version `rules-0.1.1-draft`; SHA-256 `763c564f319c7dc566dd1cd168bf37d31130f617a107255820664a2b3938b36b`.
- Known development failures remain in [the status record](../IMPLEMENTATION_STATUS.md). After first independent judgments, adjudicators may inspect these results and the policy. Do not show them to initial annotators.

Assign A/B sheets independently. Record original-text evidence as half-open Unicode codepoint offsets, timeframe, subject, action, uncertainty and language corrections. Do not copy the same judgment into both slots. Keep both judgments before adjudication; unresolved cases remain unresolved. Any corrected rubric, policy or language set gets a new version and checksum. The visible development material cannot become an untouched holdout by renaming its split.

## Decisions that need actual review

1. Approve adult/text-first intended use and the permissible support boundary. Define criteria and examples for every action, including uncertainty and unavailable behavior.
2. Review negation, fiction/quotation, third-person concerns, old uploaded journals, contradictory disclosures, corrections and indirect concern. Preserve current explicit concerns without treating mood alone as clinical evidence.
3. Review explanations and fixed response wording in every advertised language/script. No supportive or crisis response template is approved by this packet; AI responses remain deferred.
4. Define proportionate repeat/check-in behavior, cooldowns and when a new clarification is needed. The current mood view displays voluntary ratings and missing days, without inference or automatic escalation.
5. Approve any future contextual-memory retention, consent, derived deletion and output-release conditions separately from saving a journal.
6. Record a clinical release decision with reviewer identity/role, date, scope, policy/template hashes, open issues and rollback version. Engineering scores do not populate this decision.

## Public service directory source check

The current `/support` page is an account-independent, manually opened India directory. It does not contact a service or forward entries. Official-source checks completed on **8 October 2026**:

| Entry | Published facts used | Official source |
| --- | --- | --- |
| Tele-MANAS | Short code 14416; national tele-mental-health service; Ministry lists toll-free, 24-hour access | [DGHS National Mental Health Programme](https://dghs.mohfw.gov.in/national-mental-health-programme.php) |
| ERSS | National emergency number 112; police/health/fire service routing | [Ministry of Home Affairs ERSS](https://www.mha.gov.in/en/commoncontent/emergency-response-support-system-erss) |

These are website-source checks; no test call, response-time check, partner agreement or live availability confirmation occurred. Specific language, eligibility, accessibility and campus coverage are not published by Lumen without separate verification. The Tele-MANAS and112 portal fetches failed during research; the above ministry source pages were readable and directly supported the facts used. Links therefore point to those checked pages.

The initial review deadline is **8 November 2026, 00:00 UTC**, an engineering maintenance default requiring an assigned owner's agreement. Disabled, future-dated, invalid or expired entries have no telephone link. Only valid, enabled, previously verified expired entries retain official information links as fallback. The server recomputes expiry on each request and rejects impossible calendar dates. If information becomes incorrect before the deadline, set `enabled:false` and rebuild. Before extending a deadline, inspect the source again, record the check, independently verify any changed number, and update the registry dates. A source check does not guarantee a service answers a call.

## Review completion record

Keep identity/qualifications, reviewed hashes, date and scoped decision in the project's restricted review record. Publish only the approved scope and version. At this checkpoint every clinical/language sign-off, institutional determination and partner-coverage decision is **pending**. Public resource facts and code tests may proceed independently; reviewed guidance, qualified-language claims and participant recruitment require their respective actual decisions.
