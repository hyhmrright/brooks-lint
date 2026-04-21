# Changelog

All notable changes to brooks-lint are documented here.

## [Unreleased]

---

## [1.0.1] - 2026-04-21

Documentation and consistency patch. No behavior or API changes — all skill logic is
unchanged. Existing users on v1.0.0 can upgrade at any time with no migration risk.

### Fixed

- **`README.md` Manual Install commands** — `cp -r skills/ ~/.claude/skills/brooks-lint`
  silently created a `brooks-lint/skills/` nested directory; fixed to
  `mkdir -p ~/.claude/skills/brooks-lint && cp -r skills/* ~/.claude/skills/brooks-lint/`.
  Same fix applied to the Gemini CLI Manual Install block.
- **`pr-review-guide.md` structural ordering** — the `## Output` section appeared
  *before* Step 7, leaving the Analysis Process non-contiguous. Step 7 is now the last
  analysis step and `## Output` follows.
- **`test-guide.md` Characterization Tests citation** — `Ch. 8` corrected to
  `Ch. 13: Characterization Tests` (matches `test-decay-risks.md:246` and Feathers'
  *Working Effectively with Legacy Code*).
- **`decay-risks.md` Risk 4 over-engineering source** — removed incorrect "Evils of
  Duplication (YAGNI corollary)" reference (Evils of Duplication is DRY, not YAGNI);
  replaced with `Topic 4: Good-Enough Software` from *The Pragmatic Programmer*.
- **`architecture-guide.md` Step 2 pointer** — circular-dependency instruction now cites
  the actual `-.->|circular|` Mermaid edge in the example, replacing the stale ⚠️ symbol
  that never appeared in the map.
- **`test-decay-risks.md` T6 source** — `Test suite design principles` (vague) tightened
  to Meszaros' `Slow Tests (p. 253)`; `test-guide.md` slow-suite source aligned to the
  same citation.
- **`GEMINI.md` fictional command** — `gemini skills reload` removed; replaced with
  `exit the Gemini CLI (/quit) and relaunch`. `GEMINI.md` and `AGENTS.md` both state
  `npm run evals` / `npm run evals:live` as the eval runners (was "No automated runner").
- **`common.md` Auto Scope Detection** — added the missing Health Dashboard branch;
  replaced the hard-coded `"PR Review Step 7"` reference with the named
  `"Quick Test Check"` step so step renumbering no longer rots the text.
- **`debt-guide.md` step numbering** — promoted `Step 2b: Classify Debt Intent` to
  `Step 3`, renumbered `Group by Decay Risk` to `Step 4`, and updated the
  `"three steps" -> "four steps"` preamble.
- **`CONTRIBUTING.md` structure** — `"Three Ways to Contribute"` -> `"Four Ways to
  Contribute"`; `Adding a new decay risk` promoted to numbered §4 and moved after
  §3 for logical difficulty progression (1→2→3→4); fixed broken list rendering
  where `"In your PR..."` was missing a blank line and rendered as a list-item
  continuation.
- **`.github/ISSUE_TEMPLATE/bug_report.md`** — added Health Dashboard to the
  `Review mode` options; replaced broken `cat ~/.claude/plugins/.../package.json`
  placeholder with `/plugin list` guidance.
- **`docs/gallery.md` self-contradictions** — `"Critical / Scheduled"` cell in the
  Debt Summary Table (a single-cell two-way classification that didn't fit the
  schema) now reads `"Mixed (1 Critical + 1 Scheduled)"`; `~9 minutes` / `~542 seconds`
  time references harmonized; preamble changed from "no manual editing" to
  "lightly abridged — some Consequence lines trimmed" for honesty.

### Changed

- **SKILL.md Process convention** — `SKILL.md` Process sections are now a high-level
  skeleton (3–6 items) that cites guide `Step` ranges inline (e.g. `Scan decay risks
  (Steps 1–7 of the guide)`) rather than mirroring the guide's full step list 1:1.
  The guide owns the detailed numbered steps; the skeleton is for orientation.
  Counts no longer need to match — `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md` all
  document the new rule. `npm run validate` still enforces guide step continuity
  (sub-steps like `2a`/`6b` allowed) and SKILL.md Process-section presence.
  All five `SKILL.md` Process sections updated to the new skeleton+citation format.
- **`commands/*.md` frontmatter** — all five short-form command wrappers now declare
  `allowed-tools: Skill`, so the command turn can only dispatch the skill (the skill
  itself has full tool access once invoked).
- **Typographic consistency** — unified `Pain × Spread` (Unicode × with spaces) across
  `debt/SKILL.md`, `health-guide.md`, `evals.json`, and `docs/gallery.md`; unified
  `Ch. X` chapter citations (with the ASCII space after the period) across
  `test-decay-risks.md`, `test-guide.md`, `architecture-guide.md`, and
  `pr-review-guide.md`.
- **`README.md` Roadmap** — added a "Current state" callout above the version-by-
  version history so early entries like "v0.3: Eight Brooks dimensions" and
  "v0.4: Six-book framework" aren't misread as the current feature set.
- **`health-guide.md` dashboard template** — added the `**Mode:** Health Dashboard`
  field and standard `---` section dividers to align with the report templates used
  by the other four skills.

---

## [1.0.0] - 2026-04-16

### Added

- **F9: Eval Automation** — live eval runner via Anthropic SDK:
  - New `scripts/run-evals-live.mjs`: executes all 49 benchmark scenarios against
    Claude API; classifies results as pass / partial / fail / false-positive-pass / error;
    reports per-risk accuracy (e.g., `R1: 6/7 (85%)`); shares `assembleSystemPrompt`
    with `ci-review.mjs` for consistent prompt assembly
  - Flags: `--id N`, `--risk R1`, `--mode review`, `--model claude-opus-4-6` for subset runs;
    system prompts are cached per mode to avoid re-reading files for each scenario
  - `evals/evals.json`: all 49 scenarios gain a `mode` field
    (`"review"` | `"audit"` | `"debt"` | `"test"` | `"health"`)
  - `scripts/run-evals.mjs`: `mode` added to `REQUIRED_FIELDS`; valid mode values enforced
  - `package.json`: `"evals:live"` script wired to `run-evals-live.mjs`
- **F10: Custom Decay Risk Extension** — `Cx` codes for project-specific risks:
  - New `skills/_shared/custom-risks-guide.md`: loading validation, scanning instructions,
    Iron Law integration (`Source: "[Project-defined risk] — <name>"`), and Health Score
    inclusion rules; custom findings appear under **### Project-Specific Risks**
  - `skills/_shared/common.md` Config section: one-line trigger to load
    `custom-risks-guide.md` when `custom_risks` map is present; Config Validation
    updated to accept `Cx` codes in `disable`, `focus`, and `severity`
  - `.brooks-lint.example.yaml`: commented `custom_risks` example with `C1` (Security
    Debt) and `C2` (Accessibility Debt) entries showing all required fields

### Changed

- **Skill descriptions** — all five `SKILL.md` descriptions now lead with purpose and
  concrete user trigger phrases instead of the book list; each includes a strengthened
  "Do NOT trigger for:" guardrail to prevent false activation
- **Eval classification flags** — replaced fragile name-substring detection with explicit
  boolean fields: `no_risk_codes: true` (18 false-positive scenarios) and
  `no_health_score: true` (2 boundary scenarios); the two flags are mutually exclusive
- **CLAUDE.md** — updated to reflect five skills (added `brooks-health`), corrected eval
  count (43 → 49), completed `scripts/` listing, added `brooks-health` dev command,
  documented GitHub Action, custom risks, and VS Code exclusion

### Fixed

- `gemini-extension.json` — added missing `brooks-health` skill and command entries;
  all four manifests now list five analysis modes
- Removed VS Code references from `README.md` (Mermaid render list);
  VS Code Extension marked out of scope in roadmap spec and `CLAUDE.md`

---

## [0.9.5] - 2026-04-16

### Added

- **F7: Team Onboarding Report** — `brooks-audit` now supports `--onboarding` mode:
  - New file `skills/brooks-audit/onboarding-guide.md` with a 6-step orientation process
    (territory map, reading-order dependency graph, conventions, danger zones, domain
    glossary, suggested first tasks)
  - Mermaid graph colored by reading order (blue = start, purple = next, gray = last)
    using a DISTINCT palette from the severity palette to avoid confusion
  - No Health Score or Iron Law format — this mode explains, not diagnoses
  - `brooks-audit/SKILL.md` updated: description includes onboarding triggers; Process
    section routes `--onboarding` requests to `onboarding-guide.md`
  - 2 new benchmark evals (IDs 48–49): one normal onboarding request, one boundary check
    verifying the absence of Health Score and Iron Law findings
- **F8: GitHub Action** — automated PR review via Anthropic SDK:
  - New `.github/actions/brooks-lint/action.yml`: composite action with `mode`,
    `anthropic-api-key`, `fail-below`, and `model` inputs; posts review as PR comment;
    outputs `score` for downstream steps
  - New `scripts/assemble-prompt.mjs`: shared utility that assembles the system prompt
    for any mode by concatenating `common.md`, `source-coverage.md`, the correct
    decay-risks files, and the mode-specific guide; shared with the future eval runner
  - New `scripts/ci-review.mjs`: CLI entry point for CI — reads git diff, assembles
    prompt, calls Claude API, outputs JSON `{ report, score, mode, scope, trend }`
  - New `docs/github-action-example.yml`: ready-to-copy workflow template
  - Trend integration: if `.brooks-lint-history.json` exists in the project root, the
    PR comment includes a delta line (e.g., "85 → 82 (−3) over last 3 runs")
  - `@anthropic-ai/sdk` added as devDependency; `evals:live` script placeholder added

---

## [0.9.4] - 2026-04-16

### Added

- **F6: `--fix` Remedy Mode (Phase 1)** — new `skills/_shared/remedy-guide.md`:
  - Actionable remedies with Target (file path + function), Action (specific refactoring),
    and Rationale fields
  - Fixability tiers: `[quick-fix]` (single-file mechanical), `[guided]` (design choice
    required), `[manual]` (cross-module, team discussion needed)
  - Fix Summary table appended to report when `--fix` is active
  - `common.md` updated with a one-line "## Remedy Mode" trigger
- **F5: Interactive Triage Mode** — `common.md` updated with "## Post-Report Triage" section:
  - Post-report workflow: accept / dismiss (suppress) / defer (suppress with expiry) / skip
  - Suppress entries auto-appended to `.brooks-lint.yaml` with required `reason` field
  - CI guard: triage is skipped in non-interactive/headless sessions
- **Config schema: `suppress` field** — `.brooks-lint.example.yaml` updated with commented
  suppress example including `risk`, `pattern`, `reason`, `date`, and `expires` fields
- Validator: added check that `.brooks-lint.example.yaml` includes a commented suppress example
- 2 new benchmark evals (IDs 46–47): `--fix` active (verify tier labels + Fix Summary) and
  `--fix` not active (verify normal behavior)

---

## [0.9.3] - 2026-04-16

### Added

- **F3: `/brooks-health` skill** — combined health dashboard across all four dimensions:
  - New `skills/brooks-health/` directory with `SKILL.md` and `health-guide.md`
  - Three-step process: lightweight scan (PR/Architecture/Debt/Test), weighted composite
    scoring (0.25/0.30/0.25/0.20 with dynamic redistribution when PR dimension skipped),
    and dashboard report with Mermaid dependency graph
  - `hooks/session-start` updated: "four" → "five independent skills"; `brooks-health`
    line added
  - New command wrapper `commands/brooks-health.md`
  - Validator: `brooks-health` added to `modes` and `guides` arrays in `checkSkillsContent()`
    and `checkStepAlignment()`
  - 2 new benchmark evals (IDs 44–45): healthy codebase (high composite score) and
    multi-problem codebase (multiple dimensions flagged)
- **F4: Health Score Trend Tracking** — new `scripts/history.mjs`:
  - `readHistory`, `appendHistory`, `getTrend` utility functions (exported; shared with CI)
  - `common.md` updated with "## History Tracking" section (append record after each run;
    display trend delta if prior runs exist for the same mode)
  - `.brooks-lint.example.yaml` updated with `.brooks-lint-history.json` gitignore comment
  - `package.json` scripts: added `"history"` entry
  - 10 unit tests added to `validate-repo.test.mjs` covering all three utility functions

---

## [0.9.2] - 2026-04-16

### Added

- **F1: Step Numbering Auto-Validation** — `validate-repo.mjs`:
  - `extractGuideStepLabels()` moved to `scripts/frontmatter.mjs` as a named export
    (shared between validator and tests)
  - `checkStepAlignment()` added: validates guide step sequences (no gaps, no duplicates,
    sequential main step numbers) and verifies each `SKILL.md` has a `## Process` section
    with at least one numbered item
  - `CLAUDE.md` gotcha updated: step numbering alignment is now automated via `npm run validate`
  - 7 unit tests added to `validate-repo.test.mjs` for `extractGuideStepLabels`
- **F2: Auto-Diff / Incremental Mode** — `skills/_shared/common.md`:
  - New "## Auto Scope Detection" section: git diff cascade (staged → unstaged →
    branch vs main → ask), incremental audit via `--since=<ref>`, co-located test
    file detection for test mode
  - All five `SKILL.md` Process sections updated with conditional auto-scope block
  - Scope line added to all report templates

---

## [0.9.1] - 2026-04-15

### Changed

- **Hyrum's Law and Orthogonality promoted to named symptoms** in R2 (Change Propagation):
  both are now explicit named bullet points in `decay-risks.md` instead of being buried
  in generic descriptions, making them easier to cite in findings.
- **PR Review guide deepened** (`pr-review-guide.md`):
  - Scope calibration table added: analysis depth now adapts to PR size (<50 / 50–300 / >300 lines)
  - Step 6 split into 6a (Dependency Disorder) and 6b (Domain Model Distortion) for independent scanning
  - Severity calibration reframed as a tiebreaker referencing per-risk guides in `decay-risks.md`
- **Architecture Audit guide deepened** (`architecture-guide.md`):
  - New Step 5: Testability Seam Assessment — scans for missing or collapsed seam boundaries
    using Feathers's Seam Model (Working Effectively with Legacy Code, Ch. 4)
  - Mermaid Phase A/B simplified to a linear instruction with an explicit post-Step-4 reminder
  - Conway's Law check (now Step 6) includes concrete calibration examples for all three severity tiers
- **Tech Debt Assessment guide deepened** (`debt-guide.md`):
  - Pain and Spread scores each have concrete calibration examples
  - New Step 2b: classify each finding as intentional vs accidental debt (Cunningham's original
    definition); Debt Summary Table gains an Intent column
- **Test Quality Review guide deepened** (`test-guide.md`):
  - Step 2 split into 2a (Test Brittleness) and 2b (Mock Abuse) with per-step severity thresholds;
    sampling instruction merged to a single pass to avoid reading test files twice
  - Characterization Test template added (Feathers, Ch. 8) with inline usage guidance
  - Test suite performance structured into three tiers: >10 min (Warning), >30 min or unknown (Critical)
- **Trigger descriptions improved** across all four `SKILL.md` files:
  - Natural-language triggers added (e.g., "tests keep breaking" instead of "over-mocking")
  - "Do NOT trigger for:" clauses added to every skill, fixing false triggering on HTTP health
    checks (`brooks-debt`), from-scratch code writing (`brooks-test`), and similar boundary cases
- **GEMINI.md corrected**: book count fixed from ten to twelve; eval count updated from 37 to 43;
  `source-coverage.md` added to Project Structure listing
- **AGENTS.md updated**: step numbering alignment and trigger description conventions documented
- **CLAUDE.md updated**: step numbering and trigger description conventions added to Gotchas;
  `simplify` skill name corrected (was `code-simplifier:code-simplifier`); pre-commit workflow
  revised — `code-review:code-review` now runs post-PR-creation only, `simplify` handles pre-commit

---

## [0.9.0] - 2026-04-12

### Added

- **Flag Arguments and Primitive Obsession** — two high-frequency Fowler smells now encoded
  in R1 (Cognitive Overload) with symptoms and source entries in the decay risk reference.
- **Information Leakage** (Ousterhout) — added as an R2 (Change Propagation) symptom:
  design decisions encoded in multiple modules create coupling even without explicit imports.
- **ISP violation** (Martin) — Interface Segregation Principle added as an R5 (Dependency
  Disorder) symptom: fat interfaces force callers to depend on methods they do not use.
- **LSP violation** (Martin) — Liskov Substitution Principle added as an R6 (Domain Model
  Distortion) symptom: subclasses that break their parent's behavioral contract.
- **Value Object vs Entity confusion** (Evans) — added to R6: value concepts given mutable
  identity instead of being treated as immutable, replaceable types.
- **Erratic Test / flaky test** (Meszaros) — added to T2 (Test Brittleness): tests producing
  non-deterministic results due to shared state, time dependence, or ordering assumptions.

### Changed

- **`source-coverage.md` "Encoded today" sections deepened** for all 12 books:
  - McConnell: defensive programming and error-handling discipline
  - Martin: ISP, LSP, SRP/OCP (previously only DIP/ADP/SDP/SAP)
  - Ousterhout: Information Leakage
  - Winters et al.: code sustainability and backward compatibility
  - Meszaros: Erratic Test
  - Fowler: Flag Arguments, Primitive Obsession
  - Evans: Entity vs Value Object, Aggregate Root
- **Risk description prose tightened** across all six production and six test decay risks
  (~15% token reduction with no loss of diagnostic content).
- **`CLAUDE.md`**: added Release Process section documenting the 4-step version bump workflow.

---

## [0.8.5] - 2026-04-12

### Changed

- **Single source of truth for book inventory** — `skills/_shared/source-coverage.md` now carries a YAML frontmatter `books:` list; `validate-repo.mjs` derives the count dynamically, eliminating Shotgun Surgery when adding new books.
- **Validation refactored into named check functions** — `scripts/validate-repo.mjs` reorganized from a flat script into 12 named category functions (`checkVersionConsistency`, `checkSkillsContent`, `checkEvalSuite`, etc.) for clarity and maintainability.
- **Named constants for risk counts** — `PRODUCTION_RISK_COUNT` and `TEST_RISK_COUNT` replace magic numbers in both `validate-repo.mjs` and `run-evals.mjs`; adding a new risk category requires updating one constant in each script.
- **Skills content CI** — validator now asserts every SKILL.md has `## Setup` and `## Process` sections, and every mode guide references the Iron Law.
- **Manifest description consistency** — validator checks all four plugin manifests have identical descriptions; fixed `gemini-extension.json` to match canonical.

### Added

- **`scripts/frontmatter.mjs`** — shared `parseFrontmatterBooks()` utility, importable without validator side effects.
- **`scripts/run-evals.mjs`** — structural validator for `evals/evals.json`: checks sequential IDs, required fields, and risk code presence in `expected_output`.
- **`scripts/validate-repo.test.mjs`** — 10 unit tests for `parseFrontmatterBooks` using Node.js built-in `assert`; runnable via `npm test`.
- **`npm run evals`** and **`npm test`** scripts in `package.json`.

---

## [0.8.4] - 2026-04-11

### Added

- **12-book source coverage matrix** — `skills/_shared/source-coverage.md` maps every source book to encoded concepts, important nuances, false-positive guards, and review questions.
- **Judgment guardrails in shared risk references** — `decay-risks.md` and `test-decay-risks.md` now include explicit "What Not to Flag" sections to reduce template-driven over-reporting.
- **Benchmark suite expanded to 43 scenarios** — added tradeoff and false-positive cases covering deep modules, Hyrum's Law, justified protocol switches, composition roots, acceptable transaction scripts, and risk-shaped legacy test portfolios.

### Changed

- **All four skills now read the source coverage matrix** before risk-specific references, making book-level scope and exceptions part of the default workflow.
- **README, AGENTS.md, CLAUDE.md, and CONTRIBUTING.md** now document the source coverage matrix and the expanded benchmark suite, and surface `node scripts/validate-repo.mjs` as a first-class consistency gate.

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
  in GitHub, Notion, and other Markdown environments
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
