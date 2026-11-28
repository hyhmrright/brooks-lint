"""Measure the five remaining probes using installed brooks-verify and native runtimes."""
import argparse
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
BASELINE = json.loads((HERE.parent / "results.json").read_text())
REV = BASELINE["corpus_revision"]
REMAINING = {"003", "004", "006", "007", "008"}


def run(args, cwd, *, code=0, env=None):
    proc = subprocess.run(args, cwd=cwd, capture_output=True, timeout=120, env=env)
    if proc.returncode != code:
        raise RuntimeError(f"{args}: exit {proc.returncode}\n{proc.stderr.decode()}\n{proc.stdout.decode()}")
    return proc.stdout


def native(case, variant, source, work):
    if case == "003":
        # javac requires the public class's filename. The original bytes are unchanged.
        shutil.copyfile(source, work / "TimestampFormatter.java")
        run(["javac", "-d", work, work / "TimestampFormatter.java", HERE / "Observe.java"], work)
        wrong = int(run(["java", "-Duser.timezone=UTC", "-Duser.language=en",
                         "-cp", work, "Observe", variant], work))
        if variant == "fixed" and wrong:
            raise ValueError("fixed formatter returned a wrong timestamp or raised")
        return dict(calls=4000, wrong_or_threw=wrong)
    if case in {"004", "008"}:
        test = "lifetime_test.go" if case == "004" else "capture_test.go"
        shutil.copyfile(HERE / test, work / test)
        (work / "go.mod").write_text("module observation\n\ngo 1.22\n")
        env = dict(os.environ, GOCACHE=str(work.parent / "gocache"), GOWORK="off",
                   GOTOOLCHAIN="local", GOPROXY="off", GOFLAGS="")
        log = run(["go", "test", "-v", "-count=1", "."], work, env=env).decode().splitlines()
        if case == "004":
            expected = "live [1 2 3 4]" if variant == "buggy" else "live [1 1 1 1]"
        else:
            expected = "ids [-1 2 8 8]"
        if expected not in log:
            raise ValueError(f"missing {expected}: {log}")
        return expected
    if case == "007":
        return json.loads(run([sys.executable, "-I", HERE / "observations.py", source], work))
    # Ordinary validator calls only. This is a functional smoke test.
    js = """const {isValidList} = require(process.argv[1]);
            console.log(JSON.stringify(['alpha', 'foo, bar', '', 'a,'].map(isValidList)))"""
    actual = json.loads(run(["node", "-e", js, source], work))
    expected = [True, True, variant == "buggy", variant == "buggy"]
    if actual != expected:
        raise ValueError(f"unexpected validator results: {actual}")
    return actual


def replay(repo, tmp):
    install = tmp / "installed"
    run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", install], tmp)
    checker = install / "brooks-verify/scripts/lean_review.py"
    rows = []
    for prior in BASELINE["results"]:
        path = Path(prior["path"])
        case = path.parent.name[:3]
        if case not in REMAINING:
            continue
        data = run(["git", "show", f"{REV}:{path.as_posix()}"], repo)
        digest = hashlib.sha256(data).hexdigest()
        if digest != prior["sha256"]:
            raise ValueError(f"unexpected source bytes for {path}")
        work = tmp / f"{case}-{path.stem}"
        work.mkdir()
        source = work / path.name
        source.write_bytes(data)
        spec = work / "contract.json"
        spec.write_text(json.dumps(prior["contract"]))
        report = json.loads(run([sys.executable, "-I", checker, source.name, spec], work, code=2))
        if report.get("status") != "unverified" or not report.get("reason") or "lean_certificate" in report:
            raise ValueError(f"unexpected admission result: {report}")
        rows.append(dict(path=str(path), sha256=digest, obligation=prior["contract"]["predicate"],
                         exit_code=2, report=report, observation=native(case, path.stem, source, work)))
    if len(rows) != 8:
        raise ValueError("expected three pairs and two fixed-only controls")
    versions = {tool: run(cmd, tmp).decode().splitlines()[0] for tool, cmd in
                {"java": ["java", "--version"], "go": ["go", "version"], "node": ["node", "-v"],
                 "python": [sys.executable, "--version"]}.items()}
    return dict(corpus_revision=REV, checker_sha256=hashlib.sha256(checker.read_bytes()).hexdigest(),
                versions=versions, results=rows)


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("logic_lens_checkout", type=Path)
    args = cli.parse_args()
    with tempfile.TemporaryDirectory() as scratch:
        print(json.dumps(replay(args.logic_lens_checkout.resolve(), Path(scratch)), indent=2))
