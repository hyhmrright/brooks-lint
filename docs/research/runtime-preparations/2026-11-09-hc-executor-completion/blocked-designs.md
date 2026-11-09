# Blocked executor designs and acceptance criteria

All entries retain Symptom → Source → Consequence → Remedy. These are research
implementation limits, not changes to shipped risk scores or findings about a
model. `readiness()` deliberately refuses even supplied registrations claiming
success; offline tests exercise that refusal.

## Hostile tool/client segregation

**Symptom:** The CLI and its tool descendants inherit the same allowed broker TCP
port. A caller with the exposed fixture token and matching request fields can
consume the broker's primary budget.

**Source:** An HTTP header, loopback address, fresh home or public token does not
establish OS process ownership. Turn binding detects accidental misrouting, while
tools share the process network authority. The one-port profile is tested outer
containment; it is not a model-client identity mechanism.

**Consequence:** A malicious tool could impersonate the model transport or consume
its budget. The successful curl/HTTP controls cannot justify using real provider
credentials or treating the current CLI as a reviewed live executor.

**Remedy/design:** Keep the live launch entrypoint unavailable. A later design
must put provider transport in a separately owned process/security domain and
use an OS-enforced client/tool distinction, not a secret copied into the same
CLI/tool address space. Candidates include separate VM/container/OS principals
with per-process sockets, or a reviewed client adapter in which tools never
inherit the transport endpoint/handle. The current installed native CLI does not
provide a tested seam for that substitution. A future alternate adapter must have
its own reviewed registration; frozen study inputs/arms/prompt must not be silently
changed to make a tool-free executor appear equivalent.

**Acceptance criteria:** Positive native client call succeeds; hostile fixed tool
with known public token and exact body fails before forwarding; tools cannot access
transport handles, parent-only credentials or the allowed socket through other
routes; concurrent/late calls cannot steal another turn; one-primary budget holds;
all relevant OS policy, raw denials, positive controls and cleanup are retained.
Host-wide IPC/credential noninterference still requires its own evidence.

## Detached hostile descendants

**Symptom:** Same-group cleanup is verified, but a new session/process group is
outside that ownership. The nested Node experiment failed withEPERM before its
child ran; the direct trusted-parent control succeeds only for its known child.

**Source:** A process-group guardian owns one group, not every future descendant.
Polling a process tree and later signalling numeric PIDs introduces discovery and
PID-reuse races. Cooperative self-expiry is a fixture failsafe, not an adversarial
containment primitive.

**Consequence:** A hostile setsid descendant could outlive the deadline even while
the original group is absent. No universal descendant cleanup claim is valid.

**Remedy/design:** Retain readiness refusal until an OS-owned job/container/VM
boundary can be created before launching the CLI, containing future children even
when they detach. Existing local Seatbelt denial and trusted parent handle controls
are useful narrow observations, not such a job boundary. Do not discover and kill
unrelated processes or broaden host privileges to fabricate a positive result.

**Acceptance criteria:** A fixed adversarial fixture can detach/setsid, ignoreTERM,
close inherited stdio and fork a child; the containment owner remains authoritative
until all bounded descendants are nonrunning. Owner death cleans the boundary;
unknown cleanup blocks imports. Observe owned identities without PID-reuse signalling,
retain two cleanup QA rounds, and prove no owned survivors or unrelated kills.
Use self-expiry only as an independent experimental fallback, never as the claimed
containment mechanism.

## Host-specific nested sandbox and direct routing

**Symptom:** Builtin read-only tool launch fails at nested `sandbox_apply`; prior
stripped-proxy/no-proxy native attempts route toward the host system proxy, which
the outer sandbox denies.

**Source:** These are observed host/runtime interactions. No safe new native
configuration is currently established to change them. The curl public-config
correction fixes a separate initialization failure; it does not fix either issue.

**Consequence:** Outer inner-disabled tool controls and explicit owned-proxy TLS
success cannot be extrapolated to builtin read-only or direct/no-proxy execution.

**Remedy/design:** Preserve failure evidence, use the tested owned proxy for local
fixtures, and keep alternate modes unverified. Repeating identical failed variants
adds no evidence. A fresh isolated host or a documented native runtime change could
be studied later; removing outer containment, using host credentials or installing
system-wide CA/proxy changes is outside this task.

**Acceptance criteria:** Real native tool runs under builtin read-only plus unchanged
outer policy with positive and negative filesystem/network controls; direct-routing
case reaches only owned endpoints with explicit connection evidence and no proxy
attempts. The frozen protocol/model plan is registered separately before any live run.

## Production and independent-review limits

**Symptom:** All new answers and identifiers are authored fixture data; no external
participant has reviewed the pair.

**Source:** Local fake upstreams contain no real inference/authentication, provider
internal work or independent authorship. Native JSONL and matching model strings
are not authenticated provider identity.

**Consequence:** No new model-quality improvement, provider-auth safety, billing,
production TLS, independent holdout or human agreement can be inferred.

**Remedy/design:** Keep model/backend identity null, all model-study turns not-run,
no semantic grades, and each production/host limit explicitly unverified. Maintainer
self-led development can continue without a Discussion reply. Future real runs need
explicit authorization plus reviewed executor/identity/auth registration. External
case contributions remain welcome with exposure/custody disclosure; cannot be
retroactively called blind after public development exposure.
