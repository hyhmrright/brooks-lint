# Health tool retest — semantic review and results

The completed composite contains 48 answers, 24 in each arm, after two separately
preserved failed attempts. The raw verifier checked all 48 records and receipts.
The CLI-selected model was `gpt-6.1-terra`, effort `low`, CLI 0.167.1; this is
not independent provider-side model attestation. Observed completed-answer
usage totals 1,698,231 tokens (A 554,930; B 1,143,301), excluding unknown usage
from the two failed attempts. `annotations.json` records one same-workflow manual
judgment per masked answer, including exact excerpts, missing evidence, confirmed
wrong numerical headlines and pending allegations. All completed commentary was
also inspected; no additional substantive claims changed the dispositions.
`summary.json` is generated directly from these annotations and verified raw
records. Its schema validator checks quotations, provenance and arithmetic; it
cannot independently establish semantic truth.

A was the prior revised text-only guidance. B bundled revised guidance, ledger
instructions and an exposed host scorer. **No `brooks_health_finalize` calls were
recorded in either arm.** In B, 0/18 cases requiring a scorer call passed that
mechanical requirement; all 3/3 prohibited-call cases complied. Some B answers
said the scoring tool was unavailable or linked failure to a disabled code-mode
host. Raw events contain a general code-mode-disabled warning, but no scorer tool
call; these records do not establish that the scorer itself was unavailable, or
that a scorer invocation actually failed. The fake-upstream integration drill is
separate evidence of protocol wiring and does not resolve this live-run question.
Because the availability attributions are unresolved, they are recorded as pending
claims rather than assumed to be true or fabricated; the report marks affected
answers as pending even when other task requirements are visibly incomplete.
The requested tool-enabled workflow did not function in this run, so the study
cannot isolate the effect of a successfully used deterministic scorer.

| Measure | A: text only | B: tool enabled |
|---|---:|---:|
| Completed answers | 24 | 24 |
| Diagnostic expected findings recalled, AS-35 | 6/6 | 6/6 |
| Diagnostic evidence requirements, AS-35 | 0/9 | 0/9 |
| Task-criteria requirements completed | 9/12 | 0/12 |
| Task-criteria evidence requirements | 58/63 | 28/63 |
| Confirmed conflicting numerical headlines | 6 | 0 |
| Pending local input-validation allegations | 3 | 2 |
| Pending scorer-availability attributions | 0 | 21 |
| Fully supported task-criteria answers | 15/21 | 3/21 |
| Required scorer workflow passed | Not applicable | 0/18 |
| Prohibited scorer calls correctly avoided | Not applicable | 3/3 |

The six A headline errors comprise two AS-21 headlines of 78 despite body
arithmetic yielding 80, one SR-03 snapshot headline of 94 despite half-up 95,
and three AS-35 headlines of 95 despite the answer's own calculation rounding
95.8 to 96. The last three use an unresolved local-validation finding in their
ledger, so they are recorded as internal arithmetic contradictions, not as proof
of a correct overall project score. There are no confirmed invented risk findings
in these annotations; AS-35's affirmative local validation allegations remain
pending because the fixture does not assign responsibility for pre-validation.
Do not interpret the generic report's claim-precision fields as pure diagnostic
false-positive rates: its unsupported-claim count also includes wrong numerical
headlines. Its `protectedResponseErrors` for three B clean-ledger cases denotes
incomplete dashboard task completion, not invented code findings.

For AS-35 both arms named both expected findings in all three repeats. None
quoted the exact import declaration demanded by the frozen evidence rubric or
provided a concrete behavior-preserving rename/expression with the demonstrated
regex failure; generic assertions that a rename could fail are insufficient.
The per-dimension scoring requirement was also not fully supported: A's scores
included an unresolved local-validation allegation and contradictory composite;
B omitted scores when no scorer result was obtained. These strict evidence
requirements are distinct from expected-issue recall.

The two same-workflow boundary cases (SR-03 and SR-04) are reported separately:
A's task criteria were 2/3 and evidence 16/21; B's were 0/3 and 6/21. For the
six historical-development cases, A's task criteria were 7/9 and evidence
42/42, and B's were 0/9 and 22/42. AS-35, included in that cohort, adds the
separate 6/6 finding recall and 0/9 diagnostic evidence in each arm. Among 24
paired case/repeat comparisons, 3 were tied and 21 remained pending because of
unresolved tool-availability or local-validation claims. These are descriptive
review outcomes, not independent samples or statistical significance.

The overall observation is a failure of this configured tool workflow, coupled
with a narrower text-only arithmetic consistency problem. It does **not** show
that the scorer itself computes incorrectly, establish why the model did not use
the registered scorer, or generalize to other repositories. Both cohorts were
created in the same workflow and are not independent holdouts; repeat answers
are correlated, the reviewer had prior study exposure, and neither arm is a
contemporaneous no-skill baseline. Additional investigation should first inspect
tool exposure and model routing using offline evidence before another frozen live
study; no further real-model call is implied by this report.
