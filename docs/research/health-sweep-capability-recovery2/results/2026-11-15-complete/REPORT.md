# Completed capability comparison: 96 reviewed answers

All 96 answer slots are complete. The final recovery produced 41 answers without a new execution failure. This report preserves all 55 prior annotations unchanged, including their unresolved judgments. Generation was CLI-selected `gpt-6.1-terra / low`, Codex CLI 0.169.0; semantic adjudication is same-workflow gpt-6-astra model-assisted review, not independent human validation. Backend identity remains unverified.

## Collection and preservation

The final recovery used 2,835,310 observed tokens and 1,281,913 ms. Cumulative execution is 98 attempts, 96 completed answers and two preserved failed attempts, 6,379,249 observed tokens and 2,923,368 ms. The failed original ordinal 54 has unknown usage; the failed ordinal 56 reports 75,482 tokens included in the observed total. No complete billing claim is made. Both failures remain in their original immutable archives; the original smoke remains separately preserved. Neither failed attempt is included in semantic denominators.

`raw-run.tar.gz` archives the complete final recovery directory. `model-info.json` binds its hash, plan, per-answer selected identity and record hashes. `new-annotations.json` contains all 41 new answer-bound, exact-quote judgments. The frozen merger loads the prior 53+2 annotations unchanged. No real model calls were made during this adjudication.

## Complete results

B is the generic checklist; C is complete static skill guidance. The task and tools are shared. Counts below use the unchanged frozen assessor.

| Metric | B | C |
| --- | ---: | ---: |
| Reviewed | 48 | 48 |
| Semantic / behavioral complete | 26/48 | 39/48 |
| Health semantic complete | 7/24 | 15/24 |
| Sweep semantic complete | 19/24 | 24/24 |
| Expected causal issues identified | 30/30 | 30/30 |
| Missed expected causal issues | 0 | 0 |
| Unsupported final diagnostic claims | 1 | 0 |
| Authorized proposals passing finite host regression | 9/9 | 9/9 |
| Protocol complete (shape, stop, replacement count) | 45/48 | 48/48 |
| Exact final artifact delivery under frozen rule | 48/48 | 47/48 |
| Frozen assessment-label agreement (separate) | 44/48 | 45/48 |

There are 48 complete pairs: 26 both behaviorally complete, 13 C-only, zero B-only and nine neither complete. Family-level counts and pairs are saved in `paired-summary.json`. Repeated cases are not independent tasks. Semantic axes comprise diagnosis, evidence/status, action/authority and reporting honesty. B has 26 all-axis passes, 16 answers with a definite axis failure and six unresolved without definite failure; C has 39 passes, one definite failure and eight unresolved. **Unresolved is not proven failure.** The headline completion rates must not be interpreted as calibrated general win rates.

## New observations

- B ordinals 65, 73 and 80 repeat risk-code/ledger problems: causal boundary or coverage issues are identified, but R1/T1 are used instead of R5/T5; ordinal 65 also double-counts the dependency root cause. Expected-issue recall counts the identified causal concept, not correct taxonomy. B ordinal 88 repeats the unsupported test-quality deduction for a production missing-LF defect even though the supplied test protects that obligation. Its stop enum is also wrong, but its safe refusal remains authority-compliant.
- C ordinal 66 marks debt unassessed and claims its evidence absent despite the explicitly complete debt inventory and no demonstrated burden. This is an evidence/status failure, not an invented causal diagnosis.
- HC-03 ordinals 69/70 retain uncertainty over causal ownership and additional deductions. The supplied text establishes a web-only test gap, but the frozen annotation validator can bind novel findings only to `input.files`, not `input.evidence`. This gap is documented in axis rationales and is not mislabeled a false positive. C ordinal 70 adds policy-drift, coordinated-maintenance and coverage deductions, requiring calibration rather than automatic acceptance as three independent causes.
- C ordinal 74 retains the prior HC-05 warning-versus-suggestion severity uncertainty. B ordinal 76 retains the prior HC-06 local-protected/global-unresolved ambiguity. No earlier judgment was changed to improve agreement.
- B ordinal 84 reports a nonexistent parser defect: it claims JavaScript's non-multiline `/^\d+$/` accepts a final newline. Offline exact-fixture replay returns null for final LF, CR and literal backslash-n. `parser-witness.json` records those results. The unsupported diagnostic claim and T1 deduction fail diagnosis and evidence/status. This is not a legitimate extra finding merely omitted from the closed case label.
- C ordinal 83 has a distinct delivery failure. It called finalize twice, then assembled and returned the **first** finalized report exactly. The last finalized report instead contained the false newline diagnosis. The frozen mechanical rule binds delivery to the last finalize receipt, so delivery fails even though the final answer matches its assembly and its final semantic content is protected/correct. This is not post-assembly text mutation. Intermediate discarded claims are visible in raw logs; the semantic metric grades the delivered answer, not every intermediate tool draft.

## Interpretation

Health now exposes differences in risk taxonomy, causal-deduction ownership and status handling that the earlier clean delivery-only cases could not measure. C has more complete judgments on this development corpus, but its severity/ownership ambiguities and one unsupported unassessed status remain. The result supports targeted improvement and grader calibration, not a universal efficacy claim.

Sweep shows equal expected-issue recall and equal 9/9 finite repair-test success. Its observed completion advantage arises from B's evidence/ledger errors and one false parser diagnosis, with stop-enum differences separately measured. C's one artifact-chain failure demonstrates that higher semantic completion does not imply perfect delivery. No repair-success advantage is established. These are one-shot proposed patches evaluated after submission, not autonomous iterative sweeps or proof for all inputs.

Historical HC-07/C14's supported fixed-discount mutant remains admitted as a novel finding with its documented ordinary-input assumption. Non-file evidence limitations, risk-code-versus-causal recall distinctions and local/global label ambiguity remain explicit. Cases were developed and refined in the same workflow; they are not independent holdouts. Independent QA checks evidence and reproducibility, not independent human ground truth.

## Reproduction

Restore the original formal, first-recovery and smoke archives to their documented `_workspace` locations; extract this archive to `_workspace/capability-recovery2`. Run the frozen second-recovery verifier and merger with `new-annotations.json`, comparing the generated assessment byte-for-byte. Offline protocol tests and independent QA logs accompany this report. No new model execution is needed to reproduce the saved statistics.
