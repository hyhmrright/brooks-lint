# Independent QA — amended health/sweep recovery

Date: 2026-11-14. Verdict: **PASS**. No real model calls were made by this QA. No implementation fixes were required.

## Cross-boundary evidence

- Independently extracted the committed failed run and compared all five tool events with `failed-requests.json`. Every call ID is unique; the fifth tool name, thread and turn are correct. Its cap rejection is distinct from duplicate/scope failure. Raw record digest matches prior-evidence.json.
- Both arm prompts receive the same complete public ledger/status contract, example and tool allowance. Tool JSON schema provides the complete nested ledger fields. Only checklist versus skill guidance differs; the protocol is explicitly amended, with zero prior completed answers.
- Compared the new login transport to the prior frozen transport. Changes are the scope label, admission helper import/use and recording rejected requests; authentication, proxy, toolchain, process isolation, deadlines and cleanup paths are unchanged. Payload errors consume accepted request slots, ID/scope/cap rejections terminate with captured evidence. Eight tool requests are not eight model submissions.
- Independently extracted and verified all eight archived scenarios: 48 success slots plus seven stop controls. Every regenerated summary equals its archived summary. Author artifact hashes match. The integration regression replays all five exact invalid argument payloads, then successful sixth finalization and seventh assembly, and tests ninth-call cap, repeated ID and wrong tool with cleanup.
- Source/plan/prior anchors bind old archive and registration; all 321 historical files remain unchanged. Remaining budget arithmetic is 3,000,000−37,409=2,962,591 tokens and 10,800,000−28,192=10,771,808ms; 48 new calls plus one failed call gives 49 lifetime. Prefix token/time admission and retained timeout intents are checked. Live mode is explicit and fresh-output-only; simulation cannot enter semantic assessment.
- Host assembly is not substituted for the agent answer. Strict equality and exactly-one-missing-LF sensitivity remain separate. JSON primitives become invalid artifacts rather than aborting assessment. Quotes, hashes and semantic annotations are required for completed answers.
- Package/manifests, six README badges, landing JSON-LD and top changelog agree at 1.9.1. Inventory derives 12 books, matching README/AGENTS/GEMINI. Actual 64 evals match AGENTS; all six skill descriptions retain negative trigger boundaries. See `qa-cross-check.json`.

## Limits

Offline protocol fixtures do not establish provider acceptance, fresh login validity, backend serving identity or model compliance with the amended schema. The eight authored cases are not independent holdouts. Observed token admission can overshoot by one turn; this is not a dollar billing cap. Candidate patches are not executed. Subsequent model confirmation is required before live execution. The old failure and strict results are not rewritten.

## Complete automated gate

Commands ran in order and all exited 0: `npm run validate`, `npm test`, `npm run evals`, `npm run benchmark`. Raw logs are retained as `qa-validate.log`, `qa-test.log`, `qa-evals.log`, `qa-benchmark.log`. Tests: 222 custom-runner plus 1,365 Node tests, zero failures or skips, including all 11 new regressions. Structural evals: 64. Parser benchmark: 30/30 inventories and SARIF validity. Local process/loopback permissions were used only for offline fixtures. No provider request was sent. Staged source whitespace check passed.

Frozen plan body SHA-256: `72993f6a81cb2be6891cfa10f34ebf138d636a317cba0004a5ae827f1cfc8baf`. Preparation is ready for a later explicitly confirmed live run; this report is not itself execution authorization.
