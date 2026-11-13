# V5 recovery preparation QA

Verdict: **PASS** — offline preparation only. Reviewed 2026-11-14 (Asia/Shanghai). No live model, new login test, Docker drill, or recovery submission was performed. No source or historical result was edited by QA.

## Automated gate

Executed in order, with complete stdout/stderr retained:

1. `npm run validate`: exit 0; repository version 1.9.1 passed. Changelog coverage explicitly not audited because v1.9.1 is already tagged.
2. `npm test`: exit 0; 222 validator helper checks plus 1,316 Node tests passed, zero failures. Includes all 16 new recovery regression tests. Elevated local execution permitted loopback fixture servers and subprocess checks; these are offline tests, not provider calls.
3. `npm run evals`: exit 0; 64 structural scenarios passed.
4. `npm run benchmark`: exit 0; frozen 30-report parser fidelity 100%, SARIF validity 30/30. This is not a model-effectiveness result.

Logs: `qa-validate.log`, `qa-test.log`, `qa-evals.log`, `qa-benchmark.log`. Both staged and unstaged `git diff --check` passed.

## Independent artifact comparison

Extracted the committed original raw archive and committed synthetic archive into fresh QA directories, then rebuilt the plan from the extracted original and reverified every archived synthetic segment. `qa-artifacts.json` records the results. The plan SHA-256 is `549fc80e8edd754681a359f14b2907dbc0a40e3437f2407d93414bd86fd12ea1`.

- The original execution, all 78 successful raw records and annotations, and failed ordinal 79 remain bound to the frozen plan. All 280 files in `history-hashes.json` match their recorded hashes.
- Ordinals 79–324 contain exactly 246 slots: one replacement plus 245 previously unrun slots. Maximum lifetime collector submissions are 79 + 246 = 325.
- Original observed tokens 1,315,995 and recorded elapsed time 1,590,911 ms are carried forward. Remaining admission headroom is 10,684,005 observed tokens and 41,609,089 ms within the original 12-million-token/12-hour limits. Failed original usage remains unknown; no billing-cap claim is made.
- Extracted success simulation verifies all 246 completions. Eight separate controls verify failure, observed retry, wrong identity, incomplete cleanup, unknown usage, token admission exhaustion, elapsed deadline and proxy drift. Extracted summaries exactly match the published summary.
- Synthetic records are explicitly labeled and rejected by real combination. They are authored in-process records, not an independent Codex transport or backend test.

## Execution and adjudication boundaries

Read recovery implementation, tests, drill and inherited registration/readRun/assessment checks together. Explicit live mode and fresh output are required; live fixture injection is forbidden. Admission rechecks frozen original source/prompt registration, toolchain and proxy. Per-turn timeout is bounded by the remaining cumulative budget and 120 seconds. No automatic resubmission occurs; a failure, retry, missing usage or verification error stops further admission.

Verification compares each ordinal/case/arm/repetition against the original schedule, recomputes raw hashes and usage, verifies receipts and intent budgets, enforces contiguous execution before a stop, and checks completed-answer identity, provenance, scoring receipts and cleanup. Verification-failure segments cannot merge into real adjudication. Combined records preserve the first 78 response identities, replace only the scheduled failed slot, and retain the original failed event separately. Review rejects modified or missing historical judgments; inherited assessment rejects duplicate annotations and missing completed-answer judgments.

Offline evidence does not establish current authentication freshness, backend availability, independent backend model attestation, or zero provider-internal retries. Observed-token admission can overshoot by one admitted turn; elapsed accounting excludes the human pause. These limitations agree between implementation, plan and README.

## Cross-document comparisons

`qa-cross-doc.json` retains the compared values. Package version, four plugin manifests, six README badges, docs landing-page JSON-LD and CHANGELOG top section all equal 1.9.1. Derived inventory contains 12 books; README.md, AGENTS.md and GEMINI.md all describe twelve classic engineering books. AGENTS.md's 64-scenario claims match the actual eval array. All six skill descriptions contain the final negative trigger boundary. No skills or descriptions changed in this task.

No blocking findings. Ready for the parent agent to commit and push task-owned preparation and QA artifacts. Real recovery remains pending user model confirmation and authorization.
