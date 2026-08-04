---
name: brooks-test
description: >
  Test quality review drawing on twelve classic engineering books — with primary focus
  on xUnit Test Patterns, The Art of Unit Testing, How Google Tests Software, and
  Working Effectively with Legacy Code — that diagnoses structural problems in an
  existing test suite: brittleness, mock abuse, coverage illusions, slow execution,
  poor readability.
  Triggers when: user asks about test quality, shares test files for review, or
  expresses frustration: "tests keep breaking whenever I change anything", "our tests
  take forever", "tests pass but bugs still reach production", or "we have too many mocks".
  Do NOT trigger for: writing new tests from scratch (use the regular test-writing
  workflow) or testing framework/syntax questions — this skill reviews an existing
  suite for structural quality problems, not individual test authoring.
---

# Brooks-Lint — Test Quality Review

## Setup

Read in order:

1. `../_shared/common.md` — Iron Law, Project Config, Report Template, Health Score
2. `../_shared/source-coverage.md` — book coverage, exceptions, tradeoffs
3. `../_shared/test-decay-risks.md` — test-space symptom definitions and sources
4. `test-guide.md` (this directory) — the test quality review framework

## Process

**Scope:** if the user did not share test files or point to a test directory, apply Auto
Scope Detection (`../_shared/common.md`) first.

1. Build the test suite map (guide's "Before You Start" section)
2. Scan for each test decay risk in the order specified (Steps 1–4 of the guide)
3. Apply the Iron Law and output using the Report Template (Step 5 of the guide)

**Mode line in report:** `Test Quality Review`
