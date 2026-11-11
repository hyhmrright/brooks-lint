# Diagnostic-cohort initial semantic review notes

> Historical initial reviewer notes, preserved for disagreement audit. Final annotations incorporate root adjudication recorded in `adjudication-log.json`: AS-19 three scoped local findings retain **unresolved** global coverage; four unknown-history/accidental-for-priority statements are **not unsupported factual claims**. AS-04 equivalent rounding witnesses were also added to separately labeled post-hoc sensitivity. Initial totals and flags below are not the final report metrics. Consult `annotations-all-skills.json`, `comparison.json` and `report.md` for final results.

Reviewed all 120 masked packets individually against the complete supplied inputs and frozen rubrics. The pre-existing annotation `02913289dd9f99b878aa` is preserved byte-equivalent as a JSON value. The other 119 judgments were made in this Codex session by gpt-6-astra; the evaluated responses were gpt-6.1-terra/low. This is same-workflow, rubric-exposed model review, not independent human validation. Treatment style was inferable. No model calls or benchmark reruns were made. Annotation arithmetic/quote validation is not independent semantic validation.

## Decisions requiring careful interpretation

- **Frozen evidence specificity:** All six AS-01 answers give a valid 1,000-cent/100-point counterexample, while frozen evidence index1 requires110 points. Primary evidence remains withheld for that exact item. Each has `supplementalEvidence` with the valid alternative witness and source arithmetic. Count these only in separately labeled post-hoc equivalent-witness sensitivity; their expected diagnosis is correct.
- **Missing alternatives:** Generic requests for more information do not satisfy an evidence item asking for contrasting compatible interpretations. AS-04 answers generally omit nearest-cent91 versus floor90; AS-14 answers omit alternate A/B change burden scenarios; AS-19 answers omit existing integration coverage versus absent other tests. Missing items are individually documented in `missingEvidence`.
- **AS-19 finding versus uncertainty:** Responses `352018a7030e8b9a4a99`, `b7df2ff850e718a220ee`, and `f6386a473a2be18ed388` emit a severity-rated T5 finding and unconditional add-test remedy even while correctly disclaiming whole-suite knowledge. Primary assessment is defect versus frozen unresolved. This is a label/remedy-calibration discrepancy, not a proven fabricated claim that the entire suite lacks coverage. No unsupported finding was added merely for this scoped observation. A reviewer may reasonably distinguish excerpt-level finding from project-level unresolved status; retain this ambiguity in conclusions.
- **Unknown debt intent:** Responses `421d3e644a6e7278369c`, `907af5e68398cdcb6e13`, `cdda7378e9e41868ce8a` (AS-12) and `69628547bc9790717769` (AS-11) apply accidental-for-prioritization to unknown intent. AS-12 explicitly prohibits inferring accidental intent without history. The supplied debt guide Step3 default is for *known intentional debt without a payback plan*, not unknown intent. These flags concern extending an operational classification beyond its established antecedent, not claiming that the responses conceal their uncertainty. All four acknowledge uncertainty; preserve that qualifier. AS-11 has no explicit intent-specific rubric guard, so its flag is an open-set supported-contract adjudication and deserves independent review.
- **AS-01 extra test finding:** `2c4307c84657e83dd4cd` says no automated protection; `a602fe92466a8881a650` and `da58cf8b0ec8e06d1f4c` explicitly limit the finding to no supplied tests. All three remain pending because complete module source is not an explicitly complete project test inventory. The latter two are substantially more restrained, and the reported absence of supplied files is true; the unresolved question is whether that evidence limitation warrants a separate T5 defect. They are not automatically counted false.
- **AS-13 monitored scores:** Some disposable-demo answers calculate Pain1×Spread1 while explicitly recommending no remediation. This does not invent a priority for productionizing the code, so it is not a false positive under the frozen guard.
- **AS-09 alternate architecture:** Infrastructure versus stable/domain-owned generated binding, explicitly tied to unknown layering correctness, is accepted as semantic evidence for alternative roles. Merely saying generated code is not necessarily infrastructure without the alternate contract trace is insufficient. This distinction accounts for differing completeness among otherwise correct unresolved answers.
- **Ancillary numerical caveats:** `2edfc7813fd933f519e8`, `b8a252b9b9735f6c9944`, and `d7755697f8fdba6161df` mention possible floor errors with unbounded JavaScript numbers. A local witness confirms the possibility, but these are conditional caveats, not separately asserted actionable contract defects. They are excluded from precision and novel-finding counts and retained only in adjudication notes.

## Offline numeric caveat verification

Executed with Node v26.13.0 (no model or network):

```js
const x = 2 ** 56 + 48;
console.log(BigInt(x));                     // 72057594037927984n
console.log(BigInt(Math.floor(x * .9)));    // 64851834634135184n
console.log(BigInt(x) * 9n / 10n);           // 64851834634135185n
```

This is outside the safe-integer range. Print represented integers through BigInt rather than Number decimal formatting, which can obscure the exact difference. The contract supplied a nonnegative integer and no upper bound, but its rounding convention is missing. This witness validates the ancillary numerical possibility only, not an unconditional contract failure or a new expected finding.

## Validation

All120 annotations passed the existing `score` exact-quote/hash/schema validator. Every newly reviewed answer partitions all rubric evidence indexes into credited or individually explained missing items. Existing annotation deep equality was checked. All supplemental quotes are exact answer substrings and are absent from primary evidence. Preliminary aggregate across these mixed cohorts is117/120 frozen assessment matches,42/42 expected issues,6/6 priority criteria,294/336 evidence items,4 unsupported operational classifications,3 pending test-inventory claims,79 complete-supported answers. This combined arithmetic is a QA cross-check only, not a pooled skill-effect metric.

## Per-answer review index

Every answer was read in full. The annotations contain exact per-criterion support; this index records omissions and adjudication flags without treating a missing evidence detail as a missed diagnosis.

| Response | Case | Assessment | Missing evidence indexes | Additional review notes |
| --- | --- | --- | --- | --- |
| 02913289dd9f99b878aa | AS-07 | defect | None | No additional diagnostic claim requiring adjudication |
| 036e6922ac3d6bd162b6 | AS-18 | protected | None | No additional diagnostic claim requiring adjudication |
| 0ae63680167b38cb6d46 | AS-10 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 0fc33d7d737a62f3dfae | AS-08 | protected | None | No additional diagnostic claim requiring adjudication |
| 11ba291cb90d701d12a3 | AS-14 | unresolved | 2: The answer withholds priority but does not give the two contrasting A/B change-burden scenarios needed to show reversal. | No additional diagnostic claim requiring adjudication |
| 166a574e0e5917372e9a | AS-20 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 17220f567a7a75c5d40f | AS-15 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 196e04921a6f69f63e77 | AS-09 | unresolved | None | No additional diagnostic claim requiring adjudication |
| 1e07866f941b56b30866 | AS-11 | completed | None | No additional diagnostic claim requiring adjudication |
| 1e9f2b1ddfe6b473981e | AS-06 | defect | None | No additional diagnostic claim requiring adjudication |
| 1edd6f30a0ffc0a360eb | AS-18 | protected | None | No additional diagnostic claim requiring adjudication |
| 21183a386c0ae792ed8c | AS-10 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 212500519c9924bf40a1 | AS-16 | defect | None | No additional diagnostic claim requiring adjudication |
| 26c76fec1fb716b06d68 | AS-18 | protected | None | No additional diagnostic claim requiring adjudication |
| 27395e392db63875932f | AS-02 | defect | None | No additional diagnostic claim requiring adjudication |
| 294daadf0beba6002a4f | AS-17 | defect | 1: No always-500 mutation or equivalent passing faulty implementation is traced. | No additional diagnostic claim requiring adjudication |
| 2a19a602beae2955a565 | AS-19 | unresolved | 2: Other coverage is unknown, but the answer does not contrast integration coverage with the no-other-tests possibility and resulting verdict. | No additional diagnostic claim requiring adjudication |
| 2a3bb6c1a134b7680c5a | AS-09 | unresolved | 2: Does not contrast a pure/domain binding against storage-bound binding. | No additional diagnostic claim requiring adjudication |
| 2c4307c84657e83dd4cd | AS-01 | defect | 1: Uses 100 points, not the frozen 110-point witness. The alternative witness supports the issue but not this literal evidence item. | Pending: absence-of-automated-protection; Post-hoc equivalent-witness sensitivity |
| 2ead0576d833bc1fcce8 | AS-16 | defect | None | No additional diagnostic claim requiring adjudication |
| 2edfc7813fd933f519e8 | AS-04 | unresolved | 0: Uses 15 cents instead of the frozen 101-cent witness.; 2: Contrasts 13/14 for 15 cents but omits the frozen 90/91 outcomes for 101 cents. | No additional diagnostic claim requiring adjudication |
| 322181e06d86d3faf046 | AS-04 | unresolved | 2: Does not state the nearest-cent 91 alternative or explicitly contrast both compatible rounding contracts. | No additional diagnostic claim requiring adjudication |
| 352018a7030e8b9a4a99 | AS-19 | defect | 2: No conditional alternative explaining that existing integration coverage could remove the need for a new test. | Frozen label disagreement: expected unresolved |
| 38f1bf236f38f69714e9 | AS-03 | protected | 1: Mentions independent change but never explains the coupling a shared rate would introduce. | No additional diagnostic claim requiring adjudication |
| 39bc7703c698bfd037a4 | AS-17 | defect | None | No additional diagnostic claim requiring adjudication |
| 3a587907ae5480b304e4 | AS-02 | defect | None | No additional diagnostic claim requiring adjudication |
| 3a8db2d5505f05f20ad2 | AS-13 | protected | None | No additional diagnostic claim requiring adjudication |
| 3b8c6abb72fb0f400e7c | AS-10 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 407f90ed1f1edaaf55f0 | AS-15 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 416ff7612c67f78cb65a | AS-03 | protected | None | No additional diagnostic claim requiring adjudication |
| 421d3e644a6e7278369c | AS-12 | defect | None | Unsupported: unknown-intent-classified-accidental |
| 422ebc9fb5b1a56336ea | AS-01 | defect | 1: Uses 100 points rather than the required 110-point witness.; 2: Describes divergence but provides no correction or consolidation recommendation. | Post-hoc equivalent-witness sensitivity |
| 428aa8ebb413092bfb6d | AS-13 | protected | None | No additional diagnostic claim requiring adjudication |
| 42d06cb08e08dfdc97ea | AS-05 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 4578096e4951315d2b39 | AS-06 | defect | 2: No dependency inversion/value-passing remedy is supplied. | No additional diagnostic claim requiring adjudication |
| 469eaa93c0129d4ee11c | AS-13 | protected | None | No additional diagnostic claim requiring adjudication |
| 46abb1796c264d265cca | AS-15 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 486b7db1090f58e77244 | AS-08 | protected | None | No additional diagnostic claim requiring adjudication |
| 48edc9e8247aec2ec43e | AS-17 | defect | None | No additional diagnostic claim requiring adjudication |
| 4c93225e938133cd1321 | AS-07 | defect | None | No additional diagnostic claim requiring adjudication |
| 4cd9c5b26a06f43baaf8 | AS-15 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 5134fddc20aa0586815e | AS-04 | unresolved | 2: Does not contrast floor=90 against nearest-cent=91 under the two possible contracts. | No additional diagnostic claim requiring adjudication |
| 516fea4077fb8817cbe4 | AS-10 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 552c39dcdc79e2e6fed1 | AS-15 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 5a76380f7f786975cc9b | AS-11 | completed | None | No additional diagnostic claim requiring adjudication |
| 5b3270422927ea111cbb | AS-02 | defect | None | No additional diagnostic claim requiring adjudication |
| 5bad04dfabc3840d68b7 | AS-16 | defect | None | No additional diagnostic claim requiring adjudication |
| 5bbbc64552de1afe885f | AS-18 | protected | None | No additional diagnostic claim requiring adjudication |
| 61b6b8175fc5fd1100da | AS-13 | protected | None | No additional diagnostic claim requiring adjudication |
| 6331f9f8920c90596726 | AS-13 | protected | None | No additional diagnostic claim requiring adjudication |
| 6429e033b082c22cbf1d | AS-16 | defect | None | No additional diagnostic claim requiring adjudication |
| 66554bc85e877b497a96 | AS-04 | unresolved | 2: Does not contrast floor=90 against nearest-cent=91 under the two possible contracts. | No additional diagnostic claim requiring adjudication |
| 69628547bc9790717769 | AS-11 | completed | None | Unsupported: unknown-intent-classified-accidental |
| 6b86cf4c265aa7041a14 | AS-18 | protected | None | No additional diagnostic claim requiring adjudication |
| 6eb8b516e9a5ae9ab81d | AS-09 | unresolved | 2: Does not provide the two contrasting binding targets and their different architectural verdicts. | No additional diagnostic claim requiring adjudication |
| 6fd5af3eba5d20399bf6 | AS-03 | protected | None | No additional diagnostic claim requiring adjudication |
| 70faaa9129908c10ac3b | AS-14 | unresolved | 2: Does not give contrasting A/B churn/consumer scenarios that reverse the ranking. | No additional diagnostic claim requiring adjudication |
| 733d0c9ab1a8489a1324 | AS-20 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 7470598ad08f186cea3a | AS-17 | defect | None | No additional diagnostic claim requiring adjudication |
| 75d3acfb43cb7d595d6f | AS-08 | protected | None | No additional diagnostic claim requiring adjudication |
| 76cbc9bdb8270d3f2cd4 | AS-17 | defect | 1: No always-500 mutation or equivalent passing faulty implementation is traced. | No additional diagnostic claim requiring adjudication |
| 76f727efbb14d3a36d34 | AS-06 | defect | 2: No inversion/value-passing correction is recommended. | No additional diagnostic claim requiring adjudication |
| 78b260e8093bf791ace8 | AS-06 | defect | 2: No inversion/value-passing correction is recommended. | No additional diagnostic claim requiring adjudication |
| 7d7c7fa19d26758d3b0e | AS-16 | defect | None | No additional diagnostic claim requiring adjudication |
| 8820c905fa81b0da1bd0 | AS-20 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 89d73bed5538336e909b | AS-08 | protected | None | No additional diagnostic claim requiring adjudication |
| 8abe6a3354be137ac3af | AS-19 | unresolved | 2: Other possible tests are mentioned, but no contrast of existing integration coverage versus no other tests and changed verdict is supplied. | No additional diagnostic claim requiring adjudication |
| 8ba6d65d1a6f5cf88f2d | AS-05 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 8ccb7a0ceb793a02cace | AS-02 | defect | None | No additional diagnostic claim requiring adjudication |
| 8ed61e56cb59ec986da4 | AS-09 | unresolved | 2: No pure/domain-bound versus storage-bound alternatives are stated. | No additional diagnostic claim requiring adjudication |
| 9067420377feeb7abf6d | AS-09 | unresolved | None | No additional diagnostic claim requiring adjudication |
| 907af5e68398cdcb6e13 | AS-12 | defect | None | Unsupported: unknown-intent-classified-accidental |
| 948fbe335090bba6a72e | AS-08 | protected | None | No additional diagnostic claim requiring adjudication |
| 958e4016b623b9af2f2d | AS-20 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| 984e8eb82be581ae94ea | AS-11 | completed | None | No additional diagnostic claim requiring adjudication |
| 9d7c0377bb4263882390 | AS-12 | defect | None | No additional diagnostic claim requiring adjudication |
| a05d94ec4d59174a3a88 | AS-05 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| a0647a9184acc8606e40 | AS-01 | defect | 1: Uses 100 points rather than the frozen 110-point witness.; 2: No justified correction is proposed. | Post-hoc equivalent-witness sensitivity |
| a2da2684276002c29a4a | AS-14 | unresolved | 2: Does not give contrasting change/consumer evidence that reverses A/B ranking. | No additional diagnostic claim requiring adjudication |
| a602fe92466a8881a650 | AS-01 | defect | 1: Uses 100 points rather than the frozen 110-point witness. | Pending: supplied-test-absence-as-finding; Post-hoc equivalent-witness sensitivity |
| a79fbfb83d20e1a84a77 | AS-09 | unresolved | 2: Says generated is not necessarily infrastructure but does not trace both pure-domain and storage-bound alternatives to different conclusions. | No additional diagnostic claim requiring adjudication |
| aaa4e261a96168ef9a2f | AS-06 | defect | None | No additional diagnostic claim requiring adjudication |
| ad8fffe6b01b6a29bd06 | AS-11 | completed | None | No additional diagnostic claim requiring adjudication |
| b05a30d2407d51ebc452 | AS-12 | defect | None | No additional diagnostic claim requiring adjudication |
| b0831878a0691ceb7348 | AS-03 | protected | 1: Separate planned multiplier values are stated, but the coupling introduced by a shared rate is not explained. | No additional diagnostic claim requiring adjudication |
| b62ad798723a655c653f | AS-12 | defect | 2: Only repairs the immediate omitted field; it expressly defers the recurring burden and proposes no shared mapping or consistency guard. | No additional diagnostic claim requiring adjudication |
| b7df2ff850e718a220ee | AS-19 | defect | 2: Does not contrast existing integration coverage against no other tests and adjust the verdict/remedy accordingly. | Frozen label disagreement: expected unresolved |
| b8a252b9b9735f6c9944 | AS-04 | unresolved | 2: Omits explicit floor90 versus nearest-cent91 alternatives. | No additional diagnostic claim requiring adjudication |
| bd012f75c3b1761f8a57 | AS-05 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| bf252c168c28f861c50a | AS-20 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| bfff8ad7b4655e46e4a1 | AS-18 | protected | None | No additional diagnostic claim requiring adjudication |
| c3976b6c56c81f547e4d | AS-07 | defect | None | No additional diagnostic claim requiring adjudication |
| c444d2031bdd56af9493 | AS-03 | protected | None | No additional diagnostic claim requiring adjudication |
| c4fe51f11c872d72d025 | AS-05 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| c507616a6fa9dc141216 | AS-19 | unresolved | 2: Other tests are unknown but no contrasting coverage scenarios/conclusions are given. | No additional diagnostic claim requiring adjudication |
| c64c9a533f3c1a9b5ac2 | AS-15 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| c81b0c0467c1bc8d9bfa | AS-07 | defect | None | No additional diagnostic claim requiring adjudication |
| cb45f20f6fcfda0ca36c | AS-07 | defect | None | No additional diagnostic claim requiring adjudication |
| cc3626fe5fd2c61b6a61 | AS-01 | defect | 1: Uses 100 points rather than frozen 110-point witness.; 2: No justified correction is proposed. | Post-hoc equivalent-witness sensitivity |
| cdda7378e9e41868ce8a | AS-12 | defect | None | Unsupported: unknown-intent-classified-accidental |
| cf2ab03bb0eec82dedb8 | AS-02 | defect | None | No additional diagnostic claim requiring adjudication |
| d7755697f8fdba6161df | AS-04 | unresolved | 0: Uses inputs1 and10 rather than the frozen101-cent witness.; 2: No floor90/nearest91 contrast. | No additional diagnostic claim requiring adjudication |
| d8f0c64ce266730dcf69 | AS-02 | defect | None | No additional diagnostic claim requiring adjudication |
| d903124270594daa9b6a | AS-05 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| d9ac9e9e351ec5cdee9d | AS-03 | protected | 1: Describes separate policy ownership and upcoming different rates but does not explain how sharing couples the retail-only change. | No additional diagnostic claim requiring adjudication |
| da58cf8b0ec8e06d1f4c | AS-01 | defect | 1: Uses100 rather than the frozen110-point witness. | Pending: supplied-test-absence-as-finding; Post-hoc equivalent-witness sensitivity |
| da64bc62ff3e01c179ff | AS-14 | unresolved | 2: Does not give contrasting churn/consumer scenarios reversing the A/B ranking. | No additional diagnostic claim requiring adjudication |
| dcd717b26926cc6d71a3 | AS-07 | defect | None | No additional diagnostic claim requiring adjudication |
| de4c83ceb24cc4ddf51d | AS-06 | defect | None | No additional diagnostic claim requiring adjudication |
| eafcc9d9aa42d1024eb7 | AS-17 | defect | None | No additional diagnostic claim requiring adjudication |
| f1fda3b81f052f6d0f94 | AS-08 | protected | None | No additional diagnostic claim requiring adjudication |
| f457cb3a0823f0280bf5 | AS-20 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| f4db626287f845171c79 | AS-10 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
| f6386a473a2be18ed388 | AS-19 | defect | 2: Does not contrast existing integration coverage against no other tests and adjust the conclusion/remedy. | Frozen label disagreement: expected unresolved |
| f6c82bb4bdf9a077299e | AS-13 | protected | None | No additional diagnostic claim requiring adjudication |
| f73c5540264a8563c7a2 | AS-14 | unresolved | 2: Does not give contrasting churn/consumer scenarios reversing the A/B ranking. | No additional diagnostic claim requiring adjudication |
| f80dbb7261744f1620d0 | AS-14 | unresolved | 2: Does not give contrasting churn/consumer scenarios reversing the A/B ranking. | No additional diagnostic claim requiring adjudication |
| f8349d6fb9620666a4ee | AS-11 | completed | None | No additional diagnostic claim requiring adjudication |
| fe847e5335548c563d4b | AS-16 | defect | None | No additional diagnostic claim requiring adjudication |
| feabe7fb2ef96756e494 | AS-10 | out-of-scope | None | No additional diagnostic claim requiring adjudication |
