# A checkable performance finding for Python stable deduplication

Both upstream functions return the expected values on the witness. Only the list-scan implementation exceeds the budget. With four distinct strings, it visits **six** previously stored elements against a budget of **four**. For the set-based implementation, Lean proves first-occurrence order on **every** finite string list, **zero** list scans, exactly **one set membership query per input**, and at most one insertion per input. These are operation counts. Hash collisions, allocation, string comparison time, and elapsed runtime have separate costs.

| Evidence | Original list scan | Upstream set-based fix |
|---|---|---|
| Source observation on `["a","b","c","d"]` | Output unchanged; 6 list elements visited, 0 set queries | Same output; 0 list elements visited, 4 set queries |
| Lean statement | For every list of n distinct strings, the scan visits 0 + 1 + … + (n−1) elements. The four-element witness specifically violates the declared budget. | For any input xs, output equals the standard library's `xs.eraseDups`. Query count equals input length; insertion count is bounded by it. |
| Ordinary output checks | 364/364 passed | 364/364 passed |

The research question, four-element witness and concrete comparison budget were recorded **before implementation**, after inspection of the upstream case. The upstream label describes a quadratic performance problem; the exact linear threshold is our experimental contract. This is a deliberately selected, known defect. The result demonstrates a finding that value-only checks on these inputs miss. It provides no estimate of accuracy on unseen projects. [Prior decision](https://github.com/hyhmrright/brooks-lint/blob/fb01607/docs/research/logic-lens-coverage/README.md#next-experiment-and-decision-gate) · [Upstream source and labels at the exact revision](https://github.com/hyhmrright/logic-lens/tree/3b158e228127e21bff7be6530e3923de0793a907/evals/real-world/probes/009-quadratic-dedupe-perf)

## Reproduce from one checkout

Use the Git revision containing the [recorded results](results.json), Node.js 20+, CPython 3.10+ and Lean 4.19.0. With Lean directly installed, put its bin directory on PATH. With elan, select the recorded toolchain explicitly so subprocesses in temporary directories inherit it:

```sh
export ELAN_TOOLCHAIN="$(cat docs/research/logic-lens-009/lean-toolchain)"
elan toolchain install "$ELAN_TOOLCHAIN"
lean --version
python3 -I docs/research/logic-lens-009/replay.py
```

Once the tools are installed this runs offline, including the skill installer. The program fails on changed fixture hashes, wrong checker exits, altered challenge statements that no longer type-check, unexpected proof axioms, divergent Python observations or differences from the stored evidence. The Validate workflow runs this on its Node 22 job. To retain both standalone Lean files for inspection and rechecking:

```sh
out=$(mktemp -d)
python3 -I docs/research/logic-lens-009/replay.py --cert-dir "$out"
lean "$out/buggy.lean"
lean "$out/fixed.lean"
```

The [upstream directory](upstream/) includes byte-identical source files, the human-authored metadata and the upstream MIT license. The initial run used the original logic-lens checkout. To repeat that exact path with your own checkout, pass `--corpus /path/to/logic-lens/evals/real-world/probes/009-quadratic-dedupe-perf`. The same SHA-256 checks apply. The default replay compares with results.json. Use `--output /tmp/new-results.json` to write a separate measurement for inspection. For older corpus-wide records use the [baseline replay](../logic-lens-coverage/README.md#replay) and its historical checker revision.

## What another reviewer can verify

1. **Read the contract.** The two variants receive the same [contract](contract.json). The reference behavior is Lean's standard `List.eraseDups`, which keeps the first occurrence in input order. Witness and budget can be inspected without reading either implementation.
2. **Check the source bridge.** The [frontend](../../../skills/brooks-verify/scripts/lean_review.py) compares the whole module's function signature and complete loop body to two syntax patterns. It allows consistent local renaming and ignores docstrings. It rejects unsupported operations, changed control flow and shadowed built-ins. This recognizer and its assignment of Python operations to the [Lean model](../../../skills/brooks-verify/scripts/Dedupe.lean) are trusted code. There is no machine proof of Python language semantics or of the recognizer.
3. **Inspect the model.** A list lookup short-circuits on the first match and counts each element visited. A set is represented by its membership function. Insertion updates that function; a lookup counts once. Only equality is observed. Python strings can be represented injectively as equality tokens (for example UTF-8 with surrogatepass encoded as hex). The domain assumes ordinary built-ins, finite inputs, and enough resources to finish the run.
4. **Check the theorem and its assumptions.** The replay states the expected theorem types independently of the generator and asks the kernel to accept the returned declarations at those types. It inspects transitive axiom dependencies. The four-element witness has none. The universal fixed contract and distinct-input comparison sum use `propext` and `Quot.sound`; no placeholder axiom is accepted. This replays the same kernel, not a second independently implemented prover.
5. **Cross-check against Python.** The harness executes only the two hash-checked files. It checks output against insertion-ordered `dict.fromkeys` on all 364 words of lengths 0–5 over three tokens, including repeated and empty inputs. A line tracer observes the membership tests and reconstructs list visits from the current list and key. For all 40 words of lengths 0–3, Lean separately checks the model's output, comparisons and query count against those observations for each variant. The source observations and finite comparisons exercise the trusted bridge; the induction proves the unbounded model result.

### Using the installed skill on another file

Invoke `$brooks-verify` with the complete module and a separately justified contract. The accepted syntax currently covers the two annotated loop shapes with plain lists of built-in strings. Variables and function names may differ. A loop that reverses its output or calls another function returns `unverified`. It needs separate modeling before a reviewer can issue a proof or a certified finding. [Skill guide](../../../skills/brooks-verify/verify-guide.md)
