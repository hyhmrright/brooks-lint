# HB/BV calibration semantic review — 2026-11-10

All 54 completed answers have been reviewed. The three arms found every frozen expected issue, but all three overdiagnosed the unresolved outbox case. Runtime guidance added an explicit compatible freshness-policy alternative in one cache answer; it did not improve frozen issue recall or eliminate the outbox certainty error. This is a small, exposed calibration result, not evidence of general skill improvement.

## Execution and review provenance

The responding model was `gpt-6.1-terra`, effort `low`, Codex CLI 0.167.0 using ChatGPT login. CLI selection is recorded, not independently backend-attested. A received only case inputs, B additionally received core guidance, and C received core plus runtime revision-2 guidance as text. This study does not test skill discovery or tool use.

The plan contains 18 calibration cases × three arms × one repetition = 54 answers. The original run completed 24, failed ordinal 25 before model submission at account routing, and left 29 unrun. A separately authorized recovery completed ordinals 25–54 (30 answers). Its original failure is preserved; no partial failed stream was graded. There are 54 successful and reviewed answers, zero successful answers awaiting review, and 18 complete reviewed triplets. Individual and paired summaries therefore coincide. Original-only and recovery-only descriptive summaries are in `statistics.json`; their case mix differs and they are not paired experiments. Reported token usage is 1,520,963, not independently billed cost.

Reviewer: Codex `gpt-6-astra`; reviewer reasoning effort was not independently recorded. All supplied inputs, frozen rubrics and complete answers were read in this review. This is model semantic review, **not human or independent validation**. The reviewer saw arm identities, ordinal order, public rubrics and workflow context. Paragraph excerpts, answer hashes, causal-claim decisions, evidence requirements, rationale and uncertainty are retained in `semantic-review.json`. No new live CLI evaluation was run for this review.

## Frozen results

| Measurement | A: inputs only | B: core | C: core + runtime |
| --- | ---: | ---: | ---: |
| Task completion | 18/18 (100%) | 18/18 (100%) | 18/18 (100%) |
| Assessment matches frozen label | 17/18 (94.4%) | 16/18 (88.9%) | 16/18 (88.9%) |
| Frozen expected issue recall | 7/7 (100%) | 7/7 (100%) | 7/7 (100%) |
| Missed frozen issue IDs | 0/7 | 0/7 | 0/7 |
| Defect responses missing ≥1 frozen issue | 0/6 | 0/6 | 0/6 |
| Protected responses with confirmed unsupported defect | 0/6 | 0/6 | 0/6 |
| Unresolved responses with unsupported certainty | 1/6 (16.7%) | 1/6 (16.7%) | 1/6 (16.7%) |
| Confirmed unsupported defect assertions | 2 | 1 | 2 |
| Pending affirmative claims | 0 | 1 | 0 |
| Satisfied evidence requirements | 46/48 (95.8%) | 46/48 (95.8%) | 47/48 (97.9%) |
| Fully evidenced answers | 16/18 (88.9%) | 16/18 (88.9%) | 17/18 (94.4%) |
| Confirmed novel issues outside frozen inventory | 0 | 1 | 1 |

The two B/C frozen assessment mismatches are BV-03 and BV-05. **BV-05 is a valid novel mathematical boundary discovery under the uncapped visible contract**, not a confirmed false alarm. Thus the frozen label agreement rate alone misleadingly favors A. The original protected rubric remains untouched; a versioned amendment and pending-only sensitivity accompany it below.

HB label agreement is 12/12 in every arm, with 4/4 expected issues and 32/32 evidence requirements. BV label agreement is 5/6, 4/6, 4/6, with 3/3 frozen issues in every arm and evidence 14/16, 14/16, 15/16. Family and batch breakdowns are machine-readable. All 18 selected cases concern runtime behavior; there are six nominal families, not 18 independent mechanisms. No core-test or transfer cases were selected: those denominators are zero and rates are `null`, not 0% or 100%.

Confirmed-claim precision is A 7/9 (77.8%), B 8/9 (88.9%; excludes one pending claim), C 8/10 (80%). Counting pending claims as either false or true gives B bounds 8/10–9/10 (80–90%). These include confirmed novel discoveries but do not add them to frozen recall. No supported finding used an explicit severity label: applicable label denominator 0, rate `null`; absent labels number 7, 8, 8. No noncanonical labels, unsupported core labels, whole-codebase scores, duplicate findings, scope-overreach assertions or unsupported unconditional safety claims were recorded. Conditional caveats are not affirmative defects; bounded descriptions of ordinary protection are not universal safety claims.

## Disputed and incomplete answers

### BV-03: behavior is known, correctness is not

All arms correctly trace duplicate addition and producer/outbox divergence. However, the supplied reporting dictionary and integration specification are absent. A per-delivery accumulator can legitimately add twice, and an attempt counter can legitimately advance before a failed commit. Merely saying that downstream impact is unknown does not withhold the defect judgment.

- A, ordinal 7: prescribes deduplication and producer atomicity unconditionally; its final caveat concerns user-facing meaning, not a compatible permitted implementation. Two unsupported defect assertions.
- B, ordinal 2: explicitly opens with “one confirmed delivery defect”. That assertion is rejected. The producer paragraph contains an explicit “If” condition, despite the opening's “producer-side failure” wording and unconditional remedy. This mixed certainty is retained as **pending**, not counted as a confirmed second false positive.
- C, ordinal 4: opens with “two independent failure modes”, offers unconditional corrective changes, and limits its caveat to business impact/meaning. Two unsupported defect assertions.

All three fail `two-compatible-judgments`. The explicit-alternative threshold was frozen before execution; no inferred benign interpretation earns that requirement. B's pending producer claim does not change its incorrect overall assessment or unresolved-certainty error, since the delivery claim is definite. If adjudicated rejected, B precision becomes 8/10 and its unsupported assertion count becomes 2. If treated as conditional and excluded from the affirmative inventory, B has no pending claim and precision is 8/9. Both sensitivities are saved. No independent disagreement-resolution exercise has occurred.

### BV-06: restraint versus complete evidence

A ordinal 38 and B ordinal 27 correctly withhold a firm violation judgment and identify freshness policy. Their conditional remedies do not state an explicit acceptable stale-cache contract and judge the same observed behavior under it. They each miss one evidence requirement, while their assessments remain correct. C ordinal 11 explicitly contrasts indefinite stale hits being allowed with later reads having to reflect completed writes, so it earns that requirement. This is the one observed B-to-C evidence improvement: +1/48 requirements (2.1 percentage points) and +1/18 fully evidenced answers (5.6 points). No statistical or causal conclusion follows from one exposed case.

### BV-05: numeric-generation saturation

B ordinal 43 and C ordinal 15 identify that a Number generation saturates at `2 ** 53`, allowing an old fill to republish after invalidation. The visible contract has no lifetime-write cap. Starting from zero, incrementing reaches every integer through `2 ** 53` exactly; this is a finite symbolic path. At `2 ** 53`, adding one rounds back to that same value. A begin/write/finish/hit sequence then violates the written freshness contract. This establishes mathematical reachability without assuming a hidden caller mutates state.

`reproduce-novel.mjs` tests the ordinary control and the exact boundary using the supplied modules. It seeds the proven boundary state to keep the test bounded: **it does not execute the preceding 2^53 writes, establish realistic deployment reachability, or justify production severity**. `gold-amendment-v1.json` records this proof, limitation and uniform treatment. Human review is pending.

With the amendment, BV-05 is a defect case with one new expected issue for **all three arms**. A misses it, B/C find it. Assessment accuracy becomes A 16/18 (88.9%), B/C 17/18 (94.4%); issue recall becomes A 7/8 (87.5%), B/C 8/8 (100%); response miss rate becomes A 1/7, B/C 0/7. The amended result is supplementary and does not replace frozen metrics. A's answer describes the ordinary serialized trace, so this review records a missed amended issue rather than an extra universal-safety assertion.

If a later reviewer requires practical rather than mathematical lifetime reachability, the saved pending-only sensitivity marks the B/C discoveries pending rather than false: B has two pending claims and precision bounds 7/10–9/10; C has one pending claim and bounds 7/10–8/10. A practical lifetime restriction must be versioned explicitly, not silently read into the frozen contract.

## Interpretation and next work

B versus C shows identical expected-issue detection, identical amended BV-05 detection, and the same unresolved outbox assessment error. The only evidence-completeness difference favors C on BV-06. A versus B suggests an additional number-boundary discovery with core guidance, but one sample per case, exposed synthetic mechanisms, extra context length, non-blind model review and the separate recovery batch prevent attributing that difference to guidance. The recovered B BV-05 answer and original C answer also belong to different batches.

The actionable improvement is contract calibration: before prescribing deduplication or atomicity, identify which missing business invariant makes the observed behavior wrong; explicitly compare a compatible benign interpretation. Keep assessment, evidence completeness and novel-discovery adjudication separate. Do not tune the current frozen prompts/rubrics to erase observed errors. A future version can add uncapped numeric counters and less cue-rich missing-contract variants, with a new freeze and independent review where available. No new live run is authorized by this report.

## Reproduce offline

From the repository root:

```sh
node docs/research/runtime-results/2026-11-10-hb-bv-terra-low/score-review.mjs
node docs/research/runtime-results/2026-11-10-hb-bv-terra-low/reproduce-novel.mjs
```

The verifier reads the committed compressed archives directly; no `_workspace` state, credentials, network or model call is required. It checks all 54 hashes, exact excerpts, schedule linkage, copied frozen rubrics, issue arithmetic, aggregate drift and the boundary witness. It cannot prove the semantic annotations. Use `--write` only to regenerate `statistics.json` after a reviewed annotation change. Repository validation and QA records are saved separately in `validation.md`.
