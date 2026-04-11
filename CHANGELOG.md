# Changelog

All notable changes to brooks-lint are documented here.

## [Unreleased]

### Added

- **12-book source coverage matrix** — `skills/_shared/source-coverage.md` now maps every source book to encoded concepts, important nuances, false-positive guards, and review questions.
- **Judgment guardrails in shared risk references** — `decay-risks.md` and `test-decay-risks.md` now include explicit "What Not to Flag" sections to reduce template-driven over-reporting.
- **Benchmark suite expanded to 43 scenarios** — added tradeoff and false-positive cases covering deep modules, Hyrum's Law, justified protocol switches, composition roots, acceptable transaction scripts, and risk-shaped legacy test portfolios.

### Changed

- **All four skills now read the source coverage matrix** before risk-specific references, making book-level scope and exceptions part of the default workflow.
- **README, AGENTS.md, and CONTRIBUTING.md** now document the source coverage matrix and the expanded benchmark suite.

---

## [0.8.3] - 2026-04-11

### Fixed

- **Version drift removed** — `README.md`, `CHANGELOG.md`, and `hooks/session-start` now align
  with package version `0.8.2`. The session-start hook no longer hardcodes a version string;
  it reads from `package.json` before computing the wrapper sentinel path.
- **Config examples corrected** — all coverage-related examples now point to `T5` (Coverage
  Illusion) instead of `T3`, which is reserved for Test Duplication.
- **Security policy refreshed** — SECURITY.md now describes the repository as a multi-platform
  plugin/skill package and includes a concrete vulnerability reporting email.

### Added

- **Repository validation script** — `scripts/validate-repo.mjs` checks manifest/doc version
  sync, validates hook JSON output, verifies the latest changelog version, and catches
  risk-code example drift in config documentation.
- **CI consistency gate** — GitHub Actions now runs the repository validation script before the
  Codex plugin scanner.

### Changed

- **Release process documentation** — CLAUDE.md and CONTRIBUTING.md now document
  `package.json` as the canonical version source and point contributors to the validation script.

---

## [0.8.1] - 2026-04-09

### Fixed

- **Short-form slash commands now work** — `/brooks-review`, `/brooks-audit`, `/brooks-debt`,
  `/brooks-test` are auto-installed to `~/.claude/commands/` on first session start. Previously
  these commands were only registered as namespaced `/brooks-lint:brooks-review` etc., which is
  a Claude Code plugin system limitation (all plugin skills/commands carry a `pluginname:` prefix).
  The session-start hook now copies thin wrapper files from `commands/` to `~/.claude/commands/`,
  enabling the short-form `/brooks-review` slash commands without namespace prefix.
- **Versioned sentinel file** — command wrappers auto-refresh on plugin upgrade. The sentinel
  file at `~/.claude/commands/.brooks-lint-v{version}` encodes the plugin version, so upgrading
  from e.g. 0.8.1 to 0.8.2 will re-copy the wrappers automatically. Old sentinel files are
  cleaned up on upgrade.
- **macOS bash 3.2 compatibility** — replaced `declare -A` (bash 4+ only) with `case` statement
  in session-start hook. macOS ships `/bin/bash` 3.2 by default; the hook now works regardless
  of which bash version `env bash` resolves to.
- **Single source of truth for command wrappers** — the hook now copies canonical files from
  `commands/` directory instead of regenerating from an inline template, eliminating content drift
  between the two sources.

### Changed

- **`commands/*.md`** — simplified from verbose multi-paragraph instructions to thin one-line
  wrappers that delegate to the corresponding `brooks-lint:brooks-*` plugin skill via the Skill
  tool. This matches what the hook installs to `~/.claude/commands/`.
- **`hooks/session-start`** — added auto-install block with versioned sentinel, `case` statement
  for descriptions, and `cp` from `commands/` directory. Context injection updated to show
  namespaced skill names (`brooks-lint:brooks-review` etc.).
- **Documentation updated across 8 files** — CLAUDE.md, README.md, CONTRIBUTING.md, AGENTS.md,
  GEMINI.md, and pr-review-guide.md all updated to reflect both command forms (short-form
  `/brooks-review` and full-form `/brooks-lint:brooks-review`). README slash commands table now
  shows both forms with a note about auto-installation.
- **README version badge** updated to 0.8.1
- **All five version files** synchronized to 0.8.1

---

## [0.8.0] - 2026-04-09

### Changed

- **Independent skill architecture** — split monolithic `skills/brooks-lint/` into four
  independent skill directories, each with its own `SKILL.md` entry point:
  - `skills/brooks-review/` — PR Review (Mode 1)
  - `skills/brooks-audit/` — Architecture Audit (Mode 2)
  - `skills/brooks-debt/` — Tech Debt Assessment (Mode 3)
  - `skills/brooks-test/` — Test Quality Review (Mode 4)
- **Shared framework extracted** — `skills/_shared/` now holds `common.md` (Iron Law, Project
  Config, Report Template, Health Score), `decay-risks.md`, and `test-decay-risks.md`. Each
  skill's SKILL.md references these shared files via relative paths.
- **`common.md` created** — consolidated the Iron Law, Project Config loader, Report Template,
  and Health Score rules (previously embedded in the monolithic SKILL.md) into a single shared
  file that all four skills reference.

### Removed

- `skills/brooks-lint/` — the monolithic skill directory. All content migrated to the four
  independent skill directories and `_shared/`.

---

## [0.7.0] - 2026-04-09

### Added

- **`.brooks-lint.yaml` project config** — teams can customize review behavior per-project:
  `disable` (skip risk codes), `severity` (override tiers), `ignore` (file globs), `focus`
  (evaluate only listed risks). Includes `.brooks-lint.example.yaml` template.
- **Mode 2 proactive context** — Architecture Audit (Step 0) now scans the codebase
  automatically before analysis, gathering module structure, dependency patterns, and
  configuration files without requiring the user to paste code.
- **10-book expansion** — added four new source books to the framework:
  - *A Philosophy of Software Design* (Ousterhout) — contributes to R1, R4
  - *Software Engineering at Google* (Winters et al.) — contributes to R2, R5
  - *Working Effectively with Legacy Code* (Feathers) — contributes to T4, T5, T6
  - *xUnit Test Patterns* (Meszaros) — contributes to T1, T2, T3, T4
- **CI quality gate** — Codex plugin scanner workflow (GitHub Actions) for manifest linting
- **Community health files** — SECURITY.md, issue templates, PR template, GitHub Discussions

### Changed

- README: updated from "six books" to "ten books" throughout, expanded book table, refreshed
  decay risk source attributions
- All version references synchronized to 0.7.0

---

## [0.6.2] - 2026-04-03

### Added

- **Language matching** — report output now matches the user's conversation language
- **Eval benchmark suite expanded to 37 scenarios** — all 12 decay risks (6 production + 6 test)
  across Python, TypeScript, Go, and Java at Critical / Warning / Clean severity levels
- **Gallery page** (`docs/gallery.md`) — 7 curated real brooks-lint outputs organized by Mode,
  including Mermaid dependency graphs for Architecture Audit
- **README:** added "See More Examples" section with link to gallery page

### Changed

- **CLAUDE.md:** added Multi-Platform Support, Eval Suite, and Development Commands sections;
  refreshed directory tree and Roadmap

---

## [0.6.1] - 2026-04-01

### Added

- **Codex CLI support** — brooks-lint now works as a Codex CLI plugin
  - `.codex-plugin/plugin.json`: Plugin manifest for Codex CLI
  - `AGENTS.md`: Project instructions file for Codex CLI sessions
  - README updated with triple-platform installation and usage docs

---

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
