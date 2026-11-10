# All-skills benchmark QA round 2 — PASS

Date: 2026-11-10. Independent offline QA. No real model calls, source edits,
commits or pushes by QA. Round 1 report and raw logs remain intact.

## Full gate

All commands completed with exit 0, in the required sequence:

- `npm run validate` — qa-round2-validate.log
- `npm test` — qa-round2-test.log, including 18 all-skills and 2 campaign tests
- `npm run evals` — qa-round2-evals.log, 64 structural scenarios
- `npm run benchmark` — qa-round2-benchmark.log
- `npm run evals:codex:validate` — qa-round2-codex-offline.log, seven fixtures
- `git diff --check` — qa-round2-diff-check.log, clean

## Round 1 findings closed

1. Artifact grammar: independently reproduced rejection of the original postfix
   increment false repair and return ASI with LF, CR, CRLF, U+2028 and U+2029.
   Decimal exponent repair and neighboring spaced unary expressions pass.
   Leading-zero integer forms are rejected; handwritten trusted-JavaScript
   differential checks pass for supported lexical forms. Unsupported grammar is
   disclosed in the visible task. No generated model code is executed.
2. AS-24: exported A/B inputs contain the same neutral base100 and balanced
   15/5/1 deduction policy, without giving the expected95 answer. Both arms can
   derive the score and retain unknown status for unscanned dimensions.
3. AS-12: the visible ten-change history now has two omissions and eight
   successes, no avoidance, 2–3x slowdown, and three modules. Independent witness
   derives Pain2, Spread2 and priority4 consistently with the rubric.

Raw reproductions: qa-round2-fixes.log. These close all three round 1 findings.

## Boundary checks

The actual public report CLI accepts a verified archived fake run with explicit
synthetic QA annotations. Mutating its raw answer without updating the receipt
fails with `Raw byte hash mismatch`, returns nonzero and creates no forged report.
This tests the public path, not only a validation helper. The fourteen fake turns
remain simulation data, not observed model efficacy; 1400 tokens are synthetic.
Evidence: qa-round2-provenance.log.

Both all-skills freezes and the parent campaign validate. Full210 plus unchanged
PB108 equals318 planned calls; smoke14 is an alternative readiness subset.
Model and effort remain unset pending explicit later registration. Source
transitive binding, oracle exclusion, task-criteria/diagnostic-issue separation,
35-case catalog coverage, and disclosed workflow limitations remain as reviewed
in round 1; the fixes do not alter those contracts.

- Full: `3405e0e6c549f59e9ae09ca54e7a2539549e82224307506b7f0be909d467a346`
- Smoke: `299e5b2fa17284e198ab1c70297ef67573e8c2218f051777b4c2a5da3114e83b`
- Campaign: `e3df44f4b89af069dd9ae02fa03c024477051f4a7f78a667c6f9ab1016eb68cd`

Archive inspection passes for all75 members: safe relative paths, no AppleDouble,
no auth.json and no real-looking Bearer/API/JWT markers. This is a bounded static
inspection, not a universal secret scanner. Evidence: qa-round2-archive.log.

Cross-document comparisons confirm version1.9.1 across package, four plugin
surfaces, six README badges, landing JSON-LD and top CHANGELOG. Derived source
inventory is twelve books and README/AGENTS/GEMINI agree. Actual64 eval scenarios
match AGENTS; all six product descriptions retain negative-trigger clauses.
Evidence: qa-round2-cross-docs.log.

## Disposition

PASS for offline benchmark preparation. No remaining concrete blocker found in
this review. This is not a claim of skill efficacy, independent holdout validity,
native skill-discovery coverage, or a full interactive sweep workflow test.
The corpus remains authored development material; maintenance cases are policy
checks, and sweep uses a restricted artifact verifier. Real model execution and
semantic adjudication are still pending. Parent may proceed to model selection
and explicit run registration under the frozen budget policy.
