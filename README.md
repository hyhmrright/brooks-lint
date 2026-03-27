<p align="center">
  <img src="assets/logo.svg" alt="brooks-lint" width="200">
</p>

<h1 align="center">brooks-lint</h1>

<p align="center">
  <strong>Code quality reviews drawing on six classic engineering books: <em>The Mythical Man-Month</em>, <em>Code Complete</em>, <em>Refactoring</em>, <em>Clean Architecture</em>, <em>The Pragmatic Programmer</em>, and <em>Domain-Driven Design</em>.</strong>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#the-six-decay-risks">The Six Decay Risks</a> •
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

**50 years later, Brooks was still right — and so were McConnell, Fowler, Martin, Hunt & Thomas, and Evans.** Most code quality tools count lines and cyclomatic complexity. **brooks-lint** goes deeper — it diagnoses your code against six decay risk dimensions synthesized from six classic engineering books.

It catches the problems that regular linters miss:

- 🧠 **Cognitive Overload** — How much mental effort does it take to understand this code?
- 🔗 **Change Propagation** — How many unrelated things break on one change?
- 📋 **Knowledge Duplication** — Is the same decision expressed in multiple places?
- 🌀 **Accidental Complexity** — Is the code more complex than the problem it solves?
- 🏗️ **Dependency Disorder** — Do dependencies flow in a consistent direction?
- 🗺️ **Domain Model Distortion** — Does the code faithfully represent the domain?

## Installation

### Via Claude Code Plugin Marketplace (recommended)

```bash
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace
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
| `/brooks-lint:brooks-review` | PR-level code review across six decay risk dimensions |
| `/brooks-lint:brooks-audit` | Full architecture audit with module dependency map |
| `/brooks-lint:brooks-debt` | Tech debt classification and repayment roadmap |

The skill also triggers automatically when you discuss code quality, architecture, or maintainability.

## The Six Decay Risks

brooks-lint evaluates your code across **six decay risk dimensions** synthesized from six classic engineering books:

| Decay Risk | Diagnostic Question | Sources |
|------------|---------------------|---------|
| Cognitive Overload | How much mental effort to understand this? | Code Complete, Refactoring, DDD |
| Change Propagation | How many unrelated things break on one change? | Refactoring, Clean Architecture, Pragmatic |
| Knowledge Duplication | Is the same decision expressed in multiple places? | Pragmatic, Refactoring, DDD |
| Accidental Complexity | Is the code more complex than the problem? | Refactoring, Code Complete, Brooks |
| Dependency Disorder | Do dependencies flow in a consistent direction? | Clean Architecture, Brooks, Pragmatic |
| Domain Model Distortion | Does the code faithfully represent the domain? | DDD, Refactoring |

## Usage

brooks-lint is **fully prompt-driven** — no scripts to run. Install the plugin and Claude does the analysis.

### PR Review

```
/brooks-lint:brooks-review
```

Paste a diff or point Claude at changed files. Claude diagnoses each of the six decay risks with specific findings.

### Architecture Audit

```
/brooks-lint:brooks-audit
```

Describe your project structure or share key files. Claude maps module dependencies and identifies conceptual integrity issues.

### Tech Debt Assessment

```
/brooks-lint:brooks-debt
```

Claude classifies your debt across the six decay risks and produces a prioritized repayment roadmap ranked by Pain × Spread.

## Claude Code Skill

brooks-lint ships as a **Claude Code Skill** — a plugin that makes Claude your architecture reviewer. When installed, Claude automatically applies Brooks's principles during code reviews.

### What triggers it?

- "Review this code" / "Check code quality"
- "Architecture review" / "Tech debt assessment"  
- "Why is this codebase so hard to maintain?"
- "Why isn't adding more developers helping?"
- Any mention of "conceptual integrity", "Brooks", or "no silver bullet"

### Report Format

Claude generates structured reports using a diagnosis chain (Symptom → Source → Consequence → Remedy):

```
**Health Score: 72/100**
This codebase has solid naming conventions but structural coupling is slowing feature development.

---

**Findings**

🔴 Change Propagation — UserService does three jobs
  Symptom: UserService.updateProfile() modifies user data, sends notifications, and updates
    loyalty points in a single method
  Source: Fowler — Refactoring: Divergent Change
  Consequence: Any change to notification logic risks breaking profile updates and vice versa;
    regression test scope grows with every feature
  Remedy: Extract NotificationService and LoyaltyService; UserService calls them via interfaces

🟡 Dependency Disorder — Domain imports infrastructure
  Symptom: OrderDomain directly imports PostgresOrderRepository (concrete class)
  Source: Martin — Clean Architecture: Dependency Inversion Principle
  Consequence: Switching databases or adding a test double requires modifying domain code
  Remedy: Introduce IOrderRepository interface; inject the concrete implementation
```

## Why These Books, Why Now?

In the age of AI-assisted coding, we're writing more code faster than ever. But the insights from six decades of software engineering haven't changed:

> *"The complexity of software is an essential property, not an accidental one."*
> — Frederick Brooks

AI can help you write code faster, but it can't tell you whether you're building a cathedral or a tar pit. **brooks-lint bridges that gap** — it brings the hard-won wisdom of six classic engineering books into your modern development workflow.

The decay risks these authors identified are more relevant than ever:
- **Adding AI assistants** doesn't fix cognitive overload or domain model distortion
- **Generating more code** increases change propagation and knowledge duplication
- **Moving faster** makes accidental complexity and dependency disorder even more dangerous

## Project Structure

```
brooks-lint/
├── .claude-plugin/              # Plugin metadata for /plugin install
│   ├── plugin.json
│   └── marketplace.json
├── skills/
│   └── brooks-lint/             # The skill itself
│       ├── SKILL.md             # Main skill definition (mode-switch pattern)
│       ├── decay-risks.md       # Six decay risks with symptom lists and source attributions
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
- [x] **v0.3**: Eight Brooks dimensions, scoring rubrics, documentation completeness
- [x] **v0.4**: Six-book framework, decay risk dimensions, diagnosis chain (Symptom → Source → Consequence → Remedy)
- [ ] **v0.5**: GitHub Action for CI/CD integration
- [ ] **v1.0**: VS Code extension

## Contributing

Contributions are welcome! Whether you're fixing a bug, adding a language, or improving the Brooks principle mappings — open a PR.

Run `/brooks-lint:brooks-review` on your PR to see the kind of things we value in code reviews (yes, we dogfood our own tool).

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

This project stands on the shoulders of six giants whose books have shaped software engineering:

- Frederick P. Brooks Jr. — *The Mythical Man-Month* (1975, Anniversary Edition 1995)
- Steve McConnell — *Code Complete* (1993, 2nd ed. 2004)
- Martin Fowler — *Refactoring* (1999, 2nd ed. 2018)
- Robert C. Martin — *Clean Architecture* (2017)
- Andrew Hunt & David Thomas — *The Pragmatic Programmer* (1999, 20th Anniversary Ed. 2019)
- Eric Evans — *Domain-Driven Design* (2003)

The decay risks encoded in this tool are our synthesis of their ideas, applied to modern code quality assessment.

---

<p align="center">
  <em>"The bearing of a child takes nine months, no matter how many women are assigned."</em><br>
  — Frederick Brooks, <em>The Mythical Man-Month</em>
</p>

<p align="center">
  <strong>⭐ If this tool helped you see your codebase differently, give it a star!</strong>
</p>
