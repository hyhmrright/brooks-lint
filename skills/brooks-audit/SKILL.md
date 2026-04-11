---
name: brooks-audit
description: >
  Architecture audit drawing on eight production-code classics: The Mythical Man-Month,
  Code Complete, Refactoring, Clean Architecture, The Pragmatic Programmer,
  Domain-Driven Design, A Philosophy of Software Design, Software Engineering at Google,
  and related architectural principles encoded in Brooks-Lint.
  Triggers when: user asks to audit architecture, review module structure,
  check system design, or assess project organization.
  Also triggers when user mentions: clean architecture / dependency inversion /
  hexagonal architecture / bounded contexts / module coupling / package structure.
  Use this skill proactively when project structure or module dependencies are discussed.
---

# Brooks-Lint — Architecture Audit

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../_shared/decay-risks.md` for symptom definitions and source attributions
4. Read `architecture-guide.md` in this directory for the audit framework

## Process

1. Draw the module dependency graph as a Mermaid diagram (Step 1 of the guide)
2. Scan for each decay risk in the order specified in the guide
3. Assign node colors in the Mermaid diagram based on findings (red/yellow/green)
4. Run the Conway's Law check
5. Output using the Report Template from common.md — Mermaid graph FIRST, then Findings

**Mode line in report:** `Architecture Audit`
