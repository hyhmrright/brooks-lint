# Health tool retest: recovery plan

This prospectively sealed recovery continues the interrupted [health tool
retest](health-tool-retest-results/2026-11-11-terra-low/README.md). The original
archive, its 17 successful answers and failed ordinal 18 remain unchanged. The
new composite copies successful records 1–17 byte-for-byte, then attempts
ordinal 18 once and follows original ordinals 19–48 in order. The earlier failure
is retained separately and is not a model answer. This is one additional attempt
beyond the original 48-attempt cap: at most 49 total primary attempts, of which
31 are in recovery. There are no automatic retries after a new failure.

The recovery plan is `evals/research/health-tool-retest/recovery-plan.json`,
SHA-256 (canonical JSON digest)
`5a99239ba5b3874de3de52936631472564d1382e30a908dc11e543c0cc655e87`.
It pins the committed original archive and every original raw file, the original
registration, frozen inputs and executable, the separate recovery executor,
model `gpt-6.1-terra`, effort `low`, and CLI `0.167.1`. Original files must
match the archive byte-for-byte before any new call. The archived run verifier
independently checks all record receipts and model identity evidence. CLI model
selection is not independent provider-side identity attestation.

The 2,000,000 observed-token admission threshold includes the original 616,843
observed tokens. Failed-turn usage is unknown, and a completed turn may overshoot
the threshold; this is not a hard billing cap. The four-hour active budget charges
both the original wall time including sleep and the greater of resumed wall and
monotonic elapsed time, excluding the gap between sessions. Each resumed turn has
at most 300 seconds; the first execution, identity, cleanup or missing-usage
failure stops further admission. Provider retries are not a hard backend request
cap. The prior sleep demonstrates that `caffeinate -is` cannot prevent battery
clamshell sleep: keep the lid open and preferably connect power throughout.

The tool-enabled and text-only arms, prompts, cases, review policy and workflow
metrics stay unchanged. The composite is verified by the original `readRun`
validator and uses the same response ID mapping, review packets and report
script. Blinded review remains same-workflow and the cases are not independent
holdouts. A generated tool score does not prove the model selected the right
ledger. Annotate every completed response against its rubric; disclose missing
observations and do not claim significance or production generalization.

## Offline validation and authorized execution

The regression `node --test evals/research/health-tool-retest/recovery.test.mjs`
uses synthetic CLI responses, checks the full 31-turn continuation, verifies
48 reconstructed packets and paired results, and verifies stopping on missing
usage. Synthetic labels are not evidence of model efficacy.

```sh
original=_workspace/health-tool-live.whmPvN/run
recovery=evals/research/health-tool-retest/recovery.mjs
plan=evals/research/health-tool-retest/recovery-plan.json
anchor=5a99239ba5b3874de3de52936631472564d1382e30a908dc11e543c0cc655e87
node "$recovery" validate "$plan" "$anchor" "$original"
# The next command uses the maintainer-authorized ChatGPT login and a real model.
caffeinate -is node "$recovery" run "$plan" "$anchor" "$original" _workspace/health-tool-recovery-live --live
node evals/research/health-tool-retest/runner.mjs verify _workspace/health-tool-recovery-live/run
# After per-response semantic annotations are written:
node evals/research/health-tool-retest/report.mjs _workspace/health-tool-recovery-live/run ANNOTATIONS.json NEW_SUMMARY.json
```

Use a fresh output directory. The executor makes no model call on import or plan
validation. Another failure stops execution and requires a new documented plan;
retain both old and new failure evidence. A successful composite must be archived
with its original source evidence and hashes; never replace the original archive.
