# Health deterministic workflow — offline validation

Final verdict: **PASS** after one QA loopback. No real model calls were made.
The [retest plan](health-tool-retest.md) and its
[frozen protocol](../../evals/research/health-tool-retest/frozen-full.json) are ready
for a separately authorized live run. Final freeze SHA-256:
`e3ba494a7fdff3b1636f43b99b8e6b9f5203c1c558fe1bff292bbdce72135cf7`.

## Change and verification boundary

The health workflow now derives the score block from one capped ledger, inserts
it into a score-free draft, and checks the final report against that same ledger.
The finalization receipt binds the parsed ledger and exact report bytes by
SHA-256. The host tool invokes the same shipped finalizer and verifier as the CLI.
A successful tool call does not establish that the model extracted a correct
ledger or made sound diagnoses. Those remain separate semantic review criteria.

The frozen comparison contains eight known development cases, two workflow arms
and three repeats: 48 planned CLI turns. A retains the previous revised text-only
workflow; B adds the new guidance, ledger documentation and host scoring tool.
The comparison measures that combined workflow, not an isolated prompt effect.
There are no independent holdouts or contemporary no-skill controls.

## Final automated gate

| Check | Outcome |
| --- | --- |
| `npm run validate` | PASS; repository version 1.9.1 |
| `npm test` | PASS; complete command, including the new 17/17 health-tool regressions |
| Health helper regressions within `npm test` | 10/10; finalization, arithmetic, stale ledger, tampering, duplicate scores, incomplete assessment, CLI and overwrite refusal |
| `npm run evals` | PASS; 64 structural scenarios |
| `npm run benchmark` | PASS; parser fidelity 100%, SARIF validity 30/30 on the frozen corpus |
| Frozen protocol validation | PASS against the final SHA-256 above |
| Retained synthetic run verification | PASS; 48/48 authored responses, 48 synthetic annotations, 24 paired outcomes |
| Recomputed synthetic report | Byte-identical to the retained final report |
| Historical three-skill result checksums | All five entries PASS; original/recovery archives, annotations, summary and health observations unchanged |
| `git diff --check` | PASS |

The full offline test gate used permission for local process-group observation
and localhost fixtures. It did not bypass cleanup checks or invoke a live model.
Repository validation notes that changelog release coverage is not audited because
version 1.9.1 is already tagged; this task is not a release.

## Actual CLI wire proof and simulation evidence

Codex CLI **0.167.1** completed a roundtrip against a localhost authored upstream
with an empty private home and `synthetic-no-auth`. The fixture returned two HTTP
responses: a scoring-tool request and a final answer. The adapter admitted one
host scoring call, and the final answer exactly matched the generated report.
The saved adapter source hash matches the frozen current source. Process closure,
process-group absence and private-home removal were confirmed.

The final retained 48-turn exercise uses a fake CLI and authored answers. Its
annotations explicitly use `SIMULATION` and `no-answer`; they test report plumbing,
not skill efficacy. In that simulation, B's mechanical required-tool checks are
18/18 and prohibited-call controls are 3/3. A's tool-workflow denominators and pass
counts are explicitly null with `applicable: false`; its observed tool calls are
zero. These are synthetic execution checks and must not be reported as model
accuracy or evidence that the skill improved.

The adapter regressions cover coalesced turn-start/tool requests, foreign scope,
foreign tools and item types, wrong model selection, timeout, omitted calls,
edited final answers, invalid and incomplete ledgers, raw/receipt tampering,
cleanup integrity and stopping admission when usage is unknown. Shell, browsing,
plugins, apps and unrelated host tools remain disabled in this study. Live
provider behavior, login availability and actual model adherence remain untested.

## QA loopback and preserved failures

Round 1 found a report-boundary defect: A's out-of-scope controls had a denominator
of three, but the pass numerator was zero because A's workflow status was null.
That presentation incorrectly resembled three failures despite no tool calls.
The eval stage changed A's workflow metrics to explicit not-applicable values,
retained observed-call counts, and added a regression. It then created a new
freeze and fresh retained synthetic and local-wire records. The full automated
QA gate was repeated on the final source and passed.

The first-round logs and simulated records remain preserved. Earlier development
attempts also retain the localhost sandbox denial and the import-path failure,
which occurred before a successful wire run. The authoritative final records are
`health-tool-eval/round2-drill/`, `health-tool-eval/round2-wire/` and
`health-tool-qa/round2/` inside the [validation archive](health-tool-workflow-validation.tar.gz).
The archive also includes author/eval notes and first-round evidence. Recognizable
credential-pattern scanning of the retained evaluation evidence found no matches;
this heuristic is not proof that every possible secret format is absent.

## Cross-document consistency

Direct comparisons confirmed version **1.9.1** in package.json, all four plugin
manifests, all six README badges, the docs landing-page JSON-LD and the latest
CHANGELOG section. The source-coverage frontmatter contains **12** books, matching
the words in README.md, AGENTS.md and GEMINI.md. AGENTS.md's **64**-scenario claim
matches evals/evals.json. All six shipped skill descriptions retain their negative
trigger boundary. No trigger descriptions or risk codes changed.

The prior published three-skill responses and grades were not repaired or
reinterpreted by this task. The new study keeps semantic correctness separate
from deterministic scoring consistency and records all completed message phases
as supplemental evidence. Repeats are correlated, reviewers in this workflow are
not independent human reviewers, and CLI-selected identity is not independent
backend model attestation.
