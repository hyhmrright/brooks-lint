# Tech Debt Assessment Guide — Mode 3 Framework

**Core principle:** Not all debt is equal. Classify before prioritizing — the urgency of debt depends on how much it compounds and how much it blocks future work.

---

## Evidence Gathering

Before classifying, ask the user ONE targeted question if you lack sufficient evidence, then proceed with available evidence:

1. "Which part of the codebase takes the longest to modify for a typical feature?"
2. "Which module do developers avoid touching, and why?"
3. "How has time-to-merge for PRs changed over the past 6 months?"
4. "Which parts of the system have the fewest tests and the most bugs?"
5. "Is there a module that only one person understands?"

Choose the single question most relevant to what you already know. After one answer, proceed — do not continue asking.

---

## The 5 Debt Categories

### Category 1: Conceptual Debt

**Brooks principle:** Conceptual Integrity
**Definition:** The codebase has no coherent design philosophy. Multiple competing patterns coexist.

**Identification features:**
- Multiple naming conventions in the same module (camelCase + snake_case, mix of languages)
- Multiple error-handling strategies (exceptions + error codes + nulls) with no rule for which to use
- Multiple data access patterns (ORM + raw SQL + stored procedures) without clear rules
- API inconsistency: some endpoints return `{data: ..., error: ...}`, others return raw objects

**Severity:**
- **High:** Inconsistency in core domain logic or public API — affects every developer, every day
- **Medium:** Inconsistency confined to one subsystem or integration layer
- **Low:** Inconsistency in tooling, scripts, or configuration files only

**Repayment approach:** Establish the canonical pattern, document it, then migrate opportunistically (fix on touch, not in bulk).

---

### Category 2: Structural Debt

**Brooks principle:** The Tar Pit / Communication Overhead
**Definition:** Module boundaries have eroded. Dependencies are tangled.

**Identification features:**
- Circular dependencies between modules
- "God" modules that everything depends on
- Business logic scattered across layers (domain logic in HTTP handlers, UI logic in services)
- Shared mutable global state
- A change in one module reliably breaks something in an unrelated module

**Severity:**
- **High:** Circular dependencies in core modules, or business logic in infrastructure — blocks refactoring and testing
- **Medium:** Circular dependencies in peripheral modules, or mild layer violations
- **Low:** Slightly oversized modules with clear responsibility despite the size

**Repayment approach:** Strangler Fig pattern — introduce clean interfaces at module boundaries and migrate code behind them incrementally. Do not attempt big-bang refactors.

---

### Category 3: Over-Engineering Debt

**Brooks principle:** Second System Effect
**Definition:** The system is more complex than the problem requires. Abstractions have only one implementation.

**Identification features:**
- Interfaces with exactly one implementing class, unchanged for 6+ months
- Configuration options never set to non-default values
- Plugin or extension systems with only one plugin
- Framework code larger than the application code it supports
- Features that exist "for flexibility" but have never been used by any real user

**Severity:**
- **High:** Core user flows require navigating multiple indirection layers to trace or modify
- **Medium:** Over-engineering in supporting infrastructure (e.g., config system)
- **Low:** A single unused abstraction in a low-traffic path

**Repayment approach:** YAGNI enforcement — delete unused abstractions, simplify interfaces to their actual usage. This type of debt is uniquely easy to repay (deletion is cheap).

---

### Category 4: Knowledge Debt

**Brooks principle:** Surgical Team Principle
**Definition:** Critical knowledge about the system is held by one person or lost entirely.

**Identification features:**
- Modules commented "DO NOT TOUCH without asking [name]"
- No tests in critical modules (can't verify correctness of changes without the original author)
- Business rules embedded in code with no documentation of *why* they exist
- Only one person makes PRs in a given module over a 3-month window
- Onboarding a new developer in this area takes > 1 week

**Severity:**
- **High:** Knowledge about core business rules exists only in one person's head — single point of failure
- **Medium:** One person is the primary expert but others could figure it out with significant effort
- **Low:** One person is the most efficient expert but documentation exists

**Repayment approach:** Documentation sprints + pairing. Write ADRs (Architecture Decision Records) for the most obscure decisions. Knowledge debt is repaid by spreading, not by refactoring.

---

### Category 5: Test Debt

**Brooks principle:** Plan to Throw One Away
**Definition:** Critical paths cannot be safely changed because there is no way to verify correctness.

**Identification features:**
- Coverage < 40% on modules that change frequently
- Tests that only test the happy path with no edge cases
- Tests that rely on mocking so heavily they don't test real behavior
- Integration tests that are flaky or disabled
- A module where the last 5 PRs all introduced regressions

**Severity:**
- **High:** Core business logic or data mutation paths have no tests — dangerous to modify
- **Medium:** Edge cases uncovered in important paths, or tests exist but are unreliable
- **Low:** Low coverage on stable, low-risk utility modules

**Repayment approach:** Write tests for the highest-risk paths first (not the highest-traffic paths). A test that catches a $1M bug is worth more than 100 tests for string utilities.

---

## Debt Report Template

Use this structure in the output:

```
## Tech Debt Classification

### Dominant Debt Type: [Category Name]
[1-2 sentences on why this is the dominant type and what evidence supports it]

### Full Debt Inventory

| Category | Severity | Key Evidence | Estimated Impact |
|----------|----------|-------------|-----------------|
| Conceptual Debt | High | Mixed error handling in auth module | Slows every PR that touches auth |
| Structural Debt | Medium | Circular dep: UserService ↔ NotificationService | Risk of cascading failures |
| Over-Engineering Debt | Low | PluginSystem with one plugin | Minor cognitive overhead |
| Knowledge Debt | High | Payment module: only Alice understands it | Bus factor = 1 |
| Test Debt | Medium | <20% coverage on checkout flow | Regressions in last 3 deploys |

## Debt Repayment Roadmap

### P0 — Address this sprint (blocking growth)
[Items that are actively blocking feature development or causing frequent incidents]

### P1 — Address next sprint (compounding)
[Items that get worse over time if ignored]

### P2 — Backlog (stable, low-urgency)
[Items that are real debt but stable — track them, address opportunistically]

### Not debt — Accept as-is
[Things that look like debt but are actually justified complexity]
```
