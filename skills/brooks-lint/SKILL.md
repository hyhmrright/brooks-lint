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

1. Read `pr-review-guide.md` in this directory for the analysis process
2. Read `decay-risks.md` in this directory for symptom definitions and source attributions
3. Scan the diff or code for each decay risk in the order specified in the guide
4. Apply the Iron Law to every finding
5. Output using the Report Template below

### Mode 2: Architecture Audit

1. Read `architecture-guide.md` in this directory for the analysis process
2. Read `decay-risks.md` in this directory for symptom definitions and source attributions
3. Draw the module dependency map
4. Scan for each decay risk in the order specified in the guide
5. Run the Conway's Law check
6. Output using the Report Template below

### Mode 3: Tech Debt Assessment

1. Read `debt-guide.md` in this directory for the analysis process
2. Read `decay-risks.md` in this directory for symptom definitions and source attributions
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
