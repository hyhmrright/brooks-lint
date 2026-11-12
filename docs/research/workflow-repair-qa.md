# Workflow and benchmark QA — 2026-11-12

Status: PASS for the completed offline maintenance scope. All concrete QA
findings below were fixed and the final stable snapshot passed the full gate.
No real-model execution, release, native editing or efficacy conclusion is authorized
by this QA verdict. Earlier interim entries are retained as the audit trail.

## Initial review

- `npm run validate`: PASS (`workflow-benchmark-validate.log`).
- Full `npm test`: running with offline local-process permissions; no live model calls.
- Cross-document comparison: package/manifests/marketplace/six README badges/docs
  JSON-LD/CHANGELOG all version 1.9.1. Source frontmatter derives 12 books; README,
  AGENTS and GEMINI state twelve. Actual eval count and AGENTS claim are both 64.
  All six skill description blocks include the negative trigger clause.
- Current prepared benchmark reconstructs exactly to
  `7cfd4c8f41da20434f1a106b162f8baa08cea549bf97ee871b439fe0bf18a5de`, 108 turns,
  36 cases, three arms, one repeat. Cohorts and seven related families are explicit.
- Probe source hashes and all three archive/checksum entries pass.
- Actual-CLI archived controls: 0.167.1 and 0.167.2 both retain disabled-host
  negative controls (0 scorer calls), enabled-host positive controls (1 call), and
  host-rendered positive controls (0 model tool calls). All are simulation=true
  and synthetic-no-auth. These do not establish live model willingness.
- Historical health-tool-retest adapter and result directories are unchanged.
- Benchmark explicitly limits trusted author-code execution; its origin assertion
  is not represented as sandboxing. No independent holdout/native editing claim.

## Finding and loop-back

1. `docs/runner-contracts.md:55` still specified `After: N/100` as current sweep
   interchange, conflicting with `skills/_shared/common.md` and sweep Step 8's
   canonical `Composite Score`. Routed to parent/skill-author. Parent fixed it;
   re-read confirms current Composite Score plus historical After compatibility.

## Pending collector checks

Registration must bind current execution/scoring sources and sealed prompts,
include the health ledger schema identically across arms, reject simulation as a
live preflight, preserve each raw turn/failure, enforce budget/stop rules, and never
execute model-created patches on the host. Re-run the full gate after the parent
signals the collector and documentation are stable.

## Initial gate completion and collector pre-review

- Initial full `npm test`: PASS.
- Initial `npm run evals`: PASS, 64/64.
- Initial `npm run benchmark`: PASS, frozen parser fidelity 100%.
- Collector finding: `assessRun` originally delegated to `summarize`, which loaded
  current case rubrics from disk rather than registration-sealed rubrics. A later
  rubric edit could therefore change scoring without changing the collector or
  manifest source hashes. Routed to parent/eval-curator. Current code passes
  sealed cases into `summarize`; score and skill/cohort grouping use that case map.
  Final regression/gate execution is pending the stable-code notification.

## Second automated gate and semantic loop-back

The complete post-collector automated gate passed validate, npm test and evals.
The unchanged parser benchmark remains PASS. The 108-answer offline archive was
independently extracted, verified and re-scored; generated report bytes equal the
archived report. Current preparation freeze reconstructed to
`085aa9151b703b9ad01e020b63a194858ef7a9b017e2676d7705316a4acf32b9`.

A new concrete protected-case defect blocks final PASS:

- `evals/research/skills-benchmark-v2/cases/BV2-29/existing.test.mjs:1` does not test
  opaque identifiers containing delimiters, despite `contract.md:1` declaring that
  contract and the test inventory complete. Replacing key generation with
  `tenant + ':' + id` passes the supplied test but fails repositoryRepairCheck's
  `(A:x, y)` versus `(A, x:y)` obligation. A correct model T5 finding would therefore
  be penalized by the protected label. Route to eval-curator: add this boundary to
  protected tests (including shared protected siblings), add a killed-mutant
  regression, and refresh the preparation/archive without altering old research.

Parent's one-line wire-drill default was also checked against its new retained
run: no model argument selects gpt-6.1-terra with CLI 0.167.1; disabled, enabled and
host-rendered controls all matched expected simulation outcomes. Old archives
retain the prior wire source, as appropriate for their explicit-model runs.

## Protected-case repair and third automated gate

- All six protected repository siblings now test delimiter collisions, both route
  orders, returned identity, cache reuse and unauthorized-request isolation.
- Independent BV2-29 check: baseline PASS; ambiguous delimiter mutant FAIL.
- Third full gate: validate, npm test and evals all PASS.
- Updated preparation freeze reconstructed exactly:
  `cedb1f3204799848638dd6d714899c4117597480bdfc541be73de5d566266f34`.
- Revision-2 archive checksum and all 385 source snapshot hashes PASS. Running
  archived sources from a canonical path verifies 108/108 simulation records;
  re-generated report bytes equal the archive.

## CLI alias-path finding

`campaign.mjs` compared raw `process.argv[1]` with canonical `import.meta.url`.
When the archive is extracted under macOS `/var` or `/tmp` aliases, CLI verify and
review silently exit zero without running; no report is created. Canonical
`/private/var` paths do execute and reproduce the report. Routed to parent/eval:
canonicalize CLI entry detection, test symlink verification/report generation, and
retain old archives while producing a corrected-source revision. Final verdict
remains pending this last fix and its verification.


## Final verdict — PASS

Final stable-source gate:

- `npm run validate`: PASS (`workflow-benchmark-r4-validate.log`).
- Complete `npm test`: PASS (`workflow-benchmark-r4-test.log`), including benchmark
  suite 13/13, campaign 9/9, health workflow 15/15 and all prior repository tests.
- `npm run evals`: PASS, 64/64 (`workflow-benchmark-r4-evals.log`).
- Parser benchmark: PASS, 100% frozen-corpus fidelity; reused the unchanged parser
  gate (`workflow-benchmark-parser.log`).
- `git diff --check`: PASS.

The final CLI correction canonicalizes campaign/suite/probe entrypoints. Its
regressions require actual files/verify JSON, not merely a zero exit. Independent
revision-3 archive verification used the macOS `/var` alias and an additional
symlink: verify printed 108 completed simulation records, review wrote a fresh
report, and that report was byte-identical to the archived report. Archive checksum
and all 385 retained source/fixture hashes passed. Earlier archive bytes are
unchanged and their README notices state supersession/reproduction limitations.

Final case preparation anchor:
`933cf78cc7abe9c90457d756eabdc1d3dd790693758080e210f9fa8182bae6b4`.
Reconstructed freeze equals the saved preparation. It has 36 cases (18 regression,
18 correlated challenges), six skills, three arms, one repeat and 108 planned
answers. No independent holdouts are claimed.

Final prospective one-turn probe anchor:
`cef90975154e987c028ae3aa2c6c197fdee8a7f169881091a9fd206b80a5cf2f`.
All probe source hashes and archive/plan checksums pass. Old unexecuted preparation
drafts remain preserved. No actual model probe or campaign ran during this task.

All four substantive QA issues are resolved: stale sweep score interchange prose;
current-disk rubric drift; delimiter coverage missing from a protected test case;
and CLI alias paths silently skipping verification. No unresolved blocking finding
remains in the reviewed offline scope. Historical real answers and judgments were
not rewritten. Versions, source count, eval count and negative skill boundaries
remain consistent as recorded above.

This PASS is not proof of model improvement, provider-side model identity, native
skill discovery, autonomous filesystem repairs, independent semantic adjudication,
or safe execution of arbitrary model patches. The campaign collects model code
without executing it. Live probe and any later budget-bound campaign require the
user's subsequent authorization.
