"""Replay 004 on the installed skill, a pinned Lean kernel and real Go files."""
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
ROOT = HERE.parents[2]
HASHES = {
    "buggy.go": "95a247dbae316d46d01fce75c304da3ec7ca413dd7453cbbe39dc347ec38b260",
    "fixed.go": "b8557c41181cd516d054beae302da42b1e4c2e8f7400bd3d3a07ffdfd2da99fe",
    "meta.json": "c4e08c342c01c2b60aadeb5e6127c4e69af32adc2abaf8ec27e53efe8e2e4cd5",
}
CHALLENGE = {
    "buggy": """let r := FileLifetime.run .batch [.ok, .ok]
    r.scans = [1, 2] ∧ r.peak = 2 ∧ r.live = 0""",
    "fixed": """∀ xs : List FileLifetime.Outcome,
    (FileLifetime.run .perFile xs).peak ≤ 1 ∧ (FileLifetime.run .perFile xs).live = 0""",
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def require(ok, message):
    if not ok:
        raise ValueError(message)


def run(args, cwd, code=0, env=None):
    p = subprocess.run(args, cwd=cwd, capture_output=True, text=True, timeout=120, env=env)
    require(p.returncode == code, f"{args[0]} exit {p.returncode}\n{p.stdout}{p.stderr}")
    return p.stdout


def observe(source, work):
    folder = work / source.stem
    folder.mkdir()
    shutil.copyfile(source, folder / source.name)
    shutil.copyfile(HERE / "observe_test.go", folder / "observe_test.go")
    (folder / "go.mod").write_text("module lifetime\n\ngo 1.22\n")
    env = dict(os.environ, GOCACHE=str(work / "gocache"), GOWORK="off", GOFLAGS="",
               GOTOOLCHAIN="local", GOPROXY="off", CGO_ENABLED="0")
    log = run(["go", "test", "-count=1", "-v", "."], folder, env=env)
    rows = [json.loads(line[4:]) for line in log.splitlines() if line.startswith("OBS ")]
    require(len(rows) == 8 and len({row["case"] for row in rows}) == 8, "Missing Go observations")
    for row in rows:
        expected = next((step for step in row["inputs"] if step != "ok"), "ok")
        require(row["status"] == expected, f"Unexpected function return: {row}")
    return rows


def kernel_check(version, model, certificate, rows, work):
    # Bind the stored certificate to an independently written proposition, then
    # specialize the lifecycle model to every measured native trace.
    program = [certificate, f"theorem checked004 : {CHALLENGE[version]} := reviewedContract",
               "#print axioms checked004"]
    for row in rows:
        require(all(s in {"ok", "openError", "scanError"} for s in row["inputs"]), "Unknown outcome")
        inputs = "[" + ", ".join("." + s for s in row["inputs"]) + "]"
        scans = row["scans"]
        live = row["live_at_return"]
        require(all(type(n) is int and n >= 0 for n in [*scans, live]), "Invalid handle count")
        program.append(f"example : let r := FileLifetime.run .{model} {inputs}\n"
                       f"          r.scans = {scans} ∧ r.peak = {max(scans, default=0)} "
                       f"∧ r.live = {live} := by decide")
    check = work / "Replay.lean"
    check.write_text("\n".join(program) + "\n")
    audit = run(["lean", check], work).strip()
    allowed = {"'checked004' does not depend on any axioms",
               "'checked004' depends on axioms: [propext]",
               "'checked004' depends on axioms: [propext, Quot.sound]"}
    require(audit in allowed, f"Unexpected Lean axiom report: {audit}")
    return audit


def replay(corpus, work, record):
    require("version 4.19.0," in run(["lean", "--version"], work), "Expected Lean 4.19.0")
    for name, expected in HASHES.items():
        require(digest((corpus / name).read_bytes()) == expected, f"Source digest mismatch: {name}")
    dest = work / "installed"
    run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", dest], work)
    checker = dest / "brooks-verify/scripts/verify_handles.py"
    spec = HERE / "contract.json"
    result = dict(corpus_revision="3b158e228127e21bff7be6530e3923de0793a907", source_sha256=HASHES,
                  checker_sha256=digest(checker.read_bytes()), variants={})
    certificates = {}
    for variant, model in [("buggy", "batch"), ("fixed", "perFile")]:
        source = corpus / f"{variant}.go"
        report = json.loads(run([sys.executable, "-I", checker, source.name, spec], corpus,
                                code=1 if variant == "buggy" else 0))
        status = "counterexample" if variant == "buggy" else "verified"
        require(report["status"] == status and report["model"] == model
                and report["source_sha256"] == HASHES[source.name]
                and report["contract"] == json.loads(spec.read_text()), f"Unexpected report: {report}")
        certificate = report.pop("lean_certificate")
        committed = HERE / "certificates" / f"{variant}.lean"
        if not record:
            require(committed.read_bytes() == certificate.encode(), f"Certificate drift: {variant}")
        rows = observe(source, work)
        audit = kernel_check(variant, model, certificate, rows, work)
        certificates[committed] = certificate.encode()
        result["variants"][variant] = dict(report=report, certificate_sha256=digest(certificate.encode()),
                                           axioms=audit, observations=rows)
    if record:
        for target, data in certificates.items():
            target.write_bytes(data)
    return result


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--corpus", type=Path, default=HERE / "upstream")
    cli.add_argument("--record", action="store_true", help="regenerate the checked repository evidence")
    args = cli.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        result = replay(args.corpus.resolve(), Path(tmp), args.record)
        print(run(["go", "version"], tmp).strip(), run(["lean", "--version"], tmp).strip(), sep="\n")
    saved = HERE / "results.json"
    if args.record:
        saved.write_text(json.dumps(result, indent=2) + "\n")
    else:
        require(result == json.loads(saved.read_text()), "Measured evidence differs from results.json")
    for label, row in result["variants"].items():
        witness = next(obs for obs in row["observations"] if obs["case"] == "witness")
        print(label, row["report"]["status"], witness)
