# HC bounded termination confirmation, process revision 2

This is a separate correction and offline validation archive. It preserves all
27 files of the [earlier process preparation](../2026-11-09-hc-process-executor/README.md),
including both failed QA rounds, the exact failing output and six original local
observations. Their statuses and bytes are unchanged. No live model/provider test
is run, and no past failure is reclassified as a zombie without evidence.

Symptom → The full test gate saw a descendant PID still visible after KILL.
Source → Revision 1 waited a fixed interval without checking termination state;
PID visibility did not distinguish a running process from an unreaped zombie.
Consequence → Signal delivery alone could not justify verified cleanup, and the
required test failed. Remedy → Revision 2 keeps group ownership while signalling,
uses bounded asynchronous process-state confirmation, explicitly defines zombie
policy, and fails closed when confirmation remains unavailable.

## Corrected lifecycle

A fixed trusted Node guardian is the process-group leader. The Seatbelt fixture
runs as its child in the same group; guardian and fixture PID/exit are recorded
separately. The guardian remains alive after fixture exit and ignores TERM, holding
the group identifier until group KILL or a parent-only normal-finish message.
Signals are sent only while the guardian is the parent's live, unreaped child.
After ownership ends the supervisor sends no further group signal; unexpected
loss is a failed result. It never uses an arbitrary descendant PID to signal.

The guardian is trusted supervisor code outside the fixture sandbox, not a model
or tool. Its source is fixed, hashed and archived. The fixture has only stdin,
stdout and stderr; it does not inherit the guardian IPC/control descriptor or
NODE_CHANNEL_FD. A fixture's JSON stdout cannot spoof fixture lifecycle messages.
If the parent-only IPC disconnects unexpectedly, the guardian kills its own still
owned group. Normal release sets a separate finish flag and exits 0, without
entering that emergency disconnect path. Guardian loss is tested from a trusted
parent ChildProcess handle, not inferred from a fixture's attempted host signal.

The fixture's fresh HOME/CODEX_HOME/XDG state, exact frozen workspace, scrubbed
environment and deny-default Seatbelt profile remain recorded. Direct network,
foreign/repository/config reads, outside writes and workspace mutation are still
blocked in local integration probes. Runtime process/mach/sysctl/metadata grants
remain explicit exceptions; this is not proof of hostile host noninterference.

## Confirmation policy and deadline

The model deadline declaration remains **900,000 ms**, measured monotonically
from guardian launch before any answer bytes. Default cleanup has one shared
budget of **4,000 ms**: 2,000 ms TERM grace + 1,500 ms confirmation + 500 ms drain.
The budget begins with the first cleanup inspection or stop; earlier inspection
consumes that same budget. OS probes do not receive an extra unlimited window.

Parent-side `/bin/ps -g <owned-group> -o pid=,ppid=,pgid=,stat=,lstart=` runs
asynchronously with at most 200 ms per probe and the remaining shared budget.
Output is bounded. A timed out/spawn-failed/malformed/foreign-group result is
unknown; the probe child is killed only while its own ChildProcess remains live.
The inspected local macOS ps returns exit 1 with empty stdout/stderr for an empty
group; other nonzero outcomes remain errors. Raw probe bytes, fields and timing
are retained. Process-start text is provenance, not a kernel identity guarantee.

| Observed state | Interpretation and policy |
| --- | --- |
| `running` | At least one non-zombie descendant; cleanup is unconfirmed. |
| `guardian-only` | Guardian still owns the group, no running descendant; normal release may be requested. |
| `absent` | Guardian has exited and no same-group member is observed; confirmed. |
| `zombie-only` | No guardian or running member, only `Z` members; confirmed **non-running, unreaped** under the explicit policy. |
| `unknown` | Probe error/timeout, unsupported state or ownership inconsistency; never confirmed. |

After TERM/KILL, confirmation polls until `absent` or `zombie-only` within the
shared bound. A sample arriving after the deadline cannot pass even if it says
absent. Running/unknown at the bound fails; prior completed observations survive
an eventual hung probe or total-budget expiry. Delivered signals, confirmation
state, running members, zombies and raw probe evidence are separate fields.
This policy does not claim reaping of zombies or determine the earlier failure's
actual state. The previous PID-only assertion is replaced by group-state evidence
and deterministic tests that reject genuinely running or unknown cleanup.

Confirmed termination is followed by stdio close or a bounded drain within the
same budget. Unclosed pipes/drain expiry are explicit and cannot count as normal
success. Raw stdout/stderr bytes remain unchanged, including incomplete UTF-8,
nonzero-exit and interruption partials. Tests preserve a large successful byte
stream and a bounded atomic output tail written during TERM handling. A single
nonblocking writeSync is not assumed to write an arbitrarily large buffer.

JavaScript and OS scheduling are not hard real-time guarantees. Actual monotonic
elapsed times and budget overruns are retained, and late/unresolved observations
fail closed. Same-group confirmation does not contain detached/setsid descendants;
that remains a live-executor blocker.

## Evidence and regressions

`run.json` and `observations/` hold eight new actual local process observations
with authored fixture text: success marker, environment/IPC boundary, denied
boundaries, partial nonzero exit, deadline, open/closed-stdio orphan groups, and
TERM trailing bytes. Intended model/provider/reasoning remain unbound; observed
model identity remains null. All ledgers stop and remain semantically ungraded.
These are not model responses or evidence of skill improvement.

The tests include injected running → delayed disappearance transitions,
zombie-only versus mixed/running states, errors/timeouts and late absent samples;
a hanging probe with retained earlier observations and a bounded supervisor
result; large byte output and TERM tails; abort/pre-abort; control-channel spoof
resistance; unexpected guardian loss; parent IPC disconnect; and four predeclared
parallel open/closed-stdio orphan cases. These stress repetitions are local
process scenarios, not retries of failed model turns. Short local deadline tests
use 900 ms to allow guardian startup while exercising the same timer path.

The local integration backend is macOS only. Unsupported platforms refuse it;
actual OS probes explicitly skip there. Pure classifier, deadline, parser,
registration and archive checks remain portable. This does not verify Linux or
Windows isolation.

## Historical and current source binding

`prior-archive-inventory.json` is itself anchored by a literal digest in the
current validator. It checks all 27 original file paths/bytes. The three exact
old modules in `prior-source-snapshots/` match the original run's source digests;
they are read as bytes only, never evaluated or imported. The historical run also
has a pinned digest. Accepting that historical source revision does not relax
current-source drift checking or retroactively clear failed QA.

The four current modules, including the guardian, are separately frozen in
`source-snapshots/` and bound to `run.json`. Current validation requires those
bytes to match both the current implementation and this run. New code changes
require another explicitly versioned archive rather than rewriting either run.
Hashes detect drift, not authentic authorship or independent review.

```bash
node --test evals/research/runtime/prospective/process-executor.test.mjs
npm run evals:runtime:process:validate
```

The second command validates both historical and current archives offline without
starting a child. Recording is a separate local-fixture-only command and refuses
existing observations. The original study anchors, guidance, scores and answers
are unchanged. Public same-workflow cases remain exposed/non-independent, book
mapping remains unverified, human review remains pending, and real model execution
still requires reviewed transport/auth/config/catalog/retry/identity/final-answer
controls and later explicit authorization. There is no live launch entrypoint.

## Author boundary correction retained

`author-pre-boundary-correction/` preserves the first revision-2 author attempt,
its eight observations/sources, 29-test focused PASS and 479-main-test full PASS.
A later concrete self-review correction separates the primary fixture deadline
from its already-started cleanup budget: trusted fixture termination before the
primary deadline clears that timer; slow bounded confirmation cannot manufacture
a model timeout. A late abort after normal guardian release records interruption
without any further group signal, even before the guardian exit callback arrives.
Normal success also requires the guardian's expected exit 0 and complete drainage.
Two dedicated injected-observation regressions cover these boundaries. The author
attempt's anchored inventory is checked as retained history, not represented as
validation of the final implementation. No original failed QA record was changed.
