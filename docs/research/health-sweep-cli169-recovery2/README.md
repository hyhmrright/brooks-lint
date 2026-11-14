# CLI 0.169 second interrupted-campaign recovery

This offline preparation preserves all 40 completed answers, their exact 37+3 annotations and both failed attempts. It does not authorize real model execution. Original ordinals 41–48 remain: one failed-row replacement and seven unexecuted rows. The original cases, prompts, rubric, model, effort, CLI, tools and proxy binding remain unchanged.

## Evidence and diagnosis

The first failure ended after 27,547 ms monotonic (27,549 ms wall time), after two successful tool requests. The second failure, original ordinal 41, ended after 22,810 ms monotonic, after one successful tool request at approximately 14,975 ms. Its exposed retry notification arrived at 22,779 ms and cleanup began immediately. Neither reached the 120-second deadline. Both expose `Reconnecting... 2/5`, `willRetry: true`, `responseStreamDisconnected`, no HTTP status, and `Connection refused (os error 61)`. Both confirm process-group termination and private-home removal.

The second failure reports 10,245 observed tokens; the first reports 86,703. Both are already counted in the cumulative budget. Connection refusal is established but the refusing endpoint is not. The identical notification does not establish identical root cause: proxy, provider, intermediate connection and local helper attribution remain unknown. The CLI already reports 2/5 on its first visible notification, so underlying request counts and hidden retries cannot be established. The collector did not resubmit. No network probe or real model was used for this investigation; network repair is not claimed.

The recovery adds a new frozen continuation and verifies retained history, annotations, cumulative budgets and transport diagnostic evidence. It keeps the existing transport unchanged rather than silently changing the comparison. Offline fixtures simulate boundary events; they do not reproduce a real CLI reconnect or verify remote availability.

## Frozen limits

- Generation model: `gpt-6.1-terra`; effort: `low`; CLI: `0.169.0`.
- Eight new attempts maximum; 42 prior attempts (40 completed, two failed); maximum 50 lifetime attempts for 48 answer slots.
- Prior observed tokens: 3,187,885. Remaining observed-token admission ceiling: **1,312,115**; combined ceiling: 4,500,000.
- Prior execution: 1,405,011 ms. Remaining execution: **9,394,989 ms** (2 h 36 min 34.989 s); combined ceiling: 10,800,000 ms.
- Per turn: 120,000 ms or remaining execution budget, whichever is smaller.
- Fresh directory and explicit `--live` required. No automatic retry or implicit resume. Stop on first exposed retry, failed turn, unknown usage, identity, cleanup, tool-receipt, source or admission drift.

The observed-token admission cap is not a billing cap: an admitted turn may overshoot it. Bounded cleanup tolerance remains. Recorded identity is CLI-selected; backend identity and complete provider billing remain unverified.

## Preservation and reproduction

The original raw directories `_workspace/health-sweep-cli169-live` and `_workspace/health-sweep-cli169-recovery-live` must exist. On a fresh checkout restore them from the respective `raw-run.tar.gz` archives under `docs/research/health-sweep-cli169/results/2026-11-14-stopped/` and `docs/research/health-sweep-cli169-recovery/results/2026-11-14-stopped/`; inspect archive layout first. The new freeze binds both raw directories, both results directories, previous recovery sources and original plan. Input sources are explicitly listed; QA logs and reports are outputs, not inputs.

```sh
node --test evals/research/health-sweep-cli169-recovery2/recovery.test.mjs
node evals/research/health-sweep-cli169-recovery2/drill.mjs FRESH_OFFLINE_DIR
```

Only after renewed model-run authorization:

```sh
node evals/research/health-sweep-cli169-recovery2/runner.mjs execute _workspace/health-sweep-cli169-recovery2-live --live
node evals/research/health-sweep-cli169-recovery2/runner.mjs verify _workspace/health-sweep-cli169-recovery2-live
node evals/research/health-sweep-cli169-recovery2/review.mjs packets _workspace/health-sweep-cli169-recovery2-live NEW_PACKETS.json
node evals/research/health-sweep-cli169-recovery2/review.mjs assess _workspace/health-sweep-cli169-recovery2-live NEW_ONLY_ANNOTATIONS.json MERGED_ASSESSMENT.json
```

Grade only newly completed eligible answers against the original frozen rubric. The merger retains all 40 earlier annotations unchanged and both failed records separately. Failed and simulated answers cannot enter semantic aggregation. A complete run produces 48 reviewed answers; interruption must be labeled partial. B is generic checklist and C is skill guidance; both require host tools. Same-workflow development cases and dependent repeats are not independent holdouts or human validation.
