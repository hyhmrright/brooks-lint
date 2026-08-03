# Contributing to brooks-lint

Thanks for wanting to help. brooks-lint gets better with every new symptom pattern,
book citation, and eval test case that gets added — and most contributions require
zero code.

## Four Ways to Contribute

### 1. Add a finding to an existing decay risk (easiest)

Edit `skills/_shared/decay-risks.md` or `skills/_shared/test-decay-risks.md`.
Each risk has a `Symptoms` list and a `Sources` table. You can:

- Add a new symptom pattern you've seen in real codebases
- Add a book citation for an existing symptom
- Sharpen the severity guidance (🔴/🟡/🟢 thresholds)

No code required. No tests required. Open a PR with your change and a one-sentence
explanation of why it matters.

### 2. Improve a guide file (no code required)

The guide files define how Claude analyzes each scenario:

| File | What it controls |
|------|-----------------|
| `skills/brooks-review/pr-review-guide.md` | How PR reviews are structured (incl. Step 7 Quick Test Check) |
| `skills/brooks-audit/architecture-guide.md` | How architecture audits run |
| `skills/brooks-debt/debt-guide.md` | How tech debt is classified and scored |
| `skills/brooks-test/test-guide.md` | How test quality reviews run |
| `skills/brooks-health/health-guide.md` | How the health dashboard aggregates scores across all four dimensions |
| `skills/brooks-sweep/sweep-guide.md` | How the full sweep classifies, applies, and reverts fixes |
| `skills/brooks-audit/onboarding-guide.md` | How the codebase tour (onboarding mode) is produced |
| `skills/_shared/test-decay-risks.md` | Six test-space decay risks with book citations |

Better heuristics here mean better reviews for every user. If you find the skill
misses something important or produces a finding that's consistently wrong, the
fix is almost always in one of these files or in `skills/_shared/source-coverage.md`,
which captures book-level scope, exceptions, and tradeoffs.

### 3. Add an eval test case (most impactful)

`evals/evals.json` holds the scenarios the skill is graded against. Adding a new
test case that catches a real problem the current skill misses is the highest-value
contribution. (The 94% figure in the README is a separate, three-scenario
head-to-head against an unaided review — not this suite's pass rate.)

**Format:**

```json
{
  "id": 50,
  "name": "your-scenario-name",
  "prompt": "The user prompt that triggers the review",
  "expected_output": "Description of what a good review should contain",
  "mode": "review",
  "files": []
}
```

Use the next sequential `id` after the last entry in `evals/evals.json` (currently 57 scenarios). The `mode` field is required — use one of: `"review"`, `"audit"`, `"debt"`, `"test"`, `"health"`, `"sweep"`.

Optional flags for special scenarios:
- `"no_risk_codes": true` — for false-positive scenarios where no risk codes should appear in output
- `"no_health_score": true` — for scenarios testing Health Score suppression (e.g. onboarding mode)
- These two flags are mutually exclusive.

In your PR, show the before/after: what the skill produced before your change
and what it produces after. Even a screenshot or paste of the output is enough.

### 4. Adding a new decay risk (advanced)

Adding an entirely new risk category (e.g., R7 or T7) requires touching six places.
Run `npm run validate` and `npm run evals` after each step to confirm no drift:

1. **`skills/_shared/decay-risks.md`** or **`test-decay-risks.md`** — add the full risk definition (Diagnostic Question, Symptoms, Sources table, Severity Guide, What Not to Flag)
2. **`skills/_shared/source-coverage.md`** — add the new risk to the relevant book sections under "Encoded today"
3. **`scripts/frontmatter.mjs`** — increment `PRODUCTION_RISK_COUNT` or `TEST_RISK_COUNT`
4. **`scripts/report-parse.mjs`** — add the code → display-name entry to `RISK_CATALOG`
5. **Mode guide(s)** (`pr-review-guide.md`, `architecture-guide.md`, `debt-guide.md`, `test-guide.md`) — add diagnostic questions for the new risk where relevant
6. **`evals/evals.json`** — add a scenario (see §3 for format). `npm run evals` fails until the new code has at least one positive scenario.

Nothing else needs widening: the risk-code regexes in `eval-utils.mjs`,
`report-parse.mjs`, and `benchmark.mjs` are all derived from steps 3 and 4, not
spelled out — a hardcoded `[RT][1-6]` range used to drop new codes silently.

## Local Testing

```bash
npm run validate     # version sync across manifests/docs, hook JSON, risk-code consistency
npm test             # unit tests for the validator helpers
npm run evals        # eval structural validation
npm run benchmark    # parser fidelity against the frozen corpus

bash hooks/session-start                        # local branch
CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start   # Claude Code platform install path
```

The hook should print a JSON object with an `additionalContext` or `hookSpecificOutput` key.

To test the skill itself, copy the *contents* of `skills/` — `cp -r skills/ <dest>` would nest a
second `skills/` inside an existing destination and `../_shared/` would stop resolving:

```bash
mkdir -p ~/.claude/skills/brooks-lint
cp -r skills/* ~/.claude/skills/brooks-lint/
```

Then run any of `/brooks-review`, `/brooks-audit`, `/brooks-debt`, `/brooks-test`,
`/brooks-health`, `/brooks-sweep` (or their `/brooks-lint:`-prefixed full forms).

## PR Conventions

- Run `/brooks-review` on your own diff before opening a PR, and paste the Health Score and any
  Critical findings into the description. (Yes, we review our own contributions with the tool
  we're building.)
- Keep PRs focused — one decay-risk improvement or one eval addition per PR.
- If you're making a judgment call (e.g. moving a severity threshold from 🟡 to 🔴), explain the
  reasoning in the PR description.

## Code of Conduct

Be excellent to each other.
