# Changelog

All notable changes to brooks-lint are documented here.

## [0.2.0] - 2026-03-26

### Added
- `.claude-plugin/` infrastructure for marketplace installation (`/plugin install brooks-lint`)
- `hooks/session-start` — SessionStart hook that injects brooks-lint awareness into every Claude session
- `commands/brooks-review.md` — `/brooks-review` slash command for forced PR review mode
- `commands/brooks-audit.md` — `/brooks-audit` slash command for forced architecture audit mode
- `commands/brooks-debt.md` — `/brooks-debt` slash command for forced tech debt assessment mode
- `skills/brooks-lint/brooks-principles.md` — Scoring rubrics for all 7 Brooks dimensions
- `skills/brooks-lint/pr-review-guide.md` — Detailed PR review checklist (Mode 1)
- `skills/brooks-lint/architecture-guide.md` — Architecture audit framework with dependency graph template (Mode 2)
- `skills/brooks-lint/debt-guide.md` — 5-category tech debt classification framework (Mode 3)

### Changed
- `SKILL.md` moved from root to `skills/brooks-lint/SKILL.md` and fully rewritten
- Skill now follows superpowers mode-switch pattern with explicit mode detection
- Reference files reorganized from `references/` into `skills/brooks-lint/` and split by mode
- Skill is now fully prompt-driven (no external script dependencies)

### Removed
- `scripts/complexity_analyzer.py` — replaced by Claude's native analysis capability
- `references/` directory — content migrated to `skills/brooks-lint/`
- Root `SKILL.md` — replaced by `skills/brooks-lint/SKILL.md`

## [0.1.0] - 2026-03-26

### Added
- Initial release: SKILL.md, references/, scripts/complexity_analyzer.py, assets/logo.svg
