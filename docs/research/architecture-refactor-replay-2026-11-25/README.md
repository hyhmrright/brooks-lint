# Architecture refactor replay across three projects

The revised audit produced useful regression evidence but did not demonstrate a
uniquely discovered constraint that changed the first production cut. Both audit
versions covered the cattrs registry-copy constraint and HTTP Core shutdown
ordering. All three conditions missed the attrs factory route. Independent
verification caught a project static-check failure in the attrs checklist patch.

## Design

One writable Codex CLI 0.169.1 turn per condition and case, using
`gpt-6.1-terra` at low reasoning effort and a 240-second wall deadline. There was
no separate token cap. Conditions within each project received the same base,
task, Python 3.11.18 environment, local check tools and model configuration.
The generic checklist came from the previous replay. The audit snapshots were
`17993af46f68580fcbaadd074cd42f7284135544` (previous) and
`c2dce5e8cae6362e1955d3b890ee63c4c2f27616` (revised). The scoring criteria and
independent probes were recorded before model generation and kept out of the
candidate worktrees and prompts. All six audit traces show a successful read
of the assigned architecture guide. We scored the delivered answer and patch
against the criteria using the base code and execution receipts.

| Project and upstream change | Base | Historical change | First-step assignment |
| --- | --- | --- | --- |
| [attrs #1407](https://github.com/python-attrs/attrs/pull/1407) | `e048efcb395443608d184a149c0adbca166cb833` | `74007f67d203f902e88bdecba169786bf44a8aa2` | Isolate initializer generation in preparation for batching compiled methods. |
| [cattrs #313](https://github.com/python-attrs/cattrs/pull/313) | `30a187a67fc465adc17aabd2b58665709464aa9e` | `50a8c642851d97950c8f72d9b4adaca292075877` | Isolate predicate lookup from the miss policy before changing its representation. |
| [HTTP Core #631](https://github.com/encode/httpcore/pull/631) | `6a97dade2a57283491c7830385d52daccbeaf93b` | `585b6f3bceab80932186e460d5051af9596fa699` | Isolate the shutdown policy before changing how active requests are handled. |

The evaluator applied the exact captured diffs to fresh snapshots with
`git apply --check` and `git apply`. Each Python suite used the full test
selection on one interpreter. The dependency freezes record the selected versions.
We also ran the configured project static checks, including the equivalent
pinned attrs pre-commit hooks. Pyright diagnostics were exercised by attrs'
pytest suite. HTTP Core's integration fixtures and Black used local sockets in
independent replay. Candidate Codex sandboxes had the usual workspace-write
restrictions and some candidate checks that used sockets were therefore incomplete.

## Exact patch results

| Project | Condition | Full pytest passed | Independent probe | Project static checks |
| --- | --- | ---: | --- | --- |
| attrs | Generic checklist | 1,429 | Pass | Failed interrogate |
| attrs | Previous audit | 1,431 | Pass | Pass |
| attrs | Revised audit | 1,431 | Pass | Pass |
| cattrs | Generic checklist | 281 | Pass | Pass |
| cattrs | Previous audit | 281 | Pass | Pass |
| cattrs | Revised audit | 281 | Pass | Pass |
| HTTP Core | Generic checklist | 169 | Pass | Pass |
| HTTP Core | Previous audit | 169 | Pass | Pass |
| HTTP Core | Revised audit | 172 | Pass | Pass |

attrs uses mypy, Ruff lint/format, interrogate, codespell and the four generic
hooks. The checklist added a test method without a docstring. The configured
`interrogate tests` gate fell from 100% to 99.8%, below its 100% threshold.
Both audit patches passed this gate. This distinguishes both audit arms from
the checklist in this case.

cattrs uses Black and Flake8. HTTP Core uses isort, Black, Flake8, mypy and
`scripts/unasync --check`. The status logs record each tool separately.
No verification step rewrote a candidate.

## Which observations changed the cut?

### attrs

`attrs.define` and `attrs.make_class` converge on the class builder through
different construction paths. The freeze probe uses a decorated instance,
an inherited initializer that dispatches to an override, and a slotted factory
class whose user constructor delegates to `__attrs_init__`. It checks hook order,
conversion, alias/signature and method metadata.

All three conditions identified the two initializer variants. Previous audit
and checklist exercised a user constructor that delegates to the generated
`__attrs_init__`. Revised audit called `__attrs_init__` explicitly on an already
created instance for that variant and tested pre/post hook order for both
variants. Checklist additionally mapped `define` to the builder's decorator.
None mapped `make_class` to the same builder or added a test for an inherited
post-init override through a real entry. All three preserved both behaviors as
observed by the independent probe.

Previous audit and checklist extracted the source/globals/annotations/filename
preparation from immediate compilation. Revised audit instead consolidated the
builder's two calls to the existing generator. It identified a direct internal
test caller of the standalone generator, whose signature all three kept. The
different seam is a design choice. The evidence does not tie it to an otherwise
missed behavior constraint.

### cattrs

All three conditions identified the terminal registered fallback and the
implications of changing registry order and size for converter copies. Previous
audit and checklist added low-level checks for destination fallback precedence
during copy. Revised audit documented the skip counts and checked factory
execution and cache invalidation. None demonstrated the different copy
behavior of predicate and class registrations through the public `Converter`
entry in its authored regressions. The freeze probe exercises that distinction,
asymmetric structure/unstructure misses, callback priority and re-registration
after caching.

Both audits extracted an internal lookup helper with a success flag, retaining
the existing miss exception and distinguishing an actual falsey handler.
Checklist extracted the whole `FunctionDispatch` class into a private module
while re-exporting it from the existing paths. An additional, post hoc
measurement confirmed the checklist moved `FunctionDispatch.__module__` and the
module name written by `pickle`; the audit patches preserved both. The
checklist itself disclosed this potential compatibility cost. It is outside
the frozen probe and does not establish a downstream consumer break.

### HTTP Core

All three conditions followed explicit and context-manager shutdown and kept
the in-flight count under the lock, with connection cleanup and bookkeeping
before raising. Both audits described the late response callback and asserted
that a real mocked connection became closed through the pool's normal stream
entry. Checklist traced the synchronous convenience API and checked pool
emptiness and repeated close. Revised audit explicitly identified dynamic
dispatch in context-manager exit and added idle-pool regressions. Its tests
used the base pool class. The independent probe exercised a pool subclass
through the normal sync and async context exits and checked that close still
reached the override, including after stream shutdown and pool reuse.

Both audits extracted lock-held cleanup and left the raise policy in
`close`/`aclose`. Checklist extracted the policy into a shared private module
and left cleanup inline. All three passed sync-generation parity and preserved
the tested lifecycle. The revised audit's explicit override observation
strengthened the explanation without changing the selected seam relative to the
previous audit.

## Controls and decisions

The three base probes passed. Each deliberate mutation was detected by its
project probe. The mutations remove attrs post-init dispatch, reverse cattrs
registration priority, and bypass a pool subclass on context exit. These are
sensitivity controls and were excluded from the nine submissions. The attrs
historical change continued to pass its probe. The cattrs and HTTP Core
historical changes intentionally revised policy, and their base-compatibility
probes rejected those changes while their upstream suites passed.

The first direct CLI batch hit simultaneous connection timeouts. A proxy
preflight succeeded, and the nine-run campaign used the same explicit
environment connection for all three arms. The direct batch was interrupted
before completing the campaign and was excluded from the comparison. The
proxy selection was made before reading the formal candidate patches. This is
one sample per case and condition. It cannot establish detection rates or a
release-wide advantage.

Jinja's earlier replay missed the named loader alongside its direct rendering
route. The attrs replay reproduced the route-discovery gap with `make_class`.
After freezing and running the comparison, the product guide was updated in
[8b67513](https://github.com/hyhmrright/brooks-lint/commit/8b67513222a94929e59fdd70fcbe67ce81ece48e).
It now asks the audit to trace backward from a shared receiver or seam to
other public entries and to exercise distinct contracts through their normal
entries. Routes with evidence of convergence can share a regression. This
wording passed repository validation, unit tests and structural evals. Its
behavior has yet to be measured on a blind case. Architecture-first release
positioning remains a decision for that evidence.

[Evidence bundle](evidence.tar.gz) contains the exact patches, prompts, answers,
frozen probes, check receipts and reproduction commands. See
`REPRODUCE.md` in the bundle.
