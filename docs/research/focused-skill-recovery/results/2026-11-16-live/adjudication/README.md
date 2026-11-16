# Offline adjudication of the focused comparison

This is an append-only reassessment, not a new model run or a change to the
frozen prompts, answers, expected-issue inventory, or original annotations.
The original assessment remains in the parent directory. The corrections below
were made after seeing the outcomes and are not independent holdout validation.

## BV5-23: a supported novel observation

Symptom: C identifies a 309-digit unsigned decimal whose parsed result is
Infinity; the original review left the claim unresolved. Source: the supplied
contract says numeric strings must yield an integer and supplies no length
restriction; the parser accepts the entire digit string. Consequence: grammar
uncertainty for signs or exponents and uncertainty about representation were
incorrectly extended to a concrete all-digit input and its non-integer result.
Remedy: classify C's overflow observation as supported and clear the pending
claim. Whether a future fix uses BigInt, another representation, or a revised
bounded-domain contract remains a design choice; Infinity is not an integer
under any such representation choice.

The frozen protected label is too coarse: the two assertions are protected
against mutations of their examples, but the complete inventory misses this
boundary defect. Novel supported observations are already permitted by the
frozen scoring protocol. Do not add this issue to the expected-issue denominator
after observing the answers or count its omission as a newly frozen false
negative. B still fails the originally requested mutant-comparison axis: its
witness only runs the baseline. Its caution about numeric domain is not evidence
that the concrete overflow finding is false.

The suggested Number.isInteger check is a discriminating witness for the
current Number implementation, not a complete specification for a future
BigInt implementation. This limits the remedy without invalidating the diagnosis.

## BV5-24: accept the equivalent witness in B

Symptom: B was failed because it changes expected 7 to 8 rather than actual 7
to 8. Source: the axis describes a parser mutation, but the frozen rubric also
explicitly accepts behaviorally equivalent concrete witnesses. Consequence:
rejecting an AssertionError solely by where it is injected overstates the skill
advantage for the actual local obligation: a failed assertion must escape.
Remedy: accept B's baseline, changed assertion and stated catch-removal remedy.
Both mutations produce the same caught-success and uncaught-failure distinction.
This is not equivalent evidence about parser correctness; that broader contract
is explicitly unavailable. A literal parser-mutation-only sensitivity reading
would retain the old B failure, giving test B 4/6 instead of 5/6. The preferred
reading honors the frozen behavioral-equivalence allowance.

## Recomputed results and scope

| Skill | B generic primary passes | C skill primary passes |
| --- | --- | --- |
| review | 6/6 | 6/6 |
| audit | 6/6 | 6/6 |
| test | 5/6 | 6/6 |

All primary annotations are resolved. Frozen expected-issue recall remains 7/7
in each arm, with zero established false-claim answers. This does not measure
recall of every possible issue. The scorer now records a bounded gain for test,
no incremental gain for review/audit, and the overall practical-lift criterion
remains false. The sole preferred paired gain is BV5-23, not BV5-24. A single
pair in reused development-authored cases is insufficient for a general claim
that the skill is superior. No further live calls are needed to correct this
record.

Scope of additional review: the two arms for BV5-03, 06, 09, 12 and 21 were
checked for the same excessive-uncertainty problem. Their missing obligations
are explicit (identity/delivery, cursor protocol, module ownership, dependency
direction, persistence), unlike BV5-23's integer postcondition. No annotation
changes were made to those ten responses. This is a targeted spot check, not
an independent regrading of all 36 responses.

## Reproduction

From the repository root:

```
node docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/reproduce.mjs
node evals/research/focused-skill-recovery/review.mjs assess docs/research/focused-skill-recovery/results/2026-11-16-live docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/annotations.json /tmp/focused-adjudication.json
cmp /tmp/focused-adjudication.json docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/assessment.json
```

The first command runs trusted fixture code locally, with temporary directories,
per-process timeouts and no network/model calls. Its observations are stored in
`evidence.json`. These are post-run reviewer experiments, not model execution
receipts; the original answers correctly described their witnesses as unexecuted.
