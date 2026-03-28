# Test Quality Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Mode 4 (Test Quality Review) and PR Review Step 7 (Quick Test Check) to brooks-lint, sourced from four classic testing books.

**Architecture:** Five files total — two new skill files (`test-decay-risks.md`, `test-guide.md`), one new command (`brooks-test.md`), and two modifications (`SKILL.md`, `pr-review-guide.md`). All files live in `skills/brooks-lint/` and `commands/`. No code, no dependencies — pure Markdown.

**Tech Stack:** Markdown skill files, brooks-lint plugin structure, same Iron Law + decay-risk format as existing files.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `skills/brooks-lint/test-decay-risks.md` | Six test-space decay risks with full symptom/source/severity definitions |
| Create | `skills/brooks-lint/test-guide.md` | Mode 4 five-step analysis process |
| Create | `commands/brooks-test.md` | Slash command `/brooks-lint:brooks-test` definition |
| Modify | `skills/brooks-lint/SKILL.md` | Add Mode 4 to mode detection, trigger words, reference file table |
| Modify | `skills/brooks-lint/pr-review-guide.md` | Append Step 7: Quick Test Check |

---

### Task 1: Create `test-decay-risks.md`

The core reference file. Six test decay risks, each with diagnostic question, symptoms, source table, and severity guide. Mirrors the structure of `decay-risks.md` exactly.

**Files:**
- Create: `skills/brooks-lint/test-decay-risks.md`

- [ ] **Step 1: Create the file**

```markdown
# Test Decay Risk Reference

Six patterns that cause test suites to degrade over time.
For each finding, identify: which risk, which symptom, which source book.

Every finding must follow the Iron Law:
Symptom → Source → Consequence → Remedy

---

## Risk T1: Test Obscurity

**Diagnostic question:** How much effort does it take to understand what this test verifies?

When test intent is unclear, developers distrust the suite, skip reading failures carefully,
and add new tests that duplicate existing ones without knowing it. An obscure test suite
is one step from an abandoned one.

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

---

## Risk T2: Test Brittleness

**Diagnostic question:** Do tests break when you refactor without changing behavior?

Brittle tests punish the act of improving code. When tests fail on every refactor,
developers stop refactoring. The codebase stagnates to protect the test suite —
which is the exact opposite of what tests are for.

### Symptoms

- Tests assert on private method results, internal state, or implementation details
  rather than observable behavior
- Eager Test: one test method verifies multiple unrelated behaviors; any single change
  causes it to fail regardless of which behavior was touched
- Over-specified: assertions enforce mock call order or exact parameter values that are
  irrelevant to the behavior being tested
- Renaming or extracting a method causes 5 or more tests to fail even though no behavior changed

### Sources

| Symptom | Book | Principle / Smell |
|---------|------|-------------------|
| Eager Test | Meszaros — xUnit Test Patterns | Eager Test (p.228) |
| Implementation coupling | Osherove — The Art of Unit Testing | Test isolation principle |
| Orthogonality violation | Hunt & Thomas — The Pragmatic Programmer | Ch.2: Orthogonality |

### Severity Guide

- 🔴 Critical: refactoring with no behavior change causes test failures; > 5 tests coupled to a single implementation detail
- 🟡 Warning: Eager Tests common across the suite; moderate implementation-detail assertions
- 🟢 Suggestion: isolated over-specification in non-critical tests

---

## Risk T3: Test Duplication

**Diagnostic question:** Is the same test scenario expressed in more than one place?

Test duplication means that when behavior changes, tests must be updated in multiple
places. Worse, the duplicated tests create false confidence — the scenario passes in
three places, but none of the three actually tests distinct behavior.

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

---

## Risk T4: Mock Abuse

**Diagnostic question:** Is the test more complex than the behavior it tests?

Mock abuse produces tests that pass confidently while verifying nothing real. They create
the illusion of a test suite. The production code can be completely broken as long as
the mocks are set up correctly — and they always are, because the developer wrote both.

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
| Testing mock behavior | obra/superpowers TDD | testing-anti-patterns: Testing Mock Behavior |
| Test-only production methods | obra/superpowers TDD | testing-anti-patterns: Test-Only Methods in Production |
| Hard-Coded Test Data | Meszaros — xUnit Test Patterns | Hard-Coded Test Data (p.534) |
| Incomplete Mock | Osherove — The Art of Unit Testing | Mock completeness requirement |

### Severity Guide

- 🔴 Critical: mock setup > 50% of test code; production class has methods only called from tests
- 🟡 Warning: mocks consistently > 3 per test; primary assertions are mock call verifications
- 🟢 Suggestion: isolated Incomplete Mocks; minor Hard-Coded Test Data

---

## Risk T5: Coverage Illusion

**Diagnostic question:** Does the test suite actually protect against the failures that matter?

Coverage percentage is a measure of what was executed during tests, not what was verified.
A test suite can achieve 90% line coverage and still allow every critical failure mode through.
The illusion is more dangerous than acknowledged ignorance — teams stop looking for gaps
because the number says they are covered.

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
| Legacy code = no tests | Feathers — Working Effectively with Legacy Code | Ch.1: "Legacy code is code without tests" |
| Change coverage vs line coverage | Google — How Google Tests Software | Test coverage strategy |
| Happy-path only | Osherove — The Art of Unit Testing | Test completeness principle |

### Severity Guide

- 🔴 Critical: legacy code area actively being modified with no tests; error-handling paths entirely absent
- 🟡 Warning: coverage > 80% but edge and exception paths are systematically absent
- 🟢 Suggestion: a few non-critical paths missing sad-path tests

---

## Risk T6: Architecture Mismatch

**Diagnostic question:** Does the test suite structure reflect the system's actual risk profile?

A test suite with the wrong shape is slow, unreliable, and expensive to maintain —
not because the tests are badly written, but because the wrong test type is being used
for the wrong purpose. An inverted pyramid executes the maximum number of tests at the
level that is slowest, most environment-dependent, and hardest to debug.

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
| No seam points | Feathers — Working Effectively with Legacy Code | Ch.4: Seam Model |
| Missing Characterization Tests | Feathers — Working Effectively with Legacy Code | Ch.13: Characterization Tests |
| Suite execution time | Meszaros — xUnit Test Patterns | Test suite design principles |

### Severity Guide

- 🔴 Critical: legacy code being modified has no seams and no characterization tests; pyramid fully inverted
- 🟡 Warning: suite execution > 10 minutes; integration/E2E count exceeds unit tests
- 🟢 Suggestion: localized pyramid ratio deviation; a few legacy areas missing characterization tests
```

- [ ] **Step 2: Verify structure matches `decay-risks.md`**

Open both files side by side and confirm:
- Same top-level comment format
- Same Risk N heading format
- Each risk has: Diagnostic question paragraph, Symptoms list, Sources table, Severity Guide with 🔴🟡🟢

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/test-decay-risks.md
git commit -m "feat: add test-decay-risks.md — six test-space decay risks"
```

Expected output: `1 file changed, N insertions(+)`

---

### Task 2: Create `test-guide.md`

Mode 4 analysis process. Five steps: suite map, T1 scan, T2+T4 scan, T3 scan, T5+T6 scan. Same structure as `architecture-guide.md`.

**Files:**
- Create: `skills/brooks-lint/test-guide.md`

- [ ] **Step 1: Create the file**

```markdown
# Test Quality Review Guide — Mode 4

**Purpose:** Diagnose the health of a test suite using six test-space decay risks.
Every finding must follow the Iron Law: Symptom → Source → Consequence → Remedy.

---

## Before You Start: Build the Test Suite Map

Before scanning for any risk, map the current test suite structure:

```
Unit tests:        X files, ~N tests
Integration tests: X files, ~N tests
E2E tests:         X files, ~N tests
Ratio:             Unit X%  :  Integration X%  :  E2E X%
Coverage areas:    [modules with tests] vs [modules without tests]
```

If you cannot access test files directly, ask the user **one question** — choose the
most relevant:
1. "Which module is hardest to test or has the least coverage?"
2. "When you make a change, how often do unrelated tests break?"
3. "Is there a part of the codebase your team avoids touching because it has no tests?"

After one answer, proceed. Do not ask more than one question.

---

## Analysis Process

Work through these five steps in order.

### Step 1: Scan for Test Obscurity

*Scan this first — the most visible risk and the one that determines whether the suite
is maintainable at all.*

Look for:
- Read 5–10 test names at random: can each one communicate subject + scenario + expected
  outcome without opening the test body?
- Are there tests where a failure gives no clue which behavior broke (multiple assertions,
  no message strings)?
- Does any test depend on external state (files, database rows, env variables, shared mutable
  fixtures) that is invisible from within the test body?
- Is there a single massive setUp or beforeEach that every test inherits regardless of
  what it actually needs?

If all test names are clear and setups are minimal → no finding.

### Step 2: Scan for Test Brittleness and Mock Abuse

*These two risks co-occur: over-mocking produces tests that are both fragile and vacuous.
Scan them together.*

Look for Test Brittleness:
- Ask (or check git history): did any recent refactor cause test failures with no
  behavior change?
- Are there test methods where the name contains "and" or that assert on 3 or more
  unrelated behaviors (Eager Test)?
- Do assertions specify mock call order or exact parameter values that are irrelevant
  to the observable behavior?

Look for Mock Abuse:
- Sample 3–5 tests: is mock setup longer than the test logic?
- Are the primary assertions `expect(mock).toHaveBeenCalledWith(...)` rather than
  assertions on outputs, state, or events?
- Are there methods in production classes that are only called from test files?
- Does any single test create more than 3 mock objects?

### Step 3: Scan for Test Duplication

Look for:
- Is the same setup block (same variables initialized the same way) repeated across
  5 or more test files without a shared helper?
- Are there multiple tests that pass identical inputs and assert identical outputs
  with no differentiation (Lazy Test)?
- Is the same business scenario covered at unit, integration, and E2E level with no
  difference in what each layer is testing?

If duplication is systemic (10 or more instances) → Critical.
If localized (3–5 instances) → Warning.

### Step 4: Scan for Coverage Illusion and Architecture Mismatch

Look for Coverage Illusion:
- Pick the most recently modified core module. Are its error-handling branches and
  null/boundary inputs covered by tests?
- Are there legacy areas (old functions, no test files nearby) that are actively
  being changed?
- Do the tests assert on side effects (DB writes, events emitted, state transitions)
  or only on return values?

Look for Architecture Mismatch:
- Compare the suite map from the start: is the ratio close to 70% unit / 20% integration / 10% E2E?
- If legacy code is being modified, are there Characterization Tests that captured
  behavior before the change?
- Is the full suite execution time known? If > 10 minutes, note as 🟡 Warning.
- Are high-risk modules tested at higher density than trivial utilities?

### Step 5: Apply Iron Law, Output Report

For every finding identified above, write it in this format:

```
**[Test Risk Name] — [Short title]**
Symptom: [the exact thing observed in the test files — quote file names or patterns]
Source: [Book title — Smell or Principle name]
Consequence: [what happens to the test suite if this is not addressed]
Remedy: [concrete, specific action]
```

Do not write a finding you cannot complete. If you can identify a symptom but cannot
state a consequence, re-read `test-decay-risks.md` for that risk before writing the finding.

---

## Output

Use the standard Report Template from `SKILL.md`.
Mode: Test Quality Review
Scope: the test files or directory reviewed.

Include the Test Suite Map as a code block before the Findings section,
labeled "Test Suite Map".
```

- [ ] **Step 2: Verify structure matches `pr-review-guide.md` and `architecture-guide.md`**

Confirm:
- Starts with Purpose line
- Has a "Before You Start" section
- Steps are numbered and in order
- Iron Law application section present before Output
- Output section references `SKILL.md` Report Template

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/test-guide.md
git commit -m "feat: add test-guide.md — Mode 4 five-step analysis process"
```

Expected output: `1 file changed, N insertions(+)`

---

### Task 3: Create `commands/brooks-test.md`

The slash command definition. Follow the exact format of `commands/brooks-review.md`.

**Files:**
- Create: `commands/brooks-test.md`
- Reference: `commands/brooks-review.md` (existing pattern)

- [ ] **Step 1: Create the file**

```markdown
---
description: Run a Brooks-Lint test quality review on the current test suite or test files
---

Use the brooks-lint skill to perform a Test Quality Review (Mode 4).
Load the skill via the Skill tool, then analyze the test files or test suite
the user has provided using the six test decay risk framework (drawing from
xUnit Test Patterns, The Art of Unit Testing, How Google Tests Software,
and Working Effectively with Legacy Code).
Read test-guide.md from the skill directory for the detailed process.
Read test-decay-risks.md from the skill directory for symptom definitions and source attributions.
```

- [ ] **Step 2: Verify format matches `commands/brooks-review.md`**

```bash
diff <(head -5 commands/brooks-review.md) <(head -5 commands/brooks-test.md)
```

Both files must start with `---` / `description:` / `---` frontmatter.

- [ ] **Step 3: Commit**

```bash
git add commands/brooks-test.md
git commit -m "feat: add brooks-test command — /brooks-lint:brooks-test slash command"
```

Expected output: `1 file changed, N insertions(+)`

---

### Task 4: Modify `skills/brooks-lint/SKILL.md`

Three additions: (1) new row in Mode Detection table, (2) additional trigger words, (3) new rows in Reference Files table.

**Files:**
- Modify: `skills/brooks-lint/SKILL.md`

Read the current file before editing. The three change locations are:

1. **Lines 1–14 (frontmatter description):** add trigger terms to the `description:` field
2. **Lines 36–39 (Auto-triggers):** add test-related trigger keywords
3. **Lines 49–54 (Mode Detection table):** add Mode 4 row
4. **Lines 40–43 (Slash command triggers):** add `/brooks-lint:brooks-test`
5. **Lines 159–168 (Reference Files table):** add two new rows

- [ ] **Step 1: Update frontmatter description trigger terms**

In `SKILL.md` lines 1–14, the `description:` field ends with:
```
  Use this skill proactively whenever code, a diff, or a PR is shared for review.
```

Add before that closing line:
```
  Also triggers when user asks about test quality, flaky tests, mock abuse,
  test debt, or legacy code testability.
  Use this skill proactively whenever test files are shared for review.
```

- [ ] **Step 2: Update Auto-triggers section**

Find the line:
```
- User mentions: code smells, refactoring, clean architecture, DDD, SOLID, Brooks,
  conceptual integrity, second system effect, tech debt, ubiquitous language
```

Replace with:
```
- User mentions: code smells, refactoring, clean architecture, DDD, SOLID, Brooks,
  conceptual integrity, second system effect, tech debt, ubiquitous language,
  test smells, test debt, unit testing quality, flaky tests, mock abuse,
  legacy code testability, characterization tests
```

- [ ] **Step 3: Update Slash command triggers**

Find the block:
```
**Slash command triggers (forced mode — skip mode detection):**
- `/brooks-lint:brooks-review` → Mode 1: PR Review
- `/brooks-lint:brooks-audit` → Mode 2: Architecture Audit
- `/brooks-lint:brooks-debt` → Mode 3: Tech Debt Assessment
```

Replace with:
```
**Slash command triggers (forced mode — skip mode detection):**
- `/brooks-lint:brooks-review` → Mode 1: PR Review
- `/brooks-lint:brooks-audit` → Mode 2: Architecture Audit
- `/brooks-lint:brooks-debt` → Mode 3: Tech Debt Assessment
- `/brooks-lint:brooks-test` → Mode 4: Test Quality Review
```

- [ ] **Step 4: Update Mode Detection table**

Find the table that ends with:
```
| User used a slash command | **Forced to that command's mode** |
```

Add a new row before that last row:
```
| Test files shared, "are our tests good?", test debt, flaky tests, mock abuse, legacy code testability | **Mode 4: Test Quality Review** |
```

- [ ] **Step 5: Add Mode 4 instructions block**

After the Mode 3 block (which ends with `5. Output using the Report Template below, plus the Debt Summary Table`), add:

```
### Mode 4: Test Quality Review

1. Read `test-guide.md` in this directory for the analysis process
2. Read `test-decay-risks.md` in this directory for symptom definitions and source attributions
3. Build the test suite map (unit/integration/E2E counts and ratio)
4. Scan for each test decay risk in the order specified in the guide
5. Output using the Report Template below
```

- [ ] **Step 6: Update Reference Files table**

Find the table:
```
| `debt-guide.md` | At the start of every Mode 3 (Tech Debt Assessment) |
```

Add two rows after it:
```
| `test-guide.md` | At the start of every Mode 4 (Test Quality Review) |
| `test-decay-risks.md` | After selecting Mode 4, before starting the review |
```

- [ ] **Step 7: Verify SKILL.md is internally consistent**

Check:
- Mode Detection table has 5 rows (3 content modes + slash command + Mode 4)
- Slash commands list has 4 entries
- Modes section has 4 subsections (Mode 1–4)
- Reference Files table has 6 rows

- [ ] **Step 8: Commit**

```bash
git add skills/brooks-lint/SKILL.md
git commit -m "feat: add Mode 4 to SKILL.md — test quality review mode detection and routing"
```

Expected output: `1 file changed, N insertions(+), N deletions(-)`

---

### Task 5: Modify `skills/brooks-lint/pr-review-guide.md`

Append Step 7: Quick Test Check. This is the only change to this file.

**Files:**
- Modify: `skills/brooks-lint/pr-review-guide.md`

The current file ends at line 99 with:
```
Mode: PR Review
Scope: list the files reviewed (excluding skipped generated files).
```

- [ ] **Step 1: Append Step 7 to the file**

Add the following after the existing Output section:

```markdown
---

## Step 7: Quick Test Check

*Run this last. Three signals only — this is not a full Mode 4 review.*

If the diff contains only generated files, configuration, or documentation with no
production logic changes → skip Step 7 entirely.

**Signal 1: Do tests exist for the changed behavior?**

- Does the diff modify production code?
- Are corresponding test file changes included in the diff?
- If new public behavior was added with no new tests:
  → 🟡 Warning: Coverage Illusion — new behavior is untested
  → Source: Feathers — Working Effectively with Legacy Code, Ch.1
- If the change is a pure refactor and existing tests cover the behavior → no finding.

**Signal 2: Quick Mock Abuse sniff**

Only check if the diff includes test file changes.

- Is mock setup code in new/modified tests obviously longer than the test logic?
- Are the primary assertions `expect(mock).toHaveBeenCalledWith(...)` with no behavior verification?
- Does the diff add any methods to production classes that are only called from test files?

If any of these are true:
  → 🟡 Warning: Mock Abuse — test complexity exceeds behavior complexity
  → Source: Osherove — The Art of Unit Testing, mock usage guidelines

**Signal 3: Quick Test Obscurity sniff**

Only check if the diff includes test file changes.

- Do new test names express scenario and expected outcome?
  (Pattern: `methodName_scenario_expectedResult` or equivalent)
- Are there new tests with multiple assertions and no message strings on any of them?

If test names are vague or assertions lack messages:
  → 🟢 Suggestion: Test Obscurity — test intent is unclear from the test name or assertions
  → Source: Meszaros — xUnit Test Patterns, Assertion Roulette (p.224)

**Output rule:**

If all three signals are clean → write no Test findings. Proceed directly to the report.

If findings exist → add them to the Findings section using the standard Iron Law format.
Label the risk as the test decay risk name (e.g., "Coverage Illusion", "Mock Abuse",
"Test Obscurity").

> **Note:** Step 7 is a fast check, not a full test audit. When systemic test problems
> are found, note in the Summary: "Consider running `/brooks-lint:brooks-test` for a
> complete test quality diagnosis."
```

- [ ] **Step 2: Verify the file ends cleanly**

```bash
tail -20 skills/brooks-lint/pr-review-guide.md
```

Confirm the Step 7 block is present and no content was accidentally overwritten.

- [ ] **Step 3: Commit**

```bash
git add skills/brooks-lint/pr-review-guide.md
git commit -m "feat: add Step 7 Quick Test Check to PR review guide"
```

Expected output: `1 file changed, N insertions(+)`

---

### Task 6: Smoke Test the Full Integration

Verify that all five files reference each other correctly and the skill routes Mode 4 properly.

**Files:**
- Read: all five modified/created files

- [ ] **Step 1: Check cross-references in SKILL.md**

```bash
grep -n "test-guide\|test-decay-risks\|brooks-test\|Mode 4" skills/brooks-lint/SKILL.md
```

Expected: at least 4 matches — one in slash commands, one in mode detection, one in modes section, two in reference files table.

- [ ] **Step 2: Check test-guide.md references test-decay-risks.md**

```bash
grep "test-decay-risks" skills/brooks-lint/test-guide.md
```

Expected: at least one match in the Iron Law application section.

- [ ] **Step 3: Check brooks-test.md references both new files**

```bash
grep -E "test-guide|test-decay-risks" commands/brooks-test.md
```

Expected: two matches.

- [ ] **Step 4: Check pr-review-guide.md has 7 steps**

```bash
grep "^### Step" skills/brooks-lint/pr-review-guide.md
```

Expected output:
```
### Step 1: Understand the scope
### Step 2: Scan for Change Propagation
### Step 3: Scan for Cognitive Overload
### Step 4: Scan for Knowledge Duplication
### Step 5: Scan for Accidental Complexity
### Step 6: Scan for Dependency Disorder and Domain Model Distortion
### Step 7: Quick Test Check
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git status
```

If working tree is clean (all changes committed in previous tasks), no action needed.

If any files remain unstaged, stage and commit them:
```bash
git add skills/brooks-lint/ commands/
git commit -m "chore: finalize v0.5 test quality review integration"
```

---

## Self-Review

**Spec coverage:**
- ✅ `test-decay-risks.md` — Task 1
- ✅ `test-guide.md` — Task 2
- ✅ `commands/brooks-test.md` — Task 3
- ✅ `SKILL.md` Mode 4 + trigger words + reference files — Task 4
- ✅ `pr-review-guide.md` Step 7 — Task 5
- ✅ Integration smoke test — Task 6

**Placeholder scan:** No TBD, TODO, or "similar to Task N" references. All file content is complete.

**Type consistency:** No function signatures — Markdown only. All cross-file references use the exact file names defined in the File Map.
