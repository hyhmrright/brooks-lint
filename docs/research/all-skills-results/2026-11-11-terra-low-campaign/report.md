# Full campaign semantic results

> **Collector correction (2026-11-11):** the reported sweep B artifact/completeness result of 14/15 was caused by joining an abandoned stream fragment to the completed answer. The completed-event result is **15/15**, tied with A; evidence is **45/45**. One runtime response also contained an abandoned prefix, without any score change. All 318 records were audited; other skill results are unchanged. The original results below are retained for audit. See [the correction](collector-correction/README.md).

**The skills do not show a uniform benefit in this campaign.** Architecture audit improves completeness; test and debt review show smaller explanation/completeness gains; health introduces specific arithmetic regressions; sweep has one invalid repair envelope; ordinary review has no settled net benefit. The separate runtime prototype improves explanations of missing contracts, while defect recall and disposition agreement were already at ceiling. These are development-case observations, not proof of general production effectiveness.

All **318 scheduled answers** have now been reviewed individually: 210 all-skills (186 product + 24 local maintenance), and 108 runtime. The original single published annotation is unchanged; the other 317 are newly assessed. There were no new model executions in this review task. Two original failed all-skills attempts remain in the archived recovery history and are not hidden by the recovered 210-answer view.

## Identity and evidence

- Responding model: Codex CLI-selected **gpt-6.1-terra / low**, CLI **0.167.0**, ChatGPT login channel. Provider/backend identity is not independently attested.
- Continuation semantic reviewer: **gpt-6-astra**; reviewer reasoning effort is not independently recorded. The previous published reviewer record is retained verbatim. This is same-workflow, rubric-exposed model review, not independent human validation.
- Known observed usage: all-skills **3,313,206** tokens; runtime **1,977,505**; total **5,290,711**, plus unknown usage from the two failed attempts. These are executor-observed counts, not prices or subscription billing.
- Raw archive/recovery verification, exact excerpts, answer hashes, and deterministic recomputation passed. They verify consistency and arithmetic, not semantic truth. See [review protocol](review-protocol.md) and [validation record](validation-record.md).

## Six product skills: baseline A versus supplied-skill B

A receives the case and equally supplied task/authority rules; B also receives the selected skill guidance. Each ordinary skill has five cases × three repetitions per arm; health has six cases. Repetitions do not create independent cases. Native discovery, tool loading and full autonomous workflows are not measured.

**Disposition agreement** means matching the frozen label. **Complete supported** additionally requires all expected issues/criteria and evidence, no confirmed unsupported claim, and successful bounded artifact checks where applicable. A pending extra claim leaves completeness unsettled; it is not automatically a false positive. Fractions retain all responses in the denominator.

| Skill | Frozen disposition A → B | Complete supported A → B | Expected issue recall A → B | Task criteria A → B | Evidence A → B | Pending responses A / B |
| --- | --- | --- | --- | --- | --- | --- |
| brooks-review | 15/15 → 15/15 | 8/15 → 7/15 | 6/6 → 6/6 | n/a → n/a | 32/42 → 32/42 | 0 / 3 |
| brooks-audit | 15/15 → 15/15 | 9/15 → 14/15 | 6/6 → 6/6 | n/a → n/a | 36/42 → 41/42 | 0 / 0 |
| brooks-debt | 15/15 → 15/15 | 11/15 → 12/15 | 3/3 → 3/3 | 3/3 → 3/3 | 38/42 → 39/42 | 0 / 0 |
| brooks-test | 15/15 → 15/15 | 10/15 → 12/15 | 6/6 → 6/6 | n/a → n/a | 37/42 → 39/42 | 0 / 0 |
| brooks-health | 18/18 → 13/18 | 15/18 → 10/18 | 6/6 → 6/6 | 9/9 → 4/9 | 45/51 → 40/51 | 3 / 3 |
| brooks-sweep | 15/15 → 15/15 | 15/15 → 14/15 | 6/6 → 6/6 | n/a → n/a | 45/45 → 44/45 | 0 / 0 |

Expected issues were recovered in every diagnostic case in both arms: there are **no expected-issue misses** in these skill-specific denominators. That ceiling prevents a claim that guidance increased bug-finding recall. Health arithmetic and debt prioritization criteria are separate from defect recall.

Every product skill’s protected control has **0/3 response errors per arm**, and every out-of-scope control has **0/3 boundary errors per arm**. Unresolved controls also have **0/3 overclaims per arm for each product skill** after semantic adjudication. The three brooks-test B answers flag only the attached test while explicitly preserving unknown suite-wide coverage; a local finding heading does not itself change the global answer to defect.

| Skill | Matched complete-support comparisons: improved / tied / regressed / pending | Confirmed unsupported claims A / B | Observed tokens A / B |
| --- | --- | --- | --- |
| brooks-review | 1 / 9 / 2 / 3 | 0 / 0 | 126,786 / 340,831 |
| brooks-audit | 5 / 10 / 0 / 0 | 0 / 0 | 126,979 / 360,413 |
| brooks-debt | 1 / 14 / 0 / 0 | 0 / 0 | 129,088 / 337,981 |
| brooks-test | 2 / 13 / 0 / 0 | 0 / 0 | 127,121 / 341,273 |
| brooks-health | 0 / 10 / 5 / 3 | 1 / 5 | 154,557 / 399,609 |
| brooks-sweep | 0 / 14 / 1 / 0 | 0 / 0 | 129,387 / 510,520 |

An unsupported-claim count is **not a false-positive-defect-response count**. Here the six confirmed unsupported claims are arithmetic/headline contradictions; one response can contain multiple claims. Pending claims are retained in precision bounds in `all-skills-summary.json`. The table’s pending comparisons are unresolved, not ties or definitive regressions.

### What each skill result means

**brooks-review:** no settled improvement. Both arms recover the six expected issues and have 32/42 frozen evidence elements. B adds three separate missing-test findings whose status cannot be settled from a complete module listing without a complete test inventory. Two B answers also replace the frozen numeric rounding witness with other inputs. A correct issue diagnosis must not be confused with exact-witness compliance.

**brooks-audit:** a positive, bounded signal. B adds five required evidence elements: three dependency-inversion/value-passing remedies and two contrasting interpretations of an unknown generated binding. Complete-supported responses rise from 9/15 to 14/15 without an observed new control error. Five exposed development cases cannot establish general architectural effectiveness.

**brooks-debt:** a small completeness gain, not improved issue recall or ranking. B adds one evidence element describing a recurring-drift remedy, raising full support 11/15→12/15. Four B answers keep historical intent unknown while using accidental-for-prioritization handling under the supplied guide and absent visible payback plan. Root adjudication distinguishes that operational policy from asserting known accidental history, so no unsupported-factual-claim penalty remains. The initial disagreement and final rationale are retained.

**brooks-test:** a small explanation gain. B supplies two missing mutation-based explanations, raising evidence 37/42→39/42 and full support 10/15→12/15. Both arms retain the correct unresolved global coverage disposition on AS-19: the three B findings explicitly concern only the attached test and admit unknown integration/E2E coverage. Initial review treated the finding headings as defect labels; root re-read the complete answers and corrected that interpretation. All six still omit the required explicit contrast between existing integration protection and no other tests, so none gains that evidence element.

**brooks-health:** a negative arithmetic signal. B produces five incomplete dashboard calculations: strict-policy answers give 76.5→77 instead of 79.5→80, or contradict correct body calculations with headline 81/headline 79; two legacy-friendly answers say unrounded 97.8 instead of 98.4666…, although both correctly round to 98. A has no such fixed-ledger error. The separate AS-35 source-diagnosis case has two pending extra validation claims per response in **both** arms, plus one confirmed contradictory headline in A. The pending case is not treated as a clean failure or success.

**brooks-sweep:** no measured gain on these small artifacts. A passes 15/15 and B 14/15 bounded artifact checks. One B answer begins with a truncated JSON object before the intended valid object, so the frozen parser rejects the whole envelope despite an understandable correct replacement. It remains in the denominator. This tests returned replacement artifacts, not native filesystem edits, autonomous iteration, arbitrary JavaScript repair or real test execution by the responding model.

## Local maintenance harness, separately reported

brooks-harness is a repository-local maintenance skill, not a seventh shipped product analysis mode. Its 24 answers evaluate workflow decisions only; they do not execute subagents, releases or deployments.

| Metric | Baseline A | Harness B |
| --- | --- | --- |
| Frozen disposition | 12/12 | 12/12 |
| Complete supported | 9/12 | 11/12 |
| Required workflow criteria | 6/6 | 6/6 |
| Evidence | 33/36 | 35/36 |
| Protected / unresolved / scope errors | 0/3 each | 0/3 each |
| Known observed tokens | 102,389 | 126,272 |

B explicitly retains the mandatory QA invariant in two additional unknown-scope answers. One B answer still omits that invariant, versus all three A answers. This is a small positive signal for policy-plan completeness, not evidence of actual pipeline reliability.

## Runtime extension: original domain-pack research question

A is case-only; B is selected core review guidance; C is core plus runtime revision 2. The primary runtime scope contains nine cases across cancellation ownership, event meaning and freshness, repeated three times. PB-10–PB-12 are separate core/routing guardrails.

| Primary runtime metric | A | B | C |
| --- | --- | --- | --- |
| Frozen disposition | 27/27 | 27/27 | 27/27 |
| Expected issue recall | 9/9 | 9/9 | 9/9 |
| Evidence | 73/81 | 76/81 | 81/81 |
| Complete supported | 19/27 | 22/27 | 27/27 |
| Protected false-defect responses | 0/9 | 0/9 | 0/9 |
| Unresolved overclaims | 0/9 | 0/9 | 0/9 |
| Confirmed unsupported / pending claims | 0 / 0 | 0 / 0 | 0 / 0 |

C versus B improves five matched responses, ties 22 and regresses 0 on complete support. The gain is **two event-meaning and three freshness counterfactual explanations**. Both arms already found all defects and chose every frozen disposition correctly. C therefore demonstrates a bounded explanation/completeness benefit, not improved detection recall. Each guardrail arm has 6/6 core dispositions, 3/3 expected compound issues, 15/15 evidence, and 3/3 syntax dispositions with 6/6 evidence. There is no observed guardrail regression.

This passes the frozen descriptive development gate (a prespecified runtime evidence criterion improves without confirmed new false positives or guardrail regression). It does **not** authorize shipping the pack or establish statistical significance, native selective loading, production generalization, or advantage over a generic runtime checklist.

Across each complete 36-response runtime arm, observed tokens are A **308,315**, B **799,955**, C **869,235**. C uses about **8.7%** more observed tokens than B. These cost denominators include the guardrails; they are not solely the 27 primary-runtime responses and not billing totals.

## Adjudications and sensitivity

- **AS-01:** all six answers use a valid 100-point counterexample instead of the frozen 110-point witness. The strict evidence item is withheld; the post-hoc equivalent-witness sensitivity restores one element per answer. Expected issue recall was already correct.
- **AS-04:** two B answers use other valid rounding inputs. One explicitly contrasts 15 cents→13 versus 14 and receives two supplementary elements; the other shows 1→0 and 10→9 but omits competing rounding outcomes, receiving one. With both AS-01 and AS-04 sensitivity, review evidence is 35/42 A versus 38/42 B, and complete support is 8/15 in both arms (three B responses remain pending).
- **AS-35:** all six answers omit the exact `discount`→`rate` witness. Three B answers explicitly explain an equivalent private rename that preserves output and breaks the source assertion. The separate sensitivity raises B health evidence 40/51→43/51. All six remain pending because of the validation-contract ambiguity; complete-supported counts do not change.
- **Sensitivity is limited, post hoc and labeled.** It does not rewrite frozen labels or establish an unseen benchmark. Every identified alternate numeric/name witness is documented individually; this sensitivity is not a blanket upgrade for generic claims. Do not interpret literal-witness omissions alone as deficient model reasoning or a skill-effect gain.
- **AS-35 extra claims:** 12 pending claims across six answers concern input validation and invalid-input tests. The contract does not clearly distinguish an upstream validated-input precondition from validation responsibility. Precision bounds and pending status remain explicit. A future case revision should settle this before execution.
- **AS-19 scope dispute and unknown debt intent:** exact initial and final decisions are retained in [adjudication log](adjudication-log.json); [diagnostic notes](diagnostic-review-notes.md) preserve the original reviewer reasoning with a final-adjudication notice. Numerical health discrepancies, sweep envelope failure and source-diagnosis ambiguity are in [criteria notes](criteria-review-notes.md).

The sensitivity changes brooks-review B complete support 7/15→8/15, matching A 8/15; it leaves the other complete-supported fractions unchanged. Consequently the strict one-response review difference is not robust to an explicitly justified equivalent-witness interpretation. Three B pending extra test findings remain, so neither a general benefit nor a definitive regression is established.

## Next research decisions supported by this run

1. Keep the frozen records unchanged. Clarify AS-35 validation responsibility and AS-19 excerpt-versus-suite finding policy in a separately versioned benchmark. Replace overly literal numeric/name witnesses with prespecified semantic-equivalence rules where appropriate.
2. Improve health arithmetic and headline consistency using a deterministic calculation/check step; continue distinguishing unknown historical debt intent from operational priority handling; require conditional recommendations for unobserved test coverage; validate sweep output envelopes before admission. These are proposed follow-ups, not changes made to skills in this review task.
3. Extend the next frozen study with unseen repository-level tasks, larger causal chains, competing plausible diagnoses, repeated near-miss controls and a generic-checklist/context-cost ablation. Use more independent cases, not merely more repetitions of the same cases.
4. Add independent human or independently authored adversarial review before treating observed improvements as general skill effectiveness. Native loading/activation and autonomous execution need separate telemetry and tests.

All raw records, individual judgments and recomputable arithmetic are retained. See [per-answer ledger](response-ledger.md), [all-skills annotations](annotations-all-skills.json), [runtime annotations](annotations-runtime.json), [comparison data](comparison.json), [supplemental sensitivity](equivalence-sensitivity.json), and the [offline reproduction instructions](README.md#reproduce-the-arithmetic-without-model-calls).
