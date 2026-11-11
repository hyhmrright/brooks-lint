# Recovery of the three-skill guide retest

The original run on the 42693ff freeze used Codex CLI 0.167.1 with ChatGPT login and CLI-selected gpt-6.1-terra / low. It completed 91 of 132 scheduled answers. Ordinal 92 (AS-02, arm A, repeat 3) failed and the remaining 40 were unrun. The verified original execution records 2,395,759 observed tokens, with unknown usage for ordinal 92.

## Failure and deadline

- **Symptom:** Ordinal 92 reached the deadline without a completed answer. Its 180,000 ms timer fired after 1,359,380 ms.
- **Source:** The CLI reported four stream timeouts and a WebSocket-to-HTTPS fallback before receiving partial answer deltas. The last delta arrived at 122,258 ms. The macOS power log records clamshell sleep at 18:15:28 China Standard Time (2026-11-11), overlapping that last delta and preceding the scheduled timer expiration. Maintenance wakes followed. The lid wake at 18:35:43 preceded terminal cleanup at 18:36:07. The overlap supports host suspension as the explanation for delayed timer dispatch. The earlier stream timeouts have no independently established root cause.
- **Consequence:** No completed agent message or terminal turn was received. The partial answer is preserved as diagnostic evidence. SIGTERM closed the child, the process group was confirmed absent, and the private home was removed. The elapsed-time overrun is charged to the study budget.
- **Remedy:** Use a process-scoped macOS idle-sleep assertion for recovery and keep the lid open while it runs. The frozen adapter's timer needs a running host to dispatch its callback. A sleep assertion against idle sleep cannot prevent lid closure or host suspension.

## Amendment

The maintainer authorized recovery after the first stop. Preserve the original registration, receipts, 91 answers and failed attempt. Seal the original evidence tree and record each new attempt in a fresh directory. Submit ordinals 92–132 once each in order, with at most 133 cumulative primary attempts for the 132 planned answers. Keep the same model, reasoning effort, CLI, prompts, guidance, scoring policy and login path. Retain the 180-second per-turn deadline, the eight-hour execution allowance, the five-million observed-token admission threshold and zero automatic harness retries. Carry forward the original observed usage and elapsed execution, including the anomalous delay. Stop on any new execution, identity, cleanup or usage failure. The threshold is checked between turns, and unobserved provider usage remains unknown.

The recovery verifier reconstructs the logical result with both attempts for ordinal 92 retained in the audit history. Review each completed answer using its original response identity and the frozen rubric. The previous 11-answer study used a different freeze and remains an independent historical artifact.

The sealed registration charges 8,981,902 ms, the observed wall span from the first attempt's start through the failure's cleanup. This exceeds the sum of the recorded attempt durations (8,980,075 ms) and includes the sleep interval and inter-attempt gaps. The recovery's original-run anchor is `bb21bdf1e420507ceecaed82544875050cc293c171fcbd6cdb4e1463dab33fef`.

`original-run.tar.gz` contains the verified original run. `SHA256SUMS` records its digest. To verify the original, extract to a new directory and pass its `run` directory to `node evals/research/skill-revision/runner.mjs verify` from the frozen source checkout. The recovery registration seals the original run at its local absolute path. Verification of merged records requires the original files at that registered path.
