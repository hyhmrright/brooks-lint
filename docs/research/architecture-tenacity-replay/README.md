# Blind Tenacity wrapper replay

All three conditions chose the same refactoring boundary. The revised audit
used a concrete controller subclass in its new regression. Under a deliberate
dispatch defect that test timed out. The previous audit's regression detected
the defect with a prompt assertion and the generic checklist's new tests
passed under the defect. A separate diagnostic verified the one-attempt change
that makes the revised test fail promptly.

## Frozen case

The upstream [Tenacity #653](https://github.com/jd/tenacity/pull/653) moved
statistics ownership on both wrapper paths. The base was
`b2cd0274c67610d615019ab4745f521504a0576d` and the upstream implementation was
`4213bad9560479e71ce294b52501765068e38f80`. Candidates were asked to isolate
per-invocation bookkeeping as a behavior-preserving preparation patch.

All three conditions used a writable copy of the same snapshot, Python
3.11.18, Codex CLI 0.169.1, `gpt-6.1-terra` at low reasoning effort, and a
240-second wall deadline. The guide revisions were
`c2dce5e8cae6362e1955d3b890ee63c4c2f27616` and
`8b67513222a94929e59fdd70fcbe67ce81ece48e`. The generic checklist was copied
from the preceding study. Both audit traces recorded a successful read of
their architecture guide. The probe, defect, and scoring rules were frozen
before candidate generation and kept outside the candidate trees.

The initial candidate defect reused the async wrapper's template controller.
The inherited suite already detected it in `test_issue_478.py`, so it was
excluded by the admission rule. The admitted defect instead bypassed an
overridden async `copy()` while still allocating a separate controller for
each invocation. The independent probe uses a custom subtype, configures a
wrapper through `retry_with`, and uses an event to overlap two invocations
of that same wrapper. Its before callback records the selected controllers.
The probe passed on the pristine base and failed on the missing override
marker under both the source mutation and the evaluator-side lookup
substitution. The complete inherited suite passed all 166 cases under
either defect representation.

## Exact candidate replay

| Condition | Full pytest | Project validation | Original authored tests under the admitted defect |
| --- | --- | --- | --- |
| Generic checklist | 170 passed | Mypy, formatting, compatible Ruff, doctest and HTML passed | 4 passed. The defect survived. |
| Previous audit | 168 passed | Mypy, formatting, compatible Ruff, doctest and HTML passed | 1 failed and 1 passed. The async test asserted the copy call count. |
| Revised audit | 168 passed | Mypy, formatting, compatible Ruff, doctest and HTML passed | Timed out after 10 seconds. |

All patches applied cleanly and passed changed-file syntax checks and the
preregistered independent probe. The standard pytest runs each reported
12 passing subtests. Sphinx ran the configured doctest and HTML builders with
warnings treated as errors, using the real Git history for reno. The fixed
model environment's Ruff 0.16.8 reported 14 identical pre-existing
`RUF036` diagnostics on the base, upstream and every candidate. No candidate
introduced a new diagnostic. Supplemental Ruff 0.15.7 passed on every tree.
No patch or project configuration was altered to obtain these results.

All three isolated `BaseRetrying._copy_for_call`, keeping invocation
`copy()`, publication to the wrapper, and publication to the original
controller together. The two audit production trees have identical Python
ASTs. Each answer identified the async wrapper and the reconfigured
`retry_with` path, along with the Tornado controller's use of the base
wrapper. The separate historical statistics observation confirmed that the
three candidate patches preserved the base behavior. The actual upstream
change made statistics visible through an outer `functools.wraps` decorator.

## What the authored tests established

The checklist asserted that recursive invocations retain independent
controllers. That logically different requirement did not detect loss of
custom `copy()` dispatch. The previous audit observed an instance-level
override with a wrapping mock and failed its call-count assertion. The
revised audit observed calls to a real subclass's `copy()` method and
checked their statistics identity through the public wrapper. Its authored
tests invoked the wrapper directly and sequentially. The evaluator's probe
provided the additional `retry_with` and overlapping-call coverage.

When the defect bypasses `copy()`, the revised test's list of copies remains
empty. It reads `copies[-1]` inside the retried target. The resulting
`IndexError` is itself retried by the default unbounded policy. The evaluator
stopped that run, then repeated all three exact authored-test subsets with
the same 10-second deadline. A timeout and an assertion failure are separate
outcomes. The original revised patch is preserved byte for byte.

The diagnostic patch changes only the test fixture in a separate copy, setting
`stop_after_attempt(1)` and `reraise=True`. The pristine diagnostic passed
and the mutated diagnostic failed with the original `IndexError`, each in
about 0.2 seconds. This establishes a concrete negative-path improvement.
The frozen comparison remains one sample per condition. It shows a difference
in regression evidence and failure quality without a new production seam.

[Evidence bundle](evidence.tar.gz) includes the exact patches, prompts,
probes, code and documentation checks, mutation receipts, timeout
classification, and reproduction commands.

## Guide follow-up

[Commit ee5be61](https://github.com/hyhmrright/brooks-lint/commit/ee5be619c574ce079c1858c669536fbfec8cbe7e)
adds a scoped Step 7 check. New regressions that can loop or hang while
exercising retries, polling, or asynchronous waiting bound their fixture
attempts and waits and surface the intended failure promptly. When reaching
a deadline is itself the expected result, the test asserts it explicitly.
Repository validation, tests and structural evals passed on the feature
branch. The wording was added after the three formal candidates.
