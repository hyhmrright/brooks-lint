# Hard runtime benchmark preparation and verification

Date: 2026-11-10. Scope: authoring and offline verification only. No new
responding-model evaluations, API calls, CLI login tests, or skill tuning were
performed. Existing real-model answers and the earlier 81-answer review remain
unchanged.

## Delivered materials

- [36-case benchmark](../../../../evals/research/runtime/hard-benchmark/README.md):
  twelve distinct mechanism families, each with defect, protected and insufficient-
  information variants, executable multi-file source and case-specific rubric.
- [Design and family catalog](../../runtime-hard-benchmark.md): dimensions of
  increased reasoning demands, exact case mapping, limits and offline commands.
- [Prospective protocol](../../runtime-hard-benchmark-protocol.md): family-level
  split, frozen scoring, anti-leakage boundary and future evaluation conditions.

Four families (twelve cases) are calibration; eight families (twenty-four cases)
are reserved for development evaluation. All are public and same-workflow authored.
This is not an independent hidden benchmark. Human validation and book/source
mapping remain unverified. Structural reasoning demands have increased, but a
100-fold difficulty multiplier and empirical discrimination have not been measured.

## Review process

The eval-curator authored cases and executable checks. The parent reviewed example
inputs and requested less leading reserved workloads, fair acceptance of alternative
causal witnesses, and removal of hidden sibling/exact-trace requirements. A separate
QA agent in the same workflow reviewed all twelve families and ran the full offline
gate. These agents do not constitute independent authorship or human validation.

[Round 1](qa-findings-round1.md) failed semantic acceptance despite every automated
command passing. Its raw logs are retained. It found a batch-generation ABA bug in
a protected/unresolved supporting module, an optional-sink contract contradiction,
and incomplete static-import closure validation. These are benchmark defects,
not observed model mistakes, and must not enter model accuracy statistics.

[Corrections](corrections-round2.md) and [round 2 QA](qa-round2.md) close all three
findings. Final status: **PASS**. The final freeze SHA-256 is
`00fd5a575c0db2249b96103faec48e74914f2eadd0d5da00294e4fbc82b5b682`.

| Final command | Result |
| --- | --- |
| `npm run validate` | PASS |
| `npm test` | PASS: Node test components 6 + 914 + 75 = 995, plus custom validator checks |
| `npm run evals` | PASS: 64 structural scenarios |
| `npm run evals:runtime:prepared` | PASS: 541 + 75 = 616 tests |
| `npm run benchmark` | PASS: 30 frozen parser reports |
| Exact observation reproduction / cross-document consistency / diff whitespace | PASS |

New hard-benchmark checks are included in both test commands; these counts overlap
and must not be added as unique tests. Raw final logs and exit records live in
[round2/commands.json](round2/commands.json), with the original round retained.

Passing
offline tests establishes the tested fixture behaviors, consistency and export
boundaries. It does not establish exhaustive schedules, a security sandbox,
production correctness, model benefit or readiness of the old live executor for
these new case identifiers.

## Next-stage boundary

The corpus can be reproduced and exported offline. Connecting HB identifiers to a
real-model study needs a separately reviewed adapter and frozen execution plan.
Do not rename HB cases as HC cases or reuse the prior trusted plan digest. Start
with calibration only, select the model and budget with the maintainer, and keep
all failed attempts and raw answers. The reserved split must not be used for
skill tuning and then described as untouched evaluation data.
