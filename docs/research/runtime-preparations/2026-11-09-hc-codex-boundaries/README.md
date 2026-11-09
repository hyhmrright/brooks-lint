# Native CLI completion and tool boundaries with owned stubs

This archive retains **32 actual Codex CLI 0.167.0 exec attempts**, all against
parent-owned local fake services. Model names, SSE messages and usage are authored
fixtures. There is no inference, real credential, semantic model grade or HC study
turn. Actual backend identity is null and `live_ready` remains false.

## Collections and original evidence

| Collection | Exec attempts | Purpose and retained limitation |
| --- | ---: | --- |
| `development/attempt-1` | 13 | Recorder stopped before tool launches because `map(realpathSync)` passed an array index as fs options; partial-answer case hit SSE idle timeout |
| Main `observations/` | 15 | Coherent frozen protocol and read-only tool cases; explicit idle/deadline settings corrected before collection |
| `supplemental/` | 2 | Inner sandbox disabled inside unchanged outer profile; marker runs, curl initializes unsuccessfully before networking |
| `supplemental-openssl-null/` | 1 | Fixed curl prefix `OPENSSL_CONF=/dev/null` still produces the same configuration-read failure |
| `supplemental-nc/` | 1 | Fixed native nc control connects to allowed broker and fails at the other owned listener |

Every collection's plan and source snapshots preceded its native launches.
Previous attempts were not deleted, replaced or rescored as successful attempts.
The first driver's TypeError transcript is retained from the tool output, not
presented as an original standalone driver-stderr file; all native CLI stdout and
stderr are original byte captures. Auxiliary `--version` inspection is binary
metadata, separate from these 32 exec attempts. Parent TCP controls and owned HTTP
regression tests are not native CLI turns.

## Protocol observations and parent acceptance

| Main case | Native exit / observation | Current parent guard |
| --- | --- | --- |
| Valid final control | 0, final file and event agree | Eligible for fixture protocol only |
| Commentary then final | 0, both event messages, final file has final only | Eligible for fixture protocol only |
| Commentary only | 0, commentary becomes last-message file | Reject: no final-answer phase |
| Empty final | 0, empty last-message file | Reject: empty final |
| `response.failed` | 1, explicit local error | Reject |
| `response.incomplete` | 1, max-output-tokens reason | Reject |
| Malformed SSE JSON | 1, stream closed before completion | Reject |
| EOF without terminal response | 1, stream closed before completion | Reject |
| Contradictory duplicate completion | 0, first final retained | Reject: multiple response terminals |
| Redirect to another owned origin | 302 followed as GET via broker; broker returns 403 | Reject; observer receives no HTTP request |
| JSON content type instead of SSE | 1, no completed response | Reject |
| Reported model and effort mismatch | 0, normal-looking final | Reject: request/report disagreement |
| Partial answer then parent deadline | TERM at 2000 ms, no terminal turn | Reject interrupted attempt |
| Required tool marker, inner read-only | Tool launch returns sandbox_apply error 71; CLI later exits 0 | Reject required tool step, boundary unverified |
| Required tool network, inner read-only | Same nested sandbox error; no network command executed | Reject required tool step, boundary unverified |

The current guard is a **fixture contract**, not a universal Responses compatibility
validator: exactly one successful ordered JSONL turn, complete response evidence,
confirmed cleanup/stdio closure, a nonempty final file matching the final agent
message, one terminal final-answer-phase message, consistent reported fields and
required tool success are required. An intermediate tool-only response is allowed.
Invalid UTF-8, unknown/reordered events, absent response evidence, failed/incomplete
responses, duplicate terminals and final-phase contradictions fail closed. The
known pre-turn unknown-fixture-model metadata warning is explicitly recognized;
that warning does not authenticate the configured model.

The original collection embedded its then-current guard result. Those raw
`record.json` files stay unchanged. `collection-phase/` binds original sources/run;
current `run.json` stores retrospective stricter guard assessments separately.
In particular the two required-tool failures originally passed transport/final
checks; current policy refuses them. Their predeclared positive expectations are
still visible and unmet. Offline archive PASS means records and guard behavior are
consistent; it does not relabel those tool boundaries as verified.

The partial-answer case sends an in-progress message and actual output-text delta
before continuing authored SSE comment heartbeats. With idle timeout 20000 ms and
parent deadline 2000 ms, the parent interrupts the native CLI, confirms group
absence and drains stdio. Partial bytes stay in the upstream/broker bodies. The
first attempt instead used idle600 ms; comments did not prevent the observed idle
failure. No final answer is reconstructed from partial bytes.

## Tool control and containment limits

The main tool cases use built-in read-only mode. Its nested Seatbelt application
fails with `sandbox-exec: sandbox_apply: Operation not permitted`. This is a
launch failure, **not proof of a denied tool network connection**. The subsequent
synthetic final response demonstrates that a native successful turn alone can
conceal an unexecuted required tool step.

Separately authorized controls change only the **inner** CLI sandbox argument to
`danger-full-access`; the whole CLI and its descendants still inherit the outer
deny-default Seatbelt profile. This isolates the outer boundary for testing and
is not a production recommendation. Exact runtime file allowances add canonical
`/bin/sh`, `/usr/bin/curl`, `/usr/bin/sandbox-exec`, and for the nc case only
`/usr/bin/nc`; each exact path/digest and profile delta is recorded. No system
runtime directory, host auth/config content, IPC permission or network destination
is added. The only network grant remains the broker's one loopback port.

The marker command runs with `/bin/sh`, `login=false`, prints a fixed marker and
checks only presence of three explicitly named credential variables. It does not
dump environment contents. They are absent; the parent-held public fake upstream
Authorization is never passed as a child credential. This does not prove absence
of every possible secret source or keychain/IPC activity.

Both curl variants fail while trying to read denied system OpenSSL configuration,
before any network evidence; the prefix variant does not establish why the setting
was ineffective. These remain unverified network probes. The bounded nc case
avoids curl initialization: its broker TCP check exits 0 and other-owned-listener
check exits 1. Parent TCP controls had just connected to both listeners; the
observer receives no HTTP request. The actual command output is retained in CLI
JSONL and the subsequent model-client request's `function_call_output`. The client
then makes its second owned model request and completes the authored final.

This proves tested outer one-port containment with the inner sandbox disabled.
It does not prove native read-only tool-network isolation, universal connection
failure attribution, or separation against hostile tools. Descendants share the
broker TCP allowance; a public capability is not a secret or an unforgeable proof
of client identity. Full hostile tool/client segregation remains a readiness gate.
The two model requests in a tool roundtrip have an explicit two-forward fixture
budget; they are not retries or the frozen study's one-primary-attempt budget.

## Bytes, provenance and remaining work

`record.json` includes exact argv/settings/environment/policy, parent reachability,
request/body hashes, raw parsed header arrays, process signals/probes and owned
service cleanup. Matching `.bin` files retain original CLI streams, last-message
files, upstream requests/responses, broker responses (including denial bodies),
and any observer request bodies. Parsed headers and body buffers are not a full
TCP capture or byte-exact HTTP header serialization. Broker writing a body does
not independently prove receipt of every byte by the native CLI.

Collection snapshots remain preserved when validation is hardened. Current source
snapshots/digests bind the validator and regression tests; old source is hashed,
never executed by validation. `remaining-boundaries.json` distinguishes scoped
observations, incomplete local checks, autonomous local follow-ups and production
unknowns. Real authentication/OAuth/refresh, host keychain behavior, production
TLS and model identity/provider-internal retries remain unverified. Local TLS,
cross-session contamination, detached descendants, native output limits and full
frozen study integration remain local follow-ups, not silently declared impossible
or complete. Human review and independent holdouts remain pending.

`npm run evals:runtime:boundaries:validate` only reads archived bytes. Default tests
also use pure checks and owned HTTP fixtures; they never launch native Codex or
models. An explicit record command remains separate and refuses overwriting a
plan. All historical research sources/archives, frozen study design, skills,
rubrics, book inventory, official version and prior model results are unchanged.
