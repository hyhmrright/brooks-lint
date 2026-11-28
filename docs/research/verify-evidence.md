# Replaying brooks-verify from source

The corpus revision is `3b158e228127e21bff7be6530e3923de0793a907`. All nine replays use original source bytes. The case-specific frontends select Lean models for restricted source forms. Lean checks the encoded proposition. Source recognition, platform semantics, runtime library assumptions and the choice of contract remain part of the trust boundary. Proof replay and runtime comparison are complementary evidence.

| Probe | Certified result for the admitted source | Runtime or scope |
|---|---|---|
| [001](logic-lens-001/README.md) | The eager update writes a preceding file before a later validation failure. Staging preserves every target on validation failure. | Temporary file snapshots and write traces. Write-time disk failure is outside the contract. |
| [002](logic-lens-002/README.md) | Worker failure can reach the caller as success. The supported propagation fix preserves failure. | Bash and xargs exit codes, success control and removed-return regression. |
| [003](logic-lens-003/README.md) | A shared formatter permits interference. Isolated calls return the result for their own input in the library model. | Controlled overlapping JVM calls under the documented calendar assumptions. |
| [004](logic-lens-004/README.md) | The second scan can hold two handles. Per-file scope bounds concurrent ownership by one and closes all on return. | Go handle observations under the stated open, scan and close semantics. |
| [005](logic-lens-coverage/results.json) | Year 100 refutes the original. The fix satisfies the Gregorian predicate on all plain integer years. | Python compares the original functions with the standard calendar across a 400-year cycle. |
| [006](logic-lens-006/README.md) | The loose form accepts the empty string. The strict form accepts exactly the specified word-list language. | Node checks language behavior. The upstream worst-case matching-cost obligation remains open. |
| [007](logic-lens-007/README.md) | Repeated calls preserve the Fibonacci cache invariant. Negative input preserves the cache. | Upstream supplies only the correct version. The wrong-store variant is a local regression control. |
| [008](logic-lens-008/README.md) | Per-iteration capture and join deliver each input occurrence once, including duplicates. | Go 1.22+ callback observations. The shared-variable variant is a local regression control. |
| [009](logic-lens-009/README.md) | Four distinct strings exceed the original comparison budget. The fix preserves first occurrences and bounds membership probes by input length. | Python observations count modeled operations. Elapsed time is outside the budget. |

Six of seven upstream pairs have two-sided evidence for the labeled defect. One pair has two-sided evidence for a narrower functional contract. Two upstream controls have a proof and a local mutant. This is a development corpus and supplies no estimate of accuracy on unfamiliar projects.

## Independent transfer check

We selected the actual multi-file Node updater from brooks-lint main at `7c1a6f3ce50de016ea0dc2f73db14b061bd11200`. The trial asks whether the existing Python batch backend can transfer its validation-before-write analysis to this JavaScript implementation. It passes the unchanged source and 001 contract to the installed checker. The expected result is exit 2 and no certificate at Python source admission.

In a separate native observation, the first manifest has a valid version field and the next manifest has an empty plugins array. Node updates the first manifest before it throws while addressing the absent plugin. This tests an analogous manifest-shape failure. The 001 theorem covers a Python target-pattern mismatch. Transferring a proof would require a JavaScript frontend and a reviewed model of JSON access, exceptions and file writes. The checked-in updater has no documented transaction guarantee. This single abstention is evidence of a coverage boundary.

## Reproduce

Use a Git checkout with history through the pinned main commit. Put Python 3.9+, Node 22+, Lean 4.19.0, Bash, xargs, Go 1.22+ and JDK 17 on PATH. Linux CI uses GNU xargs. From the repository root run:

```sh
python3 -I docs/research/replay-verify.py
```

The command stops at the first discrepancy. Run `python3 -I docs/research/verify-transfer/replay.py` alone for the independent trial. It needs only Git, Node and Python and writes exclusively to a temporary directory.
