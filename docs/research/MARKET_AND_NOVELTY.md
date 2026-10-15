# Current market, prior art and a defensible opportunity

Research date: **8 October 2026**. This review uses supplied literature and current primary product, publisher and government sources. Product capabilities below are **publicly documented/vendor-reported**, not independently verified through logged-in application testing. “Not publicly established” does not mean “absent.”

## Decision

Proceed with a narrow, measurable research prototype. Do not position the broad feature bundle as something that does not exist. A plausible first market is an adult campus-support workflow with clear privacy, language qualification and practical referral follow-through. Buyer demand and comparative performance are unproven; the roadmap includes tests that can reject this thesis.

## Competitors and adjacent systems

| System | Current primary evidence | Consequence for Lumen | What remains unknown here |
| --- | --- | --- | --- |
| Wysa | Current terms describe a hybrid LLM design under clinical/safety constraints; its own published story reports Hindi and Marathi adaptation | Neither multilingual Indian support nor constrained LLM use is a new category | Independently measured Romanized/code-mixed crisis performance; exact shared journal safety behavior in each product |
| Headspace Ebb | Describes per-message real-time risk identification, a small fine-tuned model plus LLMs, human review, guardrails and release evaluation | Independent runtime detection, output controls and human review are established competitor features | Direct comparison with Lumen's intended Indian-language and temporal benchmark |
| Limbic | Describes a separate clinical layer that checks input and output and routes concerns toward human care | Separation of safety logic from conversational generation is prior art | Fit for the nonclinical Indian campus scope; public comparison on the planned task |
| Eunoia / BeaconMinds | Indian young-adult app; engineering case study reports journals, Hindi/Marathi among 11 languages, temporal journal analysis, crisis screening and graceful escalation | This is a close overlap with the intended audience and feature combination | Independently audited safety results, exact shared journal/crisis pipeline, and live partner handoff reliability |
| Earkick | Developer's App Store listing describes AI support, tracking/reflection tools and a local/iCloud privacy approach | Private reflection and emotion tracking are not novel by themselves | Current availability and safety behavior were not smoke-tested; do not infer either from an old review |
| Woebot | Official FAQ says the app retired on 30 June 2025 | Treat it as historical evidence, not a currently accessible consumer comparator | Successor/enterprise offerings require separate evaluation |
| Youper | Official data-erasure page says services discontinued on 30 September 2026 | Older lists describing it as an active consumer competitor are stale | No current service was assumed from historical papers or app descriptions |
| General-purpose LLMs | Supplied crisis and multi-turn studies document meaningful contextual/boundary failure modes in tested versions | Useful research baselines when version-pinned; fluent prose alone is not appropriate support | Current model revisions may differ; screenshots cannot quantify present comparative safety |

Sources: [Wysa terms, revised June 2026](https://legal.wysa.io/terms), [Wysa Hindi/Marathi example](https://blogs.wysa.io/blog/user-story/finding-her-voice-how-wysa-enabled-a-teenager-from-rural-rajasthan-express-herself-and-dream-big), [Headspace AI design](https://www.headspace.com/ai), [Limbic layer](https://www.limbic.ai/layer), [Eunoia product](https://eunoia-app.com/), [Eunoia engineering case study](https://www.zenspring.ai/case-studies/eunoia), [Earkick developer listing](https://apps.apple.com/us/app/earkick-self-care-ai-coach/id1584854531), [Woebot FAQ](https://woebothealth.com/faq/), [Youper closure notice](https://www.youper.ai/data-erasure).

Wysa also has current India-focused research funding rather than standing still: Wellcome's 2026 funded project describes adaptation for rural adolescent girls. This is a competitive signal, not proof of outcomes. [Wellcome project record](https://wellcome.org/research-funding/funding-portfolio/funded-grants/scaling-access-care-through-user-centred).

## What the literature already establishes

S21 explicitly proposes uncertainty-aware, independent screening with an emergency mode. S17 includes prior work combining journal entries, mood, sleep and activity and separate longitudinal clinical records. S24 contains mood-responsive conversations and temporal patterns. These findings directly contradict an invention claim for independent screening, longitudinal signals or journal-based concern detection alone. See [safety review](safety-paper-review.md) and [clinical review](clinical-paper-review.md) for pages and measured results.

A newer adjacent primary study also describes a psychiatric-crisis guardrail using clinician-reviewed simulated messages and an external evaluation subset. This shows that specialized psychiatric screening is an active field. Its available abstract/search-index information was checked; a complete publisher fetch was unavailable in this research pass, so no detailed performance comparison is asserted. [Verily guardrail study](https://www.nature.com/articles/s41746-026-02579-5).

## Novelty matrix

| Proposed idea | Assessment | Responsible claim |
| --- | --- | --- |
| Empathetic conversational support | Established category | Product behavior to implement and evaluate |
| RAG, sentiment/emotion detection | Established research techniques | Candidate tools; not independently a scientific contribution |
| Rules plus independent semantic screening | Prior art in papers and products | A measured implementation adapted to the intended setting |
| Hindi/Marathi support | Existing reported products/research | Language-specific safety qualification, if actually demonstrated |
| Journaling and temporal patterns | Existing research and product capabilities | Test incremental value of the particular shared temporal policy |
| Anti-diagnosis constraints | Existing product behavior | Broader whole-response safety evaluated in context |
| Regional crisis-resource links | Existing referral practice | Verified, maintained local options; no novel integration claim for links |
| Auditable action reasons | Prior art; exact competitor internals often unavailable | Faithful provenance of this implementation's policy decisions |
| Open/reproducible multilingual temporal benchmark and ablation | Potential academic contribution | A new evaluated artifact, subject to prior-art and license review |
| Consented cross-source triage with demonstrated low alert burden and completed partner workflow | Plausible product differentiation | Only claim benefits the comparison and pilot actually measure |

The search did not establish an independently evaluated public result for **this exact benchmark and implementation**. That is a research opportunity, not proof that no competitor has similar internals. This pass is not a systematic worldwide patent search, freedom-to-operate opinion or trademark clearance.

The name **Lumen** is already used in mental-health AI research for a voice-based problem-solving coach. Keep the academic project title now, but perform naming/trademark clearance before commercial launch. [Published Lumen pilot](https://pmc.ncbi.nlm.nih.gov/articles/PMC10175049/).

## Where progress is still needed

The supplied studies support limitations in implicit/contextual concerns, multilingual generalization, clinician disagreement, multi-turn boundary persistence, adverse-event reporting and external validation. Some results come from simulated dialogues or selected conversation segments rather than prospective users. Those are opportunities to improve evidence, not a basis for saying all current products are unsafe or lack safety machinery. Detailed support and counterexamples are in the three paper reviews.

The practical unanswered question is whether people and institutions value Lumen's measured difference enough to adopt it, given competing apps and an existing free national service. A reliable workflow with clear privacy and locally useful next steps may matter more to buyers than adding another model.

## India-specific infrastructure and privacy

The government's February 2026 account describes Tele-MANAS's multilingual service ecosystem and the addition of the Asmi information/engagement chatbot. Government infrastructure is therefore an adjacent alternative and potential referral destination, not an empty space waiting for an AI companion. Verify individual services before use; no API access, partnership or acceptance of Lumen referrals was established here. [PIB 2026 account](https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=157296&lang=1&reg=41).

The proposal's 70–92% treatment-gap range has an official source but varies by disorder and refers to national-survey evidence; it is not a current estimate of willing paying customers or of stigma's independent causal contribution. Do not multiply a prevalence statistic into a sales market. [Government answer](https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1896958&lang=2&reg=48).

Correct the proposal's legal wording: DPDP 2023 does not establish a separate statutory “sensitive personal data” category in the way that sentence suggests. Mental-health content should nonetheless be handled as highly sensitive by design, and the applicable earlier/sectoral rules must also be assessed. The 2025 DPDP Rules have staged commencement (immediate, one-year and eighteen-month groups), so not every rule was already fully effective on this research date. These are scoped source observations, not a compliance certification. [DPDP Act](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf), [DPDP Rules, rule 1](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf).

Planned engineering responses—specific consent, restricted access, minimization, deletion of derived data, honest provider disclosures, adult-only initial access and incident procedures—are recommendations to implement and review. Final obligations depend on entity, use, study design and deployment date. A disclaimer does not settle medical-device status: CDSCO has considered mental-health self-assessment software as a device-related proposal. Obtain intended-use review before a commercial clinical claim. [CDSCO committee record](https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2018/UploadCommitteeFiles/Recommendations%20Neurology%20Psychiatry%2011.11.2025.pdf).

## First-market hypothesis

**Recommendation:** investigate one adult campus counseling ecosystem in Maharashtra rather than immediately launching a generic global consumer therapist. This is a choice to test, not validated demand.

| Role | Possible unmet job | What discovery must verify |
| --- | --- | --- |
| Adult student | Private reflection in the language/script they actually type; understandable next step | Existing alternatives, trust, language fit and willingness to use |
| Counselor | A consented, concise support request with usable context | Workload impact, acceptance rules, actual hours and escalation ownership |
| Institution | Accessible support without surveillance or individual student profiling | Budget, procurement, privacy requirements and adoption barriers |
| Research collaborator | Reproducible code-mixed temporal evaluation | Annotation capacity, ethics scope and willingness to evaluate independently |

A user's private journal must not become a college administrator's risk ranking. Sharing with a counselor requires a specific purpose and consent, with clear limits. A requested referral, a click and a completed human conversation are distinct outcomes.

### Discovery and commercial validation tasks

Proposed targets: approximately 15–20 adult-user interviews, 5–8 counselor/workflow interviews and 3–5 institutional budget-owner discussions, followed by observed prototype tasks. These sample sizes are planning estimates, not statistically representative market research or completed interviews. Avoid collecting identifiable crisis disclosures just to validate demand.

Test four hypotheses: language/context improves perceived usefulness; users understand memory/review consent; counselors can accept a practical workflow without excess false alerts; a buyer has a real budget and identifiable procurement path. Ask about current workarounds and actual past behavior before asking whether a futuristic feature sounds attractive.

Use a supervised feasibility cohort only after the separate clinical/ethics gate. Count consent comprehension, sustained voluntary use, appropriate resources offered, actual partner-accepted requests, completion where confirmable, counselor time, false alerts, cost and adverse events. Do not reward dependency through engagement targets.

### Revenue model to test

An institution-funded bounded service is a plausible starting hypothesis. Do not assign a subscription price from a global market forecast. Obtain buyer requirements and vendor/staffing quotes, then calculate seats eligible, adult opt-in fraction, monthly active fraction, events per user, verified partner capacity, inference costs and support overhead. Any prototype price range must be labeled a test proposal until buyers actually accept it.

Keep verified support information accessible without a crisis paywall. Paid features or quotas must not imply that emergency response is guaranteed. Include continuity, export and closure plans; discontinued competitors show why service continuity deserves planning.

## Go / revise / stop criteria

Proceed toward a product when the benchmark shows a meaningful prespecified benefit, ordinary support remains usable, all required languages/privacy paths qualify, a partner workflow is feasible, and buyers value the resulting service at a sustainable cost.

Revise the thesis if context adds no reliable benefit, alert burden overwhelms counselors, language quality is insufficient, or users reject the data trade-off. Retain narrower features and honest claims where they do work.

Stop a clinical/public pilot if required oversight, lawful data access or staffing is absent, severe safety/privacy defects remain, or promised handoffs are unreliable. The academic project can still deliver a reproducible research implementation and negative findings. Market success cannot be guaranteed by uniqueness or more features.

## Research scope and remaining verification

Reviewed the 24 supplied files; searched exact paper titles, current product/terms/status pages, newer psychiatric safety work, Indian-language/journal overlap, national infrastructure, official data-protection texts and technology documentation. Deep-read key product safety pages and the close-overlap case study, and distinguished them from unavailable/cached abstract-level sources. No product account was created, paid service tested, dataset acquired, person contacted, or partnership negotiated.

Before a commercial uniqueness claim: perform a fresh prior-art search with a reproducible protocol; inspect current products through approved access; review patents and branding with qualified advice; conduct buyer/user discovery; compare a frozen benchmark; and validate actual integration coverage. Research pages can change after this date.
