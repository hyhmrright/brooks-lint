# QA round 3 — PASS for the macOS text-only comparison executor

## Gate

The final stable-source ordered gate passed: `npm run validate`, `npm test` (914/914, zero skips), and `npm run evals` (64 scenarios). Raw output and cross-document comparison results are retained under `qa-round3/`. `git diff --check` passed. This supersedes the current FAIL verdict without altering the earlier failure logs or diagnoses.

Cross-document comparison passed: package 1.9.1 equals four plugin manifests, all six README badges, landing-page JSON-LD and top CHANGELOG section; twelve source-inventory books match README/AGENTS/GEMINI wording; 64 evals match AGENTS; all six skill descriptions retain negative trigger boundaries.

## Reviewed boundaries and repaired findings

- Registration pins the historical plan anchor and common prompt bytes, current source hashes, order, model, effort and CLI version. The new text treatment stays separate from historical native-tool execution.
- Each turn has fresh process, private home and thread; only whitelisted case material and arm guidance enter the prompt. Unexpected tool activity fails the turn. Thread/turn event correlation and model/effort mismatch gates prevent accepting unrelated completion.
- Completed and partial message reconstruction preserves incomplete final text without duplicating completed deltas. Failed batch attempts stop later turns, preserve evidence and leave remaining rows not-run. Semantic reviews remain pending.
- The retained EPERM reproduction identifies signal-zero process observation in cleanup, not a model timeout. Darwin cleanup now uses byte/time-bounded `/bin/ps -g PGID -o pid=,pgid=,stat=`. Parsed rows must match the group; errors, malformed output and timeouts cannot become absence. Empty successful output (including empty exit 1) is the absence observation. Zombies and other returned members remain present. Leader exit suppresses further group signals. Unknown cleanup fails the run and retains the private home; it does not claim containment of escaped processes.
- Unsupported platforms are rejected before authentication or process launch. Darwin integration tests are skipped elsewhere; deterministic unit tests cover platform rejection and unknown/EPERM observations. The old smoke now uses the same Darwin cleanup mechanism and records its source digest while preserving its legacy result shape.
- Regression evidence includes 35 combined focused tests and eight complete post-fix 81-turn synthetic stress batches (648 turns) at concurrency four. The final full gate independently exercises an additional complete synthetic batch.
- The refreshed real Codex CLI 0.167.0 local fake-proxy observation matches current transport source, returns one synthetic response, selects the fixture model label and medium effort, exposes no upstream tools field, and confirms process-group absence/private-home deletion. Exact answer file and record agree. No real provider request was issued.

## Readiness and limits

PASS permits handing off the implemented **login-full-context-text-v1** execution path for an explicitly selected model and freshly anchored registration on macOS. No live run was authorized or performed in this QA stage. The user must still switch/select the evaluation model before the 81 primary turns. A failed/unclean turn stops the batch; neither retries nor recovery answers silently replace primary outcomes.

This is not evidence of real-account success for the next run, backend model attestation, a hard quota/cost cap, disabled provider-internal retries, native shell/OS containment, observed skill reads, independent holdouts, or runtime-skill benefit. All materials remain public and exposed. The 81 real answers and their semantic judgments do not yet exist. Real execution must retain those limits and use the frozen rubrics for later per-answer review.
