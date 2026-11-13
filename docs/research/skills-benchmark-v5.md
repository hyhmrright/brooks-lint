# V5 prospective task-outcome comparison

Prepared offline on 2026-11-13. No real model call is authorized by preparation.
This is a new development comparison, not a retrospective correction of v4.
The original cases, prompts, raw runs, failure records and judgments remain intact.
See [project direction](skills-benchmark-v5-direction.md) for skill scope and the
candidate health/sweep changes. There is no demonstrated effectiveness gain yet.

## Frozen design

- Model: `gpt-6.1-terra`; reasoning: `low`; pinned Codex CLI: `0.167.1`.
- 36 cases, six shipped entrypoints, twelve mechanism families; each family has
  defect, protected and missing-obligation variants.
- A: case-only; B: generic checklist; C: supplied skill Markdown. The same public
  risk vocabulary, scoring defaults, input files, tool schema and output contract
  apply to every arm. Prompt character lengths are recorded and unequal.
- Three repetitions, balanced rotating arm order: **36 × 3 × 3 = 324 submissions**.
- At most **12,000,000 observed tokens**, **12 hours overall**, **120 seconds per turn**.
- No automatic retries or replacement calls. Stop on first failure, observed retry,
  unknown usage, proxy drift, or exhausted admission budget; preserve every failed
  record and all not-run slots. A new recovery requires a separate reviewed plan.
- Observed tokens are not dollars or a hard billing cap: one admitted turn can
  overshoot, and failed-request usage may be unknown. Reused historical probe
  evidence establishes only the recorded transport/toolchain binding; current
  authentication and backend availability cannot be confirmed offline.

The case freeze and its SHA-256 anchor are under
`evals/research/skills-benchmark-v5/`. The separately sealed
[registration](skills-benchmark-v5-registration.json) pins model, effort, budgets,
source hashes, toolchain, historical successful probe and proxy fingerprint.
Both registration and explicit `--live` authorization are required by the runner;
a simulation or modified freeze cannot silently become a live run.

| Mode | First family | Second family | Observable task result |
| --- | --- | --- | --- |
| Review | Replayed event effects | Pagination cursor boundary | Concrete request sequence, caller obligation and bounded remedy |
| Audit | Notification injection boundary | Domain/composition cycle | Active import edge and actual responsibility contract |
| Debt | Central unit conversion | Shared versus independent retention policy | One-sided change in both consumers and justified coordination burden |
| Test | Mock call versus persisted state | Assertions swallowed by catch | Original test and contract-relevant mutant outcomes |
| Health | Redacted export | Rejected batch state | Local test diagnosis, evidence-backed dimension status, reconciled ledger and exact final report |
| Sweep | Caller array mutation | Account batch update | Authorized patch, preservation of user/baseline files, current-source ledger and truthful stop |

These small authored tasks broaden mechanisms and outcomes; they are not a claim
of a quantified difficulty increase. Complete source and contracts are supplied
where required. Unknown variants omit governing obligations, not merely identifiers.
Each case has an executable authored witness and hidden operational rubric. The
case-specific `taskOutcome` defines what the requested mode must establish.
Protected debt ownership includes independent policies with equal present values.

## Frozen assessment

The primary endpoint is **complete task outcome**, reported per answer, skill,
arm and repeat. It requires all expected issue and task-criterion credits, no
confirmed false or unsupported claims, and the required exact finalizer/shape
receipt. A pending claim produces a pending result. Execution failures and not-run
slots remain separate, visible categories. A correct label alone cannot pass.
Credits are semantic judgments with exact answer excerpts and reasons, not keywords.

Secondary diagnostics are frozen-label agreement, issue recall/misses, evidence
credits, claim and affected-answer false-positive counts, other unsupported claims,
pending claims, supported novel findings, tool delivery adherence and observed
usage. Supported novel findings remain outside frozen recall and are not false
positives just because the oracle omitted them. An edited finalizer report remains
a workflow failure even if arithmetic or diagnosis is correct. No automatic claim
that C is effective follows from any one metric.

Returned sweep code is not executed during collection. A separate bounded Docker
checker can verify a submitted candidate against frozen assertions, no-network,
non-root, read-only-root and resource limits, while checking cleanup. Unknown
contracts receive authorization-only checks and never a repair-success result.
The checker is bounded evidence, not adversarial-proof grading or native autonomous
repair. A later sandbox pass cannot erase an earlier false execution claim.

All cases are same-workflow development material. Authors saw the v4 results and
revised skills; semantic review is AI-assisted in the same workflow, not independent
human review. **Independent holdouts: zero.** Three repetitions measure variability
but do not create 324 independent problems; there are twelve related families.
Report per-case/repeat outcomes and descriptive paired differences. External blind
cases remain a limitation, not a blocker on this offline preparation. Do not tune
these cases or revise their labels after viewing the next real answers.

## Offline reproduction and later execution

```sh
npm run evals:skills:v5
node evals/research/skills-benchmark-v5/drill.mjs FRESH_SYNTHETIC_DIRECTORY
node docs/research/skills-benchmark-v5-validation/verify-history.mjs
```

The fake-CLI drill records 324 synthetic completions plus retry, wrong-model,
unknown-usage and budget stops. Its synthetic semantic judgments are deliberately
`no-answer`, so its metrics are not capability evidence. Full records are retained
in the validation archive. `npm test` includes v5; it never invokes a real model or
starts Docker. An explicit authored Docker validation is:

```sh
node evals/research/skills-benchmark-v5/artifact-drill.mjs FRESH_RECORD.json --offline-docker
```

Only after the user switches/confirms the model and authorizes the campaign:

```sh
node evals/research/skills-benchmark-v5/campaign.mjs execute docs/research/skills-benchmark-v5-registration.json REGISTRATION_SHA256 FRESH_RUN --live
node evals/research/skills-benchmark-v5/campaign.mjs verify FRESH_RUN
node evals/research/skills-benchmark-v5/campaign.mjs review FRESH_RUN ANNOTATIONS.json FRESH_REPORT.json
node evals/research/skills-benchmark-v5/artifact-check.mjs FRESH_RUN ORDINAL FRESH_ARTIFACT_REPORT.json
```

The historical v4 current-checkout equality test was explicitly migrated to verify
its archived freeze and original test-source hash; the original test source is
retained in `historical-v4-suite.test.txt`. V4's old prompt freeze and registrations
were not regenerated with new guidance. The v5 test now owns current-guidance drift.
