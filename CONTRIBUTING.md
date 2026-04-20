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
| `skills/_shared/test-decay-risks.md` | Six test-space decay risks with book citations |

Better heuristics here mean better reviews for every user. If you find the skill
misses something important or produces a finding that's consistently wrong, the
fix is almost always in one of these files or in `skills/_shared/source-coverage.md`,
which captures book-level scope, exceptions, and tradeoffs.

### 3. Add an eval test case (most impactful)

The benchmark (94% pass rate) was produced by running the skill against test cases
in `evals/evals.json`. Adding a new test case that catches a real problem the
current skill misses is the highest-value contribution.

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

Use the next sequential `id` after the last entry in `evals/evals.json` (currently 49 scenarios). The `mode` field is required — use one of: `"review"`, `"audit"`, `"debt"`, `"test"`, `"health"`.

Optional flags for special scenarios:
- `"no_risk_codes": true` — for false-positive scenarios where no risk codes should appear in output
- `"no_health_score": true` — for scenarios testing Health Score suppression (e.g. onboarding mode)
- These two flags are mutually exclusive.

In your PR, show the before/after: what the skill produced before your change
and what it produces after. Even a screenshot or paste of the output is enough.

### 4. Adding a new decay risk (advanced)

Adding an entirely new risk category (e.g., R7 or T7) requires touching five places.
Run `npm run validate` after each step to confirm no drift:

1. **`skills/_shared/decay-risks.md`** or **`test-decay-risks.md`** — add the full risk definition (Diagnostic Question, Symptoms, Sources table, Severity Guide, What Not to Flag)
2. **`skills/_shared/source-coverage.md`** — add the new risk to the relevant book sections under "Encoded today"
3. **`validate-repo.mjs`** — increment `PRODUCTION_RISK_COUNT` or `TEST_RISK_COUNT`
4. **Mode guide(s)** (`pr-review-guide.md`, `architecture-guide.md`, `debt-guide.md`, `test-guide.md`) — add diagnostic questions for the new risk where relevant
5. **`evals/evals.json`** — add a scenario (see §3 for format)

## Local Testing

Run the repository consistency checks first:

```bash
node scripts/validate-repo.mjs
```

This verifies version sync across manifests/docs, hook JSON output, and risk-code consistency in config examples.

Verify the session-start hook produces valid JSON:

```bash
# Local branch
bash hooks/session-start

# Claude Code platform install path
CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start
```

Expected output: a JSON object with an `additionalContext` or `hookSpecificOutput` key.

To test the skill itself, install it into your Claude Code session:

```bash
cp -r skills/ ~/.claude/skills/brooks-lint
```

Then open Claude Code and run one of the slash commands:

```
/brooks-review                  # or /brooks-lint:brooks-review
/brooks-audit                   # or /brooks-lint:brooks-audit
/brooks-debt                    # or /brooks-lint:brooks-debt
/brooks-test                    # or /brooks-lint:brooks-test
/brooks-health                  # or /brooks-lint:brooks-health
```

## PR Conventions

- Run `/brooks-review` (or `/brooks-lint:brooks-review`) on your own diff before opening a PR.
  Paste the Health Score and any Critical findings into your PR description.
  (Yes, we review our own contributions with the tool we're building.)

- Keep PRs focused. One decay risk improvement or one eval addition per PR
  is easier to review than a batch of unrelated changes.

- If you're making a judgment call (e.g., changing a severity threshold from
  🟡 to 🔴), explain the reasoning in the PR description.

## Code of Conduct

Be excellent to each other.
