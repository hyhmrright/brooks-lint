# Check a Python review finding with Lean

A shipping policy grants free shipping at a subtotal of 5,000 cents or more. A PR changes the comparison to `>`. Both a 4,999-cent cart and a 5,001-cent cart still produce the expected answer. A 5,000-cent cart distinguishes the implementations. The standalone `$brooks-verify` skill uses Lean 4 to check a predicate from the reviewed source against a separately supplied contract.

For list-processing code, the same skill supports a first-occurrence ordering and operation-count contract for two stable-deduplication loops. [Replay the original logic-lens case and inspect the trust assumptions](research/logic-lens-009/README.md).

For multi-file updates, the batch checker can certify a partial-write counterexample or prove that rejecting a target match leaves all targets unchanged. [Replay case 001](research/logic-lens-001/README.md).

For the supported Bash worker, the checker traces the command status through the exported function, child shell and parallel xargs pipeline. The replay checks both original scripts against real processes. [Replay case 002](research/logic-lens-002/README.md).

For the supported Go batch scanner, the checker models which function owns each deferred close. Lean checks peak live handles and the count at return. [Replay case 004](research/logic-lens-004/README.md).

## Run the check

Invoke `$brooks-verify Check shipping.py against shipping.contract.json` in an interactive agent with this branch installed. You can also run its bundled checker directly.

Use Python 3 and a trusted Lean 4 executable on PATH. Use the checker from your brooks-lint installation and the complete source file at the revision to verify. A PR is optional. The checker reads the complete Python, Bash or Go source as data. The separate process replays execute only the pinned fixtures.

For a local demonstration, save the following as `shipping.py`.

```python
def free_shipping(subtotal):
    return subtotal > 5000
```

Save this as `shipping.contract.json`. In a real review, replace the example policy reference with a link or versioned path to the governing requirement. Confirm its units, input domain and boundary with the contract owner. A predicate copied from the implementation would reproduce its mistake.

```json
{
  "function": "free_shipping",
  "parameter": "subtotal",
  "reference": "Shipping policy §2",
  "predicate": "subtotal >= 5000"
}
```

From a brooks-lint checkout, run the following command. With an installed skill, use the same script under its `brooks-verify/scripts/` directory.

```sh
python3 -I skills/brooks-verify/scripts/lean_review.py shipping.py shipping.contract.json
```

| JSON status | Exit | Interpretation |
|---|---:|---|
| `counterexample` | 1 | A concrete integer separates source and contract. In this example, 5,000 yields false in the PR and true under the policy. |
| `verified` | 0 | Lean checked equivalence for every built-in integer input under the supported translation. Changing `>` to `>=` gives this result. |
| `unverified` | 2 | The check could not establish a result. Inspect the diagnostic, including unsupported syntax or an unavailable checker. |

Both successful checks and confirmed counterexamples include a source SHA-256 digest and the complete Lean obligation in the JSON field `lean_certificate`. Save its decoded text to `Review.lean` and run `lean Review.lean` to replay it. The prototype was exercised with Lean 4.19.0.

Attach the PR revision, file and line, independent contract reference and witness to the review. Compare the base revision before calling a finding newly introduced. If the contract admits only nonnegative subtotals, ensure the witness satisfies that precondition. An unreachable witness leaves the reviewed behavior unresolved. Determine severity from the effect on callers. A failed proof alone supplies no evidence of a defect.

## Coverage and trust

Use a standalone module containing one plain function with one positional parameter and one return statement. The supported fragment represents Boolean predicates built from integer comparisons against literals, Boolean constants, parentheses, and `and`, `or` and `not`. Plain int and bool annotations and module or function docstrings are accepted. Comparisons accept the parameter itself or its remainder modulo a nonzero integer literal on the left, and an integer literal on the right. For example, `year % 100 == 0` identifies century years. The input domain is plain Python integers. Calls, decorators, other arithmetic, side effects, floating point, overloaded operators and module initialization require a different analysis. Retain a complete revision and an attributable source for the expected behavior so another reviewer can reproduce the check.

For signed divisors the checker follows Python floor division. For example, `-5 % 4 == 3` and `5 % -4 == -3`. A zero or variable divisor yields `unverified`. The witness search examines a bounded set of inputs. Lean certifies a witness at a specific integer or proves equivalence over all integers. If neither obligation is discharged, the result is `unverified`.

The evidence chain has three owners. The reviewer establishes that the policy applies to this function and that the predicate captures it. The translator maps the accepted Python syntax to Lean. Lean checks the resulting mathematical statement. A proof therefore covers the selected predicate and the translator's interpretation. Callers that pass other types, unit conversions upstream and the business policy itself remain separate review questions.

## Reproduce the logic-lens leap-year check

Use the original `buggy.py` and `fixed.py` under
`evals/real-world/probes/005-leap-year-incomplete-rule/` in logic-lens
revision `3b158e228127e21bff7be6530e3923de0793a907`. Its
`meta.json` states the Gregorian rule independently of the two implementations.
Save this contract as `gregorian.json`:

```json
{
  "function": "is_leap_year",
  "parameter": "year",
  "reference": "logic-lens probe 005 meta.json, expected_bug.summary",
  "predicate": "year % 4 == 0 and not (year % 100 == 0 and year % 400 != 0)"
}
```

With `PROBE` set to that probe directory, run from the brooks-lint checkout:

```sh
python3 -I skills/brooks-verify/scripts/lean_review.py "$PROBE/buggy.py" gregorian.json
python3 -I skills/brooks-verify/scripts/lean_review.py "$PROBE/fixed.py" gregorian.json
```

Using the installed skill with Lean 4.19.0, the first command returned
`counterexample` at 100 (implementation true, contract false). The second
returned `verified` over all plain integers. Both generated certificates
replayed with Lean. Direct Python execution also reproduced the bug at 1900
and 2100, while both versions accepted 2000. Here the calendar rule is applied
arithmetically across years, without modeling historical calendar adoption.

## Research behind the design

OpenAI paired AI-generated mathematical arguments with published Lean formalizations for independent inspection. Anthropic's Fermat project checked the final statement against a separately supplied challenge and inspected its axiom dependencies. For code review, this motivates a specific division of labor. An AI reviewer can identify a possible defect and draft a candidate contract. A maintainer can inspect the contract against the requirement, and a deterministic translator and checker can establish whether this revision satisfies it. The result depends on the statement the reviewer chose. [OpenAI research report](https://openai.com/index/sharing-ai-progress-in-mathematics/) · [Anthropic research report](https://www.anthropic.com/research/formalizing-fermats-last-theorem) · [Proof repository and checks](https://github.com/anthropics/fermats-last-theorem)
