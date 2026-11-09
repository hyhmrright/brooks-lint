# HC parent-owned channel and authentication preparation, revision 1

This implements a concrete **offline local transport boundary**, not an enabled
live executor. HTTP servers, socket rejection, request counts and timeouts are
actual local observations. All payloads are authored fixtures; credentials are
random disposable `fixture-only-` tokens. No auth.json, keychain, login, credential
helper, real key, model/provider endpoint or Codex turn is accessed. All previous
process implementations, archived observations and both failed QA rounds remain
unchanged. There are no semantic judgments or model correctness results.

## Implemented boundary

A parent-owned loopback broker binds one primary request to exact immutable bytes
(model, input, reasoning, store=false and streaming declaration). The expected
request and identity are copied before serving. A private ephemeral capability
allows the fixed local client to request that exact turn. Correct capability,
method, exact origin/host/path/content type and body must match; caller-supplied
Authorization, proxy auth, content encodings, destinations and extra fields are
refused. This is not a general HTTP proxy. The accepted upstream is a fixed
numeric 127.0.0.1 response endpoint; arbitrary HTTP(S), DNS, userinfo, query and
fragment destinations are unavailable in this revision. A loopback address alone
does not establish that a service is fake: an arbitrary local port could host a
model or forward elsewhere. The trusted caller must establish fixture ownership.
The archived generator and tests create their own explicit fake handlers, which
is the basis for their zero-model-call record; the URL check alone is not that proof.

The parent retains the disposable upstream credential in a closure and injects
Authorization only into its fixed upstream dispatch. The client receives no
provider credential, auth file or host auth environment. The separate Seatbelt
probe exports a frozen workspace and clean environment using the existing
process helpers, then adds one network-outbound grant for the exact relay port.
A real fixed Node child reaches that port and gets EPERM/EACCES on direct fake
upstream access; the upstream sees the parent dummy auth exactly once. The child
has no provider credential in its environment. No user credentials are read to
perform this check.

Seatbelt uses `localhost:<port>` in its policy grammar (a numeric host expression
was rejected during development); the application endpoint is pinned numeric
127.0.0.1 and the server binds only there. A port grant does not distinguish a
model client's socket from an agent tool in the same process tree. Tool-versus-
client channel separation therefore remains **unverified**. The probe is one fixed
immediate Node child, not a replacement for the guardian-backed executor and not
a real Codex integration test. Unsupported systems skip this probe explicitly;
portable relay/parser/archive tests still run, without a Linux/Windows isolation
claim. Runtime/IPC/system read exceptions from the earlier sandbox remain limits.

## Retry and resource contract

The upstream budget is charged synchronously before any outgoing connection.
Concurrent duplicates and later reuse cannot dispatch another primary request,
including after HTTP401/429/503, redirect, disconnected SSE or timeout. This relay
has zero HTTP retries, authentication refreshes, redirect follows or stream
reconnections. It uses native HTTP with an explicit fresh agent and no proxy
configuration. Upstream-provider internal retries and actual Codex hidden request,
stream, auth-refresh or discovery behavior are **not observed** by these tests.

Inbound receipt has a total connection/body deadline, not merely an idle timeout.
The response deadline is total and stops even a regularly dripping upstream.
Request bytes, response bytes and simultaneous connections are bounded. Channels
close active sockets and settle in-flight outcomes; close before dispatch settles
as not-attempted with null request observation. A closed channel has no replacement
primary and does not silently reconnect. Resource defaults are recorded in
run.json; short local deadlines exercise timeout paths without model inference.

The response is buffered and bounded before delivery and evidence retention. This
is **not a faithful real-time streaming relay**: SSE bytes are collected once,
completion fields are inspected and interrupted partials are retained, with no
resume. A real streaming implementation would require its own reviewed revision.
Transport completion does not establish semantic answer completion or identity.

## Identity and sanitization

Evidence keeps four distinct sources:

- Intended model/reasoning/provider are declarations.
- Configured route identifies the fixed local fixture origin/path and declared
  provider id; it is not evidence of an actual remote provider.
- Broker-observed model/reasoning come from the exact accepted request, not from a
  successful configuration claim. No dispatch means no request observation.
- Upstream-reported model and reasoning come only from sanitized JSON/SSE response
  fields. Missing/mismatched/partial/dynamically updated data remain unverified.

`response.reasoning.effort` reports a request-level setting, not actual internal
compute or effort selected later by configuration_update. This narrow request
shape disallows dynamic input controls and treats a configuration-update event as
unreviewed. Provider identity stays null. Model self-description in answer prose
never supplies identity. Even matching response fields are only an upstream
report, not authenticated proof of which model executed; every ledger stops,
remains ungraded, and live_ready stays false.

Only fixed media types are propagated; arbitrary upstream headers and errors are
not archived or forwarded. Known literal, base64 and hex credential/capability representations and common
JSON ASCII-unicode escaped echoes are normalized/redacted before client delivery
and evidence parsing. Client/evidence scans also check direct, base64 and hex
representations of the generated tokens. Partial literal tails are redacted when
recognizable. Evidence stores sanitized bytes and their hashes; it intentionally
does not store a credential-bearing raw-body hash or token fingerprint.

These tests do **not** prove nonleakage under arbitrary encoding, encryption,
malicious transformations, native memory inspection, crash dumps, loggers or real
provider behavior. Redaction changes bytes; the archive is not an untouched raw
provider-wire record. A real study needs a separately reviewed secure raw-record
custody and credential policy rather than silently weakening that requirement.

## Artifacts and validation

run.json binds eight actual local observations: a matching JSON report, HTTP401,
HTTP503, redirected credential echo, interrupted SSE, model-report mismatch, a
total drip deadline, and the sandbox channel/credential boundary. Test logs also
cover HTTP429, concurrent/cross-session requests, bad pins/routes/headers,
slow inbound data, byte caps, missing identity and Unicode/header echo cases.
All records have zero model calls and use one fake upstream dispatch where a
primary is attempted. Tests' expected errors are not failed model answers.

The four current modules and tests are separately frozen in source-snapshots and
checked against current implementation hashes. Snapshot code is read as bytes,
never imported or executed. All generated output paths must be new. Hashes detect
drift, not independent authorship or authenticity. references.json records narrow
official support and its limitations; documentation does not prove runtime policy.

```bash
node --test evals/research/runtime/prospective/model-channel.test.mjs
npm run evals:runtime:channel:validate
```

The second command reads only saved data and source bytes, without socket/process
creation. The separate record command starts local fixtures only, refusing an
existing observation archive. QA and author validation records distinguish actual
checks from documentation-only declarations.

## Remaining live gates

A future no-auth custom Codex provider configuration is generated with request and
stream retries declared zero and WebSockets disabled. No provider key is present.
Capability delivery for an actual Codex client is not implemented; effective config,
prompt/wire request shape, complete executor integration, production HTTPS/auth,
OAuth refresh, backend identity and hidden/internal retry behavior remain pending.
The command sandbox proxy does not itself filter client model/auth traffic.

Public HC cases remain exposed and non-independent, book support unverified,
human fixture review pending, and detached/setsid containment unresolved. A later
reviewed implementation/registration and explicit live authorization are still
required. Actual Codex wiring/config/retry behavior is not yet observed, rather than
intrinsically impossible to test offline. A future reviewed Codex-to-local-stub
integration would be separate from live provider inference and was not attempted
in this revision. No frozen study design, prompt, rubric, score, prior answer or shipped
skill changed, and no live model testing is authorized by this preparation.
