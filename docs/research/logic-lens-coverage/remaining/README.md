# Remaining logic-lens probes after 001, 002, 005 and 009

The [completed 004 experiment](../../logic-lens-004/README.md) implements the recommendation below. The [008 experiment](../../logic-lens-008/README.md) subsequently added a separate loop-capture contract. The original survey remains reproducible with the predicate checker.

**Survey recommendation: prototype Go function-scoped resource lifetimes for 004 next.** Four ordinary successful opens separate the two implementations, and the original snippets give a precise event to observe on every iteration. A proof about peak live handles could explain a failure on large batches without depending on a host's file limit.

The pinned corpus has nine probes. Cases 001, 002, 005 and 009 already have a certified counterexample and fix within their respective models. The remaining three pairs and two fixed-only controls account for eight original files. All eight returned exit 2 (`unverified`) from the installed checker; none reached Lean. This survey adds process evidence and leaves two-sided certification at 4/7 paired cases. [Historical baseline](../README.md) · [Per-file hashes, obligations, diagnostics, tool versions and observations](results.json)

| Case | Where brooks-verify stopped | What the original code did in a native runtime | What a proof would require |
|---|---|---|---|
| 003 · Java shared formatter, pair | Both failed Python parsing. No Java backend. | Four JVM threads each formatted their own UTC date 1,000 times. The original produced 2,807 wrong results or exceptions in the recorded run, the fix zero. Each variant used its declared argument type. The count depends on scheduling; a run can miss the race. | Java shared state, interleavings, and trusted formatter library contracts. The sample cannot establish correctness for every schedule. |
| 004 · Go file handles, pair | Both failed Python parsing. No Go backend. | Four successive opens of the same temporary path produced live-handle counts `[1,2,3,4]` and `[1,1,1,1]` at scan entry. All four handles were closed after the outer function returned in both variants. | Function frames, ownership of opened handles and deferred close on return, including helper calls. |
| 006 · JavaScript list validator, pair | Both failed Python parsing. No JS or regex cost backend. | Node accepted `alpha` and `foo, bar` on both. Only the original accepted the empty string and `a,`. The checks establish an observable language difference. Worst-case matching cost remains unmeasured. | An independently specified accepted language and an engine-specific work model for the cost claim. |
| 007 · Python memo cache, fixed-only | Parsed as Python, then failed the standalone function requirement at the module-level cache. | Eight overlapping calls agreed with an independent iterative recurrence. All 21 memo entries agreed too. A negative input raised `ValueError` and preserved the cache. | A cache invariant preserved by recursive calls and by later invocations. This control has no buggy counterpart. |
| 008 · Go loop capture, fixed-only | Failed Python parsing. No Go backend. | With module language version 1.22, four goroutines delivered the multiset `[-1,2,8,8]` to a synchronized observer before return. Order is unspecified. | Go 1.22 iteration bindings, closure capture and goroutine completion. This control has no buggy counterpart. |

The replay uses the historical survey's independent obligation envelopes as **source admission probes** for the installed `lean_review.py`. At the time of this survey the other entry points required a Python batch update or a Bash worker contract. All five properties fell outside the supported contracts at that revision. Errors mentioning Python syntax in Java, Go and JS files identify the parser that stopped. The native runs use unchanged file bytes from the pinned Git objects. For 003, the compiler needs the public class filename. For 004, the upstream snippet leaves `scan` undefined; the test supplies a successful observer that calls `Stat` on previously opened handles. This measures the handles owned by the snippet. It does not measure total process descriptors or simulate resource exhaustion.

## What the proposed capability buys

004 offers a paired, deterministic observation and a small first proof obligation. At each scan entry count the handles opened by this invocation and still live. With successful opens and scans, the second iteration of the original should already violate a budget of one. For the fixed source, prove a peak of at most one across arbitrary batch lengths and zero live handles at function return. Specify the open, scan and close assumptions; check empty input, early returns and unsupported ownership transfers before broadening the claim. The proof and source binding are future work.

Within this corpus **004 is the only direct additional case** for that contract. A Go frontend that preserves lexical scopes, loop bindings and function frames would also support the first translation step for 008. Its capture and completion obligations need a separate concurrency model. 001 and 002 offer existing examples of effects across calls, but their file-write and exit-status theorems add no coverage for Go ownership. Prioritizing 003 first would require library and scheduling models together; 006 still lacks a measured work unit; 007 is a useful invariant control with no paired defect. These results rank the next experiment on this corpus alone.

## Reproduce

From the brooks-lint repository root use Git, Python 3.9+, Node.js 22+, JDK 17+ and Go 1.22+. The external checkout needs the pinned commit. Once it is present, the replay uses local Git objects and standard libraries.

```sh
git clone https://github.com/hyhmrright/logic-lens.git /tmp/logic-lens-survey
python3 -I docs/research/logic-lens-coverage/remaining/replay.py /tmp/logic-lens-survey > /tmp/remaining-results.json
```

The command installs the current skill in a temporary directory, checks each original's SHA-256 against the baseline, requires checker exit 2 and absence of a certificate, and checks the observed outcomes in fresh native runs. CI runs the same replay on Ubuntu and prints its JSON. JVM mismatch counts, tool versions and Python parser diagnostics can vary. The committed JSON preserves one local run.
