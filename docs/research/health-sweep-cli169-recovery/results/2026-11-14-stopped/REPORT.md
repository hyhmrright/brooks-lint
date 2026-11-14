# Interrupted CLI 0.169 recovery: 40 reviewed answers

This is a partial, same-workflow development comparison. All 37 earlier annotations are retained unchanged; three new answers were individually reviewed by gpt-6-astra against the frozen case criteria. The generation model remains gpt-6.1-terra / low, CLI 0.169.0. CLI-selected identity is recorded; backend identity is unverified.

## Execution and preservation

Recovery submitted four turns: original ordinals 38, 39 and 40 completed; ordinal 41 failed on an exposed transport retry, and 42–48 were not submitted. The collector stopped without resubmitting. Recovery consumed 308,173 observed tokens and 124,515 ms. Combined totals are 42 attempts, 40 completed answers, two failed attempts, 3,187,885 observed tokens and 1,405,011 ms. The eight outstanding answer slots are 41–48; no further recovery is authorized by this report.

The new failure reports `Reconnecting... 2/5`, `willRetry: true`, and `Connection refused (os error 61)` without an HTTP status. It reports 10,245 observed tokens, included above. The refusing endpoint and hidden CLI retry count remain unknown. This is an execution failure, not a semantic failure. Both failed attempts remain excluded from accuracy denominators. The original failure and answers remain in the prior immutable archive; the full recovery directory is saved in `raw-run.tar.gz`, with its hash in `model-info.json`.

## New case judgments

| Original ordinal | Case / arm | Judgment | Evidence |
| --- | --- | --- | --- |
| 38 | HS-03 / C | Pass | Finite-integer domain is protected; no replacement, no actionable findings, unrelated dimensions unassessed, predictions distinguished from execution. |
| 39 | HS-04 / C | Pass | Explicit rejection duty demonstrated with non-array and NaN witnesses; authorized replacement proposed; iteration cap respected; execution remains outstanding. |
| 40 | HS-04 / B | Pass | Same rejection duty and scoped proposal; correct iteration cap; no claim that candidate tests ran. |

HS-04/C uses an imprecise finding heading about rejection “before mutation”; its concrete witnesses correctly establish the required rejection failure. The proposed candidate is not executed. This wording does not create a new frozen failure criterion or justify silently rewriting historical grading. The tool execution claims concern dashboard finalization, not source tests.

## Merged results

B is the generic-checklist control; C is the skill-guidance arm. Both use the mandated host score/final-artifact tools. This is not a no-tool comparison.

| Metric | B | C |
| --- | ---: | ---: |
| Reviewed answers | 20 | 20 |
| Semantic completion | 18/20 (90%) | 20/20 (100%) |
| Strict completion | 18/20 (90%) | 20/20 (100%) |
| Expected issues recovered | 7/7 | 7/7 |
| Missed expected issues | 0 | 0 |
| False diagnostic claims | 0 | 0 |
| Exact final tool artifact delivery | 20/20 | 20/20 |
| Health strict completion | 6/6 | 6/6 |
| Sweep strict completion | 12/14 (85.7%) | 14/14 (100%) |

There are 20 complete case/repeat pairs: B passes 18 and C passes 20; C alone passes two pairs, and B alone passes none. B's two retained failures are HS-07 stopping with `verification-blocked` instead of `no-progress` (original ordinals 13 and 30). They are stopping-rule failures, not missed diagnoses or false-positive findings. All three added answers pass, so the observed advantage remains confined to those two earlier sweep stopping decisions. Recall is not applicable to health's zero expected issues; 0/0 must not be reported as 100% recall.

Health shows equal delivery and semantic success in this observed subset, with no demonstrated incremental benefit of skill guidance. Sweep shows a narrow stopping-rule advantage for C; there is no observed recall or false-positive advantage. These partial results do not establish general superiority: cases were authored and iterated within the same workflow, repeats are dependent, transport interruption determines missingness, and no independent human or holdout judgment is claimed. Candidate repairs remain source-reviewed proposals, not executed fixes.

## Reproduction

`new-annotations.json` contains only the three new explicit judgments and exact quote evidence. `assessment.json` was generated with the frozen recovery merger, which reads the original 37 annotations unchanged. `review-packets.json` contains input, rubric and mechanical checks for each new answer; `paired-summary.json` gives paired denominators. QA should independently extract the archive, verify it with the frozen runner, rerun the merger and compare output bytes. The original `_workspace/health-sweep-cli169-live` must also be present, restored from its preserved archive if needed. No real model calls are needed for this verification.
