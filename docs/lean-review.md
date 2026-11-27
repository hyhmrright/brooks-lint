# Check a Python review finding with Lean

A shipping policy grants free shipping at a subtotal of 5,000 cents or more. A PR changes the comparison to `>`. Both a 4,999-cent cart and a 5,001-cent cart still produce the expected answer. A 5,000-cent cart distinguishes the implementations. The optional PR review checker uses Lean 4 to check a predicate from the reviewed source against a separately supplied contract.

## Run the check

Use Python 3 and a trusted Lean 4 executable on PATH. Use the checker from your brooks-lint installation and the complete source file from the exact PR revision. The checker reads the Python source as data. It does not import the reviewed module.

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

From a brooks-lint checkout, run the following command. With an installed skill, use the same script under its `brooks-review/scripts/` directory.

```sh
python3 -I skills/brooks-review/scripts/lean_review.py shipping.py shipping.contract.json
```

| JSON status | Exit | Interpretation |
|---|---:|---|
| `counterexample` | 1 | A concrete integer separates source and contract. In this example, 5,000 yields false in the PR and true under the policy. |
| `verified` | 0 | Lean checked equivalence for every built-in integer input under the supported translation. Changing `>` to `>=` gives this result. |
| `unverified` | 2 | The check could not establish a result. Inspect the diagnostic, including unsupported syntax or an unavailable checker. |

Both successful checks and confirmed counterexamples include a source SHA-256 digest and the complete Lean obligation in the JSON field `lean_certificate`. Save its decoded text to `Review.lean` and run `lean Review.lean` to replay it. The prototype was exercised with Lean 4.19.0.

Attach the PR revision, file and line, independent contract reference and witness to the review. Compare the base revision before calling a finding newly introduced. If the contract admits only nonnegative subtotals, ensure the witness satisfies that precondition. An unreachable witness leaves the reviewed behavior unresolved. Determine severity from the effect on callers. A failed proof alone supplies no evidence of a defect.

## Coverage and trust

Use a standalone module containing one plain function with one positional parameter and one return statement. The supported fragment represents Boolean predicates built from integer comparisons against literals, Boolean constants, parentheses, and `and`, `or` and `not`. Plain int and bool annotations and module or function docstrings are accepted. Comparisons take the parameter on the left and an integer literal on the right. The input domain is plain Python integers. Calls, decorators, arithmetic, side effects, floating point, overloaded operators and module initialization require a different analysis. Retain a complete revision and an attributable source for the expected behavior so another reviewer can reproduce the check.

The evidence chain has three owners. The reviewer establishes that the policy applies to this function and that the predicate captures it. The translator maps the accepted Python syntax to Lean. Lean checks the resulting mathematical statement. A proof therefore covers the selected predicate and the translator's interpretation. Callers that pass other types, unit conversions upstream and the business policy itself remain separate review questions.

## Research behind the design

OpenAI paired AI-generated mathematical arguments with published Lean formalizations for independent inspection. Anthropic's Fermat project checked the final statement against a separately supplied challenge and inspected its axiom dependencies. For code review, this motivates a specific division of labor. An AI reviewer can identify a possible defect and draft a candidate contract. A maintainer can inspect the contract against the requirement, and a deterministic translator and checker can establish whether this revision satisfies it. The result depends on the statement the reviewer chose. [OpenAI research report](https://openai.com/index/sharing-ai-progress-in-mathematics/) · [Anthropic research report](https://www.anthropic.com/research/formalizing-fermats-last-theorem) · [Proof repository and checks](https://github.com/anthropics/fermats-last-theorem)
