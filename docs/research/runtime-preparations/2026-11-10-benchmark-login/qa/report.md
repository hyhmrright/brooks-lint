# Consistency QA — HB/BV login calibration preparation

Date: 2026-11-10. Verdict: **PASS** for offline preparation. No real model,
provider/API request or real Codex login turn was executed by QA.

## Automated gate

All five commands ran sequentially and exited 0. Raw stdout/stderr and timings are
in `commands.json` and the adjacent command logs.

| Gate | Result |
| --- | --- |
| `npm run validate` | PASS |
| `npm test` | PASS: 1,078 Node test cases across five groups, zero skips, plus validator helper checks |
| `npm run evals` | PASS: 64 structural scenarios |
| `npm run evals:runtime:prepared` | PASS: 699 Node test cases across four groups, zero skips |
| `npm run benchmark` | PASS: 30 frozen parser reports |

The test and prepared suites overlap; their counts must not be added as unique
coverage. The benchmark-audit group has 16 tests, including 12 new runner tests.

## Boundary comparisons

- `cross-doc.json`: package version 1.9.1 agrees with four manifests, all six README
  badges, landing-page JSON-LD and CHANGELOG top release. Source inventory derives
  12 books, matching README/AGENTS/GEMINI; AGENTS agrees with 64 eval scenarios.
  All six shipped skill descriptions retain negative trigger boundaries.
- `artifact-checks.json`: revalidated current-source freeze and registration;
  checked all 54 archived raw records, exact assembled prompts, intent hashes,
  answer bytes/hashes, evidence hashes, one submitted turn per process, synthetic
  model/auth labels and confirmed cleanup/private-home deletion. The archive has
  220 retained artifacts. Per-file archive inventory checks pass in the new tests.
- `login-runner.mjs:59`: model input serialization contains only canonical case
  input files and arm-specific guidance. Rubrics, case IDs, labels, schedule and
  evaluator envelope are absent. B and C share identical core guidance.
- `login-runner.mjs:66`: explicit model/effort/CLI/provenance registration is required;
  source/input/guidance/policy/budget changes invalidate the freeze. Actual turn
  model/effort/version checks reuse the unchanged hardened transport.
- `login-runner.mjs:87`: default invocation cannot make live calls; mixed routes and
  live executable/auth overrides are rejected. Existing output directories cannot
  be replayed. An intent is archived before each attempt. Failure/missing usage
  stops new admissions while retaining the full 54-response denominator.
- New tests verify wrong-model, malformed-stream, missing-usage, token-threshold,
  spawn-failure and replay-refusal paths. Existing transport regressions, included
  in the successful npm test gate, cover deadline interruption, wrong effort and
  thread/turn, tool rejection, private credential redaction and bounded cleanup.
- Historical prospective HC executor/results and both HB/BV corpus directories
  have no changes against HEAD. `inspected-sha256.json` pins inspected new sources.
- Parent's separate `local-cli-preflight.json` records `codex --version` reporting
  0.167.0; the saved fake-process metadata is correctly not presented as that probe.

Protocol SHA-256:
`bc9a74b4cb3205a818756580f44a9a4b1240a829fef698aa5fcb08b70795ca78`.

## Findings and limits

No blocking inconsistency found. No author loop-back required.

This PASS establishes offline readiness, not successful real authentication/model
access or semantic model performance. Model and effort remain pending maintainer
selection and explicit registration. The process fixture uses gpt-fixture; all
54 answers are synthetic and review/accuracy remain pending. Manual semantic
review and comparative statistics still follow a future real run.

Primary admissions are capped at 54 with zero harness retries. The three-hour
budget is admission/deadline accounting, not an absolute wall-clock cap including
setup/cleanup/archive. Observed-token stopping is between calls, may overshoot,
and is not a hard backend token/dollar quota. Provider retries remain outside the
harness cap. CLI identity is not backend attestation; disabled tools/private home
are not OS containment. Public cases, related families, unblinded context length,
and same-workflow QA do not establish independent human validation or general
runtime-skill improvement. These limitations are documented rather than hidden.
