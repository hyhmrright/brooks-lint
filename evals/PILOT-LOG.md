# brooks-review plugin eval — pilot log

Calibration record for the `claude plugin eval` suite in `evals/NN-*/`. It is separate from `evals.json` (scenario benchmark) and `benchmark-corpus.json` (parser fidelity).

- **Flow under test:** `brooks-lint:brooks-review` only.
- **Quality priority:** precision. Find the real issue and don't raise false alarms.
- **Ablation:** every case runs with and without the plugin. The headline number is **Δ = with − without**.

## Cases

| Case | Input | Outcome graders |
|---|---|---|
| `01-pr29-provider-remap` | Code diff from real PR #29 (gateway name, key prefix and URL anonymized) | finds the hard-coded `claude-sonnet-4-6` remap in `action.yml`; finds the duplicated default-model mapping; no factual misreads of the diff |
| `02-pr33-bob-installer` | Installer + docs diff from real PR #33, Chinese prompt | finds docs promising `$BOB_HOME` while `global_dir` hard-codes `$HOME/.bob/skills`; no false alarms on the bob lines; answer in Chinese |
| `03-two-files-rule-drift` | Two Python checkout modules, "Any issues here?" | names both copies of the free-shipping threshold; explains `>=` vs `>` at exactly 100; ranks the drift first |
| `04-tradeoff-composition-root` | TS composition root + idempotent `PlaceOrder` use case | no DIP / Dependency Disorder false positive on `main.ts`; nothing rated critical |
| `05-diff-protocol-switch-no-tests` | Go RESP2 decoder diff with no tests, "Ready to merge?" | flags the missing `Decode` tests; no polymorphism / OCP suggestion for the `switch`; nothing critical beyond the tests |
| `06-neg-write-from-scratch` | "Write a thread-safe TTL LRU cache" (should NOT fire) | no review report; gives an implementation |
| `07-neg-syntax-with-code` | TS `satisfies` vs `as` question with a snippet (should NOT fire) | no review report; correct explanation |

The fire cases (01–05) also carry two extra graders:

- `health-score-line`: a regex, weight 0.5.
- `skill-fired`: a `tool_used` grader that is display-only.

The negative cases (06–07) instead carry `skill-not-fired`, which is also display-only.

## Running

Full suite (`runs: 3` per case):

```bash
claude plugin eval . --ablation with-without --judge-model opus --trust-plugin
```

Add `--no-publish` to keep the report local.

The pilots used different flags:

- **Pilot 1:** `--runs 1 --no-scaffold --no-publish` on top of the full-suite flags.
- **Pilot 2:** the same, plus one process per case with `--case <name> --output-dir evals/results/pilot2-<case> --keep-temp`.

## Results

All pilots ran one run per arm on `model: sonnet`. Each `llm` grader uses three opus judge votes.

### Pilot 1: `results/2026-09-14T12-51-55-464Z/`

All 7 cases, $3.05, 299 s.

| Case | With | Without | Δ | Failing graders and cause |
|---|---|---|---|---|
| 01 | 0.57 | 0.29 | +0.29 | **With:** the skill fired but reported *"I wasn't able to reach the `brooks-review` skill's file outside the sandboxed working directory"*, fell back to a manual review, and missed the remap and the Health Score. **Without:** remap, sources of truth and Health Score all missed. |
| 02 | 1.00 | 0.86 | +0.14 | **Without:** Health Score only. Both arms found the `BOB_HOME` mismatch. |
| 03 | 0.86 | 0.86 | 0 | Health Score in both arms. **The skill did not fire** (Skill 0×), so this case measured no uplift. |
| 04 | 0.60 | 0.40 | +0.20 | `overall-healthy` failed in both arms. The cause was a **fixture bug**, not the plugin: a per-call `randomUUID` idempotency key let retries double-charge. |
| 05 | 0.71 | 0.57 | +0.14 | `no-critical-findings` failed in both arms. The cause was a **fixture bug**, not the plugin: no nesting-depth or line-length limit in the decoder. |
| 06 | 1.00 | 1.00 | 0 | none |
| 07 | 1.00 | 0.50 | +0.50 | **Without:** `explains-satisfies-vs-as`. A **rubric defect**: point 3 demanded "`auth` is `undefined` at runtime". |

Pilot 1 traces were not kept (`--keep-temp` was not set).

### Pilot 2: `results/pilot2-<case>/`

Re-ran the four revised cases, $2.23 in total. Across both pilots: $5.28.

| Case | With | Without | Δ | Failing graders and cause |
|---|---|---|---|---|
| 01 | 1.00 | 0.29 | +0.71 | **Without:** sources of truth (FAIL 3/3); Health Score; `no-factual-misreads` (FAIL 2:1, claimed the scripts also remap by literal comparison). It loaded the `claude-api` skill instead. |
| 04 | 0.60 | 0.80 | **−0.20** | **With:** `overall-healthy` FAIL 3/3. It rated "charge succeeds, save fails, order stuck `pending`" 🔴 (Health 68). The same report files "adapter may not forward the idempotency key" under Dependency Disorder. **Without:** Health Score only. |
| 05 | 1.00 | 0.86 | +0.14 | **Without:** Health Score only. **With:** `no-critical-findings` passed 2:1 (only 🟡; the one merge blocker is missing tests). |
| 07 | 1.00 | 0.50 | +0.50 | **Without:** `no-review-report`, a **regex defect**. `Consequence\W*:` with flag `i` matched the prose "The practical consequence:". |

Traces are in `results/pilot2-<case>/traces/{with,without}.jsonl`. Case 01's traces stay local only (see `.gitignore`), because both arms loaded Claude Code's bundled `claude-api` skill and the traces carry its full text.

### Side channels

| Run | Turns | Seconds | Cost | Tool calls |
|---|---|---|---|---|
| P1 01 with / without | 12 / 6 | 179 / 126 | $0.54 / $0.45 | — |
| P1 02 with / without | 13 / 4 | 146 / 60 | $0.37 / $0.15 | — |
| P1 03 with / without | 1 / 1 | 42 / 40 | $0.12 / $0.14 | — |
| P1 04 with / without | 9 / 1 | 161 / 67 | $0.34 / $0.15 | — |
| P1 05 with / without | 13 / 4 | 153 / 83 | $0.40 / $0.18 | — |
| P1 06 with / without | 1 / 1 | 7 / 7 | $0.04 / $0.04 | — |
| P1 07 with / without | 1 / 1 | 14 / 15 | $0.07 / $0.06 | — |
| P2 01 with / without | 14 / 5 | 166 / 96 | $0.60 / $0.41 | 11 / 3 |
| P2 04 with / without | 10 / 2 | 190 / 59 | $0.38 / $0.15 | 8 / 1 |
| P2 05 with / without | 11 / 5 | 137 / 107 | $0.36 / $0.20 | 9 / 4 |
| P2 07 with / without | 1 / 1 | 13 / 29 | $0.06 / $0.07 | 0 / 0 |

Proposed ceilings per run:

| Cases | Time | Turns | Tool calls | Cost |
|---|---|---|---|---|
| Fire cases | 480 s | 20 | ≤ 15 | ≤ $1 |
| Negative cases | 180 s | 8 | ≤ 3 | ≤ $1 |

Every run above stayed inside them. A fired review costs about 11 tool calls: the `SKILL.md` plus four shared/guide `Read`s and a few `Glob`s.

## Changes after the pilots

| Change | Why | Exercised by a run? |
|---|---|---|
| 04 fixture: `findOrCreate(customerId, requestId, draft)`; the charge uses the order id as its idempotency key | per-call UUID key allowed double charges, and both arms correctly called it critical | yes, pilot 2 |
| 05 fixture: `maxDepth`, `ReadSlice`, capped prealloc | unbounded recursion and line length, and both arms correctly blocked the merge | yes, pilot 2 |
| 07 `explains-satisfies-vs-as` point 3 relaxed | runtime `undefined` is not what the case tests | yes, pilot 2 |
| 06/07 `no-review-report`: case-sensitive, line-anchored labels (`flags: m`) | prose "consequence:" false positive | **no**, only checked offline against the pilot 2 outputs |
| 01 `no-factual-misreads` ground truths 7–8 | 7: only `action.yml` does the literal comparison. 8: `run-evals-live.mjs` never reads `EXAMPLEGW_API_KEY`, so the documented usage can send `ANTHROPIC_API_KEY` to the gateway, which is a real bug in the PR | **no**: edited 10 s before pilot 2's case 01 result was written, so which version the judge saw is unknown |
| 01 prompt notes that the gateway name, key prefix and URL are anonymized | the reserved `.example` TLD drew a "won't resolve" finding | **no**, added after pilot 2 |

## Open calibration questions (Gate 2, unanswered)

1. **Case 04, pilot 2, with arm: 🔴 "charged but not recorded, order stuck `pending`".**
   - The grader says FAIL. The argument for false positive: the `pending` row is written before the charge, and a retry reuses the same idempotency key, so no double charge is possible.
   - Is it a false positive, or a legitimate critical?
2. **Case 01, pilot 1, with arm: `no-factual-misreads` PASS 3/3.**
   - The report claimed `DEFAULT_MODELS` and the `thinking` block were copied into `action.yml`'s bash, which is wrong.
   - Minor slip, or FAIL?
3. **Case 01, pilot 2, without arm: `no-factual-misreads` FAIL 2:1.** Proposed: agree.
4. **Case 05, pilot 2, with arm: `no-critical-findings` PASS 2:1.** Proposed: agree.

The full `runs: 3` suite has not been run yet. Estimate: ≈ $3.05 × 3 ≈ $9.15 (pilot 1 `costUsd` × runs), not yet approved.

## Plugin follow-ups

These were not fixed during eval authoring. The suite measures the plugin as it is at 1.5.0, and changing `skills/` mid-calibration would leave no baseline to compare against.

- **Trigger miss (case 03).**
  - "Any issues here?" plus two pasted modules did not load `brooks-review` (Skill 0×).
  - The description's trigger list contains exactly `"any issues here?"`.
  - Until the skill fires, case 03 cannot show uplift.
- **Shared files unreachable (case 01, pilot 1).**
  - The skill fired but reported it couldn't reach its files outside the sandbox working directory, then degraded to a manual review.
  - This was 1 of 7 with-arm runs in pilot 1. It did not recur in pilot 2, where the `_shared/` and guide `Read`s under the plugin path succeeded.
  - No trace was kept for it.
- **Severity overcall (case 04, pilot 2).**
  - The skill rated a narrow failure window 🔴 and cost Health 68, while the without arm judged the same code healthy.
  - In the same report, "adapter may not forward the idempotency key" was filed under Dependency Disorder, which doesn't fit that risk.
  - Pending Gate 2 question 1.
