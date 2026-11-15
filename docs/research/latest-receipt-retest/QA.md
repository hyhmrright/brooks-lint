# Independent offline QA

Verdict: **PASS** for the frozen six-call protocol retest. No real model or upstream calls were made.

## Complete gate

All commands exited zero, in order: `npm run validate`, `npm test`, `npm run evals`, `npm run benchmark`, then `node --test evals/research/latest-receipt-retest/protocol.test.mjs evals/research/capability-calibration/calibration.test.mjs`. Logs are `qa-validate.log`, `qa-test.log`, `qa-evals.log`, `qa-benchmark.log`, and `qa-targeted.log`. The test gate contains 222 legacy checks plus 1382 Node tests (1604 total); targeted tests pass 17/17 (three new collector tests and fourteen inherited calibration/state tests). Structural evals pass 64 scenarios; parser fidelity benchmark passes. Evidence hashes are in `qa-evidence.json`.

## Independent boundary comparisons

- Extracted the preserved synthetic archive into a fresh temporary directory, checked its SHA-256 and independently replayed all six successful records through the frozen verifier. All six adverse transport records have failed status and confirmed process/group/private-home cleanup. The targeted rerun additionally drives the actual successor RPC transport, collector stop controls and tamper rejection.
- The collector imports the new stateful `capability-calibration/login-turn.mjs`, not the historical stateless transport. Successful receipt outputs are recomputed, scope/generation are consistent, required scenario sequences and distinct drafts are enforced, and final output equals the latest assembly. Re-finalization invalidates an assembly rather than permanently locking the tool.
- Confirmed model `gpt-6.1-terra`, effort `low`, CLI `0.169.0`, six calls, 1,000,000 observed tokens, 1,800,000 ms total and 120,000 ms per turn. Both arms share tasks/tools; C adds the full health instruction inventory. Frozen binary/proxy and exact real smoke plan/execution hashes are checked on live admission; simulations cannot replace the real smoke. Fresh directories and explicit live mode are required; no automatic retry or implicit resume is introduced.
- Recomputed all 7,610 historical hashes via the frozen validation. Historical sources/results are unchanged, and QA outputs are outside the seal.
- Compared package 1.9.1 to all four manifests, six README badges, JSON-LD softwareVersion and top changelog version. Derived twelve books from source frontmatter and compared README/AGENTS/GEMINI wording; actual 64 evals match AGENTS; all six skill descriptions retain negative boundaries. Details are in `qa-independent.json`.

## Interpretation and limits

This is deliberately instructed receipt-lifecycle testing, not an efficacy test. The verifier checks lifecycle, identity, receipts, selected final output and bounded collection; it does not semantically validate every ledger assessment. In particular the synthetic fixture uses a clean assessed PR ledger despite the live prompt asking for skipped PR. That fixture establishes protocol plumbing, not full task-semantic compliance. A live report must separately identify any ledger-semantic errors; protocol pass alone is not proof of health correctness.

Rejected tool payloads can consume the inherited eight-request allowance; successful lifecycles are checked independently of failed payloads. Candidate code is not executed. Backend identity, hidden provider activity and full billing remain unverified. Prior smoke proves only the unchanged login route, not real-model compatibility with the new state protocol. Real execution still requires user authorization.

No blocking finding or source edit was required.
