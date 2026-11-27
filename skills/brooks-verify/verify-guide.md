# Contract Verification Guide

### Step 1: Identify the source and obligation

Obtain the complete Python module or Bash script at the revision under discussion. Record its path
and revision when available. A PR is optional. Never extract and rewrite a function
from a larger module to make it pass the checker's input rules.

Cite a requirement, policy, or independently supplied specification for this function.
Confirm the units, accepted input domain, and inclusive or exclusive endpoints.
If the available evidence admits multiple interpretations, report the missing
decision and ask for the governing contract. Copying the return expression into
the contract cannot establish that the implementation satisfies its owner's intent.

### Step 2: Encode the contract

For integer predicates, the checker accepts a module containing one plain function with one positional
parameter and one return statement. Module and function docstrings and plain
`int` and `bool` annotations are allowed. Compare either the parameter or `parameter % divisor`
with an integer literal on the right. The divisor must be a positive or negative
integer literal. Zero and variable divisors yield `unverified`. Use Python floor
remainder semantics. A nonzero remainder has the sign of the divisor. Combine
comparisons with Boolean constants, parentheses, and `and`, `or` and `not`. The mathematical domain is all plain
Python integers. Record any narrower application preconditions separately.

Save an independent integer contract with exactly four string fields. For example,
a shipping policy that grants free shipping at 5,000 cents or more might yield:

```json
{
  "function": "free_shipping",
  "parameter": "subtotal",
  "reference": "Shipping policy v2, section 4 (amount in cents)",
  "predicate": "subtotal >= 5000"
}
```

For a standalone typed Python `list[str] -> list[str]` deduplication function,
use the named contract below when the requirement calls for first-occurrence
order and both operation budgets. A string comparison unit is one visited
element in a list membership scan. A set membership query is one source-level
probe regardless of its hash-table implementation. The supported patterns
initialize empty local containers, iterate the input once, guard an append by
membership, and return the output. The set variant also adds unseen values
to the set. The checker matches every AST node, up to local renaming and an
optional docstring. A variant outside these patterns yields `unverified`.
Use a trusted installation including `scripts/Dedupe.lean`.

```json
{
  "kind": "stable-dedupe-v1",
  "function": "dedupe",
  "parameter": "items",
  "reference": "Your source of the ordering requirement and operation budgets",
  "output": "first_occurrences",
  "max_list_comparisons": "input_length",
  "max_set_queries": "input_length"
}
```

For a multi-file update with the supported field-match and patch workflow, use
`scripts/verify_batch.py` instead. Supply `kind: validate-before-write-v1`,
`function: main`, `failure: target_pattern_mismatch`, `required_writes: none`,
`target_contents: unchanged`, and a `reference` identifying the requirement as
JSON strings. This backend checks module initialization, helper and caller
together and never imports the reviewed source. A verified result covers a
rejected target match before commit. A later external validator failure, a
write failure and a crash are separate obligations. Preserve the supplied disk
witness and write trace when reporting a counterexample.

For the supported exported Bash worker and its parallel xargs pipeline, use
`scripts/verify_worker.py`. Supply the contract kind
`bash-xargs-worker-exit-v1`, function `run_case`, command `claude`, failure
`executed_command_nonzero`, required_pipeline_status `nonzero`, and an independent
`reference`. The checker recognizes the two complete probe workflows. Other
worker bodies and invocations yield `unverified`. The proof concerns commands
that executed and exited normally. It assumes successful setup, cleanup and
diagnostics, and xargs returning nonzero when any completed child fails.

### Step 3: Run the installed checker

From this skill's directory, pass paths to the original module and contract:

```sh
# Integer predicates and stable deduplication
python3 -I scripts/lean_review.py SOURCE.py CONTRACT.json
# Target match failure during batch preparation
python3 -I scripts/verify_batch.py SOURCE.py CONTRACT.json
# Exit status of an exported Bash worker and xargs pipeline
python3 -I scripts/verify_worker.py SOURCE.sh CONTRACT.json
```

Capture stdout and the exit code. The checker reads the module as data and
translates its supported syntax to Lean. A bounded search proposes a candidate integer
witness when it finds a mismatch. Lean must certify the conflicting outputs at
that input. When the search finds no witness, `verified` requires a Lean proof
of equivalence over all integers. An inconclusive proof yields `unverified`. If execution is unavailable or the process fails without a
valid result, report the reason and mark verification incomplete.

### Step 4: Interpret and report the result

Report the mode, checker status, source path, function, contract reference and
input domain. For a certified result, include the return line, source SHA-256,
and the generated Lean certificate or its artifact path. The decoded
`lean_certificate` text can be saved as `Review.lean` and replayed with
`lean Review.lean`.

| Status | Exit | What the evidence supports |
|---|---:|---|
| `verified` | 0 | Lean certified the selected typed obligation for every input in the reported domain. |
| `counterexample` | 1 | Lean checked the conflicting outputs at the reported input. Include expected and actual outputs or operation counts, then establish whether that input can reach the function under the stated contract. |
| `unverified` | 2 | Report the diagnostic, such as unsupported syntax, a missing executable or an uncertified obligation. |

For a reachable mismatch, explain the defect using the Iron Law:
**Symptom → Source → Consequence → Remedy**. Anchor the source in the governing
requirement and exact implementation. When an application precondition excludes
the returned witness, retain the mathematical result and mark behavior on the
permitted domain unresolved. Before attributing a regression to a change, check
the base revision against its applicable contract. Keep this result scoped to
contract verification and omit decay risk codes and Health Scores.
