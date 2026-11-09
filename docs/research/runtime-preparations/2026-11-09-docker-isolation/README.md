# Docker startup and native CLI isolation observations

## Outcome and scope

On 2026-11-09 Docker Desktop was started with the maintainer-authorized
`docker desktop start --timeout 45`. The baseline API socket was absent; the start
command exited zero and the server subsequently reported version 29.9.2. Existing
Confer containers resumed through their existing policies; none was changed,
stopped or removed. Docker remains running. Exact startup/baseline command streams
and timestamps are in [host/](host/).

The task built a dedicated Linux arm64 image from official
`node:22-bookworm-slim@sha256:5ec23b7c622b00547753bc6ffd78085dd868a68aeb41c8e0a1418f033e13d96d`
and pinned npm `@openai/codex@0.167.0` with scripts disabled. Package integrity,
build output, image IDs and Dockerfile are in [provision/](provision/). Registry
access was used for provisioning only; no inference provider was contacted. The
recorded final immutable image ID is
`sha256:c6de6f9c1b1676f52d2a4e53cf707e95b3c80ad903956e8140ebf3a4b801ebf8`.
The image and downloaded layers remain cached for reproducibility; no prune ran.

All inference traffic used authored HTTP/SSE inside task-owned `--network none`
containers. No host directory, Docker socket or credential was mounted. Each ran
as UID/GID 1000, with a read-only root, all capabilities dropped,
`no-new-privileges`, 64 PID limit, 512 MiB memory, one CPU, restart disabled and
bounded writable tmpfs directories. The model name, answers and usage are fake.
**Real model calls: 0; real credentials: 0; actual responding model: null;
live ready: false; study-eligible answers: 0.** No model switch occurred; development
session `gpt-6-astra` is known from system context, not service attestation. Future
real calls require communicating the concrete economical model and budget first.

## Six final controls

[observations/](observations/) retains 64 exact Docker command records with stdout,
stderr, timestamps, exit/signal, output bounds and per-case cleanup evidence.

| Control | Observed result and meaning |
| --- | --- |
| Native CLI answer | Codex CLI 0.167.0 makes one local request and completes the authored answer. This proves Linux CLI wiring, not model performance. |
| Native builtin read-only tool | CLI completes its synthetic final response, but its tool fails: `bwrap` cannot create a user namespace. Zero tool HTTP requests. CLI exit zero is not tool success; nested sandbox support remains unverified. No privileges or seccomp rules were relaxed to make it pass. |
| Outer-container-only tool | With the inner CLI sandbox disabled only inside the unchanged outer container, the actual tool runs. UID1000, no auth environment names, no host mount/socket, root write EROFS, tmpfs write succeeds; a connection to documentation-only 192.0.2.1:9 fails ENETUNREACH. The tool **can reach the same local model broker**. This is a negative client/tool separation result, not safe production auth. |
| Detached descendants | Fixed child and grandchild create new sessions, ignore TERM and close inherited stdio. Their PID/session evidence and Docker process listing are retained. TERM leaves container running; Docker KILL causes state Running=false/Pid=0/exit137 and `top` refuses a stopped container. Then removal and absence are confirmed. |
| Container PID1 exit | PID1 records the detached descendants and exits. Docker reports stopped/Pid0; subsequent process listing fails and the container is removed. This is container lifecycle ownership, not host-supervisor ownership. |
| Host launcher death | The owned host `docker start --attach` process is killed by the bounded supervisor. The container remains running, including detached descendants. Root orchestration explicitly TERM/KILLs and removes it. **Docker does not automatically clean up merely because the host launcher dies.** |

The detached fixtures include 20/30-second self-expiry fallbacks, but observed
stops/removals happened before those fallbacks and are not attributed to them.
This is finite fixture coverage, not proof against kernel/container escapes or
all malicious code. No host PID discovery/signalling was used for container
children; only recorded full Docker IDs with expected labels/policies were acted on.

## Diagnosis and remaining work

- **Symptom:** Tools can reach the CLI's broker in the outer-only case.
  **Source:** Both inherit the same network namespace and endpoint authority.
  **Consequence:** Moving the whole CLI into Docker does not isolate credentials
  or prevent tool impersonation. **Remedy:** Keep production launch disabled;
  require separate enforced client/tool domains or a reviewed restricted adapter.
- **Symptom:** Host launcher SIGKILL leaves the container running.
  **Source:** Docker daemon owns the job independently of the client process.
  **Consequence:** A host-supervisor crash can outlive its deadline.
  **Remedy:** A separately owned watchdog/lease manager needs bounded destruction
  and restart reconciliation before live execution. Current normal orchestration
  cleanup is tested; automatic crash cleanup is not implemented.
- **Symptom:** Builtin read-only tool cannot create its namespace.
  **Source:** The current unprivileged Docker runtime rejects `bwrap` setup.
  **Consequence:** Inner native sandbox compatibility is not established.
  **Remedy:** Preserve this negative result; do not grant broad privileges or claim
  equivalence to the frozen study. Investigate a documented separate runtime seam.

Concrete [next designs and acceptance gates](next-designs.md) cover a durable
cleanup lease and native client/tool segregation; neither is claimed implemented.

Production OAuth/refresh, verified responding-model identity, provider-internal
retry/billing and complete host IPC/keychain isolation remain unverified. No
outside review is required to keep developing, but self-led/model-assisted QA is
not independent human validation. The nine-case 81-turn study remains untouched.
These are synthetic protocol/process controls, not those study turns.

## Development attempts and evidence policy

`development-wrong-image-id/` preserves five failed creates: the initial build
config digest was not Docker's exposed image ID. No containers were created.
`development-absence-case/` preserves five subsequent controls whose actual
containers were removed, but whose recorder wrongly treated Docker's lowercase
`no such object` message as unconfirmed cleanup. The final collector corrects
that case-sensitive interpretation and adds the launcher-death and egress controls.
No unsuccessful collection was silently replaced or counted as successful.

Archived source snapshots are the sources at collection time. The later validator
adds semantic checks without changing any raw observations. Current code validates
command bytes, launch policy, native request/response hashes, actual tool results,
negative boundaries and stopped/absent states. It never executes saved source.
Checksums ensure internal evidence consistency, not independent provenance.

Docker CLI commands are bounded by a host timer and combined output cap; unknown
command drainage or cleanup fails validation. Container removal uses recorded IDs
and checks ownership first. This supervisor is a research recorder, not a durable
crash-recovery service. Sources, author gate logs and two QA rounds (when needed)
are retained separately. No release/tag is requested.

## Reproduce

```bash
npm run evals:runtime:docker:validate
node --test evals/research/runtime/prospective/docker-isolation.test.mjs
```

These are daemon-free and perform no native CLI/model runs. Explicit
`evals:runtime:docker:record -- /new/archive/path sha256:<local-image-id>` starts
owned containers and refuses an existing path. Provision the pinned image first;
no mutable tag is accepted by the recorder. Full checks and raw logs are under
`author-validation.json` and `validation/`.

Documentation checked: [Docker Desktop start](https://docs.docker.com/reference/cli/docker/desktop/start/),
[Docker none network](https://docs.docker.com/engine/network/drivers/none/),
[Codex CLI](https://learn.chatgpt.com/docs/cli). Runtime conclusions above come from
saved observations, not assumptions from these references.

## Final verification and QA disposition

[QA round 1](qa-round1/report.md) failed because the archive validator accepted
duplicate cases even with the negative controls omitted. The original evidence
and failure reproduction are preserved. [Remediation](remediation.md) adds exact
case coverage, command partition and identity bindings; all 18 post-repair offline
commands passed. The machine-readable `qa1-preservation.json` verifies all 469
original author artifacts through explicit preservation paths.

[QA round 2](qa-round2/report.md) passed all four final gates: repository
validation, full tests, structural evals and Docker archive validation. Full tests
passed 222 helper, 6 provider and 619 main tests; the latter includes the 39 Docker
regressions, which must not be added again. Structural evals cover 64 scenarios;
the Docker archive contains six distinct controls and 64 command records. The
original QA bypass now fails, and final source snapshots and original evidence
preservation were verified. These offline results do not lift the live-test hold
or resolve the three negative isolation findings above. No additional native
CLI, Docker control or model execution was performed during remediation or QA.

## QA1 remediation

[QA1](qa-round1/report.md) found a duplicate-case coverage bypass despite green
automated gates. The [repair](remediation.md) enforces complete unique case/command
coverage and cross-artifact identity; 11 mutation regressions were added.
[Preservation mapping](qa1-preservation.json) verifies all 469 original author
artifacts, with relocated old final sources and README explicitly mapped.
The unchanged QA reproduction now rejects the tampered archive; its repair-time
stdout/stderr and result are retained. No native CLI or Docker cases were rerun.
