# 002 · A failed worker reported as a successful pipeline

The original Bash function captures the failed command's status, removes a
partial output and logs a diagnostic. Its last command is a successful
`echo` (buggy.sh line 23), so the function and child Bash both return zero.
The caller can then mark the batch successful despite a failed job. The fix
returns the saved status after logging (fixed.sh line 35). Child Bash preserves
the command status and xargs signals a failed batch to its caller.

The [contract](contract.json) comes from the upstream case metadata. If a
worker command actually executes and exits nonzero, the caller must receive
a nonzero pipeline status. The [original Bash scripts and metadata](upstream)
come from [logic-lens commit 3b158e2](https://github.com/hyhmrright/logic-lens/tree/3b158e228127e21bff7be6530e3923de0793a907/evals/real-world/probes/002-exit-code-swallowed).
The replay checks their SHA-256 digests before running either script.

## What Lean checked

The [checker](../../../skills/brooks-verify/scripts/verify_worker.py) reads the
entire script as data and recognizes the two supported worker bodies, exports
and two-stage pipeline. An unknown statement or invocation yields
`unverified`. The binding from Bash source to the
[exit-status model](../../../skills/brooks-verify/scripts/WorkerExit.lean) is
small enough to inspect directly and is part of the trusted implementation.

* The [counterexample](certificates/buggy.lean) uses one executed command
  returning 23 and a successful producer. The worker, child Bash, xargs and
  caller all return zero. The checker supplies this witness and Lean checks it.
* The [fix certificate](certificates/fixed.lean) covers every nonzero 8-bit
  command status, every list of completed jobs containing that execution, and
  every producer status. The worker and child return the command status. When
  xargs maps a failed child to a nonzero aggregate, the caller receives a nonzero
  status. A separate control proves that if all children succeed, the outer
  pipeline with pipefail returns the producer status.

The model assumes the intended commands resolve normally, setup, redirection,
cleanup and diagnostic output succeed, and child processes exit normally. The
proof models the status rules of Bash and xargs. Evidence about the actual
binaries comes from the process replay below. Neither signals, launch failures,
file contents nor whether pending work starts after a child exits 255 are
covered by the propagation theorem.

## Process evidence

The replay sources each unchanged script in real Bash with pipefail enabled and
uses real xargs with two worker slots. Only the command named `claude` is a
stand-in. It reads the fixture prompt, optionally emits bytes and exits with
the requested status. Reproduction needs no model account or network access
after toolchain installation.

For each version, eight scenarios cover success, command failures 1, 23 and 255,
a mixed two-job batch in both input orders, successful but empty output, and
a previously completed job. Each runs twice in fresh directories. The first
run records the child process status and both entries of Bash's `PIPESTATUS`;
the second omits the observation traps and checks the same commands ran and the
caller returned the same exact code. The exported function is the child shell's
last command. Its status is derived from that shell rule. The child process
status itself is measured.

[Portable results](results.json) retain exact command, child and producer codes
and whether xargs and the caller returned nonzero. The platform logs retain
the numeric aggregate. The fixed worker preserves 23 up to the child boundary;
callers can detect the failed batch even when xargs assigns a different number.

Both binaries below ran on the same Darwin host with GNU Bash 5.3.20. For
each row, the producer returned zero. The child Bash and caller columns show
actual process statuses.

| Script | Command | Child Bash | Darwin xargs / caller | GNU xargs / caller |
|---|---:|---:|---:|---:|
| Buggy | 23 | 0 | 0 / 0 | 0 / 0 |
| Fixed | 23 | 23 | 1 / 1 | 123 / 123 |
| Buggy | 255 | 0 | 0 / 0 | 0 / 0 |
| Fixed | 255 | 255 | 1 / 1 | 124 / 124 |

See the full [Darwin system xargs log](runtime-darwin.json) and
[GNU findutils 4.10.0 log](runtime-gnu.json). The GNU binary was built using
`./configure --disable-nls` and `make` from the tar.xz archive matching the
[release checksum](https://lists.gnu.org/archive/html/bug-findutils/2024-06/msg00017.html).
The [GNU xargs manual](https://www.gnu.org/software/findutils/manual/html_node/find_html/Invoking-xargs.html)
documents its aggregate statuses.

## Single-line regression

The replay removes only the failure branch’s `return "$rc"` from a temporary
copy of the hash-checked fixed script. The empty-output guard and child shell
options still apply. The contract file and installed checker are the same for
all three scripts. The two process logs above include the mutant digest,
checker verdict and measured statuses under `removed_return`.

| Script | Worker command | Child Bash | GNU xargs | Caller | Checker verdict for the failure contract |
|---|---:|---:|---:|---:|---|
| Original buggy | 23 | 0 | 0 | 0 | counterexample |
| Original fixed | 23 | 23 | 123 | 123 | verified |
| Fixed with return removed | 23 | 0 | 0 | 0 | unverified |
| All three, successful command with output | 0 | 0 | 0 | 0 | Same verdicts per script |

The mutant falls outside the checker’s two recognized worker shapes. The
regression requires the unsupported-source diagnostic, CLI exit 2 and absence
of a certificate. The failing execution itself supplies the mutant witness.
On Linux the replay requires GNU xargs and checks its exact aggregate for every
scenario, including 124 for a child exiting 255.

## Reproduce from the repository root

Use Python 3, Node.js 22, Bash, xargs supporting `-P` and `-I`, and Lean 4.19.0
on PATH. With elan installed, select the same kernel as cases 009 and 001.

```sh
export ELAN_TOOLCHAIN="$(cat docs/research/logic-lens-009/lean-toolchain)"
elan toolchain install "$ELAN_TOOLCHAIN"
```

From a clean checkout with those tools available, run the entire check with one command.

```sh
python3 -I docs/research/logic-lens-002/replay.py --runtime-output /tmp/002-runtime.json
```

The [Validate workflow](../../../.github/workflows/validate.yml) runs this replay on
Ubuntu in the Node.js 22 job on every research-branch push and prints the
exact process record in the job log.

The replay installs the skill in a temporary directory, verifies the source
hashes, requires checker exits 1 and 0, compares regenerated certificate bytes,
type-checks independently restated propositions, checks their axiom reports
and compares the process observations with the committed portable results.
Use `--corpus /path/to/logic-lens/evals/real-world/probes/002-exit-code-swallowed`
for a separate upstream checkout. Select binaries with `--bash` and `--xargs`.
To inspect a single checker report, run either command below. Exit 1 on the
first command means a certified counterexample.

```sh
python3 -I skills/brooks-verify/scripts/verify_worker.py docs/research/logic-lens-002/upstream/buggy.sh docs/research/logic-lens-002/contract.json
python3 -I skills/brooks-verify/scripts/verify_worker.py docs/research/logic-lens-002/upstream/fixed.sh docs/research/logic-lens-002/contract.json
```
