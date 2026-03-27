# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**brooks-lint** is a Claude Code Plugin that operationalizes insights from *The Mythical Man-Month* (Frederick Brooks) as an executable code quality review framework across eight scoring dimensions. The primary artifact is `skills/brooks-lint/SKILL.md` — the skill definition installed and used by Claude Code.

## Install

```bash
# Via plugin manager (recommended)
/plugin install hyhmrright/brooks-lint

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
│   ├── brooks-principles.md # Scoring rubrics for all 8 dimensions (read on demand)
│   ├── pr-review-guide.md   # Mode 1: PR review checklist (read when running Mode 1)
│   ├── architecture-guide.md# Mode 2: Architecture audit framework
│   └── debt-guide.md        # Mode 3: Tech debt classification
├── hooks/                   # SessionStart hook for session-level awareness
└── commands/                # /brooks-review, /brooks-audit, /brooks-debt
```

### How the skill works

1. `hooks/session-start` injects a brief note into every session: "brooks-lint is installed, use Skill tool to load it for code reviews"
2. When triggered, Claude loads `skills/brooks-lint/SKILL.md` via the Skill tool
3. SKILL.md detects the mode (PR Review / Architecture Audit / Tech Debt) from context
4. Claude reads the relevant guide file (`pr-review-guide.md`, `architecture-guide.md`, or `debt-guide.md`)
5. Claude scores across 8 Brooks dimensions using `brooks-principles.md` as the scoring rubric
6. Output follows the standard report template in SKILL.md

## Development Gotchas

- **Hook testing:** Run directly to verify JSON output format:
  ```bash
  bash hooks/session-start                        # local branch
  CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start  # claude platform branch
  ```
- **Skill sync:** `skills/brooks-lint/` and the marketplace install path (`~/.claude/plugins/...`) are two independent copies — reinstall manually after edits.
- **package.json:** `"type": "module"` is a placeholder for the v0.3 JS/TS phase; no JS code currently exists, does not affect runtime.
- **Slash command namespace:** Use the `/brooks-lint:` prefix for all slash commands (e.g. `/brooks-lint:brooks-review`). Using `/brooks-review` alone will fail with "Unknown skill".

## Roadmap (development notes)

- v0.3: Mermaid dependency graph output
- v0.4: Git history integration, track Brooks score trends over time
- v0.5: GitHub Action
- v1.0: VS Code extension
