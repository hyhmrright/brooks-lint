# Runtime lifetime and first-cut boundary replays

Blinker exposed two independently measurable gaps. The original audit missed
the behavior of a receiver registered again under a different retention mode.
A lifecycle-guidance revision caught that behavior in an authored regression,
while its production diff still optimized disconnection. A subsequent
target-edge delivery check redirected the production change to weak-reference
construction. One subsequent blind draw with that guide both advanced the
migration and detected the mutation. A follow-up prompt edit did not repeat
that joint result, so the product retained the existing guide. A separate
positive control verifies the same lifetime contract at both public dispatch
entries.

## Protocol

Each matched block used the same writable source snapshot, dependency set,
task and 240-second allowance across the checklist and two audit conditions.
Codex CLI 0.169.1 used `gpt-6.1-terra` with low reasoning effort. Each arm worked
in an independent repository with a single fixture commit. No upstream diff,
probe or mutation was supplied in the assignment. The evaluator reapplied the
original candidate diffs on fresh copies. The evidence archive records the
prompts, guide changes, raw patches, receipts, independent checks and commands.
All ten audit arms recorded a successful architecture-guide read.

The acceptance criteria were recorded before the runs. For Blinker, the
behavior score requires a test written by the arm to fail with
the frozen mutation. The clean baseline suite must pass under that mutation.
The production-boundary score asks whether the diff moves or isolates a
dependency required for the requested migration. A passing suite, a detailed
trace and an aligned diff measure separate qualities.

## Blinker weak-reference migration

[Pallets #144](https://github.com/pallets-eco/blinker/pull/144) moved toward the
standard-library weak-reference layer. The parent was
`7e2c85ab3a3084fc722fa62fa62df8ab337477ea55`. Replayed history included
`9bc4890`, merge `64423df`, release `1.8.0` and the later shutdown cleanup fix
`42561fd`. The historical pytest suites passed at all five points. One
independent public probe passed on the parent and failed at each later point:
after a strong registration followed by a weak registration of the same
receiver, releasing the caller's reference stopped delivery. The inverse
sequence is also in the probe. The evaluator isolated the assignment that
replaced first-registration retention with last-registration retention.
The unchanged parent suite passed all 30 tests with that assignment.

The reference graph includes the named-signal factory and direct construction,
`connect` and its decorator and context-manager callers, sync and async
dispatch via `receivers_for`, explicit disconnection and automatic sender and
receiver cleanup. The migration also crosses the legacy bound-method reference
cache and its cleanup callbacks. The lifetime probe uses `Namespace.signal`,
`connect`, `connect_via`, `send` and `send_async` on the reused signal and
checks the caller-visible effect after release.

| Block | Guidance | First production cut | Advances target boundary | Authored test kills mutation |
|---|---|---|---|---|
| 1 | Checklist | Standard-library method references in the registry | Yes | No |
| 1 | Audit `17993af` | Capture cleanup IDs in independent callbacks | Yes | No |
| 1 | Audit `ee5be61` | Traverse the reverse index during all-sender disconnect | No | No |
| 2 | Checklist | Isolate registry reference creation in a private module | Yes | No |
| 2 | Audit `ee5be61` | Simplify an isolated legacy factory with no registry caller | No | No |
| 2 | Audit `7934a6a` | Traverse the reverse index during all-sender disconnect | No | Yes |
| 3 | Checklist | Isolate registry reference creation and detection | Yes | No |
| 3 | Audit `7934a6a` | Traverse the reverse index during all-sender disconnect | No | No |
| 3 | Audit `e2271df` | Route ordinary sender reference construction directly to the existing weak-reference type | Yes | No |
| 4 | Checklist | Move eligible bound methods to standard-library weak references | Yes | No |
| 4 | Audit `e2271df` | Move bound method construction to standard-library weak references | Yes | Yes |
| 4 | Experimental audit | Use standard weak references with ID-based cleanup for ordinary senders | Yes | No |

All twelve original patches applied and passed their complete pytest suites,
the independent pristine probe, compilation, Mypy 1.10.0, Ruff 0.4.2 lint and
format, five configured style hooks and the Sphinx HTML build from a local
wheel. Supplemental Pyright 1.1.360 reported six pre-existing wrapper typing
errors in each patch. The upstream reference commit also revised these
annotations and passed Pyright.

The block 2 revised test caught the weak-then-strong case. Its first failing
assertion inspected `Signal.receivers` after collection. The block 3 revised
patch deliberately moved ordinary sender creation and retained the bound
method branch. Its tests covered ordinary and bound sender collection, and
left the neighboring receiver mode transition untested. This distinction
explains how the revised patch could align with the goal and still miss the
fault isolated from the larger historical change.

In block 4, `e2271df` produced a migration patch and a regression that
caught changed retention in the receiver registry. Its narrative traced
the named factories, decorator/context-manager routes, sync and async
dispatch and automatic cleanup. The patch also intentionally changed
legacy cross-signal callback behavior. That change prevents it from
meeting the task's strict behavior-preserving requirement, despite passing
the frozen lifetime probe and detecting the retention mutation. Other arms
traced different subsets of the reference graph. The experiments establish
neither complete caller enumeration across repeated draws nor a stable
advantage over the checklist. The additional shared-operation wording
was evaluated and removed from the product checkout. Its exact snapshot
remains in the archive.

## Positive control

After scoring, the evaluator combined the block 3 revised production patch and
tests with a focused public regression. The regression repeats registration
in both mode orders, releases the function, and asserts actual sync and async
dispatch results through the named namespace. The added regression passes on
the pristine patch and fails at public dispatch assertions when the evaluator
changes registration to last-write retention. All 36 tests pass on the
pristine patch. All four new cases fail under the mutation, including both
mode orders independently through each entry. This control is a separate diff
and does not change the original candidate's score. It is the first-cut
reference for this case. Its production diff preserves the legacy
bound-method path and narrows only ordinary sender reference construction.

## Independent pytest fixture representation case

[pytest #12473](https://github.com/pytest-dev/pytest/pull/12473) moved fixture
definitions from decorated callables toward explicit objects at commit
`ecde993e1`. We used parent `44cb841e4`. The independent public-CLI probe
replays a named module fixture and a bound class fixture that receive an outer
`functools.wraps` decorator. Both passed on the parent. Both failed with
fixture lookup errors on the upstream refactor. Upstream later discussed the
compatibility edge for plugins and introduced a warning about wrapping
fixture definitions. This establishes observed pre-refactor behavior and a
compatibility decision, with separate evidence for each. See
[pytest #13564](https://github.com/pytest-dev/pytest/issues/13564) and
[pytest #13745](https://github.com/pytest-dev/pytest/pull/13745).

| Guidance | First cut | Frozen public probe | Authored tests insensitive to the injected lookup failure |
|---|---|---|---|
| Checklist | Collect marker and bound implementation into a private definition at discovery | Both pass | 1 of 1 |
| Audit `ee5be61` | Store marker with the callable in a wrapper subclass at decoration | Both pass | 2 of 2 |
| Audit `e2271df` | Construct a private definition from the existing marker and bound object at discovery | Both pass | 1 of 1 |

The latest audit and checklist used Pytester fixtures whose application
decorator ran inside `@pytest.fixture`. That order exercises execution of
the decorator, but leaves the outer-wrapper discovery edge untested.
The older audit tested wrapper metadata and plugin/class binding at a
different seam. None of the authored tests detected the injected lookup
failure in an authored-only replay.

The planted variant rejected both probe fixtures and also affected inherited
descriptor cases. It failed the preregistered admission rule that an injected
change must leave the original suite green after accounting for environment
failures. This case therefore serves as an independent compatibility
diagnostic. It does not add a comparable mutation score to Blinker.

All three original patches applied unchanged and passed their independent
probe and Mypy 1.13.0. Ruff 0.8.1 lint and format passed on the changed files.
Whole-tree Ruff reproduced the baseline's three diagnostics and one
formatting difference in the generated `_pytest/_version.py` setup file.
The snapshot requires version generation for assertion rewriting, so all
arms received the same file generated with setuptools-scm 8.1.0 and
`SETUPTOOLS_SCM_PRETEND_VERSION=8.4.0.dev254`.

The verifier recorded environment-sensitive cases separately. It checked
console distribution metadata and used a terminal type that supports color
in focused reruns. Each of the three affected cases passed on the base and
all three candidates in that matched rerun. These environment changes did
not alter the candidate patches.

The initial serial candidate runs hit their eight-minute evaluation deadline.
The full default collection then finished on the parent and all candidates
using the project's xdist mode. The full-run results retain their original
failures.

| Tree | Passed | Failed | Skipped | Xfailed | Xpassed |
|---|---:|---:|---:|---:|---:|
| Parent | 3,668 | 1 | 96 | 12 | 1 |
| Checklist | 3,669 | 1 | 96 | 12 | 1 |
| Audit `ee5be61` | 3,670 | 1 | 96 | 12 | 1 |
| Audit `e2271df` | 3,668 | 2 | 96 | 12 | 1 |

Every full run failed the same terminal-color test. The latest audit run
also failed the verbose version check during automatic third-party plugin
loading. Its traceback shows a Hypothesis initialization warning promoted
to an error. Both checks passed in the matched focused xdist replay on all
four trees, along with the package entry-point check. There was no patch
editing between full and focused runs. The evidence does not claim a single
uninterrupted green full-suite run for these pytest snapshots.
