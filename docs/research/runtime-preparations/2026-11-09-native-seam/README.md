# Native tool execution seam investigation — 2026-11-09

## Decision

A native **experimental remote-environment interface exists and its local control
handshake works** in the pinned Codex CLI 0.167.0. Full client/tool segregation is
**not verified**. Do not describe the native path as impossible, production-ready,
or equivalent to the frozen `codex exec` treatment. No real model request was made.

This completes the interface investigation requested alongside the Docker lease
work. It does not implement a new native remote-environment evaluation runner.
The next implementation would change the launch protocol and requires a separately
registered treatment and the hostile-tool acceptance checks below.

## Observed evidence

The immutable image is the one retained by the preceding
[Docker investigation](../2026-11-09-docker-isolation/README.md):
`sha256:c6de6f9c1b1676f52d2a4e53cf707e95b3c80ad903956e8140ebf3a4b801ebf8`.
All eleven commands in [commands.json](commands.json) used task-owned, automatically
removed containers, `--network none`, non-root UID 1000, read-only rootfs, no mounts,
no capabilities and no-new-privileges. The handshake used a 128 PID limit; help and
schema probes used 64. No host credentials were supplied. Registry/image provisioning
was not repeated. `raw/` retains stdout/stderr bytes and hashes, including failures.

| Probe | Observation | What it establishes |
|---|---|---|
| Native version/help/features | CLI 0.167.0; `exec-server` and App Server experimental | Installed binary capability inventory, not support stability |
| `sandbox linux --help` | Exit 1, bwrap cannot create namespace | Even this invocation entered sandbox setup; no allowed tool ran; not evidence of successful isolation |
| Experimental JSON schema generation | Exit 0, 470 files inventoried with hashes; relevant schemas retained | `environment/add` accepts executor URL/auth; thread start accepts environment selections |
| App Server initialization and `environment/add` | Positive registration acknowledged | Registration alone does not establish connection readiness |
| Correct public token, `environment/info`, `environment/status` | Real executor returned shell/cwd; status `ready` | Actual local executor handshake, without inference |
| Wrong public token, `environment/info` | Actual WebSocket handshake rejected, HTTP 401 | Local executor authentication negative control |
| Missing environment, `environment/status` | `unknown` | Unknown state stays distinct from ready |

The handshake runs both native processes in **one network namespace and UID** with
separate temporary configuration directories. Those directories are not security
boundaries. Public fixture tokens are deliberately non-secret. No `thread/start`,
`turn/start`, shell tool call or malicious-tool isolation test occurs in this probe.
`handshake-probe.cjs` is the exact source passed as the recorded `node -e` argument.
The command has an outer timeout; the probe has request/whole-run deadlines and
kills its child processes before exiting. The Docker command removes the container
on normal completion. These discovery commands are not the durable lease executor.

## Official documentation and local version distinction

Consulted on 2026-11-09:

- [Sandbox prerequisites](https://learn.chatgpt.com/docs/sandboxing): Linux sandbox
  setup needs bubblewrap and usable user namespaces. The earlier pinned image fails
  this setup. This investigation does not weaken seccomp, add privileged mode, or
  change host namespace policy.
- [Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security):
  command network policy and model/authentication traffic are separate surfaces.
  This supports investigating native segregation; it does not certify our image.
- [App Server](https://learn.chatgpt.com/docs/app-server): dynamic tools are experimental
  client callbacks. Adding a dynamic tool does not prove all built-in execution is
  intercepted or disabled; a wrapper is not automatically equivalent to native CLI.
- [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference):
  current published settings were inspected. A missing search match is not proof
  that an internal transport does not exist.
- Context7 `/openai/codex` additionally located upstream `app-server-protocol/src/protocol/v2/environment.rs`,
  `app-server-protocol/src/protocol/common.rs`, `exec-server/README.md` and
  `linux-sandbox/README.md`. These are moving upstream references, not a source
  pin for the installed binary. Conclusions about **0.167.0** instead use its saved
  help, generated schemas and real handshake. The local schema includes
  `EnvironmentAddParams`, `ThreadStartParams.environments`, and experimental tools.

Discovery sequence: official documentation search and retrieval; Context7 lookup;
local pinned-binary inventory; schema generation; positive/negative native
handshake. Documentation lookups used network access; all execution probes were
offline. No fetched prose is treated as measured isolation evidence.

## Remaining acceptance conditions

A separate native App Server treatment could select a remote exec-server through
`environment/add` and thread environment fields. Its controller and model broker
must remain outside the arbitrary-tool security domain. The executor must have no
route, inherited descriptor, shared mount, IPC or Unix socket capability to that
broker. The trusted controller owns any future provider credential and bounded
request budget. Do not put a host Docker socket in either arbitrary-tool domain.

Before accepting that treatment:

1. Demonstrate an actual native shell/tool call in the selected remote environment
   with a local fake model upstream. Confirm no silent local fallback or environment
   switching; missing/disconnected environments must fail closed.
2. Run a genuine allowed tool and a hostile tool which knows the model endpoint,
   public token, request body and identifiers. The allowed tool must execute; the
   hostile tool must not reach the broker or consume its request budget. Probe
   network, inherited descriptors, procfs, environment, IPC/Unix sockets, redirects,
   concurrent and late callbacks. Namespace setup failure is not a passing negative.
3. Cover every enabled execution surface (shell, unified exec, code-mode host,
   MCP/dynamic tools, file operations and child agents), explicitly disabling or
   separately isolating any surface outside that environment.
4. Integrate the durable lease owner and prove cleanup when the client, executor or
   controller dies. Reconcile unknown cleanup before result import. Authenticate the
   control link separately from model credentials; a worker-readable shared token
   does not create isolation.
5. Freeze a new launch protocol and source/model identity record. Preserve the
   existing `codex exec` study unchanged. Only after these gates consider a priced,
   explicitly announced real-model connectivity test.

The present native executor remains **live_ready=false**. Model identity and real
provider authentication remain unverified. Development session model is inherited
from the session; no test model was selected or switched, and no responding model
exists in these authored protocol controls. This is self-led evidence, not
independent human review or real behavioral-evaluation data.

## Offline verification

Run `node docs/research/runtime-preparations/2026-11-09-native-seam/verify.mjs`.
This checks saved raw hashes, command isolation flags, pinned image, expected
observations and exact handshake source binding without Docker or network access.
It is an evidence consistency check, not a fresh security certification.
