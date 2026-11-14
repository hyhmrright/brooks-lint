# Offline fixes QA — round 1

Verdict: **FAIL**, 2026-11-14. No live model calls.

- `npm run validate`: PASS.
- `npm test`: FAIL at `evals/research/skills-benchmark-v5/suite.test.mjs:4`, “current prospective freeze is exact while history stays immutable”. That assertion compares the completed historical freeze against newly edited shipped guidance. Its expected digest is `7a5532d40556ddb2047737c9b33e93b1306da5926277c4e7b6de9e84f286d58d`; current generation is `1dabadb774478e3d80b38ecab492c002f02038f20abbc962a9b48aaa11d5b1fe`. A completed campaign needs archival validation rather than a perpetual equality requirement with evolving skills. Route to eval-curator; do not reseal or edit historical evidence to pass this gate.
- `npm run evals`: PASS, 64 scenarios.
- `npm run benchmark`: PASS, 30 reports.

Cross-document comparison passes: version 1.9.1 across manifests, six README badges, JSON-LD and CHANGELOG; derived 12-book inventory matches README/AGENTS/GEMINI; 64-eval claim agrees; six descriptions retain negative boundaries. All 321 historical hash entries are unchanged. Details are in `qa-cross-check.json`.

The new helper is referenced from the actual health guide and ledger instructions. It verifies both retained ledger/report receipt hashes and actual delivery text, assembles JSON from the artifact, rejects report overrides and refuses output overwrite. Its guarantee is explicitly limited to supplied bytes; no downstream model or UI transport guarantee is asserted. The eight archived health mismatches replay as only a lost LF; no semantic score change is claimed. Sweep guidance distinguishes unknown obligations from protected behavior and explicit rejection duties from caller preconditions. Its fixture labels are not presented as model compliance tests.

Final readiness remains blocked on correcting the historical/current validation boundary and rerunning the complete offline gate. Raw failure output is preserved in `qa-test.log`.
