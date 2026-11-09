# Resumed offline investigation: Darwin exit observation

## Diagnosis

**Symptom:** Full-suite synthetic 81-turn batches intermittently stopped early,
without a per-turn raw record. Earlier failures at turns 51 and 21 remain in the
historical diagnosis directory. The resumed parallel stress reproduced at turn
11 and retained `error_code: EPERM`, `error_syscall: kill` and module locations.

**Source:** The old `alive()` called `process.kill(-pid, 0)` after SIGTERM. Darwin
returned EPERM while probing the exiting process group. `alive()` rethrew every
error other than ESRCH; this escaped `terminate()` inside `finally`, preventing
record archival and private-home removal. The captured stack identifies this
path directly. No provider or real model was involved. Why Darwin chose EPERM
rather than ESRCH at that instant is not independently established.

**Consequence:** A successful synthetic answer was lost from normal evidence,
the batch stopped, and the temporary private home remained. Treating EPERM as
absence would risk declaring cleanup without confirming it.

**Remedy:** Replace signal-zero inference with explicit, byte-bounded,
time-bounded `/bin/ps -g GROUP -o pid=,pgid=,stat=` observations. Parse only rows
matching the exact group; successful empty output confirms absence, while
command errors, timeout, truncated or malformed output remain unknown. Never
signal a leader already observed exited/closed. Cleanup exceptions and unknown
observations produce a failed record; private homes are removed only after both
stdio closure and group absence are confirmed. This is a Darwin process-group
confirmation mechanism, not containment of arbitrary escaped processes.

## Evidence

- `turn-011-eperm.json` and `eperm-stress-failure.txt`: retained pre-fix failure.
- `focused-tests.txt`: 14 offline tests, including deterministic no-signal-zero,
  EPERM/unknown-observation rejection and exited-leader no-resignal regressions.
- `stress-0.txt` through `stress-7.txt`: eight complete synthetic 81-turn batches
  at concurrency four; 648 synthetic turns completed. No backend retries or
  increased timeout hid failures.
- Updated `../../offline-native/`: actual Codex CLI with local fake upstream;
  one synthetic request, zero exposed tools, model/effort match. Cleanup observed
  an exiting member (`?Es`) followed by an empty group and confirmed stdio close.

These are implementation and lifecycle observations, never model-quality or
independent holdout evidence. Final independent QA is a separate gate.

## Shared smoke and platform follow-up

A subsequent full-suite run exposed the same EPERM signal-zero stack in the old
`codex-login-smoke.mjs`, retained in `old-smoke-eperm-full-suite.txt`. Its Darwin
termination now delegates to the repaired observer, retaining the old return
shape and recording the helper source hash in new runs. Existing non-Darwin
smoke behavior is unchanged; historical evidence is never rewritten.

The new comparison executor preflights Darwin support before authentication,
filesystem setup or spawn. Process integration tests skip unsupported hosts;
pure schema and injected lifecycle tests remain portable. `shared-focused-final.txt`
records all 35 combined smoke/comparison tests passing after these changes.
The final native fake-upstream archive is regenerated against the final transport
source. Full repository QA is performed separately by the QA agent.
