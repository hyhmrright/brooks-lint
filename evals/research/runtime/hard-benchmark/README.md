# Hard runtime development benchmark, revision 1

36 original synthetic cases across 12 mechanism families, prepared on 2026-11-10.
This is a **public, non-independent development benchmark**. Four whole families
are calibration material; eight whole families are reserved for a later development
evaluation. Authoring, code review and offline verification expose every family to
the same workflow. “Reserved” is a workflow split, not private custody or an
independent holdout. Human review and book mapping remain pending/unverified.

The user requested a dramatic increase in difficulty (“100 times”). There is no
validated scale on which that multiplier can be established. These programs add
cross-module ownership, time, admission, delivery and contract distinctions; no
new model responses have been collected and their empirical difficulty is unknown.
The earlier 81 answers, HC inputs, runtime prototype and core skills are unchanged.

See [design and family catalog](../../../../docs/research/runtime-hard-benchmark.md)
and the [prospective measurement protocol](../../../../docs/research/runtime-hard-benchmark-protocol.md).

## Offline commands

```sh
npm run evals:runtime:hard
node evals/research/runtime/hard-benchmark/cli.mjs reproduce > /tmp/hard-observations.json
diff -u evals/research/runtime/hard-benchmark/offline-evidence.json /tmp/hard-observations.json
node evals/research/runtime/hard-benchmark/cli.mjs export HB-01 > /tmp/hard-input.json
```

`export` returns only canonical input filenames and exact contents, without case,
family, split, kind or evaluation metadata. It validates frozen bytes first.
The context naturally describes the contract being reviewed: hiding that contract
would make a defect/protected judgment unfair. The exact evaluator schedule is
not required verbatim in a model answer; an equivalent valid witness is accepted.

`cases.json` maps opaque case IDs to kinds, family split, input allowlists, driver
and rubric. `drivers/` executes the real fixture modules with fresh state and a
controlled scheduler. `offline-evidence.json` is deterministic observed state,
not a model response. `oracles.mjs` evaluates declared contract predicates over
that state; it is not an automatic semantic grader of model answers.

Every family has a defect, protected and unresolved version. The unresolved
version uses the defect version's exact implementation but omits its decisive
contract. The same observed transition violates one compatible policy and meets
(or falls outside the promise of) another. Both judgments are checked without
pretending the omitted deployment policy is known. The weighted-reservation
alternative also actually invokes the proposed external cleanup owner.

Tests exercise both adverse and benign schedules, exact boundaries where relevant,
duplicate notifications, lifecycle cleanup and cross-key/owner distinctions.
Twelve source-level mutation tests transplant each violating mechanism into its
protected peer and verify the behavioral criterion rejects it. This demonstrates
sensitivity to those specific faults, not all possible defects. No wall-clock
sleeps, OS races, network, authentication or model calls are used.

## Frozen boundary and limits

`freeze.json` inventories all regular files in this directory except itself,
including source, drivers, rubrics, tests, docs, oracles and saved observations.
Any byte drift or extra file fails validation. Paths and import closure are checked;
symlinks, traversal, evaluator references in inputs and unsupported status claims
are rejected. The explicit `cli.mjs freeze` operation replaces the development
inventory; never silently use it to repair a completed study. A future study must
archive its inputs and pin the trusted freeze digest externally. Local matching
hashes do not prove independent custody or prevent someone rewriting both data
and its declared hash.

The existing live study runner does **not** accept HB IDs. This suite exports
inputs and reproduces offline only. A reviewed live integration, frozen treatment
bytes, model/budget selection and explicit authorization are still required before
any future model run. No model accuracy, benchmark saturation or skill uplift can
be inferred from these offline results.

The import authoring check accepts explicit-semicolon static side-effect, default,
named and namespace imports (including default plus named/namespace), with literal
unescaped same-directory specifiers in the input allowlist. It skips ordinary
strings and comments. Dynamic imports, import metadata, import attributes or
assertions, re-exports, escaped specifiers, template literals and other unsupported
import syntax are rejected rather than silently treated as closed dependencies.
This restricted source convention is **not a security sandbox or a complete
JavaScript parser**. Executed fixtures and drivers remain trusted reviewed code.
