---
name: brooks-debt
description: >
  Tech debt assessment drawing on twelve classic engineering books: The Mythical Man-Month,
  Code Complete, Refactoring, Clean Architecture, The Pragmatic Programmer,
  Domain-Driven Design, A Philosophy of Software Design, Software Engineering at Google,
  xUnit Test Patterns, The Art of Unit Testing, Working Effectively with Legacy Code,
  and How Google Tests Software.
  Triggers when: user asks about tech debt, where to refactor, what to clean up first,
  codebase health (in the software quality sense — not server/HTTP health endpoints),
  or systemic maintainability questions.
  Also triggers when user asks: why the codebase is hard to maintain, why it's a mess,
  why adding developers isn't helping, why complexity keeps growing, what the worst part
  of the codebase is, or where to start paying back debt.
  Do NOT trigger for: server health checks, HTTP /health endpoints, infrastructure monitoring,
  or questions about application uptime — "health check" in those contexts means something
  different and this skill is not relevant.
  Use this skill proactively when maintainability or refactoring priorities are discussed.
---

# Brooks-Lint — Tech Debt Assessment

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../_shared/decay-risks.md` for symptom definitions and source attributions
4. Read `debt-guide.md` in this directory for the debt classification framework

## Process

**If the user has not described the codebase or pointed to specific areas:** apply Auto
Scope Detection from `../_shared/common.md` to determine the assessment scope before proceeding.

1. Scan for all six decay risks; list every finding before scoring any of them
2. Apply the Pain x Spread priority formula
3. Output using the Report Template from common.md, plus the Debt Summary Table

**Mode line in report:** `Tech Debt Assessment`
