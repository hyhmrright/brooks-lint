# Skill workflow repair and benchmark preparation

Date: 2026-11-12. This change follows the completed all-skills, three-skill and
health-tool studies. It contains no new real-model results and does not replace
their annotations or frozen records.

## Product decisions

Keep `brooks-sweep` as the convenience entry point requested by the maintainer.
The earlier sweep artifact failure was a collector defect, not a demonstrated
skill defect. The later bounded comparisons tied. Those observations do not
justify deleting the orchestration feature, but inspection identified real
instruction gaps:

| Symptom | Source | Consequence | Remedy |
|---|---|---|---|
| Sweep finishes four simplified passes and estimates health | Previous sweep Steps 2–5 and 8 | The promised convenience workflow does not finish the fifth skill | Load the focused guides and finalize health on the final snapshot |
| Overlapping findings lack stable causal ownership | Previous sweep state and scoring guidance | Duplicate global counts or deductions | Share a deduplicated ledger with one scoring owner per causal finding |
| Critical-only rounds bypass the cap | Previous sweep loop and shared configuration | Work can continue without a finite round bound | Count every round; stop on cap, no progress or user budget |
| No visible tests are treated as missing protection | Previous sweep T5 shortcut | Unsupported allegations | Preserve unknown coverage; require evidence of the specific local gap |
| Rollback assumes a clean, passing baseline | Previous sweep repair loop | Unrelated failures/work can be attributed to the sweep | Record baseline and preserve user patches; revert only owned changes |
| Text score contradicts calculation; scorer claims lack invocation | Health study answers | A plausible report can conceal failed finalization | Require receipts for tool-required tasks, retain incomplete status without a substitute score |

The parser accepts the sweep's final canonical composite block and retains legacy
`After` score support. A regression passes the health helper's actual final output
through the shipped report parser and rejects an additional contradictory score.

## Execution repair

The [routing investigation](health-workflow-v2/README.md) records the actual
model-name-dependent tool surface, reproduces the disabled-host blocker, and
verifies enabled-host scoring with CLI 0.167.1 and 0.167.2 against authored local
responses. A complete CLI installation is required: pin both the main executable
and `codex-code-mode-host`. The new adapter is prospective; the historical adapter
and result archives remain unchanged.

A separate host-rendered ledger workflow is implemented and tested. It is never
silently substituted into the dynamic-tool treatment. Both workflows establish
arithmetic consistency only; diagnosis, evidence and severity still need review.

## Benchmark changes

The [new development benchmark](skills-benchmark-v2.md) has 36 cases: 18 regression
cases and 18 challenges built from a shared ten-file repository family. Each
product skill receives defect/protected/insufficient-information variants in each
cohort. Challenges cover cross-route state, tenant cache separation, competing
authorization explanations, key collisions, reusable cache behavior and multi-file
repairs. Health includes source-to-ledger diagnosis rather than only supplied-score
arithmetic. Sweep requires all five phases and preserves the pre-existing failure.

The three arms are case-only, generic checklist, and supplied skill. The prepared
schedule has one response per case/arm (108 total); it is not a new collection of
108 independent problems. Report arm, skill and cohort separately. Separate
expected-issue recall, task criteria, evidence, false-defect claims, other unsupported
claims, pending claims, execution failures, artifact verification and observed usage.

Witness rules accept equivalent concrete causal demonstrations rather than one
exact numeric input or private variable spelling. Validation responsibility is
explicit. Missing contracts remain unresolved. A semantic review must supply
answer excerpts and reasons; deterministic schema/aggregation checks do not prove
the judgment itself.

These are same-workflow development cases, not independent holdouts. The challenge
tasks share a repository and mechanisms, and prompt lengths are not token-matched.
No higher difficulty, detection improvement or production effectiveness is claimed
before real evaluation. Author-written executable witnesses validate the fixtures;
they are not model answers. Model-generated replacements must not run directly on
the host. Native skill discovery, native editing and independent validation remain
separate capabilities, not implied by the supplied-guidance collector.

The collector is implemented and exercised through a full 108-slot authored
simulation. Its [offline archive](skills-benchmark-v2-results/offline-drill-r3/README.md)
contains raw records, simulated annotations and a reproducible report. Registration
checks the real probe, identity and source hashes; all arms receive the same tool
schema. First failure, unknown usage or exhausted budget stops further admissions.
Scorer receipts and unchanged output are separate mechanical outcomes, not inferred
from prose. Review summaries consume the sealed rubrics, not later file edits.

Semantic QA found a mislabeled protected test fixture: its original complete test
inventory did not cover delimiter collisions allowed by the contract. All six
protected challenge variants now test collisions, cross-route reuse, exact identity
and unauthorized reads. Mutation controls prove those tests reject delimiter-based
keys and disabled-cache pseudo-fixes. The initial simulation archive is retained
as superseded; revisions 2 and 3 include complete source snapshots for reproduction.
Revision 3 also fixes canonical-path CLI entry detection; reproduction through a
symlink must actually emit verification output and write the reviewed report.

## Next execution boundary

The [one-turn probe](health-workflow-v2/probe-plan.json) is prepared for
`gpt-6.1-terra / low`, CLI 0.167.1, 120 seconds, no automatic retry or continuation.
It must pass using the supplied ledger and draft, then its raw evidence must be
checked before a separately bound/authorized campaign. The 108-answer preparation
is not permission to run it. No real model request is part of this maintenance task.

See `workflow-repair-validation.md` for the completed offline verification gate.
