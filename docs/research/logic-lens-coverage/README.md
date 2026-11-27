# What brooks-verify covers in the logic-lens real-world probes

**Decision. Prototype a cost contract for Python's order-preserving deduplication (009).** The current checker certified both sides of one of seven paired cases, the previously known leap-year case. The six other pairs and both fixed-only controls stopped before a Lean obligation could be generated. Extending integer arithmetic alone would leave all eight other cases outside the checker.

The subsequent [009 experiment](../logic-lens-009/README.md) includes the pinned original files, Lean theorems, and an offline replay. The subsequent [001 experiment](../logic-lens-001/README.md) checks validation failure against actual file writes. The table below retains the earlier baseline.

## What ran

We installed brooks-lint from commit `3eb17fb` in a clean directory and invoked its checker once on each original file at logic-lens commit `3b158e228127e21bff7be6530e3923de0793a907`. The corpus combines examples taken from the upstream project and curated examples of engineering failures. Its labels describe the intended defect or control. They do not establish general accuracy on third-party projects. [Source corpus and methodology](https://github.com/hyhmrright/logic-lens/tree/3b158e228127e21bff7be6530e3923de0793a907/evals/real-world)

For each probe, both variants received the same obligation derived from its metadata. Only 005 admits a meaningful contract in today's predicate language. For the others the harness supplied the obligation as prose in the contract envelope solely to exercise source admission. All were rejected **before contract translation**. No source was rewritten, executed or abstracted into a surrogate predicate. The two successful certifications were replayed with Lean 4.19.0. [Per-file inputs, digests, diagnostics and certificates](results.json)

| Probe | Wrong version | Fixed or control | Property the upstream example actually needs |
|---|---|---|---|
| 001 Python multi-file version update | Unverified | Unverified | If a version field fails validation, no preceding file has changed. Both modules exceed the standalone function shape. A useful verifier would track writes across validation and function calls. The fixed version's two-phase structure does not promise recovery from a disk error during writes. |
| 002 Bash worker failure | Unverified | Unverified | A failed worker command must produce a nonzero outer pipeline status. Requires shell command, function, child process and pipeline exit semantics. Exact numeric status need not survive every layer. |
| 003 Java timestamp formatter | Unverified | Unverified | Concurrent calls must format their own inputs correctly. Requires a Java frontend, concurrency semantics and reviewed library contracts. |
| 004 Go file handles | Unverified | Unverified | On each successful iteration, opened files should be closed before processing the next one. Requires resource lifetime, defer scope and interprocedural reasoning. |
| 005 Python Gregorian rule | **Counterexample** | **Verified** | On input 100, the original returned true while the contract requires false. The corrected predicate is equivalent on all plain integers. This reproduces the prior result. |
| 006 JavaScript regular expression | Unverified | Unverified | The intended property concerns matching cost under the regex engine. Source admission rejected both files. No regex execution or performance measurement was needed. |
| 007 Python intentional memo cache | No wrong variant | Unverified | Fixed-only control. Intentional shared state must preserve the result across calls. Would require recursion and a cache invariant. |
| 008 Go 1.22 loop capture | No wrong variant | Unverified | Fixed-only control. Correctness depends on version-specific loop bindings and goroutine capture. |
| 009 Python stable deduplication | Unverified | Unverified | The outputs agree. The original repeatedly scans a growing list, while the fix uses a set for membership. Both rejected as unsupported function bodies. A value-only theorem would miss the labeled defect. |

Of 16 calls, one produced a certified counterexample, one produced a universal proof and 14 returned `unverified` (exit 2). Two-sided certification coverage is 1/7, or 0/6 on previously untested pairs. Both controls abstained; neither has a correctness certificate. Nine of the 14 abstentions were non-Python files rejected by Python's parser. Its syntax diagnostics say nothing about validity in the files' native languages. The five remaining abstentions were Python files rejected by the module/signature/body checks.

## Next experiment and decision gate

009 is the narrowest new **paired** target that stays within Python and has deterministic source-level work to count. 001 also stays within Python, but an honest claim there first needs a defined file system, failure model and interprocedural effects. 002 offers a clear observable exit status, but introducing Bash and its process model is a separate frontend project. These priorities reflect engineering scope; this small corpus has too few examples to estimate prevalence.

1. Freeze two obligations from the 009 requirement before implementing a translator: output must preserve the first occurrence of each string in order, and the chosen cost model must distinguish scans of the growing output from membership probes in a set.
2. Start with the original restricted loop forms on plain lists of strings. Count list-element membership comparisons and set operations **separately**. On a family of distinct inputs of length n, check the original's comparison count n(n−1)/2. For the fixed code, show one membership probe per element and at most one insertion per element. Treat hash operations as abstract operations. Expected constant-time lookup would be an explicit extra assumption for a wall-clock complexity interpretation.
   For a concrete experimental budget, allow at most n list-element membership comparisons for n inputs. Four distinct strings should produce six comparisons on the original and zero list scans on the fix. This budget operationalizes the performance requirement for this experiment; the upstream metadata does not prescribe that constant.
3. Accept the prototype only if it certifies the source-to-model translation within this fragment, or explicitly lists that translation as trusted as the current checker does; yields a checked cost violation for the original against a predeclared budget that forbids quadratic scans; and proves order preservation and the stated operation bounds on the fixed file for arbitrary supported input lengths. Include empty, all-equal and all-distinct inputs, an order-breaking mutant, and an unsupported call that must yield `unverified`. Record whether any original file had to be edited; an edited surrogate cannot count as coverage of 009.

The formulas and acceptance criteria above are proposals. This run generated no cost proofs. A small immediate usability improvement also follows directly from nine observations: report unsupported source languages at admission instead of surfacing a Python syntax error. That would improve explanations while leaving certification coverage unchanged.

## Replay

Point `LOGIC_LENS` at a clean checkout of the corpus revision above, with Python 3 and Lean 4.19.0 on PATH. Use the historical checker to reproduce this baseline. From this research branch:

```sh
dest=$(mktemp -d)
git archive 3eb17fb skills/brooks-verify | tar -x -C "$dest"
python3 -I docs/research/logic-lens-coverage/replay.py \
  "$dest/skills/brooks-verify/scripts/lean_review.py" "$LOGIC_LENS" > replay.json
```

The JSON records each file hash and exit status. Text of Python syntax errors and Lean's platform/version banner can vary across environments.
