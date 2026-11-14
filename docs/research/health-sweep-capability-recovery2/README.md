# Capability second recovery: remaining 41 answers

Offline preparation only. Preserve 55 completed answers, exact 53+2 annotations, both failed attempts and the original real smoke. Continue original ordinals 56–96, replacing the failed slot once and submitting 40 never-run slots. No existing answer is rerun or regraded. Prompts, skill sources, criteria, tools, Docker policy and transport remain unchanged.

## Diagnosis

Original failure 54 occurred during account/read at 53 ms, before any recorded thread/start or turn/start; cleanup completed at 83 ms. Its usage remains unknown, not zero. Recovery failure 56 occurred after successful finalize and assemble tool requests, with 75,482 observed tokens. It ended at 21,230 ms monotonic (21,232 ms wall), not the 120-second deadline. The CLI exposed Reconnecting... 2/5, willRetry true, responseStreamDisconnected, no HTTP status, and Connection refused (os error 61). Cleanup confirmed process-group absence and private-home removal.

These failures have different observed phases. Neither record identifies the failing endpoint or proves proxy, credential, local helper or provider causality. No network/account probe or model call was made. The first visible retry already says 2/5, so hidden CLI retries/provider request counts are unknown. The collector did not resubmit. No speculative network repair is claimed. The new structured diagnostic compares retained error, phase, tool and cleanup evidence; account/read response bodies remain excluded by the historical transport's privacy policy.

## Frozen admission

- gpt-6.1-terra / low; Codex CLI 0.169.0. Same hash-bound binary, proxy, real smoke and Docker isolation.
- 41 new calls maximum; 57 previous attempts, 55 completed and two failed. At most 98 lifetime attempts for 96 answer slots.
- Prior observed usage: 3,543,939. Remaining observed-token ceiling: **8,456,061**, combined 12,000,000.
- Prior elapsed: 1,641,455 ms. Remaining: **27,158,545 ms** (7 h 32 min 38.545 s), combined eight hours. Per model turn at most 120,000 ms or remaining run time.
- Prior failure 54 retains unknown usage/billing. Failure 56's 75,482 tokens are included above. Renewed admission uses observed usage only; this is not a complete billing cap and admitted calls may overshoot it.
- Fresh output, explicit --live and verified current real smoke required. Stop on first failure, exposed retry, unknown new usage, identity/source drift or cleanup/isolation failure. No automatic retry or silent resume.

## Offline evidence and later commands

The freeze binds original and first-recovery raw directories and published results, first-recovery sources, original plan and explicit new input files. QA reports are outputs outside the seal. Restore `_workspace/capability-formal`, `_workspace/capability-recovery` and `_workspace/capability-smoke` from their published raw archives if needed. Both prior failures remain distinct; the merger retains every old annotation and its uncertainty unchanged. Only newly eligible answers may be annotated. Failed or simulated responses cannot enter semantic results.

```sh
node --test evals/research/health-sweep-capability-recovery2/recovery.test.mjs
node evals/research/health-sweep-capability-recovery2/drill.mjs FRESH_SIMULATION_DIR
```

Captured routing and retry records are injected at the transport boundary. These tests establish fail-stop/no-resubmission and preserved diagnostics, not a newly reproduced remote fault. Docker and login transport reuse the unchanged previously verified implementation.

Only after renewed user authorization:

```sh
node evals/research/health-sweep-capability-recovery2/runner.mjs execute formal _workspace/capability-recovery2 --live _workspace/capability-smoke
node evals/research/health-sweep-capability-recovery2/runner.mjs verify formal _workspace/capability-recovery2
node evals/research/health-sweep-capability-recovery2/review.mjs packets _workspace/capability-recovery2 NEW_PACKETS.json
node evals/research/health-sweep-capability-recovery2/review.mjs assess _workspace/capability-recovery2 NEW_ANNOTATIONS.json MERGED_REPORT.json
```

Historical scoring ambiguities, non-file evidence limitations and label-versus-semantic distinctions remain. Cases are same-workflow development fixtures, not independent holdouts. CLI-selected identity is recorded; backend identity, hidden activity and full billing remain unverified.
