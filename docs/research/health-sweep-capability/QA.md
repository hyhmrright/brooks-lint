# Independent capability-corpus QA

Verdict: **PASS for offline development corpus preparation**. No model calls were made. This is not a live execution freeze, an efficacy result, or approval to execute generated code.

## Automated gate

All commands ran after the final instruction-bundle correction and exited zero, in order:

- `npm run validate`: repository consistency passed (`qa-validate.log`).
- `npm test`: 222 helper checks plus 1,382 Node tests, 1,604 total; zero failures (`qa-test.log`).
- `npm run evals`: 64 structural cases passed (`qa-evals.log`).
- `npm run benchmark`: parser-fidelity benchmark passed (`qa-benchmark.log`).
- `node --test evals/research/health-sweep-capability/suite.test.mjs`: 12/12 passed (`qa-targeted.log`).

## Boundary comparisons

Independent checks recorded in `qa-independent.json` compare package version 1.9.1 to all four manifest surfaces, six README version badges, landing-page softwareVersion and top CHANGELOG. Source frontmatter derives 12 books, matching README/AGENTS/GEMINI wording. AGENTS claims 64 evals, matching the actual array; all six descriptions retain negative trigger boundaries.

All 7,371 historical research hashes match. No shipped skill or historical result was changed. The 14 cases comprise eight health and six sweep cases in nine named families; families and paired variants must not be counted as independent holdouts.

Reviewed every public contract, private expected issue/status, oracle and reference candidate. The suite covers forbidden versus permitted dependency direction; shared versus independently owned policy; surviving versus killed mutant and unknown test inventory; valid repair versus no-op, overbroad and unauthorized changes; protected parsing; absent cache contract; approval, replay and budget blockers. Tests establish those authored fixture premises, not model quality. Exact enum compliance remains distinct from action/authority semantics in the documented measurement contract.

For each case, B/C task and tool exposure are identical. C includes every explicitly enumerated static instruction file, verified against file contents and frozen hashes. Private rubric/reference/oracle objects are not included in the public assembly. The initial guide-only assembly was corrected before this full gate; its precursor freeze remains preserved under development-guide-only. This is a static instruction bundle, not evidence of native skill discovery or interactive orchestration.

Authored reference candidates execute in disposable directories, with restricted Node permissions, an empty credential environment, two-second timeout and bounded output. The implementation accepts named authored references and rejects unknown variant names and unauthorized replacement paths. It is not an adversarial sandbox: callers can construct JavaScript objects, and no model-candidate ingress is exposed or claimed. A future collector must implement and validate actual untrusted-code isolation before using generated candidates.

## Limits that remain explicit

- Only one authorized repair fixture currently exercises candidate success and rejection. This is useful evaluator coverage, not broad sweep repair coverage.
- HC-08 explicitly supplies the causal owner and benchmark weights. It tests guided scoring, deduplication and arithmetic consistency, not independent discovery of causal ownership. Other semantic evidence still requires manual review.
- The annotation validator enforces required evidence fields and axes; it does not verify semantic truth, exact quotes or answer hashes against a retained response. Those bindings and the final answer/protocol schema remain prerequisites for a live collector.
- The arithmetic helper is distinct from the shipped scoring/final-artifact tool. The current assembler exposes no workspace execution tool. Equal tools here means equally absent tools; it does not reproduce the previous mandated-tool experiment.
- Model, effort, repetitions, schedule, live budgets, collector and candidate isolation are not frozen. No claim of model readiness or measured skill improvement is warranted.

No unresolved blocker remains for the stated offline corpus scope. Do not promote this verdict to a live-readiness claim.
