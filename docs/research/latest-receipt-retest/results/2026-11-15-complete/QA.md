# Independent QA — PASS

Date: 2026-11-15. Scope: the newly archived six-call latest-receipt retest. This is a separate maintainer-agent QA pass, not independent human adjudication. No real model calls were made during QA; no source, frozen plan, historical result or failure record was edited.

## Automated gate

Executed in required order, all exit 0:

1. `npm run validate` — `qa-validate.log`.
2. `npm test` — `qa-test.log`, including both historical recovery snapshot lifecycles.
3. `npm run evals` — `qa-evals.log`, 64 structural scenarios.

Additional offline checks passed:

- `npm run benchmark` — `qa-benchmark.log`: 30/30 exact severity counts and valid SARIF, risk precision/recall 100% on the frozen parser corpus.
- `node --test evals/research/latest-receipt-retest/protocol.test.mjs evals/research/capability-calibration/calibration.test.mjs` — `qa-targeted.log`: 17/17, zero failures, including the actual successor fake-transport positive/adverse sequences.

## Boundary comparisons

- Extracted `raw.tar.gz` into a fresh temporary directory. Archive SHA-256 matches `archive.json`; all 32 extracted files match both the per-file inventory and the original live directory byte for byte. Reproduced frozen runner verification and review from extracted records; parsed outputs equal the saved JSON. All 7,610 historical hashes remain unchanged. Details: `qa-independent.json`.
- Compared every row of `model-information.json` with its raw record: requested and selected model/effort, CLI version, authentication type, toolchain hashes, thread/turn identities, timestamps, usage and latest receipt agree. Total observed usage is 419,318 tokens; the run completed all six calls in 188,325 ms. Each turn is below 120 seconds. Identity is CLI-selected, not verified provider backend identity; usage is not a billing total.
- Inspected all six final answers and ten finalized ledgers against the clean bounded fixture. Every ledger has no diff, skipped PR and three assessed clean dimensions. All final reports equal the latest successful finalization; frozen verification establishes exact latest assembly delivery. The unique canonical score is 100, with retained weight 75 and weighted sum 7500. No source/test execution or repair is falsely claimed; row 5 omits host operations from its checks without claiming execution. Details: `qa-semantic.json`.
- Independently compared four plugin manifests, six README badges, landing-page JSON-LD and CHANGELOG against package version 1.9.1. Derived 12 books from source frontmatter and compared README/AGENTS/GEMINI wording. Actual 64 evals match AGENTS claims; all six shipped skill descriptions include their negative trigger boundary. Details: `qa-cross-doc.json`.

## Verdict and limits

PASS. No actionable inconsistencies found. Reported B 3/3 and C 3/3 are receipt-protocol outcomes on instructed development cases, not evidence of skill advantage, independent generalization or autonomous repair. Hidden provider retries and backend model identity remain unverified. Historical grades remain unchanged.
