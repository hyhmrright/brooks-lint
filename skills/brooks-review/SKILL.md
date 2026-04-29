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
  DDD / domain-driven design / SOLID principles / Hyrum's Law / deep modules /
  tactical programming / conceptual integrity / Brooks's Law / Mythical Man-Month /
  second system effect.
  Do NOT trigger for: questions about how to write code from scratch, language syntax
  questions, or framework/tool questions where no existing code is shared.
---

# Brooks-Lint — PR Review

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../_shared/decay-risks.md` for symptom definitions and source attributions
4. Read `pr-review-guide.md` in this directory for the analysis process

## Process

**If the user has not specified files or pasted code:** apply Auto Scope Detection
from `../_shared/common.md` to determine the review scope before proceeding.

1. Understand the review scope, then scan for each decay risk in the order specified (Steps 1–6 of the guide)
2. Run the Quick Test Check (Step 7 of the guide) — skip for docs-only or non-production changes
3. Apply the Iron Law to every finding
4. Output using the Report Template from common.md

**Mode line in report:** `PR Review`
