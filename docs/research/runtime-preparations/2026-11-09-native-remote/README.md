# Native remote execution and parent broker — 2026-11-09

## Decision and evidence boundary

The pinned **Codex CLI 0.167.0** now executes an actual native `exec_command` in a
separate network-none Docker worker. An allowed command returns the worker's
sentinel. The hostile command knows the client gateway endpoint, public token and
request body, but its concurrent and delayed HTTP attempts are refused. Its forged
`BROKER`/`FINAL` stdout remains native tool output and does not create broker calls.
Both domains are removed and absence is confirmed before an observation is accepted.

This is an **authored, fake-upstream protocol experiment**. There is no real
responding model, paid request, independent human review, or new behavioral score.
The nine candidate holdouts and 81 frozen study outcomes remain unchanged and
not-run. `live_ready=false`. The developer session's model is inherited and not
independently attested by these records.

## Registered experimental treatment

Treatment: `native-app-server-remote-shell-v1`, separate from `codex exec`.
Immutable image: `sha256:c6de6f9c1b1676f52d2a4e53cf707e95b3c80ad903956e8140ebf3a4b801ebf8`.
The [manifest](manifest.json) freezes execution sources and ten case records;
[sources](sources/) retains exact executable copies. Changing any execution source
requires new observations rather than reusing these results.

- Client domain: native App Server, public fixture gateway token, no provider key.
- Worker domain: native exec-server and actual shell tools. Its control token is a
  separate public fixture and may be read by same-UID tools; it is not a secret
  protecting the model channel.
- Trusted parent: paired bounded stdio TCP relays, request admission, call/byte
  reservation, and the local HTTP upstream. It replaces the client fixture token
  with a distinct upstream fixture token. Neither container receives the latter.
- Docker: two independent network/PID/mount/IPC domains, no host mounts, no Docker
  socket, non-root, read-only rootfs, dropped capabilities, no-new-privileges,
  resource limits, no exposed ports. The existing durable supervisor manages both
  immutable container IDs. Its private state stays on the host.

The relays connect only a preselected client container loopback socket to a
preselected worker exec-server socket. They do not accept a tool-supplied host,
port, path, command, or container ID. `CODEX_EXEC_SERVER_URL=none` excludes implicit
local execution; an explicit named worker is registered and selected. The model's
advertised tools must match the **complete pinned schema hash** for exactly
`exec_command` and `write_stdin`. Other surfaces—image, code mode/host, agents,
MCP/plugins/apps, goals, hooks, web search, dynamic tools—are absent or disabled.
File access occurs through the worker shell. A deliberately emitted unsupported
`view_image` call is rejected by native routing.

The CLI uses `danger-full-access` **inside the already constrained remote Docker
worker**. The experiment does not claim that the CLI's own Linux sandbox works:
the previous bubblewrap/user-namespace prerequisite remains unavailable. No host
privileges, seccomp policy, mounts, or capabilities were weakened.

## Ten real Docker controls

| Case | Required observation |
|---|---|
| allowed | One native command completes successfully, output `WORKER`; client stays `CLIENT`; two authored upstream calls |
| hostile | Actual native command runs; four concurrent and one delayed broker connections refused; host/egress probes cannot connect; tool and readable proc environments contain no model credentials; forged gateway stdout does not escape the tool result |
| missing | Unknown environment rejects thread startup; zero upstream requests; no local command |
| local-disabled | Explicit `local` selection rejected; zero upstream requests |
| bad-auth | Real exec-server rejects public wrong token; authored shell call fails with no usable environment and no local command |
| disabled-surface | Native router refuses `view_image`; no command executes |
| disconnected | Relay severed; authored shell call cannot find usable environment; no local command |
| cancel | Native `turn/interrupt` interrupts an actually started long tool; final turn interrupted, one upstream call |
| deadline | Host's two-second client deadline kills attach; no accepted final; supervisor removes both domains |
| client-death | Controller heartbeat deliberately stops; watchdog kills both domains, attached client exits nonzero; no accepted final |

The last case simulates controller loss by stopping heartbeat; it is not a direct
SIGKILL of the host controller. Direct launcher/manager SIGKILL and supervisor
restart were independently recorded in the preceding
[lease experiment](../2026-11-09-docker-lease/README.md). Those prior controls are
not relabeled as new observations here. The manager's bounded cleanup contract
and its documented daemon-unavailability limitations still apply.

The auth/disconnect negative cases intentionally allow the fake upstream to emit a
shell request after failure so native refusal is observed. A future paid launcher
must instead require environment readiness before opening any paid request budget.
A textual final alone never demonstrates that a tool ran: acceptance requires
native command events, the returned tool-output item, domain evidence, broker
counts, and confirmed cleanup. A hostile worker can manipulate its own process
and tool outputs; these are not cryptographic remote attestations.

## Offline transport and budget contract

The native client forwards HTTP request envelopes through its own stdio gateway.
The parent accepts only POST `/v1/responses`, the public client token, the frozen
fixture model/effort, known request fields, and pinned tool schemas. It reserves
at most two requests and 300,000 bytes before dispatch, denies concurrent calls,
adds `max_output_tokens=2048`, and checks completed response model, unique response
ID and nonnegative, consistent usage. It uses a monotonic session deadline and
an absolute upstream timer as well as byte caps. Cancellation seals the budget;
replays, late completions, missing usage and identity mismatches fail closed.

The pure `OfflineBudget` is deliberately fixture-only and rejects real model IDs.
Its per-response token cap is not a claim that native input byte counts equal
provider token counts. The only HTTP endpoint constructed by this controller is
its own loopback fixture server. The companion
[live handoff](../2026-11-09-live-handoff/README.md) records the separate production
transport and approval requirements. No real credential is read by this experiment.

## Investigation sources and limitations

Consulted 2026-11-09: [official App Server documentation](https://learn.chatgpt.com/docs/app-server),
and Context7 source excerpts for upstream `openai/codex`:
`codex-rs/exec-server/src/environment_toml.rs`,
`codex-rs/exec-server/src/environment_provider.rs`, and
`codex-rs/exec-server/README.md`. These moving sources suggested remote selection,
local exclusion and authentication behavior. Installed binary observations,
including native initialized `userAgent`, are the evidence for 0.167.0.

The worker uses an absent isolated `/tmp/executor-home`. Creating that directory
in this pinned image caused `thread/start` to time out after remote configuration
reads, despite a successful ready handshake. The failed records are retained;
the root cause is not established. The observed working empty-home configuration
is part of the frozen treatment. It must not be generalized to an arbitrary
preconfigured remote home or to user-supplied worker configuration.

Open limits: real provider authentication and actual model identity; live token
usage/cost; account availability; semantic quality; native versions/platforms
other than this pin; host reboot/power loss/daemon restart. No claim is made about
all possible malicious native protocol implementations, Docker/kernel escapes,
or cryptographic provenance of worker-controlled output. These limits are distinct
from the demonstrated absence of a worker route to the client/model broker.

## Reproduction and records

- `npm run evals:runtime:native:validate`: saved hash/source/semantic evidence check,
  no daemon, network, or model calls.
- `node --test evals/research/runtime/prospective/native-remote.test.mjs`: contract,
  deadline, replay, usage and evidence mutation regressions.
- `npm run evals:runtime:native:record`: explicit Docker replay, authored loopback
  upstream only. Requires the retained immutable image and running Docker.
- `cases/*/record.json`: native request/response envelopes, events, exact subprocess
  arguments, stdio relay bytes, immutable identities, broker observations and
  supervisor cleanup records. `cases/*/lease/` preserves original durable files.
- `development.tar.gz` preserves exact development-file bytes;
  `development-inventory.json` lists each SHA-256 and archive hash. Development
  attempts retain stdout-flush truncation, auto-connect/auth and shell
  mismatch, remote-home timeout, capture timing, and floating deadline-bound
  failures. They are historical failed/development observations, not passing cases.

No release, permanent watchdog installation, new Discussion message, external model
request, or modification of another person's Docker workloads was performed.

## Complete offline smoke launcher

`native-smoke.mjs` registers a separate three-session smoke protocol. It uses the
same native client/worker/gateway, now with the production HTTPS transport
injected in the trusted parent. Offline execution starts a local TLS upstream,
returns authored provider input-count receipts, and drives **three actual native
sessions / six count requests / six inference-protocol requests** through one
shared ledger. All three sessions must read the worker sentinel successfully and
confirm cleanup before their results are imported. The authored one-token counts
are simulated counts, not measured tokenization of the supplied prompts.

[smoke-registration.json](smoke-registration.json) pins the image, executable
sources, complete native tool-schema hash, three prompts, live model `gpt-6-luna`,
reasoning `low`, and budget. These prompts check connectivity, remote reads and
evidence limitations; they are not the original 81-response behavioral study.
`smoke-offline/` preserves the complete rehearsal, including client/provider SSE,
request envelopes, safe transport ledger, TLS certificate, supervisor cleanup
and a final journal. Provider credentials exist only in the trusted parent;
records preserve an auth-match boolean for the public TLS fixture.

To validate: `npm run evals:runtime:smoke:validate`. To explicitly replay offline:
`node evals/research/runtime/prospective/native-smoke.mjs record NEW_OUTPUT_DIR`.
The `native-session` lease workload is fixed to a bounded Node idle command;
immutable inspection verifies its exact entrypoint and arguments. Its 180-second
fallback is subordinate to the 90-second lease, 5-second heartbeat, 60-second
client deadline, and shared 120-second transport budget. Unlike the earlier
20-second detached fixture, it can support the proposed live smoke duration.

The live launch path is implemented but **has not been invoked**:

```sh
node evals/research/runtime/prospective/native-smoke.mjs live AUTHORIZATION_JSON NEW_OUTPUT_DIR
```

It first checks the frozen registration and requires an explicit authorization
file carrying `enabled: true`, the exact registration SHA-256, `model`, `effort`,
`budget_nano_usd: 100000000`, and the user's approval reference. It then reads only
the explicitly named `BROOKS_RUNTIME_SMOKE_API_KEY` and removes that variable from
the launcher's environment before spawning children. There is no existing live
authorization file or supplied real key in this work. No model switch is inferred
from the chat model. Missing authorization refuses before Docker/model dispatch.

The live transport permits only `https://api.openai.com/v1/responses`, obtains a
provider count before each generation, and has no retry, redirect or expensive
model fallback. At most six count and six inference HTTP requests are possible
across all sessions. Inference reservation is capped at $0.10; count-endpoint
billing is not independently verified, so this is not a guaranteed all-in charge.
Remote environment readiness is mandatory before any smoke request is admitted.
Real account access, accepted model identity, count endpoint semantics and actual
usage/billing remain the next explicitly authorized model-validation step.

### Validation outcome

The initial author run passed **26 archived offline verification commands**; see
[author-validation.json](author-validation.json). The main test run passed **793
main tests**, in addition to the repository helper/provider groups. The new native,
smoke and upstream transport suites passed **120 tests**, with no skips; final
focused output is retained in `author-final-focused.txt`. The added
`smoke-preflight-negative/` real Docker record supplies a wrong executor token and
confirms preflight rejection with **zero model admission requests**, followed by
confirmed removal of both containers. Saved smoke validation includes this control.

Ten native controls, three complete smoke sessions, and the additional preflight
negative were executed against authored local services. No real model was called.
Historical development evidence is retained in the lossless archive; it is not
included in the passing-control denominator. `final-owned-containers.json` records
the task-labelled container check. QA findings and subsequent validation are recorded
separately so an author pass is not presented as independent QA.


### QA1 repair and new rehearsal

QA1 found four contradictory rehashed smoke archives that the original checker
accepted. The single author repair strengthens raw count/inference/FINAL binding
and the runtime cleanup/import chronology; it adds 29 negative regressions and
records a new three-session local-TLS smoke rehearsal. Original evidence and all
QA1 findings are preserved. See [remediation.md](remediation.md) for the exact
changes, preservation hashes, new registration and separate validation records.
The original 793-test author result above is historical; the repaired main suite
contains 822 tests. QA2 is recorded separately.
