# Independent QA of the 42-answer assessment

Date: 2026-11-14. Verdict: **PASS**. No model calls or candidate repair executions were made by QA.

## Evidence checks

- Independently extracted the committed raw archive into a disposable directory and reran frozen `verify` and `assess`. The assessment is byte-identical to `assessment.json`; the archive SHA-256 matches the collection record. The prior failed submission remains separate.
- Checked all 42 unique answer IDs, answer hashes, annotation excerpts and requested/selected gpt-6.1-terra / low identity, CLI 0.167.1. The records form 21 complete B/C pairs. Each arm has 21/24 completed; repeat 3 of HS-06–08 is absent in both arms.
- Recomputed 3,053,383 new observed tokens plus 37,409 prior tokens = 3,090,792. The budget stop is retained; one admitted turn caused the permitted 90,792-token overshoot. No new failed turn or automatic recovery is claimed.
- All 321 retained historical hashes match. Version 1.9.1 agrees across package, four manifests, six README badges, JSON-LD and top CHANGELOG. The source inventory derives 12 books, matching README/AGENTS/GEMINI. The 64 evals agree with AGENTS. All six skill descriptions retain their negative trigger boundary.

## Semantic and metric review

QA read every decoded answer and all six proposed replacements, compared them with frozen inputs and criteria, and independently checked the critical judgments. This is a second AI review in the same workflow, not independent human validation.

- Health: all 12 model artifacts exactly match assembled JSON and finalized report, including required LF counts and literal text. The six C novel local mutants are valid distinguishing witnesses for the sole supplied test, so label mismatch is not a false defect. The primary unknown-debt failures follow the private frozen criterion; public local-source scope admits a defensible alternative, correctly retained as sensitivity rather than erased.
- Sweep: all seven expected explicit-input defects per arm are identified; the finite-integer precondition is not expanded into an invented rejection duty. C's three HS-03 responses expand local assessment to unavailable global evidence and choose verification-blocked, contrary to the frozen local-stop endpoint. Both groups correctly recognize the distinct unknown-contract, cap, missing approval and unavailable replay boundaries in the other cases.
- The six B Architecture 95 scores map local validation defects to an unsupported architecture dimension. These plus three health debt scores yield nine unsupported scoring claims; C has six health debt claims. The report properly separates these from invented target defects (zero).
- Static tracing of the six HS-04 proposals supports array checks, invalid-element rejection including sparse holes, sorted-copy preservation and allowed path scope. `Number.isInteger` rejects NaN and infinities. No candidate or mutant was executed; the report does not claim executed repair success.
- Six B semantically correct answers omit the optional public tool; frozen strict scoring nevertheless requires a finalizer receipt. The report explicitly exposes this endpoint inconsistency, gives the tool-exemption sensitivity, and avoids calling it a reasoning failure. Primary strict B6/C12 and semantic B12/C12, per-skill totals, issue recall, missing pairs, unsupported-claim counts and both reported sensitivities recompute correctly.

The main limitations are authored/non-independent cases, unequal prompt sizes, partial execution, uncertain local debt scope and optional-tool versus strict-endpoint mismatch. The report accurately avoids a general skill-superiority or controlled before/after claim. No findings requiring annotation changes were identified.

## Automated gate

The commands ran sequentially and all exited 0: `npm run validate`, `npm test` (222 custom-runner tests and 1,365 Node tests, zero failures or skips), `npm run evals` (64 structural cases), and `npm run benchmark` (30 frozen parser reports; severity inventory and SARIF valid, risk precision/recall 100%). Logs are retained as `qa-validate.log`, `qa-test.log`, `qa-evals.log`, and `qa-benchmark.log`. Local process/loopback permissions enabled offline fixtures; no live evaluation was run. The raw replay log and cross-check JSON retain independent evidence.
