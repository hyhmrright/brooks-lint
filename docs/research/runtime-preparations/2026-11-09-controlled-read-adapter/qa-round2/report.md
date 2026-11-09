# Independent QA round 2 — PASS

The final repaired sources pass all four sequential commands: `npm run validate`, `npm test`, `npm run evals`, and `npm run evals:runtime:controlled:validate`. Exact streams, timestamps and hashes are retained in `results.json`. `npm test` reports 222 helper tests, six provider tests and 580 main tests, all passing. The main suite includes the 27 controlled-read tests; do not count them again as independent tests. Structural evals validate 64 scenarios; the controlled archive validates eight authored controls.

## QA1 resolution and evidence crossing

The prior `qa/` report/log inventory remains intact. All 13 inventory entries in each of `qa1-failed-observations/`, both earlier development collections and corrected `observations/` match their recorded hashes. The original deadline null-body defect remains visible in the failed collection. All four corrected source snapshots match current source bytes.

The fixture awaits both server closure and per-response closure under a one-second capture budget, marks unknown cleanup explicitly and returns terminal response records. Corrected deadline evidence retains server-authored writes separately from the client's observed partial prefix. The validator requires those fields and terminal confirmation, checks request body/hash identity, response lengths and hashes, common-prefix consistency for interrupted responses and complete body/status agreement for successful transports. New regressions exercise three repeated drip deadlines and missing/corrupt/cross-layer receipts. The QA1 blocking finding is resolved within this owned-fixture scope.

## Cross-document and scope checks

Four manifests, six README version badges, landing-page JSON-LD and CHANGELOG top section agree with package version 1.9.1. The source inventory derives twelve books and agrees with README/AGENTS/GEMINI. AGENTS' 64-scenario claim agrees with actual eval count. Six shipped skill descriptions retain their negative trigger clauses. Details are in `cross-checks.txt`.

Restricted reads expose immutable strings only; no arbitrary tool process or OS path access is provided. Model/reasoning mismatches stop continuation. Shared monotonic deadlines and pre-dispatch integer reservations are covered; fixture reservations do not prove token billing. The model journal accurately records no switch and unbound live test model. Production auth, arbitrary encoded secret echo handling, authenticated backend identity, native hostile descendant containment and provider-internal billing/retries remain explicitly unverified.

This PASS covers the exploratory custom fixture adapter and its evidence pipeline. It does not establish native Codex equivalence, a real OpenAI API implementation, study eligibility or live readiness. No model, production credential or native Codex invocation was used in QA. No release is authorized by this verdict.
