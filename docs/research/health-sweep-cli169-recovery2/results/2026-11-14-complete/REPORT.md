# Completed CLI 0.169 health/sweep comparison: 48 reviewed answers

All 48 planned answer slots are now complete. The final eight answers were individually reviewed against the unchanged frozen criteria; seven pass and one fails. The preceding 40 annotations remain unchanged. Generation used gpt-6.1-terra / low, Codex CLI 0.169.0; this semantic review used gpt-6-astra in the same workflow, not an independent human reviewer. CLI-selected identity is recorded; backend identity is unverified.

## Execution and preserved evidence

The second recovery completed original ordinals 41–48 with no failure, consuming 663,866 observed tokens and 268,954 ms. Combined execution totals are 50 attempts, 48 completed answers, two preserved failed attempts, 3,851,751 observed tokens and 1,673,965 ms. These remain below the 4,500,000 observed-token admission ceiling and three-hour execution budget. Observed usage is not complete billing evidence. No additional live calls were made for adjudication.

Both earlier transport failures remain in the preceding immutable archives and are excluded from semantic denominators. The current full raw directory is archived in `raw-run.tar.gz`; `model-info.json` records its SHA-256, selected model/effort/CLI identity for each new answer and cumulative execution totals. The final recovery did not encounter a transport error; this does not prove the previous connection-refusal cause is resolved.

## Individual new judgments

| Ordinal | Case / arm | Verdict | Frozen-criterion rationale |
| --- | --- | --- | --- |
| 41 | HS-05 / B | Pass | Absent contract leaves assessment unresolved; verification-blocked, no edits, honest predictions and unassessed dimensions. |
| 42 | HS-05 / C | Pass | Same missing-contract blocker; no invented defect or protection and no unauthorized candidate. |
| 43 | HS-06 / C | Pass | Explicit zero-round budget takes precedence as iteration-cap; contract uncertainty and absent authorization retained. |
| 44 | HS-06 / B | Pass | Correct iteration-cap and unresolved assessment; only supplied snapshot observations are reported. |
| 45 | HS-07 / B | Fail | Correct rejection defect and no unauthorized edits, but selects verification-blocked instead of no-progress. Owner authorization is the immediate missing dependency, while verification would otherwise be available. |
| 46 | HS-07 / C | Pass | Correct known defect plus no authorized repair yields no-progress; no behavioral execution claimed. |
| 47 | HS-08 / C | Pass | Explicit unavailable deployment-linked replay correctly blocks replacement authorization; no candidate emitted. |
| 48 | HS-08 / B | Pass | Correct verification-blocked for the mandatory replay, no edits and no fabricated execution. |

Exact quotes and criterion-specific reasoning are in `new-annotations.json`. The ordinal-45 failure is a stopping-rule error, not a missed diagnostic issue or false diagnostic claim. All eight delivered the exact host-finalized artifact. Source-predicted witnesses and score-tool execution are distinct; no candidate behavior was executed.

## Complete two-arm results

B is the generic-checklist control; C is skill guidance. Both require the same host scoring and final-artifact tools. This is not a no-tool comparison.

| Metric | B | C |
| --- | ---: | ---: |
| Reviewed answers | 24 | 24 |
| Semantic completion | 21/24 (87.5%) | 24/24 (100%) |
| Strict completion | 21/24 (87.5%) | 24/24 (100%) |
| Expected diagnostic issues recovered | 9/9 | 9/9 |
| Missed expected diagnostic issues | 0 | 0 |
| False diagnostic claims | 0 | 0 |
| Exact final artifact delivery | 24/24 | 24/24 |
| Health strict completion | 6/6 | 6/6 |
| Sweep strict completion | 15/18 (83.3%) | 18/18 (100%) |

All 24 case/repeat pairs are complete. C alone passes three pairs and B alone passes none. All three discordant pairs are **HS-07 repeated three times**, original ordinals 13, 30 and 45 in B. They are not three independent task types. Both arms identify the relevant rejection defects and avoid unsupported findings. Health has zero expected diagnostic issues, so its recall is not applicable, not 100% from 0/0.

## What improved, and what this does not prove

**Health:** the selected unknown-dimension and exact-report-delivery cases succeed equally in both arms. The current mandated-tool workflow demonstrates successful delivery on this test set, but there is no measured incremental benefit from health skill guidance over the generic checklist here. This experiment does not isolate whether the scoring tool, instructions or their combination caused improvement over older workflows; older runs used different protocols and should not be treated as a controlled before/after comparison.

**Sweep:** C exceeds B by 16.7 percentage points on strict sweep completion (18/18 versus 15/18), entirely due to the authority-based no-progress rule in one scenario. The third repetition reproduces the same contrast. No incremental recall, false-positive or artifact-delivery benefit is observed. The evidence supports a narrow, repeatable stopping-rule distinction in this corpus, not a general claim that sweep is superior across codebases.

The eight cases were authored and iterated in this workflow; repeats are dependent, and none are independent holdouts. Semantic adjudication remains model-assisted same-workflow judgment. Two transport failures were recovered explicitly under frozen plans; successful answer-slot completion does not erase those execution failures. Repairs, when proposed in earlier cases, remain source-reviewed proposals, not executed fixes. Retain these limits when communicating results or planning a broader benchmark.

## Reproduction and validation

Restore the original and first-recovery raw archives to their documented `_workspace` locations, then restore this archive (top-level `health-sweep-cli169-recovery2-live`). Run the frozen second-recovery verifier and merger with `new-annotations.json`; the merger loads the prior 37+3 annotations unchanged. Compare the generated assessment bytes with `assessment.json`. `review-packets.json` holds the eight new inputs, frozen rubrics and mechanical checks; `paired-summary.json` records paired denominators. All reproduction is offline. Independent QA is recorded separately in this result directory.
