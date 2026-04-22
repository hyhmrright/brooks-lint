---
name: brooks-sweep
description: >
  Full-sweep mode: runs a unified analysis across all quality dimensions — code decay,
  architecture, tech debt, and test quality — then applies fixes directly to the
  codebase. Safe changes are auto-applied; risky changes are confirmed before
  execution. Drawing on twelve classic engineering books.
  Triggers when: user wants to "fix everything", "sweep the codebase", "auto-fix all
  issues", "run all checks and fix them", "clean up the whole project", or asks for
  a single command that both diagnoses and remediates quality problems.
  Do NOT trigger for: read-only audits or health reports where the user only wants
  findings without code changes; single-dimension reviews (use the focused skill
  instead: brooks-review / brooks-audit / brooks-debt / brooks-test); server health
  checks, HTTP /health endpoints, Kubernetes probes, or application uptime.
---

# Brooks-Lint — Full Sweep & Auto-Fix

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../_shared/decay-risks.md` for production risk symptom definitions
4. Read `../_shared/test-decay-risks.md` for test risk symptom definitions
5. Read `sweep-guide.md` in this directory for the unified scan and fix process

## Process

**If the user has not specified a project or directory:** apply Auto Scope Detection
from `../_shared/common.md` to determine the review scope before proceeding.

1. Run a unified scan across all production and test decay risks in one pass (Steps 1–3 of the guide)
2. Aggregate, deduplicate, and classify findings by severity and fix-safety (Step 4 of the guide)
3. Apply auto-fixes for safe, local, reversible findings (Steps 5–6 of the guide)
4. Confirm with user before applying high-risk or multi-file changes (Step 7 of the guide)
5. Output the Sweep Report with fix log, confirmed changes, and residual items (Step 8 of the guide)

**Mode line in report:** `Full Sweep`
