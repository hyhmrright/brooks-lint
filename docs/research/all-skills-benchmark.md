# All-skills benchmark, revision 1

Status: offline-prepared public development calibration. Zero real model calls.
The product scope is **all six shipped skills**, derived from `skills/*/SKILL.md`.
The repository-local maintenance harness has its own four policy cases and never
contributes to product diagnostic rates. Historical freezes remain unchanged.

See the [two-round offline validation](all-skills-benchmark-validation.md) and
the [combined campaign](benchmark-campaign.md) for final readiness and scope.

## Coverage and purpose

| Skill | Cases | What the tests inspect |
| --- | --- | --- |
| brooks-review | AS-01–AS-05 | Diverged business policy, new-branch protection, independent equal policies, missing rounding contract, syntax boundary |
| brooks-audit | AS-06–AS-10 | Upward dependency, actual import cycle, valid composition root, omitted generated binding, line-level explanation boundary |
| brooks-debt | AS-11–AS-15 | Evidence-backed Pain × Spread ranking, change amplification, bounded throwaway tradeoff, absent change history, HTTP health boundary |
| brooks-test | AS-16–AS-20 | Replaced test subject, branch blind spot, legitimate external fake, incomplete suite inventory, assertion API explanation |
| brooks-health | AS-21–AS-25 and AS-35 | Strictness arithmetic, no-diff weight redistribution, clean ledger, unscanned dimensions, infrastructure boundary, actual two-issue source diagnosis |
| brooks-sweep | AS-26–AS-30 | Two actual artifact repairs, clean no-op, missing pricing policy with public consumers, explicit refusal/read-only scope |
| brooks-harness (maintenance) | AS-31–AS-34 | Minimal stage selection, QA-failure routing, missing change scope, using a skill rather than maintaining the plugin |

The first five cases per product skill include two positive targets, a protected
case, missing information and a task boundary. AS-35 additionally tests health
source diagnosis so calculator checks cannot substitute for finding real problems.
No “all skills effective” claim follows from coverage alone. The sample does not
cover every risk, language, operational environment or workflow branch.

Inputs and rubrics are authored in the same exposed workflow. AS-01/02 and
AS-16/17 adapt policy-drift, branch-coverage and substituted-subject mechanisms
already present in the repository's Codex/PB development fixtures. They are not new
independent discoveries or holdouts. No third-party case code is copied.

## Comparators and the meaning of the measurements

A receives the task and source/context inputs. B additionally receives the target
skill and its supporting reference bundle. Health does not receive other mode
guides; sweep receives the four constituent mode references it composes.
Auxiliary shared reference text is provided explicitly, not discovered through
native loading. Conditional setup/config/custom-risk features not exercised by the
fixture are not certified. Neither arm may browse, use tools or delegate.

Both arms receive the neutral rules needed for task completion: health arithmetic,
debt-priority definitions and repository-maintenance policy. B adds the actual
skill guidance. This prevents scoring a baseline as ignorant merely because a
private convention was withheld. Context length still differs; a matched-length
placebo and generic-checklist ablation remain future work.

Per-skill results distinguish:

- **Diagnostic issue recall:** only cases with actual expected causal issues.
- **Required-criterion completion:** fixed-ledger health arithmetic, AS-11's
  supplied-debt ranking and maintenance policy application. These are not bugs
  found and do not contribute to finding precision.
- **Evidence and restraint:** exact-support judgments, unsupported claims,
  unresolved overclaims, protected-case errors and scope expansion.
- **Artifact outcomes:** actual allowed-file changes, independent behavior checks
  and byte preservation for sweep, reported separately from answer quality.
- **Execution/cost:** failures, incomplete pairs, observed tokens and duration,
  with family/case/repetition detail. Repetitions are not independent cases.

AS-35 supplies source and a contract, not a finding ledger. Its two expected
mechanisms are the domain-to-HTTP dependency and a test that breaks after a private
identifier rename even while public behavior remains correct. Offline witnesses
execute the unchanged test, renamed source, and a separate public-behavior check.
The branch-coverage fixtures also execute the visible tests against an authored
always-paid mutant; a literal `true` flag is not used as proof of mutation coverage.

## Sweep artifact verification

This track measures **harness-applied artifact repair**, not native autonomous
sweep execution. The model returns JSON containing a report and allowlisted
full-file replacements. The harness writes those replacements to a fresh temporary
filesystem, preserves other files byte-for-byte and independently evaluates hidden
literal behavior cases from the oracle. No shell command or generated JavaScript
is executed. Source before/after hashes, resulting files and individual test
outcomes are retained with the reconstructed run.

The task explicitly restricts the editable fixture to an exported function with a
single pure arithmetic/conditional return expression over existing parameters.
The evaluator parses that declared grammar; it supports numeric/boolean comparisons
and exact numeric results for the chosen literal cases. Finite decimal exponent
literals are supported. Update operators and a line terminator before the return
expression are rejected to respect JavaScript lexical and ASI behavior; spaced
unary operators and later expression line breaks remain accepted. Multiple equivalent
allowed expressions are accepted. It does not validate arbitrary JavaScript,
imports, calls, statements, runtime resource behavior, real test-runner integration
or large refactors. Real native sweep remains a separate future execution track.

A promise that tests passed is not an artifact. Malformed JSON, an unauthorized
path, unchanged defective source, or changed behavior failing the hidden tests is a
**task failure**, even if the model turn completed successfully. These responses
remain in the denominator. A no-op is correct for protected/unknown/refusal
fixtures only alongside the appropriate semantic response evidence. Consent for
safe positive repairs is explicitly supplied; missing policy and refusal controls
forbid changes. No fixture authorizes a real repository commit or push.

## Frozen scopes and execution

`frozen-full.json` contains 35 cases × 2 arms × 3 repeats = **210** primary turns:
186 product turns (31 × 2 × 3) and 24 maintenance turns. The historical PB runtime
study remains separate at108; a unified campaign can sequence both without pooling
scores. `frozen-smoke.json` contains one case per product skill plus maintenance,
7 × 2 × 1 = **14** turns. Smoke and full are alternative scopes, not independent
holdouts. Do not tune on smoke and then describe the unchanged full corpus as unseen.

| Limit | Full | Smoke |
| --- | --- | --- |
| Primary turns | 210 | 14 |
| Per-turn local deadline | 180 seconds | 180 seconds |
| Study admission deadline | 11 hours | 1 hour |
| Observed-token admission stop | 6,000,000 | 500,000 |
| Automatic retries | 0 | 0 |

Stops are checked between turns and can overshoot by one turn. Provider retries,
actual backend identity and ChatGPT billing are not independently controlled by
these counters. First process/identity/cleanup failure or unavailable usage stops
further admission; intent and raw records remain. No implicit resume is implemented.
Real login access and model/effort must be checked after the maintainer selects
them. Freeze/validate/import commands never call a model.

```bash
npm run evals:all-skills
node evals/research/all-skills/runner.mjs validate evals/research/all-skills/frozen-full.json HASH
node evals/research/all-skills/runner.mjs register PRIVATE_CONFIG NEW_REGISTRATION
# Only after separate model/effort/scope selection and explicit execution instruction:
node evals/research/all-skills/runner.mjs run REGISTRATION HASH NEW_DIRECTORY --live
```

Registration uses the complete frozen object, its anchor, explicit model, effort,
CLI version, authorization provenance and optional inherited-proxy opt-in.
The existing hardened Codex login turn adapter handles the actual turn; this
benchmark does not replace it or modify production/global CLI configuration.

## Raw records and review

Each intended turn is recorded before submission. Raw bytes receive a receipt
hash. The report reconstructs answers, model identity, usage and artifact outcomes
directly from raw records against frozen prompts/registration, rather than trusting
an editable answer-summary file. Safe paths, source hash, completed cleanup,
model/effort/CLI and simulation status are verified. All-artifact malicious rewrites
are outside the consistency guarantee; hashes are not signatures.

Shuffled review packets omit arm/order/case labels; the private mapping is separate.
Style and author knowledge can reveal treatment, so this is not independent blind
human validation. [Review policy](../../evals/research/all-skills/review-policy.md)
defines exact excerpts, rationale, reviewer exposure and open-set adjudication.
Pending claims remain pending and prevent complete-supported status; a novel issue
is not automatically false because it is absent from gold.

```bash
node evals/research/all-skills/report.mjs RUN_DIRECTORY ANNOTATIONS NEW_REPORT
```

Annotations use the same per-item exact-support schema as the runtime pack study;
`issues` contains expected criterion IDs for task-criteria cases and expected issue
IDs for diagnostic cases, with denominators kept separate. All completed responses
need annotations; missing or unknown identities fail reporting. Semantic truth is
still a reviewer responsibility. Handwritten no-op/blanket scoring simulations
exercise arithmetic, not model-judge accuracy.

Offline artifacts and the fake CLI archive are labeled simulation. They contain
no model results. Actual native skill activation, filesystem navigation, tool
sequencing, skill interplay, autonomous convergence and general production benefit
are not established by this text/artifact benchmark.
