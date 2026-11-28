# 008 · Go 1.22 range capture and callback completion

The pinned logic-lens probe contains one correct implementation, `fixed.go`. It declares `id` with `:=` inside a range clause. Under Go 1.22 each iteration has a fresh binding. Each goroutine calls `handle(id)` and then executes its deferred `wg.Done()`. The caller waits after the launch loop. A separate shared-variable regression is included here to challenge the same contract. [Original source, metadata and license](upstream) · [Upstream revision](https://github.com/hyhmrright/logic-lens/tree/3b158e228127e21bff7be6530e3923de0793a907/evals/real-world/probes/008-decoy-go122-loopvar-safe) · [Go range specification](https://go.dev/ref/spec#For_range) · [WaitGroup semantics](https://pkg.go.dev/sync#WaitGroup)

## What Lean checks

The [contract](contract.json) requires the argument captured for each input position and one completed callback per position at return. The [model](../../../skills/brooks-verify/scripts/LoopCapture.lean) labels each launch with its input index. For example, the two occurrences of 3 in `[3, 7, 3, 9]` carry different labels. A scheduler can choose any pending worker to complete. A completion records the callback argument with its launch index, removes that pending job and accounts for its deferred Done.

* **Original.** In every reachable prefix, each completed pair belongs to the indexed input. When Wait can return, the completed pairs form a permutation of the indexed input. Thus every position completed once with its own value, and every integer occurs as many times among the completed calls as in the input. The theorem holds for arbitrary finite input lists and completion orders. [Original certificate](certificates/fixed.lean)
* **Shared-variable control.** This local variant declares one `id` before the loop and uses `=` to assign it on each iteration. A channel closed after the loop orders all captured reads after the final assignment. For input `[1, 2]`, Lean checks a reachable returned state with both callbacks receiving 2. The control keeps the WaitGroup intact; it still waits for two callbacks. [Control source](controls/shared.go) · [Counterexample certificate](certificates/shared.lean)

The [matcher](../../../skills/brooks-verify/scripts/verify_capture.py) reads the entire source, requires the Go 1.22 build constraint and recognizes the two supported forms. Source binding and the interpretation of Go range, channel and WaitGroup operations are trusted. Grouping launches before recording completions preserves the binding in the original because later assignments cannot overwrite a previous iteration's cell. In the shared control the gate enforces that ordering directly. The model tracks a callback as pending until it has returned and Done executes. The proof assumes stable input, normal callback returns and successful WaitGroup operations. The claim concerns executions in which fanOut returns; it gives no scheduler fairness or termination guarantee, and an asynchronous side effect started by a callback has its own lifetime.

## Real Go observations

The replay compiles the original bytes under module language version 1.22. Each callback announces entry and waits for the test to release it, then records its argument under a mutex just before exiting. The caller snapshots the recorded values immediately upon return. The observer sorts that snapshot to preserve multiplicity across schedules. Go's callback accepts only an integer, so the native observations distinguish values and counts; the Lean proof also distinguishes equal values by their launch indices.

| Input | Original, completed at return (sorted) | Shared control, completed at return (sorted) |
|---|---|---|
| `[]` | `[]` | `[]` |
| `[1, 2]` | `[1, 2]` | `[2, 2]` |
| `[3, 7, 3, 9]` | `[3, 3, 7, 9]` | `[9, 9, 9, 9]` |
| `[-1, -1, -1]` | `[-1, -1, -1]` | `[-1, -1, -1]` |

Six input lists per implementation ran with GOMAXPROCS set to 1 and 4. The all-equal control shows why a distinct-value witness matters. The initial local run used Go 1.27.4 on Darwin/arm64 and Lean 4.19.0. The JSON retains source and certificate digests, axiom reports, checker verdicts and all 24 observations. [Measured results](results.json)

## Reproduce from the repository root

Install Python 3, Node.js 22, Go 1.22+ and Lean 4.19.0 on PATH. With elan, select the existing pinned kernel first.

```sh
export ELAN_TOOLCHAIN="$(cat docs/research/logic-lens-009/lean-toolchain)"
elan toolchain install "$ELAN_TOOLCHAIN"
```

Run one command from a clean checkout. It also runs in the Node.js 22 job of Linux CI.

```sh
python3 -I docs/research/logic-lens-008/replay.py
```

The replay checks upstream source digests, installs the skill into a temporary directory, requires checker exits 0 and 1 respectively, and compares the regenerated certificates byte-for-byte. Lean rechecks independently restated propositions and their axiom reports. The driver compares fresh Go observations and the checker reports with the committed record. Use `--corpus PATH` to select a separate checkout of the upstream probe at the pinned commit.
