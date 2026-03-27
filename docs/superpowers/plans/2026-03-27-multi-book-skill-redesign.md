# Brooks-Lint Multi-Book Skill Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-book (Brooks) eight-dimension scoring framework with a six-book, six-decay-risk diagnosis framework across all five skill files.

**Architecture:** Five markdown files are rewritten in-place; one file (`brooks-principles.md`) is deleted and replaced by a new `decay-risks.md`. No directory structure changes. The behavioral model shifts from dimension scoring to Symptom → Source → Consequence → Remedy diagnosis chains.

**Tech Stack:** Markdown only. No code. Manual verification by loading the skill and running a sample review.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| DELETE | `skills/brooks-lint/brooks-principles.md` | Replaced by decay-risks.md |
| CREATE | `skills/brooks-lint/decay-risks.md` | Six decay risks: definitions, symptoms, sources, severity rubrics |
| REWRITE | `skills/brooks-lint/SKILL.md` | Entry point: Iron Law, mode detection, output template |
| REWRITE | `skills/brooks-lint/pr-review-guide.md` | Mode 1: PR review analysis process |
| REWRITE | `skills/brooks-lint/architecture-guide.md` | Mode 2: Architecture audit process |
| REWRITE | `skills/brooks-lint/debt-guide.md` | Mode 3: Tech debt classification |
| UPDATE | `commands/brooks-review.md` | Fix outdated "Brooks's 7 principles" reference |
| UPDATE | `commands/brooks-audit.md` | Fix outdated reference |
| UPDATE | `commands/brooks-debt.md` | Fix outdated reference |
| UPDATE | `README.md` | Reflect v0.4 framework |
| UPDATE | `CHANGELOG.md` | Document v0.4 changes |
| UPDATE | `package.json` | Bump version to 0.4.0 |

---

## Task 1: Create decay-risks.md

**Files:**
- Delete: `skills/brooks-lint/brooks-principles.md`
- Create: `skills/brooks-lint/decay-risks.md`

- [ ] **Step 1: Delete the old file**

```bash
git rm skills/brooks-lint/brooks-principles.md
```

Expected: `rm 'skills/brooks-lint/brooks-principles.md'`

- [ ] **Step 2: Create decay-risks.md with the complete content**

Create `skills/brooks-lint/decay-risks.md` with the following content:

```markdown
# Decay Risk Reference

Six patterns that cause software to degrade over time.
For each finding, identify: which risk, which symptom, which source book.

Every finding must follow the Iron Law:
Symptom → Source → Consequence → Remedy

---

## Risk 1: Cognitive Overload

**Diagnostic question:** How much mental effort does a human need to understand this?

When cognitive load exceeds working memory capacity, developers make mistakes, avoid touching
the code, and slow down. This risk compounds: hard-to-understand code resists the refactoring
that would make it easier to understand.

### Symptoms

- Function longer than 20 lines where multiple levels of abstraction are mixed together
- Nesting depth greater than 3 levels
- Parameter list with more than 4 parameters
- Magic numbers or unexplained constants
- Variable names that require reading the implementation to understand (e.g., `d`, `tmp2`, `flag`)
- Boolean expressions with 3 or more conditions combined
- Train-wreck chains: `a.getB().getC().doD()`
- Code names that do not match what the business calls the same concept

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Long Method | Fowler — Refactoring | Long Method |
| Long Parameter List | Fowler — Refactoring | Long Parameter List |
| Message Chains | Fowler — Refactoring | Message Chains |
| Function length and nesting | McConnell — Code Complete | Ch. 7: High-Quality Routines |
| Variable naming | McConnell — Code Complete | Ch. 11: The Power of Variable Names |
| Magic numbers | McConnell — Code Complete | Ch. 12: Fundamental Data Types |
| Domain name mismatch | Evans — Domain-Driven Design | Ubiquitous Language |

### Severity Guide

- 🔴 Critical: function > 50 lines, nesting > 5, or virtually no meaningful names
- 🟡 Warning: function 20–50 lines, nesting 4–5, some unclear names
- 🟢 Suggestion: minor naming issues, 1–2 magic numbers, isolated train-wreck chains

---

## Risk 2: Change Propagation

**Diagnostic question:** How many unrelated things break when you change one thing?

High change propagation means that a developer modifying feature A must also modify modules B,
C, and D — even though B, C, and D have nothing conceptually to do with A. This slows velocity
and multiplies regression risk on every change.

### Symptoms

- Modifying one feature requires touching more than 3 files in unrelated modules
- One class changes for multiple different business reasons (e.g., `UserService` changes for
  billing logic AND notification logic AND profile logic)
- A method uses more data from another class than from its own class
- Two classes know each other's internal state directly
- Changing one module requires recompiling or retesting many unrelated modules

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Shotgun Surgery | Fowler — Refactoring | Shotgun Surgery |
| Divergent Change | Fowler — Refactoring | Divergent Change |
| Feature Envy | Fowler — Refactoring | Feature Envy |
| Inappropriate Intimacy | Fowler — Refactoring | Inappropriate Intimacy |
| Orthogonality violation | Hunt & Thomas — The Pragmatic Programmer | Ch. 2: Orthogonality |
| DIP violation | Martin — Clean Architecture | Dependency Inversion Principle |
| High change propagation radius | Brooks — The Mythical Man-Month | Ch. 2: Brooks's Law (communication overhead) |

### Severity Guide

- 🔴 Critical: one change touches > 5 files, or there is a structural dependency inversion (domain depends on infrastructure)
- 🟡 Warning: one change touches 3–5 files, mild coupling between modules
- 🟢 Suggestion: minor coupling, easily isolatable

---

## Risk 3: Knowledge Duplication

**Diagnostic question:** Is the same decision expressed in more than one place?

When the same piece of knowledge lives in multiple places, those copies will inevitably drift
apart. This creates silent inconsistencies: both copies pass their tests but disagree on behavior
in edge cases. DRY is not about code lines — it is about decisions.

### Symptoms

- Same logic copy-pasted across multiple files or functions
- Same concept named differently in different parts of the codebase
  (e.g., `user`, `account`, `member`, `customer` all referring to the same domain entity)
- Parallel class hierarchies that must change in sync
  (e.g., adding a new payment type requires adding a class in 3 different hierarchies)
- Configuration values repeated as literals in multiple places
- Two modules that implement the same algorithm independently

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Code duplication | Fowler — Refactoring | Duplicate Code |
| Parallel Inheritance | Fowler — Refactoring | Parallel Inheritance Hierarchies |
| DRY violation | Hunt & Thomas — The Pragmatic Programmer | DRY: Don't Repeat Yourself |
| Inconsistent naming | Evans — Domain-Driven Design | Ubiquitous Language |
| Alternative Classes | Fowler — Refactoring | Alternative Classes with Different Interfaces |

### Severity Guide

- 🔴 Critical: core business logic duplicated across modules, or same domain concept named 3+ different ways
- 🟡 Warning: utility code duplicated, naming inconsistent within a subsystem
- 🟢 Suggestion: minor literal duplication, single naming inconsistency

---

## Risk 4: Accidental Complexity

**Diagnostic question:** Is the code more complex than the problem it solves?

Every system has essential complexity (inherent to the problem) and accidental complexity
(introduced by implementation choices). Accidental complexity is the only kind that can be
eliminated. It accumulates silently: each addition seems justified in isolation, but the total
burden grows until developers spend more time maintaining the scaffolding than solving the problem.

### Symptoms

- Abstractions built "for future use" with no current consumer
  (e.g., a plugin system for a use case that has only one known implementation)
- Classes that barely justify their existence (wrap a single method call)
- Classes that only delegate to another class without adding behavior (pure middle-men)
- Second attempt at a system that is significantly more elaborate than the first,
  adding generality for requirements that do not yet exist
- Switch statements that signal missing polymorphism
- Configuration options that have never been changed from their defaults
- Framework code larger than the application it powers

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Speculative Generality | Fowler — Refactoring | Speculative Generality |
| Lazy Class | Fowler — Refactoring | Lazy Class |
| Middle Man | Fowler — Refactoring | Middle Man |
| Switch Statements | Fowler — Refactoring | Switch Statements |
| Second System Effect | Brooks — The Mythical Man-Month | Ch. 5: The Second-System Effect |
| YAGNI violations | McConnell — Code Complete | Ch. 5: Design in Construction |
| Over-engineering | Hunt & Thomas — The Pragmatic Programmer | Ch. 2: The Evils of Duplication (YAGNI corollary) |

### Severity Guide

- 🔴 Critical: an entire subsystem built around a speculative requirement, or framework overhead dominates domain logic
- 🟡 Warning: several unnecessary abstractions or wrapper classes, unused configuration systems
- 🟢 Suggestion: one or two lazy classes or middle-man patterns in non-critical paths

---

## Risk 5: Dependency Disorder

**Diagnostic question:** Do dependencies flow in a consistent, predictable direction?

Dependency direction is the skeleton of a software system. When high-level business logic
depends on low-level infrastructure details, or when components depend on things less stable
than themselves, every infrastructure change becomes a business logic change. Circular
dependencies make it impossible to understand or test any component in isolation.

### Symptoms

- Circular dependencies between modules or packages
- High-level business logic directly imports from low-level infrastructure
  (e.g., a domain service imports from a specific database driver)
- Stable, widely-used components depend on unstable, frequently-changing ones
- Abstract components depending on concrete implementations
- Law of Demeter violations: `order.getCustomer().getAddress().getCity()`
- Module fan-out greater than 5 (imports from more than 5 other modules)
- The system feels like "one mind did not design this" — different modules use
  incompatible architectural patterns with no clear rule for which to use where

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Dependency cycles | Martin — Clean Architecture | Acyclic Dependencies Principle (ADP) |
| DIP violation | Martin — Clean Architecture | Dependency Inversion Principle (DIP) |
| Instability direction | Martin — Clean Architecture | Stable Dependencies Principle (SDP) |
| Abstraction mismatch | Martin — Clean Architecture | Stable Abstractions Principle (SAP) |
| Conceptual integrity | Brooks — The Mythical Man-Month | Ch. 4: Conceptual Integrity |
| Law of Demeter | Hunt & Thomas — The Pragmatic Programmer | Ch. 5: Decoupling and the Law of Demeter |
| SOLID violations | Martin — Clean Architecture | Single Responsibility, Open/Closed Principles |

### Severity Guide

- 🔴 Critical: dependency cycles present, or domain layer directly depends on infrastructure layer
- 🟡 Warning: several SDP or DIP violations but no cycles; conceptual inconsistency across modules
- 🟢 Suggestion: minor Demeter violations, slightly elevated fan-out in isolated modules

---

## Risk 6: Domain Model Distortion

**Diagnostic question:** Does the code faithfully represent the problem it is solving?

Code that does not speak the language of the problem domain forces every developer to maintain
a mental translation layer between "what the business calls it" and "what the code calls it."
Over time, this translation layer diverges, and the code begins to model the database schema
or the API contract rather than the business concept. Domain logic bleeds into service layers
and the domain objects become empty data containers.

### Symptoms

- Business logic scattered across service layers while domain objects have only getters and setters
  (anemic domain model)
- Code variable, class, or method names that do not match what business stakeholders call the concept
- A class whose only purpose is to hold data with no behavior (pure data bag)
- A subclass that ignores or overrides most of its parent's behavior (refuses the inheritance)
- Bounded context boundaries crossed without any translation or anti-corruption layer
- Methods that are more interested in the data of another class than their own
  (domain logic in the wrong place)

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Anemic Domain Model | Evans — Domain-Driven Design | Domain Model pattern |
| Ubiquitous Language drift | Evans — Domain-Driven Design | Ubiquitous Language |
| Bounded context violation | Evans — Domain-Driven Design | Bounded Context |
| Data Class | Fowler — Refactoring | Data Class |
| Refused Bequest | Fowler — Refactoring | Refused Bequest |
| Feature Envy | Fowler — Refactoring | Feature Envy |

### Severity Guide

- 🔴 Critical: domain logic entirely in service layer, domain objects are pure data bags with no behavior
- 🟡 Warning: partial anemia, some naming inconsistency between code and domain language
- 🟢 Suggestion: minor naming drift in non-core areas, isolated cases of Feature Envy
```

- [ ] **Step 3: Verify the file was created**

```bash
wc -l skills/brooks-lint/decay-risks.md
```

Expected: around 180–220 lines. If 0 lines, the write failed — retry Step 2.

- [ ] **Step 4: Verify the old file is gone**

```bash
ls skills/brooks-lint/
```

Expected output should NOT include `brooks-principles.md`. Should include `decay-risks.md`.

- [ ] **Step 5: Commit**

```bash
git add skills/brooks-lint/decay-risks.md
git commit -m "feat: replace brooks-principles.md with decay-risks.md (six-book framework)"
```

---

## Task 2: Rewrite SKILL.md

**Files:**
- Modify: `skills/brooks-lint/SKILL.md` (full rewrite)

- [ ] **Step 1: Rewrite SKILL.md with the complete new content**

Replace the entire content of `skills/brooks-lint/SKILL.md` with:

```markdown
---
name: brooks-lint
description: >
  Code quality review drawing on six classic engineering books: The Mythical Man-Month,
  Code Complete, Refactoring, Clean Architecture, The Pragmatic Programmer, and
  Domain-Driven Design. Triggers when: user asks to review code, check a PR, review a
  pull request, discuss architecture health, assess tech debt, assess maintainability,
  or mentions Brooks's Law / Mythical Man-Month / conceptual integrity / second system
  effect / no silver bullet / code smells / refactoring / clean architecture / DDD /
  domain-driven design / SOLID principles.
  Also triggers when user asks why the codebase is hard to maintain,
  why adding developers isn't helping, or why complexity keeps growing.
  Use this skill proactively whenever code, a diff, or a PR is shared for review.
---

# Brooks-Lint

Code quality diagnosis using principles from six classic software engineering books.

## The Iron Law

```
NEVER suggest fixes before completing risk diagnosis.
EVERY finding must follow: Symptom → Source → Consequence → Remedy.
```

Violating this law produces reviews that list rule violations without explaining why they
matter. A finding without a consequence and a remedy is not a finding — it is noise.

## When to Use

**Auto-triggers:**
- User asks to review code, check a PR, or assess code quality
- User shares code and asks "what do you think?" or "is this good?"
- User discusses architecture, module structure, or system design
- User asks why the codebase is hard to maintain, why velocity is declining
- User mentions: code smells, refactoring, clean architecture, DDD, SOLID, Brooks,
  conceptual integrity, second system effect, tech debt, ubiquitous language

**Slash command triggers (forced mode — skip mode detection):**
- `/brooks-lint:brooks-review` → Mode 1: PR Review
- `/brooks-lint:brooks-audit` → Mode 2: Architecture Audit
- `/brooks-lint:brooks-debt` → Mode 3: Tech Debt Assessment

## Mode Detection

Read the context and pick ONE mode before doing anything else.

| Context | Mode |
|---------|------|
| Code diff, specific files/functions, PR description, "review this" | **Mode 1: PR Review** |
| Project directory structure, module questions, "audit the architecture" | **Mode 2: Architecture Audit** |
| "tech debt", "where to refactor", health check, systemic maintainability questions | **Mode 3: Tech Debt Assessment** |
| User used a slash command | **Forced to that command's mode** |

**If context is genuinely ambiguous after reading:** ask once — "Should I do a PR-level code
review, a broader architecture audit, or a tech debt assessment?" — then proceed without
further clarification questions.

## The Six Decay Risks

(Full definitions, symptoms, sources, and severity guides are in `decay-risks.md` — read it
after selecting a mode.)

| Risk | Diagnostic Question |
|------|---------------------|
| Cognitive Overload | How much mental effort to understand this? |
| Change Propagation | How many unrelated things break on one change? |
| Knowledge Duplication | Is the same decision expressed in multiple places? |
| Accidental Complexity | Is the code more complex than the problem? |
| Dependency Disorder | Do dependencies flow in a consistent direction? |
| Domain Model Distortion | Does the code faithfully represent the domain? |

## Modes

### Mode 1: PR Review

1. Read `pr-review-guide.md` for the analysis process
2. Read `decay-risks.md` for symptom definitions and source attributions
3. Scan the diff or code for each decay risk in the order specified in the guide
4. Apply the Iron Law to every finding
5. Output using the Report Template below

### Mode 2: Architecture Audit

1. Read `architecture-guide.md` for the analysis process
2. Read `decay-risks.md` for symptom definitions and source attributions
3. Draw the module dependency map
4. Scan for each decay risk in the order specified in the guide
5. Run the Conway's Law check
6. Output using the Report Template below

### Mode 3: Tech Debt Assessment

1. Read `debt-guide.md` for the analysis process
2. Read `decay-risks.md` for symptom definitions and source attributions
3. Scan for all six decay risks; list every finding before scoring any of them
4. Apply the Pain × Spread priority formula
5. Output using the Report Template below, plus the Debt Summary Table

## Report Template

```
# Brooks-Lint Review

**Mode:** [PR Review / Architecture Audit / Tech Debt Assessment]
**Scope:** [file(s), directory, or description of what was reviewed]
**Health Score:** XX/100

[One sentence overall verdict]

---

## Findings

<!-- Sort all findings by severity: Critical first, then Warning, then Suggestion -->
<!-- If no findings in a severity tier, omit that tier's heading -->

### 🔴 Critical

**[Risk Name] — [Short descriptive title]**
Symptom: [exactly what was observed in the code]
Source: [Book title — Principle or Smell name]
Consequence: [what breaks or gets worse if this is not fixed]
Remedy: [concrete, specific action]

### 🟡 Warning

**[Risk Name] — [Short descriptive title]**
Symptom: ...
Source: ...
Consequence: ...
Remedy: ...

### 🟢 Suggestion

**[Risk Name] — [Short descriptive title]**
Symptom: ...
Source: ...
Consequence: ...
Remedy: ...

---

## Summary

[2–3 sentences: what is the most important action, and what is the overall trend]
```

## Health Score Calculation

Base score: 100
Deductions:
- Each 🔴 Critical finding: −15
- Each 🟡 Warning finding: −5
- Each 🟢 Suggestion finding: −1
Floor: 0 (score cannot go below 0)

## Reference Files

Read on demand — do not preload all files:

| File | When to Read |
|------|-------------|
| `decay-risks.md` | After selecting a mode, before starting the review |
| `pr-review-guide.md` | At the start of every Mode 1 (PR Review) |
| `architecture-guide.md` | At the start of every Mode 2 (Architecture Audit) |
| `debt-guide.md` | At the start of every Mode 3 (Tech Debt Assessment) |
```

- [ ] **Step 2: Verify the file looks correct**

```bash
head -20 skills/brooks-lint/SKILL.md
```

Expected: starts with `---`, then `name: brooks-lint`, then description referencing six books.

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/SKILL.md
git commit -m "feat: rewrite SKILL.md — Iron Law, six decay risks, new report template"
```

---

## Task 3: Rewrite pr-review-guide.md

**Files:**
- Modify: `skills/brooks-lint/pr-review-guide.md` (full rewrite)

- [ ] **Step 1: Rewrite pr-review-guide.md with the complete new content**

Replace the entire content of `skills/brooks-lint/pr-review-guide.md` with:

```markdown
# PR Review Guide — Mode 1

**Purpose:** Analyze a code diff or specific files for decay risks that are directly visible
in the changed code. Every finding must follow the Iron Law: Symptom → Source → Consequence → Remedy.

---

## Before You Start

**Auto-generated files:** If the diff contains generated files (protobuf stubs, OpenAPI clients,
ORM migrations, lock files, minified bundles), skip those files entirely. Generated code reflects
tool choices, not developer decisions. Note in the report which files were skipped and why.

---

## Analysis Process

Work through these six steps in order. Do not skip steps.

### Step 1: Understand the scope

Read the diff or files and answer:
- What is the stated purpose of this change?
- Which files were modified?
- Flag immediately if the PR changes more than 10 unrelated files — that itself is a
  🟡 Warning: Change Propagation (a PR that touches many unrelated things is a sign
  that responsibilities are tangled).

### Step 2: Scan for Change Propagation

*Scan this first — it is the most visible risk in a diff.*

Look for:
- Does this change touch files in modules that have no conceptual connection to the stated purpose?
- Does any modified class change for more than one business reason in this diff?
- Does any method use more data from another class than from its own?

If the diff shows no cross-module changes beyond what the feature requires → skip, no finding.

### Step 3: Scan for Cognitive Overload

Look for:
- Are any new or modified functions longer than 20 lines?
- Is there nesting deeper than 3 levels in new or modified code?
- Are there more than 4 parameters in any new function signature?
- Are there magic numbers or unexplained constants in new code?
- Do new variable or function names require reading the implementation to understand?
- Are there train-wreck chains (3+ method calls chained)?

### Step 4: Scan for Knowledge Duplication

Look for:
- Does this change introduce logic that already exists elsewhere in the codebase?
- Does this change introduce a new name for a concept that already has a name?
- Does this change add a class to a hierarchy that has a parallel in another module?

### Step 5: Scan for Accidental Complexity

Look for:
- Does this change add an abstraction with only one concrete use?
- Does this change add a class that only wraps another class or delegates everything?
- Does this change add configuration options or extension points that serve no current requirement?

### Step 6: Scan for Dependency Disorder and Domain Model Distortion

Look for Dependency Disorder:
- Do any new imports create a dependency from a high-level module to a low-level one?
- Do any new imports introduce a cycle?

Look for Domain Model Distortion:
- Do new class or variable names match the language the business uses?
- Does any new class hold only data with no behavior, where behavior was expected?

---

## Applying the Iron Law

For every finding identified above, write it in this format:

```
**[Risk Name] — [Short title]**
Symptom: [the exact thing you saw in the diff — quote line numbers if helpful]
Source: [Book title — Principle or Smell name]
Consequence: [what will happen if this is not addressed]
Remedy: [concrete action, specific to this code]
```

Do not write a finding that you cannot complete fully. If you can identify a symptom but
cannot state a consequence, you have not understood the risk well enough — re-read
`decay-risks.md` for that risk before writing the finding.

---

## Output

Use the standard Report Template from `SKILL.md`.
Mode: PR Review
Scope: list the files reviewed (excluding skipped generated files).
```

- [ ] **Step 2: Verify**

```bash
wc -l skills/brooks-lint/pr-review-guide.md
```

Expected: 80–110 lines.

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/pr-review-guide.md
git commit -m "feat: rewrite pr-review-guide.md — six decay risk scan process"
```

---

## Task 4: Rewrite architecture-guide.md

**Files:**
- Modify: `skills/brooks-lint/architecture-guide.md` (full rewrite)

- [ ] **Step 1: Rewrite architecture-guide.md with the complete new content**

Replace the entire content of `skills/brooks-lint/architecture-guide.md` with:

```markdown
# Architecture Audit Guide — Mode 2

**Purpose:** Analyze the module and dependency structure of a system for decay risks that
operate at the architectural level. Every finding must follow the Iron Law:
Symptom → Source → Consequence → Remedy.

**Monorepo note:** Treat each deployable service or library as a top-level module. Draw
dependencies between services, not between their internal packages. Apply the Conway's Law
check at the service ownership level. Within a single service, apply standard module-level analysis.

---

## Analysis Process

Work through these five steps in order.

### Step 1: Draw the Module Dependency Map

Before evaluating any risk, map the dependencies in this format:

```
[ModuleA] ──► [ModuleB]     (depends on)
[ModuleA] ──► [ModuleC]
[ModuleB] ──► [ModuleD]
[ModuleC] ──► [ModuleD]

Circular: [ModuleX] ──► [ModuleY] ──► [ModuleX]  ⚠️
```

Rules:
- Arrows point FROM the depending module TO the dependency
- Group by layer: UI → Domain → Infrastructure (arrows should generally flow downward)
- Mark circular dependencies with ⚠️
- Note any module with fan-out greater than 5 (imports from more than 5 others)

### Step 2: Scan for Dependency Disorder

*The most architecturally consequential risk — scan this first.*

Look for:
- Circular dependencies (any ⚠️ in the map above)
- Arrows flowing upward (high-level domain depending on low-level infrastructure)
- Stable, widely-depended-on modules that import from frequently-changing modules
- Modules with fan-out > 5
- Absence of a clear layering rule (no consistent answer to "what depends on what?")

### Step 3: Scan for Domain Model Distortion

Look for:
- Do module names match the business domain vocabulary?
- Is there a layer called "services" that contains all the business logic while domain objects
  are pure data structures?
- Are there modules that cross bounded context boundaries (e.g., billing logic in the user module)?
- Is there an anti-corruption layer where external systems interface with the domain?

### Step 4: Scan for Remaining Four Risks

Check each in turn:

**Knowledge Duplication:**
- Are there multiple modules implementing the same concept independently?
- Does the same domain concept appear under different names in different modules?

**Accidental Complexity:**
- Are there entire layers in the architecture that do not add value?
- Are there modules whose responsibility cannot be stated in one sentence?

**Change Propagation:**
- Which modules are "blast radius hotspots"? (A change here requires changes in many other modules)
- Does the dependency map reveal why certain features are slow to develop?

**Cognitive Overload:**
- Can the module responsibility of each module be stated in one sentence from its name alone?
- Would a new developer know which module to add a new feature to?

### Step 5: Conway's Law Check

After the six-risk scan, assess the relationship between architecture and team structure:

- Does the module/service structure reflect the team structure?
  (Conway's Law: "Organizations design systems that mirror their communication structure")
- If yes: is this intentional design or accidental coupling?
- A mismatch that causes cross-team coordination overhead for every feature is 🔴 Critical.
- A mismatch that is theoretical but not yet causing pain is 🟡 Warning.
- If team structure is unknown, note this as context missing and skip the check.

---

## Applying the Iron Law

For every finding identified above, write it in this format:

```
**[Risk Name] — [Short title]**
Symptom: [the exact structural evidence — reference module names from the dependency map]
Source: [Book title — Principle or Smell name]
Consequence: [what architectural consequence follows if this is not addressed]
Remedy: [concrete architectural action]
```

---

## Output

Use the standard Report Template from `SKILL.md`.
Mode: Architecture Audit
Scope: the project or directory audited.

Include the dependency map as a code block in the report before the Findings section,
labeled "Module Dependency Map".
```

- [ ] **Step 2: Verify**

```bash
wc -l skills/brooks-lint/architecture-guide.md
```

Expected: 90–120 lines.

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/architecture-guide.md
git commit -m "feat: rewrite architecture-guide.md — six decay risk audit process + Conway check"
```

---

## Task 5: Rewrite debt-guide.md

**Files:**
- Modify: `skills/brooks-lint/debt-guide.md` (full rewrite)

- [ ] **Step 1: Rewrite debt-guide.md with the complete new content**

Replace the entire content of `skills/brooks-lint/debt-guide.md` with:

```markdown
# Tech Debt Assessment Guide — Mode 3

**Purpose:** Identify, classify, and prioritize technical debt across the entire codebase.
Every finding must follow the Iron Law: Symptom → Source → Consequence → Remedy.

---

## Evidence Gathering

If you have insufficient evidence to assess the codebase, ask the user ONE question —
choose the single question most relevant to what you already know:

1. "Which part of the codebase takes the longest to modify for a typical feature?"
2. "Which module do developers avoid touching, and why?"
3. "Which parts of the system have the fewest tests and the most bugs?"
4. "Is there a module that only one person fully understands?"

After one answer, proceed. Do not ask more than one question.
If the user declines or says they don't know, proceed with available evidence and note
which areas could not be assessed.

---

## Analysis Process

Work through these three steps in order.

### Step 1: Full Decay Risk Scan

Scan for all six decay risks across the entire codebase. List every finding before scoring
any of them. This prevents anchoring on early findings and missing systemic patterns.

For each risk, look for:

**Cognitive Overload:** Are there widespread naming problems, deeply nested logic, or
excessively long functions spread across many modules?

**Change Propagation:** Which modules cause the most ripple effects when changed?
Are there modules that everyone must modify when adding a new feature?

**Knowledge Duplication:** How many times is the same concept implemented independently?
Is the domain vocabulary consistent across the codebase?

**Accidental Complexity:** Are there architectural layers or abstractions that add no value?
Is the infrastructure overhead proportional to the problem being solved?

**Dependency Disorder:** Are there dependency cycles? Does domain logic depend on infrastructure?
Are there modules with no clear layering position?

**Domain Model Distortion:** Is business logic in the right layer?
Do code names match business names? Are domain objects anemic?

### Step 2: Score Each Finding with Pain × Spread

After listing all findings, score each one:

**Pain score (1–3):** How much does this slow down development today?
- 3: Developers actively avoid touching this area; it causes bugs on most changes
- 2: This area is noticeably slower to work in than the rest of the codebase
- 1: This is a quality issue but not currently causing active pain

**Spread score (1–3):** How many files, modules, or developers does this affect?
- 3: Affects 5+ modules or all developers on the team
- 2: Affects 2–4 modules or a subset of the team
- 1: Isolated to one module or one developer's area

**Priority = Pain × Spread** (max 9)

| Priority | Classification | Action |
|----------|---------------|--------|
| 7–9 | Critical debt | Address in next sprint |
| 4–6 | Scheduled debt | Plan within quarter |
| 1–3 | Monitored debt | Log and watch |

### Step 3: Group by Decay Risk

Report findings grouped by risk type, not by file or module.
Grouping by risk reveals systemic patterns:
- "Change Propagation is systemic" → architectural intervention needed
- "Cognitive Overload is isolated" → localized refactoring sufficient

---

## Output

Use the standard Report Template from `SKILL.md`.
Mode: Tech Debt Assessment

After the Findings section, append a Debt Summary Table:

```
## Debt Summary

| Risk | Findings | Avg Priority | Dominant Classification |
|------|----------|-------------|------------------------|
| Cognitive Overload | N | X.X | Monitored / Scheduled / Critical |
| Change Propagation | N | X.X | ... |
| Knowledge Duplication | N | X.X | ... |
| Accidental Complexity | N | X.X | ... |
| Dependency Disorder | N | X.X | ... |
| Domain Model Distortion | N | X.X | ... |

**Recommended focus:** [The one or two risks with the highest average priority — these are
where investment will have the most impact.]
```
```

- [ ] **Step 2: Verify**

```bash
wc -l skills/brooks-lint/debt-guide.md
```

Expected: 90–120 lines.

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/debt-guide.md
git commit -m "feat: rewrite debt-guide.md — Pain×Spread formula, six decay risk scan"
```

---

## Task 6: Update commands/ files

**Files:**
- Modify: `commands/brooks-review.md`
- Modify: `commands/brooks-audit.md`
- Modify: `commands/brooks-debt.md`

- [ ] **Step 1: Update commands/brooks-review.md**

Replace the entire content with:

```markdown
---
description: Run a Brooks-Lint PR review on the current code or diff
---

Use the brooks-lint skill to perform a PR review (Mode 1).
Load the skill via the Skill tool, then analyze the current code, diff, or
file the user has provided using the six decay risk framework (drawing from
The Mythical Man-Month, Code Complete, Refactoring, Clean Architecture,
The Pragmatic Programmer, and Domain-Driven Design).
Read pr-review-guide.md from the skill directory for the detailed process.
```

- [ ] **Step 2: Update commands/brooks-audit.md**

Replace the entire content with:

```markdown
---
description: Run a Brooks-Lint architecture audit on the current project
---

Use the brooks-lint skill to perform an architecture audit (Mode 2).
Load the skill via the Skill tool, then analyze the project structure,
module dependencies, and architectural patterns using the six decay risk
framework (drawing from The Mythical Man-Month, Code Complete, Refactoring,
Clean Architecture, The Pragmatic Programmer, and Domain-Driven Design).
Read architecture-guide.md from the skill directory for the audit framework.
```

- [ ] **Step 3: Update commands/brooks-debt.md**

Replace the entire content with:

```markdown
---
description: Run a Brooks-Lint tech debt assessment on the current codebase
---

Use the brooks-lint skill to perform a tech debt assessment (Mode 3).
Load the skill via the Skill tool, then classify and prioritize technical
debt using the six decay risk framework and Pain×Spread priority formula
(drawing from The Mythical Man-Month, Code Complete, Refactoring,
Clean Architecture, The Pragmatic Programmer, and Domain-Driven Design).
Read debt-guide.md from the skill directory for the debt classification
framework and Debt Summary Table template.
```

- [ ] **Step 4: Commit**

```bash
git add commands/
git commit -m "docs: update commands — reference six-book framework, remove outdated Brooks-only description"
```

---

## Task 7: Update README.md, CHANGELOG.md, and bump version

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `package.json`

- [ ] **Step 1: Read current README.md to understand what needs changing**

Read `README.md` and identify all references to:
- "eight dimensions" or "8 dimensions" (need updating to "six decay risks")
- "The Mythical Man-Month" as the only source (need to mention all six books)
- Any dimension table listing the eight Brooks dimensions (replace with six decay risks table)
- Any example report showing the old scoring format (replace with new diagnosis format)

- [ ] **Step 2: Update the README dimensions table**

In the dimensions table, replace the eight Brooks dimensions rows with:

```markdown
| Decay Risk | Diagnostic Question | Sources |
|------------|---------------------|---------|
| Cognitive Overload | How much mental effort to understand this? | Code Complete, Refactoring, DDD |
| Change Propagation | How many unrelated things break on one change? | Refactoring, Clean Architecture, Pragmatic |
| Knowledge Duplication | Is the same decision expressed in multiple places? | Pragmatic, Refactoring, DDD |
| Accidental Complexity | Is the code more complex than the problem? | Refactoring, Code Complete, Brooks |
| Dependency Disorder | Do dependencies flow in a consistent direction? | Clean Architecture, Brooks, Pragmatic |
| Domain Model Distortion | Does the code faithfully represent the domain? | DDD, Refactoring |
```

- [ ] **Step 3: Update README example report**

Replace any example showing the old `| Dimension | Score |` table format with an example
showing the new finding format:

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

- [ ] **Step 4: Update README header/intro to mention all six books**

Change any line that says "based on The Mythical Man-Month" to reference all six books,
for example:
"Code quality reviews drawing on six classic engineering books: *The Mythical Man-Month*,
*Code Complete*, *Refactoring*, *Clean Architecture*, *The Pragmatic Programmer*, and
*Domain-Driven Design*."

- [ ] **Step 5: Add v0.4.0 entry to CHANGELOG.md**

Add at the top of CHANGELOG.md (above the [0.3.0] entry):

```markdown
## [0.4.0] - 2026-03-27

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
```

- [ ] **Step 6: Bump version in package.json**

Change `"version": "0.3.0"` to `"version": "0.4.0"` in `package.json`.

- [ ] **Step 7: Commit all documentation and version changes**

```bash
git add README.md CHANGELOG.md package.json
git commit -m "docs: update README and CHANGELOG for v0.4.0 multi-book framework"
```

---

## Verification Checklist

After all tasks are complete, verify the following:

- [ ] `ls skills/brooks-lint/` does NOT include `brooks-principles.md`
- [ ] `ls skills/brooks-lint/` DOES include `decay-risks.md`
- [ ] `grep -r "brooks-principles" skills/` returns no results
- [ ] `grep -r "8 dimensions\|eight dimensions\|Brooks's 7\|Brooks's 8" skills/ commands/` returns no results
- [ ] `grep "0.4.0" package.json` returns the version line
- [ ] `grep "0.4.0" CHANGELOG.md` returns the changelog entry header
- [ ] Manual: load the skill in a session, ask it to review a code snippet, verify the output follows the Symptom → Source → Consequence → Remedy format with 🔴/🟡/🟢 labels
