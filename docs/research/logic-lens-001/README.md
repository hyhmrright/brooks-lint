# 001 · Validate every patch before writing any target

The two original logic-lens scripts differ on an observable failure path. Request
version `2.0.0`, give the first file a valid version field and omit the field
from the second. Both scripts exit with status 1. The eager script has already
changed the first file; the staged script has opened no target for writing.

| Observation | Eager original | Staged fix |
|---|---|---|
| Original contents of `package.json` | `{"version": "1.0.0"}` plus newline | Same |
| Rejected target | `.claude-plugin/plugin.json` containing `{}` plus newline | Same |
| Write trace before exit | `["package.json"]` | `[]` |
| Final contents of `package.json` | `{"version": "2.0.0"}` plus newline | Original bytes |
| Post-write `validate-repo.sh` executed | No | No |

The [contract](contract.json) names the failure precisely: a required substitution
finds **no match** while preparing a target patch. The original uses
`re.subn(..., count=1)`; that operation does not detect duplicate version
fields. The upstream metadata supplies the requirement independently of the
source matcher. The two [unaltered scripts and metadata](upstream/) are included
under the [upstream MIT license](upstream/LICENSE). The external source is pinned
at [logic-lens commit 3b158e2](https://github.com/hyhmrright/logic-lens/tree/3b158e228127e21bff7be6530e3923de0793a907/evals/real-world/probes/001-nonatomic-multifile-write).

## Reproduce

From a checkout containing this record, install CPython 3.10+, Node.js 20+,
Bash with the standard `touch` utility, and Lean 4.19.0 on PATH. With elan,
select the same toolchain used by [009](../logic-lens-009/lean-toolchain):

```sh
export ELAN_TOOLCHAIN="$(cat docs/research/logic-lens-009/lean-toolchain)"
elan toolchain install "$ELAN_TOOLCHAIN"
python3 -I docs/research/logic-lens-001/replay.py
```

The replay works offline after the tools are installed. It installs the skill
into a fresh directory, checks the source hashes, regenerates both certificates,
compares them byte for byte with the committed files, checks their types against
independently written challenges and audits the axioms. Then it executes the
pinned Python scripts in disposable repositories and compares all observations
with [results.json](results.json). To use your own logic-lens checkout, append
`--corpus /path/to/logic-lens/evals/real-world/probes/001-nonatomic-multifile-write`.
That is how the initial measurement was taken. Use `--output /tmp/001.json` to
save a separate result. Neither the fixture repository nor an installed project
is used as a target for version updates.

Each committed certificate is standalone:

```sh
lean docs/research/logic-lens-001/certificates/buggy.lean
lean docs/research/logic-lens-001/certificates/fixed.lean
```

To check one source without executing it:

```sh
python3 -I skills/brooks-verify/scripts/verify_batch.py \
  docs/research/logic-lens-001/upstream/buggy.py docs/research/logic-lens-001/contract.json
```

Exit 1 means certified counterexample, 0 means verified, and 2 means unverified.
The command returns the complete certificate in `lean_certificate`.

## What was proved

* **Eager.** Lean checked a disk, exact before/after contents, the rejecting
  second path and a write trace containing exactly the first path. The theorem
  holds for any remaining suffix of targets. The original program's regex
  produced these actual contents in the filesystem replay.
* **Staged.** For every initial disk, finite ordered target list, pure patch
  functions and rejected target, rejection during preparation implies an empty
  write trace and equality of the entire resulting and initial disk mappings.
  A separate lemma confirms that the example actually rejects; another proves
  successful preparation commits its patches in order. The checked witness and
  universal failure theorem both have **zero axiom dependencies** in Lean 4.19.0.
* **Source bridge.** The [checker](../../../skills/brooks-verify/scripts/verify_batch.py)
  admits two narrow Python workflows. It checks imports, initialization, literal
  path inventory, helper validation and effects, both loops, the main guard and
  the post-write command. It selects semantics from the helper body and its
  call sites. Comments and formatting may vary. Extra side effects or unknown
  control flow produce `unverified`. Its concrete eager witness requires the
  first two paths shown above. The source recognizer and its correspondence to
  the [Lean model](../../../skills/brooks-verify/scripts/BatchUpdate.lean)
  are trusted. Lean models a pure patch decision and a path-to-content map;
  it does not implement Python, regex parsing or the filesystem.

## What ran on disk

Each source underwent nine runs. The harness placed a malformed target at each
of the six positions in turn. On those failures, the eager variant changed
exactly the earlier 0, 1, 2, 3, 4 or 5 files; the staged variant made zero write
opens in all six cases. CPython audit events observed write opens separately from
before/after byte snapshots. With the first file already at the requested
version and the second invalid, the eager version still opened the first for
writing, despite identical final bytes. The staged version did neither.

Two further controls exercised the success path and a deliberately failing
post-write validator (exit 23). In both controls, both scripts wrote all six
files and invoked the validator. That final process failure is **outside** the
preparation theorem. So are write-time errors, crashes, concurrent changes,
path aliasing, permissions and crash durability. This is evidence for one known
case and two supported workflow shapes; it supplies no population-level defect
detection rate.
