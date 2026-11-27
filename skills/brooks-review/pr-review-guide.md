# PR Review Guide — Mode 1

**Purpose:** Diagnose decay in a diff or supplied files. Every finding follows the
Iron Law: Symptom → Source → Consequence → Remedy. Use `common.md` for severity,
scoring and report format; use the risk definitions for source attribution.

## Before You Start

Skip generated artifacts; inspect their authored generator/configuration if that
is the review target. Record exclusions and any sampling. Prioritize changed
behavior, callers and protection for large diffs. Size, file count, nesting and
parameter counts are inspection cues, not findings by themselves. A small diff
can change a system contract; do not omit applicable risk or test checks by size.

## Analysis Process

### Step 1: Establish the contract and a discriminating witness

Identify the change's purpose, reviewed boundary and available evidence. A diff,
complete module and complete test inventory support different conclusions; omitted
files are not absent files. Read relevant callers and tests when available.
For a diff, compare the same permitted witness on the base and changed versions
when both are available. Distinguish introduced, worsened and pre-existing behavior;
report a pre-existing issue separately rather than attributing it to this change.
If the base is unavailable, retain a supported current defect but leave its origin
unknown. A new test failure alone does not prove the patch caused the defect.

For each candidate behavioral defect, keep this short evidence chain:

1. **Obligation:** cite the governing behavior and who owns it. Separate input
   preconditions from work this function must perform. Ambiguous wording is not
   permission to invent normalization, validation or ordering duties.
2. **Trace:** give one permitted input/sequence through the relevant calls, with
   expected versus actual output, state or interaction. Choose a witness that
   distinguishes the suspected cause from a plausible competing explanation.
3. **Repair check:** state the smallest correction and a regression assertion
   that fails before and passes after it; preserve behavior outside the defect.

Show executable assertions or precise existing-test references where useful.
Label outcomes as executed or statically predicted. A plausible counterexample
outside the known input domain is an investigation item, not a scored finding.
If an obligation is unknown, show the alternative contracts and resulting verdicts
without a deduction. Retain supported local conclusions alongside that uncertainty.
For structural findings, use an evidenced change/maintenance consequence instead
of inventing a runtime failure. Keep witnesses in the final report, not only notes.

### Step 2: Scan for Change Propagation

Trace which responsibilities must change together and why. Unrelated edits,
multiple business reasons and feature envy are cues. Retain R2 only when a
specific decision crosses boundaries unnecessarily; feature breadth or a large
file count alone does not establish coupling. State which owners would change
under the remedy and which should remain stable.

### Step 3: Scan for Cognitive Overload

Inspect long/nested routines, many parameters, unexplained constants and unclear
names. Identify the actual reasoning burden or hidden state needed to understand
the changed behavior. Count thresholds are cues; fluent chains, cohesive routines
and domain-required complexity are not defects merely for exceeding a number.

### Step 4: Scan for Knowledge Duplication

Look for the same decision encoded in multiple places, competing names for one
concept or parallel hierarchies. Establish shared ownership and a coordinated
change that would diverge. Similar syntax with independent policies is not enough.

### Step 5: Scan for Accidental Complexity

Inspect speculative abstractions, delegation-only layers and unused extension
points. Explain the indirection cost and the requirement a simpler design still
satisfies. One implementation alone does not disprove a useful boundary.

### Step 6a: Scan for Dependency Disorder

When imports or structure change, trace new cycles, domain-to-infrastructure
coupling and interfaces that expose unrelated obligations. Establish module roles
and dependency rules before scoring; a filename or import arrow alone is not a
violation. Show the affected edge and a scoped replacement boundary.

### Step 6b: Scan for Domain Model Distortion

Check introduced names, invariants and behavior ownership against the supplied
domain vocabulary. Data-only records or utility functions are not inherently
wrong; identify the invariant that the present owner fails to protect.

### Step 7: Quick Test Check

Skip for generated/configuration/documentation-only changes with no production
logic change. This is a bounded check, not a complete test audit:

- **Coverage Illusion (T5):** inspect protection for changed behavior, including
  unchanged tests. Retain a gap only when an established obligation and inspected
  inventory support a meaningful escaping regression. Show that regression and
  the proposed assertion's before/after outcome. Unknown other tests do not justify
  a separate missing-test deduction. A test suggestion for a code defect is not
  automatically another finding. Arbitrary hardcoding that fits finite examples
  is not sufficient evidence of an actionable gap. Source: Feathers, *Working
  Effectively with Legacy Code*, Ch. 1.
- **Mock Abuse (T4):** in changed tests, trace whether setup or mock interactions
  replace verification of the required behavior. Call assertions can be correct
  when the interaction itself is the contract; mock counts alone prove nothing.
  Source: Osherove, *The Art of Unit Testing*, mock usage guidelines.
- **Test Obscurity (T1):** show what failure or setup is hard to interpret. Multiple
  assertions or missing message strings alone are not enough when the runner
  identifies the failed expectation. Source: Meszaros, *xUnit Test Patterns*,
  Assertion Roulette.

Emit no test findings when protection is adequate. For systemic issues, recommend
`/brooks-lint:brooks-test`. Do not double-count one cause across production and test
findings unless each has an independently supported consequence and remedy.

## Output

Use the Report Template from `../_shared/common.md`, Mode: PR Review. Scope names
the reviewed files and limitations. Rank retained findings by evidenced severity;
if more than five remain, give a short fix order. Prefer a few complete causal
findings over a checklist of unproved smells.
