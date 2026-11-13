# v5 second recovery — frozen offline preparation

Prepared on 2026-11-14. This document prepares execution; it does **not** authorize live calls. No model request is made by this preparation or its injected simulations. Obtain the maintainer's model confirmation before the explicit live command below.

## Retained evidence and scope

The original segment completed 78 answers and failed at ordinal 79. First recovery completed 121 additional answers and failed at ordinal 200 (`BV5-31`, C, repeat 2). Both failures were transport-retry stops with unknown usage. All 199 answers, original response IDs and existing adjudications remain immutable. `history-hashes.json` records the historical files; `plan.json` binds both execution manifests, the registration and first recovery plan, both failures, 199 raw hashes, and the combined199 annotation file.

Only ordinals **200–324** are admitted: one replacement for the failed answer slot and 124 unexecuted slots, at most **125 new submissions**. There are 324 answer slots and at most **326 lifetime submissions**, including both historical failures. A new failure stops the collector immediately; there is no automatic retry, implicit resume, or authorization for another recovery.

## Model, channel, and budget

- Codex CLI **0.167.1**, ChatGPT login, requested model **gpt-6.1-terra**, reasoning **low**.
- Original frozen toolchain, explicit proxy, prompts, skill snapshots, scoring tool and registration remain unchanged. Requested and CLI-selected identity must agree; this does not independently attest the provider's internal serving identity.
- 120,000 ms maximum per admitted turn, further limited by the remaining cumulative execution deadline.
- Prior observed tokens: **4,284,856**. Total ceiling: **12,000,000**. Remaining observed-token admission budget: **7,715,144**.
- Prior recorded execution time: **4,587,374 ms**. Total ceiling: **43,200,000 ms**. Remaining: **38,612,626 ms** (10 h 43 m 32.626 s), excluding the human pause.
- Unknown usage of **both** failed requests remains explicitly uncounted. Observed-token admission can overshoot by one admitted turn and is not a billing cap. Unknown new usage stops execution. Historical reconnect events are not erased and zero provider-side retries is not claimed.

## Offline verification

```bash
npm run evals:skills:v5:recovery2
node evals/research/skills-benchmark-v5-recovery2/drill.mjs _workspace/campaign-v5-live _workspace/campaign-v5-recovery-live _workspace/NEW-recovery2-simulation
```

The drill injects authored protocol records entirely in process: **no credentials, Codex process, upstream connection, model answer, semantic grade or new login proof**. It covers all 125 slots and eight fail-stop controls: execution failure, retry, identity drift, cleanup failure, unavailable usage, token budget, deadline, and proxy drift. Synthetic records cannot enter real merged statistics. Synthetic lifetime/token totals are accounting fixtures, not observed new model consumption.

The unit tests additionally exercise frozen-source and historical execution/failure tampering, preservation of 199 judgments, fresh-output isolation, raw receipts, intent timeouts, token accounting, execution status, gaps, invalid execution modes and synthetic-to-live flag tampering. Repository QA runs separately before commit.

## Future execution after model confirmation

Run from repository root with the two historical raw directories restored exactly from their committed archives if necessary. Use a fresh output directory; existing output is rejected.

```bash
node evals/research/skills-benchmark-v5-recovery2/recovery.mjs execute docs/research/skills-benchmark-v5-recovery2/plan.json _workspace/campaign-v5-live _workspace/campaign-v5-recovery-live _workspace/campaign-v5-recovery2-live --live
node evals/research/skills-benchmark-v5-recovery2/recovery.mjs verify docs/research/skills-benchmark-v5-recovery2/plan.json _workspace/campaign-v5-live _workspace/campaign-v5-recovery-live _workspace/campaign-v5-recovery2-live
node evals/research/skills-benchmark-v5-recovery2/recovery.mjs packets docs/research/skills-benchmark-v5-recovery2/plan.json _workspace/campaign-v5-live _workspace/campaign-v5-recovery-live _workspace/campaign-v5-recovery2-live _workspace/recovery2-packets.json
```

Review every newly completed answer against the unchanged frozen case criteria. Preserve the existing199 annotation objects exactly, append only new response IDs, and retain uncertainty rather than adjusting prior grades. Generate a new report with:

```bash
node evals/research/skills-benchmark-v5-recovery2/recovery.mjs review docs/research/skills-benchmark-v5-recovery2/plan.json _workspace/campaign-v5-live _workspace/campaign-v5-recovery-live _workspace/campaign-v5-recovery2-live _workspace/recovery2-annotations-combined.json _workspace/recovery2-assessment.json
```

Save new raw records and reports separately. Report answer slots separately from submissions, retain the two previous failures and their unknown usage, and report any third failure separately. Partial/unbalanced arms and author-adjudication limitations still apply; this recovery preparation supplies no new evidence of skill effectiveness.

## Frozen identity

The settled plan SHA-256 body digest is `7361d6705fa39f7dfe9f6b1afb1b28bf0a3912af9eff15673d99d78da1c8995c`. It seals the new implementation, targeted tests and drill as well as all prior evidence dependencies. `offline/` contains final source-bound synthetic evidence and separately labeled development failures. Final repository QA must pass before announcing readiness; live execution still requires the maintainer's subsequent model confirmation.
