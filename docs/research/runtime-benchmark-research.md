# Benchmark research and validity audit

Research date: 2026-11-10. Mode: Test Quality Review, scoped to the runtime
research benchmark's ability to support capability claims. This is a research
decision record, not a leaderboard, a live run, or certification of a perfect
benchmark. The frozen HB revision and historical 81-answer study are preserved.

## Decision

Keep the executable synthetic triads as a controlled mechanism track, extend
their mechanism and multi-issue coverage in a separate version, and acquire real
review candidates through an explicit admission process. Do not substitute a
popular coding leaderboard for a code-review evaluation. Use separate results for
diagnosis, restraint, evidence, and downstream usefulness. There is no defensible
single number that measures every model capability or a scale for “100x harder.”

The present work implements an additional 18-case extension, corpus auditing and
external source acquisition. It does not establish production generalization,
measured difficulty, independent human truth, or a ready live runner for the new
IDs. See the [extension](runtime-benchmark-v2.md) and its validation record.

## Evidence from the current collection

The [machine-readable inventory](../../evals/research/runtime/benchmark-audit/inventory.json)
audits all 36 HB entries, their input sizes, source lines, issue counts and review
status. It binds the previous freeze hash, and can be regenerated offline.
These counts are from actual fixture bytes, not descriptions of planned cases.

```text
Existing HB: 12 mechanism families, 36 cases
Kinds: 12 defect / 12 protected / 12 unresolved
Source: JavaScript modules, 33–80 source lines per case
Defect cases with multiple expected issues: 0
Protected/unresolved controls: present for every family
New live responses on HB: none
External admitted production cases before/after this audit: 0
```

The [previous study](runtime-results/2026-11-10-terra-login/review-v1/REPORT.md)
used nine HC cases, not these 36 HB cases. Its three arms each achieved 27/27
assessment correctness. Evidence completeness was 20/27, 23/27 and 27/27;
under the relaxed alternative-contract sensitivity B and C tied. That demonstrates
a ceiling on the old sample and rubric sensitivity, not saturation of the new HB
collection or diagnostic superiority of the runtime skill.

Inspection of all twelve defect entry modules shows that many witnesses remain
locally visible: HB-01 rebases a deadline at dispatch; HB-05 allocates a fresh
inner budget; HB-27 releases credits after enqueue; HB-32 marks a resetting
connection available. Cross-file support and near-miss controls are valuable,
but file count alone does not make these repository-scale tasks. This is an
engineering estimate of likely difficulty; it requires later model calibration.

## Risk diagnosis before changes

Scoped Health Score: **95/100**, balanced, one Warning (T5). No project config
overrides the preset. This score concerns the stated benchmark expansion goal;
it is not a measure of benchmark reliability, model accuracy, or repository health.

- **Symptom:** no defect case requires recovering more than one independent
  causal finding, and every case is a compact synthetic JavaScript program.
  **Source:** the complete manifest/rubric inventory above; T5 Coverage Illusion
  in `skills/_shared/test-decay-risks.md`, applied to semantic coverage rather than
  source-line execution coverage. **Consequence:** high case classification
  accuracy cannot establish multi-issue recall or real-repository review ability.
  **Remedy:** add independent issue inventories and partial-fix controls, broaden
  mechanisms, and keep real-repository evidence as a separate admission track.

The current deterministic scheduling, defect/protected controls, frozen exports
and mutation checks are strengths, not mock abuse. Public same-workflow exposure
and absent human review are already disclosed. They remain inference limits,
not newly discovered implementation failures. Book chapters are not re-verified
by this web research; original book-mapping status remains unverified.

The first extension draft also supplied both alternative contracts directly in
several unresolved prompts. QA round 2 confirmed this as material cueing:
correct answers could reflect paraphrase rather than discovering missing evidence.
The final author pass replaces those answer-shaped passages with engineering
handoff facts and artifact boundaries, while retaining the executable alternatives
in evaluator-only rubrics. This reduces direct cues; it does not prove prompt
neutrality or independent discovery. The old frozen HB inputs remain unchanged.

## Public research: what transfers and what does not

The search covered review, repository repair, code reasoning, strengthened test
oracles, iterative maintenance and distributed histories. Primary project pages,
papers and source repositories were preferred over aggregator rankings. This is
a broad, dated review, not a claim to have exhaustively searched the entire web.
Reported external scores belong to their authors and harnesses; none were
reproduced with our models in this task.

| Source inspected | Useful contribution | Decision and limitation |
| --- | --- | --- |
| [Code Review Bench, pinned source](https://github.com/withmartian/code-review-benchmark/tree/e616e849755441da38f18bf3adba2c9583b03803) | Real PRs, issue-level categories/severity, semantic matching and separate precision/recall | Acquire 50 candidates and 173 upstream labels across five projects. Keep all quarantined until reviewed revision/context and labels are verified. Adopt open-set adjudication; unmatched findings are not automatically false. |
| [Code Review Bench methodology](https://github.com/withmartian/code-review-benchmark/blob/e616e849755441da38f18bf3adba2c9583b03803/methodology/full.md) | Explicit discussion of incomplete gold sets and confounding in developer-action signals | Report confirmed false positives, pending discoveries and label revisions separately. Developer acceptance is evidence of usefulness, not a complete correctness oracle. |
| [SWE-PRBench v1](https://arxiv.org/abs/2603.26130v1) | Authors describe 350 PRs and three context configurations | Borrow context ablations. Do not assume adding context improves scores. Dataset availability is asserted in the abstract but was not independently reconstructed here; no imported executable corpus or reproduced scores are claimed. |
| [SWE-Review](https://arxiv.org/abs/2607.06065v1) | Measures review decisions and usefulness for downstream revisions | Separate a future repair/usefulness track from review-only diagnosis. A reviewer finding an issue and a repairer successfully fixing it are different outcomes. |
| [EvalPlus](https://evalplus.github.io/) | Expanded test sets and separate efficiency evaluation | Borrow stronger boundary and mutation checks. The site's 80x/35x test expansion is not an 80x/35x increase in reasoning difficulty; do not transfer that multiplier to our cases. |
| [LiveCodeBench](https://livecodebench.github.io/) | Release-date filtering and multiple code capabilities | Record provenance dates and refresh versions. Recent collection reduces some contamination risks, but unknown training cutoffs and author exposure prevent a guarantee of unseen inputs. Competitive programming is not a replacement for runtime review. |
| [CRUXEval](https://github.com/facebookresearch/cruxeval) | Input/output reasoning as a capability separate from code generation | Use concrete causal witnesses and counterfactual outcomes. Small-function reasoning does not establish repository navigation or operational diagnosis. |
| [SlopCodeBench v2](https://arxiv.org/abs/2603.24755v2) | Iterative extension with correctness and degradation measurements | Keep a future longitudinal maintenance track distinct from one-shot review. Inspected v2 has 36 problems/196 checkpoints; older search summaries describe 20/93. Pin versions; do not combine their statistics. Complexity proxies alone do not prove maintainability harm. |
| [SWE-Bench Pro audit, July 2026](https://openai.com/index/separating-signal-from-noise-coding-evaluations/) | Reports underspecified requirements, overly restrictive tests, insufficient tests and prompt/test conflicts | Require observable contracts, allow alternative valid solutions, and audit verifier behavior. Its criticism concerns the then-current dataset, not every subsequent version. |
| [SWE-Bench Pro V2, October 2026](https://arxiv.org/abs/2610.24206v1) | Revised instructions, expert adjudication, clean re-grading and restricted evaluation network | Borrow clean evaluator boundaries. Its authors report substantial repairs and high frontier scores; “hard” naming is not evidence of lasting discrimination. This is issue repair, not our review task. |
| [Jepsen consistency models](https://jepsen.io/consistency/models) | Judge operation histories against explicit allowed histories | Make contract differences and partial-order witnesses executable. Our deterministic in-memory drivers are not Jepsen cluster tests, OS race tests, or exhaustive model checking. |

## External source audit and disposition

The pinned Code Review Bench snapshot has 50 entries and 173 labels. Five entries
contain an upstream note about an unavailable reviewed commit. These notes are
preserved, not interpreted as confirmed benchmark defects. Some entries point to
recreated PRs, others to original PRs/commits; those are not interchangeable review
states. Categories include 94 bug, 14 concurrency, 13 API, 11 security, 7 data,
6 performance, 4 test-gap, 9 documentation, 10 style and 5 speculative labels.
The five source JSON files and MIT notice are archived unchanged with hashes.

This is a useful broader candidate pool (TypeScript, Go, Java, Python and Ruby
projects), but labels are not local proof. A source description and a missing
commit warning cannot supply executable input. No target source snapshots were
downloaded, built or exercised. All 50 remain outside runnable counts and scores.
The upstream fork scripts can write repositories/PRs and the judge scripts call
models; neither was run. See the [source boundary](../../evals/research/runtime/benchmark-audit/README.md).

## Evaluation architecture and prospective gates

1. **Controlled diagnosis:** keep HB-01–36 as frozen regression/calibration
   material and use the separately frozen extension. Score issues, not only the
   three-way conclusion. Protected cases must retain useful work; “reject all”
   is not a valid fix. Unresolved cases need two compatible completions with
   different judgments, not hidden facts the model must guess.
2. **Real review:** admit externally sourced cases only after exact reviewed
   snapshot, licensing, sufficient visible context and label evidence are pinned.
   Freeze issue/PR lineage and repository-level splits; never split sibling fixes
   or copied PRs across development/evaluation. No current case meets this gate.
3. **Context and capability:** predeclare diff-only versus supplied full context
   versus tool-enabled repository exploration. Compare arms only within the same
   access mode. Native skill discovery must be measured by actual reads, not
   inferred from a guidance string placed in a prompt.
4. **Usefulness and maintenance:** evaluate accepted remedies in a separate clean
   workspace against regression/contract tests, then future change checkpoints.
   These are designed next tracks, not implemented or tested here. Never combine
   repair scores with diagnosis scores without separate denominators.

For the next live comparison retain A/B/C plus a predeclared, length-comparable
generic-checklist control if the budget permits. Freeze prompts, input hashes,
model/effort/CLI identity, access policy, seeded ordering, repetition count,
timeouts, retry policy and scoring before collecting answers. Matching length
does not fully isolate content. No new live model budget is authorized here.

Report execution availability over planned turns, issue-level recall/FNs,
confirmed finding precision/FPs, protected false alarms, unresolved certainty
errors, evidence completeness, severity and tokens/latency separately. Pending
novel findings must produce precision bounds or an explicit incomplete score,
not a forced negative. If a new issue is accepted, re-review all arms uniformly
and publish a versioned sensitivity; retain the primary frozen denominator.

Use family/repository as the analysis unit, not repeated responses as independent
samples. Report paired differences and family detail before inferential claims.
Predeclare runtime-targeted, core test-quality and broader transfer strata; an
expanded corpus must not silently redefine a runtime skill's intended scope.
Publish each stratum rather than letting a pooled average hide regressions or
claiming the runtime guidance should improve every newly added domain.
Blind arm labels where feasible, retain rationale and disagreements, and disclose
shared author/reviewer provenance. Agent QA is not independent human validation.

Difficulty needs empirical calibration: run the calibration families under a
fixed model budget, preserve every outcome, inspect both ceiling and floor, and
add new revisions based on missing capabilities rather than cherry-picking only
baseline failures. A case can be useful even if every model passes. A case no
model solves might be broken rather than profound. A perfect score or a very low
score alone cannot establish a good benchmark.

## What is still unverified

The extension's empirical discrimination, target-repository runtime behavior,
external gold completeness, unseen-data status, independent expert agreement,
realistic defect prevalence and longitudinal utility remain unmeasured. The new
suite improves inspectable coverage and test sensitivity; it does not remove
these limits. Claiming a perfect universal benchmark now would hide precisely
the measurement problems this audit identified.

## Reproduce the delivered preparation

```sh
npm run evals:runtime:hard
npm run evals:runtime:v2
npm run evals:runtime:benchmark-audit
node evals/research/runtime/benchmark-audit/plan.mjs prepare calibration 1
```

The combined adapter exposes 54 executable synthetic cases in 18 nominal
families. It excludes all 50 external candidates. Its schedule is reproducible
and pins both corpus freezes and input bytes, but has no model, budget, treatment
digests or live adapter. It is not an executable authorization. A full all-case
three-arm, three-repeat design would contain 486 responses; that is a size
calculation, not a recommended immediate run or a budget commitment.

[Verification record](runtime-preparations/2026-11-10-benchmark-research/README.md)
contains the QA outcome and command evidence. Passing these checks establishes
offline integrity and bounded behavior, not model capability or empirical uplift.
