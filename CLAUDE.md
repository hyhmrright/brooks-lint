# CLAUDE.md

Guidance for Claude Code when modifying this repository. For repo layout, install steps, and user-facing usage, see `README.md` — this file covers only what's needed to safely *change* the repo.

## What This Repo Is

**brooks-lint** is a Claude Code Plugin for code-quality diagnosis grounded in twelve classic software engineering books. Five independent skills under `skills/` (PR Review, Architecture Audit, Tech Debt, Test Quality, Health Dashboard) each produce findings in the Iron Law form: **Symptom → Source → Consequence → Remedy**.

## Workflow Conventions

- **Direct-to-main workflow:** Pushes go to `main` without a PR. After Edit/Write, the global rule's `simplify` + `pr-review-toolkit:code-reviewer` reviews still run before commit; only the optional PR-only `code-review:code-review` step is skipped.
- **Doc sources of truth:** `package.json` is canonical for version; book inventory is canonical in `skills/_shared/source-coverage.md` (see Gotchas for derivation). README.md, AGENTS.md, GEMINI.md, and CHANGELOG.md must stay in sync — `npm run validate` enforces this.
- **VS Code extension is OUT OF SCOPE.** Do not plan, propose, or reference VS Code extension features.

## Critical Gotchas

- **Skill sync after edit:** `skills/` (this repo) and the installed copy (`~/.claude/plugins/cache/.../skills/` or `~/.claude/skills/brooks-lint/`) are independent. For local testing of unsubmitted edits: `cp -r skills/* ~/.claude/skills/brooks-lint/`. To refresh the marketplace install after pushing: `/plugin marketplace update` then `/plugin install brooks-lint@brooks-lint-marketplace`.
- **`_shared/` is not a skill:** It holds shared framework files (Iron Law, Report Template, decay-risk definitions). Skills must explicitly read these via the Read tool — they are NOT auto-loaded. Claude Code ignores directories without `SKILL.md`.
- **SKILL.md Process vs guide steps:** Convention — `SKILL.md` Process provides a high-level skeleton (3–6 items) that cites the guide's step ranges inline, e.g. `Scan decay risks (Steps 1–7 of the guide)`. The guide owns the detailed numbered steps. The two do NOT need to match 1:1 — the skeleton is for orientation, the guide for execution. `npm run validate` enforces guide step continuity (no gaps, no duplicates; sub-steps like `Step 2a`, `Step 6b` are allowed) and SKILL.md Process-section presence. When renaming or renumbering guide steps, update any Step range citations in the SKILL.md Process.
- **SKILL.md trigger descriptions:** Every `description:` field MUST include a "Do NOT trigger for:" clause. Without it, false triggering occurs (e.g. `brooks-debt` firing on HTTP `/health` questions).
- **Book count is derived, never hardcoded:** `validate-repo.mjs` reads `source-coverage.md` frontmatter and derives `sourceCount` from it. Adding a book = update the frontmatter list + add the corresponding section; the validator auto-adapts.
- **`package.json` is ESM:** `"type": "module"` enables ESM for everything in `scripts/`. Skills are plain markdown — no bundling.
- **Slash commands:** Plugin skills register as `/brooks-lint:brooks-review`. Short forms (`/brooks-review`) are auto-installed to `~/.claude/commands/` by the session-start hook — they are thin wrappers, not separate definitions.
- **GitHub Action cache:** `.github/actions/brooks-lint/action.yml` uses `actions/cache@v4` with built-in cache-hit guard — do NOT add a manual directory check.
- **Custom risks:** Teams add project-specific risk codes via `custom-risks-guide.md` in their project root. Template lives at `skills/_shared/custom-risks-guide.md`.

## How the Skills Work

1. `hooks/session-start` injects a brief skill list into every session
2. Triggered skill loads its `SKILL.md` via the Skill tool
3. `SKILL.md` instructs Claude to read `_shared/common.md` (Iron Law, Config, Report Template)
4. Claude reads the mode-specific guide + relevant decay-risks file
5. Findings follow the Iron Law: **Symptom → Source → Consequence → Remedy**
6. Output uses the standard report template with Health Score (base 100; deductions per finding, floor 0)

## Eval Suite

`evals/evals.json` contains 49 benchmark scenarios covering R1–R6 (code decay) and T1–T6 (test decay), including false-positive / tradeoff cases that must NOT be flagged. Each scenario has `id`, `name`, `prompt`, `expected_output`, `mode`, `files`. Optional flags (mutually exclusive): `no_risk_codes: true` (no risk codes expected in output) or `no_health_score: true` (Health Score suppression test).

To add a scenario: append to the `evals` array with the next sequential `id` and the relevant risk code. Validate structure with `npm run evals`; live-test with `npm run evals:live` (requires `ANTHROPIC_API_KEY`).

## Development Commands

```bash
npm run validate          # Repo consistency: manifests, README badge, changelog, source inventory, skills structure
npm test                  # Unit tests for validate-repo helpers
npm run evals             # Eval structural validation (IDs, fields, risk-code refs)
npm run evals:live        # Live evals against the AI (requires ANTHROPIC_API_KEY)
npm run history           # View Health Score trend (.brooks-lint-history.json)

# Test hooks locally
bash hooks/session-start                        # local branch
CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start   # plugin platform branch
```

## Release Process

Bump `package.json` version → add `## [X.Y.Z] - YYYY-MM-DD` to `CHANGELOG.md` → `npm run validate` (catches drift across manifests, README badge, changelog) → commit, push, tag GitHub release.
