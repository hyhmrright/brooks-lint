# QA: 78-answer adjudication — PASS

QA reviewed the saved assessment without making model calls or editing annotations. This is another same-workflow AI-assisted review, not independent human ground truth.

## Automated and provenance gates

- In order: `npm run validate`, `npm test`, `npm run evals`, then `npm run benchmark` all exited 0. Logs are `qa-validate.log`, `qa-test.log`, `qa-evals.log`, and `qa-benchmark.log`. The test log reports 1,300 Node tests; structural evals cover 64 cases, and the parser benchmark passes its 30-report frozen corpus.
- Extracted `raw-run.tar.gz` afresh into a separate temporary directory and invoked the frozen assessor on all 78 annotations. Its output matched `assessment.json` byte-for-byte. This checks all response hashes, exact quotations, allowed credit IDs, coverage and derived metrics; it is not automatic semantic truth validation.
- All 78 response IDs are unique. Raw archive SHA-256 remains `d899daa452628e214f3426abd91954df926de7842837e01779763eaaa511431e`.
- Independently reran all four reviewer-authored novel reproductions. Baseline, mutated original-test outcome and concrete mutant observation each matched the saved `novel-reproductions.json` records.
- Independently changed only the BV5-24 novel finding verdicts to pending in memory and recomputed the sensitivity view. Its primary counts match `sensitivity.json`: A16, B23, C24 passes, one pending per arm. The original annotations were not changed.
- Cross-document check: four manifests, six README badges, JSON-LD and CHANGELOG agree with package version 1.9.1; source-derived twelve books agree with README/AGENTS/GEMINI; 64 evals agree with AGENTS; all six skill descriptions contain negative trigger boundaries. Details are in `qa-cross-doc.json`.

## Semantic boundary checks

Sampled the flagged criterion omissions against complete answers and frozen operational definitions: A01/07/10/16/22/24/25/26 supply diagnosis but omit a scoped remedy; A/B15 omit a concrete one-sided change result; A/B23 omit the required paired mutation comparison; C24 describes altered assertion suppression without establishing the original baseline. Withholding the full task criterion is consistent with the frozen definition, even where diagnosis is correct. Full-task failure must not be called diagnostic failure.

Checked BV5-25 C's exact-report failure against the mechanical result. Correct source diagnosis does not satisfy the entire successful finalReport delivery contract. The other five completed health answers retain the tool report.

The BV5-20 empty-string, BV5-23 other numeric-string and BV5-26 extra-field discoveries contradict explicit supplied obligations while surviving supplied tests; they are supported novel findings rather than automatic false positives. BV5-24's narrower smoke-test obligation is implicit, so the report correctly discloses that interpretation and its pending sensitivity. This remains a judgment limitation, not a hidden resolved contract.

The report preserves planned, completed, failed and not-run denominators; each arm has 26 completed answers out of 108 planned. There is no sweep answer, only two health cases and no second/third repetition. The result is a partial ordered development-set comparison. Neither equal B/C primary counts nor label disagreements establish general skill effectiveness or ineffectiveness. Unknown failed-request token usage remains explicit.

No blocking inconsistency was found. No source, frozen rubric, raw answer, historical registration or semantic annotation was modified by QA. Ready for the root agent to commit and push the adjudication artifacts and these validation records.
