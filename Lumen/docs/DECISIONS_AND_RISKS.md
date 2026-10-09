# Decisions, assumptions and remaining risks

Baseline: 8 October 2026. These are proposed decisions for implementation, not observations of a working Lumen app.

## Decisions to carry forward

| ID | Decision | Reason | Revisit when |
| --- | --- | --- | --- |
| D01 | Use the existing Lumen directory as the only project root | Keeps sources, future code and evidence together | Never create a nested competing root without a concrete migration need |
| D02 | Adult, non-diagnostic support first | The supplied purpose is support; youth/clinical delivery adds distinct obligations | A separately reviewed youth or clinical protocol exists |
| D03 | Text-first web delivery | Tests the central safety hypotheses without recognition/browser variability | Voice accessibility demand and safe transcript/permission tests are demonstrated |
| D04 | One shared safety path for chat and journal | Prevents route-specific bypasses and gives a measurable cross-source experiment | A new input modality is added; it must conform to the contract |
| D05 | Rules baseline, then one semantic detector | Avoids assuming complex models improve the actual task | A frozen comparison shows an additional component provides relevant benefit |
| D06 | Keep safety decisions independent of generation | Supports reliable reviewed guidance and explicit uncertainty | Never let a generator override a safety action simply for fluency |
| D07 | Whole completed response is checked before release | Prompt instructions or phrase replacement alone cannot enforce the required behavior | Validated incremental streaming can demonstrate equivalent protection |
| D08 | Recent chronological context before optional vectors | Immediate context cannot depend on semantic ranking | Measured retrieval/cost benefit justifies pgvector implementation |
| D09 | Self-reported mood first; inferred emotion optional | Emotion is not a clinical crisis label | A controlled ablation shows safe relevant benefit |
| D10 | Separate consent for memory, review sharing and research | Personal history has different purposes and expectations | Ethics/legal review refines the exact processing basis and disclosures |
| D11 | Minimal operational audit, deletable derived content | An immutable journal would conflict with meaningful deletion/withdrawal | A specific lawful retention requirement is established and disclosed |
| D12 | Resource routing before any promised warm handoff | A link does not create a staffed referral service | A partner agreement, coverage and acknowledgment process exist |
| D13 | Language claims depend on per-slice qualification | Aggregate scores can hide weak Marathi/Romanized performance | More qualified reviewers and held-out data support expansion |
| D14 | Human-reviewed versioned improvement | No uncontrolled learning from users or untested live lexicon updates | Never bypass release evaluation for convenience |
| D15 | Defend contribution through comparative evidence | Current product/research overlap invalidates generic uniqueness | A fresh prior-art review and frozen experiment justify a narrower claim |

## Risk register

| Risk | Current status | Owner responsibility | Required mitigation / decision |
| --- | --- | --- | --- |
| No supplied dataset | Confirmed empty at initial inspection | Dataset lead | Permission/license registry and authored rubric pilot in Phase 1 |
| Insufficient authentic Marathi/Romanized labels | Not established | Dataset lead + bilingual/clinical reviewers | Qualify separate slices; restrict product claims if evidence is insufficient |
| Clinical expertise and ethics pathway | Not identified in supplied workspace | Project lead + guide | Arrange before personal-data research or pilot |
| Indirect concerns missed | Known literature limitation; Lumen unmeasured | Safety/evaluation lead | Dedicated indirect and temporal holdouts, uncertainty and error review |
| Alarm fatigue | Known sensitivity trade-off; local burden unknown | Clinical collaborator + operations | Separate urgent alerts/clarification; matched-alert experiments and prospective thresholds |
| Temporal context adds no value | Unproven hypothesis | Research lead | Controlled ablation and power/precision plan; remove unsupported claims |
| Memory causes wrong/stale interpretations | Anticipated implementation risk | API + safety owners | Source/time provenance, old-entry behavior, bounded context and deletion tests |
| Prompt injections or invalid model output | Anticipated implementation risk | Safety/security owner | Schema checks, untrusted-text boundaries, complete output checks and fallbacks |
| Provider outage or slow CPU generation | Unmeasured | Backend/operations | Reviewed guidance independent of optional inference; actual-machine load measurements |
| Privacy leak or cross-user retrieval | Anticipated severe risk | Backend/data owner | Restricted roles, server authorization, real-path isolation and deletion tests |
| Resource expiry or unstaffed handoff | No integration/partner proven | Operations owner | Maintained registry; truthful hours and completed-handoff states |
| Unsupported legal/device claim | Review pending | Project lead + qualified reviewer | Assess current intended use, claims, entity, jurisdiction and staged obligations |
| Dataset restrictions or unclear upstream rights | Verified for several candidate cards | Dataset lead | Hold ingestion until intended-use permission is clear |
| Existing product and brand overlap | Verified public evidence | Product/research owner | Narrow competitive thesis; name/trademark review before commercialization |
| Users or buyers do not value the difference | No interviews completed | Product/discovery owner | Actual-workflow discovery, observed tasks and measured economics |

## Open choices and reasonable defaults

The actual implementation start date, member skills, weekly availability, budget, clinical collaborator, reviewers, hosting region, generator/provider and campus partner are unconfirmed. The plan assumes four part-time contributors, adult access and a web prototype so independent engineering work can be scoped. Final provider selection, thresholds, participant recruitment and promised human services depend on the relevant evidence or responsible review; elapsed time is not approval.

The final model shortlist must balance target-language quality, response/screening safety, license, revision stability, privacy conditions, measured latency and cost. Do not select a model because one historical paper reported a higher semantic score.

## Evidence handling

Keep original files untouched and source hashes in the manifest. Store paper-review statements with local page numbers and primary links. Keep synthetic cases visibly synthetic, and mark unavailable supplements/model code as unavailable. Do not silently reconcile contradictory numerical tables by choosing the most favorable number.

Research reviewers identified internal reporting inconsistencies in several supplied papers. Those are reasons to narrow claims and reproduce results where possible, not to dismiss entire studies or advertise Lumen as having solved the problem.

## Next executable work

Implementation started after the research/planning pass. The [status record](IMPLEMENTATION_STATUS.md) tracks the working scope, pending responsibilities, dataset registry, draft annotation pilot and runnable Phase 1 rule baseline. No web/API application, real-data acquisition, model training, partner contact, human pilot or deployment has occurred. Final Phase 0/1 exit gates remain open for the stated human/data dependencies.
