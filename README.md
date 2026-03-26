<p align="center">
  <img src="assets/logo.svg" alt="brooks-lint" width="200">
</p>

<h1 align="center">brooks-lint</h1>

<p align="center">
  <strong>Code quality through the lens of <em>The Mythical Man-Month</em></strong>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#the-7-dimensions">The 7 Dimensions</a> •
  <a href="#claude-code-skill">Claude Code Skill</a> •
  <a href="#project-structure">Project Structure</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/Claude_Code-Plugin-blueviolet.svg" alt="Claude Code Plugin">
  <img src="https://img.shields.io/github/stars/hyhmrright/brooks-lint?style=social" alt="GitHub Stars">
</p>

---

> *"The bearing of a child takes nine months, no matter how many women are assigned."*
> — Frederick Brooks, *The Mythical Man-Month* (1975)

**50 years later, Brooks was still right.** Most code quality tools count lines and cyclomatic complexity. **brooks-lint** goes deeper — it evaluates your code against the timeless software engineering principles from *The Mythical Man-Month*.

It catches the problems that regular linters miss:

- 🏗️ **Conceptual Integrity** — Does your codebase look like one person designed it, or a committee?
- 🕸️ **Communication Overhead** — Is your module graph a clean tree or a spider web?
- 🔮 **Second System Effect** — Are you over-engineering for requirements that don't exist?
- 🪤 **Tar Pit Detection** — Where is your codebase slowly sinking?

## Installation

### Via Claude Code Plugin Marketplace (recommended)

```bash
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@hyhmrright-brooks-lint
```

### Manual install (any Claude Code project)

Copy the skill into your project's Claude skills directory:

```bash
cp -r skills/brooks-lint ~/.claude/skills/brooks-lint
```

Then in your Claude session, the skill will be available automatically.

### Slash Commands

Once installed, use these explicit triggers:

| Command | What it does |
|---------|-------------|
| `/brooks-review` | PR-level code review across 7 Brooks dimensions |
| `/brooks-audit` | Full architecture audit with module dependency map |
| `/brooks-debt` | Tech debt classification and repayment roadmap |

The skill also triggers automatically when you discuss code quality, architecture, or maintainability.

## The 7 Dimensions

brooks-lint evaluates your code across **7 dimensions** derived from Brooks's core principles:

| Dimension | What It Catches | Brooks Principle |
|-----------|----------------|-----------------|
| **Conceptual Integrity** | Mixed naming conventions, inconsistent error handling, clashing design patterns | *"I will contend that conceptual integrity is the most important consideration in system design."* |
| **Module Autonomy** | God classes, leaky abstractions, modules that can't be understood in isolation | *Surgical Team* |
| **Essential vs Accidental Complexity** | Framework bloat, unnecessary indirection, tools fighting the developer | *No Silver Bullet* |
| **Second System Effect** | YAGNI violations, over-abstraction, config explosion | *"The second is the most dangerous system a man ever designs."* |
| **Communication Overhead** | Circular dependencies, wide interfaces, high change propagation radius | *Brooks's Law: n(n-1)/2* |
| **Throwaway Readiness** | Prototype code in production, tightly coupled modules, missing test coverage | *"Plan to throw one away; you will, anyhow."* |
| **Tar Pit Score** | TODO/HACK accumulation, dead code, "don't touch" zones, documentation decay | *The Tar Pit* |

## Usage

brooks-lint is **fully prompt-driven** — no scripts to run. Install the plugin and Claude does the analysis.

### PR Review

```
/brooks-review
```

Paste a diff or point Claude at changed files. Claude scores each of the 7 dimensions with specific findings.

### Architecture Audit

```
/brooks-audit
```

Describe your project structure or share key files. Claude maps module dependencies and identifies conceptual integrity issues.

### Tech Debt Assessment

```
/brooks-debt
```

Claude classifies your debt across 5 categories and produces a prioritized repayment roadmap:

| Debt Type | Brooks Principle | Severity |
|-----------|-----------------|----------|
| Conceptual Debt | Conceptual Integrity | 🔴 HIGH |
| Structural Debt | The Tar Pit | 🔴 HIGH |
| Over-engineering Debt | Second System Effect | 🟡 MEDIUM |
| Knowledge Debt | Surgical Team | 🔴 HIGH |
| Coupling Debt | Brooks's Law | 🟡 MEDIUM |

## Claude Code Skill

brooks-lint ships as a **Claude Code Skill** — a plugin that makes Claude your architecture reviewer. When installed, Claude automatically applies Brooks's principles during code reviews.

### What triggers it?

- "Review this code" / "Check code quality"
- "Architecture review" / "Tech debt assessment"  
- "Why is this codebase so hard to maintain?"
- "Why isn't adding more developers helping?"
- Any mention of "conceptual integrity", "Brooks", or "no silver bullet"

### Report Format

Claude generates structured reports with the 7-dimension scoring:

```
🏗️ Brooks-Lint Quality Report

Overall Health: ★★★☆☆

| Dimension              | Score         | Key Finding                    |
|------------------------|---------------|--------------------------------|
| Conceptual Integrity   | ⬛⬛⬛⬜⬜ 3/5 | Mixed naming in services/      |
| Module Autonomy        | ⬛⬛⬜⬜⬜ 2/5 | UserService is a god class     |
| Essential vs Accidental| ⬛⬛⬛⬛⬜ 4/5 | Clean domain logic             |
| Second System Effect   | ⬛⬛⬛⬜⬜ 3/5 | 12 unused config options       |
| Communication Overhead | ⬛⬛⬜⬜⬜ 2/5 | 3 circular dependencies found  |
| Throwaway Readiness    | ⬛⬛⬛⬜⬜ 3/5 | DB layer tightly coupled       |
| Tar Pit Score          | ⬛⬛⬛⬛⬜ 4/5 | 5 TODOs, oldest: 6 months      |
```

## Why Brooks, Why Now?

In the age of AI-assisted coding, we're writing more code faster than ever. But Brooks's core insight hasn't changed:

> *"The complexity of software is an essential property, not an accidental one."*

AI can help you write code faster, but it can't tell you whether you're building a cathedral or a tar pit. **brooks-lint bridges that gap** — it brings 50 years of hard-won software engineering wisdom into your modern development workflow.

The problems Brooks identified in 1975 are more relevant than ever:
- **Adding AI assistants** to a project doesn't fix conceptual integrity problems
- **Generating more code** doesn't reduce communication overhead between modules
- **Moving faster** makes the second system effect even more dangerous

## Project Structure

```
brooks-lint/
├── .claude-plugin/              # Plugin metadata for /plugin install
│   ├── plugin.json
│   └── marketplace.json
├── skills/
│   └── brooks-lint/             # The skill itself
│       ├── SKILL.md             # Main skill definition (mode-switch pattern)
│       ├── brooks-principles.md # Scoring rubrics for all 7 dimensions
│       ├── pr-review-guide.md   # Mode 1: PR review checklist
│       ├── architecture-guide.md# Mode 2: Architecture audit framework
│       └── debt-guide.md        # Mode 3: Tech debt classification
├── hooks/                       # SessionStart hook
│   ├── hooks.json
│   └── session-start
├── commands/                    # Slash commands
│   ├── brooks-review.md         # /brooks-review
│   ├── brooks-audit.md          # /brooks-audit
│   └── brooks-debt.md           # /brooks-debt
└── assets/
    └── logo.svg
```

## Roadmap

- [x] **v0.2**: Plugin infrastructure (`.claude-plugin/`, hooks, slash commands)
- [ ] **v0.3**: Multi-platform support (Cursor, Codex, Gemini), automated tests
- [ ] **v0.5**: GitHub Action for CI/CD integration
- [ ] **v1.0**: VS Code extension

## Contributing

Contributions are welcome! Whether you're fixing a bug, adding a language, or improving the Brooks principle mappings — open a PR.

Run `/brooks-review` on your PR to see the kind of things we value in code reviews (yes, we dogfood our own tool).

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

This project stands on the shoulders of Frederick P. Brooks Jr., whose *The Mythical Man-Month* (1975, Anniversary Edition 1995) remains the most important book in software engineering. The principles encoded in this tool are our interpretation of his ideas, applied to modern code quality assessment.

---

<p align="center">
  <em>"Adding manpower to a late software project makes it later."</em><br>
  — Brooks's Law
</p>

<p align="center">
  <strong>⭐ If this tool helped you see your codebase differently, give it a star!</strong>
</p>
