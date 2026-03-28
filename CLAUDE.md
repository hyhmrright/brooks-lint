# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**brooks-lint** is a Claude Code Plugin for code quality diagnosis using principles from six classic software engineering books. It surfaces decay risks across three review modes (PR Review, Architecture Audit, Tech Debt Assessment) plus a dedicated Test Quality Review mode. The primary artifact is `skills/brooks-lint/SKILL.md` — the skill definition installed and used by Claude Code.

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
├── .claude-plugin/          # Plugin metadata for /plugin install
├── skills/brooks-lint/      # The skill itself
│   ├── SKILL.md             # Main skill — self-contained workflow + mode detection
│   ├── decay-risks.md       # Six decay risk definitions with symptoms + sources
│   ├── pr-review-guide.md   # Mode 1: PR review checklist (read when running Mode 1)
│   ├── architecture-guide.md# Mode 2: Architecture audit framework
│   ├── debt-guide.md        # Mode 3: Tech debt classification
│   ├── test-decay-risks.md  # Six test-space decay risks (read when running Mode 4)
│   └── test-guide.md        # Mode 4: Test quality review framework
├── hooks/                   # SessionStart hook for session-level awareness
└── commands/                # /brooks-review, /brooks-audit, /brooks-debt, /brooks-test
```

### How the skill works

1. `hooks/session-start` injects a brief note into every session: "brooks-lint is installed, use Skill tool to load it for code reviews"
2. When triggered, Claude loads `skills/brooks-lint/SKILL.md` via the Skill tool
3. SKILL.md detects the mode (PR Review / Architecture Audit / Tech Debt / Test Quality Review) from context
4. Claude reads the relevant guide file and `decay-risks.md` (or `test-decay-risks.md` for Mode 4)
5. Each finding follows the Iron Law: Symptom → Source → Consequence → Remedy
6. Output follows the standard report template with Health Score (base 100, deductions per finding)

## Development Gotchas

- **Hook testing:** Run directly to verify JSON output format:
  ```bash
  bash hooks/session-start                        # local branch
  CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start  # claude platform branch
  ```
- **Skill sync:** `skills/brooks-lint/` and the marketplace install path (`~/.claude/plugins/...`) are two independent copies — reinstall manually after edits.
- **package.json:** `"type": "module"` is a placeholder for the v0.3 JS/TS phase; no JS code currently exists, does not affect runtime.
- **Slash command namespace:** Use the `/brooks-lint:` prefix for all slash commands (e.g. `/brooks-lint:brooks-review`). Using `/brooks-review` alone will fail with "Unknown skill".

## Roadmap

- v0.5 ✅: Test Quality Review (Mode 4) — xUnit Test Patterns, Art of Unit Testing, Google Testing, WELC
- v0.6: Mermaid dependency graph output
- v0.7: GitHub Action
- v1.0: VS Code extension
