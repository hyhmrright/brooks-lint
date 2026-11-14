# Budget-stopped health/sweep adjudication

All 42 completed answers and their tool histories were read against the frozen case criteria. Requested and selected tested model: gpt-6.1-terra / low, Codex CLI 0.167.1. Semantic reviewer: gpt-6-astra in the same research workflow, not an independent human. No new model request or candidate execution occurred during adjudication.

## Execution and denominators

The amended protocol attempted and completed 42 of 48 slots, with no new failed submission. The retained original failure gives 43 lifetime submissions. Cumulative observed usage was 3,090,792 tokens (new segment 3,053,383; prior 37,409), with 1,380,080 ms recorded execution. The last admitted turn overshot the 3M admission ceiling by 90,792 tokens, as permitted by the frozen rule; no further turn was admitted. This is not a strict billing cap.

Each arm has 21 completed of 24 planned responses. All completed case/repeat pairs are matched: 21 B/C pairs. HS-01–05 have three repeats per arm; HS-06–08 have only two. The six missing responses are repeat 3 of HS-06–08 in both arms. Do not count these as failures or silently drop the planned denominator. The two health variants are one source contract with formatting variations, not independent diagnoses.

## Primary frozen metrics

| Metric | B generic checklist | C skill guidance |
| --- | ---: | ---: |
| Completed / planned | 21/24 | 21/24 |
| Semantic complete | 12/21 | 12/21 |
| Strict complete task | 6/21 | 12/21 |
| One-missing-LF normalized complete | 6/21 | 12/21 |
| Expected defect recall | 7/7 | 7/7 |
| Expected defect misses | 0 | 0 |
| Invented target defect claims | 0 | 0 |
| Unsupported scoring claims | 9 | 6 |
| Pending judgments | 0 | 0 |
| Helper uptake / host exact / final JSON exact | 15/21 each | 21/21 each |
| New observed tokens | 564,423 | 2,488,960 |

The assessor's `falseClaims` field includes unsupported scoring/confidence claims. Here its 9/6 values are **not** 9/6 invented implementation defects. Those are separately zero. C used about 4.41 times B's observed tokens. Whole-task semantic completion ties, so strict completion alone must not be presented as a general intelligence advantage.

| Skill | B semantic | C semantic | B strict | C strict |
| --- | ---: | ---: | ---: | ---: |
| health | 3/6 | 0/6 | 3/6 | 0/6 |
| sweep | 9/15 | 12/15 | 3/15 | 12/15 |

## Health: transport success, scope still problematic

All 12 health answers successfully finalized and assembled, preserved the required one/two terminal LFs and literal Chinese/quotes/backslash text, and delivered the complete assembled JSON exactly. The observed missing-LF symptom did not recur. Both arms succeed at delivery, so this is no incremental C advantage. The former study used a different protocol and cases; it is supportive engineering evidence, not a controlled before/after estimate.

All six C health reports, and B ordinals 1/4/33, score Tech Debt as 100 despite missing ownership/maintenance evidence. The frozen health rubric explicitly requires broader architecture/debt to remain unknown; those nine answers lose `unknown-dimensions` and receive one unsupported scoring claim. B18/19/36 leave debt unassessed and pass. The interpretation is contestable if one instead allows a narrowly local clean-debt assessment; that alternative is reported below rather than silently changing the frozen criterion.

The protected-test label is incomplete. All six C answers provide valid novel test gaps: negative clamping (2), fixed output (3/17), empty-input special case (20), fixed output failing [2] (34), and default lexicographic sort failing [2,10] (35). These mutations pass the sole [3,1,1] assertion but violate other finite-integer inputs. They are supported local protection gaps, not invented arbitrary-input validation duties. Five C `defect` labels disagree with the frozen label, yet this is not by itself a false positive. The implementation protection credit is retained. No test or mutant was executed in this adjudication.

## Sweep: correct domain discrimination, over-blocked clean scope

Both arms recognize all seven expected explicit-rejection defects and refrain from inventing rejection requirements for finite-integer preconditions. All six HS-04 proposals are confined to rank.mjs; static reading supports rejection of non-arrays, NaN, infinities, fractions and sparse holes while sorting a copy of valid arrays. `Number.isInteger` rejects NaN and infinity even without a separate finite check. No proposal was applied or executed.

B returns the expected stop on all 15 sweep answers; C does so on 12/15. C's HS-03 answers (6/21/38) correctly recognize protected local behavior but select verification-blocked because broader architecture/test inventories are missing. The frozen task asks for a locally protected stop; expanding its scope changes the disposition. These three lose justified-stop, not defect recall. Both arms correctly distinguish unknown obligation (HS-05), explicit exhausted round cap (HS-06), absent owner approval (HS-07), and unavailable required replay (HS-08).

B8/16/23/30/31/40 attach a 95 architecture score to a local input-validation defect despite no architectural boundary evidence. These are additional unsupported scoring claims even though their target diagnosis, proposal, and stop are correct. C attributes the known local defect to debt and leaves architecture unassessed.

Six B answers (9/22/26/27/37/41) have correct semantic responses but no finalizer or helper. The frozen strict assessor requires a finalizer report even though public wording says tool use is permitted and numeric scoring alone is tool-gated. Thus these six lose strict delivery, not semantic credit. This is an endpoint/specification limitation; the report does not call it a reasoning error or change the frozen assessor. It explains much of C's strict advantage.

## Sensitivity and benchmark limitations

Primary annotations remain unchanged. In a separately labeled alternative accepting the nine local clean-debt scores, health would become B6/6 and C6/6 semantic/strict; overall semantic would be B15/21 and C18/21, strict B9/21 and C18/21. That is a different scope interpretation, not a correction to the frozen result. If the six semantically valid B answers without tools are exempted from finalizer delivery, B's task-completion count would become12/21 (matching C12/21), with all other judgments fixed. Both sensitivities show why the finalizer requirement and debt-assessment scope need explicit agreement before another experiment.

The stopped run remains small, author-developed, and non-independent: eight authored cases, related domain/stop variants, no independent holdout or human ground truth, unequal guidance sizes, and three omitted late case/repeat pairs per arm. No native skill discovery or executed repair success was measured. A different adjudicator model reviewed responses, and source-predicted witnesses were traced rather than run. No general skill superiority or cost-effectiveness claim follows.

## Next work justified by these records

Keep the deterministic delivery path: exact delivery now works in both arms. Clarify whether scoped local debt assessment may receive a clean score without ownership evidence; retain unknown dimensions otherwise. In sweep, stop based on the requested local obligation rather than unrelated unassessed dimensions. Improve score-dimension mapping, and reconcile optional finalizer language with mandatory strict endpoints. Expand health oracle coverage to allow supported novel test gaps. Any revised metric, case or recovery budget needs a new freeze; do not rewrite these observations.

## Artifacts and verification

`annotations.json` contains each answer hash, reviewer, quotes, issue/criterion credits, and rationale; `review-log.json` gives ordinal-level decisions. `assessment.json` is produced by the unchanged frozen assessor. `summary.json` records per-case counts, paired coverage and arm token totals. The original raw archive and prior failure remain unchanged. The frozen verify and assess commands pass; full repository QA is a separate gate and must be recorded before completion is claimed.
