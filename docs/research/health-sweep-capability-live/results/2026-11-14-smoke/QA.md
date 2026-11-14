# Independent smoke-results QA

Verdict: **PASS**. No real model calls or formal collection were performed by QA.

## Automated gate

The commands ran sequentially and all exited zero: `npm run validate`, `npm test`, `npm run evals`, `npm run benchmark`, then the separate capability-live protocol test file. Raw outputs are `qa-{validate,test,evals,benchmark,targeted}.log`.

`npm test` passed 222 legacy checks and 1,382 Node tests (1,604 checks total). Structural evals passed 64 scenarios; the frozen parser benchmark passed. All nine new protocol tests passed.

## Independent boundary checks

- Extracted the raw archive in a fresh temporary directory, verified the frozen runner and reproduced the smoke-gate receipt. Archive SHA-256 matches `model-info.json`.
- Recomputed the assessment from the extracted run and annotations; output bytes match `assessment.json` exactly.
- Read both answers against the public contract and private rubric. Both correctly identify the zero-default defect, propose only the authorized `config.mjs` nullish fallback, retain unknown dashboard dimensions, and distinguish source prediction from post-submission host execution. Exact answer quotes and source excerpts bind the four axis judgments. Both pass; no unsupported findings were observed.
- Verified requested/CLI-selected gpt-6.1-terra, low effort, CLI 0.169.0, ChatGPT authentication type, token counts 32,966 and 114,835, total 147,801, and elapsed 62,038 ms. These are within 300,000 observed tokens and 600,000 ms; backend identity and complete billing remain unverified.
- Both retained host candidate outcomes pass and confirm cleanup. Both include successful finalize/assemble receipts and exact final artifact delivery. No new Docker execution was needed to verify these archived receipts; the prior isolation QA remains separately preserved.
- Rehashed all 7,393 frozen historical files: unchanged. Compared package version 1.9.1 across four manifests, six README badges, landing-page JSON-LD and top CHANGELOG entry. Derived 12 books and checked README/AGENTS/GEMINI wording; 64 eval scenarios match AGENTS; all six skills retain negative-trigger boundaries. Machine-readable evidence is `qa-independent.json`.

## Interpretation and limitations

This is one SC-01 pair, not an efficacy estimate or a health evaluation. It establishes the frozen technical smoke gate for the recorded environment. The host evaluates a one-shot proposal after submission; it does not establish autonomous interactive sweep behavior. Finite repair tests do not prove universal correctness. Review is independent within this workflow, not independent human or holdout validation. Formal 96-call collection remains unexecuted and requires separate authorization.

No blocking findings, historical edits or source changes were required.
