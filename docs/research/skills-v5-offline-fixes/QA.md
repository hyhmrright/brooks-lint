# Offline fixes QA — round 3

Date: 2026-11-14. Verdict: **PASS** after the explicitly authorized third round. No live model calls. Rounds 1 and 2 remain retained as failed development gates.

## Complete automated gate

| Command | Exit | Result | Raw evidence |
| --- | ---: | --- | --- |
| `npm run validate` | 0 | Repository consistency PASS | `qa-round3-validate.log` |
| `npm test` | 0 | 222 custom-runner tests plus 1,345 Node tests; zero failures, zero skips | `qa-round3-test.log` |
| `npm run evals` | 0 | 64 structural scenarios PASS | `qa-round3-evals.log` |
| `npm run benchmark` | 0 | 30 frozen parser reports PASS | `qa-round3-benchmark.log` |

The complete chain executes all eight unchanged historical v5 suite tests, all 16 unchanged first-recovery tests, and all 19 unchanged second-recovery tests. No assertions were filtered or skipped. The current campaign/artifact suites and three new lifecycle regressions also run. Second recovery completed in 255,406.1965 ms. Local-process/loopback fixture permissions were required; no real model was contacted.

## Boundary comparisons

- The historical runner accepts only `suite`, `recovery`, `recovery2`, or `recoveries`, rejecting arbitrary paths and live flags. It reconstructs 20 guidance Markdown files from the anchored retained prompt, validates individual content hashes and safe paths, and writes only into a disposable copy. The copy excludes `.git`, credentials, private workspace and dependencies. A `finally` block removes it on success or failure.
- All 321 historical files are hash-verified before and after replay inside the copy and against the original checkout. Independent QA recomputed the same 321 hashes after the full run: unchanged. The current tracked diff contains no historical plans, sources, annotations or answers.
- Historical and current guidance are explicitly separate. Historical freeze is `1dabadb774478e3d80b38ecab492c002f02038f20abbc962a9b48aaa11d5b1fe`; current prospective freeze is `7a5532d40556ddb2047737c9b33e93b1306da5926277c4e7b6de9e84f286d58d`. This corrects the prose role assignment in the preserved first-round QA report, which confused assertion actual/expected with historical/current. No historical digest was changed.
- The delivery helper is connected through the actual health guide and score-ledger instructions. It verifies retained ledger/report receipt digests, compares exact supplied delivery text, safely assembles a JSON report field, rejects a report override and refuses output overwrite. Tests replay all eight historical C health failures from committed archives: each differs only by the missing terminal LF. The old strict grades remain untouched.
- Sweep guidance gives exhausted budgets precedence, distinguishes missing obligations/checks from a completed clean assessment, and separates known defects with no safe progress from verification blockers. The shared input-domain rule distinguishes caller preconditions from explicit rejection duties. Paired executable witnesses exercise this distinction; authored stop annotations are clearly not presented as model-compliance evidence.
- Package version, four manifests, six README badges, landing-page JSON-LD and top CHANGELOG version agree at 1.9.1. The derived source inventory is 12 books, matching README/AGENTS/GEMINI. AGENTS's 64-scenario claim matches the actual eval inventory. All six skill descriptions retain negative trigger boundaries; descriptions did not change. Details are retained in `qa-cross-check.json`.

## Limits

This PASS proves offline helper behavior, regression execution and historical/current separation. It does not prove improved model adherence, later UI/provider transport fidelity, diagnostic generalization or autonomous repair success. The delivery receipt checks supplied bytes, not a subsequent transport. Sweep calibration labels are not an executable semantic evaluator. Any new live evaluation requires a separately disclosed model/call/budget plan; none ran here.

Round-one and round-two reports and raw failure logs remain preserved. The final gate is the third-round command sequence above. No release was requested.
