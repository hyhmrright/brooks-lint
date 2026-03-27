# Changelog

All notable changes to brooks-lint are documented here.

## [0.4.0] - 2026-03-27

### Documentation & Benchmark
- **README:** Full rewrite with persuasion-funnel structure — benchmark data (94% vs 16%),
  real eval output showcase, four-column comparison table (vs ESLint/Copilot/Plain Claude)
- **CONTRIBUTING.md:** New file — three contribution paths, local testing guide, PR conventions
- **evals/evals.json:** Benchmark test suite added to repository (3 real-world scenarios)

### Changed
- **Framework redesign:** Replaced eight Brooks-only scoring dimensions with six cross-book
  decay risk dimensions synthesized from six classic engineering books
- **Behavioral model:** Replaced dimension scoring (1–5) with diagnosis chain
  (Symptom → Source → Consequence → Remedy) and severity labels (🔴/🟡/🟢)
- **Health score:** Replaced weighted average of dimension scores with deduction-based score
  (100 − 15×Critical − 5×Warning − 1×Suggestion)
- **SKILL.md:** Rewrote entry point with strengthened Iron Law and new report template
- **pr-review-guide.md:** Rewrote with six-risk scan process ordered by PR-relevance
- **architecture-guide.md:** Rewrote with six-risk audit process + Conway's Law check
- **debt-guide.md:** Rewrote with Pain×Spread priority formula and Debt Summary Table
- **commands/\*.md:** Updated descriptions to reference six-book framework

### Added
- `decay-risks.md`: New core knowledge file — six decay risks with full symptom lists,
  source attributions for all six books, and severity guides
- Six new source books: Code Complete (McConnell), Refactoring (Fowler),
  Clean Architecture (Martin), The Pragmatic Programmer (Hunt & Thomas),
  Domain-Driven Design (Evans)

### Removed
- `brooks-principles.md`: Replaced by `decay-risks.md`
- Eight-dimension scoring table from output format

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
