---
name: brooks-review
description: >
  PR code review that surfaces decay risks, design smells, and maintainability
  issues with concrete Symptom → Source → Consequence → Remedy findings, drawing
  on twelve classic engineering books.
  Triggers when: user asks to review code, check a PR, shares a diff or pastes
  code asking "does this look right?" / "any issues here?" / "ready to merge?",
  or asks for feedback on a function, class, or file.
  Also triggers when user mentions: code smells / refactoring / clean architecture /
  DDD / SOLID principles / Hyrum's Law / deep modules / tactical programming /
  conceptual integrity / Brooks's Law / Mythical Man-Month / second system effect.
  Do NOT trigger for: questions about how to write code from scratch, language syntax
  questions, or framework/tool questions where no existing code is shared.
---

# Brooks-Lint — PR Review

## Setup

Read in order:

1. `../_shared/common.md` — Iron Law, Project Config, Report Template, Health Score
2. `../_shared/source-coverage.md` — book coverage, exceptions, tradeoffs
3. `../_shared/decay-risks.md` — symptom definitions and source attributions
4. `pr-review-guide.md` (this directory) — the analysis process

## Process

**Scope:** if the user did not specify files or paste code, apply Auto Scope Detection
(`../_shared/common.md`) first.

1. Understand the review scope, then scan for each decay risk in the order specified (Steps 1–6 of the guide)
2. Run the Quick Test Check (Step 7 of the guide) — skip for docs-only or non-production changes
3. Apply the Iron Law to every finding
4. Output using the Report Template from common.md

**Mode line in report:** `PR Review`
