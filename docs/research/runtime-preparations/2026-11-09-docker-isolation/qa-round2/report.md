# Docker isolation QA round 2 — PASS

All four required sequential gates passed against repaired final sources: `npm run validate`, `npm test`, `npm run evals`, and `npm run evals:runtime:docker:validate`. Raw stdout/stderr, timestamps, exit codes and SHA-256 values are retained in results.json. Full npm tests passed 222 helper, 6 provider and 619 main tests; the main suite includes 39 Docker regression tests. Structural evals validated 64 cases. The Docker archive validates six distinct controls and 64 command records without contacting the daemon or launching native CLI/model work.

## QA1 finding resolved

The original QA1 reproduction now exits 1 with `Exact unique case order required`; exact new stdout/stderr are retained here separately from the original successful bypass. The validator requires the exact mode sequence, unique container names/IDs, standalone case agreement, complete disjoint ordered command partition, exact artifact set, and per-case command argv/ID/image/entrypoint/resource policy binding. Eleven added mutation regressions cover duplication, omission, contradictory standalone cases, IDs/names, command overlap/order/orphans, extra files, foreign targets and inspected-image mismatch. No new actionable finding was identified in this revision.

All 469 original author artifacts match the unchanged author manifest using qa1-preservation.json's explicit mapping. The 16 QA1 files match their own inventory. All four final source snapshots and remediation-sources.json agree with current source. Original observations and development collections remain unchanged; this repair does not retroactively rerun native CLI or container probes.

## Cross-document and scope checks

Version 1.9.1 agrees across package.json, four plugin manifests, six README badges, website JSON-LD and CHANGELOG top section. The source inventory derives twelve books, matching README/AGENTS/GEMINI; AGENTS' 64-eval claim and six negative trigger clauses match source. Scoped .gitattributes entries preserve raw binary/text streams without changing their contents. git diff --check passed.

The positive native fake-response observation is distinct from builtin bwrap failure, shared broker access and host-launcher-death survival. These remain explicit negative/unverified boundaries. Normal Docker cleanup and PID1 lifecycle evidence do not establish durable crash cleanup, arbitrary-tool/client separation, production authentication, responding-model attestation or provider billing. No live model, real credential, new native CLI or Docker container run occurred in this QA round.

The reviewer's first preservation helper selected the manifest root instead of its sha256 member; this setup assertion was corrected before checks. No product or evidence file was changed by that correction. See cross-checks.json.
