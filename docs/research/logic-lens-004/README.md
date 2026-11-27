# 004 · Go file handles held across batch iterations

A batch of **two successful scans** is enough to violate the one-handle budget. In the original, each loop iteration registers `defer f.Close()` in the outer function (buggy.go line 12). The second scan therefore starts with both files open. Large batches can accumulate descriptors until a later open fails. The fix moves open, scan and deferred close into `processOne` (fixed.go line 22). Returning from that helper releases the current file before the next iteration. Both originals eventually close their handles on return in the measured runs.

## Contract and proof

Count handles acquired by this invocation of `processFiles`, starting from zero. Require a peak of at most one and zero live handles at return. The metadata states the bound per iteration. The [contract](contract.json) makes both the peak and the final count explicit. The [original sources and metadata](upstream) are vendored with their license from [logic-lens revision 3b158e2](https://github.com/hyhmrright/logic-lens/tree/3b158e228127e21bff7be6530e3923de0793a907/evals/real-world/probes/004-defer-in-loop-fd-exhaustion).

* **Buggy.** Lean checks the concrete scan counts `[1, 2]`, peak two and final zero. The checker's witness has two successful inputs. [Counterexample certificate](certificates/buggy.lean)
* **Fixed.** For every finite list of external outcomes, including an empty batch, Lean proves a peak of at most one and a final count of zero. An open error acquires nothing. A scan error follows a successful open and unwinds the helper before the caller returns. The first error ends processing. [Universal certificate](certificates/fixed.lean)

The [source matcher](../../../skills/brooks-verify/scripts/verify_handles.py) reads the whole file and recognizes the two supported statement layouts. It chooses the function frame that owns the deferred close. This binding and the [Go operation model](../../../skills/brooks-verify/scripts/FileLifetime.lean) are trusted. The model assumes each successful open acquires a fresh handle, `scan` borrows it and returns, and each deferred close releases its handle. Its peak covers every acquisition because only open increases the live count. The scope is a single invocation with ordinary returns, including error returns. The theorem does not model process-wide file limits, other goroutines, panics, close failures, or code that duplicates or takes ownership of a descriptor.

## Real Go measurements

The test compiles each unchanged source separately and supplies the snippet's missing `scan` function. It opens real temporary files, retains the observed `*os.File` values and calls `Stat` on each at every scan and after return. A closed file must report `os.ErrClosed`. Reopening one path gives distinct handles. A missing path exercises the real open-error branch; a sentinel returned by the observer exercises the scan-error branch. No descriptor-limit adjustment is needed.

| Inputs reached | Buggy live handles at scans | Fixed live handles at scans | Live after return, both |
|---|---|---|---:|
| Empty batch | [] | [] | 0 |
| Two successful scans | [1, 2] | [1, 1] | 0 |
| Four successful scans | [1, 2, 3, 4] | [1, 1, 1, 1] | 0 |
| Two successes, then open error | [1, 2] | [1, 1] | 0 |
| Two successes, then scan error | [1, 2, 3] | [1, 1, 1] | 0 |

The [complete results](results.json) record eight cases per source, including first-iteration failures, source and certificate hashes, checker verdicts and axiom reports. The initial local run used Go 1.27.4 on Darwin/arm64 and Lean 4.19.0. CI repeats the same assertions on Ubuntu and prints the actual tool versions.

## Reproduce from a clean checkout

Use Python 3, Node.js 22, Go 1.22+ and Lean 4.19.0 on PATH. With elan, install and select the existing pinned toolchain first.

```sh
export ELAN_TOOLCHAIN="$(cat docs/research/logic-lens-009/lean-toolchain)"
elan toolchain install "$ELAN_TOOLCHAIN"
```

Run the complete offline replay from the repository root.

```sh
python3 -I docs/research/logic-lens-004/replay.py
```

The replay verifies upstream SHA-256 digests before compiling, installs the skill in a temporary directory and requires checker exits 1 and 0 respectively. It compares the regenerated certificates byte-for-byte, asks Lean to check independently restated obligations, audits their axioms, and checks each observed Go trace against the model. Finally it compares the measured record to the committed JSON. Pass `--corpus PATH` to use a separate checkout of the same upstream probe. To inspect a single checker report:

```sh
python3 -I skills/brooks-verify/scripts/verify_handles.py docs/research/logic-lens-004/upstream/buggy.go docs/research/logic-lens-004/contract.json
python3 -I skills/brooks-verify/scripts/verify_handles.py docs/research/logic-lens-004/upstream/fixed.go docs/research/logic-lens-004/contract.json
```
