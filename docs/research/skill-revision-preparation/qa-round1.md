# Three-skill revision preflight QA — FAIL (round 1)

No live model calls permitted by this gate result. Route the blocking finding to
the eval-curator stage, preserve this round, then rerun the full gate.

## Blocking finding

- `evals/research/runtime/benchmark-audit/login-runner.test.mjs:82`: the historical
  saved readiness freeze still calls current-source `validateFreeze`. It now
  fails after the three authorized guide edits with `Repository inputs/guidance/
  scoring/runner changed; create a versioned freeze`. Expected saved anchor is
  `9c145b34788da6f858dd30d6d128396186868aaeb709fe4934056cf6c563a154`;
  current source naturally differs. This is another historical fixture boundary,
  outside the newly adapted campaign-plan test. Preserve the old readiness freeze
  and drill archive, and validate them explicitly against their pinned original
  content/source; do not regenerate them or weaken the current live gate. Retain
  raw drill verification via the pinned implementation or a sound historical-only
  verifier. See `test.log` for the complete failing assertion.

## Other checks

- `npm run validate`: PASS.
- `npm test`: FAIL, the historical readiness test above; subsequent chained test
  commands were not reached.
- `npm run evals`: PASS, 64 structural scenarios.
- `npm run benchmark`: PASS, 30/30 parser severity and SARIF, 100% risk fidelity.
- `npm run evals:codex:validate`: PASS, 7 fixture schemas.
- `git diff --check`: PASS.
- Cross-document comparisons: 30 assertions PASS, including four manifests,
  six README badges, landing JSON-LD, changelog, derived 12 books, 64 evals, six
  negative trigger boundaries, and unchanged old frozen bytes.
- New freeze audit PASS: 22 cases, 132 turns; 16 historical + 6 same-workflow new;
  exact 5M/8h/180s/0 retry limits; both arms' guidance independently compared to
  pinned37fd5a2/current files; exactly three intended guide differences; identical
  case inputs and no rubric/oracle/identifier leakage into responder prompts.
- New source/data inspection: no additional execution/identity/authority defect
  identified. Existing fake-CLI tests exercise full132-turn collection and model,
  missing-usage and token-stop controls. Their full npm chain must run in round2.
- SR03 arithmetic independently checked as9450/100=94.5→95 and6950/75=92⅔→93.
- Small methodology wording correction requested and applied by root: witness
  cross-checks independent literal expected results and records exact fractions;
  it does not claim to execute an integer-only reference evaluator.

Frozen new-plan anchor:
`b7056c0938aaa3afc52cb87eda300fb95fa1d618a2023e68076265f6b15ce164`.

Logs and command exit codes are preserved in this directory. No product files
were edited by QA; no commits, pushes or live model calls were made.
