# Runtime research: book chapter verification

Status: agent-conducted primary-source check, 2026-11-06. This ledger accounts for
RT-01–RT-37 at manifest revision 7. Some mechanisms have inspected book-text
support; others have only a related heading or no verified book support. These
are source checks and explicit research inferences, not independent human review,
case certification, a new book inventory, or model evaluation.

## Verification levels

- **Text checked:** an authoritative, accessible chapter/extract was inspected for
  the narrow proposition recorded below. Applicability to a fixture is our inference.
- **Related text only:** inspected material addresses a neighboring concern but
  does not establish the fixture's specific protection mechanism.
- **Contents only:** the publisher lists a relevant section; its substantive text
  was not available in the inspected public extract. Mechanism attribution remains
  unverified, even when publication details are confirmed.
- **No verified book support:** no inspected passage establishes this mechanism.
  Complementary articles and the offline experiment remain separately useful.
- **Not applicable:** a task-routing control does not need a runtime book diagnosis.

For protected cases, a chapter connection is not proof that the implementation is
safe. For unresolved cases, it identifies an investigation topic, not permission
to infer missing callers, configuration, ownership or contracts. All findings
still need **Symptom → Source → Consequence → Remedy** from visible evidence.
The source of a finding's causal trace is the supplied code and contract; a book
reference supplies background rather than replacing that trace.

## Publication identity and access

All links were inspected on 2026-11-06. They identify mutable public pages, not
archived source snapshots. No purchased copy, authenticated library access or
third-party full-book mirror was used. No chapter text is copied into the repository.

| Key | Publication and authoritative evidence | What was verified; access limitation |
| --- | --- | --- |
| B1 | *Site Reliability Engineering: How Google Runs Production Systems*, edited by Betsy Beyer, Chris Jones, Jennifer Petoff and Niall Richard Murphy; O'Reilly, original 2016 edition. [Publisher record](https://www.oreilly.com/library/view/site-reliability-engineering/9781491929117/), [Google contents](https://sre.google/sre-book/table-of-contents/). | Publisher date is April 2016; the original contents locate chapters 21 and 22. Their Google-hosted text is publicly readable. This is distinct from the canonical *Software Engineering at Google*. |
| B2 | *Release It! Second Edition: Design and Deploy Production-Ready Software*, Michael T. Nygard; Pragmatic Bookshelf, January 2018, ISBN 9781680502398. [Publisher product/contents](https://pragprog.com/titles/mnee2/release-it-second-edition/), [publisher extract](https://media.pragprog.com/titles/mnee2/antipatterns.pdf). | Extract title/copyright identify the second edition and P1.0 January 2018; chapter 4 contains inspected text. The product page's generic `Edition: 1` field conflicts with its title; it is not used as edition evidence. The listed stability-pattern sections are not present in this extract. |

Google's [current books page](https://sre.google/books/) also advertises a rewritten
second edition of B1. This ledger deliberately refers to the original 2016
chapter structure at `/sre-book/`; no chapter numbers or conclusions are transferred
to the newer edition. Printed pagination was not checked for B1. B2's extract warns
that electronic and printed pagination can differ; use its URL and section rather
than asserting a page in an uninspected printing.

## Inspected passages and narrow propositions

The following short summaries describe source content. The later case matrix is
our application of these propositions to authored fixtures, not additional claims
that the books contain these cases or their expected answers.

| Passage key | Book location and access | Narrow proposition checked |
| --- | --- | --- |
| B1-R | [Chapter 22, “Retries”](https://sre.google/sre-book/addressing-cascading-failures/) — text checked | Retry layers can multiply attempts; consider request-wide and server-wide limits, error classification and randomized backoff. |
| B1-D | Same chapter, “Deadline propagation” and “Missing deadlines” — text checked | Carry the remaining budget across stages; expired request work may be useless. Checkpoint completion is an explicit exception. |
| B1-C | Same chapter, “Cancellation propagation” — text checked | Carry cancellation through the call tree to reduce unnecessary work. |
| B1-L | Same chapter, “Bimodal latency” and “Load Shedding and Graceful Degradation” — text checked | Limit shared-resource consumption; overload responses and reduced work depend on service needs. Degradation adds complexity and needs testing. |
| B1-Q | [Chapter 21, “Deciding to Retry”](https://sre.google/sre-book/handling-overload/) — text checked | Per-request and per-client budgets address different retry scopes. A nonretryable overload response can prevent higher-layer amplification. |
| B1-P | Same chapter, “Per-Customer Limits” and “Criticality” — text checked | Resource policies can distinguish customers and request importance. Batch and interactive work can have different tolerances; criticality and latency are separate dimensions. |
| B2-I | [Chapter 4, Integration Points → Socket-Based Protocols](https://media.pragprog.com/titles/mnee2/antipatterns.pdf) — text checked | Slow connection/read failures can occupy callers and reduce usable capacity. This socket/thread discussion motivates inspection; it does not establish JavaScript cancellation semantics. |
| B2-T | [Chapter 5 contents, Stability Patterns](https://www.oreilly.com/library/view/release-it-2nd/9781680504552/) — contents only | Timeouts, Circuit Breaker, Bulkheads and Shed Load are listed. Their detailed rules and exceptions were not verified from the inspected extract. |

Chapter 21 is written by Alejandro Forero Cuervo and edited by Sarah Chavis;
chapter 22 is written by Mike Ulrich, as identified in the linked chapter text.
Neither author attribution nor an inspected paragraph validates our severity choices.

## Case coverage and applicability record

Every ID is assigned to one row below. `D/P/U` means authored defect/protected/unresolved,
not a source-verification grade. Family links lead to the executable case overview.
The rightmost column records our fixture-specific interpretation and its limits.

| Cases and local topic | Source level for the mechanism | Application and exception to retain |
| --- | --- | --- |
| [RT-01 / RT-02 / RT-07](../../evals/research/runtime/README.md): timeout/cancellation D/P/U | B1-C text checked; B2-I related text | Returning from the boundary and releasing the actual operation are separate measurements. RT-02 needs no duplicate leaf timer. RT-07 cannot establish the hidden transport's behavior. |
| RT-03 / RT-04 / RT-08: retry ownership D/P/U | B1-R and B1-Q text checked | The local three-by-three trace, not a book example, establishes nine attempts. A shared owner is one supplied solution; RT-08 has no known outer owner or global allowance. Immediate retries remain a deliberately bounded fixture policy, not general production advice. |
| RT-05 / RT-06: capacity contention D/P | B1-L and B1-P related text; B2-T contents only for bulkheads | The resource-coupling concern is supported; the exact equal-capacity partition and queue reservation are authored. No inspected book passage certifies their implementation or process-failure isolation. |
| RT-09: finite offline batch P | B1-P related text only | The no-finding expectation follows from the supplied finite workload and contract. Distinct batch tolerances are background, not a book guarantee that batches never need deadlines. |
| RT-10: syntax/task-routing control | Not applicable | Respecting a syntax-only request is a task-boundary expectation; no runtime book citation is assigned. |
| RT-11 / RT-12 / RT-13: total deadline coverage D/P/U | B1-D text checked | Setup consumes the authored budget. RT-13 omits the total-budget contract. This does not make every local timeout wrong or mandate one universal timeout value. |
| RT-14 / RT-15 / RT-16: queued request expiry D/P/U | B1-D text checked | The fixture forbids expired request starts; FIFO and cleanup are additional authored requirements. Durable jobs and checkpoint obligations need different lifecycle rules, so RT-16 stays unresolved. |
| RT-17 / RT-18 / RT-19: owned fan-out cancellation D/P/U | B1-C text checked | Ownership is explicitly supplied in the pair and missing in RT-19. Deliberately detached durable work cannot be classified from parent cancellation alone. |
| RT-20 / RT-21 / RT-22: aggregate retry allowance D/P/U | B1-Q and B1-R text checked | The shared two-extra-attempt window is our contract, not Google's numerical policy. RT-22 omits allowance and ownership. |
| RT-23 / RT-24 / RT-25: ambiguous write/replay D/P/U | No verified book support for identity plus atomic deduplication | The [AWS idempotent-API article](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) is complementary non-book evidence. Protection is confined to the declared in-memory backend lifetime; backend semantics are absent in RT-25. |
| RT-26 / RT-27 / RT-28: correlated retry timing D/P/U | B1-R text checked for timing concern; related text only for the deterministic protection | The scripted spread is not randomized backoff and proves only the stated schedule. Book advice does not establish a universal per-slot bound or verdict when RT-28 omits arrivals/capacity. |
| RT-29 / RT-30 / RT-31: isolation below wrappers D/P/U | B1-L and B1-P related text; B2-T contents only for bulkheads | Actual underlying reservations remain a fixture-specific mechanism. Separate wrappers prove neither contention nor isolation without configuration; RT-31 withholds that configuration. |
| RT-32 / RT-33 / RT-34: bounded recovery probes D/P/U | B2-T contents only; no inspected book text establishes the half-open probe rule | The [Azure pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker) is complementary non-book evidence. One concurrent probe is an authored requirement, not proof every service needs a breaker. RT-34 omits the controller policy. |
| RT-35 / RT-36 / RT-37: useful degradation D/P/U | B1-L and B1-P text checked; B2-T contents only as an additional lead | Permitted detail omission and essential output content come from the supplied contract. Reject-all and incorrect success are not protection. RT-37 omits the priority/response contract. |

## Unverified references and remaining work

| Open item | Recorded status | What would resolve it |
| --- | --- | --- |
| B2 detailed timeout, bulkhead, breaker and load-shedding rules | Public contents verified; substantive sections unavailable in the inspected public extract | Inspect an authorized copy or a publisher/author extract containing those sections; record edition, actual section, relevant exception and access date. Do not treat the section name as proof. |
| Book grounding for RT-23–RT-25's atomic identity/effect/replay contract | Not verified in the inspected candidate books | Locate and inspect a precise authoritative book passage or retain the article-only basis. Broad data-integrity/consensus chapters are insufficient substitutes. |
| Exact reservation mechanism in RT-05/06 and RT-29–RT-31; deterministic timing protection in RT-27 | Related concerns checked, exact mechanisms not established by inspected book text | A narrower inspected passage could strengthen the source connection. The current causal experiment and limits stand separately. |
| Canonical twelve books | No new runtime chapter mapping asserted | The existing inventory describes maintainability/test principles. Do not relabel this runtime research as already covered by those books or add B1/B2 to the inventory without a separate decision. |
| Human relevance, exceptions, severity and overlap assessment | Pending for all cases | Use the [review record](runtime-review-and-holdouts.md); an agent's bibliographic check is not a reviewer sign-off. |

SRE chapters 23 and 26 were also checked as possible leads for write safety
([distributed state](https://sre.google/sre-book/managing-critical-state/),
[data integrity](https://sre.google/sre-book/data-integrity/)). Their broad subjects
are not accepted as verification of the specific RT-23–RT-25 deduplication contract.
This records a rejected inference, not a claim that the entire books lack relevant
material. AWS, gRPC and Azure pages in the [source ledger](runtime-source-notes.md)
remain articles/documentation; they do not become book chapters through citation.

The manifest/rubric revision-1 source-review fields and frozen prototype remain
unchanged: they record the original, incomplete certification state. This external
ledger records subsequent partial source checks without rewriting their study
inputs, revisions or digests. Before any source-derived guidance change, review the
applicability and exceptions, record a new revision and freeze a new plan. The
current live-evaluation hold, independent-holdout gate and human-review gate remain.
