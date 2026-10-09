# Project brief

Baseline: 8 October 2026. Recommendations below are planning decisions, not implemented functionality.

## What the supplied documents actually ask for

The proposal (S02/S05), July deck (S04), and September deck (S03) consistently describe an emotional-support system with continuous input screening, constrained generation, contextual memory, mood trends, understandable safety decisions, and escalation. Chat messages and journal entries are both safety-relevant inputs. English, Hindi, Marathi, and code-mixed expressions are required cases, not merely translated interface labels.

The documents differ in implementation detail. The proposal initially chooses transparent rules because suitable labeled clinical data are absent; the mid-semester deck adds dedicated classifiers and emotion/stress signals. The plan reconciles these as a **rule baseline first, followed by an independently evaluated semantic detector**. No pretrained emotion model becomes a suicide predictor simply because it produces a score.

The initial users should be **consenting adults aged 18 or older**, with a first discovery segment of Indian college students and young adults who prefer private, low-friction support. This age restriction is a recommended first-release boundary; the supplied documents do not settle age eligibility. The four-person academic team and 16 GB laptop constraints inform delivery estimates, but a clinician and bilingual reviewers are additional dependencies, not assumed existing team members.

## Product promise

Lumen helps a person reflect, describe what is happening, keep an optional journal, and take a practical next step toward human support when appropriate. It explains its limitations and offers control over history and memory. It must not diagnose, prescribe, claim to provide therapy, promise confidentiality beyond the actual policy, or imply someone is watching in real time when nobody is staffed to do so.

“Real time” means **screening the submitted input before releasing a response**. It does not mean continuous surveillance, reliable prediction of future suicide, or emergency-service dispatch. Screening journal drafts requires separate explicit consent; the default is screening on submission, not silently reading keystrokes.

## Core requirements

| ID | Requirement | Observable behavior | Acceptance evidence |
| --- | --- | --- | --- |
| R01 | Shared input safety | Chat, submitted journals, and later confirmed voice transcripts call the same safety policy | Equivalent semantic fixtures yield consistent action across routes |
| R02 | Independent detector | Safety analysis completes independently of the conversational generator | Generator outage does not remove reviewed support guidance |
| R03 | Multilingual coverage | English, Hindi, Marathi, Romanized text and code switching are explicitly tested | Separate results for every supported slice; unsupported slices are disclosed |
| R04 | Contextual signals | Current text, bounded recent dialogue, and consented relevant history inform screening | Temporal ablations show whether context improves detection at matched alert burden |
| R05 | Safe generation | Output checks cover diagnosis, medical advice, harmful instructions, false promises and dependency | Adversarial output suite passes before any generation reaches pilot users |
| R06 | Usable support routing | Verified regional and campus resources have language, hours, eligibility and verification dates | A stale or invalid entry cannot be invented by the generator |
| R07 | Optional journal and mood view | Self-reported mood is distinct from inferred emotion | Missing entries are displayed as missing; low mood alone does not trigger emergency action |
| R08 | Explainable decisions | User gets a brief, respectful explanation; authorized reviewers get policy evidence and versions | No fabricated chain-of-thought or clinical probability presented as fact |
| R09 | Privacy and agency | Separate controls for storage, memory, review sharing and research | Export, withdrawal and deletion remove derived memories and search vectors too |
| R10 | Human-reviewed improvement | Policies improve through reviewed, versioned releases | No automatic training on personal messages or live unreviewed rule updates |
| R11 | Operational reliability | Timeouts, invalid model outputs and database failures have defined behavior | Fault-injection checks demonstrate reviewed fallback and honest save status |
| R12 | Demonstrable engineering | The project produces code, held-out evaluation, reproducible reports and academic deliverables | Every claimed feature links to a run, source, or clearly identified future task |

## First complete research prototype

Include consent and age onboarding; responsive text chat; journal submission; optional self-reported mood timeline; shared rules and semantic screening; bounded context; reviewed response templates; guarded generation; verified-resource cards; user export/delete controls; and an access-controlled reviewer interface operating on consented or synthetic material.

Do not make voice recognition, a native mobile app, a trained foundation model, autonomous agents, wearables, social networking, a marketplace, or a 24-hour staffed crisis service prerequisites for that prototype. Voice is in the proposal and remains a later planned extension, with transcript confirmation and multilingual safety checks before activation.

## Proposed differentiator and its proof

The defensible hypothesis is that **adding consented temporal evidence from chat and journals improves appropriate responses to indirect, code-mixed distress at a controlled false-alert rate**. A second hypothesis is that an auditable local support pathway helps users understand and act on guidance without undermining privacy or trust. Neither is proven yet.

Independent safety layers, multilingual support, journal analysis, guardrails, and escalation already have prior art. Current overlapping products are documented in [the market review](research/MARKET_AND_NOVELTY.md); broader claims in the original proposal need revision in future submissions.

## Important design corrections to the slides

- Diagram “phases” are runtime components, not the implementation calendar. The implementation plan has separate delivery phases.
- Emergency routing must not wait for an expensive generation or vector-retrieval call. Reviewed local guidance is the first reliable path.
- Replace “scan clinical terms and substitute phrases” with validation of the whole response. Mentioning a condition in educational or quoted context is different from assigning a diagnosis.
- Replace “non-dismissible intervention” with a dismissible, accessible guidance card and an always-available support entry point. User agency must not depend on a classifier agreeing with the user.
- Append-only auditing applies to minimal operational events. It must not become an excuse to retain identifiable journals indefinitely.
- Replace a direct “live guardrail update” arrow with review, regression evaluation, versioned deployment and rollback.
- A declining engagement frequency is not a validated crisis signal. Any optional reminder must be based on user preferences; missing observations are not negative mood.

## Academic constraints

The logbook S01 identifies literature review, gap analysis, methodology, use cases, class/sequence diagrams, architecture, UI, work breakdown, timeline, and a LaTeX white book as deliverables. Preserve the institution's original templates and fill them with truthful current results when those milestones are reached. Existing model screenshots are anecdotal illustrations, not a controlled comparative benchmark. The deck's July–September 2026 “Done” timeline does not prove that datasets or application modules now exist: the supplied workspace contains no application and its dataset directory was empty at inspection.
