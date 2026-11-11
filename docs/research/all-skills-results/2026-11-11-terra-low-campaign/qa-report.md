# Semantic campaign QA — PASS

Scope: completed semantic assessment artifacts in
`docs/research/all-skills-results/2026-11-11-terra-low-campaign/`.
This is the consistency-QA stage after the eval-curator stage. No live model
calls, commits, pushes, releases or product-skill edits were performed.

## Automated gate

All commands completed with exit 0, in this order. Raw output is preserved beside
this report; `commands.json` records command arguments, exit codes and elapsed time.

1. `npm run validate` — repository consistency PASS.
2. `npm test` — complete repository offline test command PASS, including recovery,
   hard/v2/runtime-pack/all-skills/campaign tests. Elapsed 129.667 seconds.
3. `npm run evals` — 64 structural scenarios PASS.
4. `npm run benchmark` — frozen parser corpus: severity counts30/30, risk-code
   precision/recall100%, SARIF validity30/30.
5. `npm run evals:codex:validate` — 7 native-Codex fixture schemas valid offline.
6. `git diff --check` — PASS.

## Cross-document checks

`cross-docs.log` records direct comparisons, not merely validator status:

- Package version1.9.1 equals all four manifests, all six README badges,
  landing-page JSON-LD softwareVersion and top CHANGELOG entry.
- Derived source-coverage frontmatter inventory contains12 books, matching the
  README/AGENTS/GEMINI twelve-book statements.
- Actual eval inventory has64 entries, matching AGENTS.
- All six product skill descriptions include negative trigger boundaries.
- No skill descriptions or source inventories changed in this task; trigger-audit
  and release stages are not applicable.

## Archive reproduction and answer provenance

Executed the new `reproduce.mjs` against the parent's independent extraction of
the two tracked raw archives, into a fresh QA output directory. Existing raw
verifiers reconstructed the recovery chain, checked model/effort/prompt/receipt
and answer hashes, accepted all318 annotation inventories and exact quotes, and
asserted that the original published review remains unchanged.

All six generated outputs are byte-identical to the saved candidate artifacts:
`all-skills-summary.json`, `runtime-summary.json`, `scored-responses.json`,
`comparison.json`, `equivalence-sensitivity.json`, `response-ledger.md`.
`reproduction-check.json` records their SHA-256 digests. Raw output appears in
`reproduce.log`.

## Report and adjudication consistency

`report-consistency.log` records113 explicit cross-artifact assertions:

- Every product-skill headline metric row matches comparison.json exactly,
  including denominators, pending counts, paired outcomes and observed tokens.
- All product protected/unresolved/out-of-scope controls have zero recorded errors
  with denominators3 per arm.
-318 unique scored answers; zero missing expected issues;6 confirmed unsupported
  arithmetic/headline claims;15 pending extra claims in9 responses.
- Known observed tokens sum to5,290,711; report explicitly excludes unknown failed
  attempt usage and does not claim billing precision or backend attestation.
- Original annotation retained; seven initial/final adjudication revisions keep
  the same answer hashes, and final disposition/penalty removals match annotations.
- Post-hoc sensitivity is explicitly labeled, does not change frozen primary
  judgments, and review complete support becomes8/15 in both arms.
- Runtime evidence73/81,76/81,81/81; C−B matched complete support5 improvements,
  22 ties,0 regressions. The report attributes gains to explanation completeness,
  not defect recall, and keeps runtime/product/maintenance denominators separate.
- All318 response identifiers appear in the readable per-answer ledger.

`evidence-coverage.log` additionally confirms every rubric evidence index in all
318 responses is either credited or individually explained as missing, with no
omitted or duplicate requirement indexes. The historical diagnostic notes carry
an explicit superseded-results notice, preserving disagreement without confusing
those preliminary totals with the final report.

## Findings and limits

No blocking consistency findings. PASS applies to the checked artifact state and
explicit offline checks, not independent validation of semantic judgment. Review
is rubric-exposed, same-workflow model assessment; raw hashes establish internal
consistency rather than tamper resistance or provider attestation. Public
same-workflow development cases, small case counts and correlated repetitions
limit generalization, as the report states.

The parent owns finalizing `validation-record.md` and archiving this QA record,
then committing and pushing task-owned changes. No release is requested.
