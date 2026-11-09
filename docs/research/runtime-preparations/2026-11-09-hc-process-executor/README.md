# HC local process execution boundary, revision 1

This preparation implements and tests a real **local subprocess boundary**. It
never runs Codex inference or any provider/model. The authored Node programs are
fixtures; their text is synthetic, while their process exit, timer, filesystem and
socket outcomes are actual local observations. There are no model correctness
rates, semantic reviews, human sign-offs or independent holdout results here.

## Implemented and exercised

- A frozen turn gets a new private scratch root with separate workspace, HOME,
  CODEX_HOME, TMPDIR and XDG config/cache/data directories. Only that turn's frozen
  allowlisted inputs/guidance and exact prompt are exported; no auth, repository
  AGENTS, personal config, installed skills, memories, rules or sessions are copied.
  Scratch export retains the existing traversal/symlink/ancestor/repository guards.
- Environment is built from constants and scratch paths, without inherited PATH,
  provider credentials, proxy, NODE_OPTIONS, DYLD settings or user XDG values.
  macOS CoreFoundation's text-encoding UID is derived locally and recorded; it is
  not inherited personal configuration. OPENSSL_CONF=/dev/null avoids host config.
- The macOS Seatbelt backend denies by default. It allows read-only system runtime
  roots plus **exact canonical loaded Node native files**, the scratch root and
  minimal device files; workspace content is read-only. Writes are confined to
  fresh state/temp directories. Direct socket/network operations, including
  loopback, receive no grant. Unsupported platforms refuse this backend.
- Real local tests assert denied reads of repository and personal/foreign scratch
  data, denied outside writes and workspace mutation, denied symlink escape, and
  denied direct and child loopback connections with zero accepted connections.
  They also assert exact prompt bytes and empty independent state directories.
- The subprocess uses argv directly with shell=false and detached process-group
  creation. Its deadline uses monotonic elapsed time beginning before spawn. A
  deadline/abort sends group TERM, then KILL, then bounds output drainage. Escalation
  persists after leader exit and pipe closure. Local tests prove cleanup of
  TERM-resistant children in the same group, including inherited/closed stdio.
  A leader exiting while descendants remain is a failed attempt, not success.
- Raw stdout/stderr are byte buffers retained as base64 and separate binary files
  with SHA-256, including incomplete UTF-8 and nonzero-exit/timeout partial output.
  Exit, pipe-close, monotonic event times and delivered signals are separate.
  The byte budget is bounded; overflow is explicitly failed/truncated. Chunk
  metadata is bounded too. Evidence writes are exclusive and outside scratch.
- A documented Codex exec JSONL projection retains raw events and message items,
  rejects malformed/late/duplicate/unknown events, and separates terminal completion
  from semantic answer completion. Documented JSONL does not establish responding
  model/provider/reasoning. Observations remain null/UNOBSERVED; intent and local
  CLI metadata are never substituted. All ledgers stop subsequent execution and
  remain ungraded. Model self-description is not identity evidence.

The frozen production deadline remains **900,000 ms**, with 2,000 ms TERM grace
and 500 ms bounded drain. The real local timer tests use 450 ms deadlines and
shorter cleanup intervals, exercising the same implementation. They do not claim
that a 900-second model turn was observed. One primary attempt, zero retries and
the original 81-turn order remain declared; schedule skips/retries are refused.

## What the saved observations establish

`run.json` binds six actual local process observations, their authored fixture
sources, exact raw bytes, exact Seatbelt profile text, launch argv/cwd/scrubbed environment,
policy/runtime/file hashes and the current module hashes. Per-observation files live in `observations/`. The success marker is
synthetic JSONL. Environment, denied-boundary, nonzero/partial, deadline/partial
and orphan-group observations are separate local probes, not model retries.

`local-cli.json`, `codex-exec-help.txt` and `codex-version.txt` retain read-only
inspection of the installed CLI's help/version and binary digest. CLI version
**0.167.0** is local tooling metadata, not a responding model claim. No auth file
was read or copied. No `codex exec` turn was launched.

On this macOS host all integration probes ran. Other systems explicitly skip the
Seatbelt integration tests with an unsupported-platform reason; the portable
parser/declaration/archive/gate tests still run. A skipped integration test does
not establish Linux/Windows isolation. `npm run evals:runtime:process:validate`
checks the saved host observations and current source/raw hashes without creating
any subprocess, and does not re-observe the archived machine state.

```bash
node --test evals/research/runtime/prospective/process-executor.test.mjs
npm run evals:runtime:process:validate
```

The `record` subcommand runs **local Node fixtures only** and requires a new
archive observation directory. Do not overwrite this record. A new implementation
revision requires a new archive; historical frozen plans/results stay unchanged.
SHA-256 anchors detect drift, not authorship, independence or authenticity.

## Live execution remains blocked

There is deliberately **no model launch command**. A separate future argv
builder declares ignore-user-config/rules, fresh ephemeral no-daemon execution,
read-only tools, no bundled/plugin/app/hook/multi-agent catalogs or memories, and
explicit provider request/stream retry limits of zero. Help supports the flags;
this preparation has not observed their effective behavior in a real Codex turn.
A declaration is not proof that a provider/CLI accepted or obeyed it.

Readiness always fails closed on:

1. The unbound model/provider/reasoning, executor review and authorization in the
   existing registration. Human fixture feedback is still pending.
2. A reviewed transport/auth boundary. Deny-all networking cannot perform
   inference. This revision adds no generic network exception, proxy, copied
   token, keychain access or provider client that could silently loosen isolation.
3. Actual Codex prompt/catalog/config/memory observation and final-answer mapping.
   The projected last agent message is retained with a limitation, not assumed to
   be the verified final answer. Availability does not prove guidance was read.
4. Independent identity observation and effective hidden request/stream retry
   control. The argv records intended model/provider/reasoning and zero retry
   overrides; no responding model or effective retry behavior is claimed.
5. Arbitrary process-tree containment. The supervisor cleans the same process
   group; descendants that escape with setsid/detached creation are **not proven
   contained**. Seatbelt permits process operations, mach-lookup, sysctl reads and
   file metadata for runtime compatibility; this is not proof of complete host
   noninterference or isolation against hostile IPC. Runtime library/system reads
   are explicit exceptions, not candidate diagnostic evidence.

Public same-workflow HC candidates remain exposed and non-independent; book
mapping remains unverified. A later reviewed executor revision, registration and
explicit live authorization are required. No frozen study or historical answer,
rubric, score, prototype, shipped skill, public risk code or version changed.

## Primary references

Inspected official documentation and local CLI help support only the declared
interfaces, not unobserved runtime behavior:

- [OpenAI non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode):
  exec JSONL and ignore-user-config/rules; listed JSONL events contain no guaranteed
  responding model/provider/reasoning identity.
- [OpenAI configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference):
  provider request_max_retries and stream_max_retries, memory and configuration
  keys. Effective values require later observation; this study makes no inference
  from defaults about actual retry counts.
- [OpenAI Codex security](https://learn.chatgpt.com/docs/security): sandbox scope
  and runtime controls. Our Seatbelt profile is separately tested local code, not
  an assertion that Codex alone supplies this entire study boundary.
