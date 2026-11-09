# Real Codex CLI with owned local protocol stubs

This archive runs the installed **Codex CLI 0.167.0** against local HTTP servers
created by the recorder. Responses, usage values, model names and assistant text
are authored fixtures. No model inference, real provider connection or semantic HC evaluation is
performed. The harness performs no credential login or keychain retrieval; native
host IPC is not fully traced, so this is not proof of zero keychain operations. The seven
final cases are protocol observations, not model answers or study repetitions.

## Observed wiring and authentication boundary

The real native binary is launched with a fresh HOME, CODEX_HOME, XDG state and
neutral scratch workspace containing only `fixture.txt`. Initial home directory
listings and auth.json absence are recorded. No host auth/config is copied.
Provider configuration is inline, no-auth, file-only credential storage, with
user config/rules ignored, ephemeral sessions and no shared daemon. Analytics,
telemetry, update checks, plugins, apps, hooks, memories and multi-agent behavior
are disabled by the recorded declarations. `features list` separately records
accepted values; it is not blanket proof every feature obeyed its setting.

The whole CLI process has a deny-default Seatbelt boundary. It reads the exact
native binary, existing system runtime roots and scratch only. Narrow runtime
exceptions allow the exact binary directory's entries, read-only named
`apple.shm.notification_center` shared memory and `vfs.disk-space` information.
One loopback broker port is the only network grant. The second fake-upstream port
and external destinations are outside that grant. Broad runtime mach-lookup and
system metadata allowances remain explicit limits; host IPC/keychain behavior is
not fully traced. This is not a proof of hostile host noninterference.

The initial strict profile could not synchronize managed preferences. The private
runtime environment `__CFPREFERENCES_AVOID_DAEMON=1` allowed startup; the
single-underscore spelling did not. CFFIXED_USER_HOME is also pointed at scratch.
These are observed local runtime accommodations, not portable documented Codex
interfaces. Denied global-preference reads remain in the diagnostic evidence.

Empty proxy variables and NO_PROXY alone still caused attempts to the host's
system proxy port 1087, which Seatbelt denied. Disabling accepted system-proxy
features did not establish direct routing either. **The successful mode explicitly
sets all proxy variables to the owned broker origin.** The raw request target is
absolute-form and is accepted only for that broker's own origin and exact
`/v1/responses` route, without userinfo/query/fragment. It cannot proxy another
origin or CONNECT tunnel. No grant was added for the host proxy. Success proves
this explicit local-proxy wiring, not reliable direct/no-proxy isolation.

The provider sends a public test capability header. The CLI request has no
Authorization header. The trusted parent adds a different public fake Authorization
marker only when forwarding to the owned fake upstream. Both markers are
intentionally published, inactive protocol fixtures, **not secret credentials**.
The no-auth path and absence of real credentials are demonstrated; real credential
acquisition, OAuth refresh, keychain access and production authentication are not.

## Request and retry observations

| Case | CLI POST requests | Fake-upstream forwards | Observed outcome |
| --- | ---: | ---: | --- |
| success, retries 0/0 | 1 | 1 | Exit 0, synthetic message and turn.completed |
| HTTP401, retries 0/0 | 1 | 1 | Exit 1, turn.failed, no second request |
| HTTP429, retries 0/0 | 1 | 1 | Exit 1, retry-limit error, no second request |
| HTTP503, retries 0/0 | 1 | 1 | Exit 1, turn.failed, no second request |
| interrupted SSE, retries 0/0 | 1 | 1 | Exit 1, stream failure, no reconnection |
| HTTP503, request retries 1 | 2 | 2 | Positive control detects the extra request |
| HTTP503, retries 1, parent budget 1 | 2 | 1 | Second CLI request denied with HTTP409 |

These counts come from server observations, not error wording. The positive
controls are predeclared local protocol cases, not replacement primary study
attempts. A broker's one-forward limit and a client's retry setting are different
claims. Stream-retry-one sensitivity, untested transport classes, other CLI
versions and real provider-internal retries remain unverified. Zero-request startup
failures are retained separately and never counted as evidence of no retry.

The real request contains model `fixture-model`, reasoning effort `medium`,
stream=true, store=false, actual CLI message roles/tool declarations and metadata.
The CLI warns that this unknown fixture model uses fallback metadata; catalog and
real-model prompt fidelity therefore remain unverified. The neutral prompt asks
for a fixed marker and no tool calls; the fake response never invokes a tool.
Tool-versus-model-client channel separation is not established by these cases.

All response model names and usage counters are authored. Request-observed model,
configured provider and fake response fields are separate from the null actual
responding-model identity. Even a completed real CLI turn cannot authenticate a
backend model here, because there is no backend model. Nothing is semantically
graded and live_ready stays false.

## Raw records, provenance and cleanup

Each `observations/<case>/` folder saves byte-exact `stdout.bin`, `stderr.bin`,
CLI/upstream request body `.bin` files, response body `.bin` files and `record.json`.
The latter includes raw parsed header arrays, original request target, base64
copies, hashes, native binary/argv/env/policy, initial/post state listings and
parent guardian cleanup evidence. HTTP body bytes and CLI streams are original;
headers are Node's parsed/rawHeaders representation, **not a packet capture or
byte-exact serialization of the entire HTTP header block**. Public fixture markers
need no redaction. An unexpected credential header aborts publication instead of
silently exposing it. This is not a production secure raw-record custody policy.

The existing fixed guardian source is reused without editing historical files.
The bounded local wrapper records process exits separately, sends signals only
while ownership is held, and confirms same-group absence or explicit zombie-only
non-running state. This wrapper is not the full frozen-study executor. Detached/
setsid containment and hard real-time guarantees remain unresolved. Final records
keep confirmation failure distinct from sending KILL or merely closing stdio.

`development/` retains exploratory startup/proxy failures, their original raw
stream data and per-attempt captured policies/environments. Their changing source
was not frozen per attempt; they are diagnostic provenance, not reproducible
final study cases. `features-record.json` and `.bin` streams are a final independent
CLI feature inspection with zero HTTP requests. `run.json` binds the final seven
cases, existing dependency digests and binary metadata. `capture_source_sha256`
retains the exact collection revision, while `source_sha256` binds the current
validator/tests. Validator-only summary/version/inventory hardening did not change
the driver or recollect any raw case. The first complete author PASS and its three
source snapshots are preserved in `author-pre-validator-hardening/`; all original
case hashes remain identical. Current source snapshots enforce validation drift.
Archived code is read as bytes only; validation never executes snapshots.

```bash
npm run evals:runtime:cli:validate
node --test evals/research/runtime/prospective/codex-channel.test.mjs
```

Both commands are read-only/offline and do not launch Codex. Default npm test and
prepared checks include only pure/saved-record tests. The separate explicit
`record` command requires an exact native binary and creates new output paths;
it starts real CLI processes against owned fake handlers only. Model/provider
inference remains unauthorized. Old research archives, both earlier failed QA
rounds, shipped skills, source inventory, scoring and frozen study design are
unchanged. Public HC cases remain exposed, human review pending and independent
holdout/model benefit claims unavailable.

## Author verification interruption

An inherited normal-completion fake-CLI test failed after 3157.9 ms with a
3000 ms fixture budget during the first hardened full gate. The generic preflight
error did not retain exit/timedOut details, so scheduling timeout is consistent
with the duration but **not retrospectively established**. The actual failing
full log and diagnosis remain in `author-preflight-failure/`; an exact-source
process snapshot found no leftover local fixture. The ordinary test's waiting
budget was raised to 10000 ms while every isolation/auth/output assertion and
the separate 100 ms timeout regression remain unchanged. Production and frozen
study deadlines were not changed. A new full gate follows that test-only change.
