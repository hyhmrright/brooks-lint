# Offline recovery preparation

This is an unexecuted amendment implementation, not authorization or a claim that the remaining model answers exist. No real recovery call was made while preparing it. Original stopped-run records and the 11 successful answers remain immutable.

`evals/research/skill-revision/recovery.mjs` requires a new, explicit authorization string and separate registration. The original protocol forbids automatic resume; this wrapper implements a separately authorized amendment. It keeps all original frozen source/input checks intact, seals the entire parent evidence tree and its own source hash, and rejects any parent/source drift. The original registration retains its response identities. Recovery results carry explicit per-record source directory, recovery registration identity and replacement status; the verified logical merge is never presented as an original raw run directory.

## Exact scope and limits

- Reuse original ordinals 1–11. Attempt ordinals 12–132, in original order, at most once each. Preserve original failed ordinal 12 as a separate attempt.
- Planned distinct responses remain 132; maximum cumulative attempts become 133 (12 original + 121 recovery). A second failure stops again, with no automatic retry.
- Original freeze, guidance, fixture, prompt, model, effort, CLI and login adapter identities are unchanged. A real parent cannot be merged with simulated recovery records.
- Cumulative known observed-token admission begins at 251,150 and stops admitting at 5,000,000. The original failure's unknown usage remains explicitly unknown and does not become zero-cost. Admission can overshoot by one turn; billing and hidden provider activity are not hard-capped.
- Each turn remains bounded at 180 seconds. Recovery deducts the sum of recorded original attempt durations from the eight-hour execution allowance. Missing parent durations block registration. This records execution time, not the intervening human approval wait.
- All writes require a new output directory and exclusive creation. Missing/duplicate/out-of-order intents, byte tampering, symlinks, unexpected top-level artifacts, source drift and wrong model/effort/CLI/collector/cleanup metadata fail closed.

## Interface

After the user explicitly authorizes the amendment, prepare a private configuration file:

```json
{
  "parent": "/absolute/path/to/immutable/original/run",
  "authorization": "Exact user-authorized recovery amendment; preserve 11 successful answers, allow at most 133 cumulative attempts"
}
```

Commands (registration is offline; only the command with `--live` starts model execution):

```sh
node evals/research/skill-revision/recovery.mjs register CONFIG.json NEW-REGISTRATION.json
node evals/research/skill-revision/recovery.mjs run NEW-REGISTRATION.json REGISTRATION-SHA256 NEW-DIRECTORY --live
node evals/research/skill-revision/recovery.mjs verify NEW-DIRECTORY
node evals/research/skill-revision/recovery.mjs score NEW-DIRECTORY ALL-ANNOTATIONS.json NEW-SUMMARY.json
```

`score` reuses the existing deterministic semantic aggregator through `readRecovery()`'s verified logical run. Its summary adds full attempt history, unknown usage and the identity policy. Reuse existing annotations for successful original response IDs; create new individual annotations only for newly completed responses. A recovered ordinal 12 keeps its original planned response ID but has distinct raw-source provenance. Do not score an old failed answer as a successful recovery.

## Offline verification

Run separately without changing the frozen package wiring:

```sh
node --test evals/research/skill-revision/recovery.test.mjs
```

Tests use a local fake Codex CLI only. They construct explicitly simulated parent evidence, validate an immediate recovery failure and stop, execute 121 successful simulated recovery turns, prove 132 distinct logical outcomes versus 133 cumulative attempts, retain unknown failed usage and original hashes, and reject unauthorized implicit execution, live/simulation mixing, reused output, dropped ordinals, unrecorded attempt directories, changed parent evidence, altered selection and changed raw bytes.

No live execution is permitted merely because these offline tests pass. Parent orchestration controls the pending user amendment, final source review and immutable preparation commit.

This implementation intentionally accepts only this particular stopped state: 11 successes, failed ordinal 12, 120 unrun and 251,150 known observed tokens. All attempted parent durations and the failed turn's closed process group/private-home cleanup must be recorded; unknown duration or unconfirmed cleanup blocks registration. The recorded real failure has these fields. The registration pins an absolute parent directory. Moving it invalidates verification unless the same immutable parent tree is restored at the registered path; do not edit the sealed registration to make relocation pass. A portable archive must document that path binding, or obtain and seal a separately reviewed relocation amendment before execution. The CLI exits nonzero when a recovery stops.

Validation completed offline: syntax check passed; the parent/provenance rejection and full 121-turn fake recovery tests passed (2/2), then the added missing-usage/cumulative-token/parent-cleanup/duration regression passed (1/1). The cumulative token test admits two three-million-token fake turns starting from 251,150, records 6,251,150 known tokens and stops before a third, documenting the one-turn admission overshoot rather than claiming a hard cost ceiling. No real login-model calls were made.

QA loopback added final-summary verification (required externally, optional only for explicitly marked internal in-progress reads), cumulative admission replay checks, recovery-duration validation, and rejection of a false successful stop after the final turn fails or lacks usage. Recomputed summaries cannot hide failed/unknown-usage termination as a budget stop. Added adversarial regressions passed in the four-test offline suite; an additional aggregation assertion on the first-failure path confirms all 11 reused response identities and parent provenance survive `scoreRecovery`. No real execution or real recovery registration occurred.
