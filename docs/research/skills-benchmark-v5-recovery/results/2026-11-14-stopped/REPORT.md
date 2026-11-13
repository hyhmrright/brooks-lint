# V5 recovery: individual assessment of 199 completed answers

All 121 new answers were individually read against the frozen task, supplied source, operational rubric and assessment policy. Their exact full-answer quotations and hashes are in `annotations-new121.json`; `annotations-combined199.json` preserves the original 78 annotation objects without alteration. The unchanged frozen assessor accepted all 199 judgments. This is same-workflow AI-assisted semantic review, not independent human ground truth. No live model calls or candidate-code execution were performed during adjudication.

The recorded selection was `gpt-6.1-terra / low`, Codex CLI 0.167.1, using ChatGPT login. This is client-selected metadata, not independently attested backend identity. A is case-only, B is a generic checklist, and C is supplied skill guidance.

## Completion and denominators

The first repetition now includes all 36 cases in all arms. The second includes cases 01–30 in all arms and one additional BV5-31 B answer. The third did not run. Thus there are 199 completed answers: A 66, B 67, C 66. The combined schedule has one current failed slot (ordinal 200, BV5-31 C repetition 2) and 124 not-run slots. The original failed attempt at ordinal 79 remains preserved separately; it was replaced by a successful recovery answer, not deleted. There were 201 total collector attempts across both segments, with unknown usage for both failed requests.

Cumulative observed usage is **4,284,856 tokens**; cumulative recorded execution time is **4,587,374 ms** (about 76.5 minutes), excluding the human pause. Unknown failed-request usage makes this an observed total rather than a complete billing figure. Collection stopped on the transport retry signal; that transport event is not a semantic model failure. No automatic recovery is authorized by these results.

## Completed-answer metrics

| Metric | A | B | C |
| --- | ---: | ---: | ---: |
| Primary complete task outcome | 39/66 (59.1%) | 58/67 (86.6%) | 56/66 (84.8%) |
| Semantic/protocol failure | 27 | 8 | 10 |
| Pending outcome | 0 | 1 | 0 |
| Frozen-label agreement | 61/66 | 60/67 | 59/66 |
| Expected issue recall | 28/28 | 30/30 | 28/28 |
| Expected issue misses | 0 | 0 | 0 |
| Task criterion credits | 58/90 | 79/93 | 76/90 |
| Evidence credits | 340/354 | 351/361 | 334/354 |
| Confirmed false defect claims / affected answers | 2 / 2 | 2 / 2 | 1 / 1 |
| Other unsupported claims | 0 | 0 | 0 |
| Observed tokens | 908,570 | 920,540 | 2,455,746 |

Primary completion requires all frozen issues and task criteria, no false/unsupported or pending claims, and required exact finalizer/sweep protocol compliance. Label agreement is descriptive and is not whole-answer accuracy. Evidence credits are individual rubric components, not independently sampled observations. A genuine novel finding can disagree with a frozen label without being a false positive.

## Results by skill

| Skill | Completed A/B/C | Primary A | Primary B | Primary C | Labels A/B/C | Recall A/B/C | FP claims A/B/C |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| brooks-review | 12 / 12 / 12 | 10/12 | 12/12 | 12/12 | 12/12 · 12/12 · 12/12 | 4/4 · 4/4 · 4/4 | 0 / 0 / 0 |
| brooks-audit | 12 / 12 / 12 | 8/12 | 12/12 | 12/12 | 12/12 · 12/12 · 12/12 | 4/4 · 4/4 · 4/4 | 0 / 0 / 0 |
| brooks-debt | 12 / 12 / 12 | 7/12 | 10/12 | 12/12 | 12/12 · 12/12 · 12/12 | 4/4 · 4/4 · 4/4 | 0 / 0 / 0 |
| brooks-test | 12 / 12 / 12 | 7/12 | 10/12 | 10/12 | 11/12 · 10/12 · 7/12 | 4/4 · 4/4 · 4/4 | 0 / 0 / 0 |
| brooks-health | 12 / 12 / 12 | 5/12 | 11/12 + 1 pending | 7/12 | 9/12 · 8/12 · 10/12 | 8/8 · 8/8 · 8/8 | 0 / 0 / 0 |
| brooks-sweep | 6 / 7 / 6 | 2/6 | 3/7 | 3/6 | 5/6 · 6/7 · 6/6 | 4/4 · 6/6 · 4/4 | 2 / 2 / 1 |

| Repetition | Completed A/B/C | Primary A | Primary B | Primary C |
| --- | --- | ---: | ---: | ---: |
| 1 | 36 / 36 / 36 | 20/36 | 29/36 + 1 pending | 29/36 |
| 2 | 30 / 31 / 30 | 19/30 | 29/31 | 27/30 |
| 3 | 0 / 0 / 0 | Not measured | Not measured | Not measured |

The balanced **matched 198** subset excludes only the unpaired BV5-31 B second-repeat answer: primary outcomes are **A 39/66, B 57/66 plus one pending, C 56/66**. On the complete first repetition they are **20/36, 29/36 plus one pending, 29/36**. `matched198.json` contains the corresponding full frozen-assessor output. The extra successful B answer must not be mistaken for an extra skill benefit. These post-collection matched views are descriptive, not new frozen primary endpoints.

## What each skill demonstrates here

- **Review and audit:** C improves task completion over A but ties B, and all arms recall every expected issue. Missing scoped remedies account for the A failures. These cases do not demonstrate an incremental advantage of skill guidance over the generic checklist.
- **Debt:** C completes 12/12 versus B 10/12 and A 7/12. The observed difference concerns concrete one-sided policy change outcomes and requested action, not better expected-issue recall. Some answers still lose executable-witness evidence.
- **Test:** C and B tie at 10/12, while A completes 7/12. C identifies valid additional test gaps outside frozen labels; merely counting label matches would penalize those discoveries. Missing paired baseline/mutant outcomes remain a weakness.
- **Health:** C completes 7/12, behind B 11/12 with one pending. All three arms recall the known defects; C loses five complete tasks because it does not return the exact finalizer report. A often diagnoses correctly but omits a scoped remedy. Deterministic arithmetic alone has not solved report-delivery reliability.
- **Sweep:** On the balanced first repetition, A/B/C complete 2/6, 2/6, 3/6. All arms use the wrong frozen stop disposition on two unknown-contract cases. A/B also patch a protected case after inventing an out-of-domain validation duty. C handles that protected boundary better, but also makes the extra out-of-domain claim on the defective atomicity case. These are proposal/protocol results, not demonstrated autonomous repair success.

C uses about 2.67 times B's observed tokens on the all-completed totals. There is no general efficacy or cost-effectiveness proof: B and C are close on matched primary counts, with different weaknesses. These are 36 same-workflow development cases with repeated correlated answers, not 199 independent tasks. No independent holdouts, independent human labels, or full third repetition exist; prompt lengths also differ.

## Important individual decisions

`review-log.json` lists each new answer, its credited components and every withheld reason. Common failures preserve the original standard: diagnosis without an appropriate remedy; BV5-15 A/B without concrete one-sided changed outputs; BV5-23 A/B without original/mutant comparison; BV5-24 C without the original baseline result. Prose traces earn causal evidence but not executable-witness evidence. The original BV5-13 A did propose both consumers use the central policy; new repeat-2 A does not, so their different task outcomes reflect different answers.

**Confirmed out-of-domain false claims:** BV5-34 A/B/C and BV5-35 A/B treat rejection of NaN, fractions or strings as a required obligation. The supplied precondition is “Inputs are finite integers”; the permitted increment range is 0..10. The valid rejection witness [2,11] proves the BV5-34 atomicity defect and remains credited. NaN/fraction acceptance does not prove another defect under that input domain. Each answer has one grouped causal false claim (source plus associated test allegation), rather than inflating the count by every listed invalid type. BV5-35 A/B additionally return replacements on a protected case, failing the artifact boundary. BV5-35 C explicitly leaves sparse/noninteger behavior conditional and unscored.

**Unknown-contract stop rule:** BV5-33 and BV5-36 in all three arms correctly return no patch, but use `no-actionable-findings`. The frozen `truthful-stop` definition and shape validator require `verification-blocked` for unknown contracts. This is a protocol failure, not a claim that those models chose wrong mutation/transaction semantics.

**Finalizer delivery:** New C failures are ordinals 79 (BV5-27 repeat 1), 86 (BV5-29 repeat 1), 182 (BV5-25 repeat 2), and 198 (BV5-30 repeat 2), in addition to original ordinal 75. Health exact delivery is A 12/12, B 12/12, C 7/12. Every completed sweep answer retains its exact decoded report (A 6/6, B 7/7, C 6/6); shape compliance is separately A 3/6, B 4/7, C 4/6. `workflow-receipts.json` preserves last-tool and delivered-report hashes. No host-corrected output is substituted for an answer.

## Novel findings and uncertainty

- **BV5-27:** A/B first repeat and A/B/C second repeat identify a supported local record-retention test gap. The contract explicitly says export includes the supplied record. A name-only replacement passes the shown assertion but drops `secret`. This says nothing about leakage permission or unknown whole-suite protection. It is a supported discovery, not a false positive simply because the frozen label is unresolved.
- **BV5-23 C second repeat:** a replacement returning 7 except for x passes both supplied assertions but mishandles numeric `12` and nonnumeric `abc`. Those unambiguous inputs support an additional local protection gap.
- **BV5-24:** primary review retains the earlier interpretation that a smoke test should signal its own assertion failures. New A leaves that obligation unresolved; new B/C score it locally. The separate sensitivity treats all five scored claims across the two repeats as pending. All-completed primary pass counts then become A 39, B 56, C 56, with pending outcomes 1, 3, 2 respectively. No historical annotation is edited.
- **BV5-29 B first repeat:** redundant inner validation is real, but the meaningful maintenance benefit of removing it is not established. It is pending under the frozen optional-tradeoff rule, not a confirmed false positive. If accepted, the counterfactual also restores `task-outcome` and `prose-ledger-reconciliation`, the two credits withheld solely because the maintenance benefit was unsettled; B then becomes 59/67 with no pending. Changing the pending verdict alone would instead leave B at 58 passes and 9 failures. If rejected as a false obligation, B remains 58/67 and has three FP claims instead of two. `sensitivity.json` records the exact counterfactual edits for both alternatives without changing primary judgments; `verify-sensitivity.mjs` replays those edits and checks the saved aggregates.

Novel traces are contained in each exact-quote annotation. They are reviewer source reasoning, not new execution receipts. Historical reproductions remain in the original 78-answer report. No model-authored replacement was executed on the host or in a sandbox. Thus all proposed repairs remain unverified; collection and this review do not measure sandbox patch success.

## Reproduction and preserved evidence

The raw archives, frozen registration, recovery plan, and original judgments are unchanged. The recovery raw archive hash is `e9328cfdf0eb01e11d4d864852abe4d8949a0bfe5ba756d58ff93aed30ba9484`; the original archive hash is `d899daa452628e214f3426abd91954df926de7842837e01779763eaaa511431e`. Extract them into separate directories and run:

```sh
node evals/research/skills-benchmark-v5-recovery/recovery.mjs verify docs/research/skills-benchmark-v5-recovery/plan.json ORIGINAL RECOVERY
node evals/research/skills-benchmark-v5-recovery/recovery.mjs review docs/research/skills-benchmark-v5-recovery/plan.json ORIGINAL RECOVERY docs/research/skills-benchmark-v5-recovery/results/2026-11-14-stopped/annotations-combined199.json NEW_ASSESSMENT.json
```

Compare the regenerated assessment with `assessment.json`. The guard checks original judgments, completeness, response identity and exact quotations. It does not independently prove the semantic decisions. Repository/offline gate evidence and a second QA review are recorded separately; this report does not claim they passed before their receipts exist.
