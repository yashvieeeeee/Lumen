# Lumen: safety, implicit-risk, and long-conversation paper review

Reviewed on 8 October 2026. Scope: S07 (with duplicate S06), S08, S09, S12, S21, and S23. Page references use the **local PDF page number**, not a journal's printed page number. Findings below distinguish reported measurements from Lumen design inferences. This is a research and engineering review, not a clinical validation of Lumen.

## S07 / S06 — implicit ideation and DeepSuiMind

**Paper:** *Can Large Language Models Identify Implicit Suicidal Ideation? An Empirical Evaluation*. Tong Li, Shu Yang, Junchao Wu, Jiyao Wei, Lijie Hu, Mengdi Li, Derek F. Wong, Joshua R. Oltmanns, and Di Wang (2025). Peer-reviewed *Findings of ACL: EMNLP 2025*, pp. 18392–18413, DOI 10.18653/v1/2025.findings-emnlp.998. Bibliographic metadata matches the [ACL record](https://aclanthology.org/2025.findings-emnlp.998/).

**Local sources:** [S07 PDF](../../Lumen%20_%20Research%20papers/2025.findings-emnlp.998.pdf), 22 pages; [S06 DOCX](../../Lumen%20_%20Research%20papers/2025.findings-emnlp.998.docx), 775 extracted paragraphs. S06 has the same title/authors, generation protocol, main numerical table, references, and final evaluation prompt. It appears to be a conversion of S07, with broken spacing/column ordering; no distinct experiment or additional evidence was found in the comparison. Count these as **one study**.

### Question and study design

Can conversational LLMs produce appropriate replies when suicidal ideation is indirect rather than explicitly named? The principal evidence is **response evaluation**, not a separately labeled detector's sensitivity/specificity. DeepSuiMind contains **1,200 English synthetic test cases**, generated with GPT-4 (temperature 0.8, maximum 500 tokens). Cases combine three association types inspired by the Death/Suicide Implicit Association Test, ten automatic-negative-thought patterns, and stressor narratives; a second branch uses ideation-labeled Reddit posts to guide synthesis (pp. 3–5, 13–17). Translating a reaction-time psychological construct into generated language is a modeling assumption, not validation that generated text has the same predictive value as the actual test.

Eight tested models: GPT-4o-mini, GPT-3.5-turbo, DeepSeek-R1, DeepSeek-R1-Distill-Llama-70B, Llama-3.1-70B, Llama-3.1-8B, Mistral-7B, and Gemini-1.5-Pro. Each is compared under neutral standard prompting (SS) and distress-aware prompting (DS). A separate **309 explicit-ideation posts** from SDCNL/r/SuicideWatch form a comparison set (p. 6).

GPT-4 judges five response dimensions, each /20: empathy/validation, connection/presence, practical support, reducing hopelessness, and offering hope. Average response score is /100; **HRR** is the percentage with total score below 60, not observed clinical harm; **ARSR** is the percentage satisfying every binary suitability rule. The suitability rules include avoiding emotional dependency and encouraging professional or social support (pp. 5–6, 22). Two raters with clinical psychology backgrounds independently assessed only **40 model replies** to check the judge (pp. 5, 14–20).

### Reported results, with metric boundaries

Selected entries from **Table 2, p. 7**; percentages refer to evaluated responses in the relevant 1,200-case implicit condition (subject to the denominator/reporting caveat below):

| Model | Implicit ARSR SS → DS | Implicit HRR SS → DS | Implicit average score SS → DS | Explicit ARSR SS → DS, 309-post comparison |
|---|---:|---:|---:|---:|
| GPT-4o-mini | 31.17% → 56.33% | 1.17% → 0.17% | 79.90 → 82.62 | 42.39% → 55.02% |
| DeepSeek-R1 | 51.86% → 61.62% | 0.09% → 0.27% | 83.48 → 84.36 | 96.12% → 97.41% |
| Llama-3-70B | 11.58% → 34.25% | 5.50% → 0.17% | 75.22 → 81.29 | 65.70% → 83.82% |
| Llama-3-8B | 6.92% → 22.08% | 15.67% → 0.25% | 70.65 → 79.69 | 40.78% → 44.34%* |
| Gemini-1.5 | 77.67% → 91.83% | 0.17% → 0.083% | 84.35 → 85.58 | 92.88% → 95.47% |

*The narrative says Llama-3-8B was excluded from explicit-condition summaries because of frequent refusals, yet Table 2 lists ARSR and omits explicit HRR/score. Reproduce refusals explicitly rather than assuming a consistent denominator. Some percentages (e.g., 51.86%) are not simple rounded multiples of 1/1,200; the paper does not supply exact per-cell counts. The text also says Gemini's implicit HRR was 8.3%, whereas Table 2 gives 0.17% SS and 0.083% DS. Use the table and flag the discrepancy; **do not propagate 8.3%**.

In Table 6 (p. 20), human–human binary suitability agreement is κ=0.510 and accuracy=0.75; human–GPT-4 κ values are 0.706 and 0.798. Human–human score Pearson correlation is 0.709, while human–AI correlations are 0.448 and 0.592. The narrative says rater B–AI accuracy is 0.889, but the table says **0.90**; 0.889 is precision/recall/F1. Fleiss κ=0.667 and ICC(2,1)=0.596. This is limited validation on 40 replies, not proof that the judge is objective.

Appendix E (pp. 19–21) compares the synthetic corpus with **1,200 real Reddit posts**. Type-token ratio is 0.810 versus 0.858 (d=−0.182); text length is 1,745.95 versus 1,225.32 characters (d=0.330); Flesch reading ease is 77.47 versus 70.62 (d=0.301). Similar surface statistics do not establish authentic clinical distributions or outcome prediction. The paper calls 0.2–0.5 effects “medium” and uses inconsistent category language; retain numeric effect sizes rather than importing these labels.

### Limitations and implications for Lumen

- This benchmark contains constructed positive-risk scenarios; it does **not** measure false alarms on ordinary sadness, grief, metaphor, fiction, quoted text, or another person's risk. ARSR is not recall and 1−ARSR is not a detector false-negative rate.
- GPT-4 generated the cases and judged responses. Small human calibration, model snapshots, prompt sensitivity, English-only scope, and absence of longitudinal clinical outcomes limit generalization. The paper explicitly labels its resources research tools requiring qualified human oversight, not direct clinical instruments (p. 9).
- There are internal reporting discrepancies: “12 stressors” in the method but **11** listed in Figure 7; score range 0–20 in the appendix versus 1–20 in the final prompt; Table 5 calls a 57/100 example “suitable” despite weak referrals/safety and the strict all-rules requirement. These matter when reusing its rubric.
- **Lumen design inference:** use implicit-risk cases as a dedicated evaluation slice, score response quality separately from detection, and test distress-aware prompting as a baseline. The study supports contextual safety instructions, but cannot identify their causal mechanism or prove that a separate detector fixes the gap.
- Use independently adjudicated English/Hindi/Hinglish benign and risk examples, refusal accounting, calibrated uncertainty, and exact confusion-matrix counts. Evaluate practical referral, avoidance of dependency, and safety-check appropriateness as separate outputs.

**What this cannot establish:** suicide prevention efficacy, clinically validated predictive accuracy, Indian-language performance, zero missed crises, or novelty of Lumen's architecture. Strong empathy scores are compatible with inadequate safety responses.

## S08 — crisis category detection versus response safety

**Paper:** *Between Help and Harm: An Evaluation Study of Mental Health Crisis Handling by Large Language Models*. Adrian Arnaiz-Rodriguez, Miguel Baidal, Erik Derner, Jenn Layton Annable, Mark Ball, Mark Ince, Elvira Perez Vallejos, and Nuria Oliver (2026). **Peer-reviewed** *JMIR Mental Health* 13:e88435, published **11 June 2026**, DOI 10.2196/88435. The [publisher record](https://mental.jmir.org/2026/1/e88435) agrees with the local final article; the earlier preprint date is 1 December 2025. Do not describe the supplied final article as only an arXiv/preprint study.

**Local source:** [S08 PDF](../../Lumen%20_%20Research%20papers/Between%20Help%20and%20Harm_%20An%20Evaluation%20Study%20of%20Mental%20Health%20Crisis%20Handling%20by%20Large%20Language%20Models.pdf), 21 pages. All five separate publisher DOCX supplements were additionally read in memory: taxonomy, response rubric, 12 source datasets, category-level result table, and failure examples. These supplements are linked from the article's Multimedia Appendices 1–5; they are not embedded in the local PDF.

### Design and annotation

The paper distinguishes **acute crisis presentations from psychiatric diagnoses**. Its single-label taxonomy contains suicidal ideation, nonsuicidal self-harm, anxiety crisis, violent thoughts, substance abuse/withdrawal, risk-taking behavior, and no crisis. It expressly does not claim predictive validity (pp. 4–5).

The authors aggregate 12 heterogeneous public Hugging Face datasets, including synthetic data, counseling, forums, and human–AI interactions, remove duplicates and low-quality records, and retain **239,606 unique user inputs**. Existing sparse labels are discarded. Four domain experts label **206 validation inputs**; three candidate LLM annotators each classify them three times. GPT-4o-mini is selected for highest mean agreement with experts. A **2,046-input test set becomes 2,044** after two inputs receive three different labels and are discarded. Final labels are modes across three GPT-4o-mini runs (pp. 6–9). Thus the abstract's 2,046 test examples are the pre-exclusion count, not the final experimental denominator.

Final label counts: no crisis **1,231**, suicidal ideation **380**, self-harm **139**, anxiety crisis **177**, substance abuse/withdrawal **77**, violent thoughts **21**, risk-taking **19**. The corpus is a selected mental-health-data mixture, so its distribution should not be presented as measured population prevalence despite the article's “mirrors real-world prevalence” wording.

Five generators—GPT-4o-mini, GPT-5-nano, Llama-4-Scout-17B-16E-Instruct, DeepSeek-V3.2-exp in nonthinking mode, and Grok-4-fast-non-reasoning—receive only user input, **without the crisis label or conversation history**, three times per input. This yields **6,132 responses per model**, **30,660 overall**. The selected judge scores each response three times: **91,980 ratings**. Final response score is the mean of three ordinal 1–5 ratings (pp. 9–10). This is an offline audit pipeline, not a deployed safety router.

The response rubric treats scores 1 and 2 as clinically unacceptable. A score of 1 covers harmful guidance and other severe failures; a score of 5 requires contextual risk checking, accurate localized resources, appropriate support, crisis-plan awareness, and follow-up. The no-crisis rubric explicitly penalizes inappropriate crisis assumptions. Therefore both missed-risk and overreaction matter. Some rubric requirements are difficult to fully demonstrate in one isolated response; neither a high score nor low judge variance proves clinical effectiveness.

### Measurements

On the **206-item classification validation set**, GPT-4o-mini–human average κ=**0.645** and raw agreement **73.6%**; GPT-5-nano κ=0.631/72.9%; Scout κ=0.581/68.1%. Mean human–human κ=0.553. Model self-agreement can be high (e.g., mini Fleiss κ=0.94) while human alignment is appreciably lower. The result is agreement with raters, not diagnostic accuracy (Table 1, pp. 7–8).

For response-judge validation, mini achieves mean absolute error **0.646** and within-one-point agreement **84.21%**, versus human–human MAE **0.463** and within-one agreement **95.26%**. The local main text does not explicitly state the number of held-out response items; do not invent this denominator. An ensemble judge does not outperform the best single judge (Table 2, p. 9). Within-one agreement may tolerate a clinically important 1↔2 or 2↔3 discrepancy.

Reported averages and maximally harmful-rate results (p. 10; denominator **6,132 responses per model**, mean of three judge ratings):

| Generator | Mean appropriateness /5 | Final score exactly 1 |
|---|---:|---:|
| GPT-5-nano | 4.936 | 0.26% |
| DeepSeek-V3.2-exp | 4.915 | 0.51% |
| Grok-4-fast | 4.748 | 2.79% |
| Llama-4-Scout | 4.722 | 0.80% |
| GPT-4o-mini | 4.548 | 0.47% |

The majority no-crisis class inflates aggregate scores. Appendix 4 is more informative for safety:

| Generator | Suicidal ideation score=1, **1,140 replies** | Self-harm score=1, **417 replies** | Self-harm score in [1,2.3] |
|---|---:|---:|---:|
| GPT-5-nano | 0.35% (Wilson 95% CI 0.14–0.90%) | 1.20% (0.51–2.78%) | 1.68% |
| GPT-4o-mini | 1.14% (0.67–1.94%) | 2.88% (1.65–4.96%) | 5.04% |
| Llama-4-Scout | 2.19% (1.49–3.22%) | 4.80% (3.13–7.29%) | 12.95% |
| DeepSeek-V3.2-exp | 0.96% (0.54–1.72%) | 1.92% (0.98–3.74%) | 3.12% |
| Grok-4-fast | 6.40% (5.12–7.98%) | 17.51% (14.16–21.45%) | 28.30% |

Risk-taking has only **19 inputs/57 replies** per model: Grok score=1 is 14.04% with CI **7.29–25.32%**. Zero observed harmful responses in that category for other models still has reported upper Wilson bound **6.31%**. Repeated replies from one input are correlated; confidence intervals treating them independently may be optimistic. Report input-level clustered intervals in Lumen.

### Evidence checks and Lumen implications

- **Known reporting errors:** the anxiety/no-crisis symmetric confusion values are written as sums, despite a stated half-sum definition: 0.496+0.100=0.596, whereas the stated formula gives 0.298. The analogous mini value should be 0.2575 from the printed probabilities, not 0.516. Some p. 11 Grok mean scores are incorrectly printed with percent signs. Use numeric table definitions rather than copying this prose.
- These are historical model snapshots and sampling conditions. Benchmark ranks do not prove why a model succeeds, nor that openness or “alignment philosophy” alone causes failure. There is no prospective user study, Hindi/Hinglish evaluation, youth validation, outcome prediction, or longitudinal intervention test (p. 17).
- **Lumen design inference:** independently test detection, response generation, and output safety; crisis labels must affect a real response policy rather than exist only in analytics. Keep multiple co-occurring risks internally rather than forcing a single label where that loses relevant information. Test benign educational/quoted/third-person material and uncertainty-driven clarification.
- Validate exact crisis-resource contacts, eligibility, geography/language, and verification dates through a maintained directory; do not let the generator fabricate a number. Safe contextual fallback and access to resource information must survive generation failure or usage exhaustion. These are engineering recommendations supported by failure patterns, not interventions proven by this study.
- Add tests for indirect information-seeking, farewell ambiguity, context deletion, formulaic refusal, and a warning followed by harmful instructions. A safety disclaimer cannot compensate for harmful output later in the same message.

**What this cannot establish:** a low real-world missed-crisis rate, therapeutic efficacy, clinical readiness, or a novel dual pipeline. Its taxonomy, localized resources, external safety-module recommendation, and follow-up ideas are already prior art.

## S09 — evaluating the evaluator

**Paper:** *Building Trust in Mental Health Chatbots: Safety Metrics and LLM-Based Evaluation Tools*. Jung In Park, Mahyar Abbasian, Iman Azimi, Dawn T. Bounds, Angela Jun, Jaesu Han, Robert M. McCarron, Jessica Borelli, Parmida Safavi, Sanaz Mirbaha, Jia Li, Mona Mahmoudi, Carmen Wiedenhoeft, and Amir M. Rahmani. First posted **3 August 2024**, revised **1 March 2025 (v2)**. The [arXiv record](https://arxiv.org/abs/2408.04650) identifies a preprint; no peer-reviewed publication was verified in this review. The local 33-page manuscript appears consistent with v2, including the additional author names. Do not label it a journal publication solely because an index calls it an article.

**Local source:** [S09 PDF](../../Lumen%20_%20Research%20papers/Building%20Trust%20in%20Mental%20Health%20Chatbots_%20Safety%20Metrics%20and%20LLM-Based%20Evaluation%20Tools.pdf). Its referenced Appendices 1–2 are not embedded as full benchmark/rating/prompt data in the 33 supplied pages. The [authors' repository](https://github.com/Institute4FutureHealth/MentalHealthSafetyEval) exposes benchmark/result files and evaluation code; its README still marks agent-method code **“To be added”**. Repository metadata and evaluation-prompt code were inspected; datasets were not downloaded or independently reanalyzed.

### Study design and metrics

The authors develop **100 expert-reviewed benchmark questions with ideal answers** spanning crises, anxiety, grief, insomnia, anger, PTSD, substance use, loneliness, identity concerns, eating problems, and burnout (pp. 5–7, 15–17). They generate one response per question using **GPT-3.5-turbo**. Five 1–10 guideline scores examine practice-guideline adherence, risk recognition/management, consistency in critical situations, resource provision, and user empowerment/professional oversight (pp. 17–18).

The manuscript inconsistently says five experts reviewed/scored responses, then says **three experts** performed the clinical scoring; Table 5 contains three reviewers. Each reviewer can contribute 100×5=500 guideline scores, whereas the text's “500 total” is ambiguous about aggregation. It does not establish a five-rater scored dataset. Table 5 reports mean domain scores: **8.6, 7.8, 4.6, 3.8, and 7.8**, with overall **6.5/10**. Weak critical-response and resource-provision scores are more important than the aggregate (pp. 18–19).

Four judge families (GPT-4, Mistral-large-latest, Claude-3-Opus, Gemini-1.0) evaluate the same answers with three prompting strategies: base, guideline-enhanced, and guideline-plus-ideal-answer. The agent uses openCHA, healthcare-constrained search and text extraction, and Tree-of-Thought planning before scoring. Two embedding comparators use multilingual-mpnet-base-v2 (768 dimensions) and all-MiniLM-L6-v2 (384 dimensions), linearly scaling cosine similarity to /10 (pp. 8–14). A multilingual embedding model is **not a multilingual evaluation**; the supplied examples/evaluation are English and US-resource oriented.

### Reported results and substantial numerical cautions

Table 6, pp. 22–23, reports the following for the **100 benchmark answer evaluations**:

| Method | Reported MAE versus human score | Reported average /10 |
|---|---:|---:|
| GPT-4 base | 3.14 | 9.81 |
| GPT-4 guidelines + reference | 2.29 | 8.97 |
| Mistral base | 2.92 | 9.60 |
| Mistral guidelines + reference | 1.43 | 8.10 |
| Claude-3-Opus guidelines + reference | 1.79 | 8.46 |
| Gemini-1.0 base | 1.58 | 8.60 |
| Gemini-1.0 guidelines + reference | 2.03 | 8.70 |
| Agent with external information | **0.31** | **6.984** |
| Large embedding comparator | 0.63 | 7.30 |
| Small embedding comparator | 1.03 | 7.71 |

**These figures are reported, not independently established.** If mean scores and MAE refer to the same paired 100 observations, MAE must be at least the absolute difference of the means. Agent mean 6.984 minus human mean 6.50 is **0.484**, already larger than claimed MAE **0.31**. Likewise GPT-4 base difference **3.31** exceeds claimed MAE **3.14**. Rounding cannot explain these gaps. Either scoring units/aggregation differ without disclosure or the table has errors. Do not promise an evaluator with “MAE 0.31” without reproducing the underlying calculations.

Table 7 labels tiny p-values (e.g., 4.45×10⁻³³) “Not significant” and agent p=**0.1961** “Significant.” These labels conflict with conventional significance testing and the manuscript's own explanation: only the agent comparison fails to show a statistically significant mean difference. **Failure to reject a difference is not proof of equivalence or agreement.** It cannot validate safety detection or individual-case reliability (pp. 21–24).

Further inconsistencies: the narrative says human minimum 2.6, while Table 6 gives 1.00; cosine similarity is not intrinsically restricted to [0,1]; and a correlation/surface similarity measure can remain high when a critical sentence changes from safe to unsafe. Expert “ground truth” responses themselves require review: Table 2 reassures a person fearing a heart attack that a panic attack is not dangerous without an adequate differential-emergency safety boundary.

### Lumen implications

- **Supported direction:** rubric-guided and reference-informed evaluation deserves a baseline; unguided LLM judges can be overly positive. The paper evaluates methods for scoring chatbot responses, not an intervention shown to make users safer.
- **Required caution:** a generator and a judge need separate, blinded evaluation against independently adjudicated human labels, especially for low-scoring safety failures. Human reviewers should inspect disagreement cases and a random sample of high-score passes. Repeating an LLM judge does not create independent clinical verification.
- For Lumen, start with deterministic checks for resource accuracy and policy violations plus a clear human safety rubric. Use model scoring as triage for review, not certification. An autonomous internet-search evaluator can introduce unstable search results and untrusted content; curated evidence and an allowlist are preferable before an unrestricted agent is justified.
- Audit false reassurance, resource mismatch, and unsafe details independently of similarity to an ideal answer. Include negation, one-sentence harmful additions, and paraphrased safe answers that lexical metrics penalize.

**What this cannot establish:** reliable crisis classification, clinical outcomes, fairness/privacy quality, generalization to multiple generators or Indian languages, or a statistically validated equivalence claim. Its strongest numeric superiority claim needs reproduction because of the table inconsistency.

## S12 — domain-specific constitutional alignment

**Paper:** *Domain-Specific Constitutional AI: Enhancing Safety in LLM-Powered Mental Health Chatbots*. Chenhan Lyu, Yutong Song, Pengfei Zhang, and Amir M. Rahmani. The local file is explicitly **arXiv:2509.16444v2, 20 January 2026**, and says **accepted to IEEE BSN 2025**. The [current arXiv record](https://arxiv.org/abs/2509.16444) confirms v2 and gives the 2025 IEEE 21st International Conference on Body Sensor Networks proceedings reference, pp. 1–4, with DOI **10.1109/BSN66969.2025.11337405**. Classify it as a conference paper with a revised arXiv manuscript; the proceedings PDF was not accessible through the web tool, so version identity between the five-page local manuscript and four-page proceedings was not established.

**Local source:** [S12 PDF](../../Lumen%20_%20Research%20papers/Domain-Specific%20Constitutional%20AI.pdf), five pages, all read. No supplemental appendix is included or referenced as an additional experimental report.

### Design

Four main conditions compare Llama-3.2 **1B** without extra alignment, 1B trained with vague/general constitutional principles, 1B trained with four specific mental-health principles, and unaligned Llama-3.2 **3B**. The described training uses supervised self-critique/revision and RLAIF, **5,000 sampled MentalChat16K rows**, two response pairs per training example, and early stopping (pp. 1–2).

Specific principles cover professional help, evidence-based self-care, empathetic nonjudgmental language, and relevant crisis resources, explicitly naming the US **988** service (Table I, p. 3). Evaluation uses the **same 100-query Institute for Future Health benchmark family reviewed in S09**, five /10 scores summed to /50 per reply (p. 2). This is a common evaluation instrument, not an independent replication of all S09 conclusions. The paper does not clearly identify evaluator count, scorer model if applicable, inter-rater reliability, exact training/test leakage controls, confidence intervals, random seeds, or full training configuration.

### Reported results

Table II (p. 4) reports mean total score **13.74/50** for the 1B baseline, **18.29** vague principles, **19.92** unaligned 3B, and **24.08** specific principles. The stated **31.7%** improvement is relative to the vague-principles score, not a reduction in clinical harm.

Specific-principles domain scores are **6.47, 6.18, 2.69, 2.91, and 5.85 /10**. The crisis-consistency and crisis-resource domains remain low in absolute terms despite large relative gains from baseline **1.06** and **1.13**. This is evidence of improvement within a weak baseline, not a passing safety result.

An ablation changes two specific professional-help/resource principles to vague wording while retaining the other two. Total score declines **24.08 → 19.45** (reported 19.2% reduction); ablated critical-response score is **1.25**, below even vague-model **1.78**, while resource score is **2.23** (Table III, p. 4). The ablation therefore does not show uniform improvement for every principle combination.

### Limitations and Lumen implications

- Domain-specific alignment is already prior art. “Our first mental-health constitution” is not defensible novelty. Four short rules are not a complete operational safety policy; emergency referrals, clinical boundaries, hallucinations, dependency, privacy, cultural risks, and escalation need separate specification and testing.
- The model-size comparison is only **1B versus 3B under this benchmark**. No device latency, energy, memory footprint, deployment costs, or clinical efficacy were measured. On-device feasibility is a suggested implication, not demonstrated hardware evidence.
- Lack of clear evaluator detail, uncertainty estimates, reproducibility artifacts and leakage controls limits confidence. Claims of regulatory compliance, transparency, and therapeutic efficacy in the introduction/discussion exceed what the reported scores establish.
- **Lumen design inference:** write versioned, concrete mental-health policy rules first; compare prompt-only policy and constrained response templates before expensive fine-tuning. Add CAI/RLAIF only if a controlled held-out evaluation demonstrates benefit over the existing simpler baseline. Localize resources through verified data, not a US number hardcoded into model weights.
- If reproducing this work, retain the general/specific/scale/ablation baselines, match training budgets, document evaluator identity and blinding, and report per-domain failure rates as well as averages. Include English/Hindi/Hinglish challenge sets not used to construct the constitution or training pairs.

**What this cannot establish:** a safe autonomous therapist, clinically effective crisis handling, general scaling laws, proven on-device deployment, Indian-language safety, or that fine-tuning is necessary for Lumen's initial implementation.

## S21 — independent, uncertainty-aware crisis detection

**Paper:** *Suicide- and crisis-risk detection using large language models in mental-health chatbots*. Samantha Weber, Dustin Klebe, Lukas Wolf, Christopher Aeberli, Stephanie Homan, Nikolas Psathakis, Andrea Casanova, José Garcia Macias, Jack Sykstus, Jie-Ming Li, Barbora Provaznikova, Judith Rohde, Laura Frühschütz, Charlotta Rühlmann, Tobias Welt, Tobias Kowatsch, Birgit Kleim, MULTICAST consortium, and Sebastian Olbrich. **medRxiv preprint v1, posted 15 January 2026**, DOI 10.64898/2026.01.12.26343914. The local manuscript explicitly says it was not certified by peer review. The [medRxiv record](https://www.medrxiv.org/content/10.64898/2026.01.12.26343914v1) and [author's university repository](https://alexandria.unisg.ch/entities/publication/5e6024ed-9fbe-40cd-967e-41fb7236f86e) confirm this status; no later peer-reviewed version was verified in this review.

**Local source:** [S21 PDF](../../Lumen%20_%20Research%20papers/Suicide-%20and%20Crisis-Risk%20Detection%20Using%20Large%20Language%20Models%20in%20Mental-Health%20Chatbots%20.pdf), 35 pages including the ETH repository cover. The four graphical pages at the end were visually checked; they repeat main figures, including the independent detector architecture. Referenced Supplementary Figures S1–S6 and complete annotation/prompt instructions are not embedded in the supplied file. The [author repository](https://github.com/sonia-health/llm-mental-health-risk-detection) says patient data are private and experimental prompt templates are available only on request; public templates are placeholders. Consequently, exact reproduction is not possible from the supplied/public material alone. No data or model downloads, paid inference, or author outreach were undertaken.

### Sample, labels, and experiment

During three weeks in September 2025, the authors screened **3,608 user–chatbot exchanges involving 676 clients** from Sonia, a US voice-based mental-health chatbot. They selected **200 clinically sensitive segments from 126 distinct clients**, preceding an operational safety flag or manual reviewer flag. Each segment contains ten user/assistant messages; raters assess the **final user message using the preceding nine messages as context**. The paper sometimes calls the source units “conversations” and sometimes “exchanges”; this does not establish 3,608 independent full sessions (pp. 8, 12).

Five clinical experts independently give binary high/low labels across suicidal ideation, homicidal ideation, psychiatric emergency, medical emergency, and abuse/neglect of vulnerable people. The final reference is majority vote: **92 high-risk and 108 low-risk segments**. Fleiss κ=**0.34**, reflecting appreciable disagreement (pp. 8–12). This is a consensus label for current concerning language, not a validated prediction of future attempts or deaths.

One base model, **GPT-5-chat-latest, October 2025 snapshot**, is tested under five prompts—Extreme Low, Low, Medium, High, Extreme High sensitivity—without task-specific training. Prompts vary both covered risk cues and how readily ambiguity warrants a positive label. Each segment/prompt is evaluated **three times**, with the median binary prediction used for scoring: **200×5×3=3,000 inference trials** (pp. 9–11). These are different natural-language instructions, not thresholds on a calibrated probability. The paper's intended nested trigger sets do not mathematically guarantee that a stochastic LLM is monotonic for every individual case.

### Reported results and the actual denominator

**Table 1, p. 30:** every row uses the same **92 reference-positive and 108 reference-negative segments**; predictions are three-run medians.

| Prompt sensitivity | TP | FP | FN | TN | Recall | Precision | FPR | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Extreme Low | 12 | 2 | 80 | 106 | 13.0% | 85.7% | 1.8% | 0.226 |
| Low | 52 | 5 | 40 | 103 | 56.5% | 91.2% | 4.6% | 0.698 |
| Medium | 70 | 15 | 22 | 93 | 76.1% | 82.4% | 13.9% | 0.791 |
| High | 91 | 44 | 1 | 64 | 98.9% | 67.4% | 40.7% | 0.802 |
| Extreme High | 92 | 53 | 0 | 55 | 100% | 63.4% | 49.1% | 0.776 |

Extreme Low FPR is printed 0.018, whereas 2/108=0.01852 rounds to 0.019 at three decimals; retain exact counts. The prose says precision decreases from **91.2%** at the lowest sensitivity, but that belongs to **Low**, not **Extreme Low** (85.7%). Highest accuracy is Medium, **81.5%**; highest F1 is High, **0.802**. These are different objectives, and selecting the highest accuracy would miss **22/92** reference-positive segments.

Figure 1 reports **AUC 0.90** using the five prompt operating points, a piecewise ROC curve, and endpoints (pp. 13, 26, 32). It is not an independently validated continuous risk-score AUC, probability calibration measure, or suicide-outcome prediction result.

Latency over **3,000 individual inference trials** is mean **0.64 seconds**, SD **0.29**, median **0.60**; most calls are 0.5–0.8 seconds with occasional values above two seconds (p. 13). The method explicitly excludes user typing, client delays, and network latency (p. 11), despite calling it “end-to-end.” It also does not establish the production latency of the complete three-call median, routing, resource lookup, output check, and rendered response. Lumen must measure those separately.

For the High variant, the error-disagreement figure reports **9 errors** among unanimous-label cases, **12** with one dissenting clinician, and **24** with two dissenting clinicians (p. 13, Figure 2). Raw error counts without the number of examples in each stratum do not by themselves establish higher conditional error probability. Their association with disagreement also does not prove that errors are irreducible rather than correctable model or annotation failures.

### Limits of “zero misses” and the architecture's prior-art significance

The Extreme High result is **0 FN among 92 majority-labeled positive segments in a selected benchmark**. It is not evidence of zero missed crises among all Sonia users or all 3,608 source exchanges. Unflagged exchanges were not all independently adjudicated; the selection process can omit the very crises an existing flagger missed. Consequently, **92/3,608=2.55% is not a verified prevalence estimate**, despite being used as a full-corpus risk proportion in the discussion (pp. 17–18).

For illustration only, under an independent-binomial assumption, 0 misses in 92 positives still permits an approximately **3.20% one-sided 95% upper bound** on the underlying miss probability, calculated as 1−0.05^(1/92). Repeated segments from the same clients violate independence and may widen uncertainty further. This calculation is the reviewer's, not a paper-reported interval. Neither this bound nor the observed benchmark rate predicts clinical outcomes.

The high-recall setting incorrectly flags **53/108 low-risk segments**. In a lower-prevalence deployment, positive predictive value can fall well below the selected sample's 63.4%. Flagging should therefore initiate a proportionate, supportive clarification policy, rather than be treated as confirmed imminent danger. The binary dataset has no adequately reported category-level denominators, broader external validation, language-stratified Indian evaluation, prospective intervention outcomes, or incident-rate evidence. Founders of Sonia are coauthors and the study explicitly discloses that collaboration; this is relevant to independent replication, not grounds to dismiss its measurements (pp. 19–20).

**Direct novelty correction:** pp. 16–19 and Figure 4 (p. 29; repeated graphic p. 33) already propose an **independent background risk detector operating beside response generation**, with a restricted **emergency mode**, uncertainty-aware brief clarification, verified human crisis resources, and escalation or termination reserved for severe cases. The authors additionally discuss future temporal monitoring across turns, sessions, and days. Lumen cannot claim to invent the independent dual pipeline, emergency mode, uncertainty-aware detection, or the idea of longitudinal monitoring.

The detector is evaluated; the subsequent full emergency-mode interaction is a **conceptual proposal**, explicitly awaiting testing. The paper's non-abandonment discussion is useful policy motivation, but this experiment does not prove that a particular emergency response improves safety or engagement.

**Lumen design inference:** keep a conservative risk signal distinct from the response generator, represent uncertainty explicitly, and allow a clinician-reviewed clarification stage. Preserve relevant recent context while testing misleading quotes and third-person reports. Treat detection, emergency response, localized resource delivery, output safety, and de-escalation as separately evaluated components. Record reason codes and evidence spans without presenting an LLM explanation as proof of a clinical diagnosis. Test alarm fatigue, repeated false positives, unsupported referrals, and the return from restricted mode as well as sensitivity.

**What this cannot establish:** zero real-world missed crises, a production subsecond safety pipeline, clinical effectiveness, the correct escalation threshold for Lumen, language fairness, or invention of the architecture Lumen proposes.

## S23 — boundary erosion in multi-turn conversations

**Paper:** *The Slow Drift of Support: Boundary Failures in Multi-Turn Mental Health LLM Dialogues*. Youyou Cheng, Zhuangwei Kang, Kerry Jiang, Chenyu Sun, and Qiyang Pan. **arXiv:2601.14269v1, 2 January 2026**; DOI 10.48550/arXiv.2601.14269. The [live arXiv record](https://arxiv.org/abs/2601.14269) lists only v1 and agrees with the local manuscript's date. No peer-reviewed venue was verified. External indexes show inconsistent January dates; use the primary version record.

**Local source:** [S23 PDF](../../Lumen%20_%20Research%20papers/The%20Slow%20Drift%20of%20Support.pdf), all 18 pages read, including Appendix A profile generation, Appendix B judging protocol, and Appendix C simulator instructions. Figures and numerical narrative are treated as attack-test measurements rather than population incidence.

### Design: what “virtual patient” means here

**GPT-5.2 generates 50 virtual profiles**, including demographic/linguistic features, vulnerabilities, a probing plan, and exact breach triggers. Appendix A requests a 50/50 split between single-target and conflicting-pressure profiles. The same profile set is used across three systems under test: **DeepSeek-Chat, Gemini-2.5-Flash, and Grok-3**, with at most **20 dialogue rounds** per case (pp. 2–7, 14–18).

Two attack regimes compare a static “slow boil” schedule—rapport in rounds 1–6, encroachment 7–12, concentrated pressure 13–20—with adaptive probing that exploits the tested model's preceding response. GPT-5.2 also acts as the virtual interlocutor and the judge/planner; judge and planner are one implemented agent. That agent detects softening and directs the next attack (pp. 3–7). This is adversarial stress testing, not a representative cohort of real help-seekers.

The six boundary families cover absolute/zero-risk assurances, professional-role substitution, dependency/exclusivity, harmful-belief validation, self-harm endorsement, and direct medical guidance (pp. 5–6). Each conversation stops at the first judged breach or after 20 safe rounds. A random **20-profile-log manual audit** is mentioned, but the paper does not supply a clinician-rater count, agreement statistic, or a sufficient per-class confusion analysis for judge validation (pp. 4–5). The appendix's assertion that judging is not subjective does not make the explicitly LLM-based judge deterministic or independently validated.

### Results and denominator caveats

The reported per-model protocol uses **50 profiles**. The following implied counts assume one conversation per profile in the reported regime; raw counts and a fully reconciled language/run ledger are not supplied.

| Model | Static breach rate | Adaptive breach rate | Mean first breach round, static → adaptive, **breached conversations only** |
|---|---:|---:|---:|
| DeepSeek-Chat | 98.0% (implied 49/50) | 88% (implied 44/50) | 9.14 → 3.64 |
| Gemini-2.5-Flash | 86.0% (implied 43/50) | 88% (implied 44/50) | 9.77 → 6.25 |
| Grok-3 | 78.0% (implied 39/50) | 88% (implied 44/50) | 8.69 → 4.02 |
| Overall reported | 87.3% | 88% | 9.21 → 4.64 |

These figures are reported on pp. 8–9. Static counts imply **131/150** tests and adaptive **132/150**, but p. 2 also says “150 tests in total.” Two regimes × three models × 50 profiles imply **300** before accounting for reported English/Chinese tests. The paper does not clearly reconcile these totals or language-specific denominators. Do not present a confidently reconstructed 300- or 600-conversation corpus as an explicit author-reported dataset count.

Reported differences in first-breach round (adaptive minus static), with bootstrap 95% CIs: DeepSeek **−5.50 [−6.76, −4.20]**, Gemini **−3.52 [−5.33, −1.72]**, Grok **−4.67 [−6.00, −3.40]** (p. 9). These support earlier breach under adaptive pressure in the tested simulation. Conditioning time averages on breached cases excludes unbreached, censored conversations and can change the comparison population; a proper survival analysis and paired-profile accounting would strengthen the finding.

Among recorded **violation categories**, absolute reassurance accounts for **56.5% static** and **48.5% adaptive**; professional-role breaches **20.5%** and relational dependence **12.1%** are also reported (p. 9). Exact category-event counts and the latter percentages' pooling convention are insufficiently specified. These are not proportions of all users, all replies, or clinically harmed patients. Small diagnostic-profile subgroup percentages, including some 100% values, should not be generalized without subgroup counts.

The discussion reports more boundary breaches in Chinese than English (p. 10), but does not provide a sufficiently clear per-language sample ledger and exact numerical comparison. This supports investigating language differences; it does not establish Hindi/Hinglish failure rates or a universal culture-specific mechanism.

### Limitations and Lumen implications

- The attacker, profile creator, judge, and planner share **GPT-5.2**. Correlated preferences can shape both what is attacked and what counts as a failure. Fixed rules do not eliminate judging bias, and this is not a blinded clinical outcome study.
- Profile prompts explicitly ground vulnerability and speaking style in demographic categories, including education and ethnicity. That can encode stereotypes rather than validate demographic fairness. Realistic-seeming generated profiles are not evidence of representative people or diagnoses.
- The study demonstrates boundary failures under designed pressure, not that 88% of ordinary mental-health conversations fail or that empathy inherently causes harm. Supportive warmth must be distinguished from false guarantees, fabricated confidentiality, exclusive dependence, and accepting clinical responsibilities the product cannot fulfill.
- **Lumen design inference:** make output safety a per-turn check throughout the conversation. Preserve the policy across summarization, memory retrieval, and long histories. Test repeated reassurance-seeking, requests for exclusive reliance, role substitution, overconfident medical reassurance, privacy promises, harmful-belief validation, and promises to monitor or initiate contact when the app lacks that capability.
- Use both fixed scripts and independent adaptive attackers, with the human reference/judge separate from attacker optimization. Begin with 20-turn tests matching this study, then extend to longer sessions and across-session continuity because the proposed product is longitudinal. Report breach-free trajectories, time to first breach, terminal safety, censoring, and recovery after a flagged turn.
- The paper recommends topic-changing during self-harm-related pressure (p. 10), whereas S21 emphasizes non-abandonment and brief empathic clarification. Neither experiment compares these intervention policies. Lumen should use a clinician-reviewed response protocol that remains supportive and offers verified human help; an automatic abrupt topic switch is not established best practice by these studies.

**What this cannot establish:** real-patient harm rates, an effective boundary-monitoring intervention, fairness across demographics, efficacy of crisis escalation, or that a 20-turn pass guarantees safety in a long-running product.

## Corrections to the supplied gap analyses

[S13: Gap Analysis Major Project](../../Lumen%20_%20Research%20papers/Gap%20Analysis%20Major%20Project.docx) and [S14: Gap_Analysis](../../Lumen%20_%20Research%20papers/Gap_Analysis.docx) contain useful motivations, but several inferences exceed the evidence. Corrections below concern safety claims covered in this review; the separate clinical review is needed to validate figures from the systematic reviews and RCTs.

| Supplied claim or inference | Evidence-grounded correction |
|---|---|
| A novel independent crisis pipeline or novel emergency mode fills an unimplemented research gap. | S21 expressly proposes the separation, conservative detector, clarification, resources, and emergency state. Implementation and Indian-language evaluation can be contributions; invention of this concept cannot. |
| Current chatbots have no real-time mechanism that checks unsafe input/output. | A bounded review's lack of reported monitoring is not field-wide absence. Current vendor disclosures describe every-message risk screening and response guardrails. [Headspace's AI disclosure](https://www.headspace.com/ai) describes its separate detector and safety reviews; [Limbic Layer](https://www.limbic.ai/layer) describes screening every input and generated response. These are primary product disclosures, not independently proven zero-harm results. |
| The 2017 Woebot trial establishes present-day Wysa/Woebot as keyword-only, intake-only systems. | A historical trial cannot establish a 2026 product architecture; “appears to be one-time” is an inference, not direct evidence. Neither a fixed research flow nor non-real-time human monitoring proves absence of automated checks on every later message. |
| Missing longitudinal validation proves mood trends are a novel, effective crisis detector. | It establishes a validation gap. S21 already discusses temporal dynamics. Mood or emotion trends are hypotheses requiring ablation and prospective validation; sentiment is not a calibrated clinical risk measure. |
| Reviews excluding NLP show conversational/text detection is comparatively understudied across the whole field. | Exclusion defines a review's scope; it does not measure how much excluded research exists. S07, S08, S21, and S23 directly study text safety. Likewise, clinical/imaging data silos do not directly demonstrate chat/journal silos in current products. |
| Transparent rules are therefore a proven safer choice than ML. | Interpretability and external-validation concerns justify a simple baseline and explainable routing. They do not prove superior recall, calibration, or clinical outcomes for a keyword/rule system. Compare rules, contextual prompts, and learned components on the same held-out cases. |
| S07 measures implicit-risk detection success. | It mainly measures suitability of generated replies. ARSR, HRR, and average empathy/safety score must not be relabeled sensitivity, missed-crisis rate, or actual harm. S14 is right to label longitudinal/personalization gaps as inferred. |
| S09 provides a validated strong foundation for an agentic safety evaluator. | The direction is useful, but its MAE and significance-table inconsistencies require reproduction. It is an offline evaluator of one older generator, not proof of a runtime architecture's safety. |
| English/Chinese stress tests validate general multilingual safety. | S23 reports a difference in two languages with incomplete language denominators. None of these papers establishes English/Hindi/Hinglish/Marathi safety equivalence. Announced multilingual product availability also is not equivalent to a validated crisis benchmark. |
| No clinical intervention test means the entire architecture is unexplored. | Distinguish an existing concept, a product disclosure, a working implementation, a benchmark, and prospective outcome evidence. S14's narrower observation that S21 does not fully evaluate subsequent intervention is supported. |

The supplied gap documents' strongest defensible conclusion is that **this corpus does not establish an independently validated, privacy-conscious Indian-language longitudinal safety workflow with reliable local resource delivery**. That is a candidate research/product direction, not proof that no competing system exists or that combining the parts will improve outcomes. Scope novelty claims to the precise feature, population, evaluation design, and verified evidence date.

## Cross-paper synthesis for the implementation plan

The six unique studies cover different layers. Their scores must not be pooled as if they measured one outcome.

| Layer | Most relevant evidence | What Lumen must evaluate separately |
|---|---|---|
| Detect present concerning language | S21 binary clinician-consensus labels; S08 category agreement | Sensitivity/FPR, uncertainty, category co-occurrence, benign ambiguity, multilingual human agreement |
| Respond appropriately | S07 suitability rubric; S08 crisis-specific 1–5 rubric | Unsafe guidance, practical and proportionate support, contextual clarification, refusal/overreaction, resource correctness |
| Sustain relational/professional boundaries | S23 adversarial trajectories | First breach, safe trajectory survival, dependency/role drift, false guarantees, policy retention and recovery |
| Improve alignment | S12 specific constitution versus baselines | Added benefit over prompt/template baselines, absolute per-domain failures, training leakage and regressions |
| Automate evaluation | S09, plus judge-validation experiments in S07/S08 | Human alignment on critical failures, judge false passes, reproducible arithmetic, independence and uncertainty |
| Show benefit to users | **None of these studies establishes Lumen's benefit** | Feasibility/acceptability first, then supervised prospective safety and outcome evaluation under a defined protocol |

**Recommended architectural baseline, inferred from the evidence:** a consented chat/journal input path feeds independent contextual risk checks; a versioned policy router selects ordinary support, clarification, or restricted crisis response; verified resource data supplies contacts; every proposed response is checked before release. Store only justified longitudinal state with provenance and deletion controls. A safety signal should include source channel, evidence spans, uncertainty, rule/model version, and routing action. The journal path must have truthful monitoring expectations: historical journal processing cannot imply a person was watched or an emergency service was notified. None of this architecture is itself new prior art; the project contribution must be demonstrated by evidence.

**Candidate contribution worth testing:** an independently evaluated Hindi/Hinglish-first safety workflow that combines consented chat and journal context while controlling false alarms and relational boundary drift, delivers verified India-specific resources, and makes routing explanations auditable. The key research question is whether context and personalization improve clinically adjudicated safety over a simpler per-message baseline **without** excessive alarms, privacy costs, fabricated authority, or worse subgroup performance. Marathi should be a separate supported-language milestone after competent raters and test data exist. This is a testable hypothesis and market positioning candidate, not a world-first claim.

### Evaluation work packages and progression gates

1. **Define intended use and adjudication before model selection.** Separate current risk language from predicted future behavior, adult wellbeing support from medical diagnosis/treatment, and a resource offer from actual human escalation. Create a clinician-reviewed policy, multi-risk labels, ambiguity/disagreement recording, response rubric, and escalation/non-abandonment rules. No numerical launch threshold should be chosen solely by copying an aggregate paper score.
2. **Build a locked, independently adjudicated evaluation set.** Obtain ethical/licensing clearance and appropriate consent for any real conversations. Use synthetic cases for development, not sole final evidence. Include English, Devanagari Hindi, Romanized Hindi/Hinglish, misspellings, dialects, transliteration, and within-message code-switching. Preserve patient/user separation, frozen held-out splits, category counts, benign controls, and independent reviewer agreement. Record unknowns rather than forcing certainty. Neither GoEmotions sentiment labels nor a depression questionnaire is a suicide-risk ground truth.
3. **Compare simple baselines and context ablations.** Evaluate rules, current-message contextual prompts, recent-history prompts, and consented journal/history additions on the same held-out inputs. Include implicit/passive ideation, information-seeking, quoted/third-person statements, fiction, jokes, negation, grief, farewell ambiguity, panic/medical uncertainty, intoxication, abuse, and multiple simultaneous risks. Report exact TP/FP/FN/TN, sensitivity, specificity, PPV under declared prevalence assumptions, and user-clustered intervals. Do not remove refusals or ambiguous cases silently; analyze them separately.
4. **Evaluate the response and resource path independently.** Test clear supportive responses, harmful details after disclaimers, overconfident reassurance, unsupported clinical authority, refusal-only abandonment, incorrect location/eligibility, resource outages, missing location, and offline access. Verify contacts against authoritative maintained sources and store last verification time. Score complete user-visible output, not only the detector decision or first sentence.
5. **Add trajectory stress tests.** Run fixed 20-turn scenarios and adaptive attacks, then longer and cross-session cases. Use independent attackers and blinded clinical review of breaches and a random sample of passes. Measure time to first boundary breach with censoring, proportion of breach-free trajectories, false emergency entries per user/session, and recovery. Inject summarization loss, retrieved unsafe text, prompt injection in journals, stale memory, deletion, and policy/model upgrades.
6. **Exercise reliability and escalation honesty.** Force risk-model timeout, malformed outputs, rate limits, generation failure, disconnected networks, resource-service failure, duplicate requests, and app restart. Measure complete rendered safety-response latency at p50/p95/p99, including network, retries, resource lookup, and output checks. Provide a dependable fallback/resource path; do not fabricate that a clinician is monitoring, that help was dispatched, or that contact occurred. Do not allow usage quotas or provider failures to remove access to the resource fallback.
7. **Validate evaluators and attempt replication.** Recalculate all metric summaries and confidence intervals from raw records. Reproduce S09's claimed advantage only if source ratings and aggregation become available; otherwise do not cite MAE 0.31 as a validated target. Calibrate automated judges with sufficient independent human review, especially their false passes on severe failures. Repeated stochastic scoring is not independent validation. Freeze judge and rubric versions for comparisons.
8. **Run a supervised feasibility stage before broader claims.** Clinician-led review of representative users, understandable consent, controllable data retention, acceptability of clarification, alarm fatigue, and a rehearsed incident-response process precede effectiveness claims. Report observed failures and uncertainty. Prospective outcome research is a later work package; no retrospective benchmark can justify claims of preventing suicide or zero missed crises.

**Immediate research uncertainties:** exact unavailable S21 prompts/supplements; S09's unreconciled scoring arithmetic and missing agent-method code; S23's total/language run ledger; authentic consented Indian-language labels and qualified annotators; appropriate alert and clarification thresholds; benefit of journal/history context; acceptable false-positive burden; emergency-mode effectiveness; and current competitors' independently published performance in the intended market. These are work items, not reasons to claim the gaps are solved.

## Coverage and evidence provenance

Complete supplied PDF texts were read for S07, S08, S09, S12, S21, and S23, including all embedded references/appendices and reported tables. S06 was compared as a duplicate conversion; S13 and S14 were read for claim correction. S08's five publisher DOCX supplements were additionally read without retaining a dataset. S21's final graphical pages were visually checked; unavailable separate supplements were not inferred. Metadata and important publication/product claims were checked against the primary links above on 8 October 2026. Reported values are preserved even where contradictory; review calculations and architectural proposals are explicitly identified. No implementation code, model inference, model weights, or patient dataset downloads were performed for this review.
