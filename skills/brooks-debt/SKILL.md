---
name: brooks-debt
description: >
  Tech debt assessment drawing on eight production-code classics: The Mythical Man-Month,
  Code Complete, Refactoring, Clean Architecture, The Pragmatic Programmer,
  Domain-Driven Design, A Philosophy of Software Design, Software Engineering at Google,
  and related maintainability principles encoded in Brooks-Lint.
  Triggers when: user asks about tech debt, where to refactor, health check,
  or systemic maintainability questions.
  Also triggers when user asks why the codebase is hard to maintain,
  why adding developers isn't helping, or why complexity keeps growing.
  Use this skill proactively when maintainability or refactoring priorities are discussed.
---

# Brooks-Lint — Tech Debt Assessment

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../_shared/decay-risks.md` for symptom definitions and source attributions
4. Read `debt-guide.md` in this directory for the debt classification framework

## Process

1. Scan for all six decay risks; list every finding before scoring any of them
2. Apply the Pain x Spread priority formula
3. Output using the Report Template from common.md, plus the Debt Summary Table

**Mode line in report:** `Tech Debt Assessment`
