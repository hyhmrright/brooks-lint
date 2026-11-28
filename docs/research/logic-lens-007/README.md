# 007 · Python Fibonacci cache across calls

The original logic-lens probe intentionally shares a module-level dictionary. Its contract depends on what it stores. Every cached value at key `n` must equal the Fibonacci number F(n), with F(0) = 0 and F(1) = 1. A caller can then reuse a previous result on a cache hit. The upstream case has one correct source. The local regression changes one assignment from `_MEMO[n] = result` to `_MEMO[n] = result + 1`. [Upstream revision](https://github.com/hyhmrright/logic-lens/tree/3b158e228127e21bff7be6530e3923de0793a907/evals/real-world/probes/007-decoy-intentional-shared-cache) · [Vendored source, metadata and license](upstream) · [Regression source](controls/wrong_store.py)

## What Lean proves

The checker matches the complete Python module against the supported syntax trees. The model threads the dictionary returned by the left recursive call into the right recursive call and uses the resulting dictionary for the write. A hit returns the saved value immediately. The negative-input guard runs before any lookup or write. [Contract](contract.json) · [Matcher](../../../skills/brooks-verify/scripts/verify_cache.py) · [State transitions](../../../skills/brooks-verify/scripts/FibCache.lean)

| Obligation | Kernel-checked result |
|---|---|
| One call with a valid cache | The outcome matches the Fibonacci specification and every entry in the resulting cache is valid. The empty dictionary satisfies the initial invariant. |
| Repeated calls | For every finite sequence of integer inputs, starting from any valid cache, the outcomes match the specification in order and the final cache is valid. This applies to every prefix and permits a caller to catch an error and continue. |
| Negative input | For every negative integer the outcome is `ValueError` and the entire cache equals its pre-call state. This theorem does not require the cache invariant. |
| Incorrect write | From the empty cache, the first call on zero returns zero and writes one under key zero. The cache invariant already fails. The second call on zero reads one and violates the return contract. |

The universal and counterexample proofs are separately replayable. The audit restates the history contract with its own recurrence and checks proof dependencies. The correspondence between the admitted Python syntax and the Lean model is trusted. The scope is sequential calls on plain integers, with standard built-ins, no outside mutation or rebinding during the history, and sufficient recursion depth and memory. Python can raise `RecursionError` on a sufficiently large cold input. Cache equality here concerns dictionary contents. [Original certificate](certificates/fixed.lean) · [Counterexample certificate](certificates/wrong_store.lean) · [Original audit](audit-original.lean.inc)

## Real Python observations

The observer loads each source in a fresh interpreter per history and retains that module instance between calls. It records return values or exception types and every cached key/value pair after each call. A separate iterative Fibonacci computation checks the entries. Each implementation ran three histories, with 14 calls in total. One history starts with valid entries for keys 0, 4 and 7 to exercise a partially populated cache. [Observer](observe.py) · [Recorded reports, snapshots, hashes and axiom lists](results.json)

| Calls within one original module instance | Observed outcomes | Cache observation |
|---|---|---|
| `-1, 0, 0, -3` | `ValueError, 0, 0, ValueError` | Both errors preserved the prior dictionary. The repeat retained `{0: 0}`. |
| `8, 5, -1, 9, 8` | `21, 5, ValueError, 34, 21` | The first call populated keys 0–8. The error preserved them all. The call on 9 added the next entry. |

On the first history the regression produced `ValueError, 0, 1, ValueError`. Checking only the first return value would miss the bad write. Comparing the stored value and the next cache hit exposes it in both the proof and the interpreter.

## Reproduce from a clean checkout

Use Python 3.9+, Node.js 22 and Lean 4.19.0 on PATH. With elan installed, select the same kernel as Linux CI.

```sh
export ELAN_TOOLCHAIN="$(cat docs/research/logic-lens-009/lean-toolchain)"
elan toolchain install "$ELAN_TOOLCHAIN"
python3 -I docs/research/logic-lens-007/replay.py
```

The one-command replay verifies upstream SHA-256 digests, installs the skill into a temporary directory, requires exits 0 and 1 for the two variants, regenerates and audits their certificates, runs both Python modules and compares the evidence with the committed bytes. It runs in the Node.js 22 Linux validation job. For a separate pinned upstream checkout, pass `--corpus PATH` pointing to its 007 probe directory. The recorded local observations used Python 3.15.2 and Lean 4.19.0 on Darwin/arm64.
