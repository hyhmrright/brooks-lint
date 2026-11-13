# V5 offline QA verdict: PASS

Date: 2026-11-13. QA made no live model calls and did not modify skill or implementation sources. The eval author repaired two QA findings before final v5 tests and the fresh Docker run.

## Gates and cross-artifact checks

- `npm run validate`: passed, including final post-repair check.
- `npm test`: passed; 222 helper checks and 1,300 Node test cases reported, zero failures. The final v5 suite ran after the repaired source and freeze were installed (34 v5 tests). Local loopback/native isolation permissions were explicitly enabled; no live models were invoked.
- `npm run evals`: 64 structural scenarios passed.
- `npm run benchmark`: 30 frozen parser reports, 100% parser fidelity; this is not model effectiveness.
- `npm run evals:codex:validate`: seven offline fixtures passed.
- Four manifests, six README badges, docs JSON-LD and CHANGELOG agree with package version 1.9.1. Source inventory derives 12 books, matching README/AGENTS/GEMINI. AGENTS claims 64 evals and actual suite contains 64. Six negative trigger clauses are present; descriptions were not changed. Details: `qa-cross-doc.json`.
- All 36 authored witnesses pass. Triplets cover 12 families and six modes. Protected test fixtures include mutation/rollback checks; missing governing obligations remain scoped unknowns. These are same-workflow development cases, not independent holdouts.
- `verify-history.mjs`: all 545 anchored historical artifacts unchanged.
- Extracted the final synthetic archive afresh and independently recomputed all five assessments. Each matched its archived assessment exactly. Successful run contains 324 completed responses; retry and wrong-model controls stop after the first failed attempt; missing usage and budget controls retain one completed answer and 323 not-run slots. See `qa-archive-replay.log`.
- The final registration verifies source/guidance/fixture seals and matches the documented model, effort and budget. Source drift is rejected at admission. Explicit live authorization is still required; offline evidence does not establish fresh authentication/backend availability.
- Fresh real Docker authored controls: eight controls passed. Four valid/protected candidates were admitted, completed with exit 0, and cleaned. Two unresolved fixtures were not executed. Two unchanged defects were admitted and failed assertion checks with exit 1, no timeout/transport error, and confirmed cleanup. See `docker-controls-final.json`; these are authored fixtures, not model-generated patch results.

## Resolved QA findings

1. `evals/research/skills-benchmark-v5/artifact-drill.mjs` initially accepted any unsuccessful candidate with cleanup as a negative behavioral control, including an admission failure; `artifact-check.mjs:14` marked execution performed before verifying an execution receipt. The author changed the predicate to require admission, a closed nonzero ERR_ASSERTION receipt, no infrastructure error or timeout, and cleanup; executionAttempted/performed now reflect the receipt. Regression covers admission denial, timeout and unrelated error. The original Docker receipts already showed genuine assertion failures and are retained in `docker-controls.json`; final fresh evidence confirms the stricter predicate.
2. `evals/research/skills-benchmark-v5/review.mjs:39` could mark a contradictory no-answer annotation with full credits as primary pass. The author now forces no-answer to fail, with a regression. Supported novel findings still remain distinct from false positives; ordinary frozen-label agreement is not substituted for the primary task outcome.

No unresolved blocking finding remains. Primary task outcome, labels, issue recall, unsupported/pending claims, tool receipt/shape and later sandbox results remain separate. Semantic credits require exact excerpts/reasons but remain AI-assisted reviewer judgments, not independent truth verification. The bounded Docker harness is not adversarial-proof semantic grading.

## Frozen next run

- Model/effort: gpt-6.1-terra / low; recorded CLI: 0.167.1.
- 36 cases x 3 arms x 3 repetitions = 324 submissions maximum.
- 12,000,000 observed tokens; 12 hours overall; 120 seconds per turn.
- No automatic retry or replacement; stop on first failure, retry, missing usage, proxy drift or admission budget exhaustion. Tokens are not a dollar cap and can overshoot by one admitted turn; failed usage may be unknown.
- Freeze: `1dabadb774478e3d80b38ecab492c002f02038f20abbc962a9b48aaa11d5b1fe`.
- Registration: `e1fd7864864137111f74a0f045dca627e64f70688048ac832a26220ba3624fd2`.

Ready for root to commit/push the offline preparation, then notify the user to switch/authorize the frozen real run. No release is requested or implied.

## Final formatting and seal addendum (root)

Staged whitespace checking found two trailing spaces in BV5-28/29 contracts. Their final semicolon and space became a period; no behavior or rubric changed. The author reran eight suite tests and the complete 324-response synthetic drill with four stop controls, resealed the package, and recomputed all five archived assessments. See `final-contract-format-tests.log` and `final-contract-format-replay.json`. The full repository and Docker gates above precede this punctuation-only correction; their original logs are preserved. The final hashes above and README refer to the corrected package. Historical 545-artifact verification still passes.
