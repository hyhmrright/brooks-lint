# Native Codex CLI streaming retries and deadlines with owned local stubs

Six real **Codex CLI 0.167.0** processes talked only to a parent-owned loopback
broker. The broker talked to its own second fake HTTP service. Responses, model
name, messages and usage are authored fixtures: **zero model inference, real
credentials, semantic assessments or live-study turns**. `live_ready` remains false.
The official configuration reference is linked in `references.json`; installed
behavior below is separate observation, not a claim about every CLI version.

## Predeclared cases and observations

`plan.json` was written before any case launch. Every case pins HTTP request
retries to zero. Streaming retry counts and timeouts vary only as listed.

| Case | Stream retries | CLI POSTs | Fake-upstream forwards | Outcome |
| --- | ---: | ---: | ---: | --- |
| Complete synthetic SSE control | 0 | 1 | 1 | Exit 0, authored marker, turn.completed |
| Interrupted SSE control | 0 | 1 | 1 | Exit 1, turn.failed |
| Interrupted SSE positive retry control | 1 | 2 | 2 | Exit 1, turn.failed |
| Interrupted SSE, parent forward budget 1 | 1 | 2 | 1 | Second request denied HTTP409; exit 1 |
| Idle SSE, configured idle timeout 350 ms | 0 | 1 | 1 | Explicit CLI SSE idle-timeout error, exit 1 |
| First-byte stall, parent deadline 5000 ms | 0 | 1 | 1 | Parent deadline, CLI exits by SIGTERM; no terminal turn |

The new relay writes SSE headers and event bytes immediately. It does not buffer
until response completion. In the idle case the parent wrote 949 bytes at about
166.5 ms after server startup; the client disconnected at about 519.1 ms, then the
parent canceled the upstream socket at about 519.5 ms. The CLI emitted
`idle timeout waiting for SSE`. The fake service did not intentionally close this
stream. The write event is a parent-side observation, not independent packet or CLI byte-receipt
evidence. The explicit CLI error establishes the tested idle-timeout path; 350 ms is a configured
interval, not a hard real-time guarantee or a universal timing distribution.

For the first-byte stall, the stream idle setting is 20000 ms. The parent deadline
is 5000 ms, and the fake service's socket watchdog is 20000 ms. The upstream had
received a request at about 172.7 ms, but sent no headers. The parent recorded
`cli-deadline`, sent TERM and later KILL while group ownership was held; the CLI
fixture exited on TERM. The guardian/group confirmation and stdio closure finished
at about 5111.3 ms. This is a canceled protocol attempt, not a normal failed model
answer. All six final groups were confirmed absent; all stdio closed. Both owned
services, their sockets and parent outgoing requests were closed in every case.

## Isolation, identity and authentication

The driver reuses the previous source-bound `codex-channel.mjs` launch,
`cliProfile` and fresh scratch HOME/CODEX_HOME/XDG environment unchanged. The only
permitted network destination from the native process is the broker's numeric
loopback port. Runtime preferences/proxy accommodations and broad host Mach IPC
limits remain those documented in the earlier channel archive; no additional
Seatbelt allowance was added. The successful path still explicitly sets all proxy
environment variables to the owned broker. Direct/no-proxy routing is unverified.

Every native request has the public inactive capability marker and no
Authorization or Proxy-Authorization. The parent adds a different public inactive
fake Authorization only on its own upstream request. These markers are published
protocol fixtures, not secret credentials. This does not test OAuth, keychain,
refresh, production TLS, provider-internal retries or real credential custody.
Host IPC/keychain behavior has not been syscall-traced.

The request names `fixture-model`, reasoning effort medium, stream=true and
store=false. The CLI warns that unknown model metadata falls back. Actual backend
identity remains null, and synthetic SSE usage is not token/billing evidence.
Tool calls, detached/setsid descendants, hostile IPC, production model catalogs,
full frozen HC-study integration and independent holdouts remain unverified.
The prior request-retry and new stream-retry controls cover distinct layers;
neither can establish that a real provider internally retries no work.

## Raw evidence and reproducibility

Each `observations/<case>/record.json` retains argv, settings, environment,
Seatbelt policy, server event times, exact request/response body bytes as base64,
original parsed headers, process outcomes and cleanup probes. Matching `.bin`
files preserve stdout, stderr and body bytes. Parsed/rawHeaders arrays are not a
byte-exact HTTP header-block or TCP packet capture. Responses retain fake-upstream
partial body bytes and disconnect state. The broker-generated HTTP409 body is not
separately captured in the response array: its authored value is in the source,
and the denial disposition and CLI error remain in the record. This archive is
not a complete bidirectional HTTP wire capture. No response is a generated model answer.

`run.json` binds the plan, installed binary digest/version, dependencies, source
snapshots and each original record. `collection-phase/` preserves the original
collection source snapshots and run. Later validator-only hardening added exact
idle-error/close-order/socket checks and one regression test. Its current sources
are separately pinned in `source-snapshots/`; all six raw record digests and the
original plan remain identical. Neither archive is executed during validation.
This is one collection of six predeclared protocol cases, not repeated model
experimentation. No failed or replacement collection was discarded.

```bash
npm run evals:runtime:stream:validate
node --test evals/research/runtime/prospective/codex-stream.test.mjs
```

These commands do not launch Codex. The tests use saved records, pure assertions
and an owned-HTTP budget regression. The explicit `record` command creates a new
run path and requires a specified native binary; it remains separate from all
default/offline gates. Existing research archives, frozen study plans, shipped
skills, book inventory, scoring and user-review status are unchanged.
