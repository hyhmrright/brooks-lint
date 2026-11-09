# QA round 2 — PASS

The single repair loop resolved QA1's demonstrated semantic timing inconsistency.
All 22 final offline commands passed. The gate started with `npm run validate`,
`npm test`, and `npm run evals` in that order, then checked prepared runtime
fixtures, every applicable saved executor/channel/stream/boundary/completion/
controlled-read/Docker/lease archive, Codex structural fixtures, parser benchmark,
native-seam evidence, launchd template syntax and whitespace. Commands, exact
stdout/stderr bytes and hashes are in `commands.json` and numbered `.bin` files.

`npm test` passed 222 helper checks, six provider tests and 673 main tests. The
main suite includes 54 lease regression/evidence controls; structural evals remain
64. No live provider/model tests and no Docker mutations ran during either QA
round. The recorded eight-case real-Docker run is unchanged.

## Boundary comparisons

- All 317 original author artifacts are preserved through the explicit preservation
  map, including the original README at `qa1-readme.md`. All 16 files in QA1 remain
  byte-identical. The original `accepted: true` bypass output is not overwritten.
- The exact QA1 repro now reports rejection in `original-bypass-result.json`.
  Five additional independently authored rehashed contradictions are rejected:
  timed-out removal counted as success, a pending final state, a divergent facts
  identity, an unclosed final absence command, and a command finishing after its
  event. See `focused-probes.mjs` and its result JSON.
- Four remediation source copies match current modules. Runtime manager and
  supervisor also match the original pre-QA source bytes. The pinned shared Docker
  isolation dependency matches its source manifest. Only the evidence checker and
  its regressions changed for the fix.
- Completion facts, final state, completion event and actual Docker absence now
  agree on chronology. The new mutation tests cover early/late/divergent/string
  timestamps, reordered cleanup, duplicated completion and negative intervals.
- Version 1.9.1 matches all four manifests, six README badges, website JSON-LD and
  CHANGELOG. The source inventory derives 12 books, matching README/AGENTS/GEMINI.
  AGENTS' 64-scenario claim matches the actual eval array. All six skill descriptions
  retain their negative trigger boundary. `cross-doc.json` records the comparison.
- Native CLI 0.167.0 discovery evidence passes its offline checker: experimental
  local App Server/exec-server handshake works; wrong-token authentication fails.
  Documentation explicitly says both processes share one container/domain and no
  arbitrary tool or real model was executed, so this is not segregation proof.

## Scope of this PASS

The runtime is a runnable offline research manager and restart supervisor with
real-Docker fixture evidence. It is not wired into the frozen 81-response native
study. OS-supervised unattended deployment, host reboot/power-loss behavior,
actual Docker daemon restart, and full native client/tool security-domain
separation remain unverified. The daemon outage control is injected, as labelled.
The launchd template was linted, not installed. The CLI seam investigation is
complete at the interface-discovery level, not a completed separate-domain runner.

Hashes and semantic checks establish internal consistency; all records and review
remain self-led/agent-authored, not independent human validation or cryptographic
attestation. This PASS permits the requested research commit and push, not a
release or real-model run. Before any real model test, the user must first receive
its concrete model, call count and budget.
