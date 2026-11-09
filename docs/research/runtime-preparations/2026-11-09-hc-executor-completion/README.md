# Remaining executor boundaries: owned-local completion archive

This archive completes the autonomously runnable local follow-ups identified by
[the previous inventory](../2026-11-09-hc-codex-boundaries/remaining-boundaries.json).
It contains **128 native Codex CLI exec attempts and four fixed Node process
controls**, including every development attempt. Main collection: 97 native CLI
execs (13 boundary cases, two concurrent sessions, one curl control and 81 frozen
scheduled protocol turns), plus one unsuccessful nested Node control. Development
collections retain another 31 CLI execs and two unsuccessful Node controls. The
separate parent-owned detached control is the fourth Node control. Three CLI
`--version` metadata subprocesses are excluded from exec-turn counts.

All upstream services and TCP destinations are owned local fixtures. Every answer,
model identifier and token usage value is authored simulation. **Model calls: 0;
real credentials: 0; semantic reviews: 0; study-eligible model turns: 0;
`actual_responding_model: null`; `live_ready: false`.** This is protocol/process
research, not model performance evaluation, human validation or independent
holdout evidence. The shipped six skills, 64 structural evals, twelve-book inventory,
version1.9.1, frozen study design and historical real-model results are unchanged.

## Observations

| Boundary | Observed scope and outcome |
| --- | --- |
| Turn binding | Two native CLI sessions run concurrently with separate scratch homes, workspaces, proxies and public turn headers. Both complete the common authored marker. This measures scoped request routing and budgets; identical final text does not establish arbitrary response/callback identity. Separate authored HTTP controls reject a cross-turn header and changed prompt with403; simultaneous matching requests yield200/409 with one atomic forward; a retired delayed callback yields409. Tokens prevent accidental mixing, not hostile forgery. |
| Request cap | Actual native request exceeds1024B; broker retains1024B exact prefix and observed-byte count/hash, returns413, and forwards0requests. |
| Response cap | Authored32768-character answer produces a larger SSE response. Broker retains4096B observed prefix, records overflow and returns502; CLI fails. Complete authored upstream bytes and bounded broker bytes are separate. |
| Combined process output cap | Native large answer crosses2048B combined stdout/stderr retained budget. Parent stops the process, records observed counts/hashes, retained prefixes and discard counts, confirms cleanup. Stream chunks may already exceed the cap when observed; there is no claim that the CLI emitted only2048B. |
| Final-file cap | Native CLI exits0 with a4096-character answer. Post-exit importer retains1024B prefix and refuses eligibility. This bounds import memory/evidence; it is **not an OS disk-write quota**. A separate2MiB initial-stat guard and cumulative read-work bound reject oversized/growing/special files without reading/hash claims for their suffix. Nonblocking/no-follow descriptor opening precedes a regular-file check. |
|307/308 | Native client follows both redirects as POST with identical body and the public turn header. Foreign-origin requests still traverse the owned proxy; broker returns403, observer receives0HTTP requests. No real Authorization header exists, so sensitive-auth header propagation is unverified. The `http.forwarded` field records an admitted primary slot here; redirect replies are broker-authored and upstream HTTP count is0. Do not claim native redirect following is disabled. |
| Native TLS trust | Exact-destination owned CONNECT proxy tunnels to an owned HTTPS server. Proper CA-signed `CA:FALSE`/serverAuth/IP-SAN leaf succeeds with `CODEX_CA_CERTIFICATE`, `SSL_CERT_FILE` fallback, and Codex-CA precedence over a wrong SSL fallback. NoCA/wrongCA/localhost-name controls accept CONNECT but fail before any HTTPS request. Peer/hostname verification is never disabled. This establishes local controlled outcomes, not production trust or an authenticated model identity. |
| Curl correction | Adding the exact inspected745B public `/private/etc/ssl/openssl.cnf` file to the previous outer profile permits curl initialization. Actual tool output reports broker curl0 and observer curl7; next native request contains the `function_call_output`. All three credential-presence flags are absent. Inner CLI sandbox is disabled only inside unchanged outer deny-default one-port sandbox; builtin read-only behavior remains unverified. |
| Detached controls | All three nested Node attempts reportEPERM before the detached helper actually runs; exit0 of the wrapper does not prove the intended step. Original validation's positive expectation failed and is retained as such. A separately frozen trusted-parent `ChildProcess` launches a fixed sandboxed detached child: parent ps observes PID=PGID, child emits a marker, parent handle TERM succeeds, child is reaped and post-exit ps is empty/status1.800ms self-expiry backs up bounded parent cleanup. This proves a cooperative known-child lifecycle, not containment of hostile detached descendants. |
| Full81-turn protocol exercise | All81 original scheduled turns export exactly frozen allowlisted workspace bytes into fresh scratch sessions and complete one native CLI/fake-SSE exchange. Import binds schedule, workspace inventory, raw record/answer hashes and protocol checks. The canonical study response document deliberately leaves all81 rows `not-run`; semantic/paired study denominators remain empty. Files being available does not establish model/CLI reads or guidance consumption. |

The next-study frozen plan remains
`bade5c6cc86db0ea02dd32d6f22adb970374db427d757a4a3535258eb912996b`;
its inventory remains
`28ab1857667460539f43f26d9900cc4c528d728418b98326e3eda0433f63275e`.
No live registration was bound, no real model turn was executed, and no prompt or
arm was silently changed to inject all material. The shorter10-second local
protocol watchdog is separate from the frozen900-second future-study deadline.

## Original evidence and source attribution

- `plan.json` and `collection-phase/source-snapshots/` preserve the sources frozen
  before the main native launches. `collection-phase/run.json` and original
  `readiness.json` are exact originals. Current `source-snapshots/` and `run.json`
  separately identify validator/readiness corrections; raw record files and their
  embedded original eligibility remain unchanged.
- Each completed process was written immediately to its own record, raw `.bin`
  files and a new numbered receipt. Exact stdout/stderr/last-message bytes and
  parsed HTTP header arrays/body bytes are retained. HTTP arrays are Node-parsed
  headers, not packet/TCP-wire capture. A parent's write is not independent proof
  of the client's byte receipt.
- `development/attempt-1/` preserves the unsuccessful CA-as-leaf positive controls
  and nested detached failure. `attempt-2/` preserves the corrected leaf/trust and
  curl successes, plus the repeated nested detached failure. `development/inventory.json`
  hashes all development files, including the actual redirected recorder logs.
  Neither development collection is discarded or retrospectively called a success.
- `detached-parent-control/` has its own pre-launch plan/source snapshots, original
  record, exact child streams and original bounded ps evidence. It is not substituted
  for the unsuccessful nested control.
- `owned-public-tls/` contains deliberately **public disposable fixture keys**, CAs,
  leaf/CSR/configs and generation commands. They are not credentials for any real
  service and are never installed in the host trust store. Root and leaf generation
  are recorded; the first failed self-signed CA-as-leaf experiment remains separate.
- Truncated prefixes are exact retained bytes. Observed stream hashes/counts cover
  chunks the parent actually saw before close; discarded suffixes are not present
  and their hashes cannot independently be recomputed from a prefix. Capture end,
  attempted fixture payload, observed bytes and retained bytes are separate facts.
- `preflight-round1/` and `preflight-round2/` preserve author gate logs/source
  snapshots before later root-review corrections. They are not independent QA.
  The shared pure import/launch validator now checks declared caps against policy,
  rejects altered env/argv/body/turn binding, and reconstructs Darwin paths using
  POSIX conventions.
- `preservation-baseline.json` pins1082 preexisting research files. Source pinning
  detects drift relative to the retained anchor; it is not a signature or protection
  against replacing both evidence and its trusted anchor. Archived source is hashed,
  never imported or executed by validation.

## Bounded final-file correction after QA round1

Independent QA round1 found that the original importer could block opening an
owned FIFO after process cleanup, despite16 automated gates passing.
`qa-round1-failure/` preserves that FAIL, the original1512ms timed-out reproduction
(including its initial setup error), all QA logs and the preceding author
source/gate snapshot. None of the128 native CLI records were altered.

Current `captureFinalFile` opens with no-follow/nonblocking flags, checks the opened
descriptor is a regular file, and reads at most its initial stat size, bounded
by2MiB. It never chases EOF or appended data. Changes detected by a second stat,
special files, symlinks, oversize, short reads and OS errors produce explicit
ineligibility while process/HTTP evidence remains available. It is an import/work
bound, not a disk-write quota or hard realtime guarantee for all filesystem latency.

`final-file-import-fix/` retains a predeclared owned-filesystem drill, current helper
snapshot, exact FIFO child stdout/stderr and normal/cap/oversize/growth/symlink/directory
observations. The corrected FIFO child returned at about114ms under a1500ms hard
child watchdog. Deterministic post-stat growth beyond2MiB reads only the original
seven bytes, records the change and refuses import. Two auxiliary recorder setup
errors are preserved separately; they are not product failures, model attempts or
evidence of successful observations. The latest importer also refuses short reads immediately and records read-call
counts, bounding read calls to128 as well as bytes to the initial snapshot. Its
pre-hardening repaired sources/gates remain in `qa1-repair-preflight/`; the
file-only drill retains its original collection snapshot. Six regression tests
exercise the current helper directly, including growth and shrinkage. These are additional offline verification subprocesses, separate
from the128 CLI/four Node collection controls counted above.

## Limits, development disposition and next designs

The [coverage ledger](coverage.json) accounts for every previous inventory item.
[Readiness](readiness.json) remains false despite passing local validation.
[Blocked designs and acceptance criteria](blocked-designs.md) explain unresolved
boundaries. Real auth/OAuth/refresh, host IPC/keychain behavior, production model
catalog/prompt/identity, provider-internal retries/billing and independent human
review cannot be established by fake upstreams. No broad filesystem/network/IPC
allowance was added to make a negative probe pass. Direct/no-proxy routing and
builtin nested read-only execution remain unverified on this host.

The [Discussion check](../2026-11-09-discussion-check-completion/README.md) found
five maintainer comments and zero replies, fully paginated. Self-led development
therefore continues under the maintainer's instruction. The absence of a reply does not establish human
approval, an independent review or authorization to lift the live-test hold.
No new Discussion message was sent in this task.

## Reproduce without inference

```bash
npm run evals:runtime:completion:validate
node --test evals/research/runtime/prospective/executor-completion.test.mjs
```

These commands inspect saved native evidence, run pure guards and owned HTTP
regressions; they never start Codex or a model. Default `npm test` and
`evals:runtime:prepared` include these offline tests. Explicit
`evals:runtime:completion:record -- /absolute/path/to/codex /new/archive/path`
collects new owned-local protocol observations only; it refuses an existing
plan. `evals:runtime:completion:record-detached -- /new/control/path` records the
separate fixed detached control. The complete checked-in research archive also
retains development and correction layers; a new collection alone is not a
replacement for those historical artifacts.

`author-validation.json` and its logs record the complete offline gate;
independent QA evidence is added separately. Validation success means the
observations and refusal rules are internally consistent, not that every original
hypothesis passed or that the live executor is ready.
