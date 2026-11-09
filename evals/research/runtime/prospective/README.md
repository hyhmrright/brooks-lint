# Prospective candidate study adapter, revision 1

This **offline-only** adapter prepares a separate study of HC-01–HC-09 using
[runtime scoring protocol v1](../../../../docs/research/runtime-scoring-protocol.md).
It never starts Codex, another model, a network request or imported code. It does
not extend the historical RT runner, change `liveRunnerIntegration: false`, grant
permission for a later live run, or modify existing plans/results. There is no
completed model study for these candidates. Selftests use explicitly authored
synthetic text and injected labels, never observed model performance.

All candidates remain public, exposed, non-independent development material.
Same-session authorship, prior examples/answers and guidance exposure, pending
human review and unverified book mapping remain recorded in every plan. This
adapter does not meet the independent holdout gate.

## Freeze a fresh plan

Create a local JSON config (do not copy this synthetic model identifier into a
real plan):

```json
{
  "study_id": "offline-preparation-example",
  "intended_model": "NOT-RUN-specify-before-any-future-study",
  "reasoning": "specify-before-any-future-study",
  "author": "name and method of plan preparation",
  "exposure": "Same exposed development workflow; public fixtures and rubrics",
  "case_ids": ["HC-01", "HC-02", "HC-03"],
  "repetitions": 3
}
```

```bash
npm run evals:runtime:prospective -- plan /tmp/config.json /tmp/hc-plan.json
```

Omitting `case_ids` selects all nine; omitting `repetitions` selects three.
The plan freezes exact whitelisted input bytes, separate rubrics, public candidate
manifest, protocol, schema object, scorer and adapter source, all core Markdown
skills/shared guidance and runtime prototype revision 2. The full selected
case/repetition schedule implies A/B/C for every row:

| Arm | Available material |
| --- | --- |
| A | Case inputs only; no skill guidance |
| B | Same case inputs and core skills/shared guidance |
| C | Same case inputs, core skills/shared guidance and runtime prototype rev 2 |

Availability is not evidence of actual skill reads. No environment isolation,
prompt execution or provider authentication is performed here. A future executor
needs a separately reviewed isolation and execution-evidence contract. `turnInputs`
exports only the exact case whitelist and that arm's guidance; it excludes rubrics,
metadata, expected observations, source tests, scoring materials and provenance.
Do not supply the whole plan as model context.

Retain `study_sha256` from the frozen plan in a trusted separate record. Commands
below use `TRUSTED_DIGEST` as a placeholder for that literal hash:

```bash
npm run evals:runtime:prospective -- validate /tmp/hc-plan.json TRUSTED_DIGEST /tmp/hc-validated.json
npm run evals:runtime:prospective -- template /tmp/hc-plan.json TRUSTED_DIGEST /tmp/hc-responses.json
```

Every output path must be new; existing files are never overwritten. CLI `turn`
also accepts a JSON `{ "case_id": "HC-01", "repetition": 1, "arm": "A" }` file
and writes the whitelisted material:

```bash
npm run evals:runtime:prospective -- turn /tmp/hc-plan.json TRUSTED_DIGEST /tmp/turn.json /tmp/turn-inputs.json
```

Hashes detect changes against a trusted frozen digest. They are not signatures,
proof of source authenticity, secret custody or resistance to an attacker replacing
both an artifact and its trusted anchor. Self-consistency validation alone cannot
prove independence or correct semantics. Existing plans use their own frozen bytes;
imports do not silently replace those bytes with newer candidate/guidance files.
The local scorer and adapter implementations must still match their frozen hashes;
version the adapter rather than executing arbitrary code from a plan snapshot.

## Record responses and review

The template creates all scheduled arm rows as `not-run`, with empty answer and
its SHA-256, null model report, execution evidence and review. It contains no
synthetic answer pretending to be a model run. It is an editable *working copy*;
archive each imported revision separately. Every import names the exact frozen
`plan_sha256`; unknown or duplicate turns and undeclared fields are rejected.
Missing rows, including wholly missing triplets, remain explicit exclusions.

For a later authorized recorded execution preserve exact answer bytes (do not
trim or normalize), their SHA-256, and status `executed`, `failed` or `interrupted`.
Failed/interrupted partial text is retained ungraded. An independently evidenced
successful execution may have an exactly empty or whitespace-only answer; retain
those bytes and their hash. A reviewer may mark it incomplete, and it remains in
eligible paired completion/assessment denominators rather than becoming an
execution failure. Execution success and answer completion are separate claims.
Model evidence is an object
`{model, reasoning, source}` of nonempty strings. It is **reported identity**, not
verified identity; retain observed differences from the intended model rather
than overwriting them. `execution_evidence` has nonempty `source`, an
`artifact_sha256` of the retained external raw artifact, and nonempty
`status_basis` describing why the reported status applies. References/digests do
not prove that the external execution occurred or that its declared status is
true; this adapter does not fetch, parse or authenticate those external artifacts.
Keep the raw source artifact alongside the study archive for review.

Only successful executions may carry a `review`. Null review means pending, not
incorrect or complete. A review requires `reviewer`, `method`, `exposure`,
`rationale`, exact `answer_sha256` and a semantic `annotation` matching
[`validateExample`](../calibration/scoring.mjs). The annotation fields and examples
are documented in the [calibration materials](../calibration/README.md).
Expected issue IDs, evidence requirement IDs and allowed severity come from that
case's frozen rubric. No keyword parser supplies semantic labels. Keep reviewer
disagreement, exposure and alternative interpretations in separately archived
review revisions, never silently replace completed study judgments.

```bash
npm run evals:runtime:prospective -- packets /tmp/hc-plan.json TRUSTED_DIGEST /tmp/hc-responses.json /tmp/hc-packets.json
npm run evals:runtime:prospective -- summary /tmp/hc-plan.json TRUSTED_DIGEST /tmp/hc-responses.json /tmp/hc-summary.json
```

Reviewer packets contain successful exact answers/hashes and supplied case inputs;
they omit arm, guidance, plan schedule mapping, model report, review annotation,
expected case labels and rubric. A reviewer can write first-pass notes before
consulting frozen rubrics for the annotation inventory. Packet hash ordering
removes original schedule order. This is partial masking only: public input paths,
answer content and publicly accessible source mappings can reveal cases or arms.
A deterministic packet ID is recomputable, not a secret. No human calibration or
independent review is claimed by generating packets.

Summaries bind the complete response document digest, use the full frozen schedule
and retain all axes from `compareTriplets`: all planned/absent turns, explicit
triplet exclusions, paired and individual-arm execution/review denominators,
assessment, recall, false negatives, false assertions, evidence and severity.
An executed but incomplete annotated answer remains paired. Failed, missing or
pending-review arms exclude the triplet. No composite score or historical rescore
is introduced. Empty denominators are null. Repetitions remain responses rather
than independent cases; these arithmetic outputs cannot establish model benefit.

## Offline validation

```bash
npm run evals:runtime:prepared
node --test evals/research/runtime/prospective/study.test.mjs
```

Tests cover whitelist/arm isolation, byte drift in inputs/rubric/protocol/guidance/
scorer, external trust anchors, prohibited independence promotion, duplicate and
unplanned turns, partial failed text, pending review, wholly absent triplets,
executed incomplete pairing, annotation provenance, packet omissions and exclusive
CLI output creation. They invoke only this offline CLI, never a model/provider.

## Saved nine-candidate synthetic drill

The [offline end-to-end archive](../../../../docs/research/runtime-results/2026-11-06-hc-offline-drill/README.md)
saves a frozen all-nine, 27-turn simulated exercise, separately injected boundary
scenarios, reviewer packets and actual offline CLI validation. `npm run
evals:runtime:drill` verifies its generated artifacts. All answers and labels are
authored simulations, not responding-model outputs or independent validation.

## Reviewer exchange and unresolved disagreements

The separate [synthetic reviewer workflow](../../../../docs/research/runtime-results/2026-11-06-hc-review-workflow/README.md)
provides packet-bound editable forms, two-submission comparison and explicit
adjudication without changing this frozen adapter. Both original submissions and
previous source reviews remain in a new revision's audit. Missing reviews and
unresolved conflicts stay ungraded; no reviewer is selected automatically.
`npm run evals:runtime:reviews:validate` verifies the scripted offline archive.
These supplied annotations are not human calibration or independent validation.

## Prepared human fixture pair and next-study design

The [human participation preparation](../../../../docs/research/runtime-preparations/2026-11-06-hc-human-review/README.md)
contains a matched pair, exact participant inputs, a blank first-pass fixture
review form and separate facilitator criteria. The invitation was an unsent draft at that snapshot; the
[later sent invitation](../../../../docs/research/runtime-preparations/2026-11-07-hc-invitation/README.md)
is archived separately. Sending it does not establish human participation; no human
review is claimed. It also freezes an 81-turn, all-nine-candidate design
with balanced execution positions, a common prompt, exact material snapshots and
public digest anchors. Model/reasoning registration and the reviewed live executor
remain unbound; no execution is authorized or implemented by this preparation.
`human-preparation.test.mjs` checks this frozen archive offline and is included in
`npm test` and `npm run evals:runtime:prepared`.

### Offline HC executor preparation

The [2026-11-07 preparation](../../../../docs/research/runtime-preparations/2026-11-07-hc-executor/README.md)
adds exact allowlisted 81-turn scratch export, fail-closed registration declarations,
and explicitly synthetic raw-event replay into the existing importer. Run
`npm run evals:runtime:executor:validate` offline. This is not an operational live
executor: actual Codex isolation, hidden-retry controls, process interruption and
raw-event mapping remain review gates. The frozen design, real human review and
model binding remain unchanged/pending; no live model was called.

### Local process executor boundary, revision 1

The [2026-11-09 process preparation](../../../../docs/research/runtime-preparations/2026-11-09-hc-process-executor/README.md)
adds an operational local subprocess supervisor: fresh per-turn HOME/CODEX_HOME/XDG
state and frozen allowlisted workspace, scrubbed environment, macOS Seatbelt content
read/write/network denial, exact raw byte retention, and monotonic TERM/KILL/drain
cleanup for the same process group. Real OS probes use local authored Node programs,
including a TERM-resistant child after its group leader exits. These are process
observations, not model responses. The 900-second production deadline is declared;
short local deadlines exercise the identical timer path without a 15-minute wait.

`npm run evals:runtime:process:validate` verifies the saved six-observation archive
without starting a child. `npm test` and `npm run evals:runtime:prepared` also run
the process tests; actual Seatbelt probes explicitly skip on unsupported systems,
while parser, command-declaration, archive and fail-closed gate checks stay portable.
Unsupported systems are refused, not silently run without isolation.

There is no live launch command. A future Codex argv declaration is available,
but deny-all networking cannot perform inference. Transport/auth separation, real
Codex prompt/catalog/config observation, effective hidden retry prevention, final
answer/identity mapping and detached/setsid descendant containment remain live
readiness blockers. Official documented exec JSONL does not establish responding
model/provider/reasoning; these stay null/UNOBSERVED, separate from intent and local
CLI binary/version metadata. Every projected ledger is blocked from continuing or
semantic grading. Frozen study plans and earlier artifacts remain unchanged.

### Bounded termination correction, process revision 2

The [termination confirmation archive](../../../../docs/research/runtime-preparations/2026-11-09-hc-termination-confirmation/README.md)
preserves both earlier failed QA rounds and all original observations unchanged.
A fixed trusted guardian now holds group ownership while signalling; parent-only
IPC records fixture lifecycle separately from output. Bounded asynchronous group
probes distinguish running, absent, zombie-only (non-running but unreaped) and
unknown states. Unknown/running cleanup and unclosed drainage fail closed; signal
delivery is not confirmation. No group signal is sent after guardian ownership
ends. Detached/setsid containment and real model execution remain unverified.

`npm run evals:runtime:process:validate` checks both archives: historical code is
only hashed against pinned snapshots/inventory, never executed; current sources
remain bound to the new separate revision. The tests include deterministic state
transitions, probe failure/budget expiry, exact byte drainage, control-channel
isolation and predeclared parallel orphan cases. No live model was run.

### Offline parent-owned model channel, revision 1

The [channel preparation](../../../../docs/research/runtime-preparations/2026-11-09-hc-model-channel/README.md)
adds a concrete, local-fixture-only relay with private parent-held dummy upstream
authentication, a turn-scoped capability, exact request binding and an atomic one
upstream dispatch budget. It refuses external upstream origins, follows no redirect,
refreshes no credential and reconnects no interrupted stream. Buffered bounded
responses retain sanitized partial evidence; deadlines cover upstream drips and
inbound slow headers/bodies. Real Seatbelt probes permit only the relay port and
refuse direct access to the fake upstream; the fixture receives no provider key.

`npm run evals:runtime:channel:validate` checks the separate source-bound archive
without opening a socket. Unit/integration tests are included in `npm test` and
`evals:runtime:prepared`; actual Seatbelt integration skips on unsupported systems.
No previous process source or archive changes. Identity provenance distinguishes
intent, configured route, broker-observed request and upstream-reported fields.
A reported reasoning effort is a request-level setting, not internal or dynamically
selected effort; a reported model is not authenticated execution evidence.

The relay accepts disposable fixture credentials only. Real Codex capability
routing, effective retry/config behavior, HTTPS/OAuth/refresh, provider-internal
retries, tool-versus-client endpoint separation and complete executor integration
remain unverified. There is no live launch path or authorization. No live model,
real credential, human review, semantic grade or skill-efficacy claim is introduced.

### Real Codex CLI with owned local stubs

The [2026-11-09 CLI archive](../../../../docs/research/runtime-preparations/2026-11-09-hc-codex-channel/README.md)
records the real installed CLI against owned local HTTP/SSE fixtures: one success,
HTTP401/429/503, interrupted SSE and two request-retry positive/budget controls.
Raw streams and body bytes are retained. Fresh home/file-only no-auth state and
an outer one-port Seatbelt policy protect the host boundary. Successful wiring
requires an explicit owned local-proxy override; direct routing failed and is
retained as diagnostic evidence. Public authentication markers are fake, and no
model/provider inference occurs. Observed CLI retries are separate from broker
forwarding limits and unobserved real-provider retries. Actual model identity,
production auth, full tool/client separation and study execution remain unverified.
`npm run evals:runtime:cli:validate` and default tests only read saved records;
real CLI-to-stub recording is a separate explicitly selected command.

## Native CLI streaming protocol continuation (owned local fixtures only)

The opt-in `codex-stream-drill.mjs record <native-binary> [new-output-root]`
observes six predeclared streaming/retry/timeout cases using the same isolated
native CLI launch and exact Seatbelt grants as the earlier channel archive. It
uses owned loopback fake services and public inactive authentication markers,
never a real provider. The relay delivers SSE bytes immediately, preserving the
distinction between stream idle timeout and a parent's absolute process deadline.

`npm run evals:runtime:stream:validate` and the default test/prepared gates read
saved observations and run pure/owned-HTTP regression checks only. They never
launch Codex. The source-bound archive is
`docs/research/runtime-preparations/2026-11-09-hc-codex-stream/`; synthetic payloads,
usage and CLI completion are not model evaluation or authenticated model identity.

## Native CLI completion and tool boundary continuation

The [owned boundary archive](../../../../docs/research/runtime-preparations/2026-11-09-hc-codex-boundaries/README.md)
retains 32 actual native CLI attempts including an interrupted author collection,
15 frozen protocol cases and four separately frozen outer-tool controls. No model
inference occurs. A stricter parent fixture-contract guard rejects successful CLI
exits with empty/commentary-only/duplicate-terminal/mismatched-reported identity
payloads, and required tool steps that failed to execute. Full raw records and
collection-versus-validation source provenance remain separate.

The built-in read-only tool sandbox could not nest inside the outer Seatbelt
profile. Separate controls disable only the inner sandbox while retaining the
outer one-port deny-default boundary. Actual marker/auth-name checks and a fixed
nc broker/observer probe then run, but this is not proof of built-in read-only
network isolation or full hostile tool/client separation. Curl initialization
failures remain unverified network observations. The remaining-boundary ledger
lists local follow-ups as well as production-only unknowns. Run
`npm run evals:runtime:boundaries:validate` offline; default tests use saved bytes
and owned-HTTP regressions only, never native CLI or real providers.

### Remaining owned-local executor boundaries and full81-turn protocol rehearsal

The [completion archive](../../../../docs/research/runtime-preparations/2026-11-09-hc-executor-completion/README.md)
adds per-turn broker binding, concurrent/late-callback controls, bounded native
request/response/process/final-file import caps,307/308 observations, real native
CLI custom-CA/fallback/precedence and hostname controls over an owned CONNECT proxy,
and the exact public OpenSSL-config correction for actual curl tool networking.
It preserves128 native CLI execs and four fixed Node controls, including failed
CA-as-leaf and nested-detached experiments. All81 frozen scheduled turns complete
native CLI/fake-SSE protocol exchanges with exact allowlisted workspace inventories;
canonical model responses remain81 `not-run`, no actual reads or semantic judgments
are claimed, and all study eligibility remains false. A separate trusted-parent
owned detached child control passes; hostile descendant containment and shared-port
tool/client identity segregation remain explicit design blockers.

`npm run evals:runtime:completion:validate` and the added default tests validate
saved evidence/pure guards/owned HTTP only, never launch Codex or a model. Explicit
`completion:record`/`completion:record-detached` commands collect new owned-local
protocol/process evidence into new paths. The archive's coverage ledger and blocked
design acceptance criteria distinguish scoped observations from host/production
unknowns. The Discussion currently has no contributor reply; self-led development
does not count as independent human review or lift the live-test hold.

## Self-led controlled-read adapter

The [controlled-read development archive](../../../../docs/research/runtime-preparations/2026-11-09-controlled-read-adapter/README.md)
records an exploratory parent-owned fixture transport with immutable, exact-path
in-memory reads only, shared run deadline, request/reservation limits and model
identity checks. It supports no arbitrary shell/process/network tools and makes
no Codex CLI/API compatibility or frozen-study equivalence claim. All observations
are synthetic and live readiness remains false. `npm run evals:runtime:controlled:validate`
validates saved controls offline; default and prepared tests include its regressions.
A model-switch journal records no switch and an unbound future test model.
External review is optional under the maintainer's self-led disposition; actual
production and OS containment evidence remain necessary.

### Docker native CLI isolation controls

The [Docker archive](../../../../docs/research/runtime-preparations/2026-11-09-docker-isolation/README.md)
records authorized Docker Desktop startup, pinned Node/Codex provisioning and six
owned network-none container controls. Native answer wiring and scoped detached
container cleanup are observed; builtin read-only namespace creation fails, outer
CLI tools can reach the model broker, and a killed host launcher leaves its
container running until explicit cleanup. Those negative boundaries keep live
readiness false. `npm run evals:runtime:docker:validate` and default tests are
strictly daemon-free; recording is opt-in, with zero real model calls or credentials.

### Durable Docker cleanup lease (offline research only)

`docker-lease-service.mjs` runs a trusted host manager and an independent restart
supervisor. Jobs persist their intent before create; fixed deadlines and expiring
non-extending heartbeats revoke work; manager restart revokes all unfinished jobs.
Unknown create outcomes and unavailable Docker stay pending until identity-bound
cleanup and absence are confirmed. Workers receive no host state or Docker socket.

`npm run evals:runtime:lease:validate` validates saved eight-case evidence without
Docker. `npm run evals:runtime:lease:record -- NEW_DIR sha256:IMAGE_ID` is an explicit
real-Docker, fake-workload opt-in. See the [lease report and runbook](../../../../docs/research/runtime-preparations/2026-11-09-docker-lease/README.md).
It is not wired into the frozen live study and does not solve native tool/model
channel separation; the [native interface investigation](../../../../docs/research/runtime-preparations/2026-11-09-native-seam/README.md)
records that remaining boundary separately.
