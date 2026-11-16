# Runner Contracts

The six interactive skills and the API runners share diagnostic rules, but they do
not have the same execution capabilities. The canonical executable mode registry
is used by prompt assembly, scenario validation, and runner admission checks.

| Entry point | Supported modes | Evidence and execution |
|---|---|---|
| Interactive agent | `review`, `audit`, `debt`, `test`, `health`, `sweep` | Uses the agent's project-reading tools; Full Sweep additionally requires editing and verification tools and established edit authorization. |
| GitHub Action / `scripts/ci-review.mjs` | `review` | Reviews the collected Git diff only. No model-side file access, test execution, or edits. |
| `scripts/run-codex-evals.mjs` | `review`, `audit`, `test`, plus non-trigger controls | Real isolated Codex sessions with paired skill/no-skill fixtures and a separate semantic judge; see [behavioral evaluation](codex-behavior-evals.md). |
| `scripts/run-evals-live.mjs` | `review`, `audit`, `debt`, `test`, `health` | Diagnoses the supplied scenario prompt and fixtures only. Does not exercise repository discovery or file edits. |

Unsupported CI modes fail before the model request. The API eval runner explicitly
reports skipped `sweep` scenarios in an unfiltered run and excludes them from its
pass-rate denominator. Explicitly selecting an unsupported scenario or mode is an
error. The scenarios remain in the structural suite for interactive evaluation;
API results must not be presented as Full Sweep execution coverage.

## CI scope and configuration

For a GitHub pull request, the runner uses the event's base and head commit SHAs to
collect the merge-base diff. Use `actions/checkout` with `fetch-depth: 0` so those
commits and their merge base are available. It does not assume the base branch is
named `main`, or treat the checkout's merge commit as the PR head.

For an explicit CLI comparison:

```bash
node scripts/ci-review.mjs --mode review \
  --project-dir /path/to/project \
  --base-ref origin/develop --head-ref HEAD
```

With `--config-ref base` (the default), an explicit base ref or the PR event's base
SHA also selects the trusted `.brooks-lint.yaml`. `--config-ref head` opts into the
working-tree config instead. A missing config file at an available base means
use default policy, not the PR's newly added config.

A successfully collected empty diff yields a skipped run with `score: null` and no
model request. The Action skips score thresholds and SARIF upload for that run.
Missing references, an unavailable merge base, and Git command failures are input
errors. They must not be relabelled as an empty diff or a full-codebase scan.

The model sees only the collected diff and supplied policy. Its report must state
that scope and must not assert that omitted tests, callers, or files were inspected.
Use an interactive skill for wider repository analysis.

## Report interchange

Scores are integers in the inclusive range 0–100. The Markdown labels are stable:

- `Health Score` for review, audit, debt, and test.
- `Composite Score` for health and Full Sweep's final dashboard.
- Historical Full Sweep reports may use the final `After: N/100` value in the
  Health Score Delta; the parser retains this compatibility.

Plain and bold labels are supported. Onboarding and skipped runs do not have a
score. Empty, truncated, malformed, or ambiguous reports must not pass quality
gates as clean reports; rerun with sufficient context or a larger output ceiling.

Each finding has a risk code in its bold title, an explicit severity, and four
non-empty fields: `Symptom`, `Source`, `Consequence`, and `Remedy`. Custom `C<number>`
findings use the same contract. Under `### Project-Specific Risks`, use nested
severity headings such as `#### 🟡 Warning`, or place a severity emoji immediately
before each bold finding title. The section name does not supply severity, and a
custom finding must not inherit it from an earlier unrelated section.

Suppressed entries belong inside a complete
`<details><summary>Suppressed</summary>…</details>` block. They are excluded from
active findings, SARIF results, and severity gates. Nested or unclosed suppression
blocks, and contradictions between a severity word and its emoji, are invalid
reports. Active findings after a suppression block need an explicit severity.

## Eval boundaries

These optional boundary settings are mutually exclusive:

| Setting | Meaning |
|---|---|
| `no_risk_codes: true` | The expected answer contains no findings at all, including findings under an unrelated risk code. |
| `forbidden_risk_codes: [R5]` | The named risks must not be reported as findings; other valid findings are allowed. |
| `no_health_score: true` | The answer must omit a score, for example in onboarding mode. |

Risk-code mentions in explanatory prose are not findings. Positive cases are
checked against codes on parsed findings with complete report fields, rather than
by searching the whole answer for risk-code strings. Out-of-range scores and
keyword-only answers are not valid reports.

`npm run evals` validates scenario structure. The live runner's deterministic
classification validates the report contract and finding risk codes. Neither
proves that evidence is true, that a cited location establishes the diagnosis,
or that a remedy is appropriate. Those require human or semantic evaluation.
Maintain the frozen parser corpus separately from model-quality evaluation.

The historical API live runner still uses Anthropic. The separate opt-in Codex
behavioral runner exercises discovery, completion, false positives, and severity
against a no-skill baseline; it does not replace the API or parser benchmarks.
Routine maintainer verification remains offline validation, tests, structural
evals, and the parser benchmark, with the repository's Codex-only maintenance
policy unchanged.
