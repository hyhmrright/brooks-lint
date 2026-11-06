# Runtime research scoring protocol, revision 1

Status: prospective agent-authored scoring specification, 2026-11-06. Human
calibration and independent holdouts are pending. This protocol applies only to
future plans that explicitly pin its revision and digest. It does not rescore or
replace historical results, the existing importer, or the revision-2 runtime
prototype. The [RT-40 recheck](runtime-results/2026-11-06-terra-rt40-recheck/README.md)
explains why assessment correctness and evidence completeness must be separate.

## Freeze and review procedure

Before a live run, freeze the visible inputs, rubric, evidence requirements,
expected issue inventory, allowed severity, protocol, guidance and study plan.
Choose case/repetition triplets and all exclusions prospectively. Version changes
rather than silently revising frozen inputs. Do not use one composite percentage
as a substitute for the axes below. A future composite must be separately
predeclared, reproducible, and accompanied by all component counts.

Review exact answers without arm mappings where practical. Record reviewer/model,
method, authorship/exposure, answer hash, exact excerpts, rationale and uncertainty.
Compare causal meaning; no particular wording, formatting, risk code, citation,
Health Score, or execution of tests by the responding model is required. A valid
static trace can establish the same bounded behavior as an executed reproducer.
For supported findings, assess the Iron Law chain: **Symptom → Source →
Consequence → Remedy**. A named pattern or remedy alone is not an issue match.

Semantic annotations require a reviewer. Deterministic offline checks verify
schema, hashes, exact excerpts and arithmetic; they cannot establish that an
annotation is true. Retain disagreements and alternatives; do not infer semantic
truth from a valid JSON document. In a later human calibration exercise, each
reviewer labels examples before seeing the authored labels, then records and
resolves disagreements. These prepared labels are not a completed exercise.

## Separate measurements

| Axis | Count and denominator | Interpretation |
| --- | --- | --- |
| Execution | Executed, failed, interrupted and not-run turns / planned turns | A failed stream is an execution failure even with plausible partial text; preserve that text without semantic grading. |
| Review availability | Annotated successful turns / successful turns | Pending review is missing data, not a correct or incorrect answer. |
| Task completion | Reviewer-completed answers / executed, annotated answers | An executed but incomplete answer remains in this denominator and in eligible triplets. |
| Assessment correctness | Completed answers whose assessment matches the frozen case kind / executed, annotated answers | Defect, bounded protected behavior, unresolved, or requested explanation; uncertain certainty may be separately wrong even when a label matches. |
| Issue recall / issue false negatives | Distinct supported expected issue IDs found / expected issue IDs across defect answers; missed IDs / same denominator | Match each causal issue once. Evidence omission does not erase an otherwise established match. |
| Response miss rate | Defect answers missing at least one expected issue / eligible defect answers | Two missed issues in one answer count once here, twice at issue level. |
| Protected false defect rate | Protected answers with at least one definite unsupported defect assertion / eligible protected answers | Also report the total number of unsupported defect assertions, including those on defect and unresolved cases. |
| Unresolved certainty error | Unresolved answers with a definite unsupported defect or unconditional safety claim / eligible unresolved answers | Keep unsupported defect and unsupported safety counts visible. These do not enter the protected-case denominator. |
| Evidence completeness | Satisfied predeclared requirements / applicable requirements; also fully complete answers / eligible answers with requirements | A correct assessment can have incomplete evidence. Record each missing requirement explicitly. |
| Severity calibration | Explicit, canonical labels within the rubric's allowed set / applicable explicit labels | Report absent labels separately. Unsupported findings do not earn a supported-severity denominator. Explicit noncanonical labels are reported separately, without treating them as absent or silently mapping them to canonical labels. An absent label is not automatically wrong. |
| Supplementary output concerns | Counts of unsupported core labels, unsupported whole-codebase scores, scope overreach and duplicate findings / eligible answers | Keep concerns separate from defect assertions unless an additional affirmative defect was actually asserted. |

Rates with a zero denominator are `null`, never zero, one or 100%. Show numerator
and denominator with every rate. Report repetitions as responses, not independent
cases. Multi-issue cases retain their declared expected inventory and cannot be
reduced to one binary finding count. Deduplicate repeated descriptions of the same
cause; a restatement by layer or risk code does not increase recall or precision.
Unsupported extra defects can coexist with correct expected-issue detection.

Conditional statements such as “if the callee owns cleanup, this would violate
its contract” are not affirmative defect assertions when the answer explicitly
withholds that unprovided premise. A definite defect claim followed by a vague
caveat still needs review of the complete answer. A core label or score with
uncertain support is a supplementary concern, not automatically a new false alarm.
Supplementary annotations distinguish definite from uncertain concerns. Preserve exact excerpts and reasons for either; unresolved applicability is not a definite unsupported defect. Track reviewer uncertainty separately and show a sensitivity if it affects a
summary. Do not settle uncertainty through a keyword match.

The annotation `unsupported_safety` applies to unsupported or contradicted
unconditional safety assurances on any case kind, not just unresolved cases.
Report the global count with its exact excerpt and rationale. A false assurance
on a defect case can coexist with a missed expected issue; it does not enter the
unresolved-only certainty denominator.

Assessment matching alone is deliberately narrow: report unsupported certainty,
unsupported assertions and scope concerns beside it. A response that uses the
word “unresolved” while still asserting an unsupported outage is not a clean
result. No evidence of general safety or production impact follows from matching
a synthetic case label.

## Explicit-alternative threshold for unresolved cases

When a rubric requires contrasting contracts, full evidence needs all of:

1. The observed local behavior and the specific missing artifact.
2. At least two compatible completions of the missing contract or environment.
3. The judgment of the same observation under each completion, and why it differs.

Two different schedules are observations, not necessarily two contract
interpretations. Naming two possible owners or saying “it depends” can still be a
correct unresolved assessment, but does not satisfy requirement 3. A reviewer may
accept concise paraphrases, equations, diagrams or an unmistakable equivalent
comparison; do not require literal “rule A/rule B” wording. Requirements irrelevant
to a particular case must be absent from its denominator, not marked failed.
Use this explicit threshold consistently across arms. If a later reviewer prefers
implicit alternatives, preserve the original judgment and publish a labeled
sensitivity rather than selectively changing a case.

## Pairing, missing data and reporting

Primary A/B/C comparisons use only case/repetition triplets with all three
successful executions and semantic annotations. Completedness is not a pairing
filter: a successfully executed answer annotated as incomplete remains and fails
completion/assessment correctness. A failed stream, absent arm or pending review
excludes the entire triplet from the paired comparison; show each exclusion and
its reason. Also report individual-arm summaries with their actual denominators,
without presenting them as paired estimates. Never substitute a later recovery
answer silently; link it as a separately identified execution with its plan.

Report each axis on eligible paired rows and, separately, all individually
eligible rows. Keep execution and review coverage for the full plan visible.
Describe skill availability and observed reads separately. No paired difference
on exposed synthetic examples establishes causal benefit, production accuracy,
or successful independent validation.

## Calibration and candidate preparation

[Calibration examples](../../evals/research/runtime/calibration/README.md) contain
original authored answer snippets, semantic annotations and expected arithmetic.
They cover complete and incomplete evidence, correct restraint, false assertions,
severity, multi-issue misses, supplementary concerns, failures and pending review.
They are scoring training material, not observed model performance.

The planned [candidate set](../../evals/research/runtime/candidate-holdouts/README.md)
uses three new synthetic mechanisms, each with defect, protected and unresolved
variants: cancellation during awaited setup before listener registration;
asynchronous rejection after resource acquisition; and stale completion releasing
a replacement reservation. All are prepared in this exposed research session and
published with rubrics. Their status is **non-independent development candidates**,
not reserved holdouts. The existing 43-case runner catalog remains unchanged;
these candidates need a separately reviewed integration and fresh frozen plan
before any future live use. See the [participation and custody procedure](runtime-review-and-holdouts.md)
for what an actual independent set still requires.

## Offline implementation boundary

`npm run evals:runtime:prepared` validates the authored calibration counters,
candidate inventories and executable controls without model calls. The
[calibration helper](../../evals/research/runtime/calibration/README.md#offline-commands-and-pairing-api)
accepts a complete planned-triplet schedule to expose wholly absent executions.
Its record-only mode cannot infer missing whole triplets. It remains separate
from the historical importer. The separate prospective adapter below pins this
protocol and its annotation schema; future live use still requires a reviewed
execution path and explicit authorization.

## Separate prospective offline adapter

The [candidate study adapter](../../evals/research/runtime/prospective/README.md)
now freezes HC candidate inputs/rubrics, protocol/schema, scorer implementation,
core guidance and revision-2 prototype into a separate offline plan. It validates
recorded responses and reviewer provenance against a trusted plan digest, then
uses the complete schedule for the axes above. It has no live execution capability
or automatic authorization, and leaves the historical runner/importer unchanged.
Its synthetic selftests are arithmetic/ingestion checks, not model evaluations.
Candidate independence, human review and book verification remain unsatisfied.
