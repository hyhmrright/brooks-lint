# QA round 3 — PASS (final prompt revision)

Date: 2026-11-10. Full final rerun after prompt-cue reduction. No live models run.

## Final gates

| Gate | Result |
| --- | --- |
| npm run validate | PASS |
| npm test | PASS: Node components 6 + 914 + 75 + 67 + 4 = 1,066, plus custom validator assertions |
| npm run evals | PASS: 64 structural scenarios |
| npm run evals:runtime:prepared | PASS: Node components 541 + 75 + 67 + 4 = 687 |
| npm run benchmark | PASS: 30/30 frozen parser corpus |
| Cross-document consistency | PASS |
| git diff --check | PASS |

Counts overlap across commands. There are 67 v2 tests and 4 combined-audit tests;
they are already included in the command totals above. Raw outputs and exit codes
are retained. Cross-document comparisons again confirm version 1.9.1 in all four
manifests, all six README badges, docs JSON-LD and CHANGELOG; 12 books derived from
the source inventory and matching README/AGENTS/GEMINI; 64 actual/claimed evals;
all six skill descriptions have negative trigger boundaries. No tracked change
affects the previous HB suite or historical 81-answer archive.

## Prompt fairness and cue reduction

All six unresolved contexts were read against the actual modules, operational
drivers and evaluator rubrics. The revised handoffs preserve observable mechanics
while leaving the deployment/business contract outside the supplied packet:

- BV-03 retains durable relay state, crash location and replay; accumulator meaning
  belongs to the absent application data dictionary.
- BV-06 retains generation, delayed fill, synchronous invalidation and no background
  refresh; the absent service freshness contract determines whether stale publication
  violates a promise. No automatic eventual-refresh mechanism may be assumed.
- BV-09 retains shared multi-tenant cache, immutable policy and gateway ownership.
  The prompt no longer provides the immutable-binding answer, but does not establish
  that cross-tenant requests always reach the cache. The corrected evaluator still
  requires enforced one-tenant-per-ID binding, not merely global identity uniqueness.
- BV-12 retains atomic sink operations, offset/callback behavior and caller-managed
  handles; the absent scheduler lifecycle determines whether old callbacks survive.
- BV-15 retains the actual overlap argument semantics and possible publish interleave;
  its deployment value is absent. This remains a compact boolean reasoning case.
- BV-18 retains all pricing behavior and known mutants; external CI orchestration
  determines whether this function is a complete release gate or one check among others.

No exact hidden driver schedule, hidden constant or unseen implementation must be
invented to explain these conditional judgments. Each task asks for grounded defects,
protection or missing evidence with the same common instructions. The formerly
literal expected alternatives are absent. The cases still contain artifact-boundary
cues, and supplied mutants deliberately scaffold test-strength analysis. This is
reduced direct answer cueing, not proof of hard independent discovery or empirical
discrimination. Rubric evidence completeness remains a separate axis from assessment
correctness; omissions of detailed alternatives must not silently become false negatives.

## Preserved semantic correction and artifact integrity

The BV-09 round-1 error remains corrected in rubric and driver. Current execution
again shows the globally unique user failure in BV-07/BV-09, protected tuple-key
behavior in BV-08, and mismatch rejection before cache lookup under the explicit
upstream binding completion. These observations are saved in `closure-evidence.json`.

All six `afterSha256` values in the cue audit match actual context bytes, and all
18 task instructions are byte-identical. `cue-audit-check.json` records this check.
The `beforeSha256` values are **author-recorded historical hashes**: prior context
bytes were not retained as separate files, so this QA cannot independently revalidate
the before hashes from the prior whole-freeze digest alone. Prior tool reads and QA
reports support the semantic history, but do not establish independent byte custody.
No reconstruction is represented as an original snapshot.

The saved calibration schedule exactly regenerates from final source: 54 total
synthetic cases in the catalog, 18 calibration cases and 54 scheduled A/B/C turns.
Model, budget, guidance hashes and live runner remain unset. External candidates
remain excluded. The earlier exact-byte external-source check is preserved in
round 2, and current inventory validation rechecks its recorded digests. No model
answer, production dataset execution or live-run readiness is inferred.

Scoring still separates causal issue recall, false positives, pending/novel findings
and precision bounds; multi-issue partial fixes and all contract completions pass.
The research report now distinguishes intended runtime, core test-quality and
broader transfer strata prospectively, rather than requiring runtime guidance to
improve every domain. It does not claim those strata have been empirically validated.

## Final digests

New v2 freeze SHA-256:
`ca113ba12942925bde84aa86e5f0566217ed938af47cfd6e1e40ffdc59362790`.

Preserved HB freeze SHA-256:
`00fd5a575c0db2249b96103faec48e74914f2eadd0d5da00294e4fbc82b5b682`.

Final calibration schedule SHA-256:
`6d112be2f8d8918107bb804647574db1101903113e44b0910516fa5435f6284c`.

Inspected source/draft digests remained unchanged at completion. This is a scoped
offline integrity and semantic-consistency PASS from same-workflow agent QA, not
independent human ground truth, measured difficulty, production validity or a
perfect universal benchmark. Earlier QA records remain intact.
