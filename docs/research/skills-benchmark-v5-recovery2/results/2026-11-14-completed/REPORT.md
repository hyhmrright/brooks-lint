# V5 complete 324-answer assessment

All125 new answers were individually read against all frozen case rubrics and supplied sources, then appended to the199 retained annotations without changing those objects. A is case-only, B is the generic checklist, C is supplied skill guidance. The tested configuration is gpt-6.1-terra / low, Codex CLI0.167.1, ChatGPT login. New semantic adjudication was performed by gpt-6-astra in the same workflow; no independent human ground truth is claimed.

## Completion and budget

Second recovery completed125/125 with no new failure; all324 answer slots now contain a successful response (108 per arm;18 per skill per arm). There were326 lifetime submissions, including the two historical transport-retry failures. Their original raw records and unknown usage remain preserved separately. No retry or new model call occurred during adjudication.

Cumulative observed usage is7,559,151 tokens; cumulative recorded execution time is7,593,795ms (about126.6 minutes), excluding human pauses. Both are within the frozen12M observed-token/12-hour limits. Unknown historical failed usage means this is not a complete billing figure.

## Completed-answer metrics

| Metric | A | B | C |
| --- | ---: | ---: | ---: |
| Primary complete task outcome | 63/108 (58.3%) | 89/108 (82.4%) | 87/108 (80.6%) |
| Semantic/protocol fail | 45 | 18 | 20 |
| Pending outcome | 0 | 1 | 1 |
| Frozen-label agreement | 98/108 | 94/108 | 95/108 |
| Expected issue recall | 48/48 | 48/48 | 48/48 |
| Expected issue misses | 0 | 0 | 0 |
| Task criterion credits | 110/162 | 136/162 | 135/162 |
| Evidence credits | 556/594 | 571/594 | 556/594 |
| Confirmed false defect claims | 6 | 6 | 3 |
| Other unsupported claims | 0 | 0 | 0 |
| Observed tokens | 1,556,383 | 1,557,895 | 4,444,873 |

Primary completion requires every expected issue and criterion, no false/unsupported/pending claims, exact finalizer delivery where required and correct sweep shape. Label agreement is not whole-answer accuracy. Valid novel findings remain outside expected recall and are not automatic false positives. Confirmed FP counts are grouped causal claims; every affected answer here has one such claim.

## Per-skill primary completion

| Skill | A | B | C |
| --- | ---: | ---: | ---: |
| brooks-review | 15/18 | 18/18 | 17/18 + 1 pending |
| brooks-audit | 12/18 | 18/18 | 18/18 |
| brooks-debt | 11/18 | 15/18 | 18/18 |
| brooks-test | 11/18 | 15/18 | 15/18 |
| brooks-health | 8/18 | 17/18 + 1 pending | 10/18 |
| brooks-sweep | 6/18 | 6/18 | 9/18 |

## Interpretation

- Review: C has17 passes and one pending versus B18; A15. The disputed input-order claim must not be silently treated as a proven false positive.
- Audit: B and C tie18/18; A12. Missing scoped remedies drive A failures. No incremental skill advantage over the generic checklist is established.
- Debt: C18/18 exceeds B15 and A11, chiefly in coordinated-change witnesses and appropriate remedies. This is a bounded task-completion advantage on these authored families, not general proof.
- Test: B and C tie15/18; A11. All expected issues are found, while baseline/mutant comparisons remain incomplete in several answers. Additional supported findings reveal frozen-oracle gaps.
- Health: C10/18 trails B17/18 plus one pending. Required final-report delivery is still unreliable: new C failures at ordinals296,303,305 combine with five historical failures. A8/18 often diagnoses correctly but omits requested remedies.
- Sweep: C9/18 exceeds A/B6/18, but all groups repeatedly return the wrong unknown-contract stop reason. All six new BV5-35 responses invent out-of-domain validation duties and propose unnecessary patches. Correct arithmetic or JSON alone does not prove successful repair.

C uses approximately2.85 times B observed tokens while completing two fewer primary tasks overall (87 versus89, with one pending each). This does not establish general skill superiority or cost-effectiveness. All arms recall48/48 expected issues, so the benchmark has a recall ceiling; the remaining separation concerns remedies, scope, evidence and workflow compliance.

## Individual decisions and uncertainty

`review-log.json` records every new response, credits and withheld reasons. Exact quotes and answer hashes are in annotations-new125.json; annotations-combined324.json contains the immutable199 objects plus those125. `assessment.json` is generated with the unchanged frozen assessor.

- BV5-05 C repeat3: the claim that sorting/deduplication is required has a real trace, but “unique ascending integer row” is ambiguous between an input restriction and output requirement. Marked pending, not a confirmed FP. Its strict-cursor protection is still described correctly.
- BV5-23: all three new answers identify supported additional local issues:7x rejection mutants, or overflow of309 digit nines toInfinity rather than an integer. No input-length limit is supplied. The overflow answer lacks the requested mutant/baseline comparison, so a correct novel observation alone does not complete that task.
- BV5-26 A/B repeat3: extra-field mutants pass the name and secret-absence assertions while violating the explicit name-only contract. These are supported novel test gaps, not false positives.
- BV5-27: all three new answers identify the previously recognized local record-retention gap. Audience permission and unseen-suite coverage remain unknown.
- BV5-24: retain the prior primary interpretation that a local smoke test should signal its own assertion failure. Two new answers score this local gap; the unresolved answer is not punished for refusing the normative claim. Missing baseline comparisons still lose task credit. Alternative smoke-test-duty interpretation should remain pending; no prior judgment is overwritten.
- BV5-34: four new responses wrongly extend finite-integer inputs toNaN/fraction/string rejection. The valid atomicity witness still earns both expected-issue credits; group source and test allegations as one false claim each. Two skill responses remain within the declared input domain.
- BV5-35: all six new responses make the same out-of-domain claim and return replacements on a protected case; each loses authorized-artifact and task-outcome.
- BV5-33/36: all twelve new answers appropriately avoid patching, but use no-actionable-findings instead of the frozen verification-blocked disposition for missing obligations. This is a workflow failure, not a wrong transactional/mutation diagnosis.

## Limitations and next evidence

These are36 same-workflow development cases in12 related families, repeated three times—not324 independent tasks. There are zero independent holdouts, no independent human judgments, unequal prompt lengths, and no native skill-discovery measurement. Current judge identity differs from the tested model; old judgments remain from prior sessions. Source-predicted witnesses and proposed replacements were not executed during this adjudication. No sandbox repair success is claimed.

The highest-value next work is to clarify ambiguous contracts before a separately frozen evaluation, retain generic-checklist controls, strengthen domain-precondition and unknown-contract stop handling, and fix exact finalizer delivery. Do not revise this round’s labels or responses to manufacture agreement.

## Reproduction

Restore original, first recovery and second recovery raw archives, then run the second-recovery verify and review commands in the parent README, using annotations-combined324.json as input. Compare the generated assessment byte-for-byte. `workflow-receipts.json` records exact decoded delivered/finalizer report hashes for every new health/sweep answer; mechanical receipts do not establish semantic truth. Collection/QA reports and raw archive are preserved alongside these judgments. No validation PASS is claimed here before a corresponding QA receipt exists.

## Sensitivity results

The separate copies in `sensitivity.json` preserve all primary judgments. Treating all seven scored BV5-24 smoke-duty claims as pending gives A63 passes/1 pending, B86/4 pending, C87/4 pending. Accepting the new pagination obligation gives C88/108 with no pending; rejecting it gives C87/108 with21 failures and one additional FP. This changes narrow arm ordering and reinforces the need for clarified obligations and independent review. The historical BV5-29 B optional-maintenance pending remains unchanged. Run `node docs/research/skills-benchmark-v5-recovery2/results/2026-11-14-completed/verify-sensitivity.mjs` from repository root to regenerate.
