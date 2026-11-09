# Remaining isolation designs and acceptance gates

These are designs, not implemented or verified capabilities. The current Docker
recorder must not be promoted to a live executor simply because its finite probes
pass. Model identity/authentication registration remains separate.

## Durable cleanup lease

**Observed problem:** Killing the host Docker attachment leaves the owned job and
its detached descendants running. Normal try/finally cleanup is insufficient.

**Proposed design:** A persistent control-plane service, separate from the short-lived
request launcher, creates the container and stores its immutable ID, unique owner
label, image digest, birth identity, monotonic deadline and explicit lease state
before allowing work. Only this service holds Docker socket access. A worker can
neither extend its lease nor access the Docker socket. Heartbeats from the trusted
launcher can demonstrate liveness but cannot extend the already frozen absolute
deadline. Expiry, launcher death or explicit cancellation triggers stop/KILL,
bounded inspect/wait and removal. Evidence stays pending until stopped/absent is
confirmed. On service restart, it reconciles only its own durable IDs and labels;
uncertain identity is quarantined rather than signalling unrelated workloads.

A watchdog inside the same user/security domain as arbitrary tools is not a
sufficient implementation: tools could kill or spoof it. A persistent host service
also needs a service-manager restart policy and a power-loss/restart reconciliation
contract; no userspace design can promise wall-clock cleanup while the host is off.
Docker daemon unavailability is a recorded unresolved state, not successful cleanup.
A container PID1 fallback can bound a cooperative fixture but does not replace the
separate trusted lease owner unless tools cannot kill or modify that owner.

**Acceptance:** Kill the launcher before/after create acknowledgement, while the
CLI streams, and after a descendant detaches. Kill/restart the lease manager and
make the daemon unavailable/recover. Verify every owned ID reaches stopped/absent
within the specified *available-control-plane* bound; unknown cases block import.
Include expired/replayed heartbeat, forged label/ID, concurrent jobs, PID/name
reuse, lost create response, stale journals and unrelated-container sentinels.
Retain two QA rounds and every failed attempt. No global prune or name-only kills.

## Native client/tool segregation

**Observed problem:** Native CLI and shell tools share one network namespace;
outer Docker isolation stops external egress but does not distinguish which
process is calling a local broker. A shared token does not solve this.

**Proposed native path:** Establish a supported native tool-execution boundary
that places every arbitrary tool in a separate no-network security domain, while
the trusted model client alone owns the broker channel. The worker receives only
an immutable allowlisted workspace and bounded result channel. The broker lives
outside the tool domain, owns any future credential, and enforces frozen request
and retry budgets. The result channel cannot be used as a transport capability.
Do not assume an undocumented CLI interception seam or substitute a custom
adapter under the frozen native-CLI study. First identify and review a supported
seam; otherwise this native path remains blocked. Broad privileged Docker,
seccomp-unconfined or host networking is not an acceptable fix for `bwrap` failure.

**Alternative path:** Continue the separate controlled-read adapter with no
arbitrary shell. Implement a documented production transport, explicit credential
lifecycle and source-specific identity records under a newly frozen protocol and
study registration. This measures a different treatment and cannot reuse native
CLI results as if equivalent.

**Acceptance:** A genuine native model-client fixture request succeeds while a
fixed malicious tool knowing endpoint, public token, exact body and turn identifiers
cannot connect or consume request budget. Probe inherited descriptors, environment,
procfs, IPC, file/Unix sockets, redirects and concurrent/late callbacks. Verify the
tool cannot read auth material or reach parent transport through another route.
A positive allowed tool and negative access controls must both actually execute;
namespace setup failure is not denial evidence for a running tool. No live call
until this boundary, lease cleanup and credential channel have their own evidence.
