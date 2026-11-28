---
name: brooks-verify
description: >
  Verify a supported Python integer predicate, stable deduplication cost,
  validate-before-write batch update, Bash/xargs worker exit propagation,
  Go file handle lifetimes, Go 1.22 loop capture and callback completion,
  Python cross-call Fibonacci cache correctness, Java date formatter concurrency,
  or JavaScript comma-separated word-list acceptance
  against an explicit contract with Lean 4.
  Trigger for requests for formal verification, proof of order or failure
  behavior, or a certified counterexample to a stated obligation.
  Explain confirmed defects using the project's finding convention drawn from
  twelve classic engineering books.
  Do NOT trigger for: general PR reviews, architecture audits, debt assessments,
  test-suite reviews, health dashboards, automated fixes, or Lean tutorials.
metadata:
  opencode/slash: "true"
---

# Brooks-Lint — Contract Verification

## Setup

Read `verify-guide.md` in this directory and the Iron Law in
`../_shared/common.md`. Use the verification result format in the guide.
Python 3 and a trusted Lean 4 executable on PATH are required to run the checker.

## Process

1. Identify the exact source file and its governing contract (Step 1 of the guide).
2. Encode the independent contract and run the bundled checker (Steps 2–3).
3. Report the kernel result, its scope and any reachable witness (Step 4).

**Mode line in report:** `Contract Verification`
