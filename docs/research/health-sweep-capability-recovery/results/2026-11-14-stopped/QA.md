# Independent result QA

Verdict: **PASS**. No model calls were made during QA. This verifies the partial result artifacts, not full-campaign effectiveness or resolution of the network fault.

## Automated gate

All commands exited zero, in order: `npm run validate`, `npm test`, `npm run evals`, `npm run benchmark`, and `node --test evals/research/health-sweep-capability-recovery/recovery.test.mjs`. Logs are `qa-validate.log`, `qa-test.log`, `qa-evals.log`, `qa-benchmark.log`, and `qa-targeted.log`. Repository checks: 222 legacy plus 1,382 Node tests (1,604); 64 structural scenarios; parser benchmark passed; 13 recovery tests passed.

## Boundary-crossing verification

- Independently extracted the raw archive into a fresh temporary directory; its SHA-256 matches model-info.json. Frozen verification and assessment reproduction pass; regenerated assessment bytes equal the saved assessment exactly.
- Compared all 53 retained annotation objects against the original published annotations; unchanged. Both original account/read failure (unknown usage) and recovery ordinal-56 failure (75,482 observed tokens) remain preserved. Neither enters semantic denominators.
- Independently read both new answers against their supplied contracts and frozen criteria. Ordinal 54 correctly leaves cache behavior unresolved, performs no edit, suppresses unsupported scores and claims only textual assessment. Ordinal 55 correctly diagnoses the production missing-LF defect and refuses unauthorized edits, but incorrectly deducts Test Quality/T1 despite a supplied assertion protecting that requirement. Its evidence-status failure and other passing axes agree with the prior ordinal-24 convention.
- Recomputed merged counts: B 13/28, C 21/27 behavioral complete; health 4/16 versus 10/16; sweep 9/12 versus 11/11; expected issues 16/16 versus 15/15; repair checks 4/4 each. There are 27 complete pairs (13 both, eight C-only, six neither), plus unpaired B ordinal 55. Original unresolved judgments remain uncertainty, not proven failures; protocol and label agreement remain separate.
- Checked selected terra/low/CLI0.169.0 identities, three new attempt records, 141,055 new observed tokens, 74,655 ms and cumulative 3,543,939 observed tokens / 1,641,455 ms. Failure cleanup confirms process-group absence and private-home removal. Provider identity, hidden retries and complete billing remain unverified.
- Cross-checked package 1.9.1 against four manifest surfaces, six README version badges, JSON-LD softwareVersion and top CHANGELOG. Derived 12 books from source frontmatter, consistent with README/AGENTS/GEMINI; 64 actual evals match AGENTS; all six skill descriptions include negative boundaries. Frozen runner verification also checks preserved history/source bindings.

The report appropriately retains the original non-file evidence schema limitation, global label ambiguity, severity uncertainty and finite-repair-test limits. No blocking inconsistency was found. Independent artifact evidence is in qa-independent.json.
