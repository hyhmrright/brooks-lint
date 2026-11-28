"""Reproduce the second independent 001 cohort from a full git checkout."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sys.path.insert(0, str(HERE.parent))
from compare import audit
from variants import source_variants

PIN = "c05c01a76957327e561f2c9ed1c298c4c0311b87"
SCRIPTS = "skills/brooks-verify/scripts/"
CASE = "docs/research/logic-lens-001/"
SOURCES = {"cookbook": "apply_patch.py", "patch-ng": "patch_ng.py", "hermes": "release.py"}


def frozen(path):
    return subprocess.check_output(["git", "show", f"{PIN}:{path}"], cwd=ROOT)


def invoke(args, cwd, stdin=None):
    return subprocess.run(args, cwd=cwd, input=stdin, text=True, capture_output=True, timeout=60)


def observe(name, source, scenario, work):
    work.mkdir()
    targets = ["first.txt", "last.txt"]
    initial = ["old\n", "old\n"]
    if name == "hermes":
        targets = ["hermes_cli/__init__.py", "pyproject.toml"]
        initial = ['__version__ = "1.0.0"\n', 'version = "1.0.0"\n']
        source_path = work / "scripts" / source.name
        source_path.parent.mkdir()
        shutil.copyfile(source, source_path)
    else:
        source_path = source
    before = dict(zip(targets, (s.encode() for s in initial)))
    if scenario != "success":
        index = 0 if scenario == "first-mismatch" else 1
        before[targets[index]] = b'\xff' if scenario == "last-decode-error" else b"unmatched\n"
    for target, data in before.items():
        path = work / target
        path.parent.mkdir(exist_ok=True)
        path.write_bytes(data)
    args = []
    stdin = None
    if name == "cookbook":
        edits = [f"*** Update File: {p}\n@@\n-old\n+new\n" for p in targets]
        stdin = "*** Begin Patch\n" + "".join(edits) + "*** End Patch\n"
    if name == "patch-ng":
        (work / "input.diff").write_text("".join(
            f"--- {p}\n+++ {p}\n@@ -1 +1 @@\n-old\n+new\n" for p in targets))
        args = ["--debug", "input.diff"]
    run = invoke([sys.executable, "-I", "-B", HERE / "native.py", source_path,
                  json.dumps(targets), *args], work, stdin)
    trace = json.loads((work / "trace.json").read_text())
    after = {p: (work / p).read_bytes() for p in targets}
    if scenario == "last-decode-error":
        assert run.returncode == 1 and "UnicodeDecodeError" in run.stderr
        outcome = "decode-error"
    elif scenario == "success" or name == "hermes":
        assert run.returncode == 0 and (name == "patch-ng" or not run.stderr.strip()), run
        outcome = "success" if scenario == "success" else "mismatch-accepted"
    elif name == "cookbook":
        assert run.returncode == 0 and "Invalid context at 0:" in run.stderr and not run.stdout.strip(), run
        outcome = "mismatch-rejected"
    else:
        assert run.returncode == 255 and "source file is different" in run.stderr, run
        outcome = "mismatch-rejected"
    return dict(scenario=scenario, outcome=outcome, exit=run.returncode, mutations=trace,
                changed=[p for p in targets if before[p] != after[p]],
                before_hex={p: b.hex() for p, b in before.items()},
                after_hex={p: b.hex() for p, b in after.items()})


def replay(work):
    version = subprocess.check_output(["lean", "--version"], text=True)
    assert "version 4.19.0," in version
    assert sys.version_info[:2] == (3, 11)
    checker = work / "verify_batch.py"
    for file in [checker.name, "lean_review.py", "BatchUpdate.lean",
                 "batch-eager.lean.inc", "batch-staged.lean.inc", "batch-early-flush.lean.inc"]:
        (work / file).write_bytes(frozen(SCRIPTS + file))
    contract = work / "contract.json"
    contract.write_bytes(frozen(CASE + contract.name))

    def check(source):
        run = invoke([sys.executable, "-I", checker, source, contract], work)
        report = json.loads(run.stdout)
        assert run.returncode == {"verified": 0, "counterexample": 1, "unverified": 2}[report["status"]]
        return report

    controls = {}
    for model, text in source_variants():
        if model not in {"staged-explicit-loop", "early-metadata-flush", "lazy-commit"}:
            continue
        src = work / (model + ".py")
        src.write_text(text)
        result = check(src)
        controls[model] = dict(status=result["status"], **audit(result, work, HERE.parent / "expanded", False))

    rows = {}
    for name, script in SOURCES.items():
        src = HERE / "samples" / name / script
        result = check(src)
        scenarios = ["success", "first-mismatch", "last-mismatch"]
        if name == "hermes":
            scenarios.append("last-decode-error")
        runs = [observe(name, src, s, work / (name + "-" + s)) for s in scenarios]
        assert len(runs[0]["changed"]) == 2, (name, runs[0])
        if result["status"] == "verified" and any(
            r["outcome"] == "mismatch-rejected" and (r["mutations"] or r["changed"]) for r in runs
        ):
            raise ValueError(f"False verification: {name}")
        assert result["status"] == "unverified" and "lean_certificate" not in result, result
        rows[name] = dict(source_sha256=hashlib.sha256(src.read_bytes()).hexdigest(),
                          checker=result, certificate=None, observations=runs)
    return dict(checker_commit=PIN, lean="4.19.0", controls=controls, holdout=rows)


if __name__ == "__main__":
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        results = replay(Path(tmp))
    if sys.argv[1:] == ["--print"]:
        print(json.dumps(results, indent=2))
    elif results != json.loads((HERE / "results.json").read_bytes()):
        raise SystemExit("Observed results differ from the committed evidence")
    else:
        for name, row in results["holdout"].items():
            print(name, row["checker"]["status"], [(r["outcome"], r["changed"]) for r in row["observations"]])
