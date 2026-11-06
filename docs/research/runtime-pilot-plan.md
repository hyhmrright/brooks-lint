# Runtime failure containment: pilot research plan

Status: proposed study, 2026-11-06. No fixtures, experimental skill, or live results
are delivered by this document. See the [domain-pack proposal](domain-packs-proposal.md)
and [Discussion #45](https://github.com/hyhmrright/brooks-lint/discussions/45).

## Research questions

Can a small runtime extension identify supported failure-containment defects that
the current core misses? Does it distinguish effective protection elsewhere in the
call path from an actual gap? Can it withhold unsupported claims when operating
context is missing, without using uncertainty to avoid a demonstrated defect?

The first candidate scope is request-driven dependency calls in small synthetic
TypeScript services. Use deterministic fake transports, scheduling, and resource
counters so the intended failure mechanisms can be reproduced offline. The language
is a bounded starting point, not a claim of cross-language coverage.

Security auditing, distributed transaction correctness, SLO design, broad
observability reviews, and automatic remediation are outside this pilot. Circuit
breakers, backpressure, and load shedding remain possible follow-ups rather than
requirements to add every pattern to every service.

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

Store these in a dedicated research fixture directory proposed as
`evals/research/runtime/`. The directory is not created yet and existing runners
do not discover or support it. Keep the current structural suite and frozen parser
corpus unchanged. A subsequent implementation PR must define the schema and offline
validation before adding experimental execution support.

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
three-arm study unchanged. A later PR must add and test separate research execution
support or a clearly isolated harness; do not bypass its catalog validation or
report experimental runs as supported production-runner coverage.

Before any live run, freeze fixture, rubric, and prototype revisions, choose the
model and limits explicitly, and record the run plan. Live Codex evaluation is a
separate opt-in task; this documentation work runs no model sessions or Anthropic
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
Use the same separate semantic judge across arms, hide arm labels where practical,
and have a human inspect every finding and abstention in this small pilot. A judge
using the same model can share its mistakes; model judgments are not independent
ground truth.

| Measure | Definition |
| --- | --- |
| Supported-issue recall | Correctly identified expected issues / all expected issues, by case and arm. |
| Unsupported-finding fraction | Unsupported asserted findings / all asserted findings; show N/A for zero findings and report clean-case counts separately. |
| Context restraint | Counts of correct unresolved assessments and unsupported certainty on RT-07/08, including false claims of safety. |
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
Useful first PRs include an RT-01/02 reproducer pair, an RT-03/04 rubric, or an
independent counterexample. Target `research/domain-packs` and link the case ID.
All roles are currently open; no contributor has been assigned work.

Before shipping any resulting feature, separately resolve pack discovery, public
risk identifiers, configuration, score semantics, parser/SARIF compatibility,
documentation, and maintenance responsibilities. Follow the normal repository
validation and release process; the research branch grants no release approval.
