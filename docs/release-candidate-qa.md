# Release candidate offline QA

Verdict: **PASS for the bounded integration candidate**, not publication approval.
Reviewed against fetched main `019c9cf`; product source is research `17bd333`.
No live model calls, merge, version bump or publication occurred in this gate.

## Automated verification

All commands exited 0 in the host environment:

- `npm run validate`: repository consistency at 1.9.1.
- `npm test`: 222 helper checks, then 6, 69 and 21 Node tests; no failures.
- `npm run evals`: 64 structural cases.
- `npm run benchmark`: 30/30 frozen parser reports, 100% risk-code precision/recall.
- `npm run evals:codex:validate`: seven offline Codex fixtures.
- `npm pack --dry-run --json`: 35 files, 144,648-byte package estimate; the ledger
  guide and both health scripts are included, research archives are excluded.
- `git diff --check`: no whitespace errors.

Raw command output is retained locally in `_workspace/brooks-harness/`.

## Boundary and functional review

Compared shared score/report rules with the scorer and health/sweep guides:
integer weights, single half-up rounding, no score for unknown dimensions, PR-only
no-diff omission, unique finding IDs and explicit cap limitations agree. The
finalizer rejects duplicate/missing placeholders and conventional extra score
surfaces; delivery checks bind ledger/report receipts and exact supplied bytes.
They do not claim diagnosis truth or proof of subsequent UI/transport delivery.
The CLI does not overwrite existing final artifacts. Product tests cover altered
receipts, stale ledgers, terminal-newline loss, Unicode/escaping, unknown dimensions,
invalid arguments and standalone shell/npm installation of the bundled tools.

Reviewed sweep's authorization and stop flow against the shared config and runner
contract: all repair rounds are bounded; pre-existing edits are preserved;
missing evidence for the requested work is distinct from unrelated dashboard
limits. Scoring uses the final snapshot and does not invent before/after totals.
Review/audit/test retain governing obligations, supported causal witnesses and
explicit uncertainty. Their reported benchmark evidence does not claim general
superiority. Sweep's calibration fixtures are explicitly not a semantic evaluator.
No additional concrete functional blocker was found in this review.

Compared every extracted delivery answer and retained tool call with its original
record in the named research archives: all eight match exactly. AS-21's extracted
answer matches `raw-run.tar.gz/run/011/record.json` in the original skill-revision
run; its complete input matches AS-21 in `skill-revision/frozen-full.json`.
The snapshot preserves provenance while removing runtime archive dependencies.
Original archives remain unchanged on the research branch.

Cross-document checks agree: package and four plugin manifests, all six README
badges, landing-page JSON-LD and CHANGELOG top version are 1.9.1. Source inventory
has twelve books, matching README/AGENTS/GEMINI; eval count is 64, matching AGENTS.
All six descriptions retain negative trigger boundaries and descriptions were not
changed, so a new semantic trigger audit is not required for this candidate.

## Remaining external gates

This report is local validation. The PR's exact head still needs all Validate
matrix jobs to succeed. The candidate deliberately remains at the current release
version; publication requires an actual unreleased-range audit, selected version,
changelog/manifests/translations/metadata synchronization, exact-release-commit CI
and `npm run release:ci`. No new model campaign is required by this offline gate.
