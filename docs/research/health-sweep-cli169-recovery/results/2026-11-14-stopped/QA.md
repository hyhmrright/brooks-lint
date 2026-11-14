# Independent results QA

Verdict: **PASS**. No real model calls were made during QA.

## Automated gate

All commands exited zero in order: `npm run validate`, `npm test`, `npm run evals`, `npm run benchmark`, then the recovery-specific `node --test evals/research/health-sweep-cli169-recovery/recovery.test.mjs`.

- `npm test`: 222 legacy checks and 1,382 Node tests (1,604 total), no failures.
- Structural evals: 64 scenarios, all checks pass.
- Parser benchmark: frozen corpus fidelity checks pass.
- Recovery-specific tests: 12/12 pass.
- Raw command output is retained in `qa-validate.log`, `qa-test.log`, `qa-evals.log`, `qa-benchmark.log` and `qa-targeted.log`.

## Independent boundary comparisons

The archive was extracted to a fresh temporary directory and verified by the frozen recovery runner. The merger regenerated `assessment.json` from that extracted run and the three new annotations; the output is byte-identical to the saved assessment. Archive SHA matches `model-info.json`. All 321 preserved historical hashes match the freeze. Both failed attempts remain excluded from semantic denominators, with the old failure preserved in the original archive and the new failure in this archive.

Each of the three new answers was independently read against its input and frozen rubric. HS-03/C correctly respects the finite-integer domain, makes no edit and stops without actionable findings. HS-04/C and HS-04/B identify the explicit rejection duty with concrete invalid-input witnesses, propose only the authorized file and stop at the iteration cap. All distinguish source prediction from host tool execution. HS-04/C's imprecise mutation heading is acknowledged in the report; it does not negate the demonstrated rejection failure or justify adding an unfrozen criterion. Candidate changes were not executed.

The saved aggregate correctly reports B 18/20 and C 20/20, health 6/6 each, sweep 12/14 versus 14/14, expected issue recovery 7/7 each and zero annotated false claims. All 20 case/repeat pairs are complete; only C passes two pairs. The advantage remains the two original B stopping-rule failures, not diagnosis recall. The report accurately states partial coverage, same-workflow judging and non-independent repeated cases.

Raw identity and usage agree with the report: selected gpt-6.1-terra / low, CLI 0.169.0; four recovery attempts, three completions, one failure, seven unattempted rows; 308,173 recovery observed tokens, 3,187,885 cumulative. Backend identity and hidden retries remain unverified. No remaining calls are executed or authorized by QA.

Cross-document checks also pass: package 1.9.1 matches four manifest surfaces, all six README badges, JSON-LD and top CHANGELOG; the source inventory derives 12 books matching README/AGENTS/GEMINI; AGENTS' 64 eval claim matches actual scenarios; six skill descriptions include negative trigger boundaries. Machine-readable independent checks are in `qa-independent.json`.

No blocking finding remains. Frozen source files, original answers and original annotations were not edited.
