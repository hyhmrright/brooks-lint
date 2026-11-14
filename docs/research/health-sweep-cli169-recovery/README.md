# CLI 0.169 interrupted campaign recovery

This is an offline-prepared continuation, not a new comparison or permission to run models. The 37 completed answers, their exact annotations, original failure and published results remain immutable. The remaining schedule is original ordinals 38–48: one failed row replacement and ten previously unexecuted rows. Cases, prompts, criteria, selected model, effort, CLI, tools, source binding and proxy identity are unchanged.

## Diagnosis

The failed turn started at 2026-11-14T07:12:42.974Z and ended at 07:13:10.523Z (27,549 ms wall time; 27,547 ms monotonic). It was not the 120-second deadline. Successful finalize and assemble tool requests occurred at 19,642 and 23,845 ms. Partial answer deltas followed. At 27,515 ms, the CLI emitted `Reconnecting... 2/5`, `willRetry: true`, `responseStreamDisconnected` with no HTTP status, and `Connection refused (os error 61)`. Cleanup began in that same millisecond; termination and private-home removal were confirmed.

The failure therefore occurred after working authentication, model response and tool handling. A refused connection is established, but the refusing endpoint is not. Proxy availability, provider origin, local helper and intermediate network attribution cannot be established from this record. The first visible error already says 2/5, so this runner cannot claim it prevented all CLI-internal retries or determine the provider request count. No remote probe or real model was used in this investigation.

The runner correctly stopped after the first exposed retry notification without resubmitting a turn. Replacing the transport or restarting silently would alter the experiment. The offline improvement is a structured, hash-verifiable diagnostic sidecar separating observed transport evidence, unknown endpoint attribution, cleanup and token visibility. Failed row 38 reports **86,703 tokens**, included in the prior total; its usage is not unknown. The incomplete answer is excluded from semantic grading.

## Frozen limits

- Model: `gpt-6.1-terra`; effort: `low`; CLI: `0.169.0`.
- New submissions: at most 11; lifetime submissions: at most 49, including the original 38 attempts.
- Prior observed tokens: 2,879,712. Remaining observed-token admission ceiling: **1,620,288**; combined ceiling: 4,500,000.
- Prior elapsed execution: 1,280,496 ms. Remaining execution budget: **9,519,504 ms**; combined: 10,800,000 ms (three hours).
- Per turn: 120,000 ms or remaining run time, whichever is smaller. Monotonic elapsed and wall time cross-check, intent receipts and bounded cleanup are retained.
- Fresh output directory only; explicit `--live`; no automatic retries or implicit resume. Stop on first failure, exposed retry, unknown usage, identity, cleanup, tool receipt, source or admission drift.

The token ceiling admits by observed cumulative usage; a turn already admitted can overshoot it. This is not a billing cap. Cleanup may add the original bounded tolerance. Backend model identity and hidden retry counts remain unverified; CLI-selected identity is recorded.

## Offline verification and future commands

The preserved raw directory must exist at `_workspace/health-sweep-cli169-live`. On a fresh checkout, restore the original `raw-run.tar.gz` from `docs/research/health-sweep-cli169/results/2026-11-14-stopped/` to that location (inspect archive layout first). The freeze hashes every preserved raw file, original results, annotations, sources and original frozen plan. Recovery source inputs are explicitly enumerated in `suite.mjs`: six implementation/test files and this README; original criteria remain bound by the original plan. QA reports, logs and development artifacts are outputs and do not change the frozen inputs. Do not edit historical artifacts to satisfy validation.

```sh
node --test evals/research/health-sweep-cli169-recovery/recovery.test.mjs
node evals/research/health-sweep-cli169-recovery/drill.mjs FRESH_OFFLINE_DIR
```

Only after model-run authorization:

```sh
node evals/research/health-sweep-cli169-recovery/runner.mjs execute _workspace/health-sweep-cli169-recovery-live --live
node evals/research/health-sweep-cli169-recovery/runner.mjs verify _workspace/health-sweep-cli169-recovery-live
node evals/research/health-sweep-cli169-recovery/review.mjs packets _workspace/health-sweep-cli169-recovery-live NEW_PACKETS.json
node evals/research/health-sweep-cli169-recovery/review.mjs assess _workspace/health-sweep-cli169-recovery-live NEW_ONLY_ANNOTATIONS.json MERGED_ASSESSMENT.json
```

Annotate only newly completed eligible responses against the original criteria. The merger loads the original 37 annotations unchanged, verifies their answer bindings, excludes the earlier failure and includes new eligible answers. Complete collection permits 48 reviewed rows; interruption produces a labeled partial result. No invented grades, simulated answers or failed turns enter semantic aggregation. B is the generic-checklist control; C is skill guidance. Results remain same-workflow development evidence, not independently authored holdouts or proof of general superiority.
