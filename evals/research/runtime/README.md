# Runtime research fixtures: RT-01–RT-06

Manifest revision 3, case/rubric revisions 1, authored synthetic development cases, 2026-11-06. These artifacts
implement the first three pairs in the [runtime pilot plan](../../../docs/research/runtime-pilot-plan.md).
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
The fixtures use JavaScript ESM to run on the repository's existing Node runtime
without adding a TypeScript compiler.

## Timeout and cancellation: RT-01 / RT-02

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

## Retry ownership: RT-03 / RT-04

The retry pair has the same task, authored read-only contract, caller deadline,
signal forwarding, retry helper, and manually settled dependency. The whole
request permits three total downstream attempts: initial call plus two retries.
RT-03 has two independent three-attempt owners; an exhausted inner transient
failure remains retryable to the outer owner. RT-04 has one owner and a one-call
leaf. The transport never retries internally. No backoff is required by this
bounded study's explicit immediate-retry policy.

| Case | All calls fail transiently before deadline | Deadline after two transient failures |
| --- | --- | --- |
| RT-03 | Nine dependency calls (3 × 3), then error; violates the global limit of three. | Third call cancelled; three calls total, zero active slots/timers/listeners. |
| RT-04 | Three dependency calls, then error; budget respected. | Third call cancelled; three calls total, zero active slots/timers/listeners. |

The tests drive failures one at a time, asserting each observable attempt transition.
Bounded promise-reaction draining waits for that transition; an event-loop checkpoint
exhausts reactions when checking that cancellation cannot restart work. Neither uses
elapsed-time sleeps. Additional controls cover immediate success, success on the
third attempt, nonretryable failure, pre-aborted callers, parent cancellation, and
cancellation between a failed call and its retry continuation. Cleanup is inspected
before promise delivery and after settlement. No teardown is needed to obtain these
retry-case outcomes.

Budget mutants show that the RT-04 oracle rejects nested ownership and an off-by-one
four-attempt owner. Manifest mutation tests reject changed expected counts, missing
visible inputs, rubric leakage, and incomplete causal diagnoses. These tests do not
establish model understanding. There are 49 offline tests across all six cases.

## Capacity isolation: RT-05 / RT-06

Both variants have two workers and two waiting positions in aggregate. The same
controlled arrival sequence submits five slow optional requests without settling
them, followed by one essential request. Essential work uses no optional dependency;
the authored contract requires it to succeed under optional saturation when no
other essential work is present. Optional overload rejection is allowed.

| Case | Optional occupancy before essential arrival | Essential result |
| --- | --- | --- |
| RT-05 | Two active, two queued, one rejected; both routes share the same pool. | `overloaded`; no worker or waiting position is available. |
| RT-06 | One active, one queued, three rejected; the other worker and waiting position are reserved for essential work. | `ok`, value 17, while optional work remains active and queued. |

The protected result follows from capacity reservation within unchanged totals,
not extra resources. Pools use bounded FIFO admission and immediate overload results.
Manual dependency success, failure and cancellation drive release and admission on
promise settlement. Tests verify active and queued cancellation, pre-aborted callers,
listener cleanup, overload, and essential recovery after optional occupancy ends.
A signal-aware dependency owns the active cancellation listener; queued entries own
a pool listener until admission or cancellation. No timers or sleeps are introduced.

The RT-06 oracle rejects a shared-pool wiring mutant and an excessive optional
queue mutant. The latter can still serve essential work, but violates the authored
bounded optional admission expectation; checking essential success alone is insufficient.
Synthetic slots do not demonstrate production CPU, socket or memory exhaustion,
process failure isolation, or availability under unlimited essential traffic.

## Input and grading boundary

[`cases.json`](cases.json) defines schema 1 / manifest revision 3 and six cases. Each entry
has an explicit `inputs` whitelist: task, context, its service, and shared clock,
boundary, and transport for the first two pairs; retry cases also include the retry
helper. The resource pair includes its pool and optional-work implementation instead.
Those files are the complete prospective review input.
The common context is an authored contract, not production evidence. The task is
identical within each pair and does not state the expected diagnosis.

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
- RT-03: one supported Warning for retry amplification violating the three-total-
  attempt request budget. Nine calls arise from three total attempts per owner,
  not three retries plus initial calls. Do not split the same issue by layer.
- RT-04: no retry-budget or cancellation finding on the complete supplied path.
  A single owner and effective caller cancellation meet the authored contract.
- RT-05: one supported Warning for optional saturation rejecting an essential
  request through shared admission capacity. Do not split worker and queue coupling
  into duplicate findings or infer a whole-process outage.
- RT-06: no resource-isolation finding on the supplied path. Bounded optional
  rejection and reserved essential capacity meet this contract in one process.

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
intentionally accepts only these six cases and revisions, not a general pack schema.
