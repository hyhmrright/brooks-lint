<p align="center">
  <img src="assets/logo.svg" alt="brooks-lint" width="200">
</p>

<h1 align="center">brooks-lint</h1>

<p align="center">
  <strong>Code quality through the lens of <em>The Mythical Man-Month</em></strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#the-7-dimensions">The 7 Dimensions</a> •
  <a href="#usage">Usage</a> •
  <a href="#claude-code-skill">Claude Code Skill</a> •
  <a href="references/brooks-principles.md">Brooks Principles Guide</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.8+-blue.svg" alt="Python 3.8+">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/Claude_Code-Skill-blueviolet.svg" alt="Claude Code Skill">
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

## Quick Start

### As a CLI tool

```bash
# Analyze a single file
python3 scripts/complexity_analyzer.py your_code.py

# Analyze an entire project
python3 scripts/complexity_analyzer.py --mode=project ./your-project/

# Run a tech debt assessment
python3 scripts/complexity_analyzer.py --mode=debt ./your-project/
```

### As a Claude Code Skill

```bash
# Install the skill
claude install brooks-lint.skill

# Then just ask Claude naturally:
# "Review this code with brooks-lint"
# "Run a tech debt assessment on my project"
# "Check the architectural health of this codebase"
```

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

### File Analysis

```bash
$ python3 scripts/complexity_analyzer.py app/services/user_service.py
```

```json
{
  "filepath": "app/services/user_service.py",
  "language": "python",
  "total_lines": 342,
  "code_lines": 267,
  "max_complexity": 15,
  "avg_complexity": 4.2,
  "naming_consistency": 0.87,
  "god_functions": ["process_user_registration"],
  "todo_count": 3,
  "hack_count": 1
}
```

### Project Analysis

```bash
$ python3 scripts/complexity_analyzer.py --mode=project ./my-project/
```

```json
{
  "total_files": 47,
  "total_code_lines": 8234,
  "brooks_scores": {
    "conceptual_integrity": "⬛⬛⬛⬛⬜ 3.8/5",
    "module_autonomy": "⬛⬛⬛⬜⬜ 3.2/5",
    "communication_overhead": "⬛⬛⬜⬜⬜ 2.4/5",
    "tar_pit_health": "⬛⬛⬛⬜⬜ 3.0/5",
    "throwaway_readiness": "⬛⬛⬛⬛⬜ 4.0/5"
  },
  "debt_markers": {
    "total_todos": 12,
    "total_hacks": 3,
    "total_fixmes": 5
  }
}
```

### Tech Debt Assessment

```bash
$ python3 scripts/complexity_analyzer.py --mode=debt ./my-project/
```

Produces a classified debt report with Brooks-based categorization:

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

## Language Support

| Language | Analysis Depth |
|----------|---------------|
| Python | 🟢 Deep (AST-based): cyclomatic complexity, nesting depth, docstring coverage |
| JavaScript/TypeScript | 🟡 Standard (regex-based): structure, naming, imports |
| Go | 🟡 Standard |
| Java | 🟡 Standard |
| Rust | 🟡 Standard |

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
├── SKILL.md                     # Claude Code skill definition
├── scripts/
│   └── complexity_analyzer.py   # Core analysis engine
├── references/
│   ├── brooks-principles.md     # Detailed principle guide (CJK + EN)
│   └── review-checklists.md     # Ready-to-use checklists by scenario
└── assets/
    └── logo.svg                 # Project logo
```

## Roadmap

- [ ] **v0.2**: JavaScript/TypeScript AST-based deep analysis  
- [ ] **v0.3**: Dependency graph visualization (Mermaid output)
- [ ] **v0.4**: Git history integration — track Brooks scores over time
- [ ] **v0.5**: GitHub Action for CI/CD integration
- [ ] **v1.0**: VS Code extension

## Contributing

Contributions are welcome! Whether you're fixing a bug, adding a language, or improving the Brooks principle mappings — open a PR.

See our [review checklists](references/review-checklists.md) for the kind of things we value in code reviews (yes, we dogfood our own tool).

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
