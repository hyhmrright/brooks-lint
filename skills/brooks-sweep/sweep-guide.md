# Brooks-Lint — Full Sweep Guide

Unified analysis + remediation pass. Every finding follows the Iron Law:
**Symptom → Source → Consequence → Remedy**

---

### Step 1 — Framework setup and scope detection

Apply Auto Scope Detection from `../_shared/common.md` if the user has not specified files or a directory.

Record the initial state:
- List of files in scope
- Any `.brooks-lint.yaml` config (suppressed risk codes, custom thresholds)
- Presence of test files, CI config, package manager files

### Step 2 — Unified production decay scan

Scan every file in scope against all R-series risks from `../_shared/decay-risks.md`.
For each risk category (R1–R6), apply the symptom checklist and record every hit with:
- **Risk code** (e.g. R3)
- **File + approximate line range**
- **Symptom** (what you observed)
- **Source** (book principle violated)
- **Consequence** (what breaks if left unfixed)
- **Remedy** (concrete change needed)
- **Severity**: Critical / High / Medium / Low
- **Fix class**: see Step 4 for classification rules

Also scan for architecture-level issues: inverted dependencies, missing abstraction layers,
god modules, tight coupling across domain boundaries.

### Step 3 — Unified test decay scan

Scan test files (and untested production code) against all T-series risks from
`../_shared/test-decay-risks.md`. Apply T1–T6 symptom checklists. Record each hit with
the same fields as Step 2 (use T-prefix risk codes).

For files with no test coverage at all, record as a T2 (Missing Tests) finding.

### Step 4 — Aggregate, deduplicate, and classify

1. **Deduplicate**: if the same file + same risk code appears from multiple angles, merge into one finding with the highest severity seen.
2. **Sort**: Critical → High → Medium → Low.
3. **Classify each finding** into exactly one fix class:

   | Class | Criteria |
   |-------|----------|
   | **Auto** | Single-file, reversible, no interface change: rename, extract constant, remove dead code, add missing null guard at a leaf, add test scaffold for an untested pure function |
   | **Confirm** | Multi-file, touches a public interface, deletes code, or restructures a module |
   | **Manual** | Architectural restructuring, cross-service boundary changes, design decisions requiring human judgment, or any change where the "correct" remedy is ambiguous |

### Step 5 — Apply Auto-class fixes

For each Auto-class finding (lowest-risk first within each severity tier):

1. Apply the Remedy using Edit or Write tools.
2. Log the fix immediately:
   - File and line range changed
   - Risk code resolved
   - One-line description of the change

If a fix conflicts with a previous fix in this pass (same lines touched), skip and promote
to Confirm class.

### Step 6 — Verification

After all Auto-class fixes are applied, run the project's test/lint command if one exists:
- Check `package.json` → `scripts.test`, `scripts.lint`
- Check for `Makefile` with a `test` or `lint` target
- Check for `pytest.ini`, `rspec`, or equivalent

If tests fail after auto-fixes, identify the culprit by reverting Auto-class fixes in
reverse order until tests pass, then promote the last-reverted fix to Confirm class.
Log each revert.

If no test command is found, note this in the report.

### Step 7 — Confirm-class changes

Present Confirm-class findings grouped by severity. For each group show:
- Finding summary (Symptom → Remedy)
- Files affected
- Estimated scope (lines changed, interfaces touched)

Ask: **"Apply these N changes? Reply: yes (apply all shown) / skip / or list numbers (e.g. 1 3 5)"**

Apply only what the user approves. Log each applied change the same way as Step 5.

### Step 8 — Sweep Report

Output a final report using this structure:

```
# Brooks-Lint — Full Sweep Report
Mode: Full Sweep | Scope: <directory or file list>

## Fix Log  (<N> auto-fixed, <M> confirmed)
| # | File | Lines | Risk | Change |
|---|------|-------|------|--------|
...

## Health Score Delta
Before: <estimated score>/100  →  After: <estimated score>/100
(Re-run /brooks-health for an exact recalculation)

## Residual Items  (<K> manual)
<Iron Law entries for Manual-class findings, sorted Critical → Low>

## Summary
- Total findings: <N+M+K>
- Resolved this sweep: <N+M>
- Needs human judgment: <K>
```

If there are zero residual items, end with: **"Sweep complete — no manual items remain."**
