# Broader diagnostic benchmark extension

Status: implemented offline, 2026-11-10. This extension adds 18 executable cases
in six families to the previous 36-case, twelve-family collection. It preserves
that collection's freeze and historical evaluations. No live model results exist
for this extension. Difficulty and comparative discrimination remain unmeasured.

## Diagnosis and design response

**Symptom:** the initial hard collection has one expected causal issue per defect
and concentrates on runtime lifecycle mechanisms. **Source:** its twelve-family
triad design deliberately simplified issue inventory and bounded execution.
**Consequence:** a correct overall verdict can hide partial multi-issue recall;
transactional consistency, authorization caching, deployment skew and weak test
oracles are poorly represented. **Remedy:** add distinct families with executable
controls, two multi-issue families with independently tested partial fixes, and
an annotation aggregator that separates known-issue recall from open-set findings.

This is an expansion of construct coverage, not a claim that every added fixture
is more difficult. Compact, transparent controls remain useful. More modules,
more words or a lower score do not alone establish a better benchmark.

| Family | Defect / protected / unresolved | What the executable checks establish |
| --- | --- | --- |
| Outbox delivery | BV-01 / BV-02 / BV-03 | Relay crash before marking sent can duplicate consumer effects; separately, producer crash can leave business state without an outbox row. Twenty-four batch order/partial acknowledgement/replay histories and partial fixes isolate both. |
| Cache publication | BV-04 / BV-05 / BV-06 | Delayed fill versus invalidation; reversed order and two invalidations distinguish protection from merely clearing a cache. |
| Tenant authorization cache | BV-07 / BV-08 / BV-09 | Both request orders with colliding tenant-local IDs and one global user with different tenant grants; distinct-ID benign control. The permissive completion enforces immutable tenant binding before cache access. |
| Checkpoint ownership | BV-10 / BV-11 / BV-12 | Revoked completion before or after current completion; atomic effect/checkpoint guard; current-epoch benign progress; eight batch histories include partial progress, callback reordering and duplicate callbacks. |
| Configuration rollout | BV-13 / BV-14 / BV-15 | Publish before, between or after endpoint/credential lookup; compatible and incompatible credential-overlap deployments. |
| Test oracle | BV-16 / BV-17 / BV-18 | Actual reference and two independent behavioral mutants; discount-only and rejection-only partial test fixes. |

The outbox and test-oracle defect cases each contain two independent issues.
The other four defect cases have one each: eight expected issues across six
new defect cases. Checkpoint effect and checkpoint drift are two consequences of
one missing atomic epoch guard, not two recall opportunities.

## Primary-source grounding

The [transactional outbox pattern](https://microservices.io/patterns/data/transactional-outbox.html)
explains both business-state/event atomicity and relay duplicate publication;
those become separate executable faults here. The implementation is original
synthetic code, not copied production code or a claimed real incident.

[PIT's mutation-testing explanation](https://pitest.org/) distinguishes executing
code from detecting behavioral faults. Here two explicit mutants are executed
against the supplied release test. This is a small mutation demonstration, not
running PIT itself, measuring all mutant classes or claiming exhaustive coverage.

[Jepsen's consistency-model guide](https://jepsen.io/consistency/models) grounds
the distinction between observed histories and the contracts that allow them.
The cache and checkpoint fixtures use bounded histories; they do not implement a
Jepsen consistency checker or prove distributed-system linearizability.

The [Kafka consumer documentation](https://kafka.apache.org/44/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html)
provides related offset/processing context. The checkpoint fixture is explicitly
an application-owned sink, not an implementation or verification of Kafka's
consumer protocol. No library API behavior is imported into the oracle.

The [Code Review Bench methodology](https://github.com/withmartian/code-review-benchmark/blob/main/methodology/full.md)
discusses incomplete gold inventories. Our rubrics therefore retain unexpected
findings for adjudication instead of automatically counting them as false alarms.
No third-party score or ranking is claimed to transfer to this suite.

Sources accessed 2026-11-10. These links ground design choices; they do not certify
our fixtures, book mappings, human review or empirical model difficulty.

## Scoring and validation contract

`scoreIssues` accepts already-reviewed issue annotations: matched, rejected,
pending, or novel-confirmed. Reviewers assign the same causal ID to duplicate
findings; the helper deduplicates it across each status and rejects conflicting
adjudications. It deduplicates matched causal IDs, rejects invalid
IDs/statuses, reports missing expected issues, and leaves recall undefined when
there are no expected issues. Finding one of two issues yields 0.5 recall, even
with a correct top-level defect label. Pending findings are not false positives;
resolved precision and bounds treating pending findings as either rejected or
confirmed are both reported. Novel-confirmed findings remain separate until a documented inventory revision
and uniform sensitivity analysis. This helper does not replace full semantic
assessment, severity, evidence or protected/unresolved certainty scoring.

Case manifests, rubrics, source modules, drivers, tests and observed evidence are
hashed. The borrowed path/import utility is pinned too. Allowlisted model exports
exclude IDs, kind labels, expected findings, drivers, observations and rubrics.
Tests reject symlinks, absent/escaping/imported evaluator paths, mutated inventories
and freeze drift. This authoring validation is not a hostile-code sandbox.

The authorization-cache uncertainty is about an enforced immutable one-tenant-per-ID
request binding, not global ID uniqueness. A global user may have different grants
in different tenants. The permissive evaluator completion verifies a frozen binding
table before every cache access and records rejected cross-tenant requests in both
orders. The alternative without that gate reproduces incorrect reuse for one global
user; the protected tuple-key implementation handles both orders correctly.

Every unresolved driver executes and records both compatible contract completions.
The restricted completion fails and the permissive one succeeds; changing a
contract or allowed schedule is explicitly labeled, never claimed to repair code.

The first two complete families are calibration; the remaining four are public
development-reserved. Do not split siblings across tuning and evaluation. All
cases were authored in the same workflow with existing skills/results available.
A reserved label does not make them independent, secret or contamination-free.

## Prompt-cue review after offline QA

The initial unresolved handoffs named the missing guarantee and enumerated both
expected alternative contracts. That supplied much of the answer and primarily
measured application of a scaffold. A subsequent author pass replaced all six
with engineering handoffs: concrete operation semantics, artifact boundaries and
component ownership. It removed verdict-shaped alternatives and instructions to
identify a pre-named missing fact. All 18 cases retain the same generic task.

`prompt-cue-audit.json` records each old/new context digest, retained operational
facts, the reasoning for the edit, and residual cueing. Validation binds that audit
to exact exported bytes; a regression rejects literal copying of an entire rubric
alternative into a context. These checks do not detect semantic paraphrase leakage
or establish that a model cannot infer a class from writing style. The per-case
rationales are same-workflow author review, not independent human validation.

The evaluator still requires supported conditional judgments, including the
correct immutable verified tenant binding in BV-09. Operational facts were not
removed to manufacture ambiguity. For example, rollout still documents its
boolean argument's acceptance semantics, and the pricing fixture still provides
its behavior and known mutants. These remain comparatively scaffolded probes.
Reducing direct answer cues changes the prompts and their freeze, not measured
model difficulty. Earlier QA records retain their inspected bytes and findings.

## Remaining limits

- The added modules are deliberately small and single-language. They are useful
  mechanism probes; they do not establish repository-scale search or multi-language
  capability. External sourced cases need separate licensing, provenance, context
  and oracle review before admission.
- Schedules are selected witnesses and benign controls, not exhaustive model
  checking or production-failure-frequency estimates.
- Unresolved cases omit a documented decisive contract. Their recorded failing
  observation is conditional on one completion; it is not proof of a definite
  defect under all compatible environments.
- Test-oracle cases visibly supply known mutants because their task is to judge a
  release gate's detection ability, not to discover hidden production bugs.
- No live executor adapter, model budget, model identity or model answers are
  asserted by this delivery. The existing live plan cannot be silently repurposed.
