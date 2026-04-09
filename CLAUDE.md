# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**brooks-lint** is a Claude Code Plugin for code quality diagnosis using principles from ten classic software engineering books. It surfaces decay risks across four review modes (PR Review, Architecture Audit, Tech Debt Assessment, Test Quality Review). Each mode is an independent skill under `skills/` — installed and used by Claude Code.

## Install

```bash
# Via plugin marketplace (recommended)
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace

# Manual
cp -r skills/ ~/.claude/skills/brooks-lint
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
├── commands/                # /brooks-review, /brooks-audit, /brooks-debt, /brooks-test
├── evals/                   # Benchmark suite (37 scenarios across 4 modes)
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

brooks-lint runs on three AI coding platforms: Claude Code, Codex CLI, and Gemini CLI. Each has its own plugin manifest and project instructions file (see Structure above). When updating metadata (version, description), sync across all three.

## Eval Suite

`evals/evals.json` contains 37 benchmark scenarios covering R1-R6 (code decay) and T1-T6 (test decay). Each scenario is a JSON object with input context and expected findings. To add a scenario, append to the `evals` array with the next sequential `id` and the relevant risk code.

There is no automated runner — evals are validated manually by running the skill against the scenario's input and comparing output to `expected_output`. Each eval has `id`, `name`, `prompt`, `expected_output`, and `files` fields.

## Development Commands

```bash
# Test hooks locally
bash hooks/session-start                        # local branch
CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start   # plugin platform branch

# Run the skills in Claude Code
/brooks-review    # PR review
/brooks-audit     # Architecture audit
/brooks-debt      # Tech debt assessment
/brooks-test      # Test quality review
```

## Development Gotchas

- **Skill sync:** `skills/` and the marketplace install path (`~/.claude/plugins/...`) are two independent copies — reinstall manually after edits.
- **package.json:** `"type": "module"` is a placeholder for the v0.3 JS/TS phase; no JS code currently exists, does not affect runtime.
- **Slash commands:** Each skill registers as a short-form command (`/brooks-review`, `/brooks-audit`, `/brooks-debt`, `/brooks-test`).
- **`_shared/` convention:** `skills/_shared/` holds common framework files (Iron Law, Report Template, decay risk definitions). It is NOT a skill directory — Claude Code ignores directories without `SKILL.md` when registering commands.
- **Version sync:** Update version in all five files when bumping:
  1. `package.json`
  2. `.claude-plugin/plugin.json`
  3. `.claude-plugin/marketplace.json`
  4. `.codex-plugin/plugin.json`
  5. `gemini-extension.json`

