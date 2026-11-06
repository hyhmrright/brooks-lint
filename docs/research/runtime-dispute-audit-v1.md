# RT-02 / RT-12 dispute audit, revision 1

Date: 2026-11-06. Status: agent-authored code and contract review with deterministic
reproduction; **not human adjudication or a new model study**. No live evaluation
was run. This supplement preserves manifest revision 7, both revision-1 contracts
and rubrics, all frozen answers, judgments and historical metrics. It identifies
limitations in their interpretation rather than silently changing the ground truth.

## Evidence and conclusions

The inputs are the original [model answers](runtime-results/2026-11-06-terra-37/results.json),
[semantic review](runtime-results/2026-11-06-terra-semantic-review/README.md),
[RT-02 contract](../../evals/research/runtime/RT-02/context.md),
[RT-12 contract](../../evals/research/runtime/RT-12/context.md), and their supplied
shared implementations. The eight `dispute RT-` tests added to
[runtime.test.mjs](../../evals/research/runtime/runtime.test.mjs) reproduce the
observations below. They characterize the existing code, including undesirable
behavior; a passing characterization test does not certify that behavior as correct.

### RT-02: completion and delivery are different events

**Symptom:** B's answer says that completion at logical time 99 can still yield
`timed-out`. Reproduction confirms it: call `completeAll(42)` at 99, then call
`advanceTo(100)` in the same JavaScript turn without awaiting. At 99 the transport
has `completed=1`, `active=0`, but the boundary result is unset and one deadline
timer remains. At 100 the response is `timed-out`. Awaiting the response before
advancing instead returns `{status: 'ok', value: 42}` at 99 and removes the timer.

**Source:** `FakeTransport.completeAll` resolves the dependency Promise
synchronously; `startRequest` records success in its later Promise reaction.
`ManualClock.advanceTo` runs timer callbacks synchronously and does not insert
Promise checkpoints. The contract requires successful completion before expiry
to return its value, but also says Promise delivery is observed through `await`.
It does not require the harness to await before every clock advance. The rubric's
blanket protected classification fails to distinguish these interpretations.

**Consequence:** Under the literal transport-completion interpretation, B found
a supported synthetic wrong-response defect, not a false positive. Under an
explicit Promise-delivery interpretation, the result can be correct. Cancellation
of pending work remains protected in both traces: there is no retained transport
slot in the disputed completion trace. This is not evidence about a production
event loop, sockets, memory leaks, or outage frequency.

**Remedy:** Split the next study into explicit completion-time, delivery-time and
missing-semantics contracts. Do not add a timer, an arbitrary microtask flush, or
change the fake clock globally just to make the frozen protected rubric pass.
A real completion-time implementation needs an observable completion timestamp or
synchronous settlement signal; a delivery-time contract can keep the current
implementation. Keep those implementation designs distinct.

Audit disposition: B's causal observation is correct. Reject a categorical
false-positive label for it. RT-02 is an unreliable blanket protected control
until its success semantics are specified. Reassess **all A/B/C answers** under
any new interpretation: accepting B under completion-time semantics could also
make A/C's broad protection claims incomplete. Do not only upgrade B while
retaining the old expected-issue denominator.

### RT-12: rejected scheduling inputs and exception cleanup

**Symptom:** A's answer conditionally raises invalid `setupDuration`. With `-1`,
`NaN` or `Infinity`, `handleRequest` throws `Invalid delay` after installing one
deadline timer and one parent abort listener. Both remain at 99 and are removed
at 100; an earlier parent abort also removes them. No request handle is returned.
An invalid `workDuration=-1` is a separate path: the handle is returned, but
`advanceTo(80)` throws from the setup callback; the operation remains active with
one deadline until advancing to 100 resolves `timed-out` and cleans up.

**Source:** `startStagedRequest` acquires resources before `ManualClock.schedule`
validates its duration; neither initial nor subsequent scheduling has an exception
cleanup boundary. The supplied context establishes the standard 80/60 trace but
does not establish a caller validation precondition or an invalid-input policy.
The rubric's generic reference to "failures" is broader than its tested injected
`failPhase` failures, which do pass through `finish`.

**Consequence:** Resource retention and escaping exceptions are reproducible,
but a contract violation depends on invalid durations being in scope and on the
required cleanup timing. The original total deadline still bounds cleanup if
the harness continues advancing. This is not an unbounded leak; nor does the
experiment establish how a real caller handles an exception. It would be equally
unsupported to invent an upstream validator or assume untrusted durations exist.

**Remedy:** State the accepted input domain and rejection behavior in the next
case. For a rejection-safe adapter, validate both durations before acquisition;
the offline control rejects invalid inputs with zero timers/listeners and allows
zero durations. For a generic fallible scheduler, separately specify cleanup on
scheduling exceptions rather than claiming duration validation handles all possible
scheduler failures. Do not change the frozen service before preserving the evidence.

Audit disposition: A explicitly says the gap is conditional and asks whether the
input is in scope. That is a supported conditional observation, not a definite
false positive or proof of a definite original-contract violation. B/C's bounded
standard-trace conclusions remain supported. This supplement does not assign new
composite case scores or replace the historical uncertain judgment.

## Proposed next-study contracts and grading

These six designs are **not registered runner cases**. Their identifiers below
are design labels, not RT IDs. None may be passed to the current `--case` option.
Prepare and version their visible inputs and private rubrics before freezing a
live plan. They are exposed development probes, never independent holdouts.

| Design | Explicit visible contract | Expected judgment and evidence |
| --- | --- | --- |
| Completion defect | Completion means synchronous transport settlement at logical time `<100`. The harness may advance directly to 100 without a Promise checkpoint. Use the existing boundary. | Defect: show completion 99, zero occupied slots, still-pending boundary, timeout wins at 100. Diagnose wrong response, not failed cancellation. |
| Delivery protected | Success means boundary Promise reaction execution before 100. Timeout wins if success has not been delivered by 100; same-turn advancement is permitted. | Protected for this ordering: the same timeout trace complies. Check ordinary awaited success and pending-operation cancellation; do not demand completion-time semantics. |
| Completion unresolved | Both completion and response delivery are shown, but the required winner is deliberately unspecified. | Identify the missing arbitration contract; explain both outcomes conditionally. Neither unconditional safety nor definite violation is supported. |
| Rejection defect | Invalid setup/work durations are in scope. Reject them before acquiring resources; rejected calls leave zero owned timers/listeners. Use the existing unvalidated service. | Defect: initial setup rejection retains timer/listener; invalid work is accepted initially and later throws. Distinguish both paths and eventual deadline cleanup. |
| Rejection protected | Same invalid-input contract, with the pre-acquisition validation adapter. The supplied clock only rejects negative/nonfinite delays. | Protected: invalid values reject with zero resources; finite nonnegative values, zero, normal success, timeout and cancellation behave as specified. Do not invent arbitrary scheduler failures. |
| Validity unresolved | Standard values and scheduling validation are visible, but accepted input domain and rejection policy are absent. | Identify missing validity/cleanup contract. Conditional reproduction is welcome; do not count it as an affirmative unsupported finding. |

Before implementation, review the distinction between desired domain behavior and
synthetic scheduler behavior. The delivery and completion variants intentionally
change the contract, not just code quality. The rejection pair intentionally keeps
the contract constant and changes validation. Record these factors in the plan so
an observed difference is not attributed solely to runtime guidance.

Required offline coverage before registering those variants: both RT-02 orderings;
completion exactly at 100 with a stated tie rule; no completion before timeout;
parent cancellation and successful cleanup; negative, nonfinite and zero durations
in both phases; normal setup/work success and total timeout; rejection with no
resources; insufficient-context cases retaining their missing information. Existing
characterizations cover the disputed paths and controls but do not implement this
entire proposed six-case catalog.

Grade diagnosis separately from completion, evidence, severity and formatting.
For each arm, report expected-issue recall on the two defect designs, false positives
on the two protected designs, and contract-aware restraint on the two unresolved
designs. Report raw counts and denominators; conditional reasoning is not a false
positive merely because it explores an excluded or unspecified path. Require an
exact answer excerpt and evidence for each finding. An unresolved answer can still
fail for unsupported certainty or failure to name the missing contract. Use the
same reviewer procedure for all arms and preserve disagreements.

Use identical natural tasks and visible inputs within each A/B/C comparison,
rotated execution order, fresh isolation, one explicitly selected model/reasoning
setting and preferably three repetitions per case: six cases × three arms × three
repetitions = 54 calls. Repetitions are not independent new cases; show per-case
consistency and descriptive paired changes, not a population accuracy estimate.
Failed executions and incomplete triplets remain visible and are excluded from
paired denominators; never turn a failed call into restraint. Record model, CLI,
source commit, input/rubric/prototype hashes, tokens, elapsed time and failures.
Changing the model does not make these exposed cases independent holdouts.

## Runnable work now and handoff for a later model

The supported commands below run offline and do not select or launch a model:

```bash
node --test --test-name-pattern='dispute RT-' evals/research/runtime/runtime.test.mjs
npm run evals:runtime:offline
npm run evals:runtime:research:validate
```

The current runner can freeze a new plan for the **unchanged 37-case catalog**
with an explicit model name. The new six-design study first requires registered,
versioned fixtures/rubrics and corresponding runner validation. Do not present a
37-case repeat as a test of these new contracts. See the
[runner contract](runtime-runner.md) for supported plan/live commands. No model
name is chosen and no live command is executed by this audit; the maintainer will
switch/select the model before the next authorized study.

For the historical study, preserve all previous files and label its rates as
frozen-rubric results subject to these two contract disputes. If a revised historical
analysis is desired, freeze an interpretation first, re-review every affected arm,
store new judgments with provenance and revised expected-issue denominators, then
publish a sensitivity comparison alongside the original. New-contract answers
must be analyzed as a separate study. Neither this audit nor a later model score
establishes human validation, real-world benefit or readiness to ship the skill.
