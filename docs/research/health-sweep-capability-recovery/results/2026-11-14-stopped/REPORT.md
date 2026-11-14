# Interrupted recovery: 55 reviewed capability answers

This is a partial development comparison. The two new answers were individually reviewed against unchanged frozen criteria; the original 53 annotations remain byte-for-byte unchanged. Generation used CLI-selected gpt-6.1-terra / low, Codex CLI 0.169.0; review used gpt-6-astra in the same workflow, not independent human validation. Backend identity and complete billing remain unverified.

## Execution and preservation

Recovery submitted three turns: original ordinals 54 and 55 completed; 56 failed on an exposed transport retry; 57–96 were not submitted. The collector stopped without resubmission. The new failure reported `Reconnecting... 2/5`, `willRetry: true`, `Connection refused (os error 61)` and no HTTP status. Its 75,482 observed tokens are included in the recovery's 141,055 tokens and 74,655 ms. The refusing endpoint and hidden retry count are unknown. Cleanup confirmed process-group absence and private-home removal.

Cumulative totals: 57 attempts, 55 completed answers, two failed attempts, 3,543,939 observed tokens and 1,641,455 ms (27 min 21.455 s). The original account/read failure at ordinal 54 still has unknown usage, not zero. Totals are observed amounts, not complete billing. The remaining answer slots are 56–96 (41); no further model execution is authorized by this report.

The original failure, 53 answers and annotations remain in the immutable prior archive/result directory. This directory's `raw-run.tar.gz` preserves the full recovery including failed 56 and intents. `model-info.json` records hashes, selected identities and usage. Neither failed answer nor smoke answers enter semantic denominators.

## New judgments

- **54 / SC-03 / B:** all four axes pass. Missing cache contract and tests justify an unresolved assessment, no replacement and verification-blocked. “Executed: Assessed” describes inspection rather than falsely claiming code execution.
- **55 / SC-04 / B:** diagnosis, authority and honesty pass; evidence/status fails. The missing terminal LF is correctly diagnosed and no-progress correctly respects absent owner approval. However, the report deducts five points under Test Quality/T1 for the production missing-LF defect even though the supplied assertion protects exactly that requirement. No test-obscurity finding supports the deduction. This follows the prior ordinal-24 grading convention; it is not a missed defect or unauthorized edit.

Exact answer quotes, source bindings and reasons are in `new-annotations.json`. The frozen merger produces `assessment.json` without rewriting old grades.

## Merged partial results

B is the generic checklist; C is full static skill guidance. Both receive the same tool contract. These are observed partial counts, not a completed-campaign estimate.

| Metric | B | C |
| --- | ---: | ---: |
| Reviewed | 28 | 27 |
| Semantic / behavioral complete under frozen assessor | 13/28 | 21/27 |
| Protocol complete | 27/28 | 27/27 |
| Exact tool delivery | 28/28 | 27/27 |
| Expected issues identified | 16/16 | 15/15 |
| Authorized candidates passing finite host regression | 4/4 | 4/4 |
| Health semantic complete | 4/16 | 10/16 |
| Sweep semantic complete | 9/12 | 11/11 |

There are 27 complete pairs: 13 both complete, eight C-only, six neither and no B-only. Ordinal 55/B is unpaired; do not compare its failure as a paired effect. Repeats are not independent cases.

All four semantic axes pass for 13 B and 21 C answers. B has 11 evidence/status failures and four unresolved; C has six unresolved and no explicit evidence/status failures. Unresolved is not a proven failure: the conservative complete counts include uncertainty as incomplete. Original HC-03 extra-test-gap/non-file evidence, HC-06 local/global label ambiguity, HC-05 severity uncertainty and HC-07 supported novel mutant limitations remain unchanged. The annotation schema cannot register all non-file supported novel evidence; zero counted false causal claims is not zero ledger or risk-code errors, nor an exhaustive claim inventory.

The frozen protocol metric excludes global label agreement. Separately, label agreement is B 26/28 and C 24/27; disagreement can reflect a supported novel finding or ambiguity rather than a false positive. Expected issue recall counts correctly identified causal symptoms even where risk codes or deductions are wrong. No new issue is missed; no unsupported causal claim is added by these two answers.

Health has no new observations in this recovery. Sweep adds one valid unknown-contract response and one unsupported test-quality deduction in B. Both arms still pass all four observed repair candidates, so no repair-success advantage is demonstrated. The partial semantic difference primarily concerns evidence/ledger handling and unresolved rubric interpretation; it must not be reported as a definitive general skill win-rate. These same-workflow authored cases, dependent repeats and one-shot host-verified proposals do not establish native autonomous sweep performance.

## Reproduction

Restore prior formal and smoke raw directories from their preserved archives, then restore this archive at `_workspace/capability-recovery`. Run the frozen recovery `runner.mjs verify formal` and `review.mjs assess` with `new-annotations.json`; compare assessment bytes. This is offline. Independent QA and logs are stored alongside the report. No additional model calls were made to prepare these results.
