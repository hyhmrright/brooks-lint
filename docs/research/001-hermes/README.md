# 001: missing version fields in the Hermes Agent release updater

The pinned `update_version_files("2.0.0", "2026.1.1")` returns Python
`None` normally when either required version field is absent. Each substitution
uses `re.sub` without checking the match count. Both unconditional
`write_text` calls execute. The other target's version changes from 1.0.0 to
2.0.0, so a caller requiring all-or-nothing validation can see a partially
updated release. Such a caller needs both fields validated before either write.
This is a counterexample to the [study contract](contract.json).

| Real input | Return | Target write-open order | Final bytes |
| --- | --- | --- | --- |
| Both fields present | `None` | Python, then TOML | Both version strings change to 2.0.0 |
| Python lacks `__version__` | `None` | Python, then TOML | Python bytes stay identical, TOML version changes to 2.0.0 |
| TOML lacks `[project].version` | `None` | Python, then TOML | Python version changes to 2.0.0, TOML bytes stay identical |

The two targets are `hermes_cli/__init__.py` and `pyproject.toml`. A comment
replaces only the absent assignment. The Python source remains valid and
retains its release-date field, already set to the requested date. The TOML
remains valid and retains its project table. Recording write-open operations
distinguishes a rewrite with identical final bytes from a file left untouched.
The harness exits 0 after observing the function's return value directly.
The release CLI, Git operations and package publication are outside this test.

## Reproduce

From a full Git checkout with Git, Node.js, Python 3.11 and Lean 4.19.0 on PATH:

```sh
python3.11 -I -B docs/research/001-hermes/replay.py
```

This offline command runs the checker from frozen commit
`4bdc2151b47b551d53dbb2e443ab130e6bb59c1f` and the currently installed
skill on the same [original source](../001-independent/holdout/samples/hermes/release.py).
It runs that source in three disposable directories and checks the function
return value, ordered write events, and every target byte. See the
[per-run measurements and both witnesses](results.json) and the
[upstream revision](https://github.com/NousResearch/hermes-agent/blob/1cec910b6a064d4e4821930be5cfaaf6145a2afd/scripts/release.py).

The frozen checker yields `unverified`. The new checker admits the pinned
script by its full source digest and emits a [Lean certificate](counterexamples.lean)
for both missing-field positions. Replay separately states the expected paths,
bytes and return value for each witness and checks that both theorem projections
have no axiom dependencies. A source control that raises before the first
write must yield `unverified`.

The trusted step is the mapping from the original helper's substitutions,
writes and implicit return to the Lean model on these specific inputs. The
witnesses establish a violation for existing, writable regular files with
successful I/O. They do not characterize every version syntax or every failure
mode of the upstream release script.
