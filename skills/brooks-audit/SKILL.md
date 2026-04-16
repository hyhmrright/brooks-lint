---
name: brooks-audit
description: >
  Architecture audit drawing on twelve classic engineering books: The Mythical Man-Month,
  Code Complete, Refactoring, Clean Architecture, The Pragmatic Programmer,
  Domain-Driven Design, A Philosophy of Software Design, Software Engineering at Google,
  xUnit Test Patterns, The Art of Unit Testing, Working Effectively with Legacy Code,
  and How Google Tests Software.
  Triggers when: user asks to audit architecture, review module or folder structure,
  check system design, understand how the codebase is organized, assess project layout,
  or asks "is this a good design?", "where should I put X?", or "why does everything
  depend on everything?".
  Also triggers when user mentions: clean architecture / dependency inversion /
  hexagonal architecture / bounded contexts / module coupling / package structure /
  tangled dependencies / circular imports / spaghetti code / directory layout.
  Also triggers when: user asks for a codebase tour, onboarding guide, or "explain this
  project to someone new" — use onboarding mode (see Process section below).
  Do NOT trigger for: PR-level code review (use brooks-review) or line-level refactoring
  questions — this skill analyzes structural/module-level concerns, not individual functions.
  Use this skill proactively when project structure or module dependencies are discussed.
---

# Brooks-Lint — Architecture Audit

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../_shared/decay-risks.md` for symptom definitions and source attributions
4. Read `architecture-guide.md` in this directory for the audit framework

## Process

**Onboarding mode:** If the user asks for an onboarding report, codebase tour, or
"explain this codebase to a new developer", read `onboarding-guide.md` from this
directory and follow it instead of `architecture-guide.md`. This mode explains rather
than diagnoses — no Health Score, no Iron Law findings.

**If the user has not specified files or a directory to audit:** apply Auto Scope
Detection from `../_shared/common.md` to determine the audit scope before proceeding.

1. Draw the module dependency graph as a Mermaid diagram (Step 1 of the guide)
2. Scan for each decay risk in the order specified in the guide (Steps 2–4)
3. Assign node colors in the Mermaid diagram based on findings (red/yellow/green) — do this after Step 4
4. Run the Testability Seam Assessment (Step 5)
5. Run the Conway's Law check (Step 6)
6. Output using the Report Template from common.md — Mermaid graph FIRST, then Findings

**Mode line in report:** `Architecture Audit`
