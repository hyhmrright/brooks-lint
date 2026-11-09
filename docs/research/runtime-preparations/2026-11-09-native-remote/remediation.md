# One author repair after QA1

QA1 correctly failed despite all original 26 commands passing. It demonstrated
four rehashed archive contradictions accepted by the smoke validator: a count for
a different input/model, missing raw SSE, missing raw child stdout, and cleanup
state timestamps before the run. These were evidence-boundary defects; no actual
credential leak, real model call, or escaped container was demonstrated.

## Preserved evidence

Before editing, **316 files** were archived byte-for-byte in
`qa1-preserved.tar.gz`. `qa1-preservation.json` lists all file sizes/SHA-256 hashes
and the archive digest. `qa1-preservation-check.json` verifies every archived file,
all **65 QA1 files unchanged**, and all **118 original native-case files unchanged**.
The original author gates and QA1 reports remain in place. The old smoke rehearsal
and registration are also retained as `qa1-smoke-offline/` and
`qa1-registration.json`. No prior failure or positive observation was relabeled.

## Repair

- `bindRawClient` requires one final raw envelope at the end of captured stdout,
  exact equality with the parsed client, ordered BROKER frames matching native
  request records, and one raw response per request.
- Each count body must equal the exact projection of its inference request; both
  hashes bind to the corresponding count/inference ledger entries. The new local
  TLS rehearsal retains raw count response bodies as well as inference SSE.
- Raw SSE binds to upstream bytes, response digest/size, parsed unique response ID,
  model and usage. The first native continuation must contain that exact tool
  request and the command's output; the final native message must match the final
  raw response. Cross-session cumulative ledger prefixes, call/count/reservation
  limits and source/config bindings are checked.
- The **runtime import boundary** now verifies finite chronological timestamps,
  immutable identity and fixed workload, exactly one successful closed exact-ID
  removal, a later bounded exact-ID absence observation, state completion, one
  completion event, and a stopped service with no pending jobs. A journal import
  timestamp must follow cleanup and precede the next session. The negative
  preflight control uses the same cleanup/raw-client validation.

The runtime smoke launcher changed, so the prior registration was not reused.
The new frozen registration is
`29b5fce9bce74dac7aa1bcc887ca77db82a62a91096a6b9308bfe161cc871938`.
Three new actual native Docker smoke sessions passed through local TLS,
with six authored count receipts and six authored inference responses. No
real model or provider credential was used. The ten native isolation controls
were not rerun because their executable sources were unchanged.

## Regression and verification

The smoke suite now has **43 tests**, including **29 rehashed negative regressions**.
They cover all four QA1 reproductions and nearby count, raw response, cross-session,
ledger, source, import-order and cleanup contradictions. `remediation-focused.txt`
retains the focused result. The exact original `probe-smoke.mjs` was copied to
`remediation-probes/` and rerun without editing QA1; all four results are now
`accepted: false` against the repaired rehearsal.

The full offline verification is saved separately in `remediation-validation.json`
and `remediation-validation/`. QA2 must independently decide whether this repair
passes. This document does not convert the author pass into a QA pass. Provider
account availability, accepted live model/count behavior and actual billing remain
unverified, and the live authorization example remains disabled.
