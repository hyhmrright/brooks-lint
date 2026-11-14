# Completed second recovery — independent QA

Date: 2026-11-14. Verdict: **PASS**. No concrete inconsistencies found. No live model calls or candidate repair execution were made by QA.

## Evidence continuity and reproduction

- Extracted `raw-recovery2.tar.gz` into a separate temporary directory; SHA-256 is `d0dba99432346be5e58d3837ebde0800fe6839b2807c4c7431f5681c60776e5a`. Frozen recovery verification passed on the extracted records. Frozen review regenerated `assessment.json` byte-for-byte.
- All 321 historical file hashes match. All 199 historical annotation objects are deeply identical in the combined file. The 125 new IDs and 199 retained IDs form 324 unique responses; no failure was relabeled as a completed answer.
- Verified every new answer hash and every quoted annotation against retained answer text. Independently recalculated all 53 new workflow receipts; exact-report mismatches are precisely ordinals 296, 303 and 305.
- Every new record requests and CLI-selects `gpt-6.1-terra / low`, CLI 0.167.1. Provider serving identity remains unattested. New observed tokens total 3,274,295, plus 4,284,856 prior tokens gives 7,559,151. Historical failed-request usage remains unknown.
- Recounted primary outcomes from per-answer records: A 63 pass / 45 fail; B 89 pass / 18 fail / 1 pending; C 87 pass / 20 fail / 1 pending. Each arm has 108 answers and each skill-arm has 18. Replayed rubric assessment reproduces recall 48/48 in every arm and confirmed false-claim totals 6/6/3. Sensitivity variants were regenerated from separate copies, preserving primary annotations.

## Semantic review boundaries

QA inspected all 125 decision rationales, the frozen rubric definitions and adjudication policy, and focused full-answer comparisons for BV5-05, BV5-23, BV5-26 plus ordinals 205, 211, 216, 290, 297 and 299. This is a second same-workflow AI review, not independent human ground truth or a second exhaustive regrading of every answer.

The pagination contract can be read as an input restriction or an output guarantee; retaining the novel scored claim as pending is defensible. The 309-digit overflow and extra-field mutation claims have concrete support in supplied sources and must not be treated as false solely because the frozen label is protected. BV5-35 explicitly supplies finite integers as the input domain, so fractional/NaN rejection is not an established requirement. The frozen truthful-stop criterion explicitly requires verification-blocked for unknown contracts; returning no-actionable-findings fails that criterion even when no patch is correctly proposed.

Missing-remedy deductions for 290, 297 and 299 follow the frozen requirement for an appropriate scoped remedy: a discriminating witness alone is not an explicit repair recommendation. Ordinal 297 is a narrow semantic boundary because its additional assertion also suggests a possible repair; that interpretive limitation remains part of same-workflow adjudication, not objective human validation. No primary result was changed by QA.

## Cross-document consistency

Package and all four manifests, all six README badges, docs landing-page JSON-LD and top CHANGELOG version agree at 1.9.1. Source frontmatter derives 12 books, matching README/AGENTS/GEMINI. AGENTS's 64-scenario claim matches the eval inventory. All six shipped skill descriptions contain their negative trigger boundaries. No description was changed, so no trigger-audit stage is required.

## Automated gate

Full command outputs are preserved as `qa-validate.log`, `qa-test.log`, `qa-evals.log` and `qa-benchmark.log`. The test command uses local process/loopback/sandbox-fixture permissions; it is offline. Parser fidelity replays historical reports and does not measure new model judgment. See `qa-cross-check.json` for independent counts and evidence checks.

All four commands exited 0 in the required order: `npm run validate`, `npm test`, `npm run evals`, `npm run benchmark`. The full test command passed its 222 custom-runner checks and 1,335 Node tests, including recovery2 19/19. Structural evals passed 64 scenarios; parser benchmark passed all 30 historical reports.
