# Capability formal recovery: remaining 43 answers

Offline-prepared continuation only; no real model authorization is implied. Preserve the 53 completed answers and exact annotations, the failed ordinal 54, the original smoke, and all historical scoring ambiguities. Original ordinals 54–96 are the failed-slot replacement plus 42 never-submitted slots. No old answer is rerun or regraded.

## Diagnosis and bounded improvement

The failed CLI initialized successfully at 50 ms. The collector sent `account/read` with `refreshToken:false`; at 53 ms the RPC failed with `workspace routing discovery failed`, then cleanup started. Completion was 83 ms. Recorded requests contain only `initialize` and `account/read`: no `thread/start` or `turn/start` was observed. No auth identity or usage was returned, stderr and event notifications were empty, and cleanup confirmed both process-group absence and private-home removal. This was not a 120-second model timeout or an exposed transport retry.

The historical transport deliberately excludes account/read response bodies from retained RPC responses, so its error string and timing do not reveal that response body, endpoint or routing dependency. A credential, proxy, local helper or service cause cannot be established. No account probe, remote test or model call was made. The same initialization worked on preceding attempts, but that is not proof that the route is now repaired. No speculative transport change or retry is introduced. A structured sidecar now classifies the retained phase/error, request methods, unknown usage and cleanup. Its evidence is reconstructed from the captured record, not a newly captured failed RPC response.

## Explicit renewed admission policy

- Model `gpt-6.1-terra`, effort `low`, CLI `0.169.0`; prompts, criteria, toolchain/proxy identity, static skill inputs and Docker isolation are unchanged.
- 43 new attempts maximum; prior 54 attempts (53 complete, one failed); lifetime maximum 97 attempts for 96 answer slots.
- Prior observed usage 3,402,884; remaining observed-token ceiling **8,597,116**, combined 12,000,000.
- Prior execution 1,566,800 ms; remaining **27,233,200 ms** (7 h 33 min 53.2 s), combined eight hours. Per model turn 120,000 ms or remaining run time, whichever is less.
- The failed ordinal 54 has **unknown usage**, not zero. Lack of a recorded turn/start supports classifying it as pre-turn failure but does not prove zero provider work or billing. This recovery explicitly retains that unknown historical amount; only observed usage controls the renewed admission budget. Any new unknown-usage result still stops the run. An admitted turn may overshoot the observed ceiling; this is not a billing cap.
- Require a fresh directory, explicit `--live`, and the same verified real smoke receipt. Stop on first execution/retry/usage/identity/source/cleanup/isolation failure; no automatic retry, silent resume or recovery-on-failure.

## Frozen inputs, verification and commands

Both prior raw directories and published formal result files are hash-bound. Restore `_workspace/capability-formal` and `_workspace/capability-smoke` from their respective published archives if needed; inspect their layouts first. The new freeze seals explicit implementation/test/README inputs; QA outputs do not invalidate it. The merger loads all 53 original annotations unchanged and accepts only newly eligible answer IDs. Failed and simulated answers cannot enter grading. Original non-file evidence and label-versus-semantic limitations remain; this recovery does not repair or reinterpret the frozen grader.

Offline checks:

```sh
node --test evals/research/health-sweep-capability-recovery/recovery.test.mjs
node evals/research/health-sweep-capability-recovery/drill.mjs FRESH_SIMULATION_DIR
```

The captured account-read error is replayed at the injected transport boundary. It demonstrates fail-stop/no-resubmission and retained request/cleanup evidence, not a new real CLI routing fault or a remote fix. Candidate isolation reuses the unchanged, previously independently tested Docker implementation. Simulation does not execute model-generated code or unlock live admission.

Only after renewed user model-run authorization:

```sh
node evals/research/health-sweep-capability-recovery/runner.mjs execute formal _workspace/capability-recovery --live _workspace/capability-smoke
node evals/research/health-sweep-capability-recovery/runner.mjs verify formal _workspace/capability-recovery
node evals/research/health-sweep-capability-recovery/review.mjs packets _workspace/capability-recovery NEW_PACKETS.json
node evals/research/health-sweep-capability-recovery/review.mjs assess _workspace/capability-recovery NEW_ANNOTATIONS.json MERGED_REPORT.json
```

All cases are same-workflow development fixtures; no independent holdout or human validation is claimed. Backend model identity, hidden provider activity and complete billing remain unverified.
