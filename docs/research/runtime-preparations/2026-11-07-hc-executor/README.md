# HC executor offline preparation

This is an **offline preparation and contract replay**, not an operational model
executor. No Codex/model process is spawned, no provider request is made, and no
human feedback or model observation is fabricated. The public frozen revision-1
81-turn design is unchanged. It still has an unbound model/reasoning sentinel;
any later execution must bind identity in a separate reviewed registration without
mutating that plan.

## Verified offline

- `assembleTurn` derives all 81 packets from the externally anchored frozen
  allowlist. Exact bytes, common user message, readable input paths, arm-specific
  guidance and their hashes are recorded in `workspace-manifests.json`.
  Inputs/guidance are files; the model is instructed to read them. Availability
  does not establish actual reads. Evaluator rubrics and schedule are excluded.
- `exportWorkspace` writes exact packets into newly created scratch directories,
  refuses existing destinations, changed packets, traversal, symlink ancestry,
  repository descendants and ancestor `AGENTS.md`. Tests physically export all
  81 packets to temporary directories and compare each byte. No model is run.
- The declaration checker rejects the present null registration, sentinels,
  pending human disposition, absent authorization and anchor mismatch. It checks
  formats and declarations only; strings cannot prove an approval or isolation.
- `event-contract.json` proposes a normalized event schema. These are **not
  claimed Codex CLI event names**. Synthetic replay requires an explicit marker
  and source prefix. The full replay has 81 synthetic successful observations,
  all semantic annotations pending, zero eligible triplets. It roundtrips the
  existing frozen adapter and creates 81 partial-masked review packets.
- The boundary replay preserves successful-empty, process-failed partial,
  900-second deadline/interrupted partial (including explicit timer-boundary
  validation; late events cannot silently bypass it), and observed-model mismatch. Missing
  observed identity is explicitly `UNOBSERVED`, never copied from intent. A
  mismatch/missing identity blocks subsequent attempts. No primary turn is
  retried; unstarted turns remain `not-run`. Raw envelopes and hashes survive.

The archived simulated text is only a pipeline marker. Its completion status is a
mock event outcome, not evidence of semantic answer completeness or accuracy.
The full and boundary replays are separate scripted scenarios, not retries or
supplementary real executions. There are no model correctness rates to report.

## Before live execution

The code intentionally has **no spawn, provider transport, live CLI or run command**.
A future reviewed adapter must implement real raw-event mapping, process-tree
interruption at 900 seconds, disabled hidden provider retries, fresh processes,
separate session/home/config state, enforceable network/tool restrictions and
parent/installed-skill/memory isolation. Scratch export tests do not establish
these properties for a real model environment. Register the reviewed executor
commit/digest, model/provider/reasoning and CLI version; preserve independently
observable intended-versus-observed identity evidence. Any infeasible frozen
boundary or changed design parameter requires a new reviewed version and anchor.

Human feedback is still pending; resolve semantic disputes and record every
feedback disposition first (or justify a later proposal to proceed). The present
user instruction authorizes offline preparation only. A later explicit live
execution authorization, reviewed isolation/raw-event adapter and complete
immutable registration remain required. The nine public same-workflow cases
remain exposed, non-independent and not privately held. Book mapping is unverified.

## Reproduction

Run `npm run evals:runtime:executor:validate` to byte-compare all nine generated
archive files with a deterministic rebuild. Run `node --test
 evals/research/runtime/prospective/executor-preparation.test.mjs` for ten
contract tests, also included in `npm test` and `npm run evals:runtime:prepared`.
The generator snapshots its module, tests and generator sources. Its source
hashes use the existing adapter's JSON-string digest convention as explicitly
recorded in `source.json`; per-workspace file hashes use raw UTF-8 bytes.
`validation.json` records actual author checks; QA is separate. No prior frozen
archive or historical result is rewritten.
