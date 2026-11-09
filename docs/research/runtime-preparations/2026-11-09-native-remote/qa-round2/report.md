# QA2 — PASS

The single author repair resolves both QA1 findings. No remaining actionable
inconsistency was established within this QA scope. This permits the parent to
commit/push the offline work; it does not authorize a real model run or release.

## Complete verification

All **26** final offline commands passed independently in order, including
`npm run validate`, `npm test`, `npm run evals`, parser benchmark, all saved
execution evidence gates, the native ten-case archive, the new three-session
smoke archive, local TLS evidence and the original frozen study inventory.
`gates.json` records exact argv, timestamps, exit codes and stdout/stderr hashes.
The main suite passed **822/822**, with **zero skips**; the helper gate passed 222
checks and the provider suite passed six tests. The smoke suite now includes 43
checks, including 29 new rehashed archive regressions.

Cross-document comparison passed again: package version **1.9.1**, four manifests,
all six README badges, docs JSON-LD and top CHANGELOG section agree. The source
frontmatter derives **12 books**, matching README/AGENTS/GEMINI; AGENTS agrees with
**64** actual structural eval scenarios. All six shipped skill descriptions retain
their negative trigger boundary. See `cross-doc.json`.

## Evidence boundary review

The repaired checker binds:

- exact raw FINAL/ordered BROKER frames to parsed native requests/responses;
- each count projection and count receipt to the corresponding inference body,
  request hash, model and input count;
- raw client SSE to upstream bytes, response hashes/sizes, parsed unique IDs,
  reported model/usage and native tool continuation/final message;
- cumulative ledger prefixes and exact reservation arithmetic across sessions;
- immutable worker/client identities, bounded closed removal and post-removal
  exact-ID absence, state completion, unique completion events, stopped service,
  then import and the next session.

`ensureCleanup` applies the raw/cleanup contract at actual runtime import, not
only in a reporting script. The paid path still requires separate explicit
registration authorization and the dedicated credential; no paid path was invoked.
The trusted HTTPS transport is byte-identical to QA1. Its prior authorization,
streamed-tool, model/count, cancellation, deadline and budget controls remain
covered by the full test run.

## Reproductions and additional adversarial checks

The exact original QA1 probe was copied without changing its mutations. All four
previously accepted contradictions are now rejected: wrong counting input/model,
missing raw responses, missing raw child stdout, and completion before launch.
The unchanged QA1 results still say `accepted: true`; QA2 results say false.

Eight further probes update hashes and, where applicable, the raw FINAL envelope
and ledger references before validation. All are rejected:

1. Wrong count input with its count hash rebound.
2. Wrong raw SSE model with byte/hash evidence rebound.
3. Native final message disagreeing with the provider completion.
4. Zero reservations consistently substituted into all ledger snapshots.
5. Import recorded before cleanup.
6. A successful-looking removal whose command never closed.
7. Duplicate completion event.
8. Changed native execution source digest.

See `smoke-mutations.json`, `adjacent-results.json` and the exact probe scripts.
`mutation-archives.tar.gz` retains all twelve tested contradictory archives.
These are authored tampering controls, not claims of observed production attacks.

## Preservation and registration

Independent archive verification confirmed **316 original files** byte-for-byte,
**65 QA1 files unchanged**, and **118 original native-case files unchanged**.
The old smoke evidence/registration and failed history remain preserved; no QA1
observation was silently relabeled. See `preservation.json`.

The final smoke registration digest is:

`29b5fce9bce74dac7aa1bcc887ca77db82a62a91096a6b9308bfe161cc871938`

It binds the revised smoke sources and schema. The fresh local-TLS rehearsal
contains three actual native Docker sessions, six authored count receipts and six
authored inference responses. The original 81 behavioral-study records remain
not-run. No test model was switched or real provider response obtained by this QA.

## Limits retained

This is self-led agent QA, not independent human validation or a general security
certification. Provider entitlement/authentication, accepted live model/count
semantics, actual billing and count-endpoint charges remain unverified. The
observed pinned CLI's absent remote-home constraint, other CLI versions/platforms,
host reboot/power-loss/daemon restart, and Docker/kernel escape resistance are not
promoted to passed gates. The $0.10 figure remains a local inference reservation,
not a verified all-in invoice ceiling. No inference about runtime-skill efficacy
is made from these protocol tests.
