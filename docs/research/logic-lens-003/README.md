# 003 · Concurrent Java timestamp formatting

Each completed invocation of `TimestampFormatter.format(when)` should return the text that the same library would produce for that input in isolation, with the same pattern and configuration. The upstream signatures differ. The original takes a `Date` and shares one `SimpleDateFormat`. The fix takes a `LocalDateTime` and shares one immutable `DateTimeFormatter`. Each is compared with its own sequential behavior. [Contract](contract.json) · [Pinned upstream sources, metadata and license](upstream) · [Upstream revision](https://github.com/hyhmrright/logic-lens/tree/3b158e228127e21bff7be6530e3923de0793a907/evals/real-world/probes/003-shared-dateformat-thread-unsafe)

## A schedule that distinguishes the two sources

The replay first calls A and B separately, then repeats the calls with A paused inside the JDK while B runs to completion. Both requests use midnight UTC and the JVM runs with US English defaults. The local run used Temurin OpenJDK 21.0.13.1 on Darwin/arm64 and Lean 4.19.0. Linux CI uses OpenJDK 17.

| Request | Isolated result in both versions | Overlap with shared SimpleDateFormat | Overlap with DateTimeFormatter |
|---|---|---|---|
| A · January 1 | `2000-01-01 00:00:00` | `2000-01-02 00:00:00` | `2000-01-01 00:00:00` |
| B · January 2 | `2000-01-02 00:00:00` | `2000-01-02 00:00:00` | `2000-01-02 00:00:00` |

The Java Debug Interface suspends only A. In OpenJDK's legacy implementation the breakpoint is at entry to the first `subFormat`, after `calendar.setTime(date)` and before the first pattern field is rendered. B overwrites the same calendar. In the fix the breakpoint is at `formatTo`, with A's own temporal argument. The driver waits until B has emitted its completed result before resuming A. Both targets compile from unchanged upstream bytes. The JDK checkpoint names are implementation-specific. [Scheduler](Schedule.java) · [Caller](Overlap.java) · [Recorded results and digests](results.json) · [OpenJDK legacy implementation](https://github.com/openjdk/jdk17u/blob/master/src/java.base/share/classes/java/text/SimpleDateFormat.java)

## Proof and assumptions

The checker admits two complete class forms with the specified imports, field, pattern and method body. A model event begins or finishes a distinct invocation. The legacy model writes each input into a shared calendar, then reads that calendar when rendering. Lean checks a reachable state after A begins, B begins, B finishes and A finishes, in which A returns B's text. This witness uses an overwrite before any fields are read. A single witness suffices even though other interleavings may swap only some fields or throw. [Matcher](../../../skills/brooks-verify/scripts/verify_date.py) · [Model](../../../skills/brooks-verify/scripts/DateConcurrency.lean) · [Counterexample certificate](certificates/buggy.lean)

In the fixed model the pending slot for each invocation holds its own input. Starting or finishing another invocation preserves that slot. By induction over any finite legal sequence of events, every returned slot contains the isolated rendering of its own input. This includes schedules with other invocations still pending and permits equal inputs on different invocations. [Fix certificate](certificates/fixed.lean) · [Independently restated obligation](audit-fixed.lean.inc)

The source-to-model binding and the JDK library semantics are trusted. The proof uses the documented thread safety of the immutable formatter and treats isolated text rendering as a function. It establishes isolation for normally returning calls with stable, supported non-null inputs and configuration. It leaves calendar arithmetic, parsing, input conversion, termination and the JDK implementation outside the theorem. [SimpleDateFormat synchronization contract](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/SimpleDateFormat.html) · [DateTimeFormatter contract](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/format/DateTimeFormatter.html)

## Reproduce from the repository root

Install Python 3.9+, Node.js 22, a full OpenJDK 17 or 21 with JDI, and Lean 4.19.0 on PATH. The JDI launcher needs a local debugger connection. With elan, select the pinned toolchain first.

```sh
export ELAN_TOOLCHAIN="$(cat docs/research/logic-lens-009/lean-toolchain)"
elan toolchain install "$ELAN_TOOLCHAIN"
```

Run the same command as the Linux Node 22 job.

```sh
python3 -I docs/research/logic-lens-003/replay.py
```

The replay checks upstream hashes, installs the skill in a temporary directory and requires checker exit 1 for the original and exit 0 for the fix. It regenerates both certificates, audits the theorem statements and axiom reports, and compares fresh JVM observations with the committed bytes. To replay against a separate upstream checkout at the pinned revision, pass `--corpus PATH` pointing to its 003 probe directory. The earlier uncontrolled four-thread stress observation is retained in the [historical survey](../logic-lens-coverage/remaining/README.md).
