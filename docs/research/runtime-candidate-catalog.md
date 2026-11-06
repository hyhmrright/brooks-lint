# Runtime research: candidate case catalog

Status: implemented development inventory, 2026-11-06. All nine families in this
catalog are implemented as 27 authored fixtures, RT-11–RT-37. Together with the
original baseline, the [runnable development set](../../evals/research/runtime/README.md)
contains RT-01–RT-37 at manifest revision 7. The original sixteen case revisions
and guidance prototype revision 1 remain unchanged. No live model evaluation was run.

This bounded inventory is not exhaustive. The experiments are original synthetic
test designs, not copied programs or incident reproductions. References do not prove
diagnoses, severity or production impact. Authored or inspected cases remain
exposed development data. Human review, book mapping and independent holdouts
remain pending; see the [participation procedure](runtime-review-and-holdouts.md).

## Source ledger

These primary pages were inspected on 2026-11-06. Recheck sections when implementing.
This ledger changes neither the twelve-book inventory nor human review status.

| Key | Primary source and section | Narrow research connection |
| --- | --- | --- |
| S1 | AWS Builders' Library, [Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/), “Timeouts,” “Retries and backoff,” “Jitter” | Timeout coverage, retry ownership and side effects, and correlated retry timing. The timeout discussion includes connection setup and DNS/TLS coverage caveats. |
| S2 | Google SRE, [Handling Overload](https://sre.google/sre-book/handling-overload/), “Client-Side Throttling,” “Deciding to Retry” | Admission and retry limits can apply across requests as well as to one request. |
| S3 | Google SRE, [Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/), “Queue Management,” “Load Shedding and Graceful Degradation,” “Latency and Deadlines” | Queues, useful work remaining before deadlines, and protection under overload depend on workload requirements. |
| S4 | Microsoft Azure Architecture Center, [Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead), “Solution,” “Problems and considerations” | Resource partitions can contain contention, with granularity and operating-cost tradeoffs. |
| S5 | Microsoft Azure Architecture Center, [Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker), “Solution,” “Problems and considerations” | Open-state admission, limited recovery probes, and interaction with retries warrant distinct tests. |

S1 currently redirects to [AWS Builder Center](https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter).
No third-party code was imported. Future reuse requires a pinned revision, license
review, sanitization and recorded local execution; an article URL is insufficient.

## Candidate matrix

Planning IDs `Cxx-D/P/U` mean defective/protected/unresolved, not risk codes or
registered RT fixtures. C01 maps D/P/U to RT-11/12/13, and C02 to RT-14/15/16.
C03 maps to RT-17/18/19, C04 to RT-20/21/22, C05 to RT-23/24/25,
C06 to RT-26/27/28, C07 to RT-29/30/31, C08 to RT-32/33/34, and C09
to RT-35/36/37. Protection is path-specific. Unresolved variants need
private contrasting countermodels outside visible inputs. Numbers are proposed
fixture contracts, not universal defaults.

### Extend the current mechanisms first

| Family / source | Required visible contract | Defective candidate | Protected candidate | Unresolved candidate | Deterministic reproduction design and judgment boundary |
| --- | --- | --- | --- | --- | --- |
| C01: end-to-end deadline coverage / S1, S3 | One request has a 100-unit total budget including setup; clock and transport stages are explicit. | C01-D: reset the timer after 80 units of setup, permitting a 60-unit operation beyond the total budget. | C01-P: propagate the remaining 20 units and release work at the total boundary. | C01-U: show a local 60-unit timeout but omit the caller budget and setup policy. | Stage setup/work with a manual clock; assert timing, starts, aborts and active slots. Different local/caller limits alone prove nothing. |
| C02: expired work in a queue / S3 | Queued requests are useful only until their deadline; expired jobs must not start remote work. | C02-D: a request expires while waiting, then starts after capacity becomes available. | C02-P: remove expired entries and preserve FIFO order among live entries. | C02-U: omit whether queued work is a request or durable job that must finish. | Hold a worker, expire a queued request, then release. Count late starts and queue cleanup. Durable work need not expire. |
| C03: cancellation across fan-out / S3; proposed extension of RT-01/02 | A request owns three optional child operations; parent cancellation must release all three. | C03-D: forward cancellation to two children but drop it on the third. | C03-P: all children settle and release their owned resources after cancellation. | C03-U: omit ownership and whether the remaining child is deliberately detached durable work. | Cancel pending child transports; count starts, settlements, listeners and slots. Ownership must justify cancellation. |
| C04: aggregate retry budget / S2 | Ten simultaneous requests share at most two extra attempts in a fixed logical window. | C04-D: each request retries independently, exceeding the aggregate allowance despite its local cap. | C04-P: a shared budget admits at most two extra attempts and resets only at the specified window. | C04-U: expose local retry limits but omit aggregate allowance and admission ownership. | Script failures/completions; count attempts, consumed budget and rejected retries. This aggregate allowance is fixture-specific. |
| C05: ambiguous commit and retry / S1 | A logical write may commit before its response is lost; duplicate effects are forbidden. | C05-D: retry with a fresh operation identity, producing two effects after one lost response. | C05-P: preserve identity and use an explicit atomic deduplication contract, returning the prior result. | C05-U: omit backend deduplication and operation identity guarantees. | Commit then drop a response; retry, including concurrent same-key calls. Count effects/identities. Timeout does not imply rollback. |
| C06: correlated retry timing / S1 | A scripted burst of eight clients must not exceed two retry starts per logical slot under the fixture's schedule. | C06-D: identical fixed delays synchronize all eight retries into one slot. | C06-P: an injected deterministic spread satisfies the stated admission bound and total attempt cap. | C06-U: omit arrival timing, downstream capacity and any coordination policy. | Enumerate delays; count per-slot/total starts and cancellation timers. One schedule proves only that schedule; jitter alone proves neither safety nor defect. |
| C07: isolation below the wrapper / S4; proposed extension of RT-05/06 | Optional load must leave one transport slot available for an essential path, within the same aggregate resource cap. | C07-D: separate logical queues still share the saturated underlying transport pool. | C07-P: preserve an essential reservation at the actual scarce resource with the same total capacity. | C07-U: show distinct wrapper instances but omit their transport configuration and reservation contract. | Saturate optional calls, submit essential work, recover. Assert underlying counts/result/cap. Separate objects do not prove isolation. |

### Additional mechanisms authorized for offline research

The maintainer authorized completing the remaining autonomous research work,
including these two families. Their fixtures and rubrics expand the challenge
set; the frozen revision-1 prototype is unchanged. No prototype coverage or
integration decision follows from adding cases.

| Family / source | Required visible contract | Defective candidate | Protected candidate | Unresolved candidate | Deterministic reproduction design and judgment boundary |
| --- | --- | --- | --- | --- | --- |
| C08: bounded recovery probes / S5 | After a stated failure threshold and cooldown, permit one concurrent recovery probe. | C08-D: the cooldown releases all waiting callers, violating the recovery admission bound. | C08-P: admit one probe, reject others, then reopen on its failure or close on the specified success rule. | C08-U: omit the intended recovery concurrency and any external admission controller. | Advance cooldown after failures; submit simultaneous callers. Count probes/transitions/retry bypasses. Missing breakers alone are not defects. |
| C09: shedding and useful degradation / S2, S3 | Under a declared load schedule, an essential response must remain available; optional detail may be omitted, with an explicit degraded response contract. | C09-D: accept optional work until it consumes the capacity reserved for essential responses. | C09-P: reject optional work early and serve the permitted degraded response within the same capacity bound. | C09-U: omit whether optional data may be omitted and which requests have priority. | Script arrivals/costs/capacity; count optional admissions, essential results and rejection cost. Reject-all or incorrect success cannot satisfy protection. |

## Admission gate: when a candidate becomes runnable

Before calling a candidate runnable, require:

1. Original or license-cleared files, provenance, revisions and a task/context
   input whitelist. Exclude secrets, private data, tests and expected answers.
2. Contract-backed causal evidence. Defect rubrics follow **Symptom → Source →
   Consequence → Remedy**, calibrate severity to demonstrated impact, prohibit
   invented outages and deduplicate causes. Protected/unresolved rubrics specify
   forbidden certainty separately.
3. Offline primary/protected/mutation tests plus success, failure and cancellation
   cleanup: zero owned resources, listeners and timers. Use fake clocks and
   scripted transports; no network, real sleeps or live models.
4. Private countermodels proving unresolved visible inputs permit different outcomes.
5. Reviewed integration: the current validator accepts exactly thirty-seven cases. New IDs
   or holdout loading require implementation review; never bypass the validator.
6. Applicable offline checks and QA, then commit/push. Record implemented status
   only after passing; human semantic review remains separate.

The [runner](runtime-runner.md) supports all thirty-seven registered cases, including every family above.
Offline fake-CLI tests establish the tooling contract, not model behavior.
Changed fixtures/guidance invalidate frozen plans: freeze revisions and create a
new plan. Live evaluation requires separate explicit authorization.

## Completed scope and next evidence gates

C01–C09 are implemented with authored defect/protection/unresolved triples. The
remaining work is evidence review rather than unimplemented entries in this
catalog. See [source connections and transfer limits](runtime-source-notes.md)
for researched mechanisms, excluded claims and the limit of autonomous work.

Seek human review of an existing pair in parallel. Commission holdouts through
the custody procedure before exposing authors to this catalog where practical;
already exposed contributors remain useful with disclosure. Public research and
offline tests cannot satisfy independent validation by themselves.

## C01/C02 implementation research notes

Original deterministic JavaScript fixtures implement these designs; no external
program or incident trace was copied. [gRPC's Deadlines guide](https://grpc.io/docs/guides/deadlines/),
“Deadline Propagation,” was also inspected on 2026-11-06: it describes deducting
elapsed time when propagating a timeout. That supports the remaining-budget
question, not a claim that these JavaScript fixtures execute or test gRPC.
Google SRE's “Missing deadlines” and “Deadline propagation” sections motivate
checking whether queued request work is still useful when capacity arrives.
The numerical budgets, finite queues, synthetic traces and rubric severities are
our authored contracts and judgments; human review and book mapping are pending.

Verification commands for the expanded catalog: `npm run evals:runtime:offline`
and `npm run evals:runtime:research:validate`, plus the repository QA gate.
Offline execution demonstrates fixture behavior; it supplies no model performance
result or independent holdout evidence.

## C03–C09 implementation research notes

RT-17–RT-37 complete the seven remaining families using original synthetic code.
Source pages were rechecked on 2026-11-06; additional gRPC cancellation and AWS
idempotent API references are linked in the [source notes](runtime-source-notes.md).
The fixture README records executable behavior and countermodel boundaries.
Stable identifiers do not by themselves prove safe writes; spread schedules do
not establish probabilistic jitter safety; separate wrappers do not establish
resource reservations. Recovery probes and degraded responses are assessed only
against supplied contracts. Missing mechanisms alone are never findings.

All 37 cases are exposed development artifacts. Human relevance/severity review,
independent holdouts and model benefit remain unestablished. No production skill,
score, risk code, parser corpus or twelve-book inventory changes in this batch.
