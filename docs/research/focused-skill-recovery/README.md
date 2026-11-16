# Focused review, audit, and test recovery

The [stopped formal run](../focused-skill-retest/results/2026-11-16-stopped/REPORT.md)
is retained in full. Its first executor attempt failed during `account/read` and
ended after 501 ms. It recorded no `thread/start`, no `turn/start`, no completed
answers, and no usage receipt. The 35 later slots were untouched. The failed
attempt contributes zero **observed** tokens to the accounting. Its actual
provider work and billing are unknown.

## Routing and cleanup diagnosis

The original account error identified the failing RPC. A read-only comparison
used the pinned Codex CLI 0.169.0, the same proxy binding, and the same isolated
ChatGPT login setup. Both probes stopped at `account/read` without opening a
thread, submitting a prompt, or observing model identity or usage.

| Outer execution context | Account result | Cleanup |
| --- | --- | --- |
| Restricted sandbox | Reproduced workspace routing discovery failure, RPC code `-32603` | Child closed, `ESRCH`, temporary home removed |
| Network-capable execution | ChatGPT account route confirmed | Child closed, `ESRCH`, temporary home removed |

The [sandbox](diagnostics/sandbox/diagnostic.json) and
[network-capable](diagnostics/network/diagnostic.json) probes record the
different outcomes. This is evidence for running the collector in the
network-capable outer context. The CLI did not expose which discovery endpoint
failed or whether the upstream route will stay available. The two probes used
the same cleanup algorithm and account RPC path as the recovery. Their raw
records identify the transport source used during diagnosis. The recovery
transport then added late-response filtering and tightened collector verification.
Account response bodies are omitted, including on error. The recorder keeps the
numeric RPC code and a bounded error description.

In the original sandbox, launching `/bin/ps` failed with `EPERM`, matching the
historical cleanup probe exception. A detached local test process instead
returned `ESRCH` from the operating system's group existence check after it
closed. The recovery sends TERM, checks the detached group with
`kill(-pgid, 0)`, and escalates a still-present group to KILL within its
three-second cleanup window. Only `ESRCH` confirms disappearance. Permission
errors leave the group unconfirmed. The executor requires both child close
and group disappearance before removing the private home and accepting an
answer. On unconfirmed cleanup it releases its local child handles and halts,
while preserving the failed cleanup status.

The original process had reported close while its credential-containing
temporary directory remained. One matching temporary home was identified by
creation time within the original 501 ms interval, ownership, permissions, and
expected layout. That temporary copy was deleted and its absence checked
without reading or logging credential contents. The archived failure retains
the cleanup outcome at the time of execution.

## Frozen recovery

| Setting | Value |
| --- | --- |
| CLI, model, effort | Codex CLI `0.169.0`, `gpt-6.1-terra`, `low` |
| New benchmark submissions | At most 36, original slots 1–36 |
| Cumulative executor attempts | At most 37, including the archived pre-turn failure |
| Remaining observed-token admission budget | 2,000,000 |
| Remaining active execution budget | 7,199,499 ms (1 h 59 m 59.499 s) |
| Per-slot turn window | 120 seconds, shortened if less campaign time remains |
| Failure policy | Stop on first failure or observed retry, zero automatic retries or fallback |

The original prompts, case order, rubrics and B/C groups are inherited byte
for byte. B is the generic checklist. C is the focused skill guidance. The
token ceiling controls admission of subsequent turns based on observed usage.
A single in-flight turn can overshoot it. Per-slot cleanup is bounded
separately and counts toward active execution time.

After explicit live authorization, run the collector from the network-capable
outer context using the pinned proxy and executable. The collector enforces the
isolated app-server restrictions and checks `account/read` before every
`thread/start`. A failed account lookup ends the run before model submission.
A diagnostic run by itself never starts the collector.

```sh
node evals/research/focused-skill-recovery/runner.mjs execute recovery _workspace/focused-recovery/NEW_RUN --live
node evals/research/focused-skill-recovery/runner.mjs verify recovery _workspace/focused-recovery/NEW_RUN
node evals/research/focused-skill-recovery/review.mjs packets _workspace/focused-recovery/NEW_RUN _workspace/focused-recovery/packets.json
node evals/research/focused-skill-recovery/review.mjs assess _workspace/focused-recovery/NEW_RUN _workspace/focused-recovery/annotations.json _workspace/focused-recovery/report.json
```

The [freeze manifest](../../../evals/research/focused-skill-recovery/freeze.json)
binds the historical failure, source files and inherited schedule. The
collector records raw responses and diagnostics in a fresh directory. Assess
completed answers individually under the existing rubric, then report each
skill's paired comparison and record any missing slots. There are no prior
answers to merge and no new cases.

## Offline verification

```sh
node evals/research/focused-skill-recovery/suite.mjs
node --test evals/research/focused-skill-recovery/recovery.test.mjs
```

The recovery tests cover the inherited inputs and budgets, all 36 synthetic
slots, one routing failure before model submission, one observed retry with no
later attempts, account response exclusion including a late reply, a detached
process that ignores TERM, ambiguous permission errors, and a nonempty
response with missing usage. The simulated transcripts are excluded from
live scoring. Both archived login diagnostic summaries can be recomputed
from their raw records.
