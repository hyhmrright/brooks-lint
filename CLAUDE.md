# CLAUDE.md

Guidance for Claude Code when modifying this repository. For repo layout, install steps, and user-facing usage, see `README.md` — this file covers only what's needed to safely *change* the repo.

## What This Repo Is

**brooks-lint** is a Claude Code Plugin for code-quality diagnosis grounded in twelve classic software engineering books. Six independent skills under `skills/` (PR Review, Architecture Audit, Tech Debt, Test Quality, Health Dashboard, Full Sweep) each produce findings in the Iron Law form: **Symptom → Source → Consequence → Remedy**.

## Harness: brooks-lint maintenance

**Goal:** drive changes *to brooks-lint itself* through a verified pipeline so manifests, evals, docs, and trigger boundaries never drift.

**Trigger:** when working ON the plugin — add/edit a skill or guide, refresh the eval suite, fix trigger descriptions, or cut a release — use the `brooks-harness` skill. It runs a sequential subagent pipeline (`.claude/agents/`): **skill-author → eval-curator → consistency-qa → trigger-boundary-auditor → release-manager**. Simple questions, or *using* the analysis skills on some target codebase, do not trigger it.

**Change history:**
| Date | Change | Target | Reason |
|------|--------|--------|--------|
| 2026-06-01 | Initial harness: 5-stage pipeline orchestrator + 4 new agents (skill-author, eval-curator, consistency-qa, release-manager), reusing trigger-boundary-auditor | `.claude/agents/`, `.claude/skills/brooks-harness/` | Pre-existing dev tools (new-skill, release, trigger-boundary-auditor) had no orchestrator wiring them together |

## Workflow Conventions

- **Direct-to-main workflow:** Pushes go to `main` without a PR. After Edit/Write, the global rule's `agent-skills:code-simplify` + `agent-skills:review` steps still run before commit; only the optional PR-only `code-review:code-review` step is skipped.
- **Doc sources of truth:** `package.json` is canonical for version; book inventory is canonical in `skills/_shared/source-coverage.md` (see Gotchas for derivation). README.md, AGENTS.md, GEMINI.md, and CHANGELOG.md must stay in sync — `npm run validate` enforces this.
- **VS Code extension is OUT OF SCOPE.** Do not plan, propose, or reference VS Code extension features.

## Critical Gotchas

- **Skill sync after edit:** `skills/` (this repo) and the installed copy (`~/.claude/plugins/cache/.../skills/` or `~/.claude/skills/brooks-lint/`) are independent. For local testing of unsubmitted edits: `cp -r skills/* ~/.claude/skills/brooks-lint/` (or symlink once — `ln -s "$PWD/skills" ~/.claude/skills/brooks-lint` — so edits are live with no re-copy; when the symlink is in place, skip the cp). To refresh the marketplace install after pushing: `/plugin marketplace update` then `/plugin install brooks-lint@brooks-lint-marketplace`.
- **`_shared/` is not a skill:** It holds shared framework files (Iron Law, Report Template, decay-risk definitions). Skills must explicitly read these via the Read tool — they are NOT auto-loaded. Claude Code ignores directories without `SKILL.md`.
- **SKILL.md Process vs guide steps:** Convention — `SKILL.md` Process provides a high-level skeleton (3–6 items) that cites the guide's step ranges inline, e.g. `Scan decay risks (Steps 1–7 of the guide)`. The guide owns the detailed numbered steps. The two do NOT need to match 1:1 — the skeleton is for orientation, the guide for execution. `npm run validate` enforces guide step continuity (no gaps, no duplicates; sub-steps like `Step 2a`, `Step 6b` are allowed) and SKILL.md Process-section presence. When renaming or renumbering guide steps, update any Step range citations in the SKILL.md Process.
- **SKILL.md trigger descriptions:** Every `description:` field MUST include a "Do NOT trigger for:" clause. Without it, false triggering occurs (e.g. `brooks-debt` firing on HTTP `/health` questions).
- **Book count is derived, never hardcoded:** `validate-repo.mjs` reads `source-coverage.md` frontmatter and derives `sourceCount` from it. Adding a book = update the frontmatter list + add the corresponding section; the validator auto-adapts.
- **`package.json` is ESM:** `"type": "module"` enables ESM for everything in `scripts/`. Skills are plain markdown — no bundling.
- **Slash commands:** Plugin skills register as `/brooks-lint:brooks-review`. Short forms (`/brooks-review`, `/brooks-audit`, `/brooks-debt`, `/brooks-test`, `/brooks-health`, `/brooks-sweep`) are auto-installed to `~/.claude/commands/` by the session-start hook — they are thin wrappers, not separate definitions.
- **GitHub Action cache:** `.github/actions/brooks-lint/action.yml` uses `actions/cache@v4` with built-in cache-hit guard — do NOT add a manual directory check.
- **Custom risks:** Teams add project-specific risk codes via `custom-risks-guide.md` in their project root. Template lives at `skills/_shared/custom-risks-guide.md`.

## How the Skills Work

1. `hooks/session-start` runs at session open: outputs a skill-list banner to the session context AND installs short-form command wrappers to `~/.claude/commands/`
2. Triggered skill loads its `SKILL.md` via the Skill tool
3. `SKILL.md` instructs Claude to read `_shared/common.md` (Iron Law, Config, Report Template)
4. Claude reads the mode-specific guide + relevant decay-risks file
5. Findings follow the Iron Law: **Symptom → Source → Consequence → Remedy**
6. Output uses the standard report template with Health Score (base 100; deductions per finding, floor 0)

## Adding a New Skill

Each skill is two files inside `skills/{name}/`:

- `SKILL.md` — frontmatter with `name`, `description` (must include "Do NOT trigger for:" clause), and a `Process` section (3–6 bullets citing guide step ranges)
- `{name}-guide.md` — sequentially numbered steps, no gaps; sub-steps like `Step 2a` are allowed

Checklist:
1. Create `skills/{name}/SKILL.md` and `skills/{name}/{name}-guide.md`
2. Add ≥1 happy-path eval scenario + ≥1 false-positive scenario (`no_risk_codes: true`) to `evals/evals.json`
3. Run `npm run validate` (structure + step continuity) and `npm run evals` (eval schema)
4. Test locally: `cp -r skills/* ~/.claude/skills/brooks-lint/` → trigger in a Claude session → verify output
5. Restore the marketplace version using the commands in the "Skill sync after edit" gotcha above

## Eval Suite

`evals/evals.json` contains 57 benchmark scenarios covering R1–R6 (code decay) and T1–T6 (test decay), including false-positive / tradeoff cases that must NOT be flagged. Each scenario has `id`, `name`, `prompt`, `expected_output`, `mode`, `files`. Optional flags (mutually exclusive): `no_risk_codes: true` (no risk codes expected in output) or `no_health_score: true` (Health Score suppression test).

To add a scenario: append to the `evals` array with the next sequential `id` and the relevant risk code. Validate structure with `npm run evals`; live-test with `npm run evals:live` (requires `ANTHROPIC_API_KEY`).

`expected_output` should describe the Iron Law finding (Symptom + risk code) and a Health Score range; it does NOT need to be verbatim — the evaluator matches semantics. For false-positive / tradeoff scenarios, set `no_risk_codes: true` and describe what must NOT appear in output.

## Parser-Fidelity Benchmark

`evals/benchmark-corpus.json` is a FROZEN corpus of 30 real, model-generated reports (one per curated sample, across all six modes) each paired with an independently-graded finding inventory. `scripts/benchmark.mjs` (`npm run benchmark`) runs the shipped parser (`report-parse.mjs` / `sarif.mjs`) against it and reports severity-count fidelity, risk-code precision/recall, and SARIF validity; `npm test` guards the same as a deterministic regression. This is distinct from the eval suite: it benchmarks the **parser/SARIF plumbing**, not model judgment. The corpus is a frozen artifact — regenerate it only by re-running the generation workflow and hand-checking the new ground truth; do NOT hand-edit `report` or `truth` to make a failing parser pass.

## Development Commands

```bash
npm run bump              # Propagate the package.json version to all manifests + README badge (NOT changelog)
npm run validate          # Repo consistency: manifests, README badge, changelog, source inventory, skills structure
npm test                  # Unit tests for validate-repo helpers
npm run evals             # Eval structural validation (IDs, fields, risk-code refs)
npm run evals:live        # Live evals against the AI (requires ANTHROPIC_API_KEY)
npm run benchmark         # Parser-fidelity benchmark on the frozen real-report corpus
npm run history           # View Health Score trend (.brooks-lint-history.json)

# Test hooks locally
bash hooks/session-start                        # local branch
CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start   # plugin platform branch
```

## Release Process

Set the new version in `package.json` (e.g. `npm version <v> --no-git-tag-version`), then `npm run bump` (propagates the version to all manifests + README badge) → add the new `CHANGELOG.md` section by hand → `npm run validate` → commit, push, tag GitHub release.
