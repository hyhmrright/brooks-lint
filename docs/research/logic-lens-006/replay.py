"""Replay the pinned 006 list-language evidence with Lean and Node."""
import argparse
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(HERE.parent))
from go_replay import digest, require, run

REV = "3b158e228127e21bff7be6530e3923de0793a907"
HASHES = {
    "buggy.js": "6e00232f7c6a15039b4ef85c4b139cd975ad72831b01c99cf7443933c957fbd4",
    "fixed.js": "6cac49c94e738416b28413a2764ae88fdacd08c48c8431c32ab788d2c25d71d1",
}


def audit(certificate, variant, theorem, work):
    path = work / "Audit.lean"
    path.write_text(certificate + "\n" + (HERE / f"audit-{variant}.lean.inc").read_text())
    line = run(["lean", path], work).strip()
    name = f"'WordList.{theorem}'"
    prefix = f"{name} depends on axioms: ["
    require(line == f"{name} does not depend on any axioms" or
            (line.startswith(prefix) and line.endswith("]") and
             set(line[len(prefix):-1].split(", ")) <= {"propext", "Quot.sound", "Classical.choice"}),
            f"Unexpected Lean audit output: {line}")
    return line


def replay(corpus, work, record):
    version = run(["lean", "--version"], work).strip()
    require("version 4.19.0," in version, "Expected Lean 4.19.0")
    print(version, run(["node", "--version"], work).strip(), sep="\n")
    dest = work / "installed"
    run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", dest], work)
    checker = dest / "brooks-verify/scripts/verify_list.py"
    spec = HERE / "contract.json"
    results = dict(corpus_revision=REV, upstream_sha256=HASHES, checker_sha256=digest(checker.read_bytes()),
                   variants={})
    artifacts = {}
    for variant, model, theorem, status, code in [
        ("buggy", "loose", "empty_counterexample", "counterexample", 1),
        ("fixed", "strict", "strict_correct", "verified", 0),
    ]:
        source = corpus / f"{variant}.js"
        require(digest(source.read_bytes()) == HASHES[source.name], f"Source drift: {source.name}")
        report = json.loads(run([sys.executable, "-I", checker, source.name, spec], corpus, code))
        require(report["status"] == status and report["model"] == model and
                report["source_sha256"] == HASHES[source.name] and
                report["contract"] == json.loads(spec.read_text()), f"Unexpected verdict: {report}")
        if variant == "buggy":
            require(report["witness"] == dict(input="", actual=True, expected=False), "Unexpected witness")
        certificate = report.pop("lean_certificate")
        deps = audit(certificate, variant, theorem, work)
        module = work / f"{variant}.cjs"
        shutil.copyfile(source, module)
        observations = json.loads(run(["node", HERE / "observe.cjs", module, variant], work))
        results["variants"][variant] = dict(report=report, axioms=deps,
            certificate_sha256=digest(certificate.encode()), node=observations)
        artifacts[HERE / "certificates" / f"{variant}.lean"] = certificate.encode()
        print(variant, status, observations["character_slot_checks"], "character slot checks")
    artifacts[HERE / "results.json"] = (json.dumps(results, indent=2) + "\n").encode()
    for path, data in artifacts.items():
        if record:
            path.write_bytes(data)
        else:
            require(data == path.read_bytes(), f"Evidence drift: {path.name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, default=HERE / "upstream")
    parser.add_argument("--record", action="store_true", help="regenerate checked evidence")
    args = parser.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH", "NODE_OPTIONS"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        replay(args.corpus.resolve(), Path(tmp), args.record)
