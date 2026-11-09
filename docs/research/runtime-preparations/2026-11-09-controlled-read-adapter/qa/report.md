# Independent QA round 1 — FAIL

All four automated commands passed on the final author sources: `npm run validate`, `npm test`, `npm run evals`, and `npm run evals:runtime:controlled:validate`. Exact stdout/stderr, UTC timestamps and SHA-256 values are in `results.json`. Cross-document checks passed (four manifests, six README badges, landing JSON-LD, CHANGELOG 1.9.1, derived twelve-book count, 64 evals and six negative trigger clauses).

## Blocking finding — eval-curator remediation

**Symptom:** `observations/deadline.json:76` contains `response.bytes_base64: null`, with no response status, while its adapter receipt at lines 20–21 says eight bytes were received. README lines 22–25 claim body bytes are retained for all eight controls.

**Source:** `evals/research/runtime/prospective/controlled-read-fixture.mjs:8` fills response evidence in the response `close` listener, but returns after `server.close` without awaiting those response listeners. The recorder serializes before that callback runs on the timeout path. `controlled-read-drill.mjs:32` checks outcomes and ledger counts but does not require terminal capture or cross-check request/response byte evidence against receipt hashes/counts.

**Consequence:** A key failure-path raw response is lost; the archive validator reports PASS despite missing claimed evidence. Checksums of this incomplete archive do not repair the missing evidence or establish consistency between the server and client observations.

**Remedy:** Preserve this failed archive and QA round unchanged. Await bounded per-response capture/cleanup before serializing, explicitly mark unknown cleanup as failure, retain client-observed partial bytes separately from server-authored bytes, and cross-check request/response body hashes/counts with appropriate partial-stream semantics. Add timeout/drip and intentionally missing/corrupt evidence regressions, collect new evidence in a separate directory, and rerun the full QA gate.

## Other reviewed boundaries

Restricted tool dispatch operates on immutable in-memory strings with exact paths; no arbitrary shell/process/network tool exists. Model/reasoning mismatch stops continuation. The request reservation ledger checks before dispatch and does not claim actual billing. Whole-run deadline is shared between requests with a post-response time check. Fixture-only auth and explicit encoded-echo limitations are disclosed. Model switch journal records no switch and no bound live model. The adapter is expressly non-native, custom fixture protocol, not OpenAI API compatible, not frozen-study eligible and not live ready. No production credentials or models were used by QA.

Current source snapshots match all four current adapter files. The archived eight outcomes match their declared expectations, but the above missing-byte boundary makes the overall verdict FAIL. Route back to eval-curator, then run QA round 2 on repaired final sources.
