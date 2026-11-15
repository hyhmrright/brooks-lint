# Offline follow-up QA

Verdict: **PASS** after one historical-verification loop-back. No real model calls
were made. This is an offline correctness/consistency gate, not evidence that the
revised instructions improve model behavior.

## Ordered final gate

Executed in order with local process/socket permissions enabled:

| Command | Result |
| --- | --- |
| `npm run validate` | PASS |
| `npm test` | PASS, complete chain including current scorer and historical v3/v4/v5/HS suites |
| `npm run evals` | PASS, 64 structural scenarios |
| `npm run benchmark` | PASS, 30/30 severity inventories and SARIF; risk-code precision/recall 100% |

Additional checks: `node --test scripts/health-dashboard.test.mjs scripts/dashboard-delivery.test.mjs evals/research/skills-v5-offline-fixes/sweep-boundaries.test.mjs`
passed 21/21. A direct `suppliedCappedLedger` check rejected one explicit ID reused
across Architecture and Debt, and accepted distinct IDs. `git diff --check` passed.
The full chain additionally ran the three historical-scorer isolation regressions.

Logs are retained in [offline-followup-qa](offline-followup-qa/): `validate.log`,
`test.log`, `evals.log`, `benchmark.log`, `targeted.log`, and `supplied-ledger.log`.

## First failure and repair

The first restricted test run failed local process/socket fixtures; its complete
output remains `test-sandbox-restricted.log`. It was rerun with the permissions
needed by those offline fixtures.

The first unrestricted `npm test` failed at
`evals/research/skills-benchmark-v2/campaign-v3.test.mjs:28`, where
`campaign-v3.mjs:82` compared historical probe sources with the changed current
scorer (`Probe source changed`). That failure is retained as
`test-initial-history-failure.log`; the initial verdict is `qa-initial-fail.md`.
It was a valid source-drift rejection, not evidence that the historical model
answer had changed.

The repair preserves the old scorer in a test-only snapshot and replays historical
suites inside temporary workspaces. Its SHA-256 independently matches both the
original git object at `c570a731ff8ca98a6ed23a63b193fefaa80057be` and the existing
probe hash: `96c424d416a4796ef8a942e6df873db55525481d9a3b70cb319a1d6a447baa64`.
The current scorer is not overwritten. Only fixed offline groups are accepted;
corrupt/unknown snapshots and current-checkout restoration reject. Production
collectors do not import this wrapper. A separate current-source regression proves
that old proof still rejects for current collection, while simulation registration
binds the changed current scorer. Current scorer, current suite/guidance and artifact
tests remain in the validation chain.

All original frozen plans, raw answers, failures, annotations and aggregate results
remain unchanged. The old live prerequisite cannot authorize collection with the
changed scorer: any next model run requires a newly frozen plan and matching
current-source prerequisites. Historical replay grants no live authorization.

## Boundary review

- Health declares scope before selecting dimension status, distinguishes complete
  local scans from material missing facts, preserves other completed dimensions
  when one is unknown, and still suppresses an incomplete composite.
- The score contract now requires globally unique explicit finding IDs, including
  supplied ledgers. Existing callers that reused local IDs for distinct findings
  must provide distinct IDs across the ledger. This is an intentional stricter
  contract. It does not detect the same cause disguised under different IDs.
- Regression ledger witnesses have adjudicated statuses; they do not prove that a
  model can infer those statuses correctly. The report explicitly preserves this
  limitation and does not relabel historical results as post-fix results.
- Sweep instructions are unchanged. The observed advantage remains one authored
  ambiguity family; no broad repair improvement is claimed.
- Version cross-check: package, four manifests, six README badges, landing-page
  JSON-LD and top CHANGELOG section all equal `1.9.1`.
- Source frontmatter derives 12 books, matching README/AGENTS/GEMINI; actual eval
  count is 64, matching AGENTS. All six descriptions contain the negative trigger
  boundary. No descriptions or guide step numbering changed.

No outstanding QA findings. No release/tag/publication performed.
