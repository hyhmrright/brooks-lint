# International README Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite README.md and create CONTRIBUTING.md to maximise GitHub visibility and adoption by leading with benchmark data and real output examples.

**Architecture:** Two independent file changes — README.md gets a full structural rewrite with a persuasion funnel (data → example → comparison → install), and CONTRIBUTING.md is created from scratch to lower the barrier for external contributors.

**Tech Stack:** Markdown only. No build step, no scripts.

---

### Task 1: Rewrite README.md

**Files:**
- Modify: `README.md` (full replacement)

- [ ] **Step 1: Verify current README renders correctly (baseline)**

Open `README.md` in any Markdown preview and confirm the current logo, badges, and tables display without errors.

- [ ] **Step 2: Replace README.md with the new content**

Replace the entire file with:

````markdown
<p align="center">
  <img src="assets/logo.svg" alt="brooks-lint" width="200">
</p>

<h1 align="center">brooks-lint</h1>

<p align="center">
  <strong>AI code reviews grounded in six classic engineering books.<br>
  Consistent. Traceable. Actionable.</strong>
</p>

<p align="center">
  <a href="#the-six-decay-risks">The Six Decay Risks</a> •
  <a href="#what-it-looks-like">What It Looks Like</a> •
  <a href="#benchmark">Benchmark</a> •
  <a href="#installation">Installation</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.4.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/Claude_Code-Plugin-blueviolet.svg" alt="Claude Code Plugin">
  <img src="https://img.shields.io/github/stars/hyhmrright/brooks-lint?style=social" alt="GitHub Stars">
</p>

---

> *"The bearing of a child takes nine months, no matter how many women are assigned."*
> — Frederick Brooks, *The Mythical Man-Month* (1975)

**50 years later, Brooks was still right — and so were McConnell, Fowler, Martin, Hunt & Thomas, and Evans.**

Most code quality tools count lines and cyclomatic complexity. **brooks-lint** goes deeper — it diagnoses your code against six decay risk dimensions synthesized from six classic engineering books, producing structured findings with book citations, severity labels, and concrete remedies every time.

## The Six Decay Risks

brooks-lint evaluates your code across **six decay risk dimensions** synthesized from six classic engineering books:

| Decay Risk | Diagnostic Question | Sources |
|------------|---------------------|---------|
| 🧠 Cognitive Overload | How much mental effort to understand this? | Code Complete, Refactoring, DDD |
| 🔗 Change Propagation | How many unrelated things break on one change? | Refactoring, Clean Architecture, Pragmatic |
| 📋 Knowledge Duplication | Is the same decision expressed in multiple places? | Pragmatic, Refactoring, DDD |
| 🌀 Accidental Complexity | Is the code more complex than the problem? | Refactoring, Code Complete, Brooks |
| 🏗️ Dependency Disorder | Do dependencies flow in a consistent direction? | Clean Architecture, Brooks, Pragmatic |
| 🗺️ Domain Model Distortion | Does the code faithfully represent the domain? | DDD, Refactoring |

## What It Looks Like

Given this code:

```python
class UserService:
    def update_profile(self, user_id, name, email, avatar_url):
        user = self.db.query(f"SELECT * FROM users WHERE id = {user_id}")
        user['email'] = email
        ...
        if user['email'] != email:   # always False — silent bug
            self.smtp.send(...)
        points = user['login_count'] * 10 + 500
        self.db.execute(f"UPDATE loyalty SET points={points} WHERE user_id={user_id}")
```

brooks-lint produces:

---

**Health Score: 28/100**

*This method concentrates four unrelated business responsibilities into a single function, contains a logic bug that silently suppresses email change notifications, and is wide open to SQL injection.*

### 🔴 Change Propagation — Single Method Changes for Four Unrelated Business Reasons
**Symptom:** `update_profile` performs profile field updates, email change notifications, loyalty points recalculation, and cache invalidation all in one method body.
**Source:** Fowler — *Refactoring* — Divergent Change; Hunt & Thomas — *The Pragmatic Programmer* — Orthogonality
**Consequence:** Any change to the loyalty formula risks breaking email notifications and vice versa. Every edit carries regression risk across four unrelated domains simultaneously.
**Remedy:** Extract `NotificationService`, `LoyaltyService`, and `UserCacheInvalidator`. `UserService.update_profile` should orchestrate by calling each — it should hold no implementation logic itself.

### 🔴 Domain Model Distortion — Silent Logic Bug: Email Notification Never Fires
**Symptom:** `user['email'] = email` overwrites the old value before `if user['email'] != email` — the condition is always `False`. The notification is dead code.
**Source:** McConnell — *Code Complete* — Ch. 17: Unusual Control Structures
**Consequence:** Users are never notified when their email address changes. Silent data integrity failure — the system appears functional while violating a business rule.
**Remedy:** Capture `old_email = user['email']` before any mutation. Compare against `old_email`, not `user['email']`.

*(+ 6 more findings including SQL injection, dependency disorder, magic numbers)*

---

## Benchmark

Tested across 3 real-world scenarios (PR review, architecture audit, tech debt assessment):

| Criterion | brooks-lint | Claude alone |
|-----------|:-----------:|:------------:|
| Structured findings (Symptom → Source → Consequence → Remedy) | ✅ 100% | ❌ 0% |
| Book citations per finding | ✅ 100% | ❌ 0% |
| Severity labels (🔴/🟡/🟢) | ✅ 100% | ❌ 0% |
| Health Score (0–100) | ✅ 100% | ❌ 0% |
| Detects Change Propagation | ✅ 100% | ✅ 100% |
| **Overall pass rate** | **94%** | **16%** |

The gap isn't what Claude *can* find — it's what it *consistently* finds, with traceable evidence and actionable remedies every time.

## How It Compares

| | brooks-lint | ESLint / Pylint | GitHub Copilot Review | Plain Claude |
|---|:---:|:---:|:---:|:---:|
| Detects syntax & style issues | — | ✅ | ✅ | ~ |
| Structured diagnosis chain | ✅ | ❌ | ❌ | ❌ |
| Traces findings to classic books | ✅ | ❌ | ❌ | ❌ |
| Consistent severity labels | ✅ | ✅ | ~ | ❌ |
| Architecture-level insights | ✅ | ❌ | ~ | ~ |
| Domain model analysis | ✅ | ❌ | ❌ | ~ |
| Zero config, no plugins to install | ✅ | ❌ | ✅ | ✅ |
| Works with any language | ✅ | ❌ | ✅ | ✅ |

> `~` = occasionally / inconsistently

**brooks-lint doesn't replace your linter.** It catches what linters can't: architectural drift, knowledge silos, and domain model distortion — the problems that slow teams down for months before anyone notices.

## Installation

### Via Claude Code Plugin Marketplace (recommended)

```bash
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace
```

### Manual install

```bash
cp -r skills/brooks-lint ~/.claude/skills/brooks-lint
```

### Slash Commands

| Command | What it does |
|---------|-------------|
| `/brooks-lint:brooks-review` | PR-level code review across six decay risk dimensions |
| `/brooks-lint:brooks-audit` | Full architecture audit with module dependency map |
| `/brooks-lint:brooks-debt` | Tech debt classification ranked by Pain × Spread |

The skill also triggers automatically when you discuss code quality, architecture, or maintainability.

## Usage

### PR Review

```
/brooks-lint:brooks-review
```

Paste a diff or point Claude at changed files. Claude diagnoses each of the six decay risks with specific findings in Symptom → Source → Consequence → Remedy format.

### Architecture Audit

```
/brooks-lint:brooks-audit
```

Describe your project structure or share key files. Claude maps module dependencies, identifies circular dependencies, and checks Conway's Law alignment.

### Tech Debt Assessment

```
/brooks-lint:brooks-debt
```

Claude classifies your debt across the six decay risks, scores each finding by Pain × Spread priority, and produces a prioritized repayment roadmap with Critical / Scheduled / Monitored classification.

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
├── skills/brooks-lint/          # The skill itself
│   ├── SKILL.md                 # Main skill — Iron Law, mode detection, report template
│   ├── decay-risks.md           # Six decay risks with symptoms and book citations
│   ├── pr-review-guide.md       # Mode 1: PR review process
│   ├── architecture-guide.md    # Mode 2: Architecture audit + Conway's Law
│   └── debt-guide.md            # Mode 3: Pain×Spread scoring + Debt Summary Table
├── hooks/                       # SessionStart hook
├── commands/                    # /brooks-review, /brooks-audit, /brooks-debt
├── evals/                       # Benchmark test cases
│   └── evals.json
└── assets/
    └── logo.svg
```

## Roadmap

- [x] **v0.2**: Plugin infrastructure (`.claude-plugin/`, hooks, slash commands)
- [x] **v0.3**: Eight Brooks dimensions, scoring rubrics
- [x] **v0.4**: Six-book framework, decay risk dimensions, diagnosis chain, benchmark suite
- [ ] **v0.5**: GitHub Action for CI/CD integration
- [ ] **v1.0**: VS Code extension

Want to help? The best contributions right now are new eval test cases and improved decay risk symptom patterns. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add findings, improve guides, or expand the benchmark suite.

Run `/brooks-lint:brooks-review` on your own PR — we review contributions with the tool we're building.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

This project stands on the shoulders of six giants:

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
````

- [ ] **Step 3: Verify key sections render**

Check that:
- The comparison table columns align (4 columns + header)
- The benchmark table `:-----------:` centering syntax is correct
- The code block inside the "What It Looks Like" section is properly closed
- No broken anchor links in the nav bar (`#the-six-decay-risks`, `#what-it-looks-like`, `#benchmark`, `#installation`)

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README — benchmark data, real output showcase, comparison table"
```

---

### Task 2: Create CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create CONTRIBUTING.md with full content**

Create the file with:

```markdown
# Contributing to brooks-lint

Thanks for wanting to help. brooks-lint gets better with every new symptom pattern,
book citation, and eval test case that gets added — and most contributions require
zero code.

## Three Ways to Contribute

### 1. Add a finding to an existing decay risk (easiest)

Edit `skills/brooks-lint/decay-risks.md`. Each of the six decay risks has a
`Symptoms` list and a `Sources` table. You can:

- Add a new symptom pattern you've seen in real codebases
- Add a book citation for an existing symptom
- Sharpen the severity guidance (🔴/🟡/🟢 thresholds)

No code required. No tests required. Open a PR with your change and a one-sentence
explanation of why it matters.

### 2. Improve a guide file (no code required)

The three guide files define how Claude analyzes each scenario:

| File | What it controls |
|------|-----------------|
| `skills/brooks-lint/pr-review-guide.md` | How PR reviews are structured |
| `skills/brooks-lint/architecture-guide.md` | How architecture audits run |
| `skills/brooks-lint/debt-guide.md` | How tech debt is classified and scored |

Better heuristics here mean better reviews for every user. If you find the skill
misses something important or produces a finding that's consistently wrong, the
fix is almost always in one of these files.

### 3. Add an eval test case (most impactful)

The benchmark (94% pass rate) was produced by running the skill against test cases
in `evals/evals.json`. Adding a new test case that catches a real problem the
current skill misses is the highest-value contribution.

**Format:**

```json
{
  "id": 4,
  "name": "your-scenario-name",
  "prompt": "The user prompt that triggers the review",
  "expected_output": "Description of what a good review should contain",
  "files": []
}
```

In your PR, show the before/after: what the skill produced before your change
and what it produces after. Even a screenshot or paste of the output is enough.

## Local Testing

Verify the session-start hook produces valid JSON:

```bash
# Local branch
bash hooks/session-start

# Claude Code platform install path
CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start
```

Expected output: a JSON object with a `hookType` and `message` key.

To test the skill itself, install it into your Claude Code session:

```bash
cp -r skills/brooks-lint ~/.claude/skills/brooks-lint
```

Then open Claude Code and run one of the slash commands:

```
/brooks-lint:brooks-review
/brooks-lint:brooks-audit
/brooks-lint:brooks-debt
```

## PR Conventions

- Run `/brooks-lint:brooks-review` on your own diff before opening a PR.
  Paste the Health Score and any Critical findings into your PR description.
  (Yes, we review our own contributions with the tool we're building.)

- Keep PRs focused. One decay risk improvement or one eval addition per PR
  is easier to review than a batch of unrelated changes.

- If you're making a judgment call (e.g., changing a severity threshold from
  🟡 to 🔴), explain the reasoning in the PR description.

## Code of Conduct

Be excellent to each other.
```

- [ ] **Step 2: Verify the file**

Check that:
- The JSON code block inside the markdown code block renders correctly (triple-backtick nesting)
- All three contribution types have clear, concrete steps
- The local testing commands match the actual hook path (`hooks/session-start`)

- [ ] **Step 3: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add CONTRIBUTING.md — three contribution types, local testing guide"
```

---

### Task 3: Final verification and push

**Files:** None (verification only)

- [ ] **Step 1: Check all links in README work**

Verify these anchor links resolve:
- `#the-six-decay-risks` → "## The Six Decay Risks"
- `#what-it-looks-like` → "## What It Looks Like"
- `#benchmark` → "## Benchmark"
- `#installation` → "## Installation"
- `[CONTRIBUTING.md](CONTRIBUTING.md)` → file exists at repo root

```bash
ls CONTRIBUTING.md && echo "exists"
```

Expected: `CONTRIBUTING.md` + `exists`

- [ ] **Step 2: Verify git log looks clean**

```bash
git log --oneline -5
```

Expected: two new commits on top — one for README, one for CONTRIBUTING.md.

- [ ] **Step 3: Push**

```bash
git push
```
