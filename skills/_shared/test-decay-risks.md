# Test Decay Risk Reference

Six patterns that cause test suites to degrade over time.
For each finding, identify: which risk, which symptom, which source book.

Every finding must follow the Iron Law:
Symptom → Source → Consequence → Remedy

---

## Risk T1: Test Obscurity

**Diagnostic question:** How much effort does it take to understand what this test verifies?

When test intent is unclear, developers distrust the suite, skip reading failures carefully,
and add duplicates without knowing it. An obscure test suite is one step from an abandoned one.

### Symptoms

- Assertion Roulette: multiple assertions with no message string — when one fails, it is
  impossible to determine which behavior broke without reading every assertion
- Mystery Guest: test depends on external state (files, database rows, shared fixtures)
  that is not visible in the test body
- Test names that do not express the scenario and expected outcome
  (e.g., `test1`, `shouldWork`, `testLogin`, `testUserService`)
- General Fixture: an oversized setUp or beforeEach shared by unrelated tests, making
  each test's preconditions invisible
- Test body requires reading production code to understand what is being verified

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Assertion Roulette | Meszaros — xUnit Test Patterns | Assertion Roulette (p.224) |
| Mystery Guest | Meszaros — xUnit Test Patterns | Mystery Guest (p.411) |
| General Fixture | Meszaros — xUnit Test Patterns | General Fixture (p.316) |
| Test naming | Osherove — The Art of Unit Testing | method_scenario_expected naming convention |

### Severity Guide

- 🔴 Critical: no test name in the file describes the behavior being tested; all assertions lack messages
- 🟡 Warning: multiple Mystery Guests; several ambiguous test names
- 🟢 Suggestion: minor naming issues; isolated General Fixture

### What Not to Flag

- Multiple assertions are acceptable when they describe one coherent behavior and fail with a clear story
- Shared setup is fine when every initialized value is relevant to nearly every test
- Concise test names are acceptable if scenario and expected outcome are still obvious

---

## Risk T2: Test Brittleness

**Diagnostic question:** Do tests break when you refactor without changing behavior?

Brittle tests punish refactoring. When tests fail on every refactor, developers stop refactoring.
The codebase stagnates to protect the test suite — the opposite of what tests are for.

### Symptoms

- Tests assert on private method results, internal state, or implementation details
  rather than observable behavior
- Eager Test: one test method verifies multiple unrelated behaviors; any single change
  causes it to fail regardless of which behavior was touched
- Over-specified: assertions enforce mock call order or exact parameter values that are
  irrelevant to the behavior being tested
- Renaming or extracting a method causes 5 or more tests to fail even though no behavior changed
- Erratic Test: a test produces different results across runs without any change to
  production code — caused by race conditions, time-dependent logic, random data, or
  shared mutable state between tests

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Eager Test | Meszaros — xUnit Test Patterns | Eager Test (p.228) |
| Erratic Test | Meszaros — xUnit Test Patterns | Erratic Test |
| Implementation coupling | Osherove — The Art of Unit Testing | Test isolation principle |
| Orthogonality violation | Hunt & Thomas — The Pragmatic Programmer | Ch. 2: Orthogonality |

### Severity Guide

- 🔴 Critical: refactoring with no behavior change causes test failures; > 5 tests coupled to a single implementation detail
- 🟡 Warning: Eager Tests common across the suite; moderate implementation-detail assertions
- 🟢 Suggestion: isolated over-specification in non-critical tests

### What Not to Flag

- Verifying an externally observable event or emitted command is not implementation coupling
- One test with several assertions is acceptable when all assertions support one behavior claim
- A fake or in-memory adapter is not brittleness if the test still asserts behavior, not wiring

---

## Risk T3: Test Duplication

**Diagnostic question:** Is the same test scenario expressed in more than one place?

When behavior changes, duplicated tests must be updated in multiple places. Worse, they create
false confidence — the scenario passes in three places, but none tests distinct behavior.

### Symptoms

- Test Code Duplication: same setup or assertion logic copy-pasted across multiple tests
  without extraction into a shared helper
- Lazy Test: multiple tests verifying identical behavior with no differentiation in input,
  state, or expected output
- Same boundary condition tested identically at unit, integration, and E2E level —
  three copies with no layer differentiation
- Test helper functions or fixtures duplicated across test files instead of shared

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Test Code Duplication | Meszaros — xUnit Test Patterns | Test Code Duplication (p.213) |
| Lazy Test | Meszaros — xUnit Test Patterns | Lazy Test (p.232) |
| DRY violation in tests | Hunt & Thomas — The Pragmatic Programmer | DRY: Don't Repeat Yourself |

### Severity Guide

- 🔴 Critical: core business scenario fully duplicated across all three test layers with no differentiation
- 🟡 Warning: common scenario setup repeated in 5 or more tests without extraction
- 🟢 Suggestion: minor helper duplication; isolated Lazy Tests

### What Not to Flag

- The same scenario may appear at unit and integration level when each layer verifies a distinct risk
- Small local setup duplication can be clearer than an over-abstracted fixture maze
- Similar assertions against different domain rules are not Lazy Tests if the business intent differs

---

## Risk T4: Mock Abuse

**Diagnostic question:** Is the test more complex than the behavior it tests?

Mock abuse produces tests that pass confidently while verifying nothing real. Production code can
be completely broken as long as the mocks are set up correctly — and they always are, because
the developer wrote both.

### Symptoms

- Mock setup code is longer than the test logic itself
- Primary assertion is `expect(mock).toHaveBeenCalledWith(...)` — the test verifies
  that a mock was called, not that any real behavior occurred
- Test-only methods added to production classes for lifecycle management in tests
- Single unit test uses more than 3 mocks
- Incomplete Mock: mock object missing fields that downstream code will access,
  causing silent failures only visible in integration
- Hard-Coded Test Data: test data has no resemblance to real data shapes or constraints

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Mock count > 3 | Osherove — The Art of Unit Testing | Mock usage guidelines |
| Testing mock behavior | Meszaros — xUnit Test Patterns | Behavior Verification (p.544) |
| Test-only production methods | Feathers — Working Effectively with Legacy Code | Ch. 3: Sensing and Separation |
| Hard-Coded Test Data | Meszaros — xUnit Test Patterns | Hard-Coded Test Data (p.534) |
| Incomplete Mock | Osherove — The Art of Unit Testing | Mock completeness requirement |

### Severity Guide

- 🔴 Critical: mock setup > 50% of test code; production class has methods only called from tests
- 🟡 Warning: mocks consistently > 3 per test; primary assertions are mock call verifications
- 🟢 Suggestion: isolated Incomplete Mocks; minor Hard-Coded Test Data

### What Not to Flag

- A small number of mocks around nondeterministic dependencies is acceptable when assertions still verify behavior
- Fakes and spies used to observe state transitions are not mock abuse by default
- One interaction assertion may be appropriate when the interaction itself is the behavior under test

---

## Risk T5: Coverage Illusion

**Diagnostic question:** Does the test suite actually protect against the failures that matter?

Coverage percentage measures what was executed, not what was verified. A suite can achieve 90%
line coverage while allowing every critical failure mode through. The illusion is more dangerous
than acknowledged ignorance — teams stop looking for gaps because the number says "covered."

### Symptoms

- High line coverage but error-handling branches, boundary conditions, and exception paths
  have no corresponding tests
- Happy-path only: no sad paths, no null/empty/zero inputs, no concurrency edge cases
- Legacy code areas are being actively modified with no tests present
  (Feathers: "legacy code is code without tests")
- Coverage percentage treated as a sign-off criterion; critical change paths remain untested
- Tests assert on return values but not on important side effects such as database writes,
  event publications, or state transitions

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Legacy code = no tests | Feathers — Working Effectively with Legacy Code | Ch. 1: "Legacy code is code without tests" |
| Change coverage vs line coverage | Google — How Google Tests Software | Ch. 11: Testing at Google Scale |
| Happy-path only | Osherove — The Art of Unit Testing | Test completeness principle |

### Severity Guide

- 🔴 Critical: legacy code area actively being modified with no tests; error-handling paths entirely absent
- 🟡 Warning: coverage > 80% but edge and exception paths are systematically absent
- 🟢 Suggestion: a few non-critical paths missing sad-path tests

### What Not to Flag

- High line coverage is useful when paired with branch, boundary, and change-path coverage
- A new module may have limited coverage early if it is still private and low-risk
- Side-effect assertions may live in integration tests rather than unit tests without implying a gap

---

## Risk T6: Architecture Mismatch

**Diagnostic question:** Does the test suite structure reflect the system's actual risk profile?

A suite with the wrong shape is slow, unreliable, and expensive to maintain — not because tests
are badly written, but because the wrong type is used for the wrong purpose. An inverted pyramid
runs the most tests at the slowest, most environment-dependent, hardest-to-debug level.

### Symptoms

- Inverted test pyramid: E2E or integration test count exceeds unit test count,
  causing a slow and fragile suite
- Legacy code with no seam points: no interfaces, dependency injection, or seams exist,
  making it impossible to test in isolation without modifying production code
- Legacy areas being modified have no Characterization Tests to capture current behavior
  before changes are made
- Full suite execution time exceeds 10 minutes (indicates architectural problem,
  not a performance problem — too many slow tests)
- High-risk and low-risk paths are tested at identical density;
  no risk-based prioritization in test distribution

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Inverted pyramid | Google — How Google Tests Software | 70:20:10 unit:integration:E2E ratio |
| No seam points | Feathers — Working Effectively with Legacy Code | Ch. 4: Seam Model |
| Missing Characterization Tests | Feathers — Working Effectively with Legacy Code | Ch. 13: Characterization Tests |
| Suite execution time | Meszaros — xUnit Test Patterns | Slow Tests (p. 253) |

### Severity Guide

- 🔴 Critical: legacy code being modified has no seams and no characterization tests; pyramid fully inverted
- 🟡 Warning: suite execution > 10 minutes; integration/E2E count exceeds unit tests
- 🟢 Suggestion: localized pyramid ratio deviation; a few legacy areas missing characterization tests

### What Not to Flag

- Deviating from 70:20:10 can be justified by platform constraints or product risk
- A suite heavy on integration tests can still be healthy if feedback is fast and purposefully layered
- A small number of critical-path E2E tests is desirable, not a smell
