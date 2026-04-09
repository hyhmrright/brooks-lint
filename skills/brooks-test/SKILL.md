---
name: brooks-test
description: >
  Test quality review drawing on xUnit Test Patterns, The Art of Unit Testing,
  How Google Tests Software, Working Effectively with Legacy Code, and other
  classic engineering books.
  Triggers when: user asks about test quality, flaky tests, mock abuse,
  test debt, legacy code testability, or shares test files for review.
  Also triggers when user mentions: test smells / characterization tests /
  test pyramid / test doubles / over-mocking / brittle tests.
  Use this skill proactively whenever test files are shared for review.
---

# Brooks-Lint — Test Quality Review

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/test-decay-risks.md` for test-space symptom definitions and source attributions
3. Read `test-guide.md` in this directory for the test quality review framework

## Process

1. Build the test suite map (unit/integration/E2E counts and ratio)
2. Scan for each test decay risk in the order specified in the guide
3. Output using the Report Template from common.md

**Mode line in report:** `Test Quality Review`
