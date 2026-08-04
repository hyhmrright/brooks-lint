---
name: brooks-sweep
description: >
  Full-sweep mode: runs a unified analysis across all quality dimensions — code decay,
  architecture, tech debt, and test quality — then applies fixes directly to the
  codebase. Safe changes are auto-applied; risky changes are confirmed before
  execution. Drawing on twelve classic engineering books.
  Triggers when: user wants to "fix everything", "sweep the codebase", "auto-fix all
  issues", "clean up the whole project", or asks for a single command that both
  diagnoses and remediates quality problems.
  Do NOT trigger for: read-only audits or health reports where the user only wants
  findings without code changes; single-dimension reviews (use the focused skill
  instead: brooks-review / brooks-audit / brooks-debt / brooks-test); server health
  checks, HTTP /health endpoints, Kubernetes probes, database health, or application uptime.
---

# Brooks-Lint — Full Sweep & Auto-Fix

## Setup

Read in order:

1. `../_shared/common.md` — Iron Law, Project Config, Report Template, Health Score
2. `../_shared/source-coverage.md` — book coverage, exceptions, tradeoffs
3. `../_shared/decay-risks.md` — production risk symptoms
4. `../_shared/test-decay-risks.md` — test risk symptoms
5. `sweep-guide.md` (this directory) — the unified scan and fix process

## Process

**Scope:** if the user did not specify a project or directory, apply Auto Scope Detection
(`../_shared/common.md`) first.

1. Show the pre-flight consent notice and wait for one-time approval (Step 0 of the guide)
2. Enumerate scope and initialize pipeline state (Step 1 of the guide)
3. Run the four dimensions in sequence — review, test, debt, audit — each scanning, classifying, fixing, and verifying (Steps 2–5 of the guide)
4. Iterate over modified files and their consumers until a clean round or the cap (Step 6 of the guide)
5. Aggregate residual and unresolvable items and output the Full Sweep Report (Steps 7–8 of the guide)

**Mode line in report:** `Full Sweep`
