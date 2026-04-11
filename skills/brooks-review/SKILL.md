---
name: brooks-review
description: >
  PR code review drawing on eight production-code classics: The Mythical Man-Month,
  Code Complete, Refactoring, Clean Architecture, The Pragmatic Programmer,
  Domain-Driven Design, A Philosophy of Software Design, Software Engineering at Google,
  plus a lightweight test sanity check informed by xUnit Test Patterns,
  The Art of Unit Testing, and Working Effectively with Legacy Code.
  Triggers when: user asks to review code, check a PR, review a pull request,
  or shares a diff for feedback.
  Also triggers when user mentions: Brooks's Law / Mythical Man-Month / conceptual integrity /
  second system effect / code smells / refactoring / clean architecture / DDD /
  domain-driven design / SOLID principles / Hyrum's Law / deep modules / tactical programming.
  Use this skill proactively whenever code, a diff, or a PR is shared for review.
---

# Brooks-Lint — PR Review

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/decay-risks.md` for symptom definitions and source attributions
3. Read `pr-review-guide.md` in this directory for the analysis process

## Process

1. Scan the diff or code for each decay risk in the order specified in the guide
2. Apply the Iron Law to every finding
3. Output using the Report Template from common.md

**Mode line in report:** `PR Review`
