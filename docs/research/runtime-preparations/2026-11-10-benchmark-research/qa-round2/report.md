# QA round 2 — PASS

Date: 2026-11-10. Full rerun after eval-curator correction. No live models run.

## Gate results

| Gate | Result |
| --- | --- |
| npm run validate | PASS |
| npm test | PASS: Node components 6 + 914 + 75 + 64 + 4 = 1,063, plus custom validator assertions |
| npm run evals | PASS: 64 structural scenarios |
| npm run evals:runtime:prepared | PASS: Node components 541 + 75 + 64 + 4 = 684 |
| npm run benchmark | PASS: frozen 30-report parser corpus |
| Cross-document consistency | PASS |
| git diff --check | PASS |

Counts overlap between commands; they must not be added as independent tests.
Raw logs and `commands.json` retain command outputs, exit codes and durations.
`cross-doc.json` compares 1.9.1 across four manifests, six README badges, landing
JSON-LD and CHANGELOG; 12 derived books across README/AGENTS/GEMINI; 64 actual and
claimed evals; all six skill negative trigger boundaries. No version or release
change was needed. No tracked changes affect the old HB suite or 81-answer archive.

## Closure of round-1 finding

BV-09 context and rubric now explicitly say global user uniqueness is insufficient.
The permissive contract requires immutable one-tenant-per-ID binding, verified
upstream before every cache access. The alternate execution uses a closure-owned
frozen binding table and rejects mismatches before calling authorize. Both request
orders are exercised; valid requests continue to make progress. The restrictive
completion explicitly permits one global user to access different tenant grants.

Two new regression tests establish the distinction. Actual global-user histories
violate the bound for BV-07 and BV-09, and pass for tuple-key protected BV-08.
`closure-evidence.json` records these observations and the enforced gate histories.
The unresolved source remains byte-identical to its defect peer; the different
judgment derives from an explicitly absent upstream contract, not a hidden patch.
The round-1 report, reproducer and original digests remain intact.

## Artifact boundary checks

- All 18 new cases execute actual fixture modules. The two multi-issue families
  have independent partial-fix tests; outbox covers 24 batch order/ack/recovery
  histories, checkpoint covers 8 partial-progress/epoch/reorder histories.
- All six unresolved families execute restrictive/permissive completions and save
  observations. These are finite synthetic contract checks, not production proofs.
- Export structure/import/path checks plus freeze validation prevent accidental
  evaluator files or unreviewed source drift in the authored input boundary.
- Combined catalog contains 54 synthetic cases and excludes all external entries.
  The saved calibration draft exactly equals fresh `prepare()` output: 18 cases,
  54 scheduled A/B/C turns, model/budget/guidance/live adapter unset. It is not a
  live execution plan or authorization.
- All five external golden-comment files and LICENSE byte-match pinned upstream
  commit e616e849755441da38f18bf3adba2c9583b03803. `upstream-integrity.json` records
  each digest. Fifty candidates and 173 labels remain quarantined, with five
  upstream revision warnings retained. No production execution is claimed.
- Issue annotations preserve per-issue recall, causal duplicate handling, confirmed
  and pending findings, precision bounds, and novel-confirmed findings separately.
  The helper is not an autonomous semantic judge or complete answer-quality score.
- Research/design documents distinguish historical HC ceiling from unmeasured
  HB/BV difficulty, public author exposure, absent independent human calibration,
  and the limits of frozen source integrity. No perfect/100x capability claim.

## Construct-validity limitation: answer cueing

The unresolved contexts often state the missing guarantee and both alternative
contracts explicitly (BV-09 is a clear example). This makes the task a supported
conditional-contract reasoning exercise; it does **not** measure independent
discovery of the missing guarantee. Models still need to relate the alternatives
to the supplied code, but some required evidence can be paraphrased directly from
the prompt. Treat this as calibration/scaffolded material, not demonstrated hard
uncertainty diagnosis. It is not a semantic contradiction or an offline integrity
failure, so the scoped gate remains PASS. If the intended capability is discovering
which artifact is missing, revise the visible context to operational facts and
explicitly unknown deployment inputs without supplying the two expected judgments,
retain fair observable contracts, then refreeze and rerun QA. Do not compare those
revised prompts as identical to this frozen version.

## Frozen evidence

New v2 freeze SHA-256:
`a1dd781d63317468ea6546d9cc7815076b4f673c833a6dbe0108ac22503b0735`.

Preserved HB freeze SHA-256:
`00fd5a575c0db2249b96103faec48e74914f2eadd0d5da00294e4fbc82b5b682`.

Saved calibration draft SHA-256:
`80723ad70037b2dc9eec786fc257b0d0fd563a93f8bcc32fa94910309e2c6a2c`.

Inspected source/draft digests were unchanged at completion. Full entries are in
`inspected-digests.json`. This is same-workflow agent QA, not independent human
truth, measured model discrimination, or a claim that all possible flaws are absent.
