# Runtime research fixtures: RT-01 / RT-02

Revision 1, authored synthetic development cases, 2026-11-06. These artifacts
implement the first pair in the [runtime pilot plan](../../../docs/research/runtime-pilot-plan.md).
No experimental skill, public risk code, runtime score, live runner, or model
results are introduced. Human review, book-source mapping, independent holdouts,
and the three-arm model comparison remain pending. Agent QA is not human review.

## Run offline

Requires Node.js 20 or later; no additional dependencies, network, authentication,
wall-clock sleeps, or model calls are used.

```bash
npm run evals:runtime:offline
# Also included in the repository's npm test command.
```

The command validates the manifest/rubric structure and executes deterministic
Node tests. Failure exits nonzero. It does not grade an AI answer or establish
model recall, precision, severity calibration, or real-world cancellation timing.
The first pair uses JavaScript ESM to run on the repository's existing Node runtime
without adding a TypeScript compiler.

## What is reproduced

Both services use the same caller-owned deadline, shared boundary, logical clock,
and cancellation-capable fake transport. Only the leaf's signal forwarding differs.
At logical time 100 the boundary returns `timed-out` and aborts its controller.
Each pending transport operation owns one synthetic slot.

| Case | Before deadline (time 0 and 99) | At deadline, before teardown |
| --- | --- | --- |
| RT-01 | Response pending, one active operation. | Response timed out and signal aborted, but one operation still active because the leaf dropped its signal. |
| RT-02 | Response pending, one active operation. | Response timed out, signal aborted, operation released, abort listener removed. No leaf timer is needed. |

The tests inspect cleanup immediately after the logical deadline callback and
again after awaiting the response. They also check success before expiry,
pre-aborted requests/signals, parent cancellation, timer/listener cleanup, and
continued resource retention after time advances in RT-01. Explicit `dispose`
cleanup happens only after measurements, so teardown cannot hide the defect.

Three mutants demonstrate that the protected-case oracle rejects dropped signal
forwarding, a transport that ignores abort, and cancellation of only an outward
promise while underlying work continues. These are test-local variants, not extra
model cases. The tests verify causal fixture behavior rather than the quality of
a future model's reasoning.

## Input and grading boundary

[`cases.json`](cases.json) defines schema/revision 1 and the two cases. Each entry
has an explicit `inputs` whitelist: task, context, its service, and shared clock,
boundary, and transport. Those files are the complete prospective review input.
The common context is an authored contract, not production evidence. The task is
identical for both cases and does not state the expected diagnosis.

Keep case metadata, kinds, expected snapshots, rubrics, tests, this README, and the
manifest out of any future model input. Case IDs remain visible in fixture paths;
this is not a blinding guarantee. A future harness can normalize paths if needed. In particular, never expose the whole
research directory as a model workspace. A future isolated runner must copy only
the selected input whitelist, preserving relative imports; that runner is not
implemented here. Ordinary service code differences remain visible by design.

Rubrics contain expected issue IDs, severity, the full
**Symptom → Source → Consequence → Remedy** diagnosis, forbidden claims, and
file/symbol evidence anchors. They are authored before any model run. Structural
validation checks that referenced files and anchors exist; it does not prove a
source establishes the diagnosis or score answer semantics.

- RT-01: one supported Warning for bounded resource retention after timeout.
  Critical impact, a request that never returns, or production-wide outage claims
  are unsupported. Do not count response timeout and leaked work as two issues.
- RT-02: no timeout/cancellation finding on the supplied call path. Missing a local
  timer is intentional because caller-owned cancellation is effective. This is
  protection of the authored behavior, not a general guarantee about production.

Manual assessment should compare causal meaning, not exact phrases, public risk
codes, formatting, citations, or a numeric score. Record unsupported findings,
missed issues, unlabeled or miscalibrated severity, and review disagreements
separately. Possible overlap with core findings remains unmeasured.

## Changing the artifacts

Use a focused PR against `research/domain-packs` and link the case ID and
[Discussion #45](https://github.com/hyhmrright/brooks-lint/discussions/45). Review
fixture behavior and rubric semantics together. Update the case/rubric revision
and documented schema contract if expectations change; preserve any future run's
exact artifact digests rather than rewriting prior results. The present validator
intentionally accepts only this first pair and revision, not a general pack schema.
