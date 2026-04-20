---
name: brooks-debt
description: >
  Tech debt assessment that identifies, classifies, and prioritizes maintainability
  problems — helping teams build a refactoring roadmap — drawing on twelve classic
  engineering books.
  Triggers when: user asks about tech debt, refactoring priorities, what to clean up
  first, or asks "why is this so hard to change?", "where's the most painful part?",
  "what should we fix first?", "how do I justify refactoring to management?",
  "why is our velocity dropping?".
  Also triggers when user asks: why the codebase is hard to maintain, why complexity
  keeps growing, why adding developers isn't helping, what a realistic refactoring
  roadmap looks like, which legacy modules are most risky.
  Use this skill proactively when maintainability, refactoring priorities, or legacy
  code problems come up — even if "tech debt" isn't mentioned explicitly.
  Do NOT trigger for: server health checks, HTTP /health endpoints, Kubernetes probes,
  database health, or application uptime — "health" in those contexts is infrastructure,
  not code quality. Also not for single-function refactoring questions.
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

1. Scan for all six decay risks (Step 1 of the guide); list every finding before scoring
2. Apply the Pain × Spread priority formula and classify debt intent (Steps 2–3 of the guide)
3. Group findings by decay risk (Step 4 of the guide)
4. Output using the Report Template from common.md, plus the Debt Summary Table

**Mode line in report:** `Tech Debt Assessment`
