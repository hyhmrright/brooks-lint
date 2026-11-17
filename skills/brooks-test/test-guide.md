# Test Quality Review Guide — Mode 4

**Purpose:** Diagnose six test-space decay risks. Every finding follows the Iron
Law: Symptom → Source → Consequence → Remedy. Use `common.md` for severity,
scoring and output, and `test-decay-risks.md` for definitions and sources.

## Before You Start: Build the Test Suite Map

Map observed unit/integration/E2E files, approximate test counts, protected modules
and known runtime. Label excerpts and sampled areas; unknown inventory is not zero
coverage. Ratios and counts describe the supplied scope, not an ideal every project
must match. Read test bodies and relevant production contracts together. If source
is inaccessible, ask at most one focused question about the blocking fact; report
what remains unknown rather than inventing a suite-wide diagnosis.

For protection/brittleness claims, make the test's discrimination explicit:

| Check | Original | Relevant changed implementation |
| --- | --- | --- |
| Governing behavior | Required outcome | Preserved or violated, with input |
| Existing test | Pass/fail and assertion | Pass/fail and assertion |
| Proposed protection | Expected outcome | Expected outcome |

Use the compact comparison only where it proves the finding. Match the changed
implementation to the allegation: a contract-breaking production mutation tests
protection, a behavior-preserving transformation tests brittleness, and an injected
assertion failure tests runner failure propagation. Equivalent failure injections
are acceptable for the last claim but do not prove a production coverage gap. Cite the affected
assertion and mark results as executed or statically predicted. Keep this witness
in the final report. A useful extra test is not itself evidence of an existing defect.

## Analysis Process

### Step 1: Scan for Test Obscurity

Sample representative changed/high-risk tests, recording scope. Look for unclear
scenario/outcome names, hidden fixture state, oversized setup and failures that
cannot be localized. Show the actual interpretability cost. Multiple assertions
or no message strings are not inherently obscure when failure output is precise.

### Step 2a: Scan for Test Brittleness

Identify a concrete behavior-preserving transformation that fails an existing
test. The original and transformed versions must preserve public outputs, side
effects and contractual interactions. Compare both test outcomes and cite the
assertion coupled to the implementation. A private rename can prove brittleness;
a changed contractual interaction cannot. Recommend an observation that accepts
both equivalent implementations while still detecting a meaningful regression.
Use the T2 severity guide after establishing the consequence.

### Step 2b: Scan for Mock Abuse

Reuse the sampled test bodies. Trace what is real, what is replaced and what the
assertions observe. Mocking the subject can conceal a required effect; demonstrate
that effect and the false pass. An interaction assertion is appropriate when the
interaction is the contract. Large setup, many mocks and test-only accessors are
inspection cues, not automatic defects or Critical severity. Distinguish a T4 blind
spot from T2 brittleness; do not deduct twice for the same cause and remedy.

### Step 3: Scan for Test Duplication

Identify repeated setup or assertions that encode the same decision and create
coordinated maintenance. Distinct unit/integration/E2E checks may protect different
failure boundaries despite using the same scenario. Show why sharing a helper or
removing a duplicate preserves readable intent and required coverage. Apply the T3
severity guide only after establishing harmful duplication, not from counts alone.

### Step 4: Scan for Coverage Illusion and Architecture Mismatch

For **T5 Coverage Illusion**, connect a relevant mutation to an established
obligation. First trace the original test; then show that a contract-breaking
change passes it (or that assertion failure is swallowed). Give a proposed check
that passes the original and rejects that mutation. Distinguish a production defect
from missing protection against a future defect. Arbitrary hardcoding that fits
finite examples alone does not establish an actionable gap.

If only an excerpt is available, a proven local blind spot stays local; do not claim
whole-suite absence. Missing input/coverage obligations remain unresolved. An input
precondition is not a new validation duty. If failure propagation itself is under
review, trace assertions, catches and runner exit separately from parser/business
correctness; clarify whether that check is required to signal failure.

For changed legacy behavior with established missing protection, recommend
characterization before editing: capture current behavior and explicitly label it
as observed, not necessarily correct. Source: Feathers, *Working Effectively with
Legacy Code*, Ch. 13: Characterization Tests.

For **T6 Architecture Mismatch**, relate the test level and runtime to required
feedback and seam boundaries. The 70/20/10 pyramid is a heuristic, not a quota.
Measured slow feedback, absent required characterization or avoidable integration
cost needs a concrete consequence; distinguish intentional integration coverage.
Follow the T6 severity guide and `common.md`: runtime alone does not establish
Critical. Source: Meszaros, *xUnit Test Patterns*, Slow Tests.

### Step 5: Apply Iron Law, Output Report

Use the standard Report Template, Mode: Test Quality Review. Put the Test Suite Map
immediately before `## Findings`. For each retained finding, include its obligation,
original/changed comparison, scoped consequence and smallest corrective check.
State decisive missing facts without scoring invented duties. Keep novel supported
findings even if they differ from an expected example; do not claim execution
without records or equate passing finite checks with exhaustive correctness.
