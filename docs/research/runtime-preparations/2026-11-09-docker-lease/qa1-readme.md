# Durable Docker cleanup lease — offline research

## Result and scope

A runnable trusted host manager now owns durable Docker job intents, immutable
container identities and cleanup. A separate supervisor automatically restarts a
killed manager; restart conservatively revokes every unfinished lease. Eight
real-Docker controls passed, with 42 daemon-free regression/evidence controls.
This is an offline research service, not an enabled production executor or a
change to the frozen native-CLI study. There were zero real model requests, no
real credentials, and no model switch. The development model is `gpt-6-astra`
from the inherited prior-session summary, not an independently attested runtime
model ID; no test model is bound.

The native tool/model channel remains a separate unresolved boundary. The
[interface investigation](../2026-11-09-native-seam/README.md) established an
experimental App Server environment/exec-server handshake, not separate-domain
tool isolation or equivalence to frozen `codex exec` treatment.

## Design and threat boundary

The host service is trusted. Its private `0700` state directory, Docker socket,
lease heartbeats and cancellation files are never mounted or exposed to workers.
Workers run the previously pinned immutable image with network none, non-root
UID/GID 1000, read-only root, all capabilities dropped, no-new-privileges, no host
binds/devices, finite PID/memory/CPU/tmpfs resources, and no Docker restart policy.
The public random ownership label is identity metadata, not an authentication
secret. A hostile host user with Docker access is outside this boundary.

Before `docker create`, the manager atomically writes and fsyncs a lease intent
and a `create_attempted` journal. A full returned ID is inspected against the
unique lease label/name, image and complete outer isolation policy. The manager
persists the ID and creation time before `start`. Signalling/removal always uses
the full inspected ID; name-only signalling, force removal, global prune and
broad privilege changes are absent.

A fixed wall deadline and in-process monotonic duration cannot be extended by
heartbeats. Increasing heartbeat sequence numbers only demonstrate current
launcher liveness; replay or a heartbeat arriving after the liveness deadline
cannot revive the job. Launcher loss therefore means cleanup after bounded
heartbeat expiry, not immediate PID polling. PID reuse is irrelevant to this
contract. Significant backward wall-clock movement revokes work. On restart,
unfinished leases are revoked without trying to reconstruct monotonic time.

The supervisor and manager are distinct host processes. A kernel-owned loopback
TCP bind derived from the canonical state path prevents concurrent managers; it
has no command protocol and releases on process death. A port collision fails
closed. The supervisor has a separate lock and restarts the manager after 250 ms.
Only trusted host components can reach the state directory; the worker has no
host network route. This is not authentication against other trusted-host users.

Cleanup inspects ownership, requests stop with one second grace, checks running
state, escalates to KILL if needed, checks again, removes only a stopped container,
and confirms exact-ID absence. Every Docker call has a four-second command
budget and at most one extra second for pipe teardown. An attempt uses at most
eight calls (40 seconds in the worst timeout case). Four active leases cap
serial cleanup work at 160 seconds per reconciliation pass, excluding new-job
admission and local filesystem stalls. These are available-control-plane command
bounds, **not** a four-second global lease-to-absence guarantee. No promise is
made while the host is off, its filesystem stalls, or Docker is unavailable.

An unavailable daemon, ambiguous/forged identity, or unconfirmed termination
leaves `cleanup-pending`, never successful import. Lost create acknowledgement is
resolved using the durable random lease label. If no matching container appears
after an in-flight create, the lease stays pending: an empty listing cannot prove
the daemon will not complete that create later. A later owned container is then
identified and removed. Invalid/corrupt persisted journals fail closed and need
operator repair; arbitrary identity reconstruction is not attempted.

## Recorded controls

All workload processes are authored offline fixtures. `detached` starts children
and grandchildren in separate sessions, closes their stdio, ignores TERM, and has
a 20/30-second fixture-only fallback. The service controls completed before that
fallback; raw worker PID/stat output is retained for launcher/deadline/restart
cases. The lifecycle observations are real Docker behavior; these are not model
answers and are ineligible for the 81-response study.

| Control | Evidence and conclusion |
| --- | --- |
| Launcher loss | Separate heartbeat launcher receives SIGKILL; surviving manager expires the lease and confirms absence in under 10 seconds. |
| Absolute deadline | Healthy increasing heartbeats continue; fixed deadline still revokes work. |
| Automatic manager restart | Manager receives SIGKILL; independent supervisor starts a new PID, which revokes the running lease and confirms absence. |
| Lost create response | Real Docker create succeeds; adapter deliberately hides its acknowledgement. Label discovery finds and removes the created container without starting it. |
| Daemon outage/recovery | Adapter injects command failure while actual daemon remains running. State remains pending, then real commands reconcile and remove the container. No unrelated Docker service is stopped. |
| Concurrent sentinel | Two distinct owned jobs run; cancellation removes one while inspection proves the other remains running. The sentinel is subsequently explicitly cancelled. |
| Expired intent | Stale durable request is rejected without any container create. |
| Late create | Simulated restart journal initially has no container and stays pending. A real delayed create then appears and is reconciled/removed. |

The concurrent sentinel is a separate task-owned lease, not a user's container.
Unrelated-label/ID refusal, ambiguous discovery, all-signals-fail, fake successful
removal, clock rollback, stale/replayed heartbeat, active-job cap, symlink/corrupt
journals and evidence mutation are deterministic adapter/unit controls. They are
not described as real daemon failures. No user's workload was altered.

## Evidence and failed attempts

- `observations/`: final eight-case run, per-job private journals, raw Docker argv,
  exit/signal/deadline metadata and exact stdout/stderr bytes encoded as base64,
  supervisor lifecycle logs, worker process logs, and SHA-256 inventory.
- `development-absence-prefix/`: first attempt failed because this CLI uses
  `error: no such object:`. The container was removed, but the narrower parser
  retained pending state. The repair accepts both known anchored error prefixes
  and requires the exact requested full ID. The failed archive remains intact;
  `failure.json` is a later explanation outside its original inventory.
- `development-prehardening/`: successful first full run before extra journal
  validation and semantic archive checks; preserved rather than overwritten.
- `development-model-provenance/`: same successful eight controls before correcting
  the recorder's overly strong model-provenance wording; source was prior-session
  summary, not fresh system attestation.
- `development-before-missing-id-guard/` and `development-validation*`: successful
  controls/gates before adding a nonexistent forged journal-ID regression. An
  absent recorded ID now also triggers label discovery, preventing a corrupted
  ID from hiding a still-present owned container.
- `final-sources/`: exact lease implementation/test sources for the final run.
- `validation/` and `author-validation.json`: complete offline command records.

The archive checker enforces all eight unique boundaries, inventory hashes,
per-case/state agreement, unique job IDs, policy-bound inspections, exact command
targets, removal and final absence evidence, actual supervisor SIGKILL/restart
records, and simulated-fault distinctions. Hashes detect drift, not independent
provenance or cryptographic attestation. All evidence and review in this workflow
are maintainer/agent authored, not independent external verification.

## Reproduce and operate

Daemon-free saved-evidence check:

```sh
npm run evals:runtime:lease:validate
node --test evals/research/runtime/prospective/docker-lease.test.mjs
```

Opt-in real-Docker fake-workload drill (requires the already provisioned immutable
image; never pulls an image or calls a model provider):

```sh
npm run evals:runtime:lease:record -- /private/tmp/new-lease-drill \
  sha256:c6de6f9c1b1676f52d2a4e53cf707e95b3c80ad903956e8140ebf3a4b801ebf8
```

The production-shaped host entry point is runnable directly from the checkout.
Use a new private directory outside the repository for operational state:

```sh
mkdir -m 700 /private/tmp/brooks-lease-service
node evals/research/runtime/prospective/docker-lease-service.mjs supervise \
  /private/tmp/brooks-lease-service
```

From another trusted terminal create an offline detached-fixture lease:

```sh
node evals/research/runtime/prospective/docker-lease-service.mjs create \
  /private/tmp/brooks-lease-service \
  sha256:c6de6f9c1b1676f52d2a4e53cf707e95b3c80ad903956e8140ebf3a4b801ebf8 \
  30000 5000
```

The returned token identifies files and subsequent `heartbeat STATE_DIR TOKEN
SEQUENCE` / `cancel STATE_DIR TOKEN` commands. Heartbeat at intervals below five
seconds with increasing integer sequence values. The lease expires at 30 seconds
regardless. Observe `TOKEN.state.json`; only `phase=complete` with
`absence_confirmed=true` is successful cleanup. Never delete unresolved journals
or create a replacement directory to bypass them. SIGTERM to the supervisor asks
the manager to revoke current jobs; on unavailable Docker, retain the directory
and restart the supervisor for reconciliation.

For unattended deployment, an OS service manager must own `supervise`, restart it
if it dies, and start it at login/boot after Docker availability. The supplied
`launchd.plist.example` is a template only: substitute absolute Node/checkout/state
paths, lint it, then deliberately install under an appropriate service account.
The local drill tests the implemented supervisor's automatic child recovery;
**it does not install or verify a permanent launchd service, host reboot recovery,
Docker daemon restart, suspend/resume, or power-loss durability on this host**.
The template is not a claim those deployment gates passed. Killing both the
supervisor and manager requires an OS service manager or an explicit restart.

## Author verification

All 22 final offline commands passed, including repository validate/test/structural
evals, prepared runtime checks, every existing saved execution archive, parser
benchmark, native-seam evidence verification and launchd plist syntax. The final
main Node test suite has 661 tests, in addition to 222 helper checks and six
provider tests. The lease adds 42 daemon-free controls. Final measured launcher
loss to absence was 2,687 ms; manager SIGKILL to automatic restart and absence was
1,611 ms. These are observations of this local drill, not universal latency SLAs.
`final-owned-container-check.json` confirms no lease-labelled containers remain.
The prior 22-command gate is preserved in `development-validation*`; it predates
the final nonexistent-ID regression. Subsequent QA verdicts are recorded separately.

## Real-test gate

No real tests are authorized by these offline results. Before a real run, name
the economical model, provider/channel, exact call count and budget cap, freeze
requested/reported identity and authentication handling, and record any model
switch. Do not substitute an experimental App Server treatment into the frozen
native CLI comparison. Native separate-domain tool execution, actual provider
authentication/model identity, and OS-supervised deployment remain separate gates.
