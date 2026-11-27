"""Replay case 007 from pinned sources, an installed checker, Lean and real Python."""
import argparse
import json
import os
from pathlib import Path
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(HERE.parent))
from go_replay import digest, require, run

REV = "3b158e228127e21bff7be6530e3923de0793a907"
HASHES = {
    "fixed.py": "1836e75587d29bfceeaf710d3f2d1315cb7783b104ef778dfd2ffc4077488144",
    "meta.json": "5b67d96f2cbe03e7a79525ae8008e04524de7db424b3e3f5926d8aeb407d3a66",
}
HISTORIES = [
    ([], [-1, 0, 0, -3]),
    ([], [8, 5, -1, 9, 8]),
    ([0, 4, 7], [7, -4, 6, 8, 4]),
]
# Independent iterative oracle for the sampled domain.
EXPECTED = [0, 1]
for _ in range(8):
    EXPECTED.append(EXPECTED[-1] + EXPECTED[-2])


def native(source, model, work):
    histories = []
    for seed, inputs in HISTORIES:
        rows = json.loads(run([sys.executable, "-I", HERE / "observe.py", source,
                               json.dumps(seed), json.dumps(inputs)], work))
        require([r["n"] for r in rows] == inputs, "Incomplete Python history")
        before = {n: EXPECTED[n] for n in seed}
        for n, row in zip(inputs, rows):
            after = dict(row["cache"])
            valid = all(0 <= k < len(EXPECTED) and v == EXPECTED[k] for k, v in after.items())
            require(row["valid"] == valid and row["unchanged"] == (after == before),
                    f"Inconsistent cache snapshot: {row}")
            if n < 0:
                require(row["outcome"] == {"exception": "ValueError"} and before == after,
                        f"Negative input changed state or raised the wrong exception: {row}")
            elif model == "correct":
                require(row["outcome"] == {"return": EXPECTED[n]} and valid and n in after and
                        before.items() <= after.items(), f"Fibonacci contract failed: {row}")
            before = after
        histories.append(dict(seed_keys=seed, inputs=inputs, calls=rows))
    return histories


def audit(certificate, model, work):
    file = work / "Audit.lean"
    fixture = HERE / ("audit-original.lean.inc" if model == "correct" else "audit-control.lean.inc")
    file.write_text(certificate + "\n" + fixture.read_text())
    lines = run(["lean", file], work).strip().splitlines()
    names = [line.split()[-1] for line in fixture.read_text().splitlines() if line.startswith("#print axioms ")]
    require(names and len(lines) == len(names), f"Missing Lean axiom reports: {lines}")
    for name, line in zip(names, lines):
        prefix = f"'{name}' depends on axioms: ["
        if line == f"'{name}' does not depend on any axioms":
            continue
        require(line.startswith(prefix) and line.endswith("]") and
                set(line[len(prefix):-1].split(", ")) <= {"propext", "Quot.sound", "Classical.choice"},
                f"Unexpected Lean proof dependencies: {line}")
    return lines


def replay(corpus, work, record):
    version = run(["lean", "--version"], work).strip()
    require("version 4.19.0," in version, "Expected Lean 4.19.0")
    print(sys.version.split()[0], version)
    for name, expected in HASHES.items():
        require(digest((corpus / name).read_bytes()) == expected, f"Unexpected upstream {name}")
    original = corpus / "fixed.py"
    control = HERE / "controls/wrong_store.py"
    require(control.read_bytes() == original.read_bytes().replace(b"_MEMO[n] = result\n",
            b"_MEMO[n] = result + 1\n"), "Control must change only the cache write")
    dest = work / "installed"
    run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", dest], work)
    checker = dest / "brooks-verify/scripts/verify_cache.py"
    spec = HERE / "contract.json"
    results = dict(corpus_revision=REV, upstream_sha256=HASHES, checker_sha256=digest(checker.read_bytes()),
                   variants={})
    artifacts = {}
    for source, model, code in [(original, "correct", 0), (control, "wrongStore", 1)]:
        report = json.loads(run([sys.executable, "-I", checker, source.name, spec], source.parent, code))
        status = "verified" if code == 0 else "counterexample"
        require(report["status"] == status and report["model"] == model and
                report["source_sha256"] == digest(source.read_bytes()) and
                report["contract"] == json.loads(spec.read_text()), f"Unexpected verdict: {report}")
        certificate = report.pop("lean_certificate")
        axioms = audit(certificate, model, work)
        observations = native(source, model, work)
        if code == 1:
            first, hit = observations[0]["calls"][1:3]
            require(report["witness"] == dict(inputs=[0, 0], returns=[0, 1], cache_after_first={"0": 1})
                    and first["cache"] == [[0, 1]] and first["outcome"] == {"return": 0}
                    and hit["outcome"] == {"return": 1}, "Python disagrees with the Lean witness")
        artifacts[HERE / "certificates" / f"{source.stem}.lean"] = certificate.encode()
        results["variants"][source.stem] = dict(report=report, axioms=axioms,
            certificate_sha256=digest(certificate.encode()), histories=observations)
        print(source.name, status, "first zero and cache hit:",
              [r["outcome"]["return"] for r in observations[0]["calls"][1:3]])
    artifacts[HERE / "results.json"] = (json.dumps(results, indent=2) + "\n").encode()
    for path, data in artifacts.items():
        if record:
            path.write_bytes(data)
        else:
            require(path.read_bytes() == data, f"Evidence drift: {path.name}")


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--corpus", type=Path, default=HERE / "upstream", help="upstream 007 probe directory")
    cli.add_argument("--record", action="store_true", help="regenerate certificates and observations")
    args = cli.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        replay(args.corpus.resolve(), Path(tmp), args.record)
