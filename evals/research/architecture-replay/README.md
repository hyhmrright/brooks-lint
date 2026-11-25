# Architecture patch replay

The Blinker acceptance check reapplies an untouched patch to the source pinned
in the lifecycle-boundary evidence. It runs the complete Python 3.11 pytest
suite, compilation, Mypy, Ruff lint and format, and the historical style
hooks. It reports Pyright diagnostics separately because the historical tox
typing job uses Mypy. It verifies the archived package versions and Pyright
1.1.360 before running the replay.

From the repository root, with uv, Node, Git, and Python 3.11.4 or newer in
the Python 3.11 series:

```sh
replay_env=$(mktemp -d)
tar -xzf docs/research/architecture-lifecycle-boundary-replay/evidence.tar.gz -C "$replay_env"
uv venv --python 3.11 "$replay_env/venv"
uv pip sync --python "$replay_env/venv/bin/python" "$replay_env/blinker/requirements.freeze"
npm --prefix "$replay_env/blinker/block-1/pyright-node" ci
python3 evals/research/architecture-replay/replay.py \
  --python "$replay_env/venv/bin/python" \
  --pyright "$replay_env/blinker/block-1/pyright-node/node_modules/.bin/pyright" \
  --output "$replay_env/positive"
```

Use `--block 1 --arm checklist` or another frozen arm for a negative or
comparative replay. Use `--patch path/to/candidate.patch` for a local patch.
Run only patches whose code you trust. Each invocation requires a new output
directory. The runner preserves a copy of the exact patch, runs every check
with a deadline and records per-check logs and `result.json`.

The mutation qualifies when the clean baseline passes, the planted baseline
still passes its inherited suite, and the independent public-entry probe
fails at the frozen assertion. The candidate's original suite and probe must
pass before a separate planted copy is made. The runner compares collected
node IDs with the baseline and scores only failures at assertions in added
test nodes. Modified tests under existing node IDs need a separate review,
as do failures from fixtures or timeouts.

Exit 0 requires passing project checks, retaining all inherited test nodes,
and a detected mutation. The result
lists changed files and any caller claims supplied by the archived arm. Assess
whether those claims follow from source and whether the patch advances the
requested dependency independently of the mechanical gate.
