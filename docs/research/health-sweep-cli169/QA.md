# CLI 0.169.0 binding — independent offline QA

Verdict: PASS. No live model call was made. User explicitly selected CLI 0.169.0; the earlier 0.167.1 preflight failed before output creation or submission.

- `npm run validate`, `npm test`, `npm run evals` and `npm run benchmark`: exit 0. Structural evals: 64; frozen parser benchmark: 30 reports, 100% fidelity. The repository-wide npm test does not include this new directory.
- Independently ran `node --test evals/research/health-sweep-cli169/retest.test.mjs evals/research/health-sweep-cli169/provenance.test.mjs`: 18 passed, zero failed or skipped (`qa-targeted.log`). This separately covers the new directory.
- Independently extracted and verified the synthetic archive: 48 completed fixture records and seven stop controls with expected stop outcomes. The original frozen plan and all 321 historical files remain unchanged. Provenance test checks all eight cases, private rubrics, B/C prompts, schedule, budget, model, effort and policy against the original freeze.
- Actual CLI binary and code-mode host hashes, and the current explicit-proxy binding, match the new plan. Login-turn derivative differs only in scope label; runner derivative differs only in scope and source path. Their auth isolation, retry detection, cleanup and budget admissions remain intact.
- Four plugin manifests, six README badges, docs JSON-LD and top CHANGELOG agree on 1.9.1; source inventory derives 12 books, matching README/AGENTS/GEMINI; 64 scenarios match AGENTS; all six skill descriptions include negative trigger boundaries.
- A real 0.169.0 CLI was exercised against a credential-free local fake upstream and produced synthetic text with process-group and private-home cleanup. This validates ordinary response transport only: real CLI dynamic-tool exchange and provider acceptance remain unverified. Fake app-server tests exercise dynamic-tool behavior separately. The first live protocol failure must stop immediately and must not be retried.

Raw logs are retained alongside this report. The 4.5M observed-token ceiling is admission-based and can overshoot by one admitted turn; it is not a billing cap. Backend model identity cannot be independently attested from CLI selection. The 8 authored cases are calibration, not independent holdouts.
