# Runtime scoring calibration, revision 1

These are original synthetic answer examples and semantic annotations written by
an agent already exposed to the project's fixtures, model answers and guidance.
They are neither real model-run outputs nor independent or human adjudication.
Their purpose is to make the prospective [scoring protocol](../../../../docs/research/runtime-scoring-protocol.md)
concrete before another live study. All examples and expected labels are public.

`examples.json` pins `runtime-scoring-protocol-v1`. Each entry carries a case kind,
expected causal issue IDs, a visible synthetic premise, an authored answer,
execution status, a reviewer annotation and expected per-response counters.
The semantic labels are authored expectations; an offline implementation checks
schema and arithmetic from those labels and must not classify answers by words.
No model is invoked. Keep this suite separate from historical runner judgments
and the 43 development fixtures.

Important contrasts include CAL-01/02 (same detected issue, different evidence),
CAL-06/07 (correct uncertainty with explicit/implicit alternatives), CAL-08/09/10
(false defect, false safety, conditional concern), CAL-11/12 (supplementary label
or score without an extra defect), CAL-15 (one of two expected issues missed),
and CAL-16/17/18 (failed execution, pending review, executed incomplete answer).
CAL-19 has both a supported expected issue and an unsupported extra assertion.
CAL-20 preserves a noncanonical explicit severity label as a separate concern;
CAL-21 preserves reviewer uncertainty about a core-label concern.

`annotation.matched_issue_ids` is a unique set. `evidence` lists the case's
predeclared requirements by ID; `met` is a review judgment, not a parser result.
Severity rows have `issue_id`, canonical `label` or `unspecified`, and the frozen
`allowed` labels. Supplementary concerns identify a kind, exact excerpt and `support` of
`definite` or `uncertain`;
unsupported defect claims also use exact answer substrings. `unsupported_safety`
records an unconditional safety assurance that is unsupported or contradicted by
the supplied evidence on any case kind. CAL-03 contradicts an explicit release
contract; CAL-09 asserts safety despite missing ownership. Both contribute to
the global unsupported-safety count, while only unresolved cases enter the
unresolved-certainty denominator. Every annotated example has a rationale. `annotation: null` denotes
an ungraded failure or pending successful review, distinguished by execution
status. An executed incomplete answer remains eligible.

The offline evaluator and regression tests added with this batch should reproduce
all `expected` fields, reject malformed annotations and duplicate IDs, and verify
zero-denominator rates and complete-triplet selection. Agreement with authored
labels proves deterministic aggregation only. Independent reviewers must first
produce their own labels before comparing against these examples if this material
is used for an actual calibration exercise. Preserve disagreements and revisions.

## Offline commands and pairing API

```bash
npm run evals:runtime:prepared
node evals/research/runtime/calibration/validate.mjs > /tmp/runtime-calibration-summary.json
diff -u evals/research/runtime/calibration/summary.json /tmp/runtime-calibration-summary.json
```

`scoring.mjs` validates reviewer annotations and computes counters and rates;
`validate.mjs` compares each authored example's computed counters with its
explicit `expected` record. The saved `summary.json` is a calibration-material
summary, never model accuracy. Answer SHA-256 values in the summary bind these
exact snippets. No answer-text parser supplies semantic labels.

`compareTriplets(records, plannedTriplets)` accepts a prospective schedule of
`{case_id, repetition}` rows so that even an entirely absent triplet appears in
exclusions. A/B/C records also require unique response IDs and identical visible
contract, issue inventory, evidence requirements and allowed severities. Pairing
ignores `annotation.completed` but requires successful execution and available
annotation. Returned `planned_turns` and `absent_turns` expose missing records;
individual summaries cover the supplied arm records. Without the optional
schedule the helper can only report triplets represented by at least one record;
it cannot infer wholly absent planned triplets. Future study adapters must supply
the frozen complete schedule and preserve not-run rows or explicit exclusions.

A noncanonical severity concern carries `issue_id`; it cannot coexist with a
canonical/unspecified severity row for the same issue. It is reported separately
from absent supported-issue severity. Definite and uncertain supplementary
concerns remain separate. This prospective helper is **not integrated into the
historical live runner/importer** and does not change frozen studies.

## Reviewer-facing exercise packets

[review-packets.json](review-packets.json) preserves the visible premises, case
rubric, evidence requirements, allowed severity, exact answer, execution status
and answer hash, while omitting authored answer annotations, expected counters
and explanatory rationale. Reviewers can record their own labels first and then
compare them with `examples.json`, retaining disagreements and their exposure
record. Failed execution should remain ungraded. No reviewer has completed that
exercise merely because packets exist.

```bash
node evals/research/runtime/calibration/packets.mjs > /tmp/runtime-calibration-packets.json
diff -u evals/research/runtime/calibration/review-packets.json /tmp/runtime-calibration-packets.json
```

This is partial blinding only: the ratings remain public and accessible. Prior
readers or authors cannot become blind or independent by opening these packets.
