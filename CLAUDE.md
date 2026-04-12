# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**brooks-lint** is a Claude Code Plugin for code quality diagnosis using principles from twelve classic software engineering books. It surfaces decay risks across four review modes (PR Review, Architecture Audit, Tech Debt Assessment, Test Quality Review). Each mode is an independent skill under `skills/` — installed and used by Claude Code.

## Install

```bash
# Via plugin marketplace (recommended)
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace

# Manual
cp -r skills/ ~/.claude/skills/brooks-lint

# Short-form commands (/brooks-review) are auto-installed by the session-start hook.
# To install manually: cp commands/*.md ~/.claude/commands/
```

## Architecture

### Structure

```
brooks-lint/
├── .claude-plugin/          # Claude Code plugin metadata
├── .codex-plugin/           # Codex CLI plugin metadata
├── skills/
│   ├── _shared/             # Shared framework files
│   │   ├── common.md        # Iron Law, Project Config, Report Template, Health Score
│   │   ├── source-coverage.md  # 12-book coverage matrix + false-positive guards
│   │   ├── decay-risks.md   # Six decay risk definitions with symptoms + sources
│   │   └── test-decay-risks.md  # Six test-space decay risks
│   ├── brooks-review/       # Mode 1: PR Review
│   │   ├── SKILL.md         # Skill entry point
│   │   └── pr-review-guide.md
│   ├── brooks-audit/        # Mode 2: Architecture Audit
│   │   ├── SKILL.md
│   │   └── architecture-guide.md
│   ├── brooks-debt/         # Mode 3: Tech Debt Assessment
│   │   ├── SKILL.md
│   │   └── debt-guide.md
│   └── brooks-test/         # Mode 4: Test Quality Review
│       ├── SKILL.md
│       └── test-guide.md
├── hooks/                   # SessionStart hook for session-level awareness
├── commands/                # Short-form command wrappers (auto-installed by hook, or manual copy)
├── evals/                   # Benchmark suite (43 scenarios across 4 modes)
├── scripts/                 # Repo tooling
│   ├── validate-repo.mjs    # Consistency CI gate (versions, descriptions, skills content)
│   ├── frontmatter.mjs      # Shared parseFrontmatterBooks() utility
│   ├── run-evals.mjs        # Eval structural validator (IDs, fields, risk code refs)
│   └── validate-repo.test.mjs  # Unit tests for parseFrontmatterBooks
├── docs/gallery.md          # Visual output examples (used for README/promotion)
├── AGENTS.md                # Codex CLI project instructions
├── GEMINI.md                # Gemini CLI project instructions
└── gemini-extension.json    # Gemini CLI extension manifest
```

### How the skills work

1. `hooks/session-start` injects a brief note into every session listing the four available skills
2. When triggered, Claude loads the appropriate skill's `SKILL.md` via the Skill tool
3. Each SKILL.md instructs Claude to read `_shared/common.md` for the Iron Law, Config, and Report Template
4. Claude reads the mode-specific guide and the relevant decay-risks file from `_shared/`
5. Each finding follows the Iron Law: Symptom → Source → Consequence → Remedy
6. Output follows the standard report template with Health Score (base 100, deductions per finding)

### Project Config (`.brooks-lint.yaml`)

Teams can place a `.brooks-lint.yaml` in their project root to customize review behavior:
- `disable` — skip specific risk codes (e.g. `T3` for projects without coverage requirements)
- `severity` — override severity tier for a risk (e.g. downgrade `R1` to `suggestion`)
- `ignore` — glob patterns for files to exclude (e.g. `**/vendor/**`)
- `focus` — evaluate only listed risks

Copy `.brooks-lint.example.yaml` from this repo as a starting template.

## Multi-Platform Support

brooks-lint runs on three AI coding platforms: Claude Code, Codex CLI, and Gemini CLI. Each has its own plugin manifest and project instructions file (see Structure above). `package.json` is the canonical version source; manifests and docs must stay in sync with it.

## Eval Suite

`evals/evals.json` contains 43 benchmark scenarios covering R1-R6 (code decay) and T1-T6 (test decay), including false-positive / tradeoff cases that must NOT be flagged. Each scenario is a JSON object with input context and expected findings. To add a scenario, append to the `evals` array with the next sequential `id` and the relevant risk code. Each eval has `id`, `name`, `prompt`, `expected_output`, and `files` fields.

`scripts/run-evals.mjs` validates the structural integrity of evals.json (sequential IDs, required fields, risk code references) — run it with `npm run evals`. Full skill-execution testing (verifying AI output matches `expected_output`) remains manual: run the skill against the scenario's prompt and compare output.

## Development Commands

```bash
# Validate repo consistency (manifests, README, changelog, source inventory, skills structure)
npm run validate          # or: node scripts/validate-repo.mjs

# Unit tests for validate-repo.mjs helper functions
npm test                  # or: node scripts/validate-repo.test.mjs

# Validate eval suite structural integrity (IDs, required fields, risk code refs)
npm run evals             # or: node scripts/run-evals.mjs

# Test hooks locally
bash hooks/session-start                        # local branch
CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start   # plugin platform branch

# Run the skills in Claude Code (short form auto-installed by session-start hook)
/brooks-review    # Short form (or /brooks-lint:brooks-review)
/brooks-audit     # Short form (or /brooks-lint:brooks-audit)
/brooks-debt      # Short form (or /brooks-lint:brooks-debt)
/brooks-test      # Short form (or /brooks-lint:brooks-test)
```

## Release Process

1. Bump version in `package.json`
2. Add `## [X.Y.Z] - YYYY-MM-DD` section to `CHANGELOG.md`
3. `npm run validate` — confirms all manifests, README badge, and changelog are in sync
4. Commit, push, create GitHub release tag

`validate-repo.mjs` will catch any version drift between `package.json`, manifests,
and the changelog before you push.

## Development Gotchas

- **Skill sync:** `skills/` and the marketplace install path (`~/.claude/plugins/...`) are two independent copies — reinstall manually after edits.
- **package.json:** `"type": "module"` enables ESM for the scripts in `scripts/` (validate-repo.mjs, frontmatter.mjs, run-evals.mjs, validate-repo.test.mjs). Skills themselves are plain markdown — no bundling needed.
- **Slash commands:** Plugin skills register as namespaced commands (`/brooks-lint:brooks-review`). Short-form commands (`/brooks-review`) are auto-installed to `~/.claude/commands/` by the session-start hook. These are thin wrappers that delegate to the plugin skills.
- **`_shared/` convention:** `skills/_shared/` holds common framework files (Iron Law, Report Template, decay risk definitions). It is NOT a skill directory — Claude Code ignores directories without `SKILL.md` when registering commands.
- **Version sync:** `package.json` is the canonical version source. `hooks/session-start` reads it dynamically; `validate-repo.mjs` checks all manifests, the README badge, and the changelog for drift.
- **Book count source of truth:** `skills/_shared/source-coverage.md` frontmatter (`books:` list) is the canonical book inventory. `validate-repo.mjs` derives `sourceCount` and all word-based checks from it — do NOT hardcode the count elsewhere. To add a book: update the frontmatter list and add the corresponding section; the validator auto-adapts.
