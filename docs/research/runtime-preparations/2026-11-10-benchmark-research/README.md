# Benchmark research and extension verification

Date: 2026-11-10. No live model calls, login smoke tests or API evaluations.

Final status: **PASS**, [QA round 3](qa-round3/report.md). All five gates passed:
`npm run validate`, `npm test`, `npm run evals`,
`npm run evals:runtime:prepared`, and `npm run benchmark`.
The new suite has 67 passing tests and the audit/combined adapter has 4.
The full Node test groups total 1,066; prepared groups total 687 and overlap those
tests, so these totals must not be added as independent checks. Structural evals
remain 64; the parser corpus remains 30/30. Cross-document consistency passed.

Final v2 freeze SHA-256:
`ca113ba12942925bde84aa86e5f0566217ed938af47cfd6e1e40ffdc59362790`.
Saved calibration draft SHA-256:
`6d112be2f8d8918107bb804647574db1101903113e44b0910516fa5435f6284c`.
The draft has 18 calibration cases and 54 planned turns, with live execution
disabled and model/budget unset. It is not a model result or executable live plan.

## Scope

- Audited every existing HB manifest/rubric entry; preserved the original freeze.
- Researched primary sources across review, coding, reasoning, maintenance and
  runtime consistency. The [research report](../../runtime-benchmark-research.md)
  distinguishes author claims, local measurements and design decisions.
- Added the separately frozen 18-case extension and offline combined input adapter.
- Imported five MIT-licensed, pinned Code Review Bench metadata/label files,
  preserving all 50 candidates/173 labels and upstream warnings. None is admitted
  as a locally verified runnable case.

## Author review before QA

Parent inspection requested frozen-byte checking in exports, executed alternate
contract completions, independent partial fixes for multi-issue cases, stronger
composed outbox/checkpoint schedules, readable formatting, mutation controls and
explicit pending-finding precision bounds. These are author-stage corrections,
not claims of independent semantic validation. The evaluator remains a same-
workflow agent and the fixtures remain public synthetic development material.

## Semantic QA correction

[Round 1](qa-round1/report.md) failed despite all five automated gates passing.
BV-09 incorrectly treated globally unique identity as proof of tenant binding.
The saved reproducer shows a single global user can receive different grants in
two tenants and still encounter a cache-key collision. The author correction
requires an immutable, enforced one-tenant-per-ID request binding for the
permissive completion and a regression showing uniqueness alone is insufficient.
The failure and original inspected digests are retained for audit.

[Round 2](qa-round2/report.md) passed the corrected semantic and offline gates,
but documented substantial answer cueing in the six unresolved contexts. A final
author pass removes rubric-shaped alternative explanations from visible inputs
and retains natural operational facts. Round 3 verifies those new bytes and the
re-frozen schedule. Passing round 2 does not authorize using its superseded draft.

## Verification artifacts

The QA report and raw command logs in this directory record the final gate.
The case observation JSON files contain **simulated fixture executions**, not
model answers. The schedule draft contains planned turn identities, not executions.
No model identity, token spend, model accuracy or empirical difficulty is reported.

The historical 81-answer study and previous HB freeze are not revised. A later
live study must pin model/effort, budget, treatment content, isolation, adapters
and judge protocol. The offline schedule deliberately leaves these unresolved.

Prompt-cue audit current hashes were verified against current bytes. Historical
`beforeSha256` values are author-recorded: old context-file snapshots were not
retained for independent re-verification. Prior QA records and observed failure
evidence remain available, but do not establish custody of every intermediate
source byte. This limit does not affect the final frozen input hashes.
