# QA round 1 — FAIL (implementation review)

The ordered repository gate passed: validate, unit tests, structural evals. Cross-document comparison passed: 1.9.1 across four manifests, six README badges, landing JSON-LD and CHANGELOG; twelve source books across README/AGENTS/GEMINI; 64 structural cases; all six negative trigger boundaries.

Implementation findings routed to the author before any live execution:

- `codex-login-turn.mjs`: completion and answer events are not correlated to exact thread/turn IDs; unrelated notifications could falsely complete a turn. Bind identifiers and reject mismatch.
- `codex-login-turn.mjs`: selected reasoning effort is recorded but not checked against registration. Reject mismatch before model turn submission.
- `codex-login-turn.mjs`: partial extraction chooses completed messages instead of later deltas whenever any message completed. Preserve completed commentary plus incomplete final output without duplication.
- `codex-login-study.mjs`: common prompt is arbitrary despite documentation promising the frozen prompt. Pin its bytes/hash.
- `codex-login-study.mjs`: failed batch CLI prints a stop but exits successfully. Exit nonzero for incomplete batch.
- `codex-login-study.mjs`: setup failures outside the per-turn catch can prevent final status exports. Preserve failure evidence and remaining not-run rows.

Required follow-up includes regression tests, a fresh native CLI/local fake-upstream drill, and the entire ordered gate. No live provider requests were made.
