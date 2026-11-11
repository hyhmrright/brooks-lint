# Health deterministic-tool workflow retest

## Purpose and preserved evidence

The [completed three-skill study](three-skill-retest-results/2026-11-11-terra-low/README.md)
remains unchanged. Its revised health arm produced five conflicting headlines,
including three incorrect AS-21 totals. That study prohibited tools, so it did
not test model invocation of the deterministic scorer.

This separate freeze compares the previous revised **text-only** workflow (A,
health guidance from `5eb4e9b`) with the current **tool-enabled** workflow (B).
B receives the same cases plus the current health guidance, ledger schema and a
host-controlled `brooks_health_finalize` tool. The tool calls the shipped
`finalizeDashboard` and `verifyDashboard` exports. It accepts only ledger/draft
JSON, returns the generated report and SHA-256 receipts, and accepts no file
paths, commands or network destinations. The model must derive the ledger from
the supplied evidence; no gold ledger is injected.

This measures the bundled workflow change, including added ledger documentation
and tool availability. It does not isolate a prompt effect, native skill discovery
or autonomous repository analysis. All cases are known development cases authored
in the same workflow. There are no independent holdouts or new no-skill controls.
The deterministic checker validates consistency with the submitted ledger; it
cannot establish whether the model chose correct diagnoses, severities or scope.

## Frozen design

The [machine freeze](../../evals/research/health-tool-retest/frozen-full.json)
SHA-256 is `e3ba494a7fdff3b1636f43b99b8e6b9f5203c1c558fe1bff292bbdce72135cf7`.
It seals cases, rubrics, both guidance sets, tool schema, executable sources,
scoring helper, review policy, alternating schedule and budget.

Eight health cases run in both arms for three repeats: **48 primary CLI turns**.
Cases are AS-21–AS-25, AS-35, SR-03 and SR-04. Two new-boundary cases and six
historical-development cases remain separate cohorts in the report. Repeats are
correlated observations, not 24 independent cases per arm.

- AS-21 checks the strict total of 80 from the supplied capped ledger.
- AS-22 checks no-diff weight redistribution; AS-23 checks a clean ledger.
- AS-24 checks incomplete evidence; AS-25 checks the out-of-scope boundary.
- AS-35 requires diagnoses from supplied source before scoring.
- SR-03 requires two separately generated dashboards from two snapshots.
- SR-04 requires an unavailable composite when a required assessment is missing.

For B, a successful finalization tool call and an exact final report match are
required for AS-21, AS-22, AS-23, AS-35, SR-03 and SR-04. AS-24 may provide an
insufficient-evidence summary without a dashboard. AS-25 must not call the tool.
SR-03 submits two ledgers/drafts in a single tool call; its exact final artifact is
the two generated reports joined with two newlines. Other dashboard cases submit
one. Each turn allows at most four scoring calls, permitting model correction of
validation errors within that turn. Omitted calls and changed final answers are
workflow failures, not execution failures and not automatically repaired.

Both arms use the same registered model, effort and CLI version. The next live
run awaits maintainer model selection and authorization. `gpt-6.1-terra / low` is
the continuity choice, not a claim about the currently selected chat model.
Preparation observed Codex CLI `0.167.1` using only a local authored upstream.

Budget: 48 primary CLI turns, 300 seconds per turn, four elapsed hours and a
2,000,000 observed-token admission stop. Stop on the first operational, identity,
cleanup or missing-usage failure. No automatic failed-turn retry or recovery is
frozen. Tool continuations and provider retries mean these are **not** hard
backend-request, token or billing caps. Token admission can overshoot by one turn;
failed-turn usage can be unknown. Study admission charges the greater of wall and
monotonic elapsed time. Host sleep can still delay timeout dispatch; keep the
machine awake and use `caffeinate -is`. The per-turn ceiling differs from the
historical 180 seconds, so do not pool historical outcomes into this comparison.

## Evidence and adjudication

Preserve original events, model selection/effort, CLI version, submitted tool
arguments, deterministic results/receipts, usage and terminal cleanup evidence.
The CLI's model selection is not independent backend identity attestation.
Fresh auth-only homes use ChatGPT file login without copying refresh tokens.
Shell, browsing, plugins, apps and unrelated host tools remain disabled. This
validates a host scoring-tool integration, not a native shell workflow.

The new collector selects completed `final_answer` messages when present and
otherwise all completed agent messages. Raw events preserve every phase, including
commentary and excluded partial streams; masked review packets include all
completed message text as supplemental evidence. This explicit selection differs
from the prior study's all-completed-phase policy. Review supplemental claims too,
and document any claims not represented by final-answer metrics.

Use the existing [semantic review policy](../../evals/research/skill-revision/review-policy.md)
on every final answer. Report disposition, expected issues/task criteria, evidence,
unsupported and pending claims, cohorts and paired results. Mechanical workflow
metrics are separate: call presence, exact tool-result match and dashboard count.
Tool-workflow rates apply only to B. A reports null required/prohibited denominators
and pass counts (not applicable), while retaining observed call counts; it must not
be displayed as failing tool requirements.
Never award semantic correctness merely because the tool accepted a ledger.
A masked reviewer in the same workflow is not independent human validation.

## Offline validation and live handoff

No real model calls were made during preparation. Synthetic CLI responses and
synthetic annotations exercise collection, receipts and report generation only.
The real CLI/local fake-upstream drill validates protocol wiring without login or
a real provider. Neither drill supplies model-efficacy evidence.

```bash
runner=evals/research/health-tool-retest/runner.mjs
freeze=evals/research/health-tool-retest/frozen-full.json
anchor=e3ba494a7fdff3b1636f43b99b8e6b9f5203c1c558fe1bff292bbdce72135cf7
node "$runner" validate "$freeze" "$anchor"
npm run evals:health-tool
# Fresh output directories are required. These commands are offline.
node evals/research/health-tool-retest/drill.mjs _workspace/health-tool-synthetic
node evals/research/health-tool-retest/wire-drill.mjs _workspace/health-tool-local-wire
```

After the maintainer explicitly selects a model/effort and requests execution,
set `RETEST_MODEL`, `RETEST_EFFORT`, `RETEST_CLI_VERSION`, and
`RETEST_AUTHORIZATION` to the confirmed values (no credentials). Registration is
offline; do not copy login material into the run directory.

```bash
umask 077
run_dir=$(mktemp -d "$PWD/_workspace/health-tool-live.XXXXXX")
node --input-type=module - "$freeze" "$anchor" "$run_dir" <<'JS'
import fs from 'node:fs';
import path from 'node:path';
const [freezePath, anchor, out] = process.argv.slice(2);
const { RETEST_MODEL: model, RETEST_EFFORT: effort,
  RETEST_CLI_VERSION: cliVersion, RETEST_AUTHORIZATION: authorization } = process.env;
fs.writeFileSync(path.join(out, 'config.json'), JSON.stringify({
  frozen: JSON.parse(fs.readFileSync(freezePath)), anchor,
  model, effort, cliVersion, authorization
}), { flag: 'wx', mode: 0o600 });
JS
node "$runner" register "$run_dir/config.json" "$run_dir/registration.json"
registration_sha=$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1])).sha256' "$run_dir/registration.json")
git rev-parse HEAD > "$run_dir/checkout-commit.txt"
# LIVE: only after the maintainer authorizes this frozen run.
caffeinate -is node "$runner" run "$run_dir/registration.json" "$registration_sha" "$run_dir/run" --live
# Offline verification and semantic scoring after writing individual annotations.
node "$runner" verify "$run_dir/run"
node evals/research/health-tool-retest/report.mjs "$run_dir/run" "$run_dir/annotations.json" "$run_dir/summary.json"
```

Any failure preserves completed responses and failed raw records. A future
recovery requires a separately documented plan; the runner never overwrites or
resumes an existing output directory.
