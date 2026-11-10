# Hard runtime benchmark design, revision 1

Prepared on 2026-11-10 as an offline successor candidate set to the ceiling-level
HC comparison. The request for “100 times harder” is a direction, not a measured
quantity: no calibrated difficulty ratio or new model performance is claimed.
The goal is harder causal and contract discrimination without ambiguous grading,
opaque dependencies, artificial code obfuscation or mandatory prose templates.

## Family catalog

Each family has three concrete multi-file runnable programs: one bounded defect,
one protective near-miss, and one contract-insufficient case. IDs deliberately do
not use a fixed kind order. The four calibration families use explicit worked
workloads; reserved families describe allowed events/configuration and require
the reviewer to derive a witness. Exact driver schedules remain evaluator-side.

| Mechanism | Family split | Defect / protected / unresolved | Reasoning dimensions |
| --- | --- | --- | --- |
| Queue residence, retry delay and deadline origin | calibration | HB-01 / HB-03 / HB-02 | absolute-vs-relative-time, queue-plus-retry, admission-vs-completion |
| Layered retry after partial progress | calibration | HB-05 / HB-04 / HB-06 | nested-retry-ownership, unknown-send-outcome, global-vs-local-budget |
| Hedged winner and cancellation acknowledgement | calibration | HB-09 / HB-08 / HB-07 | client-vs-physical-lifecycle, hedge-fanout, cancel-ack-race |
| Expired lease holder crossing a transactional commit | calibration | HB-10 / HB-12 / HB-11 | lease-expiry, identity-reuse, atomic-commit-fence |
| Batch delay with independently expiring entries | development-reserved | HB-14 / HB-13 / HB-15 | coalescing, per-item-vs-envelope-contract, selective-expiry |
| Shared lookup with asymmetric cancellation | development-reserved | HB-18 / HB-17 / HB-16 | shared-work-ownership, refcount-lifecycle, cross-key-isolation |
| Weighted permit reservation cancelled during handoff | development-reserved | HB-19 / HB-21 / HB-20 | two-phase-reservation, posted-handoff-interleaving, weighted-capacity-progress |
| Half-open breaker with a late prior-epoch completion | development-reserved | HB-23 / HB-22 / HB-24 | breaker-state-machine, stale-epoch-completion, probe-lease-ownership |
| Fanout byte credits and unequal sink speeds | development-reserved | HB-27 / HB-26 / HB-25 | fanout-byte-accounting, enqueue-vs-drain, slow-sink-backpressure |
| Unknown commit, retry delay and deduplication retention | development-reserved | HB-28 / HB-30 / HB-29 | unknown-commit, retry-vs-retention-horizon, idempotency-state-expiry |
| Pool reuse while session reset acknowledgement is pending | development-reserved | HB-32 / HB-31 / HB-33 | asynchronous-reset, tenant-isolation, lease-transfer-before-ack |
| Shutdown barrier with delayed retry ownership | development-reserved | HB-36 / HB-35 / HB-34 | shutdown-linearization, delayed-retry-ownership, dequeued-callback-race |

Source and evaluation materials live in
[`evals/research/runtime/hard-benchmark/`](../../evals/research/runtime/hard-benchmark/README.md).
All fixtures execute their own modules rather than dispatching to a shared verdict
simulator. The shared suite performs inventory/export orchestration only.

## What makes these different

The candidate set requires distinguishing physical completion from client delivery,
current lease generation from reusable identity, aggregate deadlines from per-item
ownership, and enqueue acknowledgement from drainage. The latter families combine
queued callbacks with reservation stages, late epoch outcomes, retry-horizon
arithmetic, session reset and admission barriers. Supporting code includes benign
controls such as idempotent release, optional sink handling, cancelled generations,
known atomic boundaries and completed-flight cleanup. These details can invalidate
a superficial warning and must be interpreted against the actual contract.

The protected variants preserve the intended lifecycle instead of suppressing all
work. Drivers check continued admission/delivery where permitted, in addition to
rejecting adverse events. The unresolved variants preserve implementation and
observations while withholding one decisive policy; a reviewer must state both
contract-dependent judgments, not invent the absent deployment guarantee.

This is still a compact synthetic corpus. Three or four modules do not establish
real-system scale. Author-designed transitions are finite and controlled, not
exhaustive interleaving proofs, fuzzing coverage or OS/network validation. Even a
substantial increase in structural reasoning requirements may remain easy for a
particular model; that is an empirical question for a later authorized evaluation.

## Scoring and evidence

Rubrics preserve the established separation between assessment, causal issue
recall/misses, unsupported assertions, protected false defects, unresolved certainty
errors, evidence completeness and severity. Each defect currently has one distinct
causal issue; interacting stages are not inflated into duplicate findings. A
correct diagnosis with an omitted boundary explanation is not automatically a
miss. Protected scope is bounded to the supplied lifecycle contract. Warning is
allowed for these synthetic defects; absent severity is recorded separately.

A valid causal witness need not reproduce hidden driver values, quote an unseen
sibling, execute tests or match authored prose. The boundary requirement accepts a
relevant supported benign path or limit inferable from visible inputs. Unresolved
answers must name the missing artifact and explicitly contrast the same behavior
under two compatible contracts. Human semantic review remains necessary; JSON,
hashes and predicates cannot establish the truth of a model-answer annotation.

## Freeze, verification and next-stage boundary

The fixture inventory freezes all code, context, rubrics, drivers, oracles, tests
and saved offline observations. The CLI exports only allowlisted input filenames
and bytes after validation. Tests reject evaluator leakage, path escapes, symlinks,
byte drift, extra files and false independence claims. Source-mutation controls
verify each protected criterion detects the corresponding violating mechanism.

Run `npm run evals:runtime:hard`; it is also included in `npm test` and
`npm run evals:runtime:prepared`. Reproduction and export commands are in the
[suite README](../../evals/research/runtime/hard-benchmark/README.md).

The [prospective protocol](runtime-hard-benchmark-protocol.md) defines the future
measurement boundary and keeps diagnosis separate from evidence compliance.
This task does not run models, modify runtime guidance, silently replace prior
frozen studies or connect HB IDs to the historical live executor. Public
same-workflow authorship means all 36 cases are development-exposed. The reserved
24-case split is not independently authored, privately held or human validated;
book/source mappings are unverified. A later plan must pin its exact treatment,
scorer, corpus and model identities before execution.
