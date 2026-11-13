# V5 stopped campaign: semantic assessment of 78 answers

All 78 completed answers were individually read against the frozen inputs, case-specific task outcomes and operational rubric. The run used recorded `gpt-6.1-terra / low`, CLI 0.167.1. This is client-selected metadata, not backend attestation. A is case-only, B a generic checklist, and C supplied skill guidance. No new model calls were made for adjudication.

The run stopped on an observed transport retry at submission 79 (BV5-27 C, first repetition). It contains 78 completed answers, one failed request and 245 not-run slots. Completed answers cover BV5-01–26 once in every arm: six cases each for review, audit, debt and test, only two health cases, and **no sweep case**. The second and third repetitions did not run. These are balanced completed comparisons, but they are an ordered, incomplete development-set prefix, not the full planned six-skill evaluation.

## Results on completed answers

| Metric | A | B | C |
| --- | ---: | ---: | ---: |
| Primary complete task outcome | 16/26 (61.5%) | 24/26 (92.3%) | 24/26 (92.3%) |
| Frozen-label agreement | 24/26 | 24/26 | 22/26 |
| Expected issue recall | 10/10 | 10/10 | 10/10 |
| Expected issue misses | 0 | 0 | 0 |
| Task criterion credits | 18/28 | 26/28 | 26/28 |
| Evidence credits | 125/128 | 126/128 | 120/128 |
| Confirmed false defect claims / affected answers | 0 / 0 | 0 / 0 | 0 / 0 |
| Other unsupported claims | 0 | 0 | 0 |
| Supported novel claims | 2 | 2 | 4 |
| Required exact finalizer delivery | 2/2 | 2/2 | 1/2 |
| Observed tokens | 294,841 | 286,141 | 735,013 |

The observed-token sum is 1,315,995. C's failed request has unknown usage; these are not complete billed totals. Each arm had 108 planned slots. A/B each have 82 not run; C has one failure and 81 not run. Failure and not-run counts are separate from semantic failures. A frozen-label mismatch is not automatically a false positive: supported novel discoveries can disagree with the frozen oracle.

| Skill | Completed per arm | Primary A | Primary B | Primary C | Frozen labels A / B / C | Recall A / B / C |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| brooks-review | 6 | 5/6 | 6/6 | 6/6 | 6/6 · 6/6 · 6/6 | 2/2 · 2/2 · 2/2 |
| brooks-audit | 6 | 4/6 | 6/6 | 6/6 | 6/6 · 6/6 · 6/6 | 2/2 · 2/2 · 2/2 |
| brooks-debt | 6 | 4/6 | 5/6 | 6/6 | 6/6 · 6/6 · 6/6 | 2/2 · 2/2 · 2/2 |
| brooks-test | 6 | 3/6 | 5/6 | 5/6 | 5/6 · 5/6 · 3/6 | 2/2 · 2/2 · 2/2 |
| brooks-health | 2 | 0/2 | 2/2 | 1/2 | 1/2 · 1/2 · 1/2 | 2/2 · 2/2 · 2/2 |
| brooks-sweep | 0 | Not measured | Not measured | Not measured | Not measured | Not measured |

All confirmed FP counts are zero under this assessment. This is an evidence-scoped reviewer judgment, not independent proof of universal absence of false positives. Evidence and criterion denominators differ; neither is whole-answer accuracy.

## Individual omissions and disputed scope

`review-log.json` lists every answer's withheld credits, label basis, novel findings and tool status. Common omissions were correct diagnosis without a scoped remedy (A: BV5-01,07,10,16,22,24,25,26), missing concrete one-sided consumer-change results (BV5-15 A/B), and no original-versus-mutant test comparison (BV5-23 A/B). BV5-24 C showed an altered assertion's suppression but did not establish the original baseline outcome. Those omissions withhold the full task criterion; they are not missed diagnoses or false defect claims. Some C debt/audit/test answers provide prose traces but not the frozen requirement's runnable snippet or precise executable assertion; those lose only executable-witness evidence credits where the broader causal task outcome remains met.

BV5-25 C correctly diagnoses secret export and missing test protection, but its delivered answer differs from the successful tool's exact `finalReport`. Its complete health task and exact-delivery evidence therefore fail. The other five completed health answers retain exact tool reports. Successful arithmetic does not prove semantic ledger truth, and no host correction was substituted for any answer.

The health A answers derive consistent statuses and retained test findings, but omit the scoped remedy required by the frozen task-outcome definition. Their 0/2 full-task result must not be read as 0/2 diagnostic correctness. Both identify the relevant source/test behavior. No severity-calibration or publication-quality endpoint was frozen, so differences such as warning versus suggestion are not turned into invented deductions.

Label interpretation uses the controlling requested scope: BV5-03 B opens with “protected” but explicitly leaves repeated-ID semantics unresolved; BV5-23 A opens “unresolved” for grammar beyond the examples while explicitly protecting the requested no-suppression behavior. These mixed-wording answers are recorded as unresolved and protected respectively. Reading their opening words alone would change descriptive label counts without changing primary semantic decisions.

## Supported novel findings and sensitivity

Reviewer-authored minimal offline reproductions are saved in `novel-reproductions.json`. These execute tiny authored controls against the supplied fixtures; they are not evidence that the model ran tests, nor candidate autonomous-repair verification.

- **BV5-20 C:** a truthiness guard passes the existing `'x'` test but fails to persist the valid empty string. All strings are valid; the inventory is complete. This is a supported additional T5 finding, not a false positive against the protected frozen label.
- **BV5-23 C:** a parser accepting only `'7'` passes the two supplied assertions but rejects `'8'`, an unambiguously valid numeric string. The domain was not restricted to the examples, so this is a supported oracle gap. Frozen labels remain unchanged.
- **BV5-26 A/B/C:** adding an extra output field passes both name and secret-absence assertions while violating the explicit name-only output contract. All three answers describe this same additional local test gap; it explains their frozen-label disagreement.
- **BV5-24 A/B/C:** the answers identify a narrower local assertion-harness failure, while leaving parser requirements and broader suite coverage unknown. Changing the expected value makes an assertion throw but the empty catch still produces exit 0. Primary adjudication accepts the implicit obligation of a smoke test to signal its own assertion failures. This interpretation is less explicit than the other three contract-backed discoveries and is disclosed rather than silently called a whole-suite defect.

For sensitivity, `sensitivity.json` treats the BV5-24 local-harness claims as pending instead. Primary passes become A 16/26, B 23/26, C 24/26, with one pending answer per arm. Under either treatment there is no basis for a general efficacy claim or a confirmed false-positive count for those unresolved normative claims. The original rubric and primary annotations are not rewritten by this sensitivity view.

## What the result supports

On this incomplete prefix, B and C improve full-task adherence over case-only A; they tie on the primary count, and every arm recalls all frozen issues. C earns one more debt task than B but loses one health task through finalizer delivery. C uses about 2.57 times B's observed tokens. The extra supported discoveries in C illustrate why label agreement alone would misrepresent its behavior. This run does not establish stable skill advantage over a generic checklist, does not estimate repeat variance, and provides no sweep result. It also does not establish whether the health delivery revision improved reliability: one of two completed C health answers still fails the exact-delivery contract.

All cases and judgments originate in the same workflow; there are no independent holdouts or independent human ground truth. Prompt lengths differ. Repetition and broader health/sweep coverage were planned but not completed. The stop is a transport event, not evidence of poor skill diagnosis. Further collection would require a separately reviewed and authorized recovery, preserving this run and its failure.

## Evidence and reproduction

`annotations.json` contains 78 response hashes, exact answer quotations and authored judgments. Full-answer quotes intentionally preserve context; `review-log.json` is the compact per-answer explanation of withheld credits and scope. `assessment.json` is produced by the unchanged frozen assessor. The raw archive and original registration remain unchanged.

After extracting `raw-run.tar.gz`, run:

```sh
node evals/research/skills-benchmark-v5/campaign.mjs verify EXTRACTED/campaign-v5-live
node evals/research/skills-benchmark-v5/campaign.mjs review EXTRACTED/campaign-v5-live docs/research/skills-benchmark-v5-results/2026-11-13-stopped/annotations.json NEW_ASSESSMENT.json
```

Compare the regenerated assessment byte-for-byte with `assessment.json`. This validates coverage, response identity, quotations and mechanical metrics; it does not independently prove the semantic judgments. All original 324 slots remain represented.
