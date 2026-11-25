# Paired replay of bounded Tenacity regressions

Both runs with the revised Step 7 bounded the retry fixture with
`stop_after_attempt(2)`. The change did not improve detection of the
targeted override defect in this pilot. Revised-audit authored tests
detected it in one of two blocks, compared with two for the adjacent
previous guide and zero for the generic checklist. All six original
production patches selected the same extraction boundary.

## Frozen comparison

Both fresh blocks compared [8b67513](https://github.com/hyhmrright/brooks-lint/commit/8b67513222a94929e59fdd70fcbe67ce81ece48e),
[ee5be61](https://github.com/hyhmrright/brooks-lint/commit/ee5be619c574ce079c1858c669536fbfec8cbe7e)
and the generic checklist. The corresponding guidance trees differ only
in the five new lines in the architecture guide. Each condition used a
fresh writable copy of Tenacity base
`b2cd0274c67610d615019ab4745f521504a0576d`, one Codex CLI 0.169.1 turn,
`gpt-6.1-terra` at low reasoning effort, Python 3.11.18, pinned tools and a
240-second deadline. The task and project baseline match the previous
[Tenacity replay](../architecture-tenacity-replay/README.md). The historical
upstream change is [Tenacity #653](https://github.com/jd/tenacity/pull/653),
`4213bad9560479e71ce294b52501765068e38f80`.

The evaluator reused the original independent probe and admitted defect.
The mutation bypasses the overridden async `copy()` while still allocating
separate controllers. The pristine probe passes and detects the defect when
present. The inherited Tenacity suite passes under both the exact source
mutation and the equivalent runtime substitution. These were hidden from
the candidates. The two-block scoring protocol was frozen before generation.

The scored authored-test outcomes distinguish prompt assertion, timeout,
survival and missing executable coverage. The evaluator imposed the same
10-second deadline on each authored-test run, separately from limits
implemented in source fixtures. Full candidate pytest runs were subject to
a 30-second infrastructure safety cap. No pristine candidate timer fired.
The earlier Tenacity run that motivated the rule is historical context.

## Exact patch outcomes

| Block | Guidance | Full pytest | Explicit limit in new async fixture | Override mutation, authored tests only |
| --- | --- | ---: | --- | --- |
| 1 | Generic checklist | 169 passed | — | Survived |
| 1 | Before the rule | 168 passed | — | Prompt assertion failure |
| 1 | After the rule | 168 passed | 2 attempts | Prompt assertion failure |
| 2 | Generic checklist | 168 passed | — | Survived |
| 2 | Before the rule | 168 passed | — | Prompt assertion failure |
| 2 | After the rule | 168 passed | 2 attempts | Survived |

In block 1 the checklist bounded a separate synchronous case. The table
counts the async fixture relevant to the admitted defect. All six exact
patches applied to fresh copies and passed the independent pristine probe,
syntax compilation, full pytest, Mypy, Ruff formatting, Sphinx doctest and
HTML. All passed Ruff 0.15.7 with the project's configuration. The fixed
primary Ruff 0.16.8 emitted the base's 14 inherited diagnostics in every
case. The normalized receipt compares rule, path and message to account
for moved lines. The code checks kept the submitted bytes and used the same
tool versions for all six.

The intact candidates retained the historical base behavior of the
statistics aliases. Upstream made statistics visible through an outer
`functools.wraps` wrapper as intended. The inline publication logic was
moved into a private helper in all six patches. The positions and names of
helpers and their types can differ without changing this boundary.

## Why the mutation outcomes differed

Before the rule, both arms used a real `AsyncRetrying` subclass, recorded
calls to its `copy()`, and asserted the observations outside the retried
target. The mutation left their records empty, so they failed promptly
without an explicit stop setting. The first revised arm set a stop limit
and observed `copy()` with an instance wrapping mock. The assertion on the
mock's call count failed promptly.

The second revised arm chose a real subclass and a bounded nested-call
fixture. Its subclass overrides `begin()`. The mutation bypasses `copy()`
but preserves the subclass and invokes its `begin()`, so the authored
test stayed green. Neither revised authored test exercised combined
`retry_with` and overlapping calls. That combination remained covered by
the independent probe.

A separate diagnostic copy of the second revised patch added an override of
`copy()` and compared the returned controllers to those observed by
`begin()` after the normal wrapper completed. The diagnostic passed in
0.15 seconds on the pristine implementation and failed the intended
assertion in 0.15 seconds under the defect. Mypy, Ruff format and the
compatible Ruff check passed. The diagnostic changed only a test in its
own disposable copy. Its patch and logs sit alongside the six original
submissions and do not change their scores.

## Separate diagnosis of the retry limit

The copy-bypass defect did not cause a retried assertion inside either
previous-audit fixture. To verify the effect of the retry limit on that
failure shape, a post hoc diagnostic replayed the original async authored
tests with a different single-line mutation in disposable copies. It
published an empty dictionary to the template instead of the per-call
controller's statistics. A separate observation confirmed that this broke
the statistics alias in every copy. The comparable pristine authored tests
were already known to pass.

Both revised async fixtures hit their two-attempt limit. Pytest reported
failure in 0.19 seconds in each case. The traces exposed an underlying
`KeyError` and `AssertionError` respectively. The pre-rule and checklist
async fixtures timed out at 10 seconds in both blocks. This diagnostic
demonstrates how the explicit limit helps when a failing assertion or
exception is caught inside the retried function. The source disturbance
was chosen after inspecting the primary outcome and remains outside the
frozen detection scores.

## Decision

The new wording changed fixture construction consistently in this matched
case. All six authored-test runs under the preregistered copy-bypass
mutation reached a normal test verdict, including both pre-rule runs.
That mutation showed no prompt-failure advantage for the new guide. The preregistered benefit threshold
required the revised arms to detect the mutation promptly in both blocks,
which did not occur.

The observed regression gap is a mismatch between the specific dispatch
being changed and what the test observes. The diagnostic demonstrates the
difference between bounding the fixture and observing the affected method.
Two blocks on the case that motivated the wording measure its local
effect. Generalization to other codebases remains unmeasured.

[Evidence bundle](evidence.tar.gz) contains the six original patches,
prompts and receipts, the frozen scoring contract, full project checks,
and the separate diagnostic and reproduction scripts.
