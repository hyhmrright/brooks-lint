"""Compare the pinned 008 source and a gated shared-variable control in Lean and Go."""
import argparse
import json
import os
from pathlib import Path
import sys
import tempfile

HERE = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(HERE.parent))
from go_replay import digest, go_observations, require, run

ROOT = HERE.parents[2]
REV = "3b158e228127e21bff7be6530e3923de0793a907"
HASHES = {
    "fixed.go": "6d00bdce1fdbcb0fd667344f1da8dbd1fb3c3a7145aedec6a8adf05475fed0bb",
    "meta.json": "b21eb8b64c7670172fc56e38d4ce19812f8faa2fa4b8f3804e2a9e5cc68dcd8f",
}
CHALLENGE = {
    "perIteration": """∀ (ids : List Int) (s : LoopCapture.State),
    LoopCapture.Reachable .perIteration ids s → s.waiting = 0 →
    s.done.Perm ids.zipIdx ∧ ∀ v : Int, (s.done.map Prod.fst).count v = ids.count v""",
    "shared": """∃ s : LoopCapture.State, LoopCapture.Reachable .shared [1, 2] s ∧
    s.waiting = 0 ∧ s.done = [(2, 1), (2, 0)] ∧ ¬s.done.Perm ([1, 2] : List Int).zipIdx""",
}
INPUTS = [[], [7], [1, 2], [3, 7, 3, 9], [-1, -1, -1], [8, 2, 8, -1]]


def audit_certificate(model, certificate, work):
    name = f"{model}008"
    path = work / "Audit.lean"
    checks = [f"theorem {name} : {CHALLENGE[model]} := reviewedContract", f"#print axioms {name}"]
    if model == "perIteration":
        checks.extend(["""theorem binding008 : ∀ (ids : List Int) (s : LoopCapture.State),
    LoopCapture.Reachable .perIteration ids s → ∀ entry ∈ s.done, entry ∈ ids.zipIdx :=
    fun ids s h entry mem => LoopCapture.completedBinding ids s h entry mem""",
                       "#print axioms binding008"])
    path.write_text("\n".join([certificate, *checks]) + "\n")
    audit = run(["lean", path], work).strip().splitlines()
    if model == "perIteration":
        expected = [f"'{n}' depends on axioms: [propext, Quot.sound]" for n in (name, "binding008")]
    else:
        expected = [f"'{name}' depends on axioms: [propext, Classical.choice, Quot.sound]"]
    require(audit == expected, f"Unexpected proof dependencies: {audit}")
    return audit


def native(source, model, work):
    rows = go_observations(source, HERE / "observe_test.go", work)
    cases = [(p, ids) for p in (1, 4) for ids in INPUTS]
    require([(r["gomaxprocs"], r["input"]) for r in rows] == cases, "Incomplete Go observations")
    for row in rows:
        ids = row["input"]
        expected = sorted(ids) if model == "perIteration" else ids[-1:] * len(ids)
        require(row["completed_at_return_sorted"] == expected, f"Observed callbacks: {row}")
    return rows


def replay(corpus, work, record):
    require("version 4.19.0," in run(["lean", "--version"], work), "Expected Lean 4.19.0")
    for name, expected in HASHES.items():
        require(digest((corpus / name).read_bytes()) == expected, f"Digest mismatch: {name}")
    dest = work / "installed"
    run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", dest], work)
    checker = dest / "brooks-verify/scripts/verify_capture.py"
    spec = HERE / "contract.json"
    result = dict(corpus_revision=REV, upstream_sha256=HASHES, checker_sha256=digest(checker.read_bytes()),
                  variants={})
    artifacts = {}
    for source, model, code in [(corpus / "fixed.go", "perIteration", 0),
                                (HERE / "controls/shared.go", "shared", 1)]:
        report = json.loads(run([sys.executable, "-I", checker, source.name, spec], source.parent, code))
        status = "verified" if code == 0 else "counterexample"
        require(report["status"] == status and report["model"] == model and
                report["source_sha256"] == digest(source.read_bytes()) and
                report["contract"] == json.loads(spec.read_text()), f"Unexpected report: {report}")
        certificate = report.pop("lean_certificate")
        audit = audit_certificate(model, certificate, work)
        rows = native(source, model, work)
        if code == 1:
            witness = report["witness"]
            require(witness["inputs"] == [1, 2] and witness["handled"] == [2, 2], "Unexpected witness")
        artifacts[HERE / "certificates" / f"{source.stem}.lean"] = certificate.encode()
        result["variants"][source.stem] = dict(report=report, certificate_sha256=digest(certificate.encode()),
                                              axioms=audit, observations=rows)
    artifacts[HERE / "results.json"] = (json.dumps(result, indent=2) + "\n").encode()
    for path, data in artifacts.items():
        if record:
            path.write_bytes(data)
        else:
            require(path.read_bytes() == data, f"Evidence drift: {path.name}")
    for label, row in result["variants"].items():
        sample = next(r for r in row["observations"] if r["input"] == [3, 7, 3, 9])
        print(label, row["report"]["status"], sample)


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--corpus", type=Path, default=HERE / "upstream")
    cli.add_argument("--record", action="store_true", help="regenerate the checked evidence")
    args = cli.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        print(run(["go", "version"], work).strip(), run(["lean", "--version"], work).strip(), sep="\n")
        replay(args.corpus.resolve(), work, args.record)
