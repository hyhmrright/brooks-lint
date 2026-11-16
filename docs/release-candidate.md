# Bounded product release candidate

Base: `019c9cf` (fetched main). Source: research commit `17bd333`.
Branch: `release-candidate`; the requested default `codex/` prefix could not be
used because an existing branch named `codex` occupies that ref namespace.

## Included product changes and dependencies

- Shared reporting contract: evidence scope, supported versus unknown claims,
  and no invented score deductions. All focused modes consume `common.md`.
- Review, architecture audit and test: concise causal diagnosis, governing
  contract and discriminating witnesses, honest verification limits. Audit
  Process references follow its revised guide. Debt retains deduction caps.
- Health: one ledger, deterministic score generation, unknown-dimension handling,
  finalization and receipt checks. `score-ledger.md` and both bundled Node tools
  ship with the guide; the delivery tool imports the score tool. Node execution
  is conditional on the host providing it; manual/predicted output is not
  represented as tool verification.
- Sweep: existing edit authorization, bounded repair rounds including Critical
  findings, explicit stop reasons, scoped obligations and final health delivery.
  Sweep reads all four focused guides and the health guide, so these changes are
  carried together. `.brooks-lint.example.yaml` documents the changed iteration
  semantics; `docs/runner-contracts.md` documents final score compatibility.
- Product regression coverage: deterministic health arithmetic, final artifacts,
  receipts, exact delivery, standalone npm/shell installation, parser contract,
  and stop-boundary calibration fixtures. The Codex fixture startup timeout
  increase is retained to avoid slow-host false failures; it is not a live run.

No new risk code or skill is introduced. No trigger description changes are
included. The six existing modes and twelve-book source inventory remain.

## Research preservation and test independence

All raw campaigns, failed runs, frozen plans, annotations, adjudication and
research-only executors remain on the
[research branch at 17bd333](https://github.com/hyhmrright/brooks-lint/tree/17bd333).
They are not deleted or rewritten. This candidate carries the product snapshot
and compact historical regression extracts under `scripts/fixtures/health-regressions`,
with archive provenance, rather than importing thousands of research artifacts.
Its `npm test` runs main's product tests plus the relevant new regressions; it
does not depend on the research branch, model accounts, or old campaign archives.
Sweep fixtures test their own witnesses and inventory, not semantic model behavior.

The last focused comparison after offline adjudication found review B/C 6/6,
audit B/C 6/6, test B 5/6 and C 6/6. There was one paired test advantage in reused
development-authored cases, not independent proof of general superiority.
Retain the focused workflows without promising diagnostic gains on every model.
No new model campaign is required for this bounded integration.

## Merge and publication gates

Prepare a PR to main, review the complete product diff, and run validation,
unit tests, structural evals, parser benchmark and Codex offline fixture checks.
Require every Validate matrix job to succeed for the candidate's exact head.
A green PR is evidence for merging this candidate, not permission to publish.

Version remains 1.9.1 during candidate review. Before publication, audit the
actual unreleased commit range, choose the version from its scope, synchronize
manifests/README translations/examples, write the changelog and verify GitHub
metadata. Push that exact release commit, wait for all Validate jobs and run
`npm run release:ci`. A release request is still required for tags/publication.
No merge, version bump, tag, publication or model run is part of preparation.

## Release preparation update

PR #46 was merged as `231512e`. Release 1.10.0 is prepared from the full
unreleased backlog, with the eight non-exempt commits accounted for in
`release-1.10.0-audit.md`. The candidate-stage 1.9.1 hold above is historical;
the maintainer subsequently authorized release after exact-commit CI and
`release:ci`. Research records remain preserved at `17bd333`.

## Current status — 2.0.0 preparation

The candidate and documentation PRs #46/#47 are merged. The 1.10.0 GitHub tag
and release were withdrawn; npm 1.10.0 was not published. The maintainer selected
2.0.0 and authorized integrating the audit/migration/evidence notes and preparing
all version surfaces. npm identity still returns E401, so no GitHub-only release,
tag or npm publication is permitted. See [current readiness](next-release-readiness.md)
and [migration notes](migration-v2.md). Earlier authorizations above are historical.
