# Runtime failure containment: pilot research plan

Status: research in progress, 2026-11-06. The [RT-01–RT-43 offline fixtures](../../evals/research/runtime/README.md) are implemented with authored rubrics
and deterministic tests. A [research-only guidance prototype](../../evals/research/runtime/prototype/SKILL.md)
and [separate A/B/C runner](runtime-runner.md) are implemented and tested offline.
Partial [book chapter verification](runtime-book-mapping.md) is recorded with explicit
unverified mappings. Human review, complete source certification, independent
holdouts and actual live results remain pending. See the [domain-pack proposal](domain-packs-proposal.md)
and [Discussion #45](https://github.com/hyhmrright/brooks-lint/discussions/45).

## Research questions

Can a small runtime extension identify supported failure-containment defects that
the current core misses? Does it distinguish effective protection elsewhere in the
call path from an actual gap? Can it withhold unsupported claims when operating
context is missing, without using uncertainty to avoid a demonstrated defect?

The implemented cases use small synthetic JavaScript ESM services: three
request-driven pairs, incomplete-context controls, a finite offline batch, a
syntax-only task, deadline/queue triples, and seven further mechanism triples. They have explicit input
boundaries and run without transpilation on Node.js 20 or later. This replaces the initial TypeScript candidate for the
initial pairs so contributors can reproduce it with the repository's existing runtime.
Deterministic fake transport, scheduling, and resource counters reproduce the
failure mechanisms offline. TypeScript remains a possible later fixture language;
this is not a claim of cross-language coverage.

Security auditing, distributed transaction correctness, SLO design, broad
observability reviews, and automatic remediation are outside this pilot. Bounded recovery probes and contract-permitted degradation are now included as
controlled research cases. They are not requirements to add every pattern to
every service. Persistent distributed deduplication remains outside the tested
in-memory write model.

## Proposed fixture matrix

These are local study case IDs, not shipped risk codes. Author the full code,
configuration, caller context, and expected outcomes before evaluating guidance.

| ID | Scenario and supplied evidence | Expected assessment |
| --- | --- | --- |
| RT-01 | A dependency never completes; the request has a documented deadline, but no bound or effective cancellation reaches the call. A harness shows occupied resources remaining after request expiry. | Diagnose the evidenced deadline/cancellation gap and resource retention. Calibrate severity to supplied reach and impact. |
| RT-02 | Paired protected variant of RT-01: caller supplies a deadline, transport honors cancellation, and the harness verifies resource release. No redundant local timeout exists. | No timeout finding merely because the leaf function lacks its own timer. |
| RT-03 | Two layers each retry up to three total attempts on a deterministic dependency failure. The supplied contract permits at most three dependency attempts per request; the harness records nine. | Diagnose retry amplification and violated attempt budget; trace both retry owners. |
| RT-04 | Paired protected variant of RT-03: one retry owner enforces a shared budget and request deadline; a harness verifies both limits. | No finding based only on the presence of retries. |
| RT-05 | A slow optional dependency consumes a shared finite worker pool. A controlled concurrent test shows the essential route cannot obtain capacity despite its declared availability requirement. | Diagnose demonstrated resource coupling and the affected route. Do not assert a production-wide outage from a small test. |
| RT-06 | Paired protected variant of RT-05: optional work has a bounded separate pool, bounded queue, and explicit overload behavior. The essential route continues in the same controlled test. | No isolation finding solely because both routes run in the same process. |
| RT-07 | Only a leaf call is supplied; caller deadlines and transport cancellation semantics are unavailable. | State exactly what context is missing; do not assert unbounded production behavior or a clean bill of health. |
| RT-08 | Retry code is visible, but outer retry ownership and permitted request budget are unspecified. | Record the unresolved amplification question without inventing an outer retry layer or limit. |
| RT-09 | An offline, finite batch task has an explicit long-running contract, bounded concurrency, and no request-serving availability requirement. | No request-deadline defect inferred from long duration alone. |
| RT-10 | A user requests a syntax explanation for a networking snippet. | Answer the request without unsolicited runtime auditing or pack activation. |
| RT-11 | Setup consumes 80 units of a 100-unit end-to-end request budget; the operation gets a fresh timeout and finishes at 140. | Diagnose the demonstrated total-budget coverage gap, not an absence of all timeouts. |
| RT-12 | The same setup consumes budget; the operation receives only the remaining time and is released at 100. | Recognize effective end-to-end coverage without demanding redundant leaf timers. |
| RT-13 | Only a locally timed operation is visible; caller budget and setup coverage are unspecified. | Request the missing caller contract and coverage evidence; withhold both defect and safety verdicts. |
| RT-14 | Request-owned queued work expires before capacity is available but still starts later, against its supplied contract. | Diagnose the evidenced expired start and bounded wasted work. |
| RT-15 | Expired queued work is removed; remaining live work retains FIFO ordering and resources are cleaned up. | Recognize the supplied queue-expiry protection without banning queues. |
| RT-16 | Queue admission is visible but request ownership versus durable-job semantics are unspecified. | Identify the missing lifecycle contract; do not assume all delayed jobs should expire. |

| RT-17/18/19 | Owned fan-out cancellation; forwarding to two children versus all three; ownership unspecified in the unresolved variant. | Diagnose the specific retained child, recognize complete owned cancellation, or withhold verdict pending ownership evidence. |
| RT-20/21/22 | Local retry limits versus an explicit shared aggregate window budget; budget ownership omitted in the unresolved variant. | Count initial and extra attempts separately; do not invent an aggregate allowance. |
| RT-23/24/25 | Response lost after a write commits; fresh versus stable identity with explicit atomic deduplication; backend guarantees omitted. | Diagnose duplicate effects, recognize bounded replay protection, or identify missing backend semantics. |
| RT-26/27/28 | Identical retry delays versus a scripted spread under a declared per-slot bound; arrival/capacity policy omitted. | Evaluate the supplied schedule only; infer no probabilistic jitter guarantee. |
| RT-29/30/31 | Distinct wrappers sharing scarce transport versus an actual reservation with equal total capacity; backend configuration omitted. | Trace the scarce resource; object separation alone establishes neither protection nor defect. |
| RT-32/33/34 | Recovery admissions after cooldown versus a bounded probe; intended external recovery controller omitted. | Assess the explicit recovery contract; absence of a breaker alone is not a finding. |
| RT-35/36/37 | Optional work consuming essential capacity versus permitted degraded essential responses; priority/response semantics omitted. | Verify useful response content and bounded admission; reject-all is not protection. |

For RT-01, distinguish return-time limits from cancellation of underlying work.
For RT-03, the nine-attempt expectation follows from three total attempts at each
layer, not three retries plus an initial attempt. RT-05 must demonstrate contention
with controlled interleaving, rather than an unreliable wall-clock sleep test.

## Evidence and rubric artifacts

For each case, prepare:

- A task, fixture files, context provenance, and an explicit inspection boundary.
- An offline reproducer for positive cases and paired protected variants, with
  assertions on attempts, capacity, cancellation, or resource release as appropriate.
- Expected issue IDs, causal trace, acceptable severity range and supporting impact,
  forbidden claims, and acceptable unresolved assessments for incomplete cases.
- Verified source references, known exceptions, and overlap with existing core risks.

The dedicated [`evals/research/runtime/`](../../evals/research/runtime/README.md)
directory now contains three pairs: RT-01/RT-02 timeout/cancellation, RT-03/RT-04
retry ownership, and RT-05/RT-06 capacity isolation, plus RT-07/RT-08 incomplete-context
controls and RT-09/RT-10 finite-batch/syntax controls, plus RT-11–RT-13
deadline-coverage and RT-14–RT-16 queue-expiry triples, and RT-17–RT-37
fan-out cancellation, aggregate retry budget, ambiguous writes, correlated timing,
underlying resource isolation, recovery probes and useful degradation triples.
It includes a revisioned manifest,
semantic rubrics, and offline structural validation/reproduction tests. Run
`npm run evals:runtime:offline`; the same tests are included in `npm test`. These
checks verify fixture behavior and artifact structure, not model answers. The separate research runner now supports only this fixed development catalog;
its execution path is tested with a local fake CLI. The production paired runner,
structural suite and frozen parser corpus remain unchanged. Human review and book
source certification for all forty-three implemented cases remain pending;
[partial chapter checks and gaps](runtime-book-mapping.md) are recorded separately.

RT-03 reproduces nine downstream calls from independent three-total-attempt owners;
RT-04 stops at the shared request limit of three. Both honor caller cancellation,
so the defective case isolates amplification rather than adding a cancellation gap.
The offline tests cover transient/nonretryable failures, early success, exhausted
budgets, deadline expiry and cancellation between attempts, with cleanup checks.
RT-05 reproduces optional saturation rejecting one essential arrival through shared
admission capacity. RT-06 reserves bounded workers/queues for the essential route
with the same aggregate two workers and two waiting positions. Five optional arrivals
and one essential arrival are identical across the pair; optional overload is allowed.
Tests inspect occupancy before cleanup, verify recovery, success/failure/cancellation
release and queue removal, and reject shared-pool/excess-queue mutants.
RT-07 supplies only a signal-forwarding leaf, and RT-08 a locally bounded retry
owner with its helper. Both have an explicit unresolved rubric requiring missing
artifacts, conditional risks and no unsupported defect or safety verdict. Test-only
completions execute those same leaves with differing transport cancellation,
outer retry ownership and request budgets. Different measured outcomes demonstrate
underdetermination; no completion is asserted to be the actual hidden environment.
The completion code is excluded from each case's visible input whitelist.
RT-09 completes five finite batch records with two workers and per-item failure
handling, with no request deadline requirement. RT-10 verifies syntax behavior
and carries a task-only/non-trigger rubric; these offline checks do not establish
actual model routing restraint.
RT-11–RT-13 distinguish a timer that starts after setup from an end-to-end
budget, including a private alternative completion for unknown caller contracts.
RT-14–RT-16 distinguish request expiry from legitimate durable queued work.
Only visible evidence may justify a finding; private countermodels establish
underdetermination and are not assertions about a hidden production environment.
See the fixture README for exact input boundaries and mutation-sensitive oracles.

A contributor other than the prompt author should review expected outcomes before
live runs. Record who reviewed them; if independent review is unavailable, disclose
that limitation. Executable reproducers establish fixture behavior, while human
review remains necessary for diagnostic relevance and severity.

## Comparison design

Use the same natural task, fixture, model, reasoning setting, tool access, and
execution limits for three arms:

| Arm | Available guidance | Purpose |
| --- | --- | --- |
| A | No brooks-lint skills or experimental material. | Observe the model's unaided baseline. |
| B | Current six core skills at a recorded commit. | Measure current framework behavior. |
| C | The same core revision plus explicitly selected runtime prototype. | Measure incremental runtime contribution. |

Compare semantic diagnoses rather than requiring arm A to use Brooks formatting.
An overlap already caught by B does not count as added recall for C. Explicit opt-in
in C measures diagnostic quality; it does not establish automatic routing quality.
RT-10 separately checks restraint when no audit was requested.

The existing [Codex behavioral runner](../codex-behavior-evals.md) has a fixed
six-skill/empty-catalog isolation contract and paired execution. It cannot run this
three-arm study unchanged. The [separate research runner](runtime-runner.md) implements the A/B/C contract
without changing that catalog validation. It freezes inputs and rubrics, rotates
serial turns, preserves failures and generates arm-hidden semantic review packets.
Judgments are imported offline; no judging model is launched automatically.
Do not report its fake-CLI checks as live production-runner coverage.

Before any live run, freeze fixture, rubric, and prototype revisions, choose the
model and limits explicitly, and record the run plan. Live Codex evaluation is a
separate opt-in task; the current fixture work runs no model sessions or Anthropic
evals. Begin with one exploratory repetition, then use at least three fresh
repetitions per case and arm for a repeatability study if the pilot warrants it.
Rotate arm order across repetitions and use clean isolated sessions.

Capture model/CLI versions, exact prompts, content digests, tool-read evidence,
answers, run failures, and judgments. Preserve original failed runs; any recovery
must be labeled and reported separately. Keep private transcripts ignored and
share only reviewed, sanitized evidence. Any rubric or guidance revision creates
a new study revision rather than retroactively improving an old result.

## Measures and interpretation

Report per-case and per-arm results, denominators, disagreement, and run failures.
Use the same separate human reviewer or explicitly authorized semantic judging
procedure across arms, hide arm labels where practical,
and have a human inspect every finding and abstention in this small pilot. A judge
using the same model can share its mistakes; model judgments are not independent
ground truth.

| Measure | Definition |
| --- | --- |
| Supported-issue recall | Correctly identified expected issues / all expected issues, by case and arm. |
| Unsupported-finding fraction | Unsupported asserted findings / all asserted findings; show N/A for zero findings and report clean-case counts separately. |
| Context restraint | Counts of correct unresolved assessments and unsupported certainty on all manifest `unresolved` cases (RT-07/08/13/16/19/22/25/28/31/34/37/40/43), including false claims of safety. |
| Evidence completeness | Findings whose inspected locations and causal chain support the consequence / asserted findings. |
| Severity calibration | Findings with explicit severity within the frozen rubric's allowed range / labeled findings; track unlabeled findings separately. |
| Completion and routing restraint | Completed requested tasks, unsolicited audits on RT-10, and execution/judging failures. |
| Cost | Observed tokens where available and elapsed time, including failed attempts. |

Only complete, valid A/B/C triplets enter direct three-arm comparisons. Report
excluded triplets and their causes alongside results; failures cannot count as
successful restraint or evidence of improvement. Also show individual arm results
so exclusion does not hide a prototype failure pattern.

This deliberately small, authored set supports an engineering decision, not a
population accuracy claim. Reserve independently authored holdout examples before
tuning the prototype, and identify which examples were used in development.

## Milestones and decision gates

| Stage | Deliverable | Gate |
| --- | --- | --- |
| 1. Agree on scope | Reviewed matrix, ownership volunteers, source verification tasks. | Maintainer and participating reviewers agree what is demonstrated, protected, and unresolved. |
| 2. Build evidence | Fixtures, reproducers, frozen rubrics, and reserved holdouts. | Offline checks reproduce positive failures and protected behavior; expectations reviewed before prompt tuning. |
| 3. Prototype | Minimal opt-in guidance and isolated research execution support. | Scope, abstention, duplicate diagnosis, and report boundaries are explicit; repository checks pass. |
| 4. Evaluate | Authorized exploratory run, then repeated study if warranted. | Preserve all results and review each claim; report A/B/C differences and limitations. |
| 5. Decide | Linked decision record in the proposal. | Continue, revise, or stop using the criteria below. |

Continue to a broader prototype only if C demonstrates at least one supported
issue missed by B consistently across the repeated study, respects the frozen
protected/context-control expectations, and introduces no new unsupported findings
relative to B on this set. Examine holdout behavior before proposing integration.
An operational failure or any control violation requires investigation and a new
revision rather than selecting only favorable runs. These criteria justify further
research, not shipment or an accuracy guarantee.

If B already diagnoses all supported issues, investigate whether a pack provides
another measurable benefit before growing the framework. If C relies on invented
context, worsens restraint, or adds no useful coverage, narrow the proposal or stop.
Record negative evidence as carefully as positive evidence.

## How to participate

Start in [Discussion #45](https://github.com/hyhmrright/brooks-lint/discussions/45)
with a case critique, a source reference, or an offer to own a small artifact.
Useful next PRs include reviewing the implemented RT-01–RT-43 cases and prototype,
verifying source applicability, or authoring an independent counterexample. Follow
the [human review and holdout procedure](runtime-review-and-holdouts.md) before
sharing development material with a prospective blind author. Target `research/domain-packs` and link the case ID.
Review and follow-up implementation roles are open; no work is assigned to the
discussion author. The RT-01–RT-37 artifacts were agent-authored, with agent
QA kept separate from pending human review.

Before shipping any resulting feature, separately resolve pack discovery, public
risk identifiers, configuration, score semantics, parser/SARIF compatibility,
documentation, and maintenance responsibilities. Follow the normal repository
validation and release process; the research branch grants no release approval.

## Autonomous expansion boundary

All families in the [candidate catalog](runtime-candidate-catalog.md) now have
runnable development cases. The [source notes](runtime-source-notes.md) document
primary references and transfer limits. Case/rubric revisions remain 1, manifest
revision is 8, and prototype revision 1 is unchanged. New cases challenge the
existing prototype rather than establishing that it diagnoses those mechanisms.
Offline tests and synthetic judgments are not human review or model measurements.
Independent review, holdouts and any explicitly authorized live study remain open.

Manifest revision 8 adds the [RT-38–RT-43 dispute follow-ups](runtime-dispute-audit-v1.md#implementation-follow-up-manifest-revision-8): two defect/protected/unresolved
triples with explicit completion and rejection contracts. They derive from exposed
model-answer disputes; original-case revisions and historical metrics are preserved.
New-case book mappings and human adjudication remain pending. No new live study
was run while implementing these cases.
