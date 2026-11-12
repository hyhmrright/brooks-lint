# Health workflow routing repair — offline evidence

Date: 2026-11-12. No real model calls were made in this change. Historical study
plans, answers, failures and judgments are unchanged. All responses in
`offline-records.tar.gz` are authored simulations sent through the actual CLI
over loopback HTTP, without ChatGPT credentials. `SHA256SUMS` seals the archive
and prospective probe plan. Source snapshots accompany the records.

## Diagnosis and repair

**Symptom:** the completed 48-answer study contained no scorer calls, despite
18 B responses requiring one. **Source:** using the actual selected model name
`gpt-6.1-terra`, local requests advertise `brooks_health_finalize` inside the
`functions.exec` code-mode declaration. The old adapter sets
`features.code_mode_host=false`. An authored call through that advertised route
returns exactly `code-mode host is disabled` and never reaches the scorer.
The earlier `gpt-fixture` drill instead exposes a direct function and thus missed
this model-dependent route. **Consequence:** direct-call fixture success did not
establish that the advertised route could execute for the selected model.
**Remedy:** a prospective adapter enables the code-mode host while preserving the
isolated auth-only home, disabled shell/plugins/apps, restricted dynamic-tool
dispatch, model/effort binding, deadlines and bounded cleanup. A scorer probe
must verify a real host receipt and an unchanged final answer before a new batch.

This reproduces a concrete execution blocker. It does not prove the internal
reason every historical answer declined the tool; those judgments remain pending.

The old pinned single-binary copy also lacks `codex-code-mode-host`. Enabling the
feature with that copy yields a missing-companion error. The new live adapter
requires an absolute CLI path and hashes **both** the CLI and its sibling host
before starting. The installed complete 0.167.1 release remains available, so the
prospective probe can retain the old version without changing user installation.

| Actual CLI, selected name | Host disabled, expected failure | Host enabled, scorer roundtrip | Host-rendered JSON path |
|---|---|---|---|
| 0.167.1, gpt-6.1-terra | Passed negative control | Passed | Passed |
| 0.167.2, gpt-6.1-terra | Passed negative control | Passed | Passed |

The archive retains the early direct-function control, the failed assumption that
Terra has a top-level `tools` list, and the missing-companion failure, alongside
both final runs. The Terra surface uses `additional_tools` inside the input.
The negative controls intentionally receive authored final text after the failed
tool request: the new gate rejects it even if that text contains a plausible score.

## Two distinct workflows

1. **Model tool invocation:** `health-workflow-v2/login-turn.mjs` enables the
   required host. `requireToolProbe` rejects no-call answers, altered receipts,
   changed final text, extra calls and failed cleanup. The adapter accepts only
   the registered scorer's host requests; built-in unexpected activities fail
   the turn. Code-mode JavaScript is enabled, but this is not an OS container
   isolation claim or a test of arbitrary malicious JavaScript.
2. **Host-rendered report:** `runHostWorkflow` asks for a strict JSON ledger and
   score-free draft, then calls the deterministic helper in the evaluator host.
   It retains the original model answer and saves a separate `host-report.json`.
   Invalid ledgers, numerical draft scores and malformed envelopes fail closed.
   This is an alternative product integration, **not** evidence of model tool use
   and not the same experimental treatment as route 1. Its transport still uses
   the historical text-only adapter; no automatic fallback between routes occurs.

Neither route proves that the submitted diagnoses, severities or ownership are
correct. Incomplete evidence must remain unassessed. Host arithmetic correctness
and diagnostic correctness need separate outcomes.

## Next live step (not executed)

`probe-plan.json` freezes **one** routing probe with CLI-selected
`gpt-6.1-terra / low`, complete CLI 0.167.1, both executable hashes, source hashes,
a supplied clean ledger, a 120-second turn deadline and a 3-second cleanup bound.
There is no automatic retry, recovery, model judging call or batch continuation.
This is a call/time budget, not a guaranteed token or billing cap; provider-internal
retries and failed-turn usage remain outside a hard client cap. Report all observed
usage. The plan remains `liveAuthorized: false` until the user authorizes execution
with explicit `--live`. A pass is a prerequisite for, not authorization of, the
separate all-skills benchmark.

```sh
node evals/research/health-workflow-v2/probe.mjs execute PLAN ANCHOR ABSOLUTE_CODEX NEW_OUTPUT --live
```

Use the separately recorded plan SHA as `ANCHOR`; do not regenerate the plan to
hide source or binary drift. Any drift requires a new versioned preparation.

Frozen anchor: `cef90975154e987c028ae3aa2c6c197fdee8a7f169881091a9fd206b80a5cf2f`.

Offline checks:

```sh
node --test evals/research/health-workflow-v2/workflow.test.mjs
node evals/research/health-workflow-v2/wire-drill.mjs NEW_OUTPUT ABSOLUTE_CODEX CLI_VERSION gpt-6.1-terra
```

Official [App Server documentation](https://learn.chatgpt.com/docs/app-server)
describes experimental dynamic-tool registration and the `item/tool/call` lifecycle.
The model-dependent code-mode conclusion above comes from retained local wire
observations, not an assumption that documentation guarantees a particular model's
tool selection. Subsequent live behavior is still unverified.

Preparation audit: `probe-plan-draft1.json` was superseded before any live call.
Offline review added an exact supplied-ledger/draft check: a successful scorer
call with different arguments must not pass the routing probe. The current plan
binds that corrected source; the earlier draft and archived source snapshot remain
for provenance. Neither plan has been executed against a real model.

A final `default-route-check.tar.gz` records the same three controls with CLI
0.167.1 and no model argument: the drill now defaults to the actual selected
model name `gpt-6.1-terra`, not the direct-function `gpt-fixture` surface. The
original explicit-model archives and their source snapshots are unchanged.

`probe-plan-draft2.json` is also retained as an unexecuted preparation. The
current plan adds a canonical-path CLI entry check so symlinked invocations cannot
exit successfully without performing the requested command; an offline symlink
regression verifies a plan is actually written. No prior draft ran a real model.
