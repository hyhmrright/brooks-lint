# Targeted runtime pack benchmark, revision 1

Status: offline-prepared development calibration; live execution requires the
maintainer's model/effort selection and separate explicit authorization. No new
model responses or measured skill improvement are claimed.

See the [two-round offline validation record](runtime-pack-benchmark-validation.md)
for the fixed provenance finding, full checks and archived QA logs.

## Purpose and change

[Discussion #45](https://github.com/hyhmrright/brooks-lint/discussions/45) proposes
versioned engineering criteria, project semantic contracts, evidence protocols,
false-positive guards and evaluated domain packs. This benchmark tests that
proposal's first runtime pilot. It does not replace the original question with a
general model-hardness competition or a six-skill capability claim.

The prior HB/BV study supplied all core Markdown and exposed assessment/evidence
limits. This new, separately versioned set isolates targeted brooks-review guidance
and asks whether the runtime prototype adds contract-sensitive value. Historical
fixtures, freezes and results are unchanged. See the
[external methods research](skill-benchmark-methods.md) for source-backed adoption
choices. No upstream example text/code is copied into these authored fixtures.

## Corpus and executable oracles

| IDs | Scope | Visible contract variation | Offline witness |
| --- | --- | --- | --- |
| PB-01–PB-03 | Runtime cancellation ownership | Independent requests / atomic cohort / omitted ownership policy | A cancellation stops B's result; correct only for cohort ownership |
| PB-04–PB-06 | Runtime event projection | Cumulative value / incremental value / omitted business definition | Duplicate e2 is suppressed; resulting 25 violates cumulative 15 but satisfies incremental 25 |
| PB-07–PB-09 | Runtime cache freshness | Acknowledgement visibility barrier / flushed snapshot / omitted guarantee | First read is old; post-flush read is new |
| PB-10 | Core regression control | Public discount behavior and a substitute test | Production returns 80; test passes against local 90 substitute |
| PB-11 | Core clean control | Independently owned pricing policies | Equal arithmetic does not establish shared policy knowledge |
| PB-12 | Routing control | Syntax explanation only | Optional chaining returns undefined or the property value |

Runtime triads deliberately keep source code and task identical. Only contract.md
changes. Missing-contract prompts omit the decisive policy without enumerating the
correct two branches; evaluator-only rubrics and witnesses retain both. They are
bounded multi-file reasoning cases, not demonstrated difficult tasks or production
stress tests. Passing their deterministic witnesses confirms fixture behavior,
not model understanding. PB-10 has one compound expected finding covering the
wrong production result and its masking test; do not double-count it.

All 12 are public, same-workflow authored development cases. They are not blind or
independent holdouts. Three repetitions do not create 36 independent mechanisms.
The runtime primary denominator is nine cases / three families / three expected
issues per repetition; two core and one routing controls stay separate.

## Comparison and execution

- A: supplied inputs only.
- B: same inputs plus `brooks-review/SKILL.md`, `pr-review-guide.md`, and shared
  `common.md`, `source-coverage.md`, `decay-risks.md`, `test-decay-risks.md`.
- C: B plus runtime prototype `SKILL.md` and `runtime-guide.md`, revision 2.

This is an explicit text-guidance ablation using the existing isolated Codex login
turn adapter. It does not test native discovery, selective file loading or agent
navigation. Auxiliary conditional references outside this fixed list are not
loaded; this is a scoped text reference bundle rather than execution of the full
review workflow. Context length remains a confound; generic-checklist and matched
context-cost ablations are not implemented in this revision. Existing native
Codex behavioral evaluation remains a separate track.

Primary comparison is C−B; B−A estimates targeted core guidance differences. Core
and syntax controls test whether the added runtime text expands scope incorrectly.
No runtime or combined Health Score is requested.

The committed `frozen-full.json` binds 12 × 3 × 3 = **108** primary calls, with
rotated arm order and no harness retries. `frozen-smoke.json` separately binds
PB-04–PB-06 × 3 × 1 = **9** calls. Neither plan authorizes execution. Select one;
running both means 117 calls and requires that explicit scope. Smoke cases overlap
the full plan, so smoke is not a holdout and tuning after smoke invalidates the
frozen comparison.

| Budget | Full | Smoke |
| --- | --- | --- |
| Maximum primary turns | 108 | 9 |
| Per-turn local deadline | 180 seconds | 180 seconds |
| Admission/deadline study budget | 6 hours | 30 minutes |
| Observed-token stop | 3,000,000 | 250,000 |
| Automatic retries | 0 | 0 |

Observed usage is checked between turns and can exceed the token stop by one turn.
Provider-internal retries and ChatGPT billing are not hard-capped. Missing usage,
model/effort mismatch, timeout, cleanup failure or any failed turn stops admission.
Failure records and intent-before-submit files remain. No implicit resume/replay.
The inherited adapter uses a fresh auth-only home, rejects tools and verifies
Darwin process-group termination; it is not an OS sandbox or provider attestation.

## Offline commands and future run

```bash
npm run evals:runtime:pack
node evals/research/runtime/pack-benchmark/suite.mjs witnesses
node evals/research/runtime/pack-benchmark/suite.mjs dry
node evals/research/runtime/pack-benchmark/runner.mjs validate evals/research/runtime/pack-benchmark/frozen-full.json <sha256-from-that-file>
```

After selection, prepare a registration input with `frozen` (the complete frozen
object), `anchor` (its sha256), explicit `model`, `effort`, `cliVersion`,
`authorization` provenance and optional `inheritProxy` (false by default). Then:

```bash
node evals/research/runtime/pack-benchmark/runner.mjs register PRIVATE_CONFIG NEW_REGISTRATION
node evals/research/runtime/pack-benchmark/runner.mjs run NEW_REGISTRATION REGISTRATION_SHA NEW_DIRECTORY --live
```

Do not infer the selected model from this document, reuse historical registration,
or run these live commands during offline validation. Model identity means exact
CLI selection plus requested/observed effort, not independent backend identity.

## Review and interpretation

The frozen [review policy](../../evals/research/runtime/pack-benchmark/review-policy.md)
defines the decision and evidence requirements. Exported `review-packets.json`
shuffles pseudonymous responses and omits arm, repeat, case ID and ordinal.
`review-mapping-private.json` is kept from reviewers until annotations are saved.
Prose can disclose guidance, and the author knows cases: masking is not independent
blindness. Do not call model judging human review.

Annotations use reviewer identity/exposure/method, answer hash, assessment with
support, arrays `issues`, `evidence`, `unsupportedClaims`, `pendingClaims`,
`novelConfirmedClaims`. Each array item has `id`, exact `quote`, and `rationale`;
confirmed novel/unsupported claims also carry `adjudication` evidence/reference.
The `evidence` ID is the zero-based rubric requirement index. Save
`{ "annotations": [{ "responseId": "...", "review": { ... } }] }`, then:

```bash
node evals/research/runtime/pack-benchmark/report.mjs RUN_DIRECTORY ANNOTATIONS NEW_REPORT
```

Before scoring, the report verifies registration/freeze, intent, per-ordinal raw
record bytes and hashes, safe non-symlink paths, answer/model/effort/status,
simulation flags, usage and duration consistency, then validates annotation
excerpts, schedule/issue identities and separate denominators. Duration comes from
the raw executor monotonic timing (including setup/cleanup), not the reporting
process. Attempted failures are verified too; untouched rows remain not-run.
These integrity checks detect inconsistent archives, not an adversary rewriting
every artifact and all hashes. It does not semantically validate a reviewer merely because
an excerpt exists. Report expected recall, evidence, false claims, unresolved
certainty, novel/pending discoveries, cost and family/repeat breakdowns separately.
Pending claims yield null complete-answer status and precision sensitivity bounds.
Do not convert frozen-label agreement into universal correctness.

Do-nothing, always-flag and always-abstain checks are **handwritten simulated
annotations**, used to verify non-vacuous scoring arithmetic. They are neither
model answers nor calibrated judge tests. All earn zero complete-case credit;
a real semantic judge still needs adversarial calibration before use. A positive
result on these development cases would support further research, not release a
runtime pack or prove the project broadly effective.
