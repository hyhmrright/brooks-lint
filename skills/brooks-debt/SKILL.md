---
name: brooks-debt
description: >
  Tech debt assessment that identifies, classifies, and prioritizes maintainability
  problems — helping teams build a refactoring roadmap — drawing on twelve classic
  engineering books.
  Triggers when: user asks about tech debt, refactoring priorities, what to clean up
  first, or asks "why is this so hard to change?", "what should we fix first?", or
  "how do I justify refactoring to management?".
  Do NOT trigger for: server health checks, HTTP /health endpoints, Kubernetes probes,
  database health, or application uptime — "health" in those contexts is infrastructure,
  not code quality. Also not for single-function refactoring questions.
---

# Brooks-Lint — Tech Debt Assessment

## Setup

Read in order:

1. `../_shared/common.md` — Iron Law, Project Config, Report Template, Health Score
2. `../_shared/source-coverage.md` — book coverage, exceptions, tradeoffs
3. `../_shared/decay-risks.md` — symptom definitions and source attributions
4. `debt-guide.md` (this directory) — the debt classification framework

## Process

**Scope:** if the user did not describe the codebase or point to specific areas, apply
Auto Scope Detection (`../_shared/common.md`) first.

1. Scan for all six decay risks (Step 1 of the guide); list every finding before scoring
2. Apply the Pain × Spread priority formula and classify debt intent (Steps 2–3 of the guide)
3. Group findings by decay risk (Step 4 of the guide)
4. Output using the Report Template from common.md, plus the Debt Summary Table

**Mode line in report:** `Tech Debt Assessment`
