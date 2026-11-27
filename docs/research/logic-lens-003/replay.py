"""Check original 003 sources, independently audit Lean proofs and force the witness in OpenJDK."""
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
    "buggy.java": "30f11fed63bbc5597fb57bbd2e7f18cfcfd034c2186840bd65f89eade37dd01a",
    "fixed.java": "df0400c777160734f804da385d36569ecc4c4c40560d12adc4efdb650ccb8415",
    "meta.json": "9b122d699bc3711e74e134783283e1af20c22d1c1a24863bdedaf7b5841938a6",
}
INPUTS = ["2000-01-01 00:00:00", "2000-01-02 00:00:00"]
SCHEDULE = ["begin 0", "begin 1", "finish 1", "finish 0"]


def native(source, work):
    variant = source.stem
    folder = work / variant
    folder.mkdir()
    shutil.copyfile(source, folder / "TimestampFormatter.java")
    run(["javac", "--release", "17", "-d", ".", "TimestampFormatter.java",
         HERE / "Schedule.java", HERE / "Overlap.java"], folder)
    lines = run(["java", "-cp", ".", "Schedule", variant], folder).splitlines()
    outcomes = INPUTS if variant == "fixed" else [INPUTS[1], INPUTS[1]]
    require(lines == [f"sequential A {INPUTS[0]}", f"sequential B {INPUTS[1]}",
                      f"overlap B {outcomes[1]}", f"overlap A {outcomes[0]}"],
            f"{variant}: unexpected JVM observations {lines}")
    return lines


def audit(variant, certificate, work):
    path = work / "Audit.lean"
    path.write_text(certificate + "\n" + (HERE / f"audit-{variant}.lean.inc").read_text())
    line = run(["lean", path], work).strip()
    name = "fixed003" if variant == "fixed" else "interferes003"
    prefix = f"'{name}' depends on axioms: ["
    require(line == f"'{name}' does not depend on any axioms" or
            (line.startswith(prefix) and line.endswith("]") and
             set(line[len(prefix):-1].split(", ")) <= {"propext", "Quot.sound", "Classical.choice"}),
            f"Unexpected proof dependencies: {line}")
    return line


def replay(corpus, work, record):
    version = run(["lean", "--version"], work).strip()
    require("version 4.19.0," in version, "Expected Lean 4.19.0")
    print(version, run(["java", "--version"], work).strip(), sep="\n")
    for filename, expected in HASHES.items():
        require(digest((corpus / filename).read_bytes()) == expected, f"Source drift: {filename}")
    dest = work / "installed"
    run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", dest], work)
    checker = dest / "brooks-verify/scripts/verify_date.py"
    spec = HERE / "contract.json"
    results = dict(corpus_revision=REV, upstream_sha256=HASHES, checker_sha256=digest(checker.read_bytes()),
                   variants={})
    artifacts = {}
    for variant, model, status, code in [("buggy", "sharedCalendar", "counterexample", 1),
                                         ("fixed", "perCall", "verified", 0)]:
        source = corpus / f"{variant}.java"
        report = json.loads(run([sys.executable, "-I", checker, source.name, spec], corpus, code))
        require(report["status"] == status and report["model"] == model and
                report["source_sha256"] == HASHES[source.name] and
                report["contract"] == json.loads(spec.read_text()), f"Unexpected verdict: {report}")
        if code == 1:
            require(report["witness"] == dict(inputs=INPUTS, schedule=SCHEDULE, outputs=[INPUTS[1]] * 2),
                    "Unexpected counterexample")
        certificate = report.pop("lean_certificate")
        deps = audit(variant, certificate, work)
        observations = native(source, work)
        results["variants"][variant] = dict(report=report, axioms=deps,
            certificate_sha256=digest(certificate.encode()), jvm=observations)
        artifacts[HERE / "certificates" / f"{variant}.lean"] = certificate.encode()
        print(variant, status, observations, sep=" | ")
    artifacts[HERE / "results.json"] = (json.dumps(results, indent=2) + "\n").encode()
    for path, data in artifacts.items():
        if record:
            path.write_bytes(data)
        else:
            require(data == path.read_bytes(), f"Evidence drift: {path.name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, default=HERE / "upstream", help="pinned 003 probe directory")
    parser.add_argument("--record", action="store_true", help="regenerate checked evidence")
    args = parser.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH", "JAVA_TOOL_OPTIONS", "_JAVA_OPTIONS", "JDK_JAVA_OPTIONS",
                "JDK_JAVAC_OPTIONS", "CLASSPATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        replay(args.corpus.resolve(), Path(tmp), args.record)
