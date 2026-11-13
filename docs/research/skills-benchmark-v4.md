# Repaired all-skills benchmark v4: frozen prospective retest

This version repairs the disclosed gaps in the [108-response v3 report](skills-benchmark-v2-results/2026-11-12-terra-live/REPORT.md). It preserves every historical v2 case/source, v3 collector, raw response, annotation and result. The prospective package is `evals/research/skills-benchmark-v4/`. The old and new prompt contracts differ, so this is a fresh three-arm comparison, not an unchanged retest or a retroactive correction of the old scores.

**Status:** prepared offline; real model calls are not authorized or started by preparation. Model selection is `gpt-6.1-terra / low`, Codex CLI `0.167.1`, using the retained successful v3 login/scoring transport probe. The unchanged executable, code-mode host, probe/scorer source and proxy fingerprint passed offline registration. Backend availability and authentication freshness cannot be established without a real call; a failure still stops the campaign.

## Frozen schedule and budget

36 cases × three arms × one response = **108 fresh submissions**. Every skill has two defect/protected/unresolved triplets: one regression family and one shared-repository challenge family. Arms are A case-only, B generic checklist, C supplied skill guidance. The same neutral output vocabulary, scoring defaults, task inputs and tool contract are present in every arm. All shared Markdown dependencies and relevant mode guides are included and source-sealed for C; no native skill discovery is claimed. Prompt lengths remain unequal and are recorded.

- Model/effort: `gpt-6.1-terra / low`; CLI `0.167.1`.
- Maximum 108 submissions; no automatic retries or replacement submissions.
- 120 seconds per turn, eight hours overall, 5,000,000 observed tokens.
- Stop on first failed turn, observed retry, missing usage, proxy drift or exhausted admission budget; retain failed/raw records and all not-run slots.
- Usage admission can overshoot the observed-token limit by one turn; this is not a hard billed-cost limit. Provider behavior and unknown failed-call usage remain limitations.
- Collection does not execute model patches. An explicitly separate bounded Docker checker can test proposed sweep artifacts after collection; it has separate records and is not evidence that the model ran tests.

The [registration receipt](skills-benchmark-v4-registration.json) records the exact anchors, identities, toolchain hashes and source seals. `prepared-freeze.json` contains the complete frozen prompts, rubrics, operational credit definitions, calibration and policy. `freeze-anchor.json` admits only that prepared live case freeze. The suite rejects a stale prepared freeze after source/skill changes; an intentional edit requires a new reviewed freeze, not silent substitution.

## Gaps repaired

| Prior gap | Prospective repair | Offline evidence |
|---|---|---|
| Sweep challenges referred to absent regression schema | Every sweep task carries exact fields, phase sequence, round range, stop enums, path scope, protected/no-patch and unresolved/no-patch rules | Pure shape/authorization rejection tests; six sandbox bridge controls |
| Only C knew risk meanings/default preset | Identical public R1–R6/T1–T6 glossary, severity meanings, balanced default and deductions in every prompt | Prompt-prefix equality across all 108 treatments |
| Historical numerical findings omitted by frozen labels | BV4-01–03 enforce a new bounded public request domain; rejects sparse/oversize arrays and out-of-domain values. Novel valid findings have their own supported/unsupported/pending review inventory | Historical counterexamples rejected upstream; exact integer reference comparison over 0..1,000,000; maximum-length boundary |
| Finite examples and arbitrary overfit mutants produced disputed adequacy claims | Quote contract explicitly defines valid integers 0..100; protected test asserts all 101 inputs; defect/unresolved tests retain source-coupled checks | Behavior-preserving rename; hardcoded in-domain mutant killed by protected test |
| Single shared key plus repeated mechanics confused with duplicated knowledge | Explicit shared identity ownership vs independent lookup policy; known two-owner identity contract retained in defect cases | Paired ownership contracts and existing mutation witnesses |
| Conditional architecture warnings were still scored | Unknown responsibility/binding contract explicitly prohibits deriving the boundary from names; common label/scoring rule and paired calibration distinguish unscored uncertainty from proved local violations | Frozen calibration, quote-bound review admission, guide guards |
| Health report edits invalidated successful receipts | Entire `finalReport` required; sweep compares exact decoded report equality, not substring containment | Extra preface/footer rejection; unavailable-composite positive control |
| Empty findings or a phase name falsely implied complete assessment | Explicit evidence-backed dimension status and proposal/current-snapshot distinction; missing dimensions stay unassessed | Partial-ledger arithmetic and exact-retention controls; per-credit definitions |
| Vague grading and novel findings were conflated with FP | Frozen operational definitions for all 27 evidence and four task criteria, explicit scoped label basis, novel claim inventory, claim and affected-answer denominators | Synthetic calibration and metric/quote/hash regression checks |
| Returned artifact behavior was never checked | Separate no-network, no-host-mount, non-root, resource-limited Docker checker with immutable local image and fail-closed admission/cleanup | Real authored isolation and candidate controls; [sandbox evidence](skills-benchmark-v4-artifact-sandbox/README.md) |

The numeric bound and finite test domain are **new prospective specifications**, not arguments that the historical valid findings were wrong. The historical report, labels and annotations remain unchanged. Newly supported surprises must still be reproduced or traced against the actual contract and recorded as oracle gaps rather than automatic false positives.

## Skill changes being tested

The shared framework requires governing obligations and concrete causal witnesses before scoring, preserves unknown scope, and distinguishes predicted outcomes from execution receipts. Review/debt/test guides retain concrete behavior, one-sided-change and paired-rename evidence. Audit keeps unestablished boundary allegations outside scored findings. Test/debt require an actual requirement/change burden instead of arbitrary overfitting or visual similarity. Health/sweep justify assessment status, preserve unknown dimensions, and deliver the complete finalizer output unchanged. These are general instructions without benchmark IDs or fixture solutions; offline checks establish consistency, not model adherence.

## Assessment and comparisons

Use the sealed `adjudicationPolicy`, `rubricDefinitions` and `calibration` in the registration's frozen protocol. Every completed answer requires exact excerpts, reasons, scoped `labelBasis`, and a `novelFindings` array (empty if none). Record expected-issue misses, confirmed false-defect claims, other unsupported claims and pending claims separately. A supported novel finding is not a false positive merely because it is absent from the expected issue inventory. Preserve original labels and report oracle gaps/sensitivity explicitly.

Report per skill and arm: frozen-label agreement, expected-issue recall/misses, FP claim counts and affected-answer counts, pending/novel findings, evidence and task-criterion counts, exact scoring-tool retention, artifact shape, separately sandboxed behavior, failures/not-run and observed tokens. Label agreement is not whole-answer correctness. Correct source diagnosis, correct ledger, exact rendering and runnable patch are different outcomes. A sandbox pass cannot retroactively excuse a false execution claim.

All 36 cases are revised exposed development cases. Authors know previous answers and skill changes. **There are zero independent holdouts and no independent human ground truth.** The shared challenge family, one response per arm and unequal prompt lengths limit generalization and causal attribution. Real isolation controls demonstrate a bounded host boundary, not adversarial-proof grading: a hostile candidate may tamper with in-container assertions or exit early. Review remains necessary. Do not claim native autonomous repository repair from this campaign.

## Reproduction and next authorized run

Offline only:

```sh
npm run evals:skills:v4
node evals/research/skills-benchmark-v4/campaign.mjs verify-registration _workspace/campaign-v4-resealed-registration.json 08325965b58306e2fe687b1ae23879015ca80f1cfe79b538e2984c0c1d7c1fa3
```

Recreate the registration in a fresh path if needed, using the pinned executable path from the receipt:

```sh
node evals/research/skills-benchmark-v4/campaign.mjs register ABSOLUTE_PINNED_CODEX 5000000 28800000 120000 'Same-workflow semantic review against frozen v4 rubric and calibration, with exact excerpts and separately verified novel claims' NEW_REGISTRATION
```

**Only after the user switches/confirms the model and authorizes the real run:**

```sh
node evals/research/skills-benchmark-v4/campaign.mjs execute REGISTRATION ANCHOR FRESH_OUTPUT --live
node evals/research/skills-benchmark-v4/campaign.mjs verify OUTPUT
node evals/research/skills-benchmark-v4/campaign.mjs review OUTPUT ANNOTATIONS FRESH_ASSESSMENT
```

An optional post-collection sweep check, with Docker available, reads verified raw records and refuses to overwrite its report:

```sh
node evals/research/skills-benchmark-v4/artifact-check.mjs VERIFIED_RUN ORDINAL FRESH_REPORT
```

See [offline validation](skills-benchmark-v4-validation/README.md) for the full synthetic collection, failure-stop controls and limitations. No command in `npm test` or `evals:skills:v4` calls a live model or silently starts Docker; the actual Docker drills were explicit local authored-control runs.
