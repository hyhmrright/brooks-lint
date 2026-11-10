# QA round 2 — PASS

Date: 2026-11-10. No real model calls, production edits, commits or pushes by QA.
The first-round FAIL remains recorded in qa-round1.md and the original qa-*.log.

## Full verification gate

All commands completed with exit 0, in required order for validate/test/evals:

- `npm run validate` — qa-round2-validate.log
- `npm test` — qa-round2-test.log, including 17/17 targeted pack tests
- `npm run evals` — qa-round2-evals.log, 64 structural scenarios
- `npm run benchmark` — qa-round2-benchmark.log, frozen parser fidelity 100%
- `npm run evals:codex:validate` — qa-round2-codex-offline.log, seven offline cases
- `git diff --check` — clean

## Original blocking finding closed

Read the new verifyRunArtifacts path and independently exercised the public
report CLI against a temporary extraction of the committed fake archive:

1. The legitimate archive passes raw verification and CLI report generation.
2. Edit the first answer in responses.json, recompute answerSha256, and update
   the annotation's answer hash/excerpt, leaving raw record untouched.
3. CLI now exits nonzero with Raw answer mismatch and creates no forged report.

Evidence: qa-round2-provenance.log. This reproduces the original failure trigger
and verifies the corrected public boundary, not only a helper function.

The new corruption regression also checks raw byte drift, raw model drift even
with a rehashed raw reference, summary model/effort/usage/duration/status/simulation,
missing files, wrong ordinal, traversal and symlinks. Failure-stop coverage now
validates a failed attempted record plus untouched not-run rows. Complete records
are checked against registered prompt/model/effort/CLI, source hash, expected auth
route and confirmed cleanup. The report only sets rawEvidenceVerified after the
verifier. Hashes do not prove authenticity against rewriting every artifact;
that limitation is correctly stated. The pure summarize helper is explicitly
arithmetic-only and the CLI is the verified publication route.

## Frozen artifacts and archive

Both saved freezes validate against final sources:

- Full108: 16fdce3cd1696da966115924f285a87547064af20a1b935cccb23c2ca771ad29
- Smoke9: 7758a822670bc640d73ee93ac63eab15c25aa2a606993780d781159762cf26a0

Archive inspection: all members text or directories, no unsafe paths, AppleDouble
metadata, auth.json, or real-looking Bearer/API/JWT markers. Nine fake CLI turns
remain labeled simulation; no live model quality or actual Codex execution is
claimed by the synthetic record. See qa-round2-archive.log.

## Cross-document and substantive checks

Rechecked version surfaces (four plugin manifests, six README badges, JSON-LD,
CHANGELOG) against package version 1.9.1. Source inventory has twelve books and
README/AGENTS/GEMINI agree. Actual64 evals match AGENTS. All six negative-trigger
clauses remain. Evidence: qa-round2-cross-docs.log.

Round1 corpus/rubric checks still apply: nine runtime contract-sensitive cases
and three separate guardrails; exact source/tasks within each triad; unknown
contracts omit the answer branches; executable witnesses match expected behavior.
Per-item support, pending/novel claim handling and separated denominators remain.
No-op controls are handwritten arithmetic checks, not semantic judge calibration.
Methods survey and scope correctly preserve Discussion45's incremental runtime
pack question rather than asserting higher model difficulty or general benefit.
Historical studies and production skill contents remain unchanged.

## Readiness and limits

PASS for offline benchmark preparation and an explicitly authorized subsequent
text-guidance study. Full108 and smoke9 are alternative scopes, not an automatic
117-call run. Neither frozen plan binds a real model or authorizes calls. Actual
login/model access must be checked after the maintainer selects model/effort.
No measured uplift, native selective activation, independent holdout validity,
production generalization or perfect benchmark claim is supported.
