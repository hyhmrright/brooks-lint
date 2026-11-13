# Offline candidate-artifact isolation evidence

These are **authored offline controls**, not model responses or an independent holdout. No model calls, real credential injection, downloads, or host execution of candidate source occurred. The Docker daemon used an existing immutable Node image; the isolation check verified UID 1000, no host mounts or Docker socket, no injected authentication variables, read-only root filesystem, disabled networking, dropped capabilities, no privilege escalation, 32-process/128 MiB/one-CPU limits, bounded output and deadlines. Each created container was removed and absence confirmed.

Six controls in the root directory exercise correct and incorrect candidates, environment/filesystem/network denial, an infinite loop, output flooding, and a lingering descendant. `candidate-controls/` contains the bridge checks for all six v4 sweep cases: four executed authored candidate postconditions in Docker; two unresolved-contract cases validated the no-patch boundary without executing code or claiming repair success. Their scorer receipt text is explicitly simulated. The source code is under `evals/research/skills-benchmark-v4/artifact-*.mjs`.

After a separately authorized live collection, optionally check a completed sweep response:

```sh
node evals/research/skills-benchmark-v4/artifact-check.mjs VERIFIED_RUN ORDINAL FRESH_REPORT.json
```

The command replays the sealed collection, validates the allowed artifact shape/edits, requires equality with the verified finalizer report, and only then admits candidate code to Docker. Missing Docker/image, policy mismatch, bad receipt, deadline, excess output, assertion failure or unconfirmed cleanup cannot produce a successful execution verdict. It never falls back to host execution. Unknown contracts remain scope-only results with no verified repair. Collection itself does not run returned patches.

To repeat the actual offline isolation controls, use fresh output directories:

```sh
node evals/research/skills-benchmark-v4/artifact-sandbox-drill.mjs FRESH_BOUNDARY_DIRECTORY
node evals/research/skills-benchmark-v4/artifact-candidate-drill.mjs FRESH_CANDIDATE_DIRECTORY
```

Default `node --test` tests use mocked Docker responses and do not contact the daemon. The explicit drills above require Docker access but do not require model authorization.

## Limits

Container exit/assertion outcomes verify bounded supplied behavior, not arbitrary semantic correctness. Candidate JavaScript can affect builtins or recognize known tests; this is not an adversarial-proof grading oracle. These checks do not independently establish all architectural or maintenance obligations, deployment safety, native skill discovery, or autonomous repository editing. They complement source review and receipt checks. Docker shares a host-managed kernel/VM boundary and image trust; the controls are observations of this local environment, not a proof against container escapes. All returned code from the historical campaign remains unexecuted and unchanged.

## QA boundary repair

QA found that Docker inspection repeats the base64 payload in container metadata: a near-limit input could exceed the original 64 KiB inspection cap, preventing admission and cleanup inspection. Inspection now has a separately bounded 1 MiB metadata budget; candidate execution still has a 64 KiB output cap. `final-boundary-controls/` records seven passing real authored controls on the final source, including a near-limit input. `boundary-recheck/` preserves the intermediate seven-control verification; the earlier six-control records remain unchanged.

An ambiguous or failed create is not declared cleaned merely because an immediate inspection says the name is absent: the daemon may allocate it later. Mocked regression checks preserve `cleanupConfirmed=false` in that case and retain the unique `containerName` for reconciliation. A discovered owned container is removed and absence checked. No finite client-side check proves that a timed-out daemon request can never complete later; this condition remains a failed, unconfirmed-cleanup result requiring follow-up, never a successful sandbox verdict.
