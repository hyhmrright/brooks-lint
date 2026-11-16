# Focused review, audit and test instruction revision

## Evidence and limits

The [completed V5 report](../skills-benchmark-v5-recovery2/results/2026-11-14-completed/REPORT.md)
contains 324 answers from 36 authored development cases repeated three times. In
the three selected modes, generic checklist B versus supplied skill C scored:
review 18/18 versus 17/18 plus one pending; audit 18/18 versus 18/18; test 15/18
versus 15/18. All expected issues were recalled across all arms. Thus there is no
established incremental detection benefit for these modes, and audit is at the
measured task-completion ceiling. No new model execution occurred for this revision.

The earlier [all-skills report](../all-skills-results/2026-11-11-terra-low-campaign/report.md)
observed explanation/completeness gains against a case-only baseline, but those
comparisons do not establish superiority to a useful generic checklist. Its
collector correction is preserved; none of those results is rewritten here.

## Diagnoses before remedies

### Review: separate a counterexample from a governing obligation

- **Symptom:** V5 response `3bf0b470d551eb4090b9ef2d` to BV5-05 traced real sorting
  and duplicate behavior but scored a finding under ambiguous input-order wording.
  Other responses separated the protected cursor predicate from unknown caller
  preconditions. The historical annotation remains pending, not a confirmed false
  positive. The old guide also contained unconditional deductions for broad file
  counts and test-name/message patterns alongside later evidence calibration.
- **Source:** [The supplied contract](../../../evals/research/skills-benchmark-v5/cases/BV5-05/contract.md)
  says "unique ascending integer row" without resolving input versus output duty.
  Candidate-generation heuristics and proof requirements were dispersed across the
  guide. This is a plausible instruction-weighting problem, not causal proof from
  the historical trial.
- **Consequence:** A valid trace can be mistaken for proof that the traced behavior
  violates the reviewed function's obligation. Smell thresholds can create extra
  findings without demonstrated consequences.
- **Remedy:** Put an obligation → discriminating trace → repair-check chain first.
  Keep contrasting contract interpretations unscored when decisive ownership is
  unknown. Collapse repetitive smell lists into consequence-based checks; retain
  all six production risks and the bounded three-signal test check. Size and style
  thresholds become inspection cues rather than automatic deductions.

### Audit: move from a diagram to an actionable boundary explanation

- **Symptom:** B and C both passed all 18 V5 answers. In BV5-08, response
  `4b72be56fbc8a9ecf87d20ae` correctly distinguished a composition root importing
  domain and transport from the domain importing transport. BV5-09 answers kept an
  unnamed/unbound graph unresolved. These are capabilities already demonstrated
  by the generic baseline, not a discovered advantage unique to the skill.
- **Source:** [BV5-07's rubric](../../../evals/research/skills-benchmark-v5/cases/BV5-07/rubric.json)
  asks for the active edge, responsibility direction and justified composition
  remedy. The old guide spent substantial space on a decorative graph example
  and repeated scan lists, with less explicit direction for the changed ownership
  and edges a proposed remedy requires. It also assigned colors before seam/team
  findings were complete.
- **Consequence:** More diagram instructions can consume context without improving
  the decision or making a repair actionable. Premature colors can misrepresent
  later findings. A green node must not imply assessment of unseen code.
- **Remedy:** Replace the sample diagram with compact graph rules. Require a small
  edge-and-change witness: responsibility/rule, active binding or explicit source
  scope, concrete change consequence, and ownership/composition of the remedy.
  Color only after all checks and distinguish unassessed nodes. Keep testability
  seams, Conway checks and all risk categories, but require actual consequences.

### Test: preserve original-versus-mutant discrimination in the final answer

- **Symptom:** The V5 report identifies incomplete baseline/mutant comparisons in
  several test answers. Response `82753a8249aedbddc1dc44b8` to BV5-23 demonstrates
  the useful contrast: original assertions pass; a changed validation condition
  also passes them while accepting `7x`; the new rejection assertion distinguishes
  them. Other answers found real additional issues without completing that task.
- **Source:** [BV5-23's frozen rubric](../../../evals/research/skills-benchmark-v5/cases/BV5-23/rubric.json)
  requires paired mutation reasoning. The old guide emphasized this explicitly for
  brittleness but spread coverage-protection reasoning across long signal lists.
  BV5-24 also exposed ambiguity about a local smoke check's duty to propagate
  failures; the historical primary judgment and sensitivity remain unchanged.
- **Consequence:** Naming a gap or proposing a useful extra test need not establish
  what the existing test detects. Correct new observations can coexist with an
  incomplete assessment of actual protection.
- **Remedy:** Introduce a compact original/changed/proposed-check comparison for
  protection and brittleness claims. Distinguish production correctness, mutation
  detection and runner failure propagation. Keep local blind spots local when the
  suite inventory is unknown. Retain T1–T6, characterization and timing/seam checks,
  without automatic deductions from assertion counts, mock counts or pyramid ratios.

## What is being offered beyond a generic checklist

These are **testable value hypotheses**, not newly established effects:

| Mode | Focused contribution | What would count as useful evidence |
| --- | --- | --- |
| Review | Contract-bound causal witness and a narrow regression check | Better supported verdict/remedy without inventing obligations or extra findings |
| Audit | Concrete dependency/change witness and named remedy ownership | More actionable correct boundary reasoning than generic advice, with no new speculative violations |
| Test | Original/mutant discrimination and a check that separates them | More complete valid protection analysis, preserving behavior-equivalence and scope limits |

Do not count longer reports, book citations, exact formatting or an expected label
alone as skill superiority. Accept equivalent witnesses. Separate semantic value,
protocol compliance, unresolved claims and input/output cost. Audit may remain tied
because these cases already saturate; report that instead of expanding cases until
an advantage appears.

## Instruction footprint and preserved contracts

UTF-8 byte counts compare the parent commit `46a2a83` with this revision:

| Guide | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| PR review | 9,299 | 6,137 | 34.0% |
| Architecture audit | 9,232 | 5,831 | 36.8% |
| Test quality | 8,096 | 5,565 | 31.3% |
| Total | 26,627 | 17,533 | 34.2% |

These are guide bytes, not model tokens or whole-prompt savings. V5's assembly
included shared material beyond individual SKILL Setup lists; any future narrower
assembly must enumerate the required setup and applicable transitive references,
record its full input bytes, and disclose that assembly change as a historical
comparison confound. Do not silently drop shared scoring/source/risk contracts.

No new risk codes, source books, trigger descriptions or guide step numbers were
introduced. Architecture SKILL Process now assigns colors after Steps 2–6. No
changes were made to health, sweep, debt or shared framework files in this author
stage. Existing severity calibration and Iron Law remain authoritative.

## Bounded next decision

Recommend one frozen comparison using the existing six V5 cases per selected mode,
B generic checklist versus C revised instructions, one response each: **36 calls**.
Keep semantic-equivalent witnesses and known novel supported claims eligible.
Clarify genuinely ambiguous obligations only in a separately versioned fixture,
with an explicit diff; never revise historical labels, fixtures or annotations.
The eval stage owns exact model, budget, collection gates and stop rules.

A tie or regression ends this planned experiment: document that the generic
checklist is sufficient on these cases, retain supported simplifications, and move
on to release preparation. Do not automatically add cases, repetitions or follow-up
campaigns to obtain a positive result. Transport failures require an explicit new
recovery decision; they do not authorize automatic retries.

Changing these guides intentionally invalidates the previous bounded-health
2-smoke/56-formal source freeze, because its full static bundle includes these
files. Preserve that plan and its offline records as historical; do not reseal it
or present it as current live readiness. The focused retest must bind its own
sources. No live execution is authorized by this document.
