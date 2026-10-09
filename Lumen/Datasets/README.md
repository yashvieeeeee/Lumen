# Dataset registry and acquisition boundary

At initial inspection on 8 October 2026 this directory was empty. No training data, clinical conversation corpus, downloaded model or benchmark was supplied here. This file records the acquisition plan rather than implying those assets already exist.

Implementation now includes [registry.json](registry.json) and [development/pilot.v0.json](development/pilot.v0.json): 40 AI-authored synthetic families with 200 unreviewed language variants. All are visible development fixtures, not clinical ground truth or a blinded test. No external dataset was acquired. Review workflow and per-variant annotation requirements are in [the annotation handbook](../docs/ANNOTATION_HANDBOOK.md).

Before acquisition, record: source URL; publisher/owner; exact version and revision; task/label definition; language/script; real, synthetic or translated provenance; license text and commercial/redistribution/derivative restrictions; access approval; participant/ethical permissions where applicable; personal-data risk; file checksum; and train/dev/test grouping.

Candidate readiness and important restrictions are documented in [the dataset review](../docs/research/rag-datasets-and-efficacy.md). Public visibility does not establish permission to train a commercial model, translate a corpus, or redistribute personal conversations.

Suggested later organization:

```text
Datasets/
  README.md
  registry.json        # Present: synthetic fixture + external candidates on hold
  development/         # Present: explicitly synthetic, unreviewed cases
  raw/                 # Approved source copies, excluded from Git
  processed/           # Reproducible derivations, excluded from Git
  restricted/          # Access-controlled datasets, never public
```

Do not upload real conversations to generic model endpoints for annotation without an approved processing basis and disclosure. Initially prefer original reviewer-written scenarios and properly licensed public benchmarks. GoEmotions may support an emotion experiment; it is not a clinical crisis-label corpus. A multilingual support-content corpus, personal memory, and a crisis-evaluation set are separate assets with different permissions and purposes.

Every translation/paraphrase stays in the source family's split. Preserve author/speaker/trajectory grouping and deduplicate before splitting. Keep test cases out of prompt examples and training. Mark synthetic provenance permanently in reports.
