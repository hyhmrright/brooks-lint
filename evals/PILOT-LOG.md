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
| `04-tradeoff-composition-root` | TS composition root + idempotent `PlaceOrder` use case | no DIP / Dependency Disorder false positive on `main.ts`; nothing rated critical or blocking |
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

Pilot flags:

- **Pilots 1 and 3:** `--runs 1 --no-scaffold --no-publish` on top of the full-suite flags. Pilot 3 also used `--keep-temp --output-dir evals/results/pilot3`.
- **Pilots 2 and 4:** the same flags, plus one process per case with `--case <name> --output-dir evals/results/pilot<N>-<case> --keep-temp`.

## Results

All pilots ran one run per arm on `model: sonnet`. Each `llm` grader uses three opus judge votes. Four pilots cost $8.93 in total.

**Single runs are noisy.** The same case swings between pilots:

- case 01's with arm went from full pass to near zero;
- the 02 and 03 triggers flipped;
- case 04's with arm went from no 🔴 to two.

Only the `runs: 3` suite gives a Δ worth quoting.

### Pilot 1: `results/2026-09-14T12-51-55-464Z/`

All 7 cases, $3.05, 299 s.

| Case | With | Without | Δ | Failing graders and cause |
|---|---|---|---|---|
| 01 | 0.57 | 0.29 | +0.29 | **With:** the skill fired but reported *"I wasn't able to reach the `brooks-review` skill's file outside the sandboxed working directory"*, fell back to a manual review, and missed the remap and the Health Score. **Without:** remap, sources of truth and Health Score all missed. |
| 02 | 1.00 | 0.86 | +0.14 | **Without:** Health Score only. Both arms found the `BOB_HOME` mismatch. |
| 03 | 0.86 | 0.86 | 0 | Health Score in both arms. **The skill did not fire** (Skill 0×). |
| 04 | 0.60 | 0.40 | +0.20 | `overall-healthy` failed in both arms. **Fixture bug:** a per-call `randomUUID` idempotency key let retries double-charge. |
| 05 | 0.71 | 0.57 | +0.14 | `no-critical-findings` failed in both arms. **Fixture bug:** no nesting-depth or line-length limit in the decoder. |
| 06 | 1.00 | 1.00 | 0 | none |
| 07 | 1.00 | 0.50 | +0.50 | **Without:** `explains-satisfies-vs-as`. **Rubric defect:** point 3 demanded "`auth` is `undefined` at runtime". |

Pilot 1 traces were not kept (`--keep-temp` was not set).

### Pilot 2: `results/pilot2-<case>/`

Re-ran the four revised cases, $2.23 in total.

| Case | With | Without | Δ | Failing graders and cause |
|---|---|---|---|---|
| 01 | 1.00 | 0.29 | +0.71 | **Without:** sources of truth (FAIL 3/3); Health Score; `no-factual-misreads` (FAIL 2:1, claimed the scripts also remap by literal comparison). It loaded the `claude-api` skill instead. |
| 04 | 0.60 | 0.80 | **−0.20** | **With:** `overall-healthy` FAIL 3/3. It rated "charge succeeds, save fails, order stuck `pending`" 🔴 (Health 68). The same report files "adapter may not forward the idempotency key" under Dependency Disorder. **Without:** Health Score only. |
| 05 | 1.00 | 0.86 | +0.14 | **Without:** Health Score only. **With:** `no-critical-findings` passed 2:1 (only 🟡; the one merge blocker is missing tests). |
| 07 | 1.00 | 0.50 | +0.50 | **Without:** `no-review-report`. **Regex defect:** `Consequence\W*:` with flag `i` matched the prose "The practical consequence:". |

### Pilot 3: `results/pilot3/`

All 7 cases after the Gate 2 answers, $3.16. Runs went one at a time, so the wall time of 1111 s is about the sum of the individual runs.

| Case | With | Without | Δ | Failing graders and cause |
|---|---|---|---|---|
| 01 | 0.29 | 0.86 | **−0.57** | **With:** loaded `claude-api` and `brooks-review` in the same turn, then answered with only the API check, saying *"the brooks-review agent finishes the broader code-quality pass in the background"*. No such agent exists; the review never ran (see follow-ups). **Without:** Health Score only. |
| 02 | 0.86 | 0.86 | 0 | Health Score in both arms. **The skill did not fire** this time (it fired in pilot 1); the manual review still found `BOB_HOME`. |
| 03 | 1.00 | 0.86 | +0.14 | **Without:** Health Score only. The skill **did** fire this time. |
| 04 | 0.60 | 0.40 | +0.20 | `overall-healthy` failed in both arms. **Rubric defect** (both reports were reasonable, neither had a 🔴). **With:** FAIL 2:1 on Health 78 (4 🟡 + 2 🟢) under the old "≥ 80" rule. **Without:** FAIL 3/3 for reading "#1 and #2 are the ones I'd actually want resolved before relying on this in production" as a merge blocker. |
| 05 | 1.00 | 0.86 | +0.14 | **Without:** Health Score only. |
| 06 | 1.00 | 1.00 | 0 | none (the new regex held) |
| 07 | 1.00 | 1.00 | 0 | none (the new regex held) |

Pilot 3 exercised the three changes that no earlier run had covered:

- **01 prompt note:** no `.example` finding. The without arm wrote *"Since you've anonymized the real value, I can't check it"*.
- **01 ground truths 7–8:** `no-factual-misreads` PASS 3/3 in both arms.
- **06/07 regex:** all four runs passed.

### Pilot 4: `results/pilot4-04-tradeoff-composition-root/`

Case 04 only, with the revised `overall-healthy`, $0.49.

| Case | With | Without | Δ | Failing graders and cause |
|---|---|---|---|---|
| 04 | 0.60 | 0.80 | **−0.20** | **With:** `overall-healthy` FAIL 3/3. Two 🔴 Critical (Health 63) and *"Fix the two Critical items before merging"*: (a) shutdown doesn't await `server.close()` before `pool.end()`, filed under Dependency Disorder; (b) a reused idempotency key with a different amount silently returns the old order. Both are fair Warning-level points; rating them Critical is the overcall this case exists to catch. **Without:** Health Score only. `overall-healthy` PASS 3/3: it called a concurrent-retry race and a missing compare-and-swap on `save` "bugs", but labelled nothing critical or blocking. |

The revised rubric failed the overcalled report and passed the unlabelled one, as intended.

### Traces

Traces are named `with.jsonl` and `without.jsonl`:

- **Pilot 2 and pilot 4:** `results/pilot<N>-<case>/traces/`.
- **Pilot 3:** `results/pilot3/traces/<case>/`.

Some traces stay local only (see `.gitignore`), because the run loaded one of Claude Code's bundled skills and the trace carries that skill's full text:

| Pilot | Case | Arm | Bundled skill |
|---|---|---|---|
| 2 | 01 | both | `claude-api` |
| 3 | 01 | both | `claude-api` |
| 3 | 04 | with | `dataviz` |
| 3 | 05 | without | `code-review` |

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
| P3 01 with / without | 5 / 5 | 110 / 87 | $0.43 / $0.38 | 2 / 3 |
| P3 02 with / without | 3 / 3 | 85 / 63 | $0.17 / $0.16 | 2 / 2 |
| P3 03 with / without | 10 / 1 | 109 / 35 | $0.32 / $0.12 | 8 / 0 |
| P3 04 with / without | 13 / 2 | 150 / 115 | $0.41 / $0.19 | 10 / 1 |
| P3 05 with / without | 13 / 2 | 132 / 168 | $0.38 / $0.38 | 11 / 12 |
| P3 06 with / without | 1 / 1 | 8 / 9 | $0.05 / $0.05 | 0 / 0 |
| P3 07 with / without | 1 / 1 | 28 / 13 | $0.08 / $0.06 | 0 / 0 |
| P4 04 with / without | 9 / 2 | 133 / 68 | $0.33 / $0.16 | 7 / 1 |

Proposed ceilings per run:

| Cases | Time | Turns | Tool calls | Cost |
|---|---|---|---|---|
| Fire cases | 480 s | 20 | ≤ 15 | ≤ $1 |
| Negative cases | 180 s | 8 | ≤ 3 | ≤ $1 |

Every run above stayed inside them. A fully executed review costs about 7–11 tool calls: the `SKILL.md` plus four shared/guide `Read`s and a few `Glob`s.

## Changes after the pilots

| Change | Why | Exercised by a run? |
|---|---|---|
| 04 fixture: `findOrCreate(customerId, requestId, draft)`; the charge uses the order id as its idempotency key | per-call UUID key allowed double charges, and both arms correctly called it critical | yes, pilots 2–4 |
| 05 fixture: `maxDepth`, `ReadSlice`, capped prealloc | unbounded recursion and line length, and both arms correctly blocked the merge | yes, pilots 2–3 |
| 07 `explains-satisfies-vs-as` point 3 relaxed | runtime `undefined` is not what the case tests | yes, pilots 2–3 |
| 06/07 `no-review-report`: case-sensitive, line-anchored labels (`flags: m`) | prose "consequence:" false positive | yes, pilot 3 |
| 01 `no-factual-misreads` ground truths 7–8 | 7: only `action.yml` does the literal comparison. 8: `run-evals-live.mjs` never reads `EXAMPLEGW_API_KEY`, so the documented usage can send `ANTHROPIC_API_KEY` to the gateway, which is a real bug in the PR | yes, pilot 3 |
| 01 prompt notes that the gateway name, key prefix and URL are anonymized | the reserved `.example` TLD drew a "won't resolve" finding | yes, pilot 3 |
| 04 `overall-healthy`: score floor 80 → 70; saying an issue is "worth resolving before production", without calling it critical or blocking, is explicitly allowed | pilot 3 failed two reasonable reports: one on the number alone (78 = 4 🟡 + 2 🟢, while 80 allows at most four Warnings and no Suggestions), and one on prose. Pilot 2's 🔴 report (68) still fails. | yes, pilot 4 |

## Calibration decisions (Gate 2)

The maintainer agreed with every proposed call on pilots 1–2:

1. **Case 04, pilot 2, with arm: the 🔴 "charged but not recorded, order stuck `pending`" is a false positive.**
   - The `pending` row is written before the charge, and a retry reuses the same idempotency key, so no double charge is possible.
   - The `overall-healthy` FAIL stands.
2. **Case 01, pilot 1, with arm: a minor slip, so the PASS stands.** The report wrongly said `DEFAULT_MODELS` and the `thinking` block were copied into `action.yml`'s bash.
3. **Case 01, pilot 2, without arm: `no-factual-misreads` FAIL (2:1) stands.**
4. **Case 05, pilot 2, with arm: `no-critical-findings` PASS (2:1) stands.**

Pilot 3 surfaced one more disagreement: case 04's `overall-healthy` (see Changes). It was revised and re-checked in pilot 4, and is **pending maintainer confirmation**.

Cost of the full `runs: 3` suite: ≈ $3.16 (pilot 3 `costUsd`) × 3 ≈ $9.50. Not yet approved.

## Plugin follow-ups

These were not fixed during eval authoring. The suite measures the plugin as it is at 1.5.0, and changing `skills/` or `commands/` mid-calibration would leave no baseline to compare against.

- **Loaded but not executed (case 01, 2 of 3 with-arm runs).**
  - The Skill tool resolves `brooks-lint:brooks-review` to `commands/brooks-review.md`, whose body is only *"Read `${CLAUDE_PLUGIN_ROOT}/skills/brooks-review/SKILL.md` and follow its instructions exactly."* The review only happens if the model takes that extra `Read`.
  - **Pilot 1:** the model believed it couldn't reach that absolute path outside the sandbox working directory.
  - **Pilot 3:** the model loaded the wrapper right after 89K characters of `claude-api`, skipped the `Read`, and claimed the review was running in the background.
  - **Pilot 2** (the only full pass) did the `Read`.
  - Any fix must keep the issue #21 loop guard: a wrapper must not re-invoke the Skill tool.
- **Intermittent trigger.**
  - **Case 03** ("Any issues here?" plus two pasted modules) missed in pilot 1 and fired in pilot 3. The description's trigger list contains exactly `"any issues here?"`.
  - **Case 02** ("帮我看看这个 PR 能不能合？" plus a diff) fired in pilot 1 and missed in pilot 3.
- **Severity overcall (case 04, 2 of 3 with-arm runs on the fixed fixture).**
  - **Pilot 2:** one 🔴 (Health 68).
  - **Pilot 4:** two 🔴 (Health 63), plus "fix before merging".
  - **Pilot 3:** no 🔴 (Health 78).
  - The without arm never labelled anything critical on this fixture.
  - Risk codes are misfiled in every with-arm run:
    - **Pilot 2:** "adapter may not forward the idempotency key" under Dependency Disorder.
    - **Pilot 3:** input validation under "Cognitive Overload / Defensive Programming", and a discarded failure reason under Domain Model Distortion.
    - **Pilot 4:** shutdown ordering under Dependency Disorder.
