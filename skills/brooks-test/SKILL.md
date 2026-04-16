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
  take forever", "I can't understand what this test is doing", "tests pass but bugs
  still reach production", "we have too many mocks".
  Also triggers when user mentions: test smells / characterization tests / test pyramid /
  over-mocking / brittle tests / flaky tests / tests break on refactoring / slow test
  suite / mystery guest / test duplication / tests don't catch bugs.
  Use this skill proactively whenever test files are shared or the user complains about
  their test suite — even without using technical terminology.
  Do NOT trigger for: writing new tests from scratch (use the regular test-writing
  workflow) or testing framework/syntax questions — this skill reviews an existing
  suite for structural quality problems, not individual test authoring.
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
