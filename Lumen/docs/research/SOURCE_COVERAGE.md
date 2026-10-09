# Source coverage and reading record

Completed research baseline: **8 October 2026**. The existing Lumen folder is the project root. The original documents and filenames were preserved.

## Inventory

- **24 supplied files reviewed:** five academic documentation files, two gap-analysis DOCX files, 16 distinct research-paper PDFs, and one DOCX copy of S07.
- **17 PDFs / 310 pages:** 301 research-paper pages plus the nine-page proposal. Both presentation decks contain 21 slides each.
- **Five DOCX files:** body text and tables extracted; page totals are not invented from Word layout.
- **No dataset supplied:** the Datasets directory was empty at initial inspection. Its new README records future acquisition requirements.

Each original has a SHA-256, byte count, extraction path and per-page/slide extraction information in [the source manifest](source-manifest.json). Extracted text is a reading aid, not a replacement for original page layout or proof of correctness by itself.

## File-by-file coverage

“Complete local review” means the supplied document was read through its substantive text, methods, results, discussion and included appendices/references where present. Paper reviews identify relevant local page/table evidence and limitations. No externally referenced appendix is assumed available simply because the local paper mentions it.

| ID | Original supplied file | Extent | Reading focus | Review record |
| --- | --- | --- | --- | --- |
| S01 | [Copy of Sem VII Project Log Book Format 2026.docx](../../Documentation/major%20project/Copy%20of%20Sem%20VII%20Project%20Log%20Book%20Format%202026.docx) | DOCX body + tables | Academic logbook and deliverable requirements | [Complete local review](../PROJECT_BRIEF.md) |
| S02 | [Major_Project_Proposal_Format-2026.docx](../../Documentation/major%20project/Major_Project_Proposal_Format-2026.docx) | DOCX body + tables | Original scope, proposed modules, constraints and references | [Complete local review](../PROJECT_BRIEF.md) |
| S03 | [Mid sem ppt_template.pptx](../../Documentation/major%20project/Mid%20sem%20ppt_template.pptx) | 21 slides | Mid-semester architecture, safety claims, gap statements and historic timeline | [Complete local review](../PROJECT_BRIEF.md) |
| S04 | [Project Proposal Presentation Template July 2026.pptx](../../Documentation/major%20project/Project%20Proposal%20Presentation%20Template%20July%202026.pptx) | 21 slides | July proposal, early scope and implementation assumptions | [Complete local review](../PROJECT_BRIEF.md) |
| S05 | [proposal_LaTeX.pdf](../../Documentation/major%20project/proposal_LaTeX.pdf) | 9 pages | Nine-page proposal; compared with the DOCX and decks | [Complete local review](../PROJECT_BRIEF.md) |
| S06 | [2025.findings-emnlp.998.docx](../../Lumen%20_%20Research%20papers/2025.findings-emnlp.998.docx) | DOCX body + tables | DOCX version of S07; counted once as a research work | [Complete local review](safety-paper-review.md) |
| S07 | [2025.findings-emnlp.998.pdf](../../Lumen%20_%20Research%20papers/2025.findings-emnlp.998.pdf) | 22 pages | Implicit suicidal ideation and DeepSuiMind response benchmark | [Complete local review](safety-paper-review.md) |
| S08 | [Between Help and Harm_ An Evaluation Study of Mental Health Crisis Handling by Large Language Models.pdf](../../Lumen%20_%20Research%20papers/Between%20Help%20and%20Harm_%20An%20Evaluation%20Study%20of%20Mental%20Health%20Crisis%20Handling%20by%20Large%20Language%20Models.pdf) | 21 pages | Between Help and Harm; crisis detection and response audit | [Complete local review](safety-paper-review.md) |
| S09 | [Building Trust in Mental Health Chatbots_ Safety Metrics and LLM-Based Evaluation Tools.pdf](../../Lumen%20_%20Research%20papers/Building%20Trust%20in%20Mental%20Health%20Chatbots_%20Safety%20Metrics%20and%20LLM-Based%20Evaluation%20Tools.pdf) | 33 pages | Building Trust; clinician-guided evaluator and reporting issues | [Complete local review](safety-paper-review.md) |
| S10 | [Deep Learning Based Approach For Detecting Suicidal Ideation.pdf](../../Lumen%20_%20Research%20papers/Deep%20Learning%20Based%20Approach%20For%20Detecting%20Suicidal%20Ideation.pdf) | 6 pages | Hinglish suicidal-ideation classification and data limitations | [Complete local review](clinical-paper-review.md) |
| S11 | [Development and Evaluation of HopeBot.pdf](../../Lumen%20_%20Research%20papers/Development%20and%20Evaluation%20of%20HopeBot.pdf) | 43 pages | HopeBot; bilingual screening feasibility and publication status | [Complete local review](clinical-paper-review.md) |
| S12 | [Domain-Specific Constitutional AI.pdf](../../Lumen%20_%20Research%20papers/Domain-Specific%20Constitutional%20AI.pdf) | 5 pages | Domain-specific constitutional alignment; relative versus absolute safety | [Complete local review](safety-paper-review.md) |
| S13 | [Gap Analysis Major Project.docx](../../Lumen%20_%20Research%20papers/Gap%20Analysis%20Major%20Project.docx) | DOCX body + tables | Major-project gap analysis; original claims tested against prior art | [Complete local review](RESEARCH_SYNTHESIS.md) |
| S14 | [Gap_Analysis.docx](../../Lumen%20_%20Research%20papers/Gap_Analysis.docx) | DOCX body + tables | Second gap analysis; linguistic and validation gaps assessed | [Complete local review](RESEARCH_SYNTHESIS.md) |
| S15 | [GoEmotions dataset of fine grained emotions.pdf](../../Lumen%20_%20Research%20papers/GoEmotions%20dataset%20of%20fine%20grained%20emotions.pdf) | 15 pages | GoEmotions; emotion labels, benchmark limits and dataset provenance | [Complete local review](rag-datasets-and-efficacy.md) |
| S16 | [Large Language Mod for Suicide Detection, Prevention, and Risk Assessment.pdf](../../Lumen%20_%20Research%20papers/Large%20Language%20Mod%20for%20Suicide%20Detection%2C%20Prevention%2C%20and%20Risk%20Assessment.pdf) | 13 pages | LLM suicide detection/prevention review; original experiment denominators | [Complete local review](clinical-paper-review.md) |
| S17 | [Machine learning and the prediction of suicide in psychiatric populations.pdf](../../Lumen%20_%20Research%20papers/Machine%20learning%20and%20the%20prediction%20of%20suicide%20in%20psychiatric%20populations.pdf) | 22 pages | Clinical prediction review; temporal/journal prior art and train/test corrections | [Complete local review](clinical-paper-review.md) |
| S18 | [Mentalic Net_ Development of RAG-based Conversational AI and Evaluation Framework for Mental Health Support.pdf](../../Lumen%20_%20Research%20papers/Mentalic%20Net_%20Development%20of%20RAG-based%20Conversational%20AI%20and%20Evaluation%20Framework%20for%20Mental%20Health%20Support.pdf) | 8 pages | Mentalic Net; RAG, proposed temporal views and metric interpretation | [Complete local review](rag-datasets-and-efficacy.md) |
| S19 | [Role of machine learning algorithms in suicide risk prediction.pdf](../../Lumen%20_%20Research%20papers/Role%20of%20machine%20learning%20algorithms%20in%20suicide%20risk%20prediction.pdf) | 29 pages | Clinical ML meta-analysis; heterogeneity, PPV and review scope | [Complete local review](clinical-paper-review.md) |
| S20 | [SentimentCareBot_ Retrieval-Augmented Generation Chatbot for Mental Health Support with Sentiment Analysis.pdf](../../Lumen%20_%20Research%20papers/SentimentCareBot_%20Retrieval-Augmented%20Generation%20Chatbot%20for%20Mental%20Health%20Support%20with%20Sentiment%20Analysis.pdf) | 8 pages | SentimentCareBot; confounded comparisons and statistical inconsistencies | [Complete local review](rag-datasets-and-efficacy.md) |
| S21 | [Suicide- and Crisis-Risk Detection Using Large Language Models in Mental-Health Chatbots .pdf](../../Lumen%20_%20Research%20papers/Suicide-%20and%20Crisis-Risk%20Detection%20Using%20Large%20Language%20Models%20in%20Mental-Health%20Chatbots%20.pdf) | 35 pages | Uncertainty-aware screening; selected cohort and false-alert trade-offs | [Complete local review](safety-paper-review.md) |
| S22 | [Systematic review and meta analysis of chatbots in themanagement of depressive and anxiety symptoms.pdf](../../Lumen%20_%20Research%20papers/Systematic%20review%20and%20meta%20analysis%20of%20chatbots%20in%20themanagement%20of%20depressive%20and%20anxiety%20symptoms.pdf) | 12 pages | Chatbot efficacy meta-analysis; symptom effects, bias and safety reporting | [Complete local review](rag-datasets-and-efficacy.md) |
| S23 | [The Slow Drift of Support.pdf](../../Lumen%20_%20Research%20papers/The%20Slow%20Drift%20of%20Support.pdf) | 18 pages | Slow Drift; repeated interaction and support-boundary failures | [Complete local review](safety-paper-review.md) |
| S24 | [woebot-conversional AI for anxiety and depresssion_.pdf](../../Lumen%20_%20Research%20papers/woebot-conversional%20AI%20for%20anxiety%20and%20depresssion_.pdf) | 11 pages | Woebot historical RCT; mood tailoring, outcomes and current-status distinction | [Complete local review](clinical-paper-review.md) |

## How the reading was checked

The proposal, logbook, both decks and both gap analyses were compared to establish requirements, reconcile changing architecture, and distinguish academic deliverables from a working application. Embedded presentation diagrams/screenshots were inspected. The historic “Done” timeline and illustrative model responses were not accepted as build or benchmark evidence.

The 16 paper PDFs were reviewed in three substantive groups: six safety/implicit-risk papers, six clinical/Hinglish/screening papers, and four RAG/emotion/efficacy papers. Included methods, tables, limitations and appendices informed the detailed reviews. Figures/tables requiring layout interpretation were checked where available; textual extraction does not license claims about unreadable layout. The duplicate S06 does not inflate the paper count.

Primary publisher/author records were checked when needed to resolve year, title, publication status, cohort or training/test discrepancies. Accessible supplemental references from the proposal were checked separately and are scoped in [the synthesis](RESEARCH_SYNTHESIS.md); they are not counted as additional complete supplied-paper reads. The reviews flag unavailable supplements, final-version comparisons, code or licenses instead of treating them as verified.

Current primary product, status, government and technical sources were researched for [market and novelty](MARKET_AND_NOVELTY.md). Vendor disclosures remain vendor claims; no logged-in competitor account, clinical trial, model benchmark or market interview was conducted by this planning pass.

## Resulting artifacts

- [Project interpretation and requirements](../PROJECT_BRIEF.md)
- [Research synthesis and corrections](RESEARCH_SYNTHESIS.md)
- [Current market and defensible contribution](MARKET_AND_NOVELTY.md)
- [Safety paper review](safety-paper-review.md)
- [Clinical paper review](clinical-paper-review.md)
- [RAG, dataset and efficacy review](rag-datasets-and-efficacy.md)
- [Architecture and failure contract](../ARCHITECTURE.md)
- [Evaluation protocol and proposed gates](../EVALUATION_PLAN.md)
- [Phase-by-phase implementation plan](../../IMPLEMENTATION_PLAN.md)

## Remaining research boundaries

No worldwide uniqueness, patent clearance, clinical safety, commercial dataset permission, paid demand or partner coverage has been established. Those require the specific evaluation, permissions and discovery tasks in the plan. The supplied sources support a serious research prototype; they do not themselves prove a deployable medical or crisis service.

## Artifact integrity check

Checked on 8 October 2026: all 24 originals still match their recorded byte sizes and SHA-256 hashes; the source folders match the 24-file inventory; all extracts are present; all 310 PDF pages have substantive extracted text; all 24 source IDs appear in this coverage record; all 16 distinct papers appear in the detailed reviews; the implementation plan contains Phases 0–11; and 161 local links across the 13 principal Markdown documents resolve with zero missing targets. Required documents were also checked for balanced fenced blocks and leaked internal web-reference tokens.

These checks establish artifact completeness and preservation. They do not establish that every source assertion is correct or that Lumen's proposed application works. Independent subject review identified and corrected stale-generation/withdrawal races, boundary-drift coverage and development-versus-final-test leakage in the proposed protocol.
