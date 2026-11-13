# Second v5 recovery — independent QA

Date: 2026-11-14. Verdict: **PASS**. No implementation changes were required by QA. This gate is offline and makes no new model request.

## Automated gate

Commands ran in this order; each exited 0. Raw logs are in `offline/`.

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run validate` | PASS, version 1.9.1 | `qa-validate.log` |
| `npm test` | PASS: 222 custom-runner tests and 1,335 Node tests, zero failures | `qa-test.log` |
| `npm run evals` | PASS: 64 structural scenarios | `qa-evals.log` |
| `npm run benchmark` | PASS: 30/30 severity inventories and SARIF; risk-code precision/recall 100% | `qa-benchmark.log` |

The final recovery2 suite passed 19/19 in 250,823.510459 ms during the complete test command. The tests required local process, loopback, and sandbox-fixture permissions, not a real model channel. The parser benchmark replays its frozen corpus; it does not measure new model behavior. Changelog coverage correctly stood down because version 1.9.1 is already tagged; no release is requested.

## Boundary-crossing checks

- Independently extracted both historical raw archives and the final synthetic archive into a separate temporary directory. Recreated and validated the recovery plan against those extracted histories, then verified every raw synthetic scenario against its saved summary. All 125 success slots and eight stop controls agreed.
- Recomputed all 321 entries in `history-hashes.json`: unchanged. Recomputed every author evidence hash in `offline/artifacts.json`: matched. Raw archive hashes and cross-document results are saved in `offline/qa-cross-check.json`.
- The plan retains 199 completed raw hashes and the combined199 annotation digest, binds both historical execution manifests and the two failed raw records, and preserves response IDs. Judgment preservation rejects changed, missing, and duplicate old judgments. Combining keeps both historical failures separately from answer slots and refuses synthetic or verification-failed execution.
- The schedule admits only ordinals 200–324: 125 new submissions, including the failed ordinal 200 replacement. Prior 201 attempts plus 125 gives at most 326 lifetime submissions for 324 answer slots.
- Budget arithmetic agrees across implementation, plan, and README: 12,000,000 minus 4,284,856 gives 7,715,144 observed tokens; 43,200,000 minus 4,587,374 gives 38,612,626 ms. Each admitted turn is limited to the smaller of 120,000 ms and its remaining cumulative time. Deadline calculation follows source/toolchain admission checks.
- Live mode requires an explicit flag, fresh output, frozen sources/toolchain/proxy, requested and selected model identity, and intact historical evidence. A failure, retry observation, unknown new usage, verification problem, or admission drift stops further submissions. No automatic resume or retry path was added. Raw receipt, intent, elapsed-time, identity, cleanup, source, history, and status tampering are covered by regression tests.
- Package version, all four plugin manifests, all six README badges, landing-page JSON-LD, and top CHANGELOG version agree at 1.9.1. The source inventory derives 12 books, matching README/AGENTS/GEMINI wording. AGENTS's 64-scenario claim matches the eval file. All six shipped SKILL descriptions end with their negative trigger boundary. No skill description changed.

Frozen plan body SHA-256: `7361d6705fa39f7dfe9f6b1afb1b28bf0a3912af9eff15673d99d78da1c8995c`.

## Limits and next gate

Synthetic records are authored protocol fixtures, not model answers, semantic grades, fresh login proof, or independent provider-identity attestation. Both historical failures still have unknown usage. The observed-token admission budget is not a billing cap and may overshoot by one admitted turn. Human pauses are excluded from recorded cumulative execution time. Existing adjudication and partial-arm limitations remain unchanged.

This PASS establishes offline readiness only. Subsequent maintainer model confirmation is required before the explicit live command. No model requests, live authentication checks, provider reconnects, or new skill-effectiveness claims were made in this QA run. Development source-drift failures remain separately labeled and preserved alongside final passing evidence.

Raw development test logs retain four whitespace-only lines exactly as emitted. The staged whitespace check flags those archival lines; the same check excluding raw `.log` evidence passes. The logs were not rewritten, preserving their recorded hashes.
