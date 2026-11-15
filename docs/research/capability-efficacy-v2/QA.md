# Independent QA — PASS

Date: 2026-11-15. Scope: targeted capability efficacy pilot v2. QA is a separate maintainer-agent review, not independently authored human ground truth. No real model calls were made.

## Loopback

Initial review found that a definite failure could mask a separate unresolved primary axis and still allow a practical-lift decision. `qa-findings-initial.json` records the synthetic reproduction. The author fixed this by requiring all primary axes, issue decisions and pending claims to be resolved. The final regression demonstrates that a diagnosis failure plus unresolved authority cannot yield a practical decision. Actual latest-receipt delivery is now checked rather than inferred from completed transport status; malformed retained answers remain reviewable. The initial full gate was intentionally interrupted to restart on the final source; `qa-initial-*` retains that record, not a test-failure claim.

Final freeze: `45422dd46f7b5bd11c19a688f0441fbf4f46ef594a81687a0f29d075c6003ac1`.

## Boundary verification

- Public prompts exclude variant IDs, private probes, reference fixes and rubrics. Both arms share tasks, tools and output contracts. The schedule has exactly 12 cases × two arms × three repeats = 72 calls. Budget/model bindings match the README: gpt-6.1-terra / low, CLI 0.169.0, 10 million observed-token admission ceiling, 6 hours, 120 seconds per turn. Explicit live admission, fresh directories and fail-stop/no automatic retry rules remain enforced. Cleanup and admitted calls have bounded completion overhead; observed tokens are not billing.
- Source seals include the decision-rule README, collector/reviewer, inherited stateful transport, Docker isolation and guardian. All 7,634 historical hashes remain unchanged. Final simulated archive hash matches its manifest. Extracted verification reproduces 72 successful fake turns and six adverse sequences, each stopping after one attempted turn with 71 unexecuted. All 16 archived authored Docker controls agree with their expected disposition, inspected isolation policy and confirmed cleanup. See `qa-archive.json` and `qa-evidence-replay.json`.
- Independently executed four additional correct/input-mutating Docker controls and four exact authored health-test mutation witnesses. Return values, rollback/input preservation and asynchronous observation controls match expected outcomes. No model-generated source ran on the host. See `qa-independent-docker.json` and its log.
- Reviewer packets omit arm/repeat/ordinal and Docker path metadata, use the latest finalized ledger only, and preserve exact typed evidence. Style can still reveal the arm. Found/missed/unresolved expected issues are distinct; taxonomy/format cannot by themselves improve the primary outcome. Per-axis, case, mode, family and paired results remain visible. Finite repair probes and four development-authored families cannot establish universal correctness or population-wide skill advantage.
- Four plugin manifests, six README badges, landing JSON-LD and CHANGELOG match version 1.9.1. Source frontmatter derives 12 books, matching README/AGENTS/GEMINI wording. Actual 64 evals match AGENTS, and every shipped skill has the negative trigger clause. See `qa-cross-doc.json`.

## Validation

- Final source targeted regressions: 29/29 (12 new plus 17 inherited), `qa-targeted.log`.
- Final source/freeze binding: PASS, `qa-binding.log`.
- Final `npm run validate` → `npm test` → `npm run evals` → `npm run benchmark`: all exit 0, preserved as `qa-validate.log`, `qa-test.log`, `qa-evals.log`, `qa-benchmark.log`. The full test includes both historical recovery snapshot replays; 64 structural evals pass and the 30-report parser corpus has 100% fidelity/SARIF validity.
- Final post-gate source/freeze validation passes. No actionable inconsistencies remain after the loopback.

## Limits

This prepares a prospective comparison; it reports no new real-model efficacy result. The practical-lift threshold is descriptive and preregistered, not a significance test. Cases are development-authored, one family revisits a known mechanism, and three repeats do not create independent tasks. This pilots health/sweep static guidance against a generic checklist; it does not establish efficacy for the other skills, native skill discovery, unseen repositories, autonomous iterative repair or other models.
