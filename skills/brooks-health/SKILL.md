---
name: brooks-health
description: >
  Combined codebase health dashboard that scores a project across all four quality
  dimensions — PR quality, architecture, tech debt, and test quality — in a single
  pass, drawing on twelve classic engineering books.
  Triggers when: user wants an overall quality assessment, asks "how healthy is this
  codebase?", "run all the checks", "give me a big-picture quality report", "I need a
  health score before the release", "what's the overall state of our code?", or wants
  to onboard a new team with a quality overview.
  Use this skill proactively when the user wants breadth over depth — a unified view
  across all quality dimensions — even if they just say "check the code quality" or
  "how are we doing overall?".
  Do NOT trigger for: server health checks, HTTP health endpoints, Kubernetes
  liveness/readiness probes, database health, or application uptime. Also do not
  trigger when the user specifically requests only one dimension — use the
  corresponding focused skill instead (brooks-review / brooks-audit /
  brooks-debt / brooks-test).
---

# Brooks-Lint — Health Dashboard

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../_shared/decay-risks.md` for production risk symptom definitions
4. Read `../_shared/test-decay-risks.md` for test risk symptom definitions
5. Read `health-guide.md` in this directory for the dashboard orchestration process

## Process

**If the user has not specified a project or directory:** apply Auto Scope Detection
from `../_shared/common.md` to determine the review scope before proceeding.

1. Run abbreviated scans across all four dimensions (Step 1 of the guide)
2. Compute per-dimension and composite Health Scores with weighting (Step 2 of the guide)
3. Output the Health Dashboard using the dashboard report template (Step 3 of the guide)

**Mode line in report:** `Health Dashboard`
