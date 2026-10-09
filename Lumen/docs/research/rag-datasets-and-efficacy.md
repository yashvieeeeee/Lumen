# RAG, emotion datasets, and efficacy evidence for Lumen

Research cutoff: **8 October 2026**. This review covers complete local extracted texts for **S15, S18, S20, and S22**, including appendices/references, and the complete supplied gap analyses **S13/S14**. Source IDs, original paths, hashes, and page counts are recorded in [source-manifest.json](source-manifest.json). Page references below are PDF page numbers, starting at the first page of the local file; journal page numbers are given separately where useful. Selected original PDF tables/figures were also visually checked because extraction loses graphical content and S20 contains duplicated text layers.

The most useful conclusion is that Lumen needs three separately evaluated capabilities: grounded support responses, emotion understanding, and crisis/safety handling. The supplied RAG papers and GoEmotions establish experimental approaches to the first two. They do **not** establish dependable crisis handling or suicide prevention. The meta-analysis supports a limited efficacy hypothesis for some chatbot interventions, while showing that safety reporting remains incomplete. These distinctions must survive into the implementation plan and presentation claims.

## 1. Bibliographic and evidence map

| ID | Exact title and authors | Year / venue / status verified by primary sources | Local original and length |
|---|---|---|---|
| S15 | **GoEmotions: A Dataset of Fine-Grained Emotions** — Dorottya Demszky, Dana Movshovitz-Attias, Jeongwoo Ko, Alan Cowen, Gaurav Nemade, Sujith Ravi | ACL 2020, *Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics*, pp. 4040–4054; DOI 10.18653/v1/2020.acl-main.372. The local PDF is arXiv:2005.00547v2, dated 3 June 2020, of a conference-published paper. [ACL publisher record](https://aclanthology.org/2020.acl-main.372/). | [S15 original](../../Lumen%20_%20Research%20papers/GoEmotions%20dataset%20of%20fine%20grained%20emotions.pdf), **15 pages**; [extraction](extracted/S15.txt). |
| S18 | **Mentalic Net: Development of RAG-based Conversational AI and Evaluation Framework for Mental Health Support** — Anandi Dutta, Shivani Mruthyunjaya, Jessica Saddington, Kazi Sifatul Islam | Local copy is the preprint version. arXiv:2509.04456v1 was submitted 27 August 2025 and explicitly reports acceptance at ISEMV 2025. Publisher-deposited Crossref metadata confirms a conference publication titled with “RAG-Based,” *2025 IEEE International Symposium on Emerging Metaverse*, pp. 77–84, dated 19 October 2025; DOI 10.1109/ISEMV67326.2025.00023. The final proceedings full text was not compared with the supplied preprint. [arXiv primary record](https://arxiv.org/abs/2509.04456), [Crossref metadata](https://api.crossref.org/works/10.1109/ISEMV67326.2025.00023), [IEEE record](https://ieeexplore.ieee.org/document/11327687). | [S18 original](../../Lumen%20_%20Research%20papers/Mentalic%20Net_%20Development%20of%20RAG-based%20Conversational%20AI%20and%20Evaluation%20Framework%20for%20Mental%20Health%20Support.pdf), **8 pages**; [extraction](extracted/S18.txt). |
| S20 | **SentimentCareBot: Retrieval-Augmented Generation Chatbot for Mental Health Support with Sentiment Analysis** — Jean Pierre Nayinzira, Mehdi Adda | *Procedia Computer Science* **251 (2024), 334–341**, ICTH 2024 proceedings; DOI 10.1016/j.procs.2024.11.118. Peer review is attributed to the conference scientific committee. Article license is CC BY-NC-ND 4.0. Repeated “2018 / 00 / 000–000” text inside the local PDF is template residue, not its publication year. [Publisher record](https://www.sciencedirect.com/science/article/pii/S1877050924033520). | [S20 original](../../Lumen%20_%20Research%20papers/SentimentCareBot_%20Retrieval-Augmented%20Generation%20Chatbot%20for%20Mental%20Health%20Support%20with%20Sentiment%20Analysis.pdf), **8 pages**; [extraction](extracted/S20.txt). |
| S22 | **Systematic review and meta analysis of chatbots in the management of depressive and anxiety symptoms** — Jun-Seok Sohn, Byeong-Gwan Ha, SoHyun Park, Jae-Jin Kim, Eojin Lee, Hyangkyeong Oh, San Lee, Eunjoo Kim | Published **25 March 2026**, *npj Digital Medicine* **9, article 377**; DOI 10.1038/s41746-026-02566-w. Peer-reviewed systematic review/meta-analysis; PROSPERO CRD42024598761. Article license is CC BY-NC-ND 4.0. [Publisher record](https://www.nature.com/articles/s41746-026-02566-w). | [S22 original](../../Lumen%20_%20Research%20papers/Systematic%20review%20and%20meta%20analysis%20of%20chatbots%20in%20themanagement%20of%20depressive%20and%20anxiety%20symptoms.pdf), **12 pages**; [extraction](extracted/S22.txt). |

**S18 author-order note:** the local PDF's column layout lists Islam in the second column of the header, while the arXiv record and Crossref publisher metadata order the authors Dutta, Mruthyunjaya, Saddington, Islam. Use the verified bibliographic order above. The preprint is not an unpublished-only work as of this review date.

## 2. S15 — GoEmotions

### What was built and tested

This is an **emotion classification dataset and modeling paper**, not a mental-health intervention study. The authors collected **58,009 English Reddit comments** and annotated them with one or more of **27 emotion labels plus Neutral**. They used **82 unique raters**, with **3 or 5 raters per comment**; **54,263 comments** had at least two raters agree on at least one label. All raters were native English speakers from India. The inputs were short comments selected to contain **3–30 tokens**, with no conversational context shown to annotators. Collection included filtering/masking, balancing by sentiment/emotion/subreddit, and masking names and religious terms. These facts are documented in **S15 pp. 3–4, Table 2**.

For modeling, labels selected by only one rater were removed, and comments retaining a label were randomly divided approximately 80/10/10 into training/development/test sets. The released canonical filtered splits are **43,410 train / 5,426 development / 5,427 test comments**, totaling **54,263**, as confirmed by the [authors' repository README](https://raw.githubusercontent.com/google-research/google-research/master/goemotions/README.md). Raw annotation rows are not independent comments: the raw release contains multiple rater rows per example. **Do not count raw rows as new patients, conversations, or independent observations.**

The principal classifier is BERT-base with a dense sigmoid output and sigmoid cross-entropy for multi-label prediction. The authors also trained a bidirectional LSTM. Their BERT settings include **4 epochs, batch size 16, and learning rate 5e-5**; these are experiment settings rather than recommended defaults for Lumen. See **S15 pp. 6–8, sections 5.1–5.4**.

### Results and denominators

| Reported measurement | Result | What the denominator actually represents | Source |
|---|---|---|---|
| BERT fine-grained macro F1 | **0.46**, label-level standard deviation **0.19**; macro precision **0.40**, macro recall **0.63** | Unweighted average across the **28 output labels** in Table 4, including Neutral, evaluated on **5,427 held-out comments**. The standard deviation is across label scores, not a confidence interval or run-to-run variance. | S15 pp. 7–8, Table 4; canonical split counts in authors' README. |
| BERT grouped sentiment macro F1 | **0.69** | Four grouped categories: positive, negative, ambiguous, Neutral; same filtered test population. | S15 p. 8, Table 5. |
| BERT Ekman-grouped macro F1 | **0.64** | Six emotion groups **plus Neutral**, so seven output categories; same filtered test population. | S15 pp. 7–8, Table 6. |
| biLSTM macro F1 | **0.41** fine-grained, **0.53** Ekman-grouped, **0.60** sentiment-grouped | Same task groupings, not clinical risk detection metrics. | S15 p. 7, section 5.4. |
| Selected BERT class F1 | Gratitude **0.86**, amusement **0.80**, love **0.78**, sadness **0.49**, nervousness **0.35**, relief **0.15**, grief **0.00** | Per-label classification on the filtered test set; class prevalence differs sharply. Grief's reported precision and recall are also zero. | S15 p. 8, Table 4. |
| Annotation dimensionality | All **27** principal preserved components were significant after the described multiple-testing correction | Agreement structure among emotion annotations, **not** accuracy of a clinical or crisis model. | S15 pp. 5–6, section 4.3. |

Transfer-learning experiments used **nine existing emotion datasets**, with target-domain training sizes **100 / 200 / 500 / 1,000 / 80% of that dataset**, repeated on **10 random splits**. The headline examples were ISEAR, Emotion-Stimulus, and EmoInt; the appendix additionally covered DailyDialog, Affective Text, CrowdFlower, Electoral Tweets, TEC, and SSEC. They compared target-only BERT, GoEmotions pretraining with frozen lower layers, and GoEmotions pretraining with all layers unfrozen. Improvements were strongest under limited target training data; with abundant target data the baseline and transfer conditions often converged. The figures report **95% confidence intervals from the repeated splits**. This is cross-domain **emotion** transfer, not cross-language or suicide-risk validation. See **S15 pp. 8–9 and 14–15, Figures 3/7**.

### Limitations that matter for Lumen

- **No crisis labels:** GoEmotions does not annotate suicidal intent, plan, access to means, imminence, self-harm, violence, safeguarding, or escalation need. An emotional category cannot be substituted for these distinct constructs.
- **No Hindi, Marathi, or Hinglish evidence:** Indian annotators labeled English text. Their location does not make the dataset multilingual or establish suitability for code-mixed Indian crisis expressions.
- **No patient trajectories:** comments are short and mostly context-free. Random comment splits cannot establish detection of deterioration over sessions.
- **Rare/implicit emotions remain difficult:** grief and nervousness have low agreement and weak baseline results. The paper itself calls for further cross-cultural robustness and extension to other languages/domains (**S15 p. 9**).
- **Residual bias:** Reddit user demographics, curation word lists, judgments about offensive identity language, and a single annotator-language community affect representativeness. The authors' dataset disclaimer explicitly acknowledges this (**S15 p. 9**).
- **Privacy is only partially addressed:** masking names is not the same as consent or robust de-identification. The raw release includes usernames and linkage metadata, as documented in the [authors' README](https://raw.githubusercontent.com/google-research/google-research/master/goemotions/README.md); the [dataset card](https://huggingface.co/datasets/google-research-datasets/go_emotions) explicitly notes possible re-identification.

### Implementation implications and unsupported inferences

Use GoEmotions, if adopted, as an **optional English emotion benchmark or auxiliary representation experiment**. Keep its predictions separate from user-entered mood scores and separate from crisis routing. Prefer user-confirmed mood data for longitudinal displays; mark machine-inferred labels and uncertainty explicitly.

Lumen's crisis evaluation needs its own task definitions and independently reviewed labels for the target languages. Translation of GoEmotions produces translated emotion examples, not clinically grounded Hindi/Marathi crisis ground truth. “Fine-grained emotion detection proves safe escalation,” “Neutral means low risk,” and “0.46 F1 is 46% crisis accuracy” are unsupported. The baseline is from 2020 and should not be described as the best model available in 2026 without a current controlled comparison.

## 3. S18 — Mentalic Net

### Design, corpus, and prototype

The paper describes a **proof-of-concept general wellbeing support chatbot**, explicitly excluding severe issues and diagnosis (**S18 p. 1**). It combines retrieval, prompting, a small chat model, and proposed therapist-facing summaries. The selected model is **TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF**, with TinyLlama's existing chat tuning as a starting point (**S18 p. 4**). The system description names hybrid BM25/dense retrieval at a high level, but the detailed recipe centers on a vector retrieval pipeline; no controlled BM25/dense/hybrid comparison is presented.

Its source collection includes:

1. EmpatheticDialogues, described as **25,000 emotionally grounded conversations**.
2. A resource called “Counsel Thoughts” in the body; reference [7] actually links **Nicolas Bertagnolli's counsel-chat** repository. This naming inconsistency should be corrected when reproducing its corpus.
3. Author-curated information from NIMH, CDC, MedlinePlus, and MentalHealth.gov/SAMHSA-related resources.
4. **samhog/psychology-10k**, described as approximately **10,000** dialogue examples.
5. **ShenLab/MentalChat16K**: the paper describes **6,338** question-answer pairs derived from **378** interview transcripts, with remaining data generated synthetically and covering **33** topics. These are the source paper's dataset descriptions, not a count of records actually incorporated into the prototype.

See **S18 p. 3 and pp. 7–8 references**. It does **not** report the resulting mixed-corpus size, counts per source after filtering, duplicate/overlap statistics, conversation-level split design, or a released versioned corpus.

The detailed recipe filters answers shorter than **50 characters**, indexes answers while retaining the question as title metadata, uses chunks of **600 characters with zero overlap**, retrieves **top six** by similarity, and prompts concise empathetic responses. Its final decoding settings are **max_new_tokens 500, temperature 0.65, top_p 0.3, repetition_penalty 1.1, context length 2,048**. See **S18 pp. 3–5**. These are implementation choices from this prototype; they are not demonstrated optima for multilingual or crisis-sensitive deployment.

### A crucial fine-tuning ambiguity

The abstract/methods claim fine-tuning, and Table 1 gives training/validation losses. However, the detailed account says its current “fine-tuning” consists mainly of RAG plus altered configuration parameters. It gives no reproducible optimizer, training-set split, epoch schedule, adapter details, updated checkpoint, or objective for an actual domain-specific weight update. **Record this as ambiguous reporting, not proof that no training occurred and not evidence that domain fine-tuning was successfully reproduced.** Retrieval and decoding changes should have their own names in Lumen's plan. See **S18 pp. 4–6**.

### Results and denominators

| Reported measurement | Result | Denominator / interpretation | Source and limitations |
|---|---|---|---|
| BERTScore | **0.898** | Responses evaluated against human-created ideal references in an author-created dataset of **500 question/response/reference samples**. BERTScore variant, scorer checkpoint, aggregation details, and confidence interval are not adequately specified. | S18 p. 5 / Table 1 p. 6. Semantic similarity, not a clinical safety rate. |
| Retrieval recall / precision | **0.86 / 0.51** | Recall refers to relevant documents retrieved out of all labeled relevant documents; precision refers to relevant documents out of retrieved documents. Number of retrieval evaluation queries, relevance adjudication procedure, and confidence intervals are not reported clearly. | S18 p. 5. Do not assume the retrieval denominator is the entire 500-sample response set. |
| Perplexity | Average approximately **25** over **500 user inputs**; some input examples reported around **100–200** | Input-token predictability, not a response's empathy, factuality, or clinical appropriateness. Details of evaluator/scoring implementation are insufficient for reproduction. | S18 p. 5. |
| Fine-tuning loss | **3.68 training / 3.40 validation** | Training/validation sample sizes and procedure are unspecified; cannot meaningfully compare with another model's losses. | Table 1, S18 p. 6; ambiguity described above. |
| Average response time | **13.8** for **50 questions** | **Unit is not printed in Table 1.** Hardware, token lengths, runtime, concurrency, and timing boundary are also insufficiently specified. | Table 1, S18 p. 6, visually checked. Do not silently report 13.8 seconds as verified. |
| Load simulation | **50 requests in 6.49 seconds** | A separately named **simulation**; insufficient detail to treat it as end-to-end throughput for 50 actual LLM conversations. | Table 1, S18 p. 6. |
| PII leakage, prompt injection, bias/human evaluation | “Satisfactory” | No sufficiently reported sample counts, failure rates, severity distributions, assessor qualifications, or thresholds to audit the claim. | S18 p. 6. Not equivalent to a passed privacy/security or crisis-safety certification. |

The paper compares its BERTScore with values from other chatbot papers, but those studies use different datasets/reference construction and evaluation conditions. Such cross-paper comparisons do not establish controlled superiority. Retrieval recall **0.86** also leaves un-retrieved relevant material and cannot justify a claim that no critical information will be missed.

### Longitudinal work and privacy boundaries

The therapist calendar and radar summaries use a **synthetic dataset**, demonstrating sentiment visualization over a proposed workflow. Alerting caregivers/professionals is described as a future possibility. There is no trial establishing clinical usefulness, deterioration detection, or safe escalation from those charts. Expert/general-user focus groups are future work (**S18 pp. 6–7**).

The paper says chat histories are encrypted and written through a webhook into Google Sheets (**S18 p. 5**). It does not supply enough detail about encryption/key management, access controls, deletion, auditability, or third-party processing to prove suitable privacy protection. Copying this storage pattern would not satisfy Lumen's intended sensitive-data architecture merely because the paper calls it secure.

### What Lumen should take from this paper

Borrow the **small, inspectable RAG baseline** idea and a separately maintained corpus; evaluate retrieval quality and generated responses independently. Keep authoritative information distinct from example counseling conversations. Track provenance, dates, allowed uses, language, and clinical approval for each retrieval item. Run safety checks on retrieved content as well as on generated output.

Do not claim that RAG is novel, that a **0.898** similarity score proves clinical safety, that “satisfactory” proves robust privacy, or that longitudinal therapist charts have never been proposed before. A stronger contribution would be a reproducible and consent-aware implementation whose safety and longitudinal value are actually measured.

## 4. S20 — SentimentCareBot

### Design, models, and dataset

This is a **technical RAG configuration experiment**, not an RCT or a live crisis service evaluation. It uses the English **Amod/mental_health_counseling_conversations** collection, reported as **3,512 question-answer records** from two public counseling platforms. **106 pairs**, approximately **3%**, are held for evaluation; approximately **97%** forms the vector knowledge base (**S20 pp. 3–5, sections 3.3/3.7**). If those partition counts are exhaustive, arithmetic leaves 3,406 corpus pairs, but the paper itself reports proportions rather than a verified post-processing count.

It compares **Naive RAG / Multi-query RAG / HyDE**, each with and without sentiment reranking, across **gpt-3.5-turbo-0125** and **mistral-large-latest**, giving **12 configurations** visible in the plots. FAISS supplies similarity search. Sentiment classification uses a “cardiffnlp” pretrained model, but its exact checkpoint/version is not clearly specified. Reranking prioritizes **positive above neutral above negative** retrieved documents and then sentiment confidence within each class (**S20 p. 4, sections 3.4–3.6**).

That ordering is a response-selection heuristic. It is **not a test of the user's crisis risk**, and a preference for positive documents is not evidence that these documents are more appropriate or safer for a distressed user. This heuristic needs a targeted ablation before any adoption.

### Evaluation and results

The primary full evaluation has **106 held-out QA pairs**. A **five-pair subset** is used for further plots and API token/latency analysis due to the authors' API constraints. Ragas metrics are **Faithfulness** (consistency with retrieved context), **Answer Relevancy** (response relevance to the question), and **Answer Correctness** (comparison with the reference answer). These are automatic/LLM-assisted assessments; the paper reports no clinician-led crisis evaluation or symptom outcomes. See **S20 pp. 5–7**.

The paper reports a **0.51 absolute median increase in Answer Correctness** for sentiment-enhanced **Naive RAG with Mistral** on the **five-question subset**. This is not a 51% gain in clinical accuracy, not a result across all 106 cases, and not a crisis-detection score. The same section notes decreased median/maximum correctness for **OpenAI HyDE** on that subset. Full-dataset medians show smaller gains, and faithfulness is described as relatively stable (**S20 p. 5; Figures 2–5 p. 6**).

The Tukey table is particularly important because it limits the broad abstract/conclusion wording:

| Comparison, as printed | Mean difference | Adjusted p | Rejected equality? | Scope |
|---|---:|---:|---|---|
| Naive OpenAI → Naive + sentiment OpenAI | **0.0287** | **0.9992** | No | Same LLM and retrieval family, adding sentiment. |
| Multi-query OpenAI → Multi-query + sentiment OpenAI | **−0.0304** | **0.9987** | No | Same LLM and retrieval family, adding sentiment. |
| Multi-query OpenAI → Multi-query + sentiment Mistral | **−0.1103** | **0.0333** | Yes | **Changes LLM and sentiment condition**, so cannot isolate sentiment's causal contribution. |
| HyDE OpenAI → HyDE + sentiment OpenAI | **0.0081** | **1.0000** | No | Same LLM and retrieval family, adding sentiment. |
| HyDE + sentiment OpenAI → Multi-query + sentiment Mistral | **−0.1085** | **0.0394** | Yes | **Changes LLM and retrieval family**. |

Source: **S20 p. 5, Table 1**, visually checked against the original; the accompanying explanation on **p. 6** ties the statistical comparison to **Answer Relevancy on the 106-pair full evaluation**. The authors describe Mistral multi-query plus sentiment as better, but the reported signed mean differences are negative. Without the underlying scores, explicit difference convention, and fuller statistical output, **do not convert these rows into a confidently quantified superiority claim**. A significant difference alone does not settle the direction or cause of improvement. In particular, the three reported same-OpenAI sentiment additions are **not significant**.

Token/latency observations come from **five QA pairs**, with no reproducible service-level percentile or representative production load. The paper says the multi-query/Mistral approach carries a latency tradeoff. Historical context-window figures refer to the tested model labels at the time; `mistral-large-latest` is a moving alias and cannot identify a fixed, reproducible model in 2026. See **S20 pp. 7–8**.

### Limits and implications

The data consists of English counseling questions and answers, not a representative cohort of live users in crisis. Record-level random holdout from public QA can retain near-duplicates or multiple answers to similar questions unless explicitly controlled; the paper does not establish a leakage audit. Ragas correctness/faithfulness depends on the knowledge base, reference answers, judges, and prompts, so grounding in unsafe content can still score well on faithfulness.

Use a **plain retrieval baseline first**, then test sentiment reranking and advanced query transformations separately on the same model, corpus, budget, and held-out population. Positive-first ranking should be an optional experiment, with clinician review of any inappropriate reassurance or mismatched advice. Multi-query and HyDE should be justified by measured retrieval/safety improvements; neither is a prerequisite for Lumen's first working version.

The unsupported inferences are “sentiment reranking generally improves safety,” “Mistral is clinically better,” “Ragas Answer Relevancy proves crisis detection,” and “this paper establishes a deployable suicide-prevention service.” None follows from the reported design.

## 5. S22 — efficacy meta-analysis

### Design and included evidence

This review includes **39 randomized controlled trials** of turn-taking, text-based chatbot interventions compared with any control condition, with depressive and/or anxiety outcomes measured by validated scales. The search covered **January 2017 to October 2025** across PubMed/MEDLINE, Embase, PsycINFO, Scopus, and Web of Science; the update was run on **13 October 2025**. Screening/selection and bias assessment used independent reviewers. It applied RoB 2, prioritized intention-to-treat data where available, and pooled **post-intervention between-group standardized mean differences using Hedges' g**, random effects, REML, and Hartung–Knapp–Sidik–Jonkman confidence intervals. See **S22 pp. 1–2 and 8–9**.

The review spans multiple interventions, purposes, durations, populations, and countries. It classifies **31 retrieval-based and 8 generative chatbot studies**; the mixed retrieval/generative study is included within the generative group, so it is **not a 40th trial**. Here, “retrieval-based” is the review's response-generation category, not proof that all 31 employed modern vector RAG. The trial tables include English-language publications about interventions in several countries; restricting publication language to English does **not** mean all participants or bots used English. No India site is listed in its study-characteristics table. See **S22 pp. 3–6**.

### Results and denominators

| Outcome | Included trials / participants | Effect and uncertainty | Interpretation |
|---|---|---|---|
| Depression | **38 RCTs, N = 7,401** | **g = 0.31, 95% CI 0.17–0.46**, **I² = 85.34%** | Small pooled symptom advantage, with high between-study heterogeneity. |
| Anxiety | **34 RCTs, N = 7,621** | **g = 0.28, 95% CI 0.05–0.51**, **I² = 94.32%** | Small pooled symptom advantage, with very high heterogeneity and a wide interval. |
| Depression, clinical subgroup | Clinical studies within the depression analysis; subgroup-specific participant totals are not supplied in the main narrative | **g = 0.64, 95% CI 0.20–1.09** | Observational between-study subgroup comparison; not a personalized treatment rule. |
| Depression, subclinical subgroup | Subclinical studies within the depression analysis | **g = 0.34, 95% CI 0.13–0.55** | Same caution. |
| Depression, nonclinical subgroup | Nonclinical studies within the depression analysis | **g = 0.07, 95% CI −0.01–0.15** | The interval crosses zero; this subgroup's benefit was not established. |

Sources: **S22 p. 5** for primary outcomes and heterogeneity; **p. 6** for subgroup estimates, with subgroup-difference **p = 0.001**. **Hedges' g is an effect size in standardized units, not percent recovery, accuracy, or reduction in suicides.** Depression and anxiety totals overlap; they must not be added to claim unique participants.

The authors report possible publication bias for depressive outcomes (Egger **p = 0.002**, modified test **p = 0.007**), cautioning that high heterogeneity affects such tests. **35 of 39 trials** were rated high overall risk of bias, often involving unblinded participants and self-reported outcomes (**S22 p. 5**). The paper finds no statistically significant difference between generative and retrieval-based chatbot categories; it also states that the generative subgroup's pooled result did not reach significance. This does not establish equivalence, absence of benefit, or superiority of one architecture. Power and heterogeneity remain limiting (**S22 p. 8**).

### Efficacy is not a safety finding

**23 of 39 trials did not report systematic safety monitoring or adverse-event data**. The review highlights examples of safety protocols and states that safety reporting remains underdeveloped. In the Therabot trial, it cites **15 staff interventions for safety concerns** and **13 interventions to correct inappropriate chatbot responses**. These are intervention instances, not 28 unique harmed participants, and they are not pooled rates across the 39 trials. See **S22 p. 8**.

The meta-analysis did not pool suicide-attempt/death prevention, crisis detection sensitivity, escalation precision, unsafe response frequency, dependence, privacy incidents, or resource accuracy. It cannot establish that a chatbot reduces suicides or safely replaces clinical care. Its discussion of absent real-time verification is a concern/motivation, **not a coded feature audit proving every included system lacks runtime verification**.

The clinical-status subgroup findings are subject to confounding and regression-to-the-mean interpretations; the authors explicitly caution against causal interpretation (**S22 p. 8**). Intervention durations in the tables run from immediate assessments to extended programs; pooled post-treatment effects do not show durable benefit for Lumen. The search stops in October 2025, so the paper also cannot certify the complete product/research landscape on 8 October 2026.

### Implications for Lumen's evaluation and positioning

Initially position Lumen as a **support and safety-routing prototype**, with efficacy a separate research hypothesis. Evaluate software safety before asking whether symptom scores improve. A later consented, supervised study should pre-register comparator, population, primary outcome, follow-up, adverse-event definitions, stop rules, and a response protocol. Use validated outcome instruments appropriate to the intended language/population, with clinical review of interpretation.

For differentiation, measure what this review largely cannot answer: consistent multilingual safety routing across chat and journal inputs, informed consent for longitudinal information, verified local help resources, and auditable behavior when uncertainty or model/service failure occurs. These remain **proposed contributions to test**. The review does not establish that this combined product is globally unique or commercially desired.

## 6. Dataset and model adoption readiness

These are readiness decisions for planning, **not downloads or licenses acquired for Lumen**. All online status/license observations were checked on **8 October 2026**. Source cards may change; pin both data revision and license text at adoption. “Publicly available” and “anonymized” are not interchangeable with unrestricted commercial rights or safe deployment.

| Resource | Appropriate initial role | Current license / access evidence | Privacy / validity readiness | Planning decision |
|---|---|---|---|---|
| **GoEmotions** | English emotion baseline, not crisis ground truth | Google Research dataset card declares **Apache-2.0**; repository houses the data/code. [Dataset card](https://huggingface.co/datasets/google-research-datasets/go_emotions). | Raw metadata includes Reddit usernames and linkage IDs; masked text is not full de-identification. No clinical crisis labels; culture/domain/short-text limits. | **Conditional research candidate.** Prefer the minimum fields needed, remove linkable metadata from working/public outputs, and keep separate from clinical data. |
| **EmpatheticDialogues** | English empathy/style experiments; potentially useful noncommercial benchmark | Author repository LICENSE is **CC BY-NC 4.0**, permitting reuse/adaptation for noncommercial purposes under its conditions. [Actual license](https://raw.githubusercontent.com/facebookresearch/EmpatheticDialogues/main/LICENSE), [authors' repository](https://github.com/facebookresearch/EmpatheticDialogues). | Emotion-grounded crowdworker conversations are not therapist-validated crisis intervention ground truth. Its academic purpose does not establish commercial readiness. | **Research-only candidate under the existing terms; commercial use is not cleared.** Do not fold it into a future commercial corpus as if permissive. |
| **nbertagnolli/counsel-chat** | English public counseling QA analysis and qualitative baselines | Repository carries an **MIT license**. [License](https://raw.githubusercontent.com/nbertagnolli/counsel-chat/master/LICENSE), [repository provenance](https://github.com/nbertagnolli/counsel-chat). This establishes the repository's declared license, not automatically all underlying website/user-content rights. | Scraped help-seeking posts and therapist responses contain sensitive narratives. Consent, provenance, third-party rights, de-identification, duplication, and quality require review. Not an emergency care benchmark. | **Hold production ingestion pending provenance/privacy review.** Name it correctly; “Counsel Thoughts” in S18 is not a separately verified dataset. |
| **Amod/mental_health_counseling_conversations** | Replication of S20 and restricted English counseling QA research | Current card is **gated**, marked **RAIL-D**, and says noncommercial research is royalty-free; commercial use requires a donation of **at least USD 100** plus proof emailed within the specified 30-day window. It forbids alteration of individual QA pairs and allows redistribution only unchanged with the license. The full license file could not be read without resolving access. [Current card and stated terms](https://huggingface.co/datasets/Amod/mental_health_counseling_conversations). | Card claims anonymization, but corpus was not inspected/downloaded here. Sensitive public-platform text, unknown original consent/rights, and no crisis labels. Translation would rewrite entries and conflicts with the current card's restrictions unless separately permitted. | **Hold.** Do not auto-download, accept terms, donate, email, translate, or place in a commercial training/RAG corpus on the basis of S20's older “public” description. |
| **samhog/psychology-10k** | At most a source to inspect after permissions are established | No clear license or substantive provenance documentation was visible in the dataset page/file listing checked. [Dataset page](https://huggingface.co/datasets/samhog/psychology-10k), [file listing](https://huggingface.co/datasets/samhog/psychology-10k/tree/main). | Visible examples instruct a model to answer as a licensed psychologist and contain treatment-like responses. Generation provenance, consent, clinical review, and dataset-level quality are not established. | **Hold / exclude from production by default.** Do not train a false professional identity or treat reference responses as authoritative care. |
| **ShenLab/MentalChat16K** | English support-response experiment with explicit synthetic/derived provenance | Author-maintained card declares **MIT** and English. It describes **9,775 synthetic conversations** plus **6,338 QA pairs derived from 378 interview transcripts**; the viewer reports **16,084 current rows**, which does not reconcile directly with those component totals. [Dataset card](https://huggingface.co/datasets/ShenLab/MentalChat16K), [underlying benchmark paper](https://arxiv.org/abs/2503.13509). | Paraphrased clinical-derived material remains sensitive; general synthetic content is not clinically labeled crisis truth. The card's statement that it is “entirely synthetic” conflicts with its interview-derived section. Domain includes caregivers in palliative/hospice contexts. | **Conditional research candidate after record/revision audit.** Preserve source type, original-trial ethical documentation, exclusion rationale, and author license. Never count generated/derived QA pairs as independent participants. |
| **NIMH / MedlinePlus / CDC / SAMHSA-related materials** | Versioned, clinically reviewed reference information and links | NIMH text is generally reusable unless otherwise indicated; images are excluded. MedlinePlus mixes public-domain and copyrighted content; selected sections need individual checks. [NIMH policy](https://www.nimh.nih.gov/index.php/site-info/policies), [MedlinePlus content-use policy](https://medlineplus.gov/about/using/usingcontent/). CDC/SAMHSA item-specific rights were not comprehensively verified in this review. | US resource accuracy does not establish local India suitability. Review date, audience, scope, and local help details matter. These pages are not clinical trajectory/crisis labels. | **Preferred kind of source for a small reference corpus**, after per-item rights and clinical/localization review. Link to current sources and preserve attribution/provenance. |
| **TinyLlama-1.1B-Chat-v1.0 / TheBloke GGUF** | Small English generation baseline for reproducibility experiments | Both original and cited quantized model cards declare **Apache-2.0**. [Original model](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0), [quantized model](https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF). | No target-language crisis validation follows from model license/size. Quantization and prompts can change behavior; document exact weights/revision/quantization/runtime. | **Baseline candidate, not an endorsed production therapist or safety authority.** Compare against a stronger allowed baseline only if the experiment needs it. |

The MentalChat16K component counts above describe the live author card, not reconciled ingested data. Its underlying paper is **arXiv:2503.13509, first submitted 13 March 2025**, so S18 reference [13]'s “2024” should not be used as the verified publication year of that benchmark paper. No attempt was made to acquire underlying clinical transcripts or identify their participants.

## 7. Corrections to the supplied gap analyses

Inputs: [S13 original](../../Lumen%20_%20Research%20papers/Gap%20Analysis%20Major%20Project.docx), [S14 original](../../Lumen%20_%20Research%20papers/Gap_Analysis.docx). These are student synthesis documents, not independent research evidence. The following corrections concern this review's four papers; other sections require their respective paper reviews.

| Supplied claim or wording | Correction to retain in Lumen's plan | Evidence |
|---|---|---|
| S13: only three trials explicitly addressed safety; Therabot “only logged staff interventions retrospectively” | The review gives three **examples**, not a proof that exactly three trials had any safety procedure. It states **23/39 did not report systematic safety/adverse-event data**. It does not establish that Therabot's staff intervention happened only retrospectively. | S22 p. 8. |
| S13: “no reviewed chatbot” has real-time verification | Rephrase as **runtime safety verification is a concern that this review does not systematically audit**. Do not assert universal absence from an introduction statement or missing reports. | S22 pp. 2, 8–9; extracted study fields do not include a runtime-verification audit. |
| S13: none of 39 trials links escalation to a national referral network | This is **not established by S22**. The review does not code country-specific referral integration. Verify each product/trial before making a market-wide absence claim. | S22 pp. 3–5 and 8–9. |
| S13: none tracks within-person/session mood trajectories; journaling is separate in all systems | These are **unverified architecture claims**; symptom-assessment checkpoints in an efficacy review do not show that a product lacked session tracking or a shared journal safety pipeline. | S22 Table 1 / Methods; S18 pp. 6–7 already proposes longitudinal summaries, although on synthetic data. |
| S13: none addresses Hindi/Marathi/code-mixed input | S22 lists no India site and calls for linguistic diversity, but it does not comprehensively audit language support. Claim **no direct Hindi/Marathi crisis validation was established by the reviewed evidence**, not universal product absence. | S22 pp. 3–5, 8; S15 pp. 3–4, 9. |
| S13: current systems apply identical logic regardless of risk because nonclinical benefit is small | The review identifies subgroup differences and advocates personalization. It does **not** audit identical runtime logic across every product, and between-study subgroup differences cannot yield individual risk-routing rules. | S22 pp. 6–8. |
| S13: generative/retrieval nonsignificance leaves “safety/efficacy tradeoff” unresolved | Correct for **efficacy comparison** and statistical power. Safety is a separate underreported outcome and was not quantitatively compared in that subgroup analysis. | S22 p. 8. |
| S13: SentimentCareBot improvements are “sentiment-analysis performance” | The measured quantities are **Ragas response/retrieval metrics**, principally Answer Relevancy for the reported ANOVA/Tukey comparison, not sentiment classification accuracy. Same-OpenAI sentiment ablations in Table 1 are nonsignificant; significant rows change additional factors. | S20 pp. 5–6, Table 1. |
| S13: sentiment-aware RAG can be extended into an overall crisis risk score | This is a **design hypothesis**, not evidence that sentiment belongs in a valid crisis-score formula. Define target, features, uncertainty, false-alarm costs, and evaluation before aggregating scores. | S20 p. 4 positive-first ranking; S15 p. 8 emotion labels; neither supplies clinical crisis labels. |
| S13: Mentalic Net demonstrates pretrained-model fine-tuning | State the reported fine-tuning claim plus **reproduction ambiguity**: detailed text describes retrieval/configuration tuning without a full weight-update protocol, although loss values are reported. | S18 pp. 4–6. |
| S13: Mentalic Net lacks longitudinal work | It does propose therapist mood/log visualizations; what is missing is **validated longitudinal detection and clinical workflow evidence**, not the idea of a longitudinal chart. | S18 pp. 6–7, synthetic demonstration. |
| S14: GoEmotions section is headed “Development and Evaluation of HopeBot” | Correct the heading to **GoEmotions: A Dataset of Fine-Grained Emotions**. It is a different paper and evidence type. | S15 p. 1; S14 section heading. |
| S14: GoEmotions F1 “across the 27-emotion taxonomy” | Clarify **28 labels including Neutral**, with **macro**, not micro/accuracy. Keep rare-label performance and class imbalance visible. | S15 p. 8, Table 4. |
| S14: ~4K examples without agreement are a gap | Fair approximation, but describe them as **emotion-annotation ambiguity**, not unlabeled crisis uncertainty; filtered and raw annotation releases have different uses. | S15 pp. 6–7. |
| Gap analyses use words like “genuine gap,” “novel contribution,” or suggest current competitors do not offer the combined idea | Treat these as **candidate hypotheses for a current competitive and literature search**. These four papers cannot prove global nonexistence or market willingness to buy. | Scope of S15/S18/S20/S22; S22 search cutoff October 2025; S18 proposed longitudinal workflow. |

## 8. Research decisions to carry into the phased plan

1. **Start with a deterministic, reviewable safety-routing baseline and a small allowed reference corpus.** Its transparency is useful, but rules are not assumed clinically superior. Evaluate sensitivity, false alarms, uncertainty, and response suitability against explicitly adjudicated target-language scenarios.
2. **Separate content quality from safety.** Track retrieval relevance, source faithfulness, factual support, and helpfulness, while separately checking crisis acknowledgment, inappropriate reassurance, forbidden advice, resource accuracy, and escalation correctness. BERTScore/Ragas belong in the first group as supplementary metrics.
3. **Keep a source registry before ingestion.** Each item needs URL/owner, revision/date, language, permitted use, clinical scope/reviewer, processing history, and reasons to include/exclude. Do not combine every public counseling dataset merely to enlarge the corpus.
4. **Treat multilingual capability as its own milestone.** Hindi, Marathi, English, and Roman-script code mixing require authored and independently reviewed examples, context/negation/quoted speech coverage, and language-specific results. A translated English benchmark alone is insufficient.
5. **Treat longitudinal safety as an ablation.** Compare current-message routing with consented history-assisted routing on matched scenarios. Test whether history helps detect deterioration and whether stale/incorrect history creates false alarms. Mood visualization is a user feature; inferred crisis prognosis is a separate, harder claim.
6. **Make RAG complexity earn its place.** Benchmark straightforward retrieval before sentiment reranking, HyDE, multi-query, or domain fine-tuning. Fix the same model, budget, corpus, split, and scoring protocol when changing one component.
7. **Plan efficacy studies only after operational safety and supervision are ready.** Report small pooled effects honestly, pre-register outcomes/comparators, monitor adverse events, and retain follow-up. The supplied meta-analysis does not remove the need for Lumen's own evidence.

The defensible opportunity is a **well-tested integration with demonstrated local-language and workflow value**, not a claim that RAG, empathy labels, mood trends, or therapist summaries are new. A unique combination may still be useful; its advantage must be measured and its current competitive novelty separately verified.

## 9. Verification limits

- Full supplied texts were read; original graphical tables/figures for S20 pp. 5–6 and S18 p. 6 were additionally inspected. S20's duplicate text layers were not counted as additional experiments.
- Bibliographic metadata was checked against ACL/arXiv/publisher records and publisher-deposited Crossref metadata. IEEE's interactive record exposed an access check, so S18's final proceedings full text was not reviewed; conclusions above apply to the supplied preprint version.
- Licensing observations describe current author/repository cards and the actual EmpatheticDialogues/Counsel-Chat license files. They do not certify upstream rights, consent, clinical appropriateness, or deployment permission. Amod's gated full license and all underlying dataset contents were not acquired.
- No dataset or model was downloaded, no license conditions were accepted, no payment/email/outreach occurred, and no implementation code was created in this review.
