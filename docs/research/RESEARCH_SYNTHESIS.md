# Research synthesis: what to build and what must be proved

Baseline: **8 October 2026**. Read with the [source-coverage record](SOURCE_COVERAGE.md), [current market review](MARKET_AND_NOVELTY.md) and three detailed paper reviews. Page references in those reviews identify the supplied local version; updated publication metadata is distinguished from a different final manuscript.

## What the evidence says

The documents describe a coherent engineering project: supportive conversation and optional journals routed through a shared safety policy, with bounded contextual memory, mood views, multilingual handling, understandable decisions and local human-support choices. The central uncertainty is whether the complete system improves appropriate support without excessive false alarms, unsafe generation or privacy costs.

The research does not support a claim that Lumen will be the first to combine safety, language, memory and reflection. It does support doing better **validation** of a specific integration and population. Build the policy and evaluator before spending effort on advanced RAG, many models or a polished claim of uniqueness.

## Paper-to-decision matrix

| Source | Main evidence | Decision for Lumen | Evidence boundary |
| --- | --- | --- | --- |
| S07 (S06 duplicate) — implicit ideation / DeepSuiMind | Synthetic implicit-distress response suitability benchmark | Explicitly test indirect cues and response appropriateness | ARSR is not detector recall; judge scores are not real harm |
| S08 — Between Help and Harm | Crisis category agreement and response audit | Separate detection, action and whole-response evaluation | Selected English offline inputs; historical model versions |
| S09 — Building Trust | Expert-guided evaluator framework | Calibrate automated scoring against human review | Unreconciled MAE/significance reporting; not a runtime detector |
| S10 — Hinglish suicidal-ideation detection | Code-mixed text-classification experiment | Include native script, Romanization and realistic linguistic negatives | Generated/transformed data and binary labels do not qualify a clinical triage system |
| S11 — HopeBot | Conversational depression-screening feasibility | Measure usability and agreement separately from clinical validity | Questionnaire agreement is not suicide-prevention evidence |
| S12 — Domain-Specific Constitutional AI | Specific alignment principles outperform vague baselines within reported benchmark | Use concrete versioned policies; fine-tune only if needed | Absolute safety domains remain limited; model/device/clinical generalization unproved |
| S15 — GoEmotions | Fine-grained English emotion corpus and benchmark | Optional emotion baseline with separate permissions/provenance | No clinical crisis labels or Indian-language safety validation |
| S16 — LLM suicide detection/prevention review | Survey of varied datasets and tasks | Check original denominators, task definitions and failures | Narrative review scores cannot be pooled into a Lumen target |
| S17 — psychiatric suicide-prediction review | Clinical/imaging/text/temporal studies with external-validation gaps | Preserve prediction-versus-triage distinction; test context as an ablation | Includes prior journal/longitudinal fusion; clinical structured-record metrics do not transfer |
| S18 — Mentalic Net | RAG support and proposed longitudinal views | Plain RAG baseline and separately evaluated temporal context | Semantic scores and synthetic diagrams do not establish live crisis safety |
| S19 — clinical ML meta-analysis | Predictive discrimination with heterogeneity and PPV limitations | Evaluate prevalence, precision and alert burden | Exclusion of NLP limits scope; it does not prove conversational research is absent |
| S20 — SentimentCareBot | RAG/model/sentiment configurations | Hold model/corpus fixed when evaluating added components | Significant comparisons change multiple factors; some directions/reporting conflict |
| S21 — uncertainty-aware detection | Prompt-defined sensitivity trade-off on 200 selected clinician-labeled segments | Independent detector, explicit uncertainty and proportionate action | Emergency-mode architecture is prior art; observed zero misses is finite and selected |
| S22 — chatbot efficacy meta-analysis | Pooled symptom effects with high bias/heterogeneity and incomplete safety reporting | Safety and efficacy require separate endpoints and studies | Outcome checkpoints do not audit every competitor's runtime architecture |
| S23 — Slow Drift | Adversarial multi-turn boundary failures | Test dependency, role drift, false guarantees and trajectory survival | Simulated attack results are not real-user harm incidence |
| S24 — Woebot RCT | Historical short-duration symptom/engagement trial | Retain outcome and comparator limitations; distinguish historical from current products | Already mood-responsive; a 2017 trial does not establish 2026 market absence |

Detailed methods, sample sizes, quantitative tables, contradictions and local source links: [safety papers](safety-paper-review.md), [clinical papers](clinical-paper-review.md), [RAG/datasets/efficacy](rag-datasets-and-efficacy.md).

## Findings that materially change the original gap analysis

1. **Independent screening is established prior art.** S21 proposes it directly; current products also document layered safety. Claim implementation/evaluation of a particular design, not invention of a dual pipeline.
2. **Journals and longitudinal signals have precedent.** S17 includes prior clinical fusion studies, S24 already uses mood-responsive interaction, and S18 proposes longitudinal visualization. “No system does this” is not supported.
3. **Indian-language product support exists.** Current vendor disclosures overlap with Hindi/Marathi, journals and safety features. An independently validated code-mixed benchmark may still contribute; this requires comparison and competent reviewers.
4. **Rules are not proven safer just because they are interpretable.** Use them as a baseline, measure missed concerns and false positives, and preserve uncertain status when the detector fails.
5. **No metric substitutes for the target task.** Emotion F1, BERTScore/Ragas, PHQ-9 agreement, future-outcome AUC, crisis-label recall and response safety are different outcomes.
6. **Selected zero-miss results are not guarantees.** S21's most sensitive variant has 0/92 missed reference-positive segments but 53/108 false positives. It cannot estimate misses in all unflagged users or the deployment population. See the supplied paper and review for exact context.
7. **Safety reporting gaps are not proof of missing safety machinery.** S22 reports 23/39 trials without systematic safety/adverse-event reporting and 35/39 high risk of bias; this does not prove all had no runtime controls or no local referral.
8. **Data permission is an architectural dependency.** Current source cards include noncommercial and derivative restrictions; public counseling text may remain sensitive and include unclear upstream rights. Do not build a commercial corpus first and ask about permission later.
9. **Some reported numbers need correction or reproduction.** Reviews record denominator, training/test, aggregation and significance issues without choosing favorable values. Do not turn inconsistent tables into engineering targets.
10. **A supportive handoff is a service, not a generated sentence.** A shown contact or outbound click is not a completed referral, and affiliation with a national/campus service must be established separately.

These corrections are recorded without overwriting the team's original documents. They should inform the next academic revision.

## Supplementary works cited in the documentation

These references were mentioned in the proposal/decks but were not provided as separate local papers. Primary accessible records/abstracts and relevant sections were checked; they are **not counted as complete supplied-paper reads**.

| Reference | Verification and implication | Primary source |
| --- | --- | --- |
| Inkster, Sarda, Subramanian (2018), Wysa | Observational mixed-methods high-/low-use comparison; not an RCT and not a current product-architecture audit | [JMIR mHealth and uHealth](https://mhealth.jmir.org/2018/11/e12106/) |
| Fulmer et al. (2018), Tess | Short trial in a nonclinical college population; symptom endpoints do not establish crisis safety | [JMIR Mental Health](https://mental.jmir.org/2018/4/e64/) |
| MacNeill, Doucet, Luke (2024) | Wysa chronic-disease trial with four-week symptom follow-up; different population/use from Lumen | [JMIR Formative Research](https://formative.jmir.org/2024/1/e50025/) |
| Moore et al. (2025) | Evaluates stigma/inappropriate responses and therapist substitution; supports broader guards than diagnosis-term filtering | [Author preprint](https://arxiv.org/abs/2504.18412) |
| Pichowicz, Kotas, Piotrowski (2025) | Simulated suicidal-risk evaluation of selected chatbot agents; tested versions/protocol do not establish all current products' behavior | [Scientific Reports DOI](https://doi.org/10.1038/s41598-025-17242-4) |
| Kaywan et al. (2023) | Nonclinical conversational depression-screening study; not prevention or clinical validation of Lumen | [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0279743) |
| Alakananda et al. (2026) | Multilingual Indian social-media indicator research; reinforces prior local-language research, with a different modality | [ETASR primary paper](https://etasr.com/index.php/ETASR/article/download/15214/6297) |
| Lim et al. (2022) | Earlier psychotherapy meta-regression; scope/outcome differs from a runtime safety study | [Publication record](https://pubmed.ncbi.nlm.nih.gov/35227408/) |

The current market/governance review adds primary vendor status pages, an adjacent psychiatric guardrail study and official India infrastructure/privacy sources. Those remain separate from the 16 supplied-paper reviews.

## Recommended research contribution

Define an independently reviewed, ethically sourced benchmark of multilingual indirect and temporal concerns, including benign controls. Compare a shared current-message baseline with recent-context and consented cross-source history variants under fixed models, locked development-selected thresholds and matched intended alert burden. Measure appropriate action, severe output failures, per-language performance and privacy/reliability paths. Publish allowed code, scenarios, splits, settings, intervals and negative results.

A positive result could justify the narrow claim: **“In the specified held-out benchmark, this context policy improved the stated endpoint over the named baseline, with the reported false-alert burden and limitations.”** It would not justify “world first,” “predicts suicide,” “zero risk,” or “replaces therapy.” Prospective user benefit and market adoption need separate evidence.

## Build order and unresolved work

The [implementation plan](../../IMPLEMENTATION_PLAN.md) begins with intended use and data/rubric preparation, then secure foundations, shared rules, semantic screening, guarded generation, journals/memory, language/resources, reviewer operations, frozen evaluation and a conditional supervised pilot. Advanced RAG, voice and fine-tuning must earn their cost through evidence.

Remaining dependencies include clinical/bilingual review, data permissions, authentic target-language evaluation, model/provider privacy conditions, task-specific thresholds, temporal-study precision, current competitor testing, partner coverage, and buyer willingness to pay. None was inferred from the presence of a PDF or an architecture diagram.
