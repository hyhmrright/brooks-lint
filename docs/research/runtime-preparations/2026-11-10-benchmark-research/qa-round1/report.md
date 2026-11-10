# QA round 1 — FAIL

Date: 2026-11-10. Route correction to **eval-curator**. No live models run.

## Automated and cross-document gates

All five commands passed: `npm run validate`, `npm test`, `npm run evals`,
`npm run evals:runtime:prepared`, and `npm run benchmark`. `commands.json` records
exit codes and durations; adjacent text files retain raw stdout/stderr.
`git diff --check` passed. Cross-document checks passed: package, four manifests,
six README badges, landing-page JSON-LD and CHANGELOG are 1.9.1; derived source
inventory has 12 books matching README/AGENTS/GEMINI; AGENTS claims 64 evals and
actual count is 64; all six shipped skill descriptions contain negative boundaries.
No tracked change affects the previous HB suite or historical 81-answer archive.

## Blocking semantic finding

**P2 — Global user uniqueness does not establish tenant binding.**
`evals/research/runtime/benchmark-v2/cases/BV-09/rubric.json:12` says globally
unique IDs make equal-ID/different-tenant requests outside the contract.
`cases/BV-09/context.md:1` only contrasts globally unique users with tenant-local
IDs, while `drivers/tenant-cache.mjs:53` silently strengthens the permissive
contract to exclude the cross-tenant history.

Symptom → the permissive oracle claims safety from identity uniqueness.
Source → a globally unique user can legitimately access multiple tenants, each
with a different authorization decision; the implementation's cache key ignores
tenant. Consequence → a correct model explaining that global uniqueness alone
is insufficient could be penalized or coached into an unsafe generalization.
Remedy → make the missing guarantee explicitly an immutable one-tenant-per-ID
request binding (enforced before cache access), distinct from ID uniqueness.
Use that stronger guarantee in visible context, rubric and alternate execution;
add a regression for one global user with differing grants in two tenants.

`tenant-contract-reproducer.json` records the actual supplied implementation:
user 42 is granted red and denied blue by the registry; after red caches true,
blue returns true. No duplicate allocation of user ID is required.

## Other inspected boundaries

- Protected outbox and checkpoint code retains progress and guards replay/epoch
  effects; the composed driver histories and independent partial fixes execute.
- All unresolved completions execute, but successful predicate tests do not
  establish the semantic sufficiency of their contract descriptions (finding above).
- Export requires structure plus freeze and omits evaluator envelopes. Combined
  adapter returns only canonical files and refuses external candidate IDs.
- Scoring separates issue recall, pending/novel findings, precision bounds and
  causal duplicates. It is explicitly an annotation aggregator, not a prose judge.
- External 50 PR/173 label snapshot is quarantined with license/provenance and five
  upstream warnings; no unsupported real-repository execution claim is made.
- Research report distinguishes historical HC ceiling from unmeasured HB/BV
  difficulty and scopes its T5 diagnostic score; no 100x/perfect capability claim.

This is same-workflow agent QA, not independent human ground-truth validation.
Freeze digests inspected in this round are in `inspected-digests.json`.
Full gate must be rerun after correction and refreeze; retain this failure record.
