# Runtime research: source connections and transfer limits

Status: primary-source research, 2026-11-06. This ledger records why the remaining
candidate families deserve controlled experiments. It is not a book inventory,
verified book-to-finding mapping, human review, incident corpus, or model result.
All implementations are original synthetic JavaScript; no external code is copied.

## Sources inspected

| Source | Inspected section | Narrow connection and transfer limit |
| --- | --- | --- |
| [gRPC: Cancellation](https://grpc.io/docs/guides/cancellation/) | Overview; Cancelling an RPC call on the server side; Language Support | Cancellation can require cooperation by application work and downstream calls. Inspect each owned child rather than inferring cancellation from a parent signal. Language-specific propagation is not a guarantee for these JavaScript adapters. |
| [Google SRE: Handling Overload](https://sre.google/sre-book/handling-overload/) | Deciding to Retry | Per-request and client-wide retry controls address different scopes. The synthetic ten-request/two-extra-attempt window is our contract, not Google's numerical policy or a recommended universal ratio. |
| [AWS: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Reducing client complexity with idempotent API design; Retries and semantic equivalence; Same client request ID, different intent | Caller identity, atomic effect/token recording, compatible replay and parameter checks are distinct obligations. Stable identity alone is insufficient. The in-memory backend tests only its stated lifetime; it does not establish crash durability or distributed exactly-once execution. |
| [AWS: Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) | Retries and backoff; Jitter | Synchronized retry timing motivates controlled burst experiments. An injected spread is one deterministic schedule, not a probabilistic jitter guarantee or a substitute for admission limits. |
| [Azure: Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead) | Context and problem; Solution; Problems and considerations | Partition the resource that actually constrains progress, including connection pools. Distinct wrapper objects do not establish independent capacity. Compare total capacity and offered load across variants; no process-failure isolation claim follows. |
| [Azure: Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker) | Solution; Problems and considerations | Recovery admits limited work and distinguishes closed/open/half-open behavior; retry interactions matter. The fixture's single-probe threshold/cooldown is authored. Absence of a breaker is not itself a defect. |
| [Google SRE: Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/) | Load Shedding and Graceful Degradation | Reduced work can preserve useful responses when the product contract permits reduced detail. Test actual essential response content, rejection behavior and recovery. Degradation is not permission to return incorrect success or discard mandatory data. |

Links above identify live primary pages inspected on the stated date, not immutable
source snapshots. Section names support navigation; no page numbers or unverified
editions are asserted. The AWS timeout article redirects to
[AWS Builder Center](https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter).
The [candidate catalog](runtime-candidate-catalog.md) retains the broader source ledger.

## Evidence hierarchy

1. The visible task and context declare an authored behavioral requirement.
2. Whitelisted source supplies the mechanism and an inspectable causal path.
3. Offline tests execute that mechanism with controlled arrivals, failures and
   cancellation; state is measured before artificial cleanup.
4. A paired protected case meets the same relevant requirement with comparable
   capacity. Mutation tests demonstrate that the oracle rejects the defect.
5. An unresolved case omits decisive context. Private countermodels execute the
   same visible code with contrasting contracts or dependencies and compute
   different outcomes. They establish underdetermination, not a hidden actual system.
6. A rubric makes the expected bounded diagnosis reviewable. It does not independently
   validate itself. Human reviewers can challenge relevance, causal sufficiency and
   severity using the [participation procedure](runtime-review-and-holdouts.md).

A primary article motivates a question; it cannot replace steps 1–5 or prove a
particular defect, its severity, or production prevalence. No outage, memory/CPU
exhaustion or reliability percentage is inferred from synthetic occupancy counts.

## Research boundaries after this batch

The finite candidate inventory is implemented and exercised offline. This does
not exhaust runtime reliability: real drivers, operating systems, distributed
coordination, persistent deduplication, random traffic and production incidents
remain outside these experiments. Inventing more variants indefinitely would not
resolve the pending independence and relevance questions.

Keep the original guidance prototype at revision 1 while expanding the challenge
set. Adding fixtures is not evidence of prototype coverage or a reason to tune to
all expected answers. Any later guidance change must record a new revision and
freeze a new study plan. Existing development cases remain exposed; do not rename
them as independent holdouts. No live run or judging model is part of this work.

Autonomous offline work can continue when a concrete new mechanism, source-backed
question, counterexample or failing invariant is identified. External human review,
independent custody of holdouts and an explicitly authorized model study remain
separate gates; synthetic validator judgments cannot satisfy them.
