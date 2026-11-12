# Health tool retest: second recovery

The first [recovery](health-tool-retest-recovery.md) saved ordinal 18 but then
stopped at ordinal 19 when the Codex CLI on the default path reported 0.167.2
instead of the frozen 0.167.1. No answer or known usage was obtained for that
failure. Both the initial failure at ordinal 18 and the first-recovery failure
at ordinal 19 remain in their separate raw archives. Their unknown
usage prevents a hard total-token or billing claim.

This prospective plan preserves the 18 verified successful records byte-for-byte
and attempts ordinal 19 once, then ordinals 20–48 in the original order. At most
30 calls may run in this recovery, and at most 50 attempts overall including both
previous failures. It uses the unchanged original cases, arms, prompts, model
`gpt-6.1-terra`, effort `low`, 300-second turn limit, original assessor policy,
and original collector. It stops on the first new execution, identity, cleanup,
missing usage, binary-integrity or budget failure. Original and first-recovery
archives are checked against their fixed digests, and the full first-recovery tree
is verified byte-for-byte before execution. No existing raw record is overwritten.

The original CLI binary was independently checked at
`/opt/homebrew/Caskroom/codex/0.167.1/bin/codex`; its SHA-256 is
`ebabe5f0d79145a9e61274ce9ecf7c02c9021b7b04bfa59b7e61ad4461c32b0b`.
A private copy is made in `_workspace/health-tool-pinned-cli/codex`, checked by
hash and `--version`, and placed first on the isolated adapter's `PATH`. Its hash
and version are rechecked before every turn; the existing adapter still verifies
the started CLI's reported version. If the copy changes, admission stops. The
binary is not committed, and must be reconstructed from the same checked source
if unavailable. This pin addresses the observed executable change; it does not
attest provider-side model identity.

The frozen plan is `evals/research/health-tool-retest/recovery2-plan.json`, with
canonical digest
`5df90f6187023990545c7d0e6543176dd0d6f9131e27969faf30f26c0da81610`.
The 2,000,000 observed-token admission threshold includes the previous 639,873
observed tokens. A turn can overshoot; provider retries and unknown failed usage
are outside this observed limit. The four-hour budget includes the initial wall
time (including sleep), the first recovery's elapsed wall time and the greater
of wall or monotonic elapsed time during this continuation, but excludes gaps
between sessions. Keep the lid open and connect power: `caffeinate -is` does not
prevent battery clamshell sleep.

The offline `recovery2.test.mjs` uses a synthetic CLI and a fully synthetic seed
of 18 answers to exercise 30-turn continuation, 48 verifiable review packets,
24 paired results, and failure on missing usage. It also validates archive and
plan tamper rejection and disallows live overrides. Synthetic outputs are not
model-efficacy evidence. As before, CLI-selected model is not independently
attested backend identity, assessment is same-workflow and cases are not independent
holdouts. Tool consistency is separate from semantic correctness.

```sh
original=_workspace/health-tool-live.whmPvN/run
previous=_workspace/health-tool-recovery-live
runner=evals/research/health-tool-retest/recovery2.mjs
plan=evals/research/health-tool-retest/recovery2-plan.json
anchor=5df90f6187023990545c7d0e6543176dd0d6f9131e27969faf30f26c0da81610
node "$runner" validate "$plan" "$anchor" "$original" "$previous"
node --test evals/research/health-tool-retest/recovery2.test.mjs
# Real model, explicitly authorized by maintainer; fresh output directory only.
caffeinate -is node "$runner" run "$plan" "$anchor" "$original" "$previous" _workspace/health-tool-recovery2-live --live
node evals/research/health-tool-retest/runner.mjs verify _workspace/health-tool-recovery2-live/run
# After independent per-answer adjudication within this workflow:
node evals/research/health-tool-retest/report.mjs _workspace/health-tool-recovery2-live/run ANNOTATIONS.json NEW_SUMMARY.json
```

If the pinned copy is missing, `node "$runner" pin _workspace/health-tool-pinned-cli`
recreates it only from the frozen source binary when the destination is absent.
If its absolute path or bytes differ from the plan, stop; prepare a new prospective
plan before executing. Another failure also requires a new plan and preserved
records. The successful merged run must be archived with both prior source archives
and hashes; adjudication must not retroactively change the frozen cases or rubrics.
