# Three-skill revision comparison: stopped execution

The revised guides and offline preparation were committed at `dfd1d5d` before
execution. The requested model was `gpt-6.1-terra / low`, using Codex CLI 0.167.0
through ChatGPT login. This run is incomplete: 11 completed, one failed, 120 not
run, out of 132 planned responses. No subsequent call was submitted after failure.

See [assessment.md](assessment.md) for individual-review methodology and partial
results, [annotations.json](annotations.json) for all 11 judgments, and
[summary.json](summary.json) for reproducible statistics. The result does not
establish effectiveness of all three revised skills.

## Failure and costs

Ordinal 12 (AS-21, original guidance, repeat one) received repeated stream timeout
errors, fell back from WebSockets to HTTPS, then received `Selected model is at
capacity. Please try a different model.` The outer 180-second deadline expired
without a completed answer. No RPC was pending at the deadline. Cleanup confirmed
the process group absent and private home removed. These observations support an
execution/availability failure; they do not establish an underlying network or
provider root cause. The disabled code-mode warning is expected in this text-only
protocol and is not evidence that a shell is needed.

Observed usage is 251,150 tokens. Failed-turn usage is unknown. Zero harness
retries means no new turn was submitted by this runner; it does **not** mean zero
CLI-internal reconnect attempts. The original budget and identity limitations are
preserved in the archive. No automatic model fallback was used.

## Evidence and offline reproduction

`raw-run.tar.gz` preserves the complete run, including failed record, receipts,
registration, prompts, events, model-selection metadata, original answers, review
packets and execution totals. Its hash is in `archive-manifest.json`.
`failure-analysis.json` is a selected-field derivative, not a replacement for raw
evidence. `execution-context.json` inside the archive records preparation state;
`run/execution.json` records the actual terminal outcome.

From the repository root, extract into a new private directory and verify:

```sh
mkdir -m 700 /tmp/brooks-revision-results
tar -xzf docs/research/skill-revision-results/2026-11-11-terra-low/raw-run.tar.gz -C /tmp/brooks-revision-results
node evals/research/skill-revision/runner.mjs verify /tmp/brooks-revision-results/run
node evals/research/skill-revision/report.mjs /tmp/brooks-revision-results/run docs/research/skill-revision-results/2026-11-11-terra-low/annotations.json /tmp/brooks-revision-results/summary.json
cmp /tmp/brooks-revision-results/summary.json docs/research/skill-revision-results/2026-11-11-terra-low/summary.json
```

The runner checks current source hashes. If later maintenance changes those
sources, reproduce from a clean checkout of `dfd1d5d` with these result artifacts
available; do not regenerate a historical freeze. These commands make no model
calls. Validation is recorded in [validation.md](validation.md).

## Recovery plan (not executed)

1. Preserve this stopped run and all judgments unchanged. Treat service capacity
   as unresolved; changing the model would require a separate experiment.
2. Register an explicit recovery amendment before further calls: same frozen
   prompts, cases, guide snapshots, model, effort, CLI and per-turn deadline.
   Select only the failed ordinal and the 120 unrun ordinals, in original order.
   Reuse all 11 successful answers without resampling based on their grades.
3. A single replacement of the failed turn would make the cumulative maximum
   133 attempts for 132 intended responses, not the announced 132 primary calls.
   Obtain approval for that amendment before execution. No retry is authorized
   merely by this document. Keep unknown failed usage explicit and carry forward
   the 251,150 observed tokens into the five-million-token admission limit.
4. Implement and offline-test recovery registration, original-ordinal mapping,
   provenance, cumulative budget accounting, duplicate/missing selection rejection,
   failure stop and merged reporting before use. The current runner deliberately
   rejects implicit resume; do not edit old records to bypass it.
5. Grade remaining answers using the frozen criteria, retain failed attempts in
   operational reporting, and publish paired results with planned and completed
   denominators. If capacity failure recurs, stop and report it without switching
   model or launching another recovery automatically.

This plan is a proposed amendment, not a tested recovery executor or a completed
study. The same-workflow and non-independent-review limitations remain.
