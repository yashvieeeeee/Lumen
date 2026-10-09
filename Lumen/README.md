# Lumen

**A thoughtful space to write, reflect and revisit your words, with privacy choices in your hands.**

Research and planning baseline: **8 October 2026**. This directory is the project root. Landing, accounts/storage, shared draft screening, journal editing, optional mood history and a public support directory are implemented. The [task audit](docs/PLAN_AUDIT.md) records tested features and remaining work.

Start with the [implementation plan](IMPLEMENTATION_PLAN.md), then the [project brief](docs/PROJECT_BRIEF.md), [architecture](docs/ARCHITECTURE.md), and [evaluation plan](docs/EVALUATION_PLAN.md).

## Run the local application

Open [the landing page](http://localhost:3180), [your workspace](http://localhost:3180/workspace), [sign in](http://localhost:3180/workspace?mode=signin), or [find support](http://localhost:3180/support). Accounts, journal/chat submissions, checks, saved journal edits, optional mood ratings,14-day history, export and deletion work. Saving defaults off. AI integration is deferred for the next step; the [clinical/language review packet](docs/review/REVIEW_PACKET.md) is ready to assign.

Follow [local setup and checks](docs/LOCAL_DEVELOPMENT.md). From this directory, after installing the documented runtimes:

```powershell
pwsh -NoProfile -File scripts/setup-local.ps1
Set-Location apps/web
npm ci
npm run build
Set-Location ../..
pwsh -NoProfile -File scripts/start-local.ps1
```

Development dependencies are locked with npm and uv. The local cluster is separate from the machine's existing PostgreSQL service. Secrets, database files and browser artifacts are ignored and protected by Windows file permissions. See [implementation status](docs/IMPLEMENTATION_STATUS.md) for tested behavior and unresolved release gates.

## Run the offline research baseline

Requires Python 3.11 or newer. Runtime code and tests use the standard library; no package install, model download, account or API key is needed. Tested locally with Python 3.11.7 on Windows.

From this Lumen directory in PowerShell:

```powershell
python -m unittest evaluation.test_baseline -v
python -m evaluation.run_baseline
```

The evaluator creates a new folder under `artifacts/runs` containing `summary.json` and `decisions.csv`. For a chosen **new** directory, run `python -m evaluation.run_baseline --output artifacts/runs/my-run`. It never overwrites an existing run. Exit code 0 means the engineering run completed, 2 means input/configuration/output rejection, and 3 means the report includes unavailable screening attempts; none is a clinical release decision.

The current dataset has **40 synthetic development families / 200 draft language variants**. Rules and reference actions are unreviewed. Reports show attempted cases, uncertainty/failures, action agreement, concern/urgent confusion counts, language/source/category breakdowns, hashes and **rule-only** latency. They do not measure generated responses, temporal memory, real users or clinical safety. A “Low” rule result is not assurance of safety.

See [implementation status](docs/IMPLEMENTATION_STATUS.md), [annotation handbook](docs/ANNOTATION_HANDBOOK.md) and [dataset registry](Datasets/registry.json). Clinical/bilingual review and the final untouched test set are still pending. Do not submit personal conversations to this development runner.

Optional developer coverage check, if Coverage.py is already installed:

```powershell
python -m coverage run --branch --source=evaluation.baseline,evaluation.run_baseline -m unittest evaluation.test_baseline
python -m coverage report -m
```

The supplied materials contain 24 files: 16 distinct research papers, one DOCX copy of a paper, two gap analyses, and five academic documentation files. All were indexed and reviewed; the PDFs total 310 pages, including the nine-page proposal. See [source coverage](docs/research/SOURCE_COVERAGE.md) for the reading record and original-file links.

## Research

- [Research synthesis and corrections](docs/research/RESEARCH_SYNTHESIS.md)
- [Current competitors, novelty, and market strategy](docs/research/MARKET_AND_NOVELTY.md)
- [Crisis detection and conversational safety papers](docs/research/safety-paper-review.md)
- [Clinical prediction, Hinglish detection, HopeBot, and Woebot papers](docs/research/clinical-paper-review.md)
- [RAG, datasets, and efficacy papers](docs/research/rag-datasets-and-efficacy.md)
- [Decisions, assumptions, and unresolved risks](docs/DECISIONS_AND_RISKS.md)

## Directory

```text
Lumen/
  README.md
  IMPLEMENTATION_PLAN.md
  apps/web/                        # Next.js application and browser journeys
  services/api/                    # FastAPI, authentication, PostgreSQL models/migrations/tests
  scripts/                         # Local setup, startup and reproducible checks
  evaluation/                      # Runnable rule baseline, evaluator and tests
  policies/                        # Versioned, unreviewed development rules
  docs/
    PROJECT_BRIEF.md
    ARCHITECTURE.md
    EVALUATION_PLAN.md
    DECISIONS_AND_RISKS.md
    PLAN_AUDIT.md                   # Current task and requirement cross-check
    IMPLEMENTATION_STATUS.md        # Dated behavior/check evidence
    research/                      # Reviews, evidence, source manifest
  Documentation/major project/     # Supplied academic documents, preserved
  Lumen _ Research papers/          # Supplied papers and gap analyses, preserved
  Datasets/                        # Registry and synthetic development fixtures
  artifacts/runs/                  # Local reproducibility reports, Git-ignored
```

`apps/web` contains the landing page and `/workspace`; `services/api` contains the account/storage foundation and Phase3 runtime adapter. Both the API and offline evaluator reuse `evaluation/baseline.py` and the versioned policy. The original documentation stays in place; there is no nested second Lumen project. Models, generation, memory and reviewer operations remain future work.

## Working agreement

Every future phase ends with a reproducible result and an explicit exit gate. Keep paper claims, simulated benchmarks, prototype behavior, pilot observations, and clinical outcomes separate. Treat research scores as measurements of the reported experiments, never as guarantees of real-world crisis detection.

The market research does **not** establish that the proposed feature combination is unique. Existing products overlap considerably. The proposed contribution is evidence-backed improvement on a narrow multilingual, temporal safety task and a usable, privacy-respecting support workflow. Clinical review, licensed data, and user research are prerequisites for validating that contribution.

Do not commit personal conversations, participant data, extracted academic contact details, proprietary datasets, model credentials, or copyrighted source documents to a public repository. The `.gitignore` establishes a conservative starting boundary; inspect staged files before any future publication.
