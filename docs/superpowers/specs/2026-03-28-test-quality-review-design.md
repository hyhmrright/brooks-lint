# Design Spec: Test Quality Review (v0.5)

**Date:** 2026-03-28
**Status:** Approved
**Author:** brainstorming session

---

## Overview

Add test quality diagnosis to brooks-lint via two complementary mechanisms:

1. **Mode 4: Test Quality Review** — a dedicated test health audit triggered by `/brooks-lint:brooks-test`
2. **PR Review Step 7: Quick Test Check** — a lightweight 3-signal test scan appended to every Mode 1 PR Review

This design follows the same structural principles as the existing three modes: Iron Law (Symptom → Source → Consequence → Remedy), parallel decay risk taxonomy, and demand-loaded guide files.

---

## Motivation

The existing six decay risks diagnose production code quality. Test quality is a distinct and equally important concern:

- obra/superpowers TDD skill teaches *how to write* tests (process-oriented)
- brooks-lint should teach *how to diagnose* test health (diagnostic-oriented)

These are complementary, not overlapping. The four target books provide a complete diagnostic framework that maps naturally to the existing six-risk structure.

---

## Source Books

| Book | Author | Primary Contribution |
|------|--------|---------------------|
| xUnit Test Patterns | Gerard Meszaros | Test smell catalog (Assertion Roulette, Mystery Guest, Lazy Test, etc.) |
| The Art of Unit Testing | Roy Osherove | Test design quality (naming, assertions, mock usage rules) |
| How Google Tests Software | Google Engineering | Test architecture (pyramid ratios, coverage strategy) |
| Working Effectively with Legacy Code | Michael Feathers | Testability analysis (seam model, characterization tests) |

---

## Files Changed

| File | Change | Description |
|------|--------|-------------|
| `skills/brooks-lint/SKILL.md` | Modify | Add Mode 4, new trigger words, `/brooks-lint:brooks-test` command |
| `skills/brooks-lint/pr-review-guide.md` | Modify | Append Step 7: Quick Test Check |
| `skills/brooks-lint/test-decay-risks.md` | Create | 6 test-space decay risks with book attribution |
| `skills/brooks-lint/test-guide.md` | Create | Mode 4 five-step analysis process |
| `commands/brooks-lint/brooks-test.md` | Create | Slash command definition |

---

## The Six Test Decay Risks

Each mirrors one of the existing six decay risks in test space.

### T1: Test Obscurity (mirrors Cognitive Overload)

**Diagnostic question:** How much effort does it take to understand what this test verifies?

**Symptoms:**
- Assertion Roulette: multiple assertions with no message, can't tell which one failed
- Mystery Guest: test depends on external state not visible in the test body
- Test names that don't express scenario + expected outcome
- General Fixture: oversized setUp shared by unrelated tests

**Sources:**
- Meszaros — xUnit Test Patterns: Assertion Roulette (p.224), Mystery Guest (p.411), General Fixture (p.316)
- Osherove — The Art of Unit Testing: method_scenario_expected naming convention

**Severity:**
- 🔴 Critical: no test name in the file describes the behavior being tested; all assertions lack messages
- 🟡 Warning: multiple Mystery Guests; several ambiguous test names
- 🟢 Suggestion: minor naming issues; isolated General Fixture

---

### T2: Test Brittleness (mirrors Change Propagation)

**Diagnostic question:** Do tests break when you refactor without changing behavior?

**Symptoms:**
- Tests assert on private method results or internal state rather than public behavior
- Eager Test: one test verifies multiple unrelated behaviors
- Over-specified: assertions on mock call order or exact parameter values irrelevant to behavior
- Renaming a method causes 5+ tests to fail (tests coupled to implementation, not interface)

**Sources:**
- Meszaros — xUnit Test Patterns: Eager Test (p.228)
- Osherove — The Art of Unit Testing: test isolation principle
- Hunt & Thomas — The Pragmatic Programmer: Ch.2 Orthogonality

**Severity:**
- 🔴 Critical: refactoring causes test failures with no behavior change; > 5 tests coupled to same implementation detail
- 🟡 Warning: Eager Tests common; moderate implementation-detail assertions
- 🟢 Suggestion: isolated over-specification in non-critical tests

---

### T3: Test Duplication (mirrors Knowledge Duplication)

**Diagnostic question:** Is the same test scenario expressed in multiple places?

**Symptoms:**
- Test Code Duplication: same setup/assertion logic copy-pasted across multiple tests
- Lazy Test: multiple tests verifying identical behavior with no differentiation
- Same boundary condition tested at unit, integration, and E2E level with no layer differentiation
- Test helpers or fixtures duplicated instead of shared

**Sources:**
- Meszaros — xUnit Test Patterns: Test Code Duplication (p.213), Lazy Test (p.232)
- Hunt & Thomas — The Pragmatic Programmer: DRY principle (applies to test code)

**Severity:**
- 🔴 Critical: core business scenario fully duplicated across all three test layers with no differentiation
- 🟡 Warning: common scenario setup repeated in 5+ tests without extraction
- 🟢 Suggestion: minor helper duplication; isolated Lazy Tests

---

### T4: Mock Abuse (mirrors Accidental Complexity)

**Diagnostic question:** Is the test more complex than the behavior it tests?

**Symptoms:**
- Mock setup code longer than the test logic itself
- Primary assertion is `expect(mock).toHaveBeenCalledWith(...)` — testing mock, not behavior
- Test-only methods added to production classes (lifecycle management leaking into production code)
- Single unit test uses > 3 mocks
- Incomplete Mock: mock missing fields that downstream code accesses (silent failures)
- Hard-Coded Test Data: test data bears no resemblance to real data shapes

**Sources:**
- Osherove — The Art of Unit Testing: mock usage guidelines (≤ 3 mocks, 1–3 assertions per test)
- obra/superpowers TDD — testing-anti-patterns: Testing Mock Behavior, Test-Only Methods in Production
- Meszaros — xUnit Test Patterns: Hard-Coded Test Data (p.534)

**Severity:**
- 🔴 Critical: mock setup > 50% of test code; production class has test-only methods
- 🟡 Warning: mocks consistently > 3; primary assertions are mock call verifications
- 🟢 Suggestion: isolated Incomplete Mocks; minor Hard-Coded Test Data

---

### T5: Coverage Illusion (mirrors Dependency Disorder)

**Diagnostic question:** Does the test suite actually protect against the failures that matter?

**Symptoms:**
- High line coverage but error-handling paths and boundary conditions untested
- Happy-path only: no sad paths, no boundary inputs, no null/empty cases
- Legacy code areas with no tests being actively modified ("legacy code = code without tests" — Feathers)
- Coverage percentage treated as vanity metric; critical change paths untested
- Assertions on return values but not on important side effects (DB writes, events, state changes)

**Sources:**
- Feathers — Working Effectively with Legacy Code: Ch.1 "Legacy code is code without tests"
- Google — How Google Tests Software: change coverage vs line coverage
- Osherove — The Art of Unit Testing: test completeness principle

**Severity:**
- 🔴 Critical: legacy code area being modified with no tests; error-handling paths entirely blank
- 🟡 Warning: coverage > 80% but edge/exception paths systematically absent
- 🟢 Suggestion: a few non-critical paths missing sad-path tests

---

### T6: Architecture Mismatch (mirrors Domain Model Distortion)

**Diagnostic question:** Does the test suite structure reflect the system's actual risk profile?

**Symptoms:**
- Inverted test pyramid: more E2E/integration tests than unit tests (slow, fragile suite)
- Legacy code with no seam points: no dependency injection or seams, untestable without modifying production code
- Legacy areas being modified lack Characterization Tests to capture current behavior
- Full suite execution time > 10 minutes (indicates architectural problem, not performance problem)
- High-risk and low-risk paths tested at identical density with no risk-based prioritization

**Sources:**
- Google — How Google Tests Software: 70:20:10 unit:integration:E2E ratio
- Feathers — Working Effectively with Legacy Code: Ch.4 Seam Model, Ch.13 Characterization Tests
- Meszaros — xUnit Test Patterns: test suite design principles

**Severity:**
- 🔴 Critical: legacy code being modified has no seams and no characterization tests; pyramid fully inverted
- 🟡 Warning: suite > 10 minutes; integration/E2E count exceeds unit tests
- 🟢 Suggestion: localized pyramid ratio deviation; a few legacy areas missing characterization tests

---

## Mode 4: Test Quality Review

### Trigger

- User shares test files and asks "are our tests good?"
- User asks about test quality, test debt, flaky tests, mock usage
- User mentions: test smells, test debt, unit testing quality, mock abuse, legacy code testability
- Slash command: `/brooks-lint:brooks-test`

### Analysis Process (Five Steps)

**Before starting: Build the test suite map**

```
Unit tests:        X files, ~N tests
Integration tests: X files, ~N tests
E2E tests:         X files, ~N tests
Ratio:             Unit X%  :  Integration X%  :  E2E X%
Coverage areas:    [modules with tests] vs [modules without]
```

If unable to gather stats, ask one question: "Which module is hardest to test or has the least coverage?" Proceed after one answer.

**Step 1: Scan for Test Obscurity** *(scan first — most visible, determines suite maintainability)*

- Can test names communicate "subject + scenario + expected" without reading the test body?
- Any tests where assertion failure makes it impossible to determine which behavior broke?
- Any test setup that depends on state outside the test body?

**Step 2: Scan for Test Brittleness and Mock Abuse** *(these often co-occur — over-mocking causes fragility)*

Brittleness:
- Any recent refactor where tests broke due to implementation change, not behavior change?
- Are there Eager Tests (name contains "and", or 3+ unrelated assertions)?
- Assertions over-specifying mock call order or irrelevant parameter values?

Mock Abuse:
- Sample 3–5 tests: does mock setup exceed test logic in length?
- Are primary assertions `expect(mock).toHaveBeenCalledWith(...)` rather than behavior verification?
- Any test-only methods in production classes?

**Step 3: Scan for Test Duplication**

- Same setup block repeated in 5+ tests without extraction?
- Same business scenario tested identically at unit, integration, and E2E with no differentiation?

**Step 4: Scan for Coverage Illusion and Architecture Mismatch**

Coverage Illusion:
- Core modules recently modified: are error-handling branches and boundary inputs covered?
- Are legacy code areas (old, long functions, no tests) being actively changed?

Architecture Mismatch:
- Does the suite map from Step 0 approximate 70:20:10?
- Are legacy areas being modified covered by characterization tests?
- Is full suite execution time known? > 10 minutes → note as Warning.

**Step 5: Apply Iron Law, output report**

Every finding must be written as:
```
**[Test Risk Name] — [Short title]**
Symptom: [specific observation in the test files]
Source: [Book title — smell/principle name]
Consequence: [what happens to the test suite if not addressed]
Remedy: [concrete, specific action]
```

Use the standard Report Template from `SKILL.md`.
Mode: Test Quality Review
Scope: test files or directory reviewed.

---

## PR Review Step 7: Quick Test Check

Appended to `pr-review-guide.md` after Step 6. Lightweight — three signals only. Does not run the full Mode 4 process.

**Signal 1: Do tests exist?**
- Did the diff modify production code? Are corresponding test changes included?
- New public behavior added with no new tests → 🟡 Warning: Coverage Illusion (new behavior untested)
- Pure refactor with existing test coverage → skip

**Signal 2: Quick Mock Abuse sniff**
- Does the diff include test files? Is mock setup obviously longer than test logic?
- Is `toHaveBeenCalledWith` the only assertion?
- Did the diff add any methods to production classes that are only called from test files?

**Signal 3: Quick Test Obscurity sniff**
- Do new test names express scenario + expected outcome?
- Any new tests with multiple assertions and no message strings?

**Output rule:** If all three signals are clean → no Test findings, proceed to report. If findings exist → write using Iron Law format, Source pointing to the relevant test book.

> **Note:** Step 7 is a fast check, not a full audit. When systemic test problems are found, recommend running `/brooks-lint:brooks-test` for a complete diagnosis.

---

## SKILL.md Changes Required

### Mode Detection Table (new row)

| Context | Mode |
|---------|------|
| Test files shared, "are our tests good?", test debt, flaky tests, mock abuse, legacy testability | **Mode 4: Test Quality Review** |

### Trigger Words to Add

`test smells` / `test debt` / `unit testing quality` / `flaky tests` / `mock abuse` / `legacy code testability` / `test coverage` / `characterization tests`

### New Slash Command

`/brooks-lint:brooks-test` → Mode 4: Test Quality Review

---

## Design Principles

1. **Parallel structure:** Six test decay risks mirror the six production decay risks. Same format, same Iron Law, same severity tiers.
2. **Complementary to TDD skill:** obra/superpowers TDD teaches how to write tests. This spec teaches how to diagnose test health. Not overlapping.
3. **Proportional depth:** Step 7 in PR Review is lightweight (3 signals). Mode 4 is comprehensive (5 steps, 6 risks). Users choose depth by choice of command.
4. **Book attribution:** Every symptom traces to a specific book and principle/smell. No invented rules.
5. **Iron Law enforced:** No finding is valid without Symptom + Source + Consequence + Remedy. Same discipline as existing modes.
