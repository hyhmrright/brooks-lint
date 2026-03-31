# Changelog

All notable changes to brooks-lint are documented here.

## [0.6.0] - 2026-03-31

### Added

- **Mermaid Dependency Graph in Architecture Audit (Mode 2)** — the plain-text ASCII
  dependency map is replaced with a Mermaid diagram that renders as a visual graph
  in GitHub, VS Code, Notion, and other Markdown environments
- Node color coding by severity: red (Critical), yellow (Warning), green (clean)
- Automatic grouping by project folder structure using Mermaid subgraphs
- Circular dependencies visually marked with dotted labeled edges
- Graph appears at the top of the audit report for immediate architectural overview

### Changed

- `architecture-guide.md`: Step 1 now produces Mermaid syntax instead of ASCII arrows;
  added color scheme reference, node limit constraint (~50), and rendering order note
- `SKILL.md`: Mode 2 steps updated (7 steps, up from 6); Report Template includes
  "Module Dependency Graph" section for Mode 2
- All version references bumped to 0.6.0

---

## [0.5.2] - 2026-03-31

### Added

- **Gemini CLI support** — brooks-lint now works as a Gemini CLI extension
  - `GEMINI.md`: Project guidance file for Gemini CLI sessions
  - `gemini-extension.json`: Extension manifest for `/extensions install`
  - README updated with dual-platform installation, slash commands, and usage docs

### Changed

- README: Claude Code restored as recommended install method; Gemini CLI listed as secondary
- README: Usage sections unified with inline dual-platform command examples
- All version references synchronized to 0.5.2

---

## [0.5.0] - 2026-03-28

### Added

- **Mode 4: Test Quality Review** — new dedicated mode for diagnosing test suite health,
  triggered by `/brooks-lint:brooks-test` or automatically when test files are shared
- `test-decay-risks.md`: Six test-space decay risks mirroring the six production decay risks,
  sourced from four classic testing books:
  - T1: Test Obscurity (Meszaros — Assertion Roulette, Mystery Guest)
  - T2: Test Brittleness (Meszaros — Eager Test; Osherove — isolation principle)
  - T3: Test Duplication (Meszaros — Lazy Test; Hunt & Thomas — DRY)
  - T4: Mock Abuse (Osherove — mock guidelines; Meszaros — Hard-Coded Test Data)
  - T5: Coverage Illusion (Feathers — "legacy code = no tests"; Google — coverage strategy)
  - T6: Architecture Mismatch (Google — 70:20:10 pyramid; Feathers — Seam Model)
- `test-guide.md`: Mode 4 five-step analysis process with test suite map
- `commands/brooks-test.md`: `/brooks-lint:brooks-test` slash command
- **PR Review Step 7: Quick Test Check** — lightweight three-signal test scan appended
  to every Mode 1 review (Coverage Illusion, Mock Abuse, Test Obscurity signals)

### Changed

- `SKILL.md`: Added Mode 4 to mode detection table, trigger words, slash command list,
  and Reference Files table
- `pr-review-guide.md`: Added Step 7 Quick Test Check; updated "six steps" → "seven steps"
- `CLAUDE.md`: Updated architecture description, directory tree, "How the skill works"
  steps, and Roadmap to reflect v0.5 state

### Source Books Added (Test Quality Framework)

- Gerard Meszaros — *xUnit Test Patterns* (2007)
- Roy Osherove — *The Art of Unit Testing* (2009, 3rd ed. 2023)
- Google Engineering — *How Google Tests Software* (2012)
- Michael Feathers — *Working Effectively with Legacy Code* (2004)

---

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
