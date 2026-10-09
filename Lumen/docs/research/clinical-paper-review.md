# Clinical outcomes, suicide-related text detection, and screening: paper review

Reviewed 8 October 2026. This report covers supplied sources **S10, S11, S16, S17, S19 and S24**, with corrections to relevant claims in S13 and S14. It is an evidence review for Lumen's implementation plan; it is not a clinical protocol or a claim that Lumen has been evaluated.

## Findings that change the project plan

Lumen should distinguish **recognising suicide-related statements and choosing a safe conversational action**, **administering a depression screening instrument**, **predicting a future attempt from clinical records**, and **improving symptoms through an intervention**. These are different tasks with different labels, populations, time horizons and validation requirements. The supplied papers do not establish that success on one establishes success on the others.

Several proposed individual features already exist in the literature: Hindi-English suicidal-text classification (S10); mood-driven conversational tailoring and weekly temporal feedback (S24); journal, mood, sleep and phone-activity features together (S17); sequential clinical/EMA modelling (S17); and bilingual RAG-assisted PHQ-9 clarification, deterministic scoring and country-specific crisis resources (S11). A defensible research contribution would need a precise combination, a new evaluation or a demonstrated improvement, rather than claiming these components are absent everywhere.

High accuracy or AUROC is insufficient evidence for crisis safety. S17 includes a model with **93.7% accuracy but 12.8% sensitivity**. S19's heterogeneous clinical studies report pooled PPV around **0.10**, from only six studies. A small pilot trial showing improved depression scores (S24) does not establish reduced attempts, reliable crisis recognition or safe generative responses. [S17, Table 1](../../Lumen%20_%20Research%20papers/Machine%20learning%20and%20the%20prediction%20of%20suicide%20in%20psychiatric%20populations.pdf#page=4); [S19, Table 2](../../Lumen%20_%20Research%20papers/Role%20of%20machine%20learning%20algorithms%20in%20suicide%20risk%20prediction.pdf#page=20); [S24, results and limitations](../../Lumen%20_%20Research%20papers/woebot-conversional%20AI%20for%20anxiety%20and%20depresssion_.pdf#page=6).

HopeBot must be cited as a **peer-reviewed 2026 feasibility and agreement study**, not as a thesis or an efficacy RCT. Its final publication appeared on 25 June 2026; the supplied manuscript contains some different values and internal inconsistencies. [Final publication and bibliographic record](https://journals.plos.org/digitalhealth/article?id=10.1371/journal.pdig.0001446).

## Review method and coverage

The complete supplied text was read for all six papers: 6, 43, 13, 22, 29 and 11 PDF pages respectively. Methods, tabular results, discussion, limitations, references and appendices present in those files were included. The 14 image-only supplementary charts in S11, on PDF pages 40 and 42, were extracted and visually inspected; copies are in [paper-images](paper-images/). S13 and S14 were also read in full. The [source manifest](source-manifest.json) records original paths, hashes and extraction coverage; [extracted text](extracted/) preserves the page markers used below. PDF page references are one-based file pages, which may differ from printed journal page numbers.

Bibliographic metadata and headline numerical results were checked against primary publisher/ACL pages and PubMed/PMC records. Targeted original-study checks of Ghanadian, Peis, Haines-Delmont and Oh exposed consequential denominator/training-versus-test issues, documented below. This does not mean every primary study cited inside a systematic review was independently reread. Other findings from S16/S17/S19 about an included study remain **review-level extractions**, not a fresh audit of that study's dataset or analysis. External supplements missing from the supplied PDFs were identified but were not all retrievable; the specific gaps are recorded at the end. Thus, the claim here is complete reading of the supplied files, not complete reading of every cited article or unavailable external supplement.

The evidence descriptions below distinguish technical benchmarks, feasibility/agreement studies, short pilot RCTs, qualitative systematic reviews and heterogeneous meta-analysis. Those labels describe what each design can support; they are not a universal quality ranking.

## S10 — Hindi-English code-mixed suicidal-text classification

**Citation.** Kaustubh Agarwal and Bhavya Dhingra (2021), *Deep Learning Based Approach For Detecting Suicidal Ideation in Hindi-English Code-Mixed Text: Baseline and Corpus*, Proceedings of the 18th International Conference on Natural Language Processing (ICON), pp. 100–105, NLP Association of India. The supplied PDF orders the title as “in Code-Mixed Hindi-English.” [ACL canonical record](https://aclanthology.org/2021.icon-main.14/); [supplied original](../../Lumen%20_%20Research%20papers/Deep%20Learning%20Based%20Approach%20For%20Detecting%20Suicidal%20Ideation.pdf); [extraction](extracted/S10.txt).

**Evidence type:** supervised technical benchmark on synthetically generated code-mixed posts. No prospective clinical evaluation, intervention outcome or deployment safety study.

### Design, data and models

The classification corpus has **6,533 samples**, of which **3,098 (47.41%)** are labelled suicidal and **3,435 (52.59%)** non-suicidal. English Reddit posts from SuicideWatch supply the positive class; unrelated communities such as Aww, Jokes, History, Discussion, Stories and Entertainment supply negatives. A previously developed semi-supervised generator converts English text to Hindi-English code mixing, with Hindi written in Roman script. This is not a clinician-labelled corpus of spontaneous Hinglish crisis conversations. [S10, corpus construction, PDF pp. 2–3](../../Lumen%20_%20Research%20papers/Deep%20Learning%20Based%20Approach%20For%20Detecting%20Suicidal%20Ideation.pdf#page=2).

Word embeddings use approximately **412,000 Hinglish tweets** and **320,000 English tweets**, with Hinglish-only and combined embedding variants; the paper uses 300-dimensional word2vec/fastText embeddings and a window of 10. Traditional baselines include naive Bayes, random forest and linear/RBF SVM. Neural models include LSTM, BiLSTM and attention-based BiLSTM; transformer baselines are IndicBERT and multilingual BERT. Deep networks are trained for 20 epochs with a 15% validation allocation, and transformers for five epochs with the same stated allocation. The description does not clearly establish an untouched independent test set and its exact denominator; the authors also select a model using validation performance. [S10, PDF pp. 3–4](../../Lumen%20_%20Research%20papers/Deep%20Learning%20Based%20Approach%20For%20Detecting%20Suicidal%20Ideation.pdf#page=3).

### Results and their denominators

| Comparison | Reported metric | Interpretation |
| --- | --- | --- |
| Traditional classifiers | Accuracy: naive Bayes 51.2%; random forest 55.7%; linear SVM 59.2%; RBF SVM 60.8% | Same constructed binary task; not clinical event prediction |
| Best embedding-based model | Attention BiLSTM with combined word2vec: **90.66% accuracy** | Overall classification accuracy; no class-specific miss rate reported |
| Transformers | IndicBERT **98.54%**, multilingual BERT **96.63% accuracy** | Corpus-specific headline results; exact independent test denominator and uncertainty are insufficiently documented |

These values come from S10 Tables 2–4, PDF pp. 3–4; ACL independently confirms the IndicBERT headline. No confidence intervals, clinical sensitivity, PPV, severity strata or observed attempt outcomes accompany the headline accuracies. [S10, tables](../../Lumen%20_%20Research%20papers/Deep%20Learning%20Based%20Approach%20For%20Detecting%20Suicidal%20Ideation.pdf#page=4); [ACL abstract](https://aclanthology.org/2021.icon-main.14/).

### Limitations and Lumen implications

The positive and negative classes differ by source/topic as well as label. A classifier can learn community, topic or generation artifacts; a nearly balanced dataset does not reproduce a low-prevalence journal/chat population. Synthetic conversion does not validate spontaneous idioms, Devanagari/Roman mixtures, dialects, spelling variation, sarcasm, historical references, negation, indirect intent or multi-turn disambiguation. The paper itself acknowledges noise, context and figurative language problems. User-level/temporal splits, duplicate checks and generator-contamination controls are not sufficiently reported. [S10, limitations, PDF p. 4](../../Lumen%20_%20Research%20papers/Deep%20Learning%20Based%20Approach%20For%20Detecting%20Suicidal%20Ideation.pdf#page=4).

**Use in Lumen:** keep this as a historical Hinglish baseline and a warning about synthetic-to-natural transfer. Evaluate natural Hindi/Hinglish separately, group translations and posts by source/user across splits, and publish error slices. The existence of this 2021 work rules out a blanket “first Hindi-English suicidal-text detector” claim.

**Cannot infer:** 98.54% crisis sensitivity, safety in live Hindi chat, Marathi performance, imminent-attempt prediction, calibrated risk probabilities, superiority to clinicians or fewer suicide attempts. The paper says its data/code are on GitHub, but no exact usable repository URI or dataset licence was recovered from the supplied PDF or primary metadata. Article availability does not grant rights to the underlying Reddit-derived corpus or tweet embeddings.

## S11 — HopeBot conversational PHQ-9 screening

**Citation.** Zhijun Guo, Alvina Lai, Julia Ive, Alexandru Petcu, Yutong Wang, Luyuan Qi, Johan H. Thygesen and Kezhi Li (2026), *Feasibility and user evaluation of HopeBot: An LLM-powered conversational chatbot for depression screening*, **PLOS Digital Health 5(6): e0001446**, DOI **10.1371/journal.pdig.0001446**, published 25 June 2026. [Final publisher article](https://journals.plos.org/digitalhealth/article?id=10.1371/journal.pdig.0001446); [PubMed](https://pubmed.ncbi.nlm.nih.gov/42348542/); [supplied 43-page manuscript](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf); [extraction](extracted/S11.txt). The earlier [arXiv record](https://arxiv.org/abs/2507.05984) has the title *Development and Evaluation of HopeBot: an LLM-based chatbot for structured and interactive PHQ-9 depression screening*.

**Evidence type:** registered, within-subject mixed-method feasibility and format-agreement study. It is neither a thesis nor a randomized therapeutic efficacy trial. A self-administered PHQ-9 is the comparator format, not a clinician diagnostic gold standard.

### Population, protocol and architecture

Of **191 enrolled participants, 132 were analysed**: 32 were excluded for completing under 80% of the survey, 12 for incoherent/AI-generated responses and 15 for non-substantive open responses. Participants were adults aged 18–70, recruited in the **UK (68)** and **China (64)**; 75% were under 45, 88.7% held a degree and 64.4% were regular LLM users. Most had minimal-to-mild PHQ-9 scores: **93/132** in the self-administered format and **95/132** in the chatbot format. This is a convenience sample with limited representation of severe clinical presentations. [S11, PDF pp. 6–12 and Table 1](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf#page=6).

The order was fixed: self-administered PHQ-9 first, HopeBot second, in the same session; post-interaction survey followed. Recall, order effects and demand characteristics can increase agreement. The bot session lasted approximately 25 minutes and the survey approximately 35 minutes. The study was registered as **NCT06801925**, with UCL approval **26133.001**, and data collection in March–April 2025. Those governance details do not establish efficacy or crisis-response sensitivity. [S11, methods, PDF pp. 6–9](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf#page=6).

The system uses **GPT-4o**, Streamlit, LangChain/Chroma retrieval, text-embedding-3-small, 512-token chunks with 20% overlap, and OpenAI speech interfaces. It supports **English and Mandarin**. The retrieval collection draws on CBT transcripts/role plays, a therapist guide, ESConv, PsyQA examples and crisis resources; retrieval evidence is internal rather than displayed as live references. Its protocol has rapport building (maximum 20 turns), sequential administration of the nine PHQ-9 items and personalised feedback. The LLM classifies free-text responses into four standard answer categories and asks for clarification when ambiguous. **Backend code assigns 0–3 and sums the score deterministically.** This architecture is reusable prior art: scoring arithmetic need not be entrusted to generated text. [S11, architecture and appendices, PDF pp. 3–6 and 25–30](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf#page=3).

### Quantitative findings

| Outcome | Result in supplied manuscript | Correct denominator/meaning |
| --- | --- | --- |
| Identical total PHQ-9 scores | **59/132 (44.7%)** | Same people completing two formats of the same instrument |
| Absolute total-score difference | Median **1** point, IQR **2**; mean **1.26** | Score difference, not diagnostic error |
| Correlation / agreement | Spearman rho **0.92**; ICC **0.922**, 95% CI **0.89–0.94** | Association and reported score agreement |
| Severity-category change | **37/132 (28.0%)**, adjacent categories | Small score differences can cross meaningful cut-offs |
| Bland–Altman limits | Bias **−0.05**; limits **−4.24 to +4.15** points | Individual paired score differences, not negligible for every person |
| Greater trust in chatbot score | **53/75 (70.7%)** | Queried subset; not 70.7% of all 132 and not verified accuracy |
| Chatbot preference / future willingness | **92/132 (69.7%)** / **115/132 (87.1%)** | Self-report acceptability in this selected cohort |
| Comfort / voice clarity / sensitive disclosure / recommendation | **8.44 / 7.73 / 7.60 / 7.36** mean ratings on 0–10 scales | Subjective ratings, not clinical or safety outcomes |
| Generation / TTS / total latency | **1.47 ± 0.30 s / 2.36 ± 0.49 s / approximately 3.83 s** | Per conversational turn, not emergency response or rescue time |

S11 results are on PDF pp. 12–18. The current publisher version confirms the principal concordance figures. Its country comparison is **U = 2645.0, p = 0.023**, rather than the supplied manuscript's **U = 2610.5, p = 0.037**; cite the final value if this comparison is needed. [S11, supplied results](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf#page=12); [final published results](https://journals.plos.org/digitalhealth/article?id=10.1371/journal.pdig.0001446).

### Safety, supplementary material and reliability checks

Appendix S3 describes **keyword-triggered session interruption**, a supportive scripted response and **country-specific crisis contacts for the UK and China**. It does not report measured crisis sensitivity, false alarms, adverse-event rates, successful referrals or outcomes after escalation. Therefore, claims that earlier systems never provided geographically appropriate crisis resources are contradicted by this supplied appendix. [S11, Appendix S3, PDF p. 30](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf#page=30).

The supplied manuscript has internal discrepancies: comfort **8.44** in the results versus **8.51** in a later comparison table; trust **53/75** in results versus **53/73** in discussion; several chart code counts on pages 40/42 do not match the narrative's code labels/counts. For example, one chart attributes 72 mentions to neutral/consistent language and eight to anonymity, while narrative coding assigns 72 to anonymity. Theme percentages are shares of **coded mentions**, which can contain multiple codes per response, not percentages of unique participants. Those counts should be reconciled against the final supplement before reuse. [S11, discussion and supplementary coding](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf#page=19); [example inspected chart](paper-images/S11-page40-0.png).

The manuscript labels ICC(3,1) as absolute agreement; that notation usually denotes a consistency formulation. The exact implementation should be checked before treating this statistic as proof of absolute agreement. The paired signed-rank statistic is labelled “Z = 1304.0”; this appears to be a raw statistic rather than a standardized Z. These reporting questions do not negate the visible score-concordance finding, but warrant caution when reproducing methods. [S11, statistical analysis, PDF pp. 9–13](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf#page=9).

### What to take into Lumen

Reuse the **separation of response interpretation, deterministic questionnaire scoring, bounded dialogue flow, clarification and curated referrals** as design principles, subject to licensing and local clinical review. A questionnaire score and a dialogue safety state should remain separate: a total depression score cannot independently determine whether a particular message requires immediate attention.

Do not interpret high concordance as diagnostic accuracy: there is no independent clinician reference, the same instrument was repeated immediately and 28% moved a severity category. Do not interpret preference/trust as reliable crisis handling. The exclusions, education/LLM familiarity, fixed order and mostly mild symptom spectrum constrain generalization; there is no long-term symptom, attempt or mortality outcome. Four-expert predeployment review is useful but does not replace a measured safety evaluation. [S11, limitations, PDF pp. 21–23](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf#page=21).

**Availability and rights:** the paper links public [HopeBot-Candice code/materials](https://github.com/candiceguo0528/HopeBot-Candice), but no explicit LICENSE was visible in the checked repository root. Public visibility is not a licence to reuse code, participant content or source counselling material. The final paper restricts participant-level data through ethics/governance arrangements; these are not an unrestricted training set. The final article is open access, while component and data rights require separate checks.

## S16 — BERT and LLM suicide-related applications: systematic review

**Citation.** Inbar Levkovich and Mahmud Omar (2024), *Evaluating of BERT-based and Large Language Mod for Suicide Detection, Prevention, and Risk Assessment: A Systematic Review*, **Journal of Medical Systems 48:113**, published 30 December 2024, DOI **10.1007/s10916-024-02134-3**. The unusual grammar/abbreviation is the published title. [Publisher](https://link.springer.com/article/10.1007/s10916-024-02134-3); [PMC full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC11685247/); [supplied original](../../Lumen%20_%20Research%20papers/Large%20Language%20Mod%20for%20Suicide%20Detection,%20Prevention,%20and%20Risk%20Assessment.pdf); [extraction](extracted/S16.txt).

**Evidence type:** systematic narrative synthesis of heterogeneous computational/observational studies and simulated risk assessments. No pooled clinical-effectiveness estimate; no proof that an LLM prevents attempts or deaths.

### Scope and results

The review includes **29 studies from 2020–2024**, following searches of seven databases covering January 2018–April 2024 and registration **CRD42024546865**. It excludes preprints and non-English publications, but the included underlying data are not exclusively English. BERT encoders, GPT variants and other transformers operate on Reddit/Twitter posts, clinical records, counselling chats, Weibo, Thai/Arabic text and case vignettes. “LLM” is used broadly enough to include encoder classifiers rather than only generative chatbots. The authors apply QUADAS-2 to 25 studies and PROBAST to four. Many applicability/flow judgments remain concerning or unclear. [S16, methods and evidence tables, PDF pp. 2–8](../../Lumen%20_%20Research%20papers/Large%20Language%20Mod%20for%20Suicide%20Detection,%20Prevention,%20and%20Risk%20Assessment.pdf#page=2).

The following examples are **as extracted by this review** and should be checked in their original studies before serving as exact implementation benchmarks:

| Included task | Review-level result | Lumen interpretation |
| --- | --- | --- |
| Ghanadian et al., UMD Reddit data | Zero-shot GPT-3.5: accuracy **88%**, precision **57%**, recall **100%**, F1 **0.73**; few-shot: precision **67%**, recall **77%**, F1 **0.71** | Small test set; conditional on conclusive responses; see primary correction below |
| Izmaylov et al., 44,506 online counselling chats | SR-BERT: F2 **0.76**, AUROC **0.92** | Counselling text and theory-informed language modelling are prior art, not proof of prevention |
| eRisk 2020, 340 training / 423 test users | Highest reported precision **0.913**, F1 **0.754**, latency-weighted F1 **0.658** | Different maxima may come from different systems/configurations; timing is already studied |
| Clinical text extraction, 12,759 inpatient stays | CMTN suicide-attempt extraction F1 **0.96** vs suicidal-ideation extraction F1 **0.52** | Labels/tasks differ; do not advertise the easier extraction score as overall crisis detection |
| Thai suicide-risk text modelling | BERT risk F1 **0.93**, emotion F1 **0.88** | Non-English application exists; no Hindi/Marathi transfer guarantee |

Source: S16 Table 1, PDF pp. 5–6 and associated results. These results have heterogeneous denominators, labels and split procedures. A training corpus with billions of pretraining tweets is not billions of clinically labelled examples. A vignette model's closeness to clinicians' ratings is not prospective event prediction, and the review reports underestimation by some GPT-3.5 assessments. [S16, Table 1 and results](../../Lumen%20_%20Research%20papers/Large%20Language%20Mod%20for%20Suicide%20Detection,%20Prevention,%20and%20Risk%20Assessment.pdf#page=5).

**Primary denominator check — Ghanadian:** the 21,518 figure refers to users in the broader source subset, including **20,525 unlabelled users**, rather than 21,518 evaluated labelled posts. The original paper's Table 1 has 733 users in its task subset, 561 training and **172 test instances**. GPT performance is reported only for conclusive answers: at temperature 0.1, **5/172 (2.91%)** are inconclusive. This is a four-category user-level task, and the summary metric's averaging is insufficiently clear to reinterpret “100% recall” as universal crisis sensitivity. The original notes a small test set and unknown pretraining contamination. [Ghanadian et al., ACL paper, PDF pp. 4, 6 and 9–10](https://aclanthology.org/2023.wassa-1.16.pdf). Lumen must report abstentions and their outcomes as well as conditional classification scores.

### Caveats and Lumen implications

Category counts are not fully consistent: the overview's detection/risk/prevention totals overlap or exceed 29, later detection/risk counts differ, and validation-status counts total 30. Some table references/rows appear duplicated. Vendor-unsupported GPT parameter counts should not be propagated as verified architecture facts. The paper's broad language about “prevention,” clinician superiority or saving lives is stronger than the included classification and simulation designs justify. It contains no pooled reduction in attempts/deaths and cannot establish therapist replacement. [S16, results, limitations and Table 1](../../Lumen%20_%20Research%20papers/Large%20Language%20Mod%20for%20Suicide%20Detection,%20Prevention,%20and%20Risk%20Assessment.pdf#page=7).

**Use in Lumen:** specify the target and annotation standard before selecting a model; compare rules, an encoder and LLM-based recognition on the same held-out data; measure precision/recall trade-offs, multi-turn timing and cross-language errors. Keep “response policy”, “symptom screening”, “label extraction” and “future-event prediction” as separate evaluation tracks.

**Cannot infer:** a single best model, causal prevention, transfer to India, superiority to professionals across clinical decisions or a release threshold. The article is CC BY 4.0, but no general licence for its underlying datasets/models follows. Its external search-strategy supplement was identified but not successfully read; see coverage gaps below.

## S17 — Suicide prediction in psychiatric populations

**Citation.** Alessandro Pigoni, Giuseppe Delvecchio, Nunzio Turtulici, Domenico Madonna, Pietro Pietrini, Luca Cecchetti and Paolo Brambilla (2024), *Machine learning and the prediction of suicide in psychiatric populations: a systematic review*, **Translational Psychiatry 14:140**, published 9 March 2024, DOI **10.1038/s41398-024-02852-9**. [Publisher record](https://www.nature.com/articles/s41398-024-02852-9); [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10925059/); [supplied original](../../Lumen%20_%20Research%20papers/Machine%20learning%20and%20the%20prediction%20of%20suicide%20in%20psychiatric%20populations.pdf); [extraction](extracted/S17.txt).

**Evidence type:** qualitative systematic review of clinical prediction/classification studies; heterogeneous outcome definitions prevented quantitative meta-analysis. This is primarily psychiatric clinical evidence, not a free-text companion-chat benchmark.

### Design and evidence landscape

The review includes **81 studies** found through PubMed, EMBASE, Scopus and hand search up to **17 November 2022**. Inclusion requires psychiatric clinical populations and an English-language publication, rather than English-speaking subjects. Studies range from **37 to 10,120,030** records/participants as tabulated, with six not reporting sample size; 45 use transdiagnostic samples and 36 a specific diagnosis. Clinical/demographic features dominate (54/81); eight use NLP, and a minority use imaging, genetics, laboratory measures or repeated behavioural data. The review assesses reporting using TRIPOD; a reporting checklist should not be treated as a complete guarantee against bias. [S17, methods/results, PDF pp. 2–3 and 16–18](../../Lumen%20_%20Research%20papers/Machine%20learning%20and%20the%20prediction%20of%20suicide%20in%20psychiatric%20populations.pdf#page=2).

**41/81 (51%)** focus on lifetime/past attempts. Only **16/81 (19.7%)** use future-outcome longitudinal analyses, with horizons from one to twelve months. Ideation, self-harm, death, hospitalisation and other targets also appear. Historical attempt classification, future event prediction and current ideation detection must not be pooled conceptually as one “risk accuracy”. Of 62 studies reporting accuracy or AUROC, 54/62 (87%) exceed 70% accuracy or 0.70 AUROC; this is a count of studies passing either threshold, **not 87% prediction accuracy**. External validation is uncommon, with explicitly noted exceptions rather than total absence. [S17, PDF pp. 16–18](../../Lumen%20_%20Research%20papers/Machine%20learning%20and%20the%20prediction%20of%20suicide%20in%20psychiatric%20populations.pdf#page=16).

### Important counterexamples in Table 1

These are review-level extractions from Table 1, PDF pp. 4–16; they are not an independent replication.

| Study/sample | Task and reported result | Why it matters |
| --- | --- | --- |
| Oh et al., 573 patients with anxiety/MDD | Past-month attempt classification: **93.7% accuracy**, **99.6% specificity**, **12.8% sensitivity** | Overall accuracy can conceal missing most positives; primary paper confirms the low sensitivity |
| Coley et al., 1,518,968 psychiatric outpatients | 90-day outcome; RF and logistic regression both **AUROC 0.85** with person-level split | More complex ML is not automatically better |
| Iorfino et al., 1,962 young people in services | Six-month self-harm: AUROC **0.74–0.76**, PPV **0.31–0.32**, NPV **0.91–0.93** | Requires event, time horizon and prevalence context |
| Haines-Delmont et al., 80 consenting inpatients; **66 modelled** | **Journal-derived measures, mood, sleep, phone use/activity** among 172 features; best KNN accuracy **68%**, AUROC **0.65** | Journal/behaviour fusion has already been studied; presence does not prove usefulness |
| Peis et al., 1,023 patients | EHR + repeated EMA, sequential/recurrent modelling of ideation; primary L=1 test accuracy **88.96 ± 5.04%**, AUROC **0.8329 ± 0.0513** | Review's approximately 95% / 0.94 values correspond to training results; see correction below |
| Nock et al., 1,818 psychiatric ED patients | Self-report + EHR + clinician prediction, attempt at 1/6 months: AUROC **0.78** | Combined data remain imperfect and require clinical context |
| Cook et al., 1,453 users/patients, Madrid | Text-app approach: sensitivity **0.56**, specificity **0.57**, PPV **0.61** | Spanish/non-US text evidence exists; performance is not universally high |

Source: [S17, Table 1](../../Lumen%20_%20Research%20papers/Machine%20learning%20and%20the%20prediction%20of%20suicide%20in%20psychiatric%20populations.pdf#page=4).

**Primary checks:** Peis Table III clearly separates training from test results. The L=1-attention training accuracy is **95.98%** and AUROC **0.9402**; test recall is **67.68 ± 3.50%**, precision **58.81 ± 20.06%**, across four folds. These are fold means/SDs, not confidence intervals. The S17 table should not be used to claim 95% held-out accuracy. [Peis et al., author manuscript, PDF p. 6](https://arxiv.org/pdf/1911.03522).

Haines-Delmont's journal measures include word count/sentiment and summary statistics; the primary study models **66/80** with a repeat assessment after 3–7 days. This establishes surface-level journal/behaviour integration, not a sophisticated longitudinal semantic chat-memory model or prediction of eventual attempts. [Haines-Delmont et al., primary methods/results](https://mhealth.jmir.org/2020/6/e15901/). Oh's primary discussion confirms the **12.8% past-month sensitivity**, despite high overall accuracy. [Oh et al., primary paper](https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2017.00192/full).

### Limits and project consequences

The review includes Chinese, Korean and other non-Western clinical settings, and Spanish-language text work. S13's universal Western/English-only claim is therefore false. The review's limited neuroimaging/genetic integration should not be translated into a market claim that no system combines journals and chat, and those expensive clinical measures are not required merely to appear innovative. Table 1 directly contradicts a blanket absence of journal/behaviour fusion or sequential modelling. [S17, Table 1 and discussion, PDF pp. 4–19](../../Lumen%20_%20Research%20papers/Machine%20learning%20and%20the%20prediction%20of%20suicide%20in%20psychiatric%20populations.pdf#page=4).

Main limitations include inconsistent event definitions/horizons, retrospective data, class imbalance, differing feature availability, small samples for some modalities, incomplete reporting and weak external validation. Clinical prescriptions and diagnoses are associations, not causal prescriptions or appropriate proxies for users without records. Random visit splitting can leak the same patient's history into training/testing; person-level and temporal splits matter. [S17, discussion, PDF pp. 17–19](../../Lumen%20_%20Research%20papers/Machine%20learning%20and%20the%20prediction%20of%20suicide%20in%20psychiatric%20populations.pdf#page=17).

**Use in Lumen:** motivate explicit longitudinal evaluation and external validation, but define what a journal history contributes using paired history/no-history tests. Do not produce a numerical probability of future suicide from consumer text by borrowing clinical risk weights. Measure decisions under uncertainty and per-group errors.

**Cannot infer:** that Lumen can access equivalent predictors, that a psychiatric-record model generalizes to a voluntary chat population, that black-box or interpretable models are clinically safe by architecture alone, that accuracy measures attempts prevented, or that external validation has never existed. The article is CC BY 4.0 and review data are stated available on request; clinical datasets retain their own restrictions. The external supplementary tables were identified but not retrieved successfully.

## S19 — Clinical ML risk prediction: systematic review and meta-analysis

**Citation.** Houriyeh Ehtemam, Shabnam Sadeghi Esfahlani, Alireza Sanaei, Mohammad Mehdi Ghaemi, Sadrieh Hajesmaeel-Gohari, Rohaneh Rahimisadegh, Kambiz Bahaadinbeigy, Fahimeh Ghasemian and Hassan Shirvani (2024), *Role of machine learning algorithms in suicide risk prediction: a systematic review-meta analysis of clinical studies*, **BMC Medical Informatics and Decision Making 24:138**, published 27 May 2024, DOI **10.1186/s12911-024-02524-0**. [Publisher](https://link.springer.com/article/10.1186/s12911-024-02524-0); [PubMed](https://pubmed.ncbi.nlm.nih.gov/38802823/); [supplied original](../../Lumen%20_%20Research%20papers/Role%20of%20machine%20learning%20algorithms%20in%20suicide%20risk%20prediction.pdf); [extraction](extracted/S19.txt).

**Evidence type:** systematic review with pooled performance proportions across heterogeneous clinical studies. Important reporting and estimation issues lower confidence in precise pooled benchmarks.

### Scope and quantitative findings

The authors include **41 studies published 2011–2022**, searching PubMed, Scopus, Web of Science and SID. They deliberately **exclude NLP/image processing**, social-media studies and military/veteran populations. Consequently, the review's omission of conversational text is not evidence that conversational text research does not exist. It combines different clinical/general populations, outcome definitions and follow-up periods. Samples are reported from 159 to 13,980,570, but the latter refers to **outpatient appointments**, not that many unique people. [S19, selection and Table 1, PDF pp. 3–18](../../Lumen%20_%20Research%20papers/Role%20of%20machine%20learning%20algorithms%20in%20suicide%20risk%20prediction.pdf#page=3).

The review uses MMAT quality assessment and random-effects pooling with DerSimonian–Laird/Freeman–Tukey methods. Frequent risk factors are assembled from reported features; reporting frequency is not effect size or causality. Selecting each study's better-performing algorithm and pooling unlike outcomes can produce optimism and obscure threshold/prevalence differences. [S19, methods, PDF pp. 4–5](../../Lumen%20_%20Research%20papers/Role%20of%20machine%20learning%20algorithms%20in%20suicide%20risk%20prediction.pdf#page=4).

| Metric | Table 2 estimate (95% CI) | Studies / heterogeneity | Interpretation |
| --- | --- | --- | --- |
| AUROC | **0.77 (0.74–0.80)** | 32; I-squared **95.86%** | Pooled discrimination across different tasks, not individual probability accuracy |
| Accuracy | **0.78 (0.73–0.84)** | 13; I-squared **56.32%** | Highly prevalence/threshold dependent |
| Sensitivity | **0.69 (0.60–0.78)** | 15; I-squared **95.94%** | Different outcome definitions and thresholds |
| Specificity | **0.81 (0.77–0.86)** | 15; I-squared **80.31%** | Cannot combine with another pooled metric to simulate one coherent classifier |
| PPV | **0.10 (0.04–0.19)** | 6; I-squared **97.02%** | Text reports a different interval, **0.03–0.21**; both show uncertainty |
| Precision | **0.91 (0.85–0.98)** | 3 | Different study subset; precision and PPV ordinarily describe the same conditional fraction |
| Recall | **0.58 (0.15–1.29)** | 3 | Upper CI outside the probability range: do not use as a valid probability interval |
| True-positive rate | **0.77 (0.40–1.34)** | 1 | Same interval problem; sensitivity/recall/TPR are not independent concepts |

Source: S19 Table 2, PDF p. 20, and surrounding text pp. 19–22. The PPV/precision contrast must not be advertised as “91% precision and 10% PPV” for one model. Their differing subsets, populations and definitions require checking the individual papers. The recall/TPR intervals require methodological correction before quantitative reuse. [S19, Table 2](../../Lumen%20_%20Research%20papers/Role%20of%20machine%20learning%20algorithms%20in%20suicide%20risk%20prediction.pdf#page=20).

### Reporting checks and implications

The supplied flow arithmetic does not reconcile (for example, 7,529 minus 569 is not 6,624), some study locations/citations appear mismatched, and the false-negative-rate definition describes negatives incorrectly classified instead of missed positives. These are reasons to use the review as a map to primary literature rather than as a precise algorithm leaderboard. A table entry for Cho et al., **372,813** people, reports AUROC **0.8335** alongside mean PPV **0.005** and very high NPV, further illustrating the base-rate problem; exact operating points should be checked in that primary study before reuse. [S19, flow/Table 1/definitions, PDF pp. 5–18 and 22](../../Lumen%20_%20Research%20papers/Role%20of%20machine%20learning%20algorithms%20in%20suicide%20risk%20prediction.pdf#page=5).

**Use in Lumen:** require prevalence, threshold, event/horizon, confusion matrix, calibration and alert workload alongside AUROC. Report uncertainty and external validation rather than claiming a generic “94% accurate risk predictor”. Feature importance is not a clinical explanation of causality, and interpretability alone does not establish fewer harmful errors.

**Cannot infer:** the best architecture for text triage, Lumen PPV from pooled clinical PPV, all populations being Western, total absence of external validation, or the effectiveness of intervention. This review includes cross-system validation work; “uncommon” is defensible, “none” is not. The article is CC BY 4.0; its clinical source datasets are not thereby available or licensed for Lumen.

## S24 — Woebot pilot randomized trial

**Citation.** Kathleen Kara Fitzpatrick, Alison Darcy and Molly Vierhile (2017), *Delivering Cognitive Behavior Therapy to Young Adults With Symptoms of Depression and Anxiety Using a Fully Automated Conversational Agent (Woebot): A Randomized Controlled Trial*, **JMIR Mental Health 4(2):e19**, published 6 June 2017, DOI **10.2196/mental.7785**, PMID 28588005. [Publisher and full text](https://mental.jmir.org/2017/2/e19/); [supplied original](../../Lumen%20_%20Research%20papers/woebot-conversional%20AI%20for%20anxiety%20and%20depresssion_.pdf); [extraction](extracted/S24.txt).

**Evidence type:** small, unblinded, two-week randomized feasibility/preliminary efficacy trial, comparing a conversational CBT programme with information-only control. It is the strongest causal symptom-outcome design among these six supplied papers, but is not a crisis-safety or generative-LLM trial.

### Design and observed results

**70 adults aged 18–28** were recruited online from a US university community and self-identified symptoms. **34** were allocated Woebot (up to 20 sessions over two weeks), **36** a NIMH depression ebook. Outcomes were self-reported PHQ-9, GAD-7 and positive/negative affect, assessed at baseline and approximately two to three weeks later. The sample was mostly female (**47/70**); ethnicity was available for only **58** respondents (Caucasian **46/58**, non-Hispanic **54/58**). **58/70 (83%)** provided T2 data, and intention-to-treat analysis imputes missing outcomes under missing-at-random assumptions. This is not a broad diagnosed clinical population. [S24, methods and Table 1, PDF pp. 2–5](../../Lumen%20_%20Research%20papers/woebot-conversional%20AI%20for%20anxiety%20and%20depresssion_.pdf#page=2).

The main Table 2 reports adjusted follow-up PHQ-9 means **11.14** (Woebot) and **13.67** (control), **Cohen's d = 0.44**, ANCOVA **F(1,48) = 6.03, p = 0.017**. The abstract instead reports **F = 6.47, p = 0.01**; use the main analysis/table values while recording the discrepancy. The between-group GAD-7 difference was **not significant (p = 0.581, d = 0.14)**. Anxiety improved over time in both groups among completers (**F(1,54) = 9.24, p = 0.004**); that within-time finding does not establish a chatbot-specific anxiety benefit. [S24, Table 2 and results, PDF p. 6](../../Lumen%20_%20Research%20papers/woebot-conversional%20AI%20for%20anxiety%20and%20depresssion_.pdf#page=6); [publisher Table 2](https://mental.jmir.org/2017/2/e19/).

Bot participants engaged a mean **12.14 times (SD 2.23, median 12, range 8–18)**. There was no equivalent objective ebook-use measure, no linked individual dose–outcome analysis and no demonstrated mediation through alliance. Qualitative complaints include natural-language misunderstandings and loops; these are not measured rates of dangerous crisis errors. [S24, engagement/qualitative results, PDF pp. 5–7](../../Lumen%20_%20Research%20papers/woebot-conversional%20AI%20for%20anxiety%20and%20depresssion_.pdf#page=5).

### Existing adaptation and safety behaviour

The 2017 architecture is a decision tree with NLP branch points and fixed study-period parameters, **but it tailors interaction to mood**, tracks goals/accountability, and provides weekly graphs and temporal-pattern feedback. “Fixed parameters” does not mean identical content for everyone or no history-based support. The supplied gap document's blanket static/unpersonalised/no-temporal-pattern description is inaccurate. [S24, intervention description, PDF pp. 3–4](../../Lumen%20_%20Research%20papers/woebot-conversional%20AI%20for%20anxiety%20and%20depresssion_.pdf#page=3).

Onboarding explains that a psychologist is not monitoring in real time and that the agent is not a replacement for therapy. Crisis contacts/emergency advice are provided when users denote suicidality or self-harm. The paper does **not** establish that screening happens only once, prove the exact recognition mechanism is keyword-only, quantify detection performance or demonstrate emergency handoff outcomes. S13's “one-time intake” characterization should therefore be removed unless another primary source supports it. US emergency details from a 2017 paper are not an Indian referral directory. [S24, safety description, PDF pp. 3–4](../../Lumen%20_%20Research%20papers/woebot-conversional%20AI%20for%20anxiety%20and%20depresssion_.pdf#page=3).

### Limits and Lumen implications

The small sample, short duration, lack of blinding, single-community recruitment, self-report outcomes, information-only control, uneven attrition and lack of follow-up limit causal/generalization claims. The control does not isolate CBT content from conversation, reminders or attention. A founder's commercial affiliation and company-funded incentives are disclosed. The study cannot establish sustained benefit, efficacy in India, reduced attempts, safety for high-risk users or safety of present-day LLM behaviour. [S24, discussion/limitations/disclosures, PDF pp. 7–9](../../Lumen%20_%20Research%20papers/woebot-conversional%20AI%20for%20anxiety%20and%20depresssion_.pdf#page=7).

**Use in Lumen:** symptom-outcome evaluation is a later research track requiring a defined intervention, comparator, follow-up and approved protocol. For an initial product, evaluate usability and bounded support honestly; do not equate engagement, perceived empathy or PHQ-9 reduction with crisis protection. The article is open access, while intervention code/content is not released by the article. The linked external CONSORT-EHEALTH appendix was not successfully accessible in this session.

## Corrections to S13 and S14 gap analyses

Sources: [S13 original](../../Lumen%20_%20Research%20papers/Gap%20Analysis%20Major%20Project.docx), [S13 extraction](extracted/S13.txt), [S14 original](../../Lumen%20_%20Research%20papers/Gap_Analysis.docx), [S14 extraction](extracted/S14.txt).

The table paraphrases explicit claims where identified and labels broader possible extensions separately. S14 correctly identifies a **natural Hinglish data gap** in S10; it does not claim that Hinglish detection has never existed. Source-specific omissions cannot establish a universal literature or product-market gap. S13's claims concerning the separate chatbot meta-analysis require that source's own audit; HopeBot's non-randomized resource protocol does not establish what all 39 RCTs in that other review did.

| Gap claim / possible extension (paraphrased) | Evidence-based revision |
| --- | --- |
| S13, S17 section: all reviewed studies appear Western/English-language | False as a universal: S17 includes Chinese/Korean and Spanish settings; S16 includes Thai/Arabic/Weibo; S11 evaluates Mandarin and English. English publication eligibility is not participant language. India-specific external validation still remains an open requirement. |
| Possible extension: first Hindi-English suicidal-text detector | Contradicted by S10 (2021). S14's narrower natural-code-mixing robustness, better labels and cross-source transfer gaps remain credible. |
| S13, Woebot section: fixed tree implies no real adaptation | S24 describes mood-driven tailoring, goal tracking and weekly temporal feedback. The parameters were fixed during the trial, not every user's flow. |
| S13, Woebot section: suicidality handling appears a one-time intake trigger | Not established by S24. The paper describes response when a user denotes suicidality/self-harm; performance/frequency are not evaluated. |
| Possible extension of S13's fusion/temporal analogy: no earlier model uses journals or time-varying signals | Contradicted by Haines-Delmont, Peis and other S17 Table 1 entries. A specific consumer journal/chat integration still requires a direct prior-art/product search. |
| Possible extension: no earlier country-specific crisis resources | S11 Appendix S3 supplies UK/China-specific contacts. This is outside the separate RCT meta-analysis; resource presentation, verified successful handoff and staffed escalation are different capabilities. |
| Possible extension: HopeBot proves clinical efficacy/diagnostic accuracy | It demonstrates within-session format concordance and acceptability, not independent diagnostic validity, treatment benefit or crisis safety. S14 correctly identifies this limitation. Cite the 2026 journal version. |
| S13, S19 section: excluding NLP strengthens evidence that text risk detection is understudied | S19 intentionally excluded NLP/social media; its omission cannot establish a field-wide research gap. |
| Possible extension: external validation is absent everywhere | Both clinical reviews include exceptions. S13's qualified wording about S17 is appropriate; the wider S19 implication needs primary-study checks. |
| Possible extension: interpretable rules are inherently safer than ML | Interpretability helps audit decisions but does not establish sensitivity, false-alarm burden or helpful responses. Rules and ML need the same evaluation. |
| Possible extension: 87% / 98.54% accuracy establishes market-ready suicide prediction | S17's 87% is a fraction of studies meeting heterogeneous thresholds; S10's 98.54% is corpus classification accuracy. Neither is a live-chat safety rate or future-attempt probability. |

S13's emphasis on scarce longitudinal validation and low clinical PPV is useful when the task/population are stated. S14's concerns about HopeBot's fixed order, selective/general-population sample and need for independent reference assessment are also reasonable. They should be kept with narrower wording and version-aware citations. Claims of novelty should identify what was searched, as of what date, and exactly which combination/evaluation remains unproven.

## Cross-paper synthesis for Lumen

### A task map to keep the evidence honest

| Lumen capability | Relevant supplied evidence | Required outcome / limit |
| --- | --- | --- |
| Recognise concerning current text | S10; selected S16 studies | Annotated statement/action classification, context-sensitive recall and false-alert burden; not future death probability |
| Track change in voluntary history | Sequential and journal/behaviour examples in S17; eRisk in S16; S24 weekly patterns | Paired history/no-history tests and timing; not diagnosis from trend alone |
| Administer a screening questionnaire | S11 | Item coverage, response mapping, deterministic scoring, clinician-reviewed interpretation; agreement is not independent diagnostic accuracy |
| Offer supportive conversational exercises | S24 | Bounded content and measured usability; eventual symptom outcome trial distinct from safety testing |
| Choose a crisis-related response | S11/S24 describe resources but do not quantify safety | Appropriate recognition, response policy, accurate current referrals, uncertainty handling, no fabricated monitoring/handoff |
| Predict a later clinical attempt | S17/S19 | Separate, prospectively validated clinical model with defined horizon and available predictors; unsupported for the initial companion product |

**Design inference:** keep a bounded policy/scoring layer independent of generated prose. Preserve relevant context with user control, recognise ambiguity, and use verified resource records rather than model-invented contact details. Generative fluency must not silently change the policy, questionnaire arithmetic or referral destination. S11 supplies architectural precedent; the other papers motivate independent external evaluation rather than prove this inference is safe by itself.

### Base rates and false alerts

For a binary classifier, at prevalence p, sensitivity Se and specificity Sp:

`PPV = (Se × p) / [(Se × p) + ((1 − Sp) × (1 − p))]`.

**Illustrative calculation, not measured Lumen performance:** Se = 95%, Sp = 95%, p = 1% gives PPV approximately **16.1%**. Among 10,000 hypothetical independent cases, this means 95 true positives, 495 false positives, five misses and 9,405 true negatives. Even strong-looking sensitivity/specificity can create substantial false-alert burden at low prevalence. At 10% prevalence the same rates give about 67.9% PPV. Actual Lumen prevalence, event definition and operating threshold are unknown; the S19 pooled rates come from different studies and must not be combined as one model. This arithmetic explains the clinical reviews' warning without borrowing their PPV as a consumer-chat forecast.

Operational costs matter: unnecessary alarm can interrupt normal disclosure, while a missed statement may leave a person without relevant support. Decide acceptable action thresholds with clinical expertise, measure both directions of error and provide an explicit uncertain state. A useful support action need not imply a numerical diagnosis or prediction of death.

### What could constitute a credible contribution

**Research hypothesis, not established novelty:** an India-focused, consent-controlled companion that jointly evaluates natural Hindi/Hinglish contextual recognition, user-approved longitudinal journal evidence, an auditable response policy and verified local referral usefulness. The contribution would be a reproducible demonstration that this combination improves appropriate action timing or reduces harmful false alerts under realistic language/context variation, compared with simpler baselines. Marathi and speech require separate evidence rather than assumed transfer.

A product's retention, affordability, privacy, ease of use and referral usability must also be tested with users and partners; these six papers cannot establish commercial demand or market leadership. The individual components are already prior art. Avoid “world first”, “clinically proven suicide prevention”, “better than therapists” and an invented risk percentage until directly relevant evidence supports the exact claim.

## Smallest credible evaluation before a user pilot

The following is a proposed offline research sequence. No dataset was downloaded, model trained, participant recruited or external message sent as part of this review.

1. **Freeze the task and action vocabulary.** Define adult supportive use, eligible languages, the distinction between current/previous/third-person content, an uncertain state, and clinically reviewed response actions. Keep PHQ-9 scoring, crisis-related statement recognition and future-event prediction separate. Do not label silence or missing journal entries as evidence of safety.

2. **Create an auditable scenario benchmark.** Begin with expert-reviewed constructed scenarios covering explicit current intent, indirect expressions, ambiguity, negation, previous episodes, quotations/fiction, someone else's distress, idioms, sarcasm, spelling/mixed scripts, recantation and multi-turn progression. Include matched journal/chat histories where the same latest message needs a different interpretation because of context. Document scenario origins and labels. Synthetic scenarios test policy; they do not establish performance on naturally occurring clinical conversations.

3. **Obtain independent annotation.** At least two qualified reviewers independently annotate relevant context and action suitability, then adjudicate differences. Record disagreements and ambiguity rather than force uncertain examples into “safe”. Keep annotators blinded to candidate system outputs where practical. Actual clinical evaluation protocols and participant-data use require governance and consent arrangements before collection.

4. **Compare simple candidates on identical splits.** Compare transparent rules, a suitable encoder/classifier, LLM-based recognition and a combined policy. Use matched history/no-history ablations to establish whether memory adds value. Group by user/source/scenario family; keep translation pairs and paraphrases in the same partition. Tune thresholds on development data, freeze them, then evaluate once on held-out data. Independent sources/time periods should be reserved for external validation.

5. **Measure detection and response safety separately.** Report confusion matrices, per-class recall and precision with confidence intervals, PR-AUC where scores exist, calibration only if output probabilities have been calibrated, abstention/coverage, timing to an appropriate action and false alerts among hard negatives. Evaluate factual referral accuracy, harmful or misleading response content, ungrounded monitoring/handoff promises and whether the right supportive action follows recognition. Do not collapse these into one “accuracy” score.

6. **Evaluate each language and interaction mode.** English, Hindi, natural Hinglish and any later Marathi release need separate result slices. Report Roman/Devanagari variants, dialects and indirect expression failures. Speech later adds ASR errors, latency and voice-specific usability; text benchmark performance does not validate speech. Country must be established by an appropriate user-controlled setting rather than inferred solely from language.

7. **Validate on naturally occurring, permissioned external data.** Resolve licences, consent, collection limits and annotation before use. Keep clinical provenance separate from public social-media labels. Do not treat a source-community label or generated translation as a clinical gold standard. Test low-prevalence false-alert scenarios, clearly distinguishing hypothetical reweighting from observed prevalence.

8. **Set release gates before inspecting final results.** Clinicians and the team should define acceptable misses, false alerts, uncertainty handling and response failures for the proposed bounded pilot. As a sample-size illustration, zero misses in 300 genuinely independent positive cases gives a rough 95% upper miss-rate bound of 1% (the rule of three); it does not prove zero risk, and correlated paraphrases undermine that bound. Language-specific assurance requires language-specific effective sample sizes. A small successful demo cannot justify “99.99% safe”.

9. **Use staged human evaluation only after those gates.** A supervised usability study can test comprehension, privacy controls, burden and resource usefulness. A therapeutic efficacy trial is a later separate project with ethics approval, an appropriate comparator, follow-up, adverse-event handling and adequate power. A clinical suicide-prevention outcome claim requires directly relevant evidence, not a PHQ-9 concordance or two-week satisfaction study.

The smallest useful deliverable is therefore a **clinically reviewed policy specification plus a reproducible offline evaluation**, not an unvalidated live crisis companion. It can produce reviewable evidence for the next phase while avoiding claims the supplied literature cannot support.

## Availability, licensing and unresolved reading gaps

| Source | Available / checked | Open issue before reproduction or data reuse |
| --- | --- | --- |
| S10 | Full supplied PDF; ACL canonical metadata | Exact code/corpus repository and dataset/Reddit/tweet reuse terms not recovered |
| S11 | Full supplied 43 pages including embedded appendices/charts; current journal publication; public repository root | No visible explicit repository licence; participant data restricted; counselling/QA retrieval rights require separate checks; supplied coding inconsistencies need final-supplement reconciliation |
| S16 | Full supplied 13 pages; publisher/PMC metadata and results | External 17.6 KB DOCX search supplement identified, but web parser did not support it and direct retrieval timed out; individual included datasets/models not audited |
| S17 | Full supplied 22 pages; publisher/PMC bibliographic checks | External 41.8 KB DOCX supplementary materials identified via PMC, but body not retrievable in this session; exact quality judgments and supplementary tables therefore not independently audited |
| S19 | Full supplied 29 pages; publisher/PMC metadata/results | Underlying clinical datasets and individual metric definitions require primary-study checks; pooling/reporting problems remain unresolved |
| S24 | Full supplied 11 pages; publisher main analyses checked | External CONSORT-EHEALTH checklist link was blocked during retrieval; intervention code/content not released by the article |

External supplemental links identified for future retrieval: [S16 supplementary search material](https://media.springernature.com/original/springer-static/esm/art%3A10.1007%2Fs10916-024-02134-3/MediaObjects/10916_2024_2134_MOESM1_ESM.docx), [S17 supplementary materials via PMC](https://pmc.ncbi.nlm.nih.gov/articles/instance/10925059/bin/41398_2024_2852_MOESM1_ESM.docx). The S24 appendix is linked from its [publisher article](https://mental.jmir.org/2017/2/e19/). No unavailable supplement has been represented as read.

Open-access article licences cover articles subject to their terms and third-party exceptions; they do not automatically cover model weights, platform posts, patient records, software or retrieved counselling transcripts. Resolve component-specific licences and consent before those materials enter Lumen's training, retrieval or evaluation assets.
