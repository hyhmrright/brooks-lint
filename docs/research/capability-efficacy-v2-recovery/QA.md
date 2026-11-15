# Recovery QA

Verdict: PASS (2026-11-15). No real model invocation.

Final source freeze: `b94b0d2e2d6d25aa55d618fe58ec077ea2ac3d2141a17c8d924383dfe0870f4c`.

The final-source sequential gate passed: `npm run validate`, `npm test`, `npm run evals` (64 scenarios), `npm run benchmark` (30 reports), and the recovery protocol tests (6). Logs are retained in `qa/`. Process tests ran in the authorized environment. An initial full gate also passed, but the final gate was rerun after author loopback added successful admission/collector-exception regression coverage and clarified verification of preflight-only records.

Cross-document checks: package and four manifests, all six README badges, CHANGELOG top release and landing-page JSON-LD agree on 1.9.1. The source inventory lists 12 books; README, AGENTS and GEMINI state twelve. AGENTS' 64 eval claim matches the JSON array. All six shipped skill descriptions carry the required negative-trigger clause. No shipped skill content changed.

Recovery preserves the original freeze/schedule and prior failure hashes. Zero prior submissions leave 72 model slots and the full observed-token budget. The explicitly renewed six-hour collection window excludes unmeasured prior admission duration; it is not cumulative wall-time accounting. Failure is preserved before a campaign directory exists. Injected offline tests prove single collector invocation, original plan/prerequisite arguments, no retry after admission or collector failure, unknown submission count when a campaign already exists, and refusal to reuse output. They do not attest live provider availability or model identity. Historical record hashes are checked through the original anchored validator.
