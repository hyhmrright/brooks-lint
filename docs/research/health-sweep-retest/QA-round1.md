# Retest preparation QA — round one

Verdict: FAIL, 2026-11-14. No live requests. `npm run validate` passed. The complete `npm test` run was deliberately terminated with SIGTERM (exit 143) after concrete review findings, before completion; its partial output is preserved in `qa-round1-test-cancelled.log`. No full-suite PASS is claimed for this round.

1. `evals/research/health-sweep-retest/review.mjs:3` and `:8`: removing one LF from both strings does not accept the declared single missing LF for HS-02 (two expected LFs versus one delivered LF). Reproduced from the frozen synthetic record. Preserve strict equality; define the sensitivity as equality or exactly one missing final LF, rejecting added LFs, two missing LFs and other changes. Clarify that the semantic terminal-LF criterion binds the finalized artifact, while agent transport is separately measured.
2. `evals/research/health-sweep-retest/runner.mjs:35`: final token accounting does not enforce prefix admission. A 48-row simulation with the first row changed to the 3M-token ceiling, updated raw hash/receipt and total, still verifies all 47 subsequent submissions. Require each prefix to be below the admission ceiling and bind per-row admitted/finished elapsed time and raw timeout to the saved intent and remaining deadline.
3. `evals/research/health-sweep-retest/review.mjs:8`: valid JSON `null` survives parsing, fails shape checks, then throws at property access outside the catch. Malformed-shape model answers must remain assessable failures rather than abort packet generation. Add primitive/null/array cases.

Route all fixes to eval-curator. Re-freeze sources and criteria, regenerate the sealed synthetic evidence, and rerun the complete gate after fixes. Historical results and plan sources were not edited by QA.
