# 001: partial writes in python-patch-ng 1.18.1

The released CLI violates the [001 study contract](contract.json) in both
orders of a two-file unified diff. A mismatch increments the error counter.
The loop continues and applies each matching file. At the end of the loop,
`PatchSet.apply` returns false and the command exits with POSIX status 255.
A caller observing failure can therefore encounter an already modified target.
The no-write condition is the study's requirement for callers that need batch
atomicity. It is not an upstream promise.

| Initial state | POSIX exit | Target mutations, in order | Final bytes |
| --- | ---: | --- | --- |
| Both contain `old\n` | 0 | Rename first, open first for writing, rename last, open last for writing | Both contain `new\n` |
| First contains `unmatched\n` | 255 | Rename last, open last for writing | First retains `unmatched\n`; last changes from `old\n` to `new\n` |
| Last contains `unmatched\n` | 255 | Rename first, open first for writing | First changes from `old\n` to `new\n`; last retains `unmatched\n` |

Here “first” and “last” denote the distinct regular files `first.txt` and
`last.txt`. Rename moves the unchanged file to its sibling `.orig` before the
new contents are written to the target. The CLI removes the temporary backup.
The trace is restricted to operations on the two target names.

## Reproduce

From a full Git checkout with Node.js, POSIX Python 3.11 and Lean 4.19.0 on PATH:

```sh
python3.11 -I -B docs/research/001-patch-ng/replay.py
```

Replay needs no network. It uses the [vendored source and license](../001-independent/holdout/samples/patch-ng/)
from [upstream 1.18.1](https://github.com/conan-io/python-patch-ng/blob/2f815d7b033f93140bb48ce69517b432d3d2bf86/patch_ng.py).
The frozen verifier at `be2dda5aac7a709041ec80481c604be576d2673c` reproduces
the 32 KiB refusal with the prior contract. The installed checker admits this
44,933-byte module under the new contract by checking its exact length and full
SHA-256 before selecting the reviewed model. The controls change a return
condition without changing source length and append a byte to the genuine
source. Both must yield `unverified`.

The [Lean certificate](counterexamples.lean) models the per-file checks, the
accumulated errors, the target mutations and the resulting disk for these two
single-hunk witnesses. Replay checks both theorem statements independently
against concrete paths, bytes and exit codes, and checks Lean's axiom reports.
It then runs the upstream CLI on fresh files with the same single-line
`-old/+new` diff, requires the mismatch diagnostic on both rejected runs,
and compares the audit events and raw before/after bytes against the checker
witnesses and the earlier holdout record. Linux CI runs the same command.
See the [machine-readable results](results.json).

The trusted step is the reviewed correspondence between this pinned source
and the model. The witnesses use default non-fuzzy matching, existing files,
successful filesystem operations and no concurrent writers. Other patch
formats, releases, and I/O failures require separate analysis.
