# Semantic scoring QA — 2026-11-10

Verdict: **PASS**. No blocking findings. Reviewer: a separate Codex QA agent using `gpt-6-astra`, inheriting workflow context and seeing the authored annotations. This is a second model review, not independent human validation or blinded adjudication. No live model evaluation was invoked.

## Executed validation

The required gate ran sequentially: `npm run validate`, `npm test`, `npm run evals`; all exited 0. `npm run benchmark` also exited 0. The test runner reported suites of 6, 914, 75, 67 and 16 tests, all passing with zero skipped; its preceding validator-helper checks also passed. Structural evals cover 64 scenarios. Parser fidelity: 30/30 severity inventories and SARIF records, risk precision/recall 100% (56 true positives, zero false positives/negatives). These are offline checks, not model-performance scores. The changelog audit explicitly stood down because v1.9.1 is already tagged; this task does not publish a release.

Both `node docs/research/runtime-results/2026-11-10-hb-bv-terra-low/score-review.mjs` and `node docs/research/runtime-results/2026-11-10-hb-bv-terra-low/reproduce-novel.mjs` passed. The former validated all 54 archived answer hashes and excerpts, frozen rubric copies, schedule linkage and regenerated statistics. The latter returned ordinaryControl=`new`, boundaryHit=`old`, generation=9007199254740992, wholeLifetimeExecuted=false. The current BV-05 input files were additionally compared byte-for-byte against all five frozen archived input files and matched. The witness currently imports checkout files, so future reruns must repeat that source comparison if fixtures change.

## Boundary comparisons

Package, all four manifests (including marketplace entry), six README badges, landing-page JSON-LD and top CHANGELOG section all carry 1.9.1. The source frontmatter lists 12 books, matching the words in README, AGENTS and GEMINI. The actual 64 evals match AGENTS. All six shipped skill descriptions contain their negative trigger boundary. No trigger descriptions changed.

All 54 annotation rows were checked for case/arm inventory and issue/evidence decisions. QA reread the complete retained excerpts for all nine BV-03, BV-05 and BV-06 answers and compared their disputed judgments with the frozen protocol:

- BV-03: all arms prescribe correction despite missing reporting semantics. B explicitly calls delivery a confirmed defect; its producer paragraph is conditional despite contrary framing. Retaining that producer claim as pending, with both sensitivity outcomes, is justified. Impact disclaimers do not supply a benign contract interpretation.
- BV-06: A/B withhold judgment correctly but do not explicitly judge the same stale behavior under a permissive contract. C does. The evidence-completeness difference follows the frozen explicit-alternative threshold.
- BV-05: incrementing from zero reaches 2^53 by exact integer steps, then the next increment rounds back. The bounded state witness establishes the resulting stale publication; it does not execute the enormous lifetime or establish production exposure. The amendment applies uniformly to A/B/C while preserving frozen scores. Pending-only sensitivity appropriately preserves the alternative practical-reachability view. The ordinary-trace answer A is scored as missing the amended issue rather than automatically counted as an additional affirmative universal-safety claim.

The report correctly keeps label agreement, issue recall, unsupported assertions, pending claims, evidence and amendment sensitivity separate. Frozen recall has no arm difference; a single evidence requirement improvement cannot establish general runtime-skill benefit. Recovery batch effects and non-independent public calibration remain explicit.

## Command log inventory

Complete local stdout/stderr logs are retained under `_workspace/brooks-harness/qa-20261110/` (ignored workspace, not distributed artifacts). Their digests identify the exact local gate records; portable outcomes are recorded above. Commands are reproducible from the checkout.

| Log | SHA-256 |
| --- | --- |
| `validate.log` | `a74cc96fd8b5930c9957d79f685cea5dd45c492ba6e9e7e2d146806603795099` |
| `test.log` | `bda1908e4001c5a45e86f4e8309949458e0653d68ffbecfe9e2df966983cc915` |
| `evals.log` | `2540f0890f6729e1f43acb1b562761d19ea89431a035eb22aaf3c27ab06f44c6` |
| `benchmark.log` | `6eca5b37fd07d3541306494cff16fc92ee13d1083a171499bf33c0af49baf69f` |
