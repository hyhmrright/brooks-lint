# Three-skill guide retest

## Frozen design

The [retest protocol](../../evals/research/three-skill-retest/frozen-full.json)
uses the existing Codex CLI runner, cases and semantic review policy. Arm A
uses the original guides pinned at `37fd5a282df17736541c7c36d109f4ab070bbc8a`.
Arm B uses the revised guides at `5eb4e9b7c9d12f11d21e0ceaa4545f49f237e21c`,
including the health score consistency repair. The runner checks the guide
contents, cases, schedule, review policy and execution source hashes before
registration and execution. The frozen protocol SHA-256 is
`316d8d05e7f236295f56c4cbd80683bea82fbd4e27fc7af96b38cb2f6292050d`.
The snapshot differs from the earlier three-skill freeze only in the arm B
health guidance. The other two revised guides remain in the study so all three
comparisons use one contemporaneous run.

Each case runs with both arms in alternating order over three repeats, starting
at ordinal 1. Both arms get identical case input and use one registered model,
reasoning effort and CLI version. There are 16 historical development cases and
six boundary cases authored in the same workflow. Report the cohorts separately.
Repeats show variation on the same cases and do not increase the number of
independent cases. This design measures a guide revision effect. Historical
no-skill runs provide context only.

| Skill | Cases | A calls | B calls | Outcomes to inspect |
| --- | ---: | ---: | ---: | --- |
| `brooks-review` | 7 | 21 | 21 | Supported findings and recall, uncertainty when evidence is missing, overclaims about test coverage and validation duties |
| `brooks-health` | 8 | 24 | 24 | Exact scores and arithmetic, one correct composite per complete dashboard, no actual composite when a required assessment is unavailable |
| `brooks-sweep` | 7 | 21 | 21 | Valid repair artifact, permitted changes, behavior preserved and requested repair completed |
| Total | 22 | 66 | 66 | 132 planned calls |

The sweep treatment also contains revised review guidance. The live tasks use
supplied text and bounded repair artifacts. They measure the health guide's
tool-free calculation and final report. They do not measure native skill
discovery, model invocation of the scoring helper or autonomous editing. The
helper is pinned by the candidate Git commit. Its AS-21 arithmetic, rejection of
the archived conflicting answer, incomplete ledgers and installation are verified
offline by the focused program tests.

For AS-21, the adjudicated ledger yields dimension scores 92, 40, 98 and 100.
The weighted result is 79.5 and rounds to 80. Credit the whole-dashboard criterion
only when the published score and all supporting arithmetic agree. Preserve
component evidence credit independently of the whole-answer outcome. Record
repeated composite lines as output-contract observations alongside the frozen
semantic grades. For SR-03, check each requested dashboard independently. For
SR-04, verify that the missing assessment suppresses the actual composite.

## Historical evidence

The [stopped comparison](skill-revision-results/2026-11-11-terra-low/README.md)
contains 11 completed answers and their individual adjudications, one failed
attempt and 120 unrun turns. Its raw archive, annotations, summary and original
freeze remain byte-identical. Retain them as evidence for the earlier candidate.
The new comparison starts with zero completed responses and a new registration
and output directory. The earlier attempt remains reproducible from the pinned
`2e38033adcfff14bab568d4f5f77e95878bcd97d` checkout.

## Admission and preflight

The model and reasoning effort are selected at launch. For continuity use
`gpt-6.1-terra / low` if the maintainer selects it and it is available. Record
the confirmed selection, actual Codex CLI version and committed candidate in
the run metadata. At preparation, the local CLI reports `0.167.1`. The old run
used `0.167.0`, so historical observations span different CLI versions.
Execution uses Codex CLI with ChatGPT login. The CLI records the selected model
and effort, and the account and transport are subject to live availability.

The ceiling is 132 primary calls, 180 seconds per turn and eight elapsed hours.
The runner stops admitting turns at five million observed tokens or on the
first execution, identity, cleanup or usage failure. Token checks occur between
turns and may overshoot by one turn. Failed-turn usage can be unknown. These
limits govern harness admission rather than provider retries or billing.
Automatic harness retries and fallback are disabled. Preparation uses zero real
model calls. Proceed with the live command after the maintainer switches models
and requests the run.

From the research branch root, verify the frozen protocol and offline helper:

```bash
runner=evals/research/skill-revision/runner.mjs
freeze=evals/research/three-skill-retest/frozen-full.json
anchor=316d8d05e7f236295f56c4cbd80683bea82fbd4e27fc7af96b38cb2f6292050d
node "$runner" validate "$freeze" "$anchor"
node --test scripts/health-dashboard.test.mjs scripts/npm-install.test.mjs
```

## Registration, execution and scoring

Create a private run directory. Export `RETEST_MODEL`, `RETEST_EFFORT`,
`RETEST_CLI_VERSION` (numeric version, for example `0.167.1`) and
`RETEST_AUTHORIZATION` to the confirmed values for this run. Put no credentials
in these variables. Registration is offline.

```bash
umask 077
mkdir -p "$PWD/_workspace"
run_dir=$(mktemp -d "$PWD/_workspace/three-skill-retest.XXXXXX")
node --input-type=module - "$freeze" "$anchor" "$run_dir" <<'JS'
import fs from 'node:fs';
import path from 'node:path';
const [freezePath, anchor, runDir] = process.argv.slice(2);
const { RETEST_MODEL: model, RETEST_EFFORT: effort, RETEST_CLI_VERSION: cliVersion,
  RETEST_AUTHORIZATION: authorization } = process.env;
const config = { frozen: JSON.parse(fs.readFileSync(freezePath, 'utf8')),
  anchor, model, effort, cliVersion, authorization };
fs.writeFileSync(path.join(runDir, 'config.json'), JSON.stringify(config),
  { flag: 'wx', mode: 0o600 });
JS
node "$runner" register "$run_dir/config.json" "$run_dir/registration.json"
registration_sha=$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).sha256' "$run_dir/registration.json")
git rev-parse HEAD > "$run_dir/checkout-commit.txt"
git rev-parse 5eb4e9b7c9d12f11d21e0ceaa4545f49f237e21c > "$run_dir/candidate-commit.txt"

# Live execution, only after the maintainer requests it.
node "$runner" run "$run_dir/registration.json" "$registration_sha" "$run_dir/run" --live

# Offline, including after a stopped run with terminal artifacts.
node "$runner" verify "$run_dir/run"
# Save individual adjudications to "$run_dir/annotations.json" first.
node evals/research/skill-revision/report.mjs "$run_dir/run" \
  "$run_dir/annotations.json" "$run_dir/summary.json"
```

Use the [frozen review policy](../../evals/research/skill-revision/review-policy.md)
to assess every completed answer from shuffled packets. Save exact excerpts,
reasoning, unsupported and pending claims, and missing evidence before unmasking.
Preserve model metadata, raw answers and events, execution failures, receipts,
annotations and summaries. Report both planned and completed denominators,
per-skill and per-cohort results, paired outcomes and usage. Execution failures
remain operational outcomes and unrun turns remain visible. Compare misses and
false positives for diagnostic cases, and report arithmetic and artifact failures
under their task criteria. Report any exposed-case and same-workflow reviewer
limitations with the results.
