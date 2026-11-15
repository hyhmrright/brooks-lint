# Independent calibration and delivery QA

Verdict: **PASS** for retrospective calibration and prospective offline protocol repair. No real model calls were made. This does not establish live model compliance or improved efficacy.

## Final gate

After correcting component quote relevance, the complete gate ran again on stable sources. All commands exited zero:

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run validate` | PASS | `qa-final-validate.log` |
| `npm test` | 222 legacy checks plus 1,382 Node tests, 1,604 total | `qa-final-test.log` |
| `npm run evals` | 64 structural scenarios | `qa-final-evals.log` |
| `npm run benchmark` | Frozen parser-fidelity benchmark passes | `qa-final-benchmark.log` |
| New calibration suite | 14/14 tests | `qa-final-targeted.log` |
| Source/history seal | All 7,565 historical files unchanged | `qa-final-seal.log` |

The first complete gate also passed and is retained in `qa-{validate,test,evals,benchmark,targeted}.log`; it began before the quote correction and is preliminary evidence. Final log hashes and derived test counts are in `qa-evidence.json`.

## Boundary comparisons

- Independently extracted the synthetic archive, checked its SHA-256 and all nine records: valid/latest/failed-finalize complete; stale/after-assembly/modified/cap/duplicate/wrong-scope fail. Every record is simulated and confirms process cleanup. The final targeted suite independently executes these fake app-server paths through the actual successor transport, not only through a standalone helper.
- Compared the successor transport with the historical CLI169 implementation: tool dispatch now uses per-turn state and final answer acceptance requires the latest assembled artifact. Successful re-finalization invalidates prior assemblies, failed finalization preserves the prior generation, and cross-turn/stale receipts fail. Historical admission caps, scope/duplicate checks and cleanup remain. The captured C83 stale-first-receipt sequence is rejected prospectively while its original delivery failure remains unchanged.
- Reviewed all 96 calibrated rows against retained inputs, answers and component definitions, including the 14 originally unresolved rows. Typed references validate file, contract and indexed evidence excerpts with answer/input hashes. Exact quotes establish provenance, not semantic truth. C37 remains unresolved; C70 has duplicate policy ownership; C66 has unsupported status; B84 retains the reproduced false diagnosis. HC03's independently repairable test gap is not forced into a closed expected-issue list.
- Recomputed the final calibrated report independently and compared bytes. Every original annotation remains exactly embedded. Final conjunctions are B29/48 and C45/48, explicitly exploratory; historical B26/48 and C39/48 are unchanged. Delivery, global labels, stop enums and finite repair outcomes remain separate. No post-hoc statistical superiority claim is supported.
- Verified package 1.9.1 against four manifests, all six README badges, docs landing-page JSON-LD and top CHANGELOG section. Derived 12 books matches README/AGENTS/GEMINI; 64 actual scenarios matches AGENTS, and all six skill descriptions contain negative trigger boundaries. Evidence: `qa-cross-doc.json`.

## Finding resolved

Initial review found that ordinal 5's status failure quoted a Code Quality deduction rather than its actual denial of debt obligations. Similar generic quote selection affected other component fields. The author audited all 96 rows and replaced component evidence with relevant complete tables or exact status/execution statements. Follow-up inspection confirms the contradictory claims in 5/38/69, clean score in 8/39, status claim in 66, ambiguity in 37 and all three deduction owners in 70 are directly visible. Across 672 component verdicts, zero verdicts changed. Pre-correction annotations/results/freeze are retained in `pre-quote-qa/`; `QUOTE-QA.md` describes the correction. No unresolved blocking finding remains.

## Limits

These are same-workflow retrospective judgments, not independent human ground truth or fresh held-out data. The scoring rules and examples were inspected after seeing responses. The new transport is exercised through a local fake app-server; no real CLI upstream or real model behavior is claimed. A future collector must bind the successor source and receipt protocol in a new freeze and obtain explicit model-run authorization. The shipped historical tool, collectors, skills and results were not modified.
