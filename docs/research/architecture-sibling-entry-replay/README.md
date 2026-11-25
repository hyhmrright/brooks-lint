# Blind replay of the sibling-entry trace

The revised audit named an extra public route in the distinct-entry case. Its
production patch matched the previous audit byte for byte, and neither audit
added a test that detected either seeded behavior break. In the convergent
control, the revised audit reused the path iterator to exercise the shared
policy and also tested the separate file-lookup entry point. This pilot supports
a reporting improvement. It does not meet the frozen threshold for an
incremental refactoring decision or regression.

## Study design

One turn per guidance condition and case. All six formal turns used Codex CLI
0.169.1, `gpt-6.1-terra` with low reasoning effort, a 240-second wall deadline
and the same Python 3.11.18 tooling within each case. The previous and revised
audits were `c2dce5e8cae6362e1955d3b890ee63c4c2f27616` and
`8b67513222a94929e59fdd70fcbe67ce81ece48e`. The generic checklist was copied
from the preceding study. Candidate workspaces held only the base snapshot and
assigned guidance. The evaluator froze the probes, mutation locations and
scoring rules before generation. Both probes passed on their bases, and all
three behavior breaks produced the intended probe assertions before launch.

| Case | Base | Historical refactor | Assignment |
| --- | --- | --- | --- |
| cachetools, distinct entries | `958c3e940cc94a25569f82df4a8c296a98fa901d` | [4ec4a67](https://github.com/tkem/cachetools/commit/4ec4a6734e09362138a7b2a7c3257133908a62db) | Isolate memoized-method binding ahead of decorator consolidation. |
| platformdirs, convergent control | `d5ff75cd1ad8ccec8ce275966fa8588608badd44` | [#606](https://github.com/tox-dev/platformdirs/pull/606) at `bdafa67c2d0f95e146bdd25c362ae80cd530b7e8` | Isolate config-directory iteration before consolidating related iterators. |

## Replay of the exact patches

| Case and interpreter | Checklist | Previous audit | Revised audit |
| --- | ---: | ---: | ---: |
| cachetools, CPython 3.14.10 | 401 passed | 402 passed | 402 passed |
| platformdirs, CPython 3.11.18 | 2,003 passed | 2,004 passed | 2,003 passed |

All six original patches applied cleanly, passed changed-Python syntax checks
and passed the independent probes. The cachetools 3.11 runs all reproduced the
base's `ClassMethodTest.test_classmethod` error-message mismatch. Replaying the
same diffs on the supported 3.14 interpreter passed the full suite. The
historical refactor passed 407 tests on each interpreter. Platformdirs retained
the suite's 125 skips in each run and passed all fixed pre-commit hooks and
`ty` in all three arms. The generated version module needed by archived
platformdirs source came from a wheel built with the project's declared build
backend and release tag value `4.12.1`.

Cachetools passed Pyright and Ruff formatting in both environments. All three
patches and both historical snapshots retained the same Ruff 0.16.9
`DTZ901` finding in untouched `tests/test_ttl.py:236`. Platformdirs additionally
ran broad `ruff check .`, which emitted the same 15 configuration messages in
the original `pyproject.toml` across all variants. Its configured Ruff hook,
formatter, and the remaining pre-commit hooks passed with no edits. The
platformdirs hooks ran with Python 3.14.10 after the 3.11 setup failed to satisfy
the locked docstring formatter's Sphinx dependency. Exact logs distinguish all
these outcomes.

## Distinct entry behavior in cachetools

Both audits traced the per-receiver wrapper and the separate per-descriptor
`super()` binding. Revised audit also traced public class invocation through
`_Unbound.__call__` to the same retained instance wrapper, including where the
receiver is resolved. Checklist identified the public typing contract for class
access. It did not trace the class invocation to the binding implementation
in its final answer.

The two audit production files were byte-identical. Both move the shared
wrapper base into the descriptor module as `_MethodWrapper`. Checklist chose
the same ownership boundary, retaining the `_WrapperBase` name and moving fewer
references. In all three patches the authored tests checked direct bound access,
including receiver-specific binding and dynamic resource changes. The new
tests in the revised arm did not exercise the extra class-invocation route.

The evaluator injected class invocation bypassing the cache wrapper, and
separately discarded the stored `super()` wrapper state. The probes detected
both breaks. The original project's test suite independently caught both
(4 and 10 failing tests respectively under 3.14). None of the newly authored
test subsets in any arm detected either mutation. The evidence separates
improved route reporting from change selection and executable test sensitivity.
The project already had coverage of the target regressions, limiting the
ability of this positive case to measure coverage added by any arm.

## Convergent entry behavior in platformdirs

All three arms traced `iter_config_paths` through `iter_config_dirs`. The latter
owns ordering, directory creation and deduplication, and the path adapter
converts the resulting strings. Both audits also traced the Unix root/site
policy into that sequence. The revised audit reused a shared helper and kept
both existing dispatch points. Previous audit placed the policy behind an
overridable property. Checklist moved the base iteration to a separate module,
with the Unix override kept in place.

The revised audit added one subclass regression covering the path iterator and
file lookup. File lookup uses a copy with directory creation disabled, which
the answer traced as a separate contract. That patch added no duplicate
string/path assertions for the same iteration policy. Previous audit and
checklist authored tests detected the deliberate removal of deduplication.
Revised audit's new test used distinct directories and therefore missed that
defect. The independently executed probes and the base project's tests detected
it. This control supplies no evidence of a duplicate-testing problem in the new
instruction.

## Decision and reusable screening

The frozen pilot compared one run per condition. It did not clear the
threshold for a revised-audit-only improvement in patch boundary or
regression sensitivity. There is no present evidence that the sibling-route
instruction needs to be tightened for duplicate coverage.

The evidence includes an executable admission check for future
mutation-sensitivity positives. It requires the pristine base suite and
independent probe to pass. It then checks that a targeted defect applies and
triggers the independent probe while surviving the base suite. The executable
rejected both cachetools defects as already covered and accepted a synthetic
receipt for the intended coverage-gap condition. This screening criterion
applies when measuring newly added regression sensitivity.

[Evidence bundle](evidence.tar.gz) contains the original patches, prompts,
hypotheses, check receipts, mutation selections and reproduction commands.

## Supplemental admitted positive: packaging

After the two-case protocol, the admission executable screened
packaging's [replacement refactor #1378](https://github.com/pypa/packaging/pull/1378)
at `332d716676eb934b67ede4054a3e3e0d4022b2d3`. Its base is recorded at
`supplemental/sources.tsv` in the evidence. Before opening any of its model
runs, the evaluator froze a new probe and mutation. A custom subclass exposes
its allocation through its own `__new__`. Both the text constructor and
`from_parts` create the subclass. Replacing a changed field must preserve
that subtype, initialize fresh comparison and hash state, and retain object
identity for a no-op. Returning a base `Version` on changed replacement
failed the independent assertion, while the 62,490 passing tests of the
pristine default suite still passed with the defect present, as did its
427 opt-in property tests. A runtime form
of the same return-type mutation verified the same outcome before launch
and allowed the original candidate patches to be scored despite different
internal extraction shapes.

The supplemental run used the same guidance snapshots, model, effort,
deadline and project dependencies in all three arms. Every arm factored
completed instance allocation into a private classmethod shared by
`from_parts` and changed replacements. Each authored a test exercising the
public subclass path and failed that test when the evaluation wrapper
returned the base type. Each exact original diff then passed 62,491 default
tests with one upstream platform skip and all 427 opt-in property tests.
Ruff lint and formatting, pinned mypy and all configured hooks passed
without edits. The Go module fetch used by pre-commit timed out; the same
pinned actionlint was built via the proxy and run separately across all
variants. The committed log retains the base's initial mypy environment failure from missing
`tomli`, declared by the project's hook, and the successful rechecks.

This supplementary case shows that the admission gate finds a genuine
opportunity to improve coverage. All three conditions used that opportunity.
It supplies no revised-audit-only change in the first production boundary
or newly executable regression, consistent with the primary pilot. The
replay is stored separately so both denominators and the moment of
prospective freezing stay clear.

[Supplemental evidence](supplemental-evidence.tar.gz) contains the three
original patches, independent receipts, admission result and reproduction
commands.
