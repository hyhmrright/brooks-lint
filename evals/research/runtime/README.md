# Runtime research fixtures: RT-01–RT-37

Manifest revision 7, case/rubric revisions 1, authored synthetic development cases, 2026-11-06. These artifacts
implement the first three pairs, deadline-coverage and waiting-expiry triplets, four incomplete-context controls, and the finite-batch/syntax controls in the [runtime pilot plan](../../../docs/research/runtime-pilot-plan.md).
The [runtime guidance prototype](prototype/SKILL.md) is research-only and remains
outside the production skills catalog. No public risk code, runtime score, or model
results are introduced. Human review, book-source mapping, independent holdouts,
and the actual three-arm model comparison remain pending. Agent QA is not human review.

## Run offline

Requires Node.js 20 or later; no additional dependencies, network, authentication,
wall-clock sleeps, or model calls are used.

```bash
npm run evals:runtime:offline
npm run evals:runtime:research:validate
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
establish model understanding. There are 68 fixture/prototype tests and 8 separate runner tests using a local fake CLI.
Both groups are included in the offline command and `npm test`.

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

## Incomplete context: RT-07 / RT-08

These controls are `unresolved`, distinct from both `defect` and `protected`.
RT-07 supplies only a signal-forwarding leaf; the caller contract, deadline owner,
and transport cancellation semantics are unavailable. RT-08 supplies a local
three-total-attempt owner and its helper, with no outer owners, transport retry
implementation, whole-request budget, or attempt trace. Their rubrics require
specific missing artifacts, why they matter, conditional reasoning, and withholding
both a definitive defect and a clean verdict. No severity is established.

Test-only countermodels execute the same imported visible leaf under different
completions. RT-07 uses the same deadline with a cancellation-capable transport
(active slots zero at expiry) or one ignoring abort (one slot retained). RT-08
produces three calls under one owner and nine under nested owners; nine violates a
separately supplied budget of three but respects a budget of nine. These completions
show that missing context can change the assessment. They do not select an actual
hidden environment or supply evidence to a future reviewer of the partial extract.
Tests also verify countermodel cancellation, cleanup, and rejection of metadata
mutations that erase missing-context obligations, invent certainty, or leak private
completion helpers into visible inputs. They do not grade a model's abstention.

## Finite offline batch: RT-09

The authored contract supplies a standalone five-record archive, two workers and
no interactive request SLO. Each operation settles after 1000 logical units; three
rounds finish the job at time 3000. No timer bounds the entire job, intentionally.
Long duration alone is no supported timeout/cancellation defect in this context.

Tests inspect the two-operation/timer bound through every transition, verify ordered
results and no residual work after completion, and select first/middle/last record
failures to show capacity is released and the remaining records still finish.
An unbounded five-at-once mutant is rejected even though it also completes finitely.
Logical duration is synthetic, not elapsed milliseconds or production evidence.

## Syntax task and routing restraint: RT-10

The task asks how `async`, `await` and an object-destructuring default behave in a
networking snippet. Tests verify that the returned promise waits for transport,
passes the signal, yields 17/zero/zero/null for the four stated examples, and
propagates the original rejection rather than substituting the default.

The rubric is `task-only`, with kind `non-trigger`, not a runtime protection verdict.
It requires completing the explanation without an unsolicited audit, risk finding,
score, remediation or prototype mode line. Separate structural checks verify that
the prototype description has a negative syntax boundary and that its Process cites
the sequential guide steps. Neither executable syntax tests nor structural guidance
checks establish a real model's activation restraint; that remains future evaluation.

## Input and grading boundary

[`cases.json`](cases.json) defines schema 1 / manifest revision 7 and thirty-seven cases. Each entry
has an explicit `inputs` whitelist: task, context, its service, and shared clock,
boundary, and transport for the first two pairs; retry cases also include the retry
helper. The resource pair includes its pool and optional-work implementation instead.
RT-07 includes only its task, context and leaf; RT-08 additionally includes the
retry helper. The countermodel callers/transports remain test-only. RT-09 includes
its task, context, service and logical clock; RT-10 only its task, context and snippet.
RT-11–RT-13 include the staged deadline helper and logical clock. RT-14/RT-15
include the expiring-queue adapter, pool, work adapter and clock; RT-16 supplies
only its bounded queue and work adapter, not the private lifecycle contracts.
Those files are the complete prospective review input for their respective cases.
The common context is an authored contract, not production evidence. The task is
identical within each pair and does not state the expected diagnosis.

Keep case metadata, kinds, expected snapshots, rubrics, tests, this README, and the
manifest out of any future model input. Case IDs remain visible in fixture paths;
this is not a blinding guarantee. The separate [research runner](../../../docs/research/runtime-runner.md)
copies only this whitelist, preserving relative imports, and the selected A/B/C
skill catalog. It never exposes the entire research directory, hidden completions
or rubrics in a review workspace. Ordinary service code differences remain visible
by design. Input isolation is not a hermetic host filesystem boundary.

Rubrics contain expected issue IDs, severity, the full
**Symptom → Source → Consequence → Remedy** diagnosis, forbidden claims, and
file/symbol evidence anchors. Unresolved controls instead have no expected findings
or protected verdict; their rubrics specify missing-context and reasoning obligations. They are authored before any model run. Structural
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

- RT-07: unresolved timeout/cancellation assessment; request the caller contract,
  deadline wiring, transport cancellation semantics and runtime observations.
- RT-08: unresolved whole-request amplification/budget assessment; request outer
  owners, transport attempt behavior, request budget and attempt evidence. Visible
  local retry bounds alone establish neither a violation nor global protection.
- RT-09: no request-deadline finding from the finite offline job's long duration.
  Two workers, finite item settlement and per-item error handling meet its contract.
- RT-10: complete the requested syntax explanation without runtime activation.
  This is a task boundary control, not a claim that the unseen production path is safe.

Manual assessment should compare causal meaning, not exact phrases, public risk
codes, formatting, citations, or a numeric score. Record unsupported findings,
missed issues, unlabeled or miscalibrated severity, and review disagreements
separately. Possible overlap with core findings remains unmeasured.

## End-to-end deadline coverage: RT-11 / RT-12 / RT-13

The explicit total100 contract includes setup80 and work60. RT-11 arms a fresh
100-unit timer only after setup: it remains active at total100, succeeds at140,
and cancels its unused local timer (which otherwise expires at180). This is a
bounded coverage violation, not absence of a timer. RT-12 arms the total boundary
at entry and releases work at100 after80 setup and20 work. Both retain early
success, phase-failure and parent-cancellation cleanup.

RT-13 supplies only a leaf with a local60 limit. Private tests run that identical
leaf after80 setup: without an outer boundary it reaches its local timeout at140,
violating a privately supplied total100 contract but satisfying a permitted160
budget. A third caller supplies an effective total100 boundary. The test clock
orders equal-time callbacks by registration: the local deadline precedes the
work-completion callback at140. None of these private completions is the hidden
case truth. The correct assessment requests caller start/budget, outer cancellation
and usefulness evidence without assigning a defect, safety verdict or severity.

Tests assert at-boundary response, actual active phases, final logical time,
parent listeners and timers, including pre-abort, setup/work failure, early success
and setup/work cancellation. A reset-after-setup mutant fails the protected
boundary even though its work eventually finishes. Rubrics permit one Warning
for RT-11, protect RT-12 only on the supplied path, and require abstention for RT-13.

## Waiting expiry: RT-14 / RT-15 / RT-16

One worker and two waiting slots are fixed in both full-path variants. At0 a
blocker starts, B queues with expiresAt5, and C queues with expiresAt30. The driver
advances to10 and releases the blocker. RT-14 ignores expiry: B starts at10,
delaying C despite B's expired usefulness. RT-15 removes B at5 without starting
dependency work, so C starts at10. The contract concerns waiting admission;
running work retains its separately owned cancellation lifetime. Bounded overload
is allowed, and finite queueing is not itself a finding.

RT-16 exposes only finite FIFO admission. Private countermodels run the same code
and observe B's start at10 and completion: an expiring request contract with
usefulUntil5 is violated; a durable accepted-job contract requiring exactly-once
completion is satisfied by that trace. The tests derive those judgments from the
recorded start/completion and separately supplied contracts. Missing ownership,
expiry policy and upstream context prevent either definitive diagnosis for the
visible case. Durable jobs are not automatically required to expire with callers.

Offline tests cover early/at-boundary and multiple waiting expirations, FIFO among
live entries, finite overload, active success/failure/cancellation, queued and
pre-aborted cancellation, cleanup, and an ignore-expiry mutant rejected by the
protected oracle. No result is inferred solely from an outward promise: starts,
queued/active occupancy and cleanup are measured. Rubrics allow one Warning for
RT-14, protect RT-15's waiting-admission behavior and require unresolved RT-16.
Input whitelists exclude tests, rubrics and private countermodels for all six cases.

## Changing the artifacts

Use a focused PR against `research/domain-packs` and link the case ID and
[Discussion #45](https://github.com/hyhmrright/brooks-lint/discussions/45). Review
fixture behavior and rubric semantics together. Update the case/rubric revision
and documented schema contract if expectations change; preserve any future run's
exact artifact digests rather than rewriting prior results. The present validator
intentionally accepts only these thirty-seven cases and revisions, not a general pack schema.

## Research execution and independent contributions

The [research runner](../../../docs/research/runtime-runner.md) supports offline
validation, frozen plans, explicitly opt-in A/B/C execution, blind review packets
and offline judgment import. It is verified with a fake CLI; no actual model
comparison has been run. The production paired runner remains unchanged.

See [human review and independent holdouts](../../../docs/research/runtime-review-and-holdouts.md)
for source-verification records, reviewer disclosures, a neutral author brief,
private custody and digest freezing. Those participation gates remain pending.

## Remaining candidate families: RT-17–RT-37

The development catalog now implements all nine currently cataloged families.
This is a bounded source-informed inventory, not every possible runtime scenario.
All new files are original synthetic programs; primary references inform the
questions, while the context files define the exact numerical and lifecycle
contracts. The source ledger is in the [candidate catalog](../../../docs/research/runtime-candidate-catalog.md).
The existing sixteen case revisions and revision-1 prototype are unchanged.
Recovery probes and degradation are expanded catalog scope; listing and executing
cases does not demonstrate that frozen prototype guidance diagnoses them.

| Family | Defect / protected / unresolved | Offline observation and judgment boundary |
| --- | --- | --- |
| Fan-out cancellation | RT-17 / RT-18 / RT-19 | Cancelling the owning request leaves one child slot versus zero. Detached durable work needs a different lifecycle contract. |
| Aggregate retry allowance | RT-20 / RT-21 / RT-22 | Ten failing requests start twenty attempts versus twelve under the fixture's shared allowance of two extra attempts per 100-unit window. Local caps alone do not decide an unspecified aggregate policy. |
| Ambiguous committed write | RT-23 / RT-24 / RT-25 | Lost response followed by retry records two effects versus one. Stable identity needs atomic backend deduplication; cancellation after commit cannot imply rollback. |
| Correlated retry schedule | RT-26 / RT-27 / RT-28 | Eight simultaneous retries peak at eight versus two per logical slot. This injected schedule is not a statistical jitter or arbitrary-traffic guarantee. |
| Underlying transport isolation | RT-29 / RT-30 / RT-31 | Distinct wrappers over one saturated pool overload the essential call; a real reservation preserves it under the same aggregate cap of two. |
| Recovery probe admission | RT-32 / RT-33 / RT-34 | Three post-cooldown callers start three versus one recovery operations. Missing a breaker alone is not a diagnosis; the contract defines transitions and concurrency. |
| Useful degradation | RT-35 / RT-36 / RT-37 | Optional admission without the reservation overloads the essential request; shedding one optional call preserves the exact permitted degraded payload. Omitting required data can instead be a defect. |

`expansion.test.mjs`, imported by `runtime.test.mjs`, executes every new case.
It checks contract observations against the manifest, success/failure/cancellation
and pre-cancel paths, listener/timer/admission cleanup, window/cooldown boundaries,
concurrent identity deduplication and conflicting payload rejection, commit-before-
cancel semantics, stale recovery completion, and the actual degraded payload.
Seven causal mutations replace each protected mechanism with its defective peer;
the protected criterion must reject the resulting observation. Structural mutation
tests reject kind/outcome drift, answer/test input leakage, absent uncertainty
requirements and evidence anchors that do not exist.

Every unresolved case executes private contrasting environments outside the input
whitelist. They compute contract satisfaction from actual starts, settlements,
effects, peak counts or payloads. They establish that the visible extract is
insufficient; they do not disclose or assert an actual hidden production setup.
`expansion-spec.json` is a private fixed-schema contract used by the validator,
not model input or a holdout. Changing accepted cases or loading holdouts still
requires reviewed implementation changes.

All defect rubrics allow one Warning with contract, causal evidence, bounded
consequence and remedy after diagnosis. Protected rubrics constrain the protection
to the supplied path. Unresolved rubrics require missing artifacts and prohibit a
definitive defect, safety or severity verdict. Human review, book mapping and
independent holdout validation remain pending. No live model evaluation was run.
