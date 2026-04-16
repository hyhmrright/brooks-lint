---
name: brooks-test
description: >
  Test quality review drawing on twelve classic engineering books, with primary focus
  on xUnit Test Patterns, The Art of Unit Testing, How Google Tests Software,
  and Working Effectively with Legacy Code.
  Triggers when: user asks about test quality, shares test files for review,
  or complains that tests keep breaking for no reason, tests are slow, tests are hard
  to understand, test setup is complicated, or they can't tell what a test is testing.
  Also triggers when user mentions: test smells / characterization tests /
  test pyramid / test doubles / over-mocking / brittle tests / flaky tests /
  too many mocks / tests break on refactoring / slow test suite.
  Do NOT trigger for: writing new tests from scratch (use the regular test-writing workflow)
  or questions about testing frameworks and syntax — this skill reviews an existing test
  suite for structural quality problems, not individual test authoring questions.
  Use this skill proactively whenever test files are shared for review.
---

# Brooks-Lint — Test Quality Review

## Setup

1. Read `../_shared/common.md` for the Iron Law, Project Config, Report Template, and Health Score rules
2. Read `../_shared/source-coverage.md` for book-level coverage, exceptions, and tradeoffs
3. Read `../_shared/test-decay-risks.md` for test-space symptom definitions and source attributions
4. Read `test-guide.md` in this directory for the test quality review framework

## Process

**If the user has not shared test files or pointed to a test directory:** apply Auto
Scope Detection from `../_shared/common.md` to determine the review scope before proceeding.

1. Build the test suite map (unit/integration/E2E counts and ratio)
2. Scan for each test decay risk in the order specified in the guide
3. Output using the Report Template from common.md

**Mode line in report:** `Test Quality Review`
