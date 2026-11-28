# Can 001 gate multi-file updates?

## Expanded checker, same seven samples

The installed checker now proves the explicit collection loop and certifies the
two targeted faulty rewrites. The experiment compares each source with the
frozen checker from `cb7fd52` and the installed checker on identical inputs.
All seven success controls and 46 failed preparations reproduced the original
exit codes, target bytes and write traces. Of the 18 failures with a target
write, zero received `verified` from either checker. Both verified samples
had zero target writes and zero byte changes in their 16 failure runs.

| Sample | Frozen | Expanded | Native observation at the witness or control |
|---|---|---|---|
| Released bump2version 1.0.1 | unverified | unverified | Three missing-version cases left all targets unchanged. |
| Eager bump2version mutant | unverified | unverified | A later missing version left earlier files changed. |
| Staged layout edit | verified | verified | All eight failed preparations left every target untouched. |
| Eager layout edit | counterexample | counterexample | The second manifest failed after the first was written. |
| Staged explicit loop | unverified | verified | All eight failed preparations left every target untouched. |
| Early metadata flush | unverified | counterexample | At README badge failure all five JSON files contained the new version. |
| Lazy commit | unverified | counterexample | At the second JSON failure the first file already contained the new version. |

The explicit loop accumulates pure patches before any write, so it uses the
[universal staged theorem](../logic-lens-001/certificates/fixed.lean).
The lazy consumer computes a patch, writes it, then requests the next one;
that order uses the [per-target eager witness](../logic-lens-001/certificates/buggy.lean).
The [early-flush certificate](expanded/early-flush.lean) models two separate
staged batches. The first commits the five named files, then the second rejects
the README. All three obligations are rechecked against independent Lean type
statements with no axiom dependencies. The source recognizer and its
correspondence to those models remain trusted.

**Gate decision.** Keep 001 advisory for general updaters. A reachable
certified counterexample can block the specific change under this contract.
The three newly recognized samples were known during this extension, so the
improvement measures regression coverage. The independent external program
and its faulty mutant still receive `unverified`; mapping that outcome to
success would allow the observed partial update.

With a full Git checkout, CPython 3.11, Node 22, Lean 4.19.0, Bash and touch
on PATH, run both revisions and the native oracle from the repository root:

```sh
python3.11 -I -B docs/research/001-independent/compare.py
```

The replay installs the candidate skill into a temporary directory, matches each
source hash and all native observations to the [frozen record](results.json),
checks the candidate certificates and witness bytes, and fails if a verified
sample wrote a target on rejection (including a same-byte write). The
[comparison record](expanded/results.json) names each reusable certificate and
its digest. Use `--output-dir /tmp/001-comparison` for a separate measurement.

## Frozen study

**Decision. Keep the checker advisory for general multi-file updaters.** On seven
samples the frozen checker issued one universal certificate and one certified
counterexample. Both matched observed behavior. It abstained on the independently
released updater, its faulty mutant, a safe structural rewrite and two other
faulty mutants. Treating abstention as success would have allowed three
implementations that wrote targets before a later match failure. Requiring a
certificate would also have blocked the released implementation and safe rewrite
on the exercised inputs.

## Reproduce offline

Use a Git checkout containing commit `cb7fd5211ebcf12b34f3cf96c2368483b2e25e97`,
CPython 3.11, Lean 4.19.0, Bash and touch. From the repository root run:

```sh
python3.11 -I -B docs/research/001-independent/replay.py
```

The runner retrieves the checker, Python helper, Lean model, certificate
templates and contract from the pinned Git objects and executes them in a
temporary directory. For every certified sample it matches the reported source
SHA-256 and full certificate against the sample and the pinned, independently
replayable [001 certificates](../logic-lens-001/certificates/). Missing Lean,
an unexpected abstention reason, a checker/exit mismatch, evidence drift or
a verified sample with a target write on rejection fails the replay.
Use `--output /tmp/001-measured.json` to save a separate measurement.
The [record](results.json) contains each source digest, checker outcome, and
the exit code, target byte changes and write opens from each native run.

## Individual outcomes

The two numeric columns count failing-input runs. Success controls are excluded.
A write open counts even when the final bytes are identical.

| Sample | Checker | Match failures | Failures with a write | Native result |
|---|---|---:|---:|---|
| bump2version 1.0.1 | unverified | 3 | 0 | Checks all configured CLI targets before replacement. |
| bump2version eager mutant | unverified | 3 | 2 | Checking and replacing one file at a time leaves earlier targets updated. |
| Staged layout edit | verified | 8 | 0 | The model's universal preparation-failure certificate applies to the admitted shape. |
| Eager layout edit | counterexample | 8 | 7 | The second-target mismatch leaves the first file at 2.0.0, matching the certificate. |
| Staged explicit loop | unverified | 8 | 0 | Replacing the list comprehension with a loop preserves staging in every run. |
| Early metadata flush | unverified | 8 | 2 | Only README rejection exposes writes to all five earlier manifests. |
| Lazy commit | unverified | 8 | 7 | Consuming patches lazily interleaves validation and writing. |

All seven success controls checked the updated bytes of every target. Across 46
preparation failures, 18 had write opens. Zero such runs received `verified`.
Only **one source** received that verdict, a layout edit of the original staged
implementation. The native tests share fixtures within each family. These
counts cannot estimate the false-verification rate on unfamiliar software.

## Sample selection and oracle

* **External implementation.** The unmodified Python package files in
  [upstream](upstream/) come from the MIT-licensed
  [bump2version 1.0.1 release](https://pypi.org/project/bump2version/1.0.1/).
  The published wheel is `bump2version-1.0.1-py2.py3-none-any.whl`, SHA-256
  `37f927ea17cde7ae2d7baf832f8e80ce3777624554a653006c9144f8017fe410`.
  The replay checks package bytes against its original RECORD. This tool was
  selected for updating multiple real files with a required text match; it was
  outside the frozen 001 corpus. The verifier receives its CLI module unchanged.
  CPython runs the package's CLI entry point with three positional targets in an
  empty temporary directory, with VCS executables absent. Each target in turn
  lacks the required old version. The harness checks the original exception
  and filename, write-open order and all final bytes. The [paired edit](released.py)
  places the same two upstream helper calls inside a per-file loop.
* **Derived controls.** The [variant definitions](variants.py) materialize five
  exact sources from the existing pinned originals. An evaluator authored the
  edits without inspecting the frozen checker internals. Two edit only layout,
  one replaces a comprehension with an explicit loop, and two change the point
  at which buffered patches are written. Each undergoes six missing-match
  positions, a success control, and two missing matches with preceding files
  already at the requested version. The original 001 native observer checks
  the error, validator reachability, target write opens and bytes independently
  of the checker result.
* **Scope.** The contract covers a required target-pattern mismatch during
  preparation. In the external CLI this is a missing old version string; in
  the derived samples it is a missing version field or badge. Observations
  use regular files, a single process and the named target inventory. Disk
  failure during commit, concurrent writers and durability need separate
  contracts. The five local edits and external mutant are controls, leaving
  one independent upstream implementation. The correspondence between accepted
  Python and the Lean model remains trusted.

For an already recognized workflow, a reachable certified counterexample can
justify blocking the specific change after confirming the contract with its
owner. For a broader mandatory gate, first qualify additional independent
implementations and challenge the source-to-model translation on nearby changes
in validation and write order. Preserve a distinct outcome for abstention.

The [second independent cohort](holdout/README.md) freezes the expanded checker
at c05c01a and measures three additional upstream programs on real target files.
