# QA1 — FAIL

Route back to **eval-curator / native author**. No commit, push, live provider call,
credential read, Docker recording, or release was performed by QA.

## Automated and cross-document gate

All **26** author-declared offline commands passed independently, in their declared
order, starting with `npm run validate`, `npm test`, and `npm run evals`.
`gates.json` and the exact stdout/stderr files preserve command/time/exit/hash data.
The main suite passed **793/793, zero skipped**; 222 helper checks and six provider
tests also passed. Structural evals cover 64 scenarios. Parser benchmark, existing
saved archives, native/smoke evidence checks, TLS evidence checks, and original
81-not-run inventory passed. These green commands do not establish the missing
cross-artifact properties below.

`cross-doc.json` confirms version **1.9.1** across package and all four manifests,
six README badges, docs JSON-LD and top CHANGELOG section. The source frontmatter
contains 12 books, matching README/AGENTS/GEMINI words. Actual eval count is 64,
matching AGENTS. All six shipped skill descriptions contain their negative boundary.
No skill description, version or release artifact changed.

## Findings

### 1. P1 — Smoke evidence permits unrelated token counts and missing raw answers

**Symptom:** `probe-smoke.mjs` replaced the first count request body with
`{model:"DIFFERENT-MODEL",input:"different uncounted prompt"}`. `validateSmoke`
accepted it. Separate mutations removed every raw client SSE response or cleared
the entire captured child stdout; both were accepted after updating only the
session record digest in the journal.

**Source:** `evals/research/runtime/prospective/native-smoke-validate.mjs:5`
compares the inference request (`pair[1]`) but not the projected counting request
(`pair[0]`) with its input-count ledger hash. Lines 4–7 trust parsed client events
and reported completed ledger fields without binding `r.result.stdout_base64`
to the parsed `r.client`, or parsing/hash-binding `r.client.responses` to the
transport observations and observed request sequence.

**Consequence:** A rehashed internally contradictory archive can claim counted
input, provider identity/usage and complete raw model records despite containing
no raw response or counts for a different request. This fails the evidence gate
needed before the maintainer relies on the smoke rehearsal. This reproduction
establishes a validator defect, not a demonstrated runtime credential leak.

**Remedy:** Bind each raw FINAL envelope to the parsed client, each request to its
count projection/hash and inference hash, each raw SSE to the transport response
hash/byte count, parsed completion/model/usage/unique ID, and the native continuation.
Check cumulative ledger prefixes/limits and reject missing or contradictory evidence.
Add rehashed negative regressions for all three reproduced mutations and adjacent
cross-session/reordered-response cases. Preserve the original evidence and QA1
records; use a new registration/source-bound revision if executable code changes.

### 2. P2 — Smoke cleanup acceptance does not establish the recorded time order

**Symptom:** Setting both session-one `state.completed_at` values to one second
before the run began, while leaving actual removal/absence/complete-event times
unchanged, is still accepted by `validateSmoke` after updating the record digest.

**Source:** `evals/research/runtime/prospective/native-smoke.mjs:15` (`ensureCleanup`)
checks complete flags and the existence of some matching completion/absence event,
but does not bind state time to its completion event or require successful removal,
post-removal exact-ID absence, then state completion, then import. This helper is
also called by the actual smoke launcher at line 19. It is weaker than the prior
native/lease evidence gate despite using the same cleanup claim.

**Consequence:** An inconsistent/corrupted cleanup record can satisfy the smoke
acceptance boundary, so the archive cannot substantiate the claimed
cleanup-before-import ordering. No real container leak was observed in this QA.

**Remedy:** Reuse or match the established identity-bound cleanup validation:
finite chronological timestamps, successful exact-ID remove, bounded closed
absence receipt, matching state and unique completion event, plus session/journal
ordering. Cover forged early/late times, duplicate completion, failed/unclosed
removal, wrong IDs and a completion preceding final absence. Validate negative
preflight cleanup with the same contract rather than flags alone.

## Additional transport review

Read the trusted HTTPS transport, native gateway, source-bound registration and
lease workload changes. Existing TLS regressions passed. Eight additional pure
probes rejected unadvertised streamed tools, streamed model mismatch, terminal
suffix/duplicates, configuration changes, missing usage, unapproved live transport,
and a live custom-counter bypass. `transport-probes.json` records exact outcomes.
No additional concrete runtime transport defect was established by this review.
This is scoped agent QA, not independent human security certification.

## Reproduction and preservation

- `probe-smoke.mjs` and `smoke-mutations.json`: all four mutations returned
  `accepted: true` on QA1 sources.
- `smoke-mutation-archives.tar.gz`: exact mutated archives, preserving the
  contradictory records used in the tests; public fixture data only.
- `sources/`: exact reviewed smoke validator, smoke launcher, native checker and
  HTTPS transport sources, before repair.
- `probe-transport.mjs`, `transport-probes.json`: additional rejected probes.
- `evidence-inventory.json`: hashes of the evidence files available before this report.

Required next stage: author repair, then **full QA2**, not only focused reruns.
