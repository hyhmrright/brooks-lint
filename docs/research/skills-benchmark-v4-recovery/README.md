# One-shot recovery of stopped v4 campaign

The user authorized retrying the failed 39th request and the 69 not-run requests. The original 38 completed records and failed attempt remain immutable and are bound by the archived registration, original execution SHA-256, failed-record SHA-256, and retained v4 verification. Recovery is a separate directory, with per-call intent, raw record, receipt, and state; it never overwrites the original. It runs ordinals 39–108 in original order, one new submission each, no automatic retries, stopping at the first failure, retry event, missing usage, proxy drift, exhausted budget, or verification failure. An interrupted run cannot automatically resume; preserve its evidence and review a new recovery plan.

The original identity remains gpt-6.1-terra / low, CLI 0.167.1, original probe, toolchain, transport and proxy binding. The original 578,158 observed tokens and 886,037 ms are deducted from the original 5,000,000 token and 8-hour limits; each turn remains at most 120 seconds. **The failed prior turn's usage is unknown**, so the observed-token total is not a hard billing cap; one admitted request can also overshoot. Recovery permits at most 70 new submissions, 109 lifetime submissions including the original failure. The user explicitly authorized this exception to the previous stop-and-do-not-retry rule. No model code is executed. The two collection segments require disclosure and no independence claim.

## Offline verification and execution

```
node --test evals/research/skills-benchmark-v4/recovery.test.mjs
node evals/research/skills-benchmark-v4/recovery.mjs execute docs/research/skills-benchmark-v4-recovery/plan.json _workspace/campaign-v4-live _workspace/campaign-v4-recovery-live --live
node evals/research/skills-benchmark-v4/recovery.mjs verify docs/research/skills-benchmark-v4-recovery/plan.json _workspace/campaign-v4-live _workspace/campaign-v4-recovery-live
```

The test injects one synthetic failed response and makes no live model call. Source/plan changes invalidate the plan. Execution requires explicit `--live`, an unchanged original, current toolchain and proxy, and a fresh output path. Semantic adjudication remains separate; original completed answers and recovered answers must be reviewed together, retaining original failed attempt and unrun slots in reports.

The completed individual review and six-skill comparison are in `annotations-108.json`, `assessment-108.json`, and `REPORT.md`. The earlier `PARTIAL-REVIEW.md` remains as a historical checkpoint.
