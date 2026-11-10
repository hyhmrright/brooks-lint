# QA round 1 — FAIL

Date: 2026-11-10. Scope: targeted runtime pack benchmark and methods research.
No live model calls. No production files edited by QA.

## Automated gate

All commands completed with exit 0, in required gate order:

- `npm run validate` — `qa-validate.log`
- `npm test` — `qa-test.log` (includes new 16/16 pack tests)
- `npm run evals` — `qa-evals.log` (64 scenarios)
- `npm run benchmark` — `qa-benchmark.log`
- `npm run evals:codex:validate` — `qa-codex-offline.log`
- `git diff --check` — clean.
- Both committed full/smoke freezes validate against current source.

## Blocking finding — route to eval-curator

**P1: Report scores response summaries without authenticating their raw records.**

`evals/research/runtime/pack-benchmark/report.mjs:49` loads registration,
responses and mapping, then line 51 calls `summarize`; neither that path nor
`summarize` reads the archived `row.evidence.path`, checks its stored SHA-256, or
compares the answer/model/usage/status with the actual executor record.

Symptom: changing the first archived response answer and recomputing its
`answerSha256`, with matching annotation excerpts/hash, is accepted while the
raw executor record and its existing `row.evidence.sha256` remain unchanged.
Source: `summarize` line 18 checks only answer versus the summary's own hash;
`normalizeAnnotations` checks mapping identity, not execution evidence.
Consequence: accidental or deliberate drift between summaries and saved raw
answers can produce apparently valid model metrics. Self-consistent annotation
hashes do not bind results to an executed answer.
Remedy: add a read-only run-artifact verifier before CLI summarization. Enforce
expected per-ordinal safe evidence paths, raw file hash, simulation/registration
and model/effort identity, answer equality/hash, status and usage/duration fields.
Verify records for attempted failures too; leave genuinely not-run rows explicit.
Add corruption regressions (edited answer plus rehash; altered raw record; absent
raw file; changed model/usage/status) and regenerate freezes/offline artifacts
because reporter source is frozen.

Reproduction performed on an extracted temporary copy of the committed fake
archive; no repository evidence altered. Output:

`{"forgedAnswerAccepted":true,"rawEvidenceUnchanged":true,"reviewed":3}`

## Substantive checks that passed

- Read all 12 source fixtures, contracts and rubrics. Runtime families change only
  contract text; outcome witnesses agree: shared abort cancels B, distinct e1/e2
  total 25 with duplicate e2 suppressed, cache old before flush/new after.
- Unresolved inputs omit decisive policy without enumerating both gold branches.
- Runtime nine-case denominator is separate from two core and one syntax controls.
  PB-10's compound issue and limitation are explicitly documented.
- Per-item semantic support requires exact nonempty excerpts and rationale;
  reviewer identity/exposure recorded; unsupported/novel confirmed claims need
  adjudication; pending claims prevent full-answer success.
- No-op policies explicitly labeled handwritten arithmetic checks, not proof of
  model judge quality. Assertions do not pretend to validate semantic truth.
- Frozen full108 versus alternative smoke9, explicit registration/live gate,
  fail-stop and no-retry behavior match docs. Text guidance and context-length
  limitations are disclosed; historical freezes and skill content unchanged.
- Raw archive smoke hash matches committed smoke freeze, no unsafe paths, no
  auth.json or real-looking Bearer/API/JWT markers in decoded text. Archive has
  macOS AppleDouble metadata entries; remove those on regeneration if practical.
- Research distinguishes public methods from independently reproduced evidence;
  notes private Trail of Bits harness and mutable upstream source URLs.

## Cross-document consistency

Package, four plugin surfaces, six README badges, docs JSON-LD and top CHANGELOG
all describe version 1.9.1. `source-coverage.md` contains 12 frontmatter books;
README/AGENTS/GEMINI describe twelve. Actual eval count is 64 and matches AGENTS.
All six skill descriptions include their negative-trigger clause. No description,
public risk ID, release version or core skill was changed.

## Disposition

FAIL despite green automated gates: raw-record/summary boundary integrity must be
fixed before claiming scoring readiness. Preserve this round, then rerun the full
mandatory gate and targeted provenance regressions after the curator fix.
