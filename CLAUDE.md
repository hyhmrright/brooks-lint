# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**brooks-lint** is a Claude Code Plugin for code quality diagnosis using principles from ten classic software engineering books. It surfaces decay risks across four review modes (PR Review, Architecture Audit, Tech Debt Assessment, Test Quality Review). The primary artifact is `skills/brooks-lint/SKILL.md` — the skill definition installed and used by Claude Code.

## Install

```bash
# Via plugin marketplace (recommended)
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace

# Manual
cp -r skills/brooks-lint/ ~/.claude/skills/brooks-lint
```

## Architecture

### Structure

```
brooks-lint/
├── .claude-plugin/          # Claude Code plugin metadata
├── .codex-plugin/           # Codex CLI plugin metadata
├── skills/brooks-lint/      # The skill itself
│   ├── SKILL.md             # Main skill — self-contained workflow + mode detection
│   ├── decay-risks.md       # Six decay risk definitions with symptoms + sources
│   ├── pr-review-guide.md   # Mode 1: PR review checklist (read when running Mode 1)
│   ├── architecture-guide.md # Mode 2: Architecture audit framework
│   ├── debt-guide.md        # Mode 3: Tech debt classification
│   ├── test-decay-risks.md  # Six test-space decay risks (read when running Mode 4)
│   └── test-guide.md        # Mode 4: Test quality review framework
├── hooks/                   # SessionStart hook for session-level awareness
├── commands/                # /brooks-review, /brooks-audit, /brooks-debt, /brooks-test
├── evals/                   # Benchmark suite (37 scenarios across 4 modes)
├── docs/                    # Gallery, design specs, and plans
├── AGENTS.md                # Codex CLI project instructions
├── GEMINI.md                # Gemini CLI project instructions
└── gemini-extension.json    # Gemini CLI extension manifest
```

### How the skill works

1. `hooks/session-start` injects a brief note into every session: "brooks-lint is installed, use Skill tool to load it for code reviews"
2. When triggered, Claude loads `skills/brooks-lint/SKILL.md` via the Skill tool
3. SKILL.md checks for a `.brooks-lint.yaml` config file in the project root and applies it
4. SKILL.md detects the mode (PR Review / Architecture Audit / Tech Debt / Test Quality Review) from context
5. Claude reads the relevant guide file and `decay-risks.md` (or `test-decay-risks.md` for Mode 4)
6. Each finding follows the Iron Law: Symptom → Source → Consequence → Remedy
7. Output follows the standard report template with Health Score (base 100, deductions per finding)

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

## Development Commands

```bash
# Test hooks locally
bash hooks/session-start                        # local branch
CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start   # plugin platform branch

# Run the skill in Claude Code
/brooks-lint:brooks-review    # PR review
/brooks-lint:brooks-audit     # Architecture audit
/brooks-lint:brooks-debt      # Tech debt assessment
/brooks-lint:brooks-test      # Test quality review
```

## Development Gotchas

- **Skill sync:** `skills/brooks-lint/` and the marketplace install path (`~/.claude/plugins/...`) are two independent copies — reinstall manually after edits.
- **package.json:** `"type": "module"` is a placeholder for the v0.3 JS/TS phase; no JS code currently exists, does not affect runtime.
- **Slash command namespace:** Must use the `/brooks-lint:` prefix (see examples in Development Commands above). Bare `/brooks-review` will fail.
- **Version sync:** Version string is duplicated across `package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`, and `gemini-extension.json` — update all five when bumping.

## Roadmap

- v0.5 ✅: Test Quality Review (Mode 4)
- v0.6 ✅: Mermaid dependency graph, Codex CLI support, eval suite (37 scenarios), gallery
- v0.7 ✅: `.brooks-lint.yaml` project config, Mode 2 proactive codebase context gathering
- v0.8: GitHub Action
- v1.0: VS Code extension
