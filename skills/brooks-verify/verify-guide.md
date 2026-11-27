# Contract Verification Guide

### Step 1: Identify the source and obligation

Obtain the complete Python module at the revision under discussion. Record its path
and revision when available. A PR is optional. Never extract and rewrite a function
from a larger module to make it pass the checker's input rules.

Cite a requirement, policy, or independently supplied specification for this function.
Confirm the units, accepted input domain, and inclusive or exclusive endpoints.
If the available evidence admits multiple interpretations, report the missing
decision and ask for the governing contract. Copying the return expression into
the contract cannot establish that the implementation satisfies its owner's intent.

### Step 2: Encode the contract

The checker accepts a module containing one plain function with one positional
parameter and one return statement. Module and function docstrings and plain
`int` and `bool` annotations are allowed. Compare either the parameter or `parameter % divisor`
with an integer literal on the right. The divisor must be a positive or negative
integer literal. Zero and variable divisors yield `unverified`. Use Python floor
remainder semantics. A nonzero remainder has the sign of the divisor. Combine
comparisons with Boolean constants, parentheses, and `and`, `or` and `not`. The mathematical domain is all plain
Python integers. Record any narrower application preconditions separately.

Save an independent JSON contract with exactly four string fields. For example,
a shipping policy that grants free shipping at 5,000 cents or more might yield:

```json
{
  "function": "free_shipping",
  "parameter": "subtotal",
  "reference": "Shipping policy v2, section 4 (amount in cents)",
  "predicate": "subtotal >= 5000"
}
```

### Step 3: Run the installed checker

From this skill's directory, pass paths to the original module and contract:

```sh
python3 -I scripts/lean_review.py SOURCE.py CONTRACT.json
```

Capture stdout and the exit code. The checker reads the module as data and
translates its supported syntax to Lean. A bounded search proposes a candidate
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
| `verified` | 0 | Lean checked equivalence of the translated implementation and contract on every plain integer input. |
| `counterexample` | 1 | Lean checked the conflicting outputs at the reported integer. Include input, expected and actual values, then establish whether that input can reach the function under the stated contract. |
| `unverified` | 2 | Report the diagnostic, such as unsupported syntax, a missing executable or an uncertified obligation. |

For a reachable mismatch, explain the defect using the Iron Law:
**Symptom → Source → Consequence → Remedy**. Anchor the source in the governing
requirement and exact implementation. When an application precondition excludes
the returned witness, retain the mathematical result and mark behavior on the
permitted domain unresolved. Before attributing a regression to a change, check
the base revision against its applicable contract. Keep this result scoped to
contract verification and omit decay risk codes and Health Scores.
