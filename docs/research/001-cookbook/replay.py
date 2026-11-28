"""Check both installed and frozen verifiers against unchanged Cookbook CLI executions."""
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
HOLDOUT = HERE.parent / "001-independent/holdout"
ORIGINAL = HOLDOUT / "samples/cookbook/apply_patch.py"
PIN = "a71343d52c99057f706234aa375f967109d57a5a"
FILES = ["first.txt", "middle.txt", "last.txt"]
STAGED = """∀ (disk : BatchUpdate.Disk) (ts : List BatchUpdate.Target) (bad : String),
    BatchUpdate.prepare disk ts = .error bad →
    (BatchUpdate.staged disk ts).failure = some bad ∧
    (BatchUpdate.staged disk ts).writes = [] ∧ (BatchUpdate.staged disk ts).disk = disk"""
ANY_POSITION = """∀ (disk : BatchUpdate.Disk) (pre : List BatchUpdate.Target)
    (t : BatchUpdate.Target) (post : List BatchUpdate.Target), t.patch (disk t.path) = none →
    let r := BatchUpdate.staged disk (pre ++ t :: post)
    r.writes = [] ∧ r.disk = disk"""
EAGER = """let r := BatchUpdate.eager cookbookDisk cookbookTargets
    r.failure = some "last.txt" ∧ r.writes = ["first.txt"] ∧
    cookbookDisk "first.txt" = "old\\n" ∧ r.disk "first.txt" = "new\\n" ∧
    r.disk "last.txt" = "unmatched\\n" ∧ r.disk "first.txt" ≠ cookbookDisk "first.txt" """


def require(ok, message):
    if not ok:
        raise ValueError(message)


def run(args, cwd, stdin=None, check=True):
    return subprocess.run(args, cwd=cwd, input=stdin, text=True, capture_output=True,
                          check=check, timeout=60)


def update(path, new="new"):
    return f"*** Update File: {path}\n@@\n-old\n+{new}\n"


def cases():
    # (name, initial contents, patch sections, expected successful-prefix mutations)
    for bad in [None, *FILES]:
        before = {p: "unmatched\n" if p == bad else "old\n" for p in FILES}
        prefix = FILES if bad is None else FILES[:FILES.index(bad)]
        yield bad or "success", before, "".join(update(p) for p in FILES), {p: "new\n" for p in prefix}
    for new in ["new", "old"]:
        yield ("witness" if new == "new" else "same-bytes"), {
            "first.txt": "old\n", "last.txt": "unmatched\n"
        }, update("first.txt", new) + update("last.txt"), {"first.txt": new + "\n"}
    yield "second-hunk", {"first.txt": "old\n", "last.txt": "old\n"}, (
        update("first.txt") + update("last.txt") + "@@\n-missing\n+replacement\n"
    ), {"first.txt": "new\n"}
    yield "mixed", {"created": None, "deleted": "keep\n", "last.txt": "unmatched\n"}, (
        "*** Add File: created\n+added\n*** Delete File: deleted\n" + update("last.txt")
    ), {"created": "added", "deleted": None}


def snapshot(folder, names):
    return {name: (folder / name).read_bytes().decode() if (folder / name).exists() else None
            for name in names}


def observe(source, directory, model):
    observations = {}
    for scenario, initial, body, prefix in cases():
        work = directory / scenario
        work.mkdir(parents=True)
        for p, content in initial.items():
            if content is not None:
                (work / p).write_bytes(content.encode())
        before = snapshot(work, initial)
        cli = run([sys.executable, "-I", "-B", HOLDOUT / "native.py", source,
                   json.dumps(list(initial))], work, "*** Begin Patch\n" + body + "*** End Patch\n")
        failed = scenario != "success"
        diagnostic = "Invalid context at 1:\nmissing\n" if scenario == "second-hunk" else "Invalid context at 0:\nold\n"
        require((cli.stdout, cli.stderr) == (("", diagnostic) if failed
                else ("Done!\n", "")), (scenario, cli))
        applied = {} if failed and model == "original" else prefix
        after = snapshot(work, initial)
        events = json.loads((work / "trace.json").read_text())
        expected = [["os.remove" if value is None else "open", p] for p, value in applied.items()]
        require(after == before | applied and events == expected, (model, scenario, after, events))
        observations[scenario] = dict(before=before, after=after, mutations=events, exit=cli.returncode,
                                      stdout=cli.stdout, stderr=cli.stderr)
    return observations


def frozen(work):
    directory = work / "baseline"
    directory.mkdir()
    files = ["verify_batch.py", "lean_review.py", "BatchUpdate.lean", "batch-staged.lean.inc",
             "batch-eager.lean.inc", "batch-early-flush.lean.inc"]
    for f in files:
        (directory / f).write_bytes(subprocess.check_output(
            ["git", "show", f"{PIN}:skills/brooks-verify/scripts/{f}"], cwd=ROOT))
    return directory / files[0]


def check(checker, source, contract, cwd, expected):
    proc = run([sys.executable, "-I", checker, source, contract], cwd, check=False)
    output = json.loads(proc.stdout)
    require(output["status"] == expected and proc.returncode == {
        "verified": 0, "counterexample": 1, "unverified": 2}[expected], (source.name, output))
    if expected == "unverified":
        require("lean_certificate" not in output, output)
    return output


def replay(work, record):
    require("version 4.19.0," in run(["lean", "--version"], work).stdout, "Expected Lean 4.19.0")
    install = work / "install"
    run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", install], work)
    checker = install / "brooks-verify/scripts/verify_batch.py"
    baseline = frozen(work)
    mutant = work / "apply_patch.py"
    shutil.copyfile(ORIGINAL, mutant)
    run(["git", "apply", "--no-index", HERE / "eager.patch"], work)
    contract = HERE / "contract.json"
    rows = {}
    for mode, src, verdict in [("original", ORIGINAL, "verified"), ("per-file", mutant, "counterexample")]:
        obs = observe(src, work / mode, mode)
        legacy = check(baseline, src, HERE.parent / "logic-lens-001/contract.json", work, "unverified")
        frozen_result = check(baseline, src, contract, work, "unverified")
        result = check(checker, src, contract, work, verdict)
        digest = hashlib.sha256(src.read_bytes()).hexdigest()
        require(result["source_sha256"] == digest and result["contract"] == json.loads(contract.read_bytes()),
                "Source or contract binding drift")
        program = result["lean_certificate"]
        cert = HERE / "certificates" / (mode + ".lean")
        audit = work / "Audit.lean"
        claim = STAGED if mode == "original" else EAGER
        probes = "\ntheorem auditCookbook : " + claim + " := reviewedContract\n#print axioms auditCookbook\n"
        expected_axioms = ["'auditCookbook' does not depend on any axioms"]
        if mode == "original":
            probes += ("theorem auditPosition : " + ANY_POSITION +
                       " := anyRejectedTargetNoWrites\n#print axioms auditPosition\n")
            expected_axioms.append("'auditPosition' does not depend on any axioms")
        audit.write_text(program + probes)
        proof = run(["lean", audit], work)
        require(proof.stdout.strip().splitlines() == expected_axioms
                and not proof.stderr, proof)
        if mode == "per-file":
            witness = obs["witness"]
            bad = result["failed_target"]
            require(result["writes"] == [p for event, p in witness["mutations"]]
                    and result["before"] == witness["before"]["first.txt"]
                    and result["after"] == witness["after"]["first.txt"]
                    and bad == "last.txt" and result["failed_target_contents"] == witness["after"][bad],
                    "Native witness differs from certificate report")
        if record:
            cert.parent.mkdir(exist_ok=True)
            cert.write_bytes(program.encode())
        require(cert.read_bytes() == program.encode(), cert)
        rows[mode] = dict(frozen=frozen_result, frozen_with_previous_contract=legacy,
                          status=verdict, model=result["model"], source_sha256=digest,
                          certificate=cert.relative_to(HERE).as_posix(),
                          certificate_sha256=hashlib.sha256(program.encode()).hexdigest(), runs=obs)
    # Same phase order with a write hidden in the context matcher must be rejected.
    drift = work / "unreviewed.py"
    needle = '            if new_index == -1:\n'
    text = ORIGINAL.read_text()
    require(text.count(needle) == 1, "Mutation site drift")
    drift.write_text(text.replace(needle, needle + '                pathlib.Path("first.txt").write_text("changed")\n'))
    drift_report = check(checker, drift, contract, work, "unverified")
    return dict(frozen_commit=PIN, lean="4.19.0", samples=rows, changed_helper_control=drift_report)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--record", action="store_true", help="regenerate checked-in evidence")
    args = parser.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        result = replay(Path(tmp), args.record)
    output = HERE / "results.json"
    if args.record:
        output.write_text(json.dumps(result, indent=2) + "\n")
    require(result == json.loads(output.read_bytes()), "Evidence differs")
    for name, row in result["samples"].items():
        print(f"{name}: {row['frozen']['status']} -> {row['status']}, {len(row['runs'])} native runs")
