# Stopped revision comparison: semantic assessment

The frozen 132-response study stopped after 12 attempts: 11 completed, one execution failure, and 120 not run. All 11 completed answers were individually assessed. This is a partial execution report, not a completed efficacy experiment. Execution failures and unrun tasks are retained in the planned denominator and are not scored as wrong model answers.

Model selected by the CLI: `gpt-6.1-terra`, reasoning effort `low`; CLI `0.167.0`. This records CLI selection, not independent backend identity attestation. The observed usage at stop was 251,150 tokens; this is not a billing measurement, and failed-turn usage may be incomplete. Budget admission limits were five million observed tokens, eight hours, 180 seconds per turn, and zero automatic retries.

Registration SHA-256: `6fa068833bfa33900c8118cd9484e64005cdb3439e7572181bc4171ea6763d1c`. Freeze SHA-256: `2e12919522ab7fb0bdc315823e4f900456506f0dfc463c7034b68504b7af6672`. Candidate preparation commit: `dfd1d5d`.

## Execution coverage

| Skill / arm | Planned | Completed | Failed | Not run |
|---|---:|---:|---:|---:|
| Review A: original | 21 | 5 | 0 | 16 |
| Review B: revised | 21 | 5 | 0 | 16 |
| Health A: original | 24 | 0 | 1 | 23 |
| Health B: revised | 24 | 1 | 0 | 23 |
| Sweep A: original | 21 | 0 | 0 | 21 |
| Sweep B: revised | 21 | 0 | 0 | 21 |

All completed answers belong to the historical-development cohort (11 of 96 planned responses). The six new same-workflow boundary cases received no responses (0 of 36 planned). Repeats two and three did not execute. There is no contemporary no-skill arm.

## Completed-answer observations

The following denominators cover completed answers only; they do not replace the planned counts above.

| Review, historical repeat one | Original A | Revised B |
|---|---:|---:|
| Assessment agreement | 4/5 | 5/5 |
| Expected-issue recall | 2/2 | 2/2 |
| Missing expected issues | 0 | 0 |
| Required evidence | 13/14 | 14/14 |
| Confirmed unsupported claims | 1 | 0 |
| Pending claims | 1 | 0 |
| Fully supported answers | 3/5, plus one pending | 5/5 |
| Protected-case false positives | 0/1 | 0/1 |
| Unresolved-case overclaims | 1/1 | 0/1 |

Five review pairs completed: one improved under B (AS-04), three tied, and one remained pending (AS-01). The other 61 of 66 planned pairs are incomplete. These small, sequentially selected historical observations are insufficient to establish general improvement.

AS-04 original A (`8c89501156917c7a7ddb`) asserted that `90 * .9` falls below 81 and that flooring produces 80, an alleged defect independent of missing rounding policy. Direct Node evaluation gives exactly 81 for both expressions; the specific supporting witness is false. The revised response correctly retained uncertainty about the absent rounding contract. A different possible large-integer example cannot repair the answer's false concrete witness.

AS-01 original A (`f35e29ba977f7d62bc7c`) adds a scored T5 allegation explicitly scoped to the lack of supplied tests. The local observation is true, but the fixture does not establish missing project regression protection. This remains pending rather than being counted as either a confirmed false positive or a fully supported answer. Exact quotes and rationale are in `annotations.json`.

Only revised health B AS-21 (`b9d405c4866db92c56b6`) completed. It publishes **77/100** in its headline, then correctly derives **79.5 -> 80/100** in the body. Assessment is partial: the strict-dashboard-arithmetic criterion is withheld and the incorrect headline is a confirmed unsupported claim. All three evidence components receive credit because the correct component scores and weighted derivation are explicitly demonstrated and no individual findings are invented. Component evidence credit is not whole-answer correctness. This adjudication rule was agreed and saved before arm mapping. The failed A mate prevents a health comparison. No sweep outcome exists to evaluate.

## Review method and limitations

Initial annotations used masked packet exports with response IDs and answer hashes preserved. Each credit and claim includes exact answer excerpts and a semantic rationale. Reviewer: current `gpt-6-astra` Codex session and same-model delegated reviewers; reviewer reasoning effort was not independently verified. Reviewers were exposed to the same workflow, fixtures, policies and prior development. Masking does not ensure independence and prose can reveal guidance. No separate judge-model invocation or independent human validation occurred. Aggregate mapping was read only after initial annotations were saved.

The deterministic scorer verifies provenance, quote membership, rubric structure and arithmetic aggregation; it does not independently prove semantic truth. Accordingly `semanticJudgmentVerified` remains false. The pending claim remains explicit. Original published historical scores were not rewritten.

Both arms use the corrected completed-message collector. The earlier historical sweep failure was a collector contamination error; corrected historical sweep B is 15/15 on completion and artifact validity. This new stopped run provides no new sweep efficacy evidence. Revised sweep guidance also includes revised review guidance, so a later completed study would measure a bundle rather than an isolated sweep-only effect.

These are authored, text-only tasks; even a completed study would not establish native skill discovery or autonomous editing behavior. Historical cases informed revisions, and new boundary cases are same-workflow regression coverage rather than independent holdouts. Prospective equivalence rules differ from earlier strict scoring, so historical published totals are not directly comparable. No statistical significance or hundredfold difficulty claim is warranted.

## Reproduction

After the raw run is archived, regenerate `summary.json` using the checked-in runner and annotations:

```sh
node evals/research/skill-revision/report.mjs <verified-run-directory> \
  docs/research/skill-revision-results/2026-11-11-terra-low/annotations.json \
  /tmp/skill-revision-summary.json
```

The output path must not already exist. Compare it byte-for-byte with `summary.json`. The command performs no live call. The archive's execution report supplies failure details; no recovery or retry is implied by this assessment.
