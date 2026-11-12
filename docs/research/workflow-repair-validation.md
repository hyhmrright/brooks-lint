# Offline verification — workflow repair

Date: 2026-11-12. No real-model execution occurred. All new model-like answers are
explicit authored simulations; the checks below are not efficacy results.

## Targeted evidence

- New health workflow regressions: 15 passed, including exact probe arguments,
  frozen identity/budget, missing or changed companion executable, foreign
  requests, wrong model and bounded cleanup.
- Actual CLI 0.167.1 and 0.167.2 against loopback: disabled code-mode negative
  control, enabled scorer roundtrip and host-rendered ledger path all matched
  expected outcomes. Raw requests, answers, failures and source snapshots are
  in [the routing archive](health-workflow-v2/README.md).
- Sweep canonical final score was passed through the production parser;
  conflicting extra scores were rejected. Report-contract tests: 16 passed.
- New benchmark: 36 executable case witnesses; suite regressions: 13 passed.
- Collector: 9 regressions passed, including the entire 108-slot fake-CLI
  schedule, first failure, unknown usage, budget stops, raw tampering, absent or
  simulated live probe, and actual scorer receipt checks.
- Review aggregation uses sealed rubrics. A regression supplies a sealed rubric
  different from the current fixture and verifies that its denominators prevail.

## Repository gate

The first complete gate passed `npm run validate`, `npm test`, `npm run evals`
(64 structural scenarios), and `npm run benchmark` (100% parser fidelity on the
frozen 30-report corpus). It also checked four manifests, six README versions,
landing-page JSON-LD, CHANGELOG, AGENTS/GEMINI and the twelve-book inventory.

QA found and resolved a stale sweep score-label sentence in runner contracts.
Incremental QA also identified possible rubric drift; the collector and summary
now use the sealed case definitions. The second automatic gate passed, but semantic
QA found a protected-case test-inventory gap: delimiter-key mutations survived a
supposedly protected complete test suite. All six protected challenge variants now
cover collisions, cross-route reuse, returned identity and unauthorized reads. A
regression verifies they kill delimiter-key and disabled-cache mutations. The
initial simulation archive is retained unchanged and marked superseded; the
[revision 2 archive](skills-benchmark-v2-results/offline-drill-r2/README.md) includes
full source snapshots and reproduces all 108 records and the simulated report.
The third automatic gate passed after that correction. Archive reproduction then
exposed a CLI entry-path defect: macOS `/var` versus `/private/var` aliases could
cause a successful exit without running verify/review. Suite, collector and probe
entry checks now canonicalize paths. New symlink regressions require real output
and report/plan files, not just exit status. The final
[revision 3 archive](skills-benchmark-v2-results/offline-drill-r3/README.md) retains
the rerun 108-slot simulation and 385 source/fixture snapshots; the author also
verified/rebuilt its report through a `/tmp` symlink and compared it byte-for-byte.
The final gate for these entry changes is **PASS**: repository validation, the
complete `npm test` pipeline and all 64 structural evals passed on the final code.
The unchanged parser benchmark result remains 100%. QA independently checked the
revision 3 checksum, all 385 snapshots, 108 records and actual symlink CLI output;
the rebuilt report is byte-for-byte identical. `git diff --check` also passed.

Final case freeze: `933cf78cc7abe9c90457d756eabdc1d3dd790693758080e210f9fa8182bae6b4`.
Final probe freeze: `cef90975154e987c028ae3aa2c6c197fdee8a7f169881091a9fd206b80a5cf2f`.
The [detailed QA record](workflow-repair-qa.md) retains the intermediate findings
and corrections. Separate-agent reproduction is still same-workflow QA, not
independent human validation or an independently authored benchmark.

No trigger descriptions changed, so a trigger-boundary audit is not required.
No release, version bump, tag or model campaign is part of this change.

## Scope of confidence

Passing these checks establishes offline protocol behavior, fixture witnesses and
data consistency. It does not establish improved model reasoning, independent
holdout performance, native skill discovery, autonomous editing, semantic truth
of judgments, or safety of executing generated patches on the host. Generated
code is collected and reviewed but never executed by the new campaign collector.
