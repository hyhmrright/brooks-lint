"""Replay the pinned patch-ng CLI, frozen checker and installed skill offline."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import runpy
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PIN = "be2dda5aac7a709041ec80481c604be576d2673c"
HOLDOUT = HERE.parent / "001-independent/holdout"
sys.path.insert(0, str(HOLDOUT.parent))
from checker_replay import baseline, check, invoke, require

SOURCE = HOLDOUT / "samples/patch-ng/patch_ng.py"
CONTRACT = HERE / "contract.json"
LEGACY = HERE.parent / "logic-lens-001/contract.json"
SCENARIOS = ("success", "first-mismatch", "last-mismatch")
TARGETS = ["first.txt", "last.txt"]


def observe(work):
    native = runpy.run_path(str(HOLDOUT / "replay.py"))["observe"]
    measured = []
    for scenario in SCENARIOS:
        folder = work / scenario
        row = native("patch-ng", SOURCE, scenario, folder)
        require(not list(folder.glob("*.orig")), "Unexpected surviving backup")
        measured.append(row)
    historical = json.loads((HOLDOUT / "results.json").read_bytes())["holdout"]["patch-ng"]
    require(measured == historical["observations"], "Real CLI differs from the original holdout")
    return measured


def audit(work, program):
    # State the observable obligation independently of the checker's witness predicate.
    claim = """(bad good : String) : Prop :=
      let d := PatchNg.initial bad
      let r := PatchNg.run d
      r.failures = [bad] ∧ PatchNg.exitCode r = 255 ∧
      r.mutations = [("os.rename", good), ("open", good)] ∧
      d good = "old\\n" ∧ r.disk good = "new\\n" ∧
      d bad = "unmatched\\n" ∧ r.disk bad = "unmatched\\n" ∧ r.disk good ≠ d good
"""
    statements = [("auditFirst", "first.txt", "last.txt"), ("auditLast", "last.txt", "first.txt")]
    probe = program + "\nprivate def diskClaim " + claim
    for index, (name, bad, good) in enumerate(statements, 1):
        probe += f'theorem {name} : diskClaim "{bad}" "{good}" := reviewedContract.{index}\n#print axioms {name}\n'
    probe += ('theorem auditContract : PatchNg.witness "first.txt" "last.txt" ∧ '
              'PatchNg.witness "last.txt" "first.txt" := reviewedContract\n#print axioms auditContract\n')
    path = work / "Audit.lean"
    path.write_text(probe)
    result = invoke(["lean", path], work)
    expected = [f"'{name}' does not depend on any axioms" for name in ("auditFirst", "auditLast", "auditContract")]
    require(result.stdout.strip().splitlines() == expected and not result.stderr, result)
    return expected


def replay(work, record):
    require(sys.version_info[:2] == (3, 11) and os.name == "posix", "Use POSIX Python 3.11")
    require("version 4.19.0," in invoke(["lean", "--version"], work).stdout, "Use Lean 4.19.0")
    old = baseline(work, ROOT, PIN)
    size_refusal = check(old, SOURCE, LEGACY, work, "unverified")
    require(size_refusal["reason"] == "File exceeds the 32 KiB review limit", size_refusal)
    old_contract_result = check(old, SOURCE, CONTRACT, work, "unverified")
    install = work / "installed"
    invoke(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", install], work)
    checker = install / "brooks-verify/scripts/verify_batch.py"
    default_refusal = check(checker, SOURCE, LEGACY, work, "unverified")
    require(default_refusal == size_refusal, "General source limit drift")
    report = check(checker, SOURCE, CONTRACT, work, "counterexample")
    data = SOURCE.read_bytes()
    require(report["source_sha256"] == hashlib.sha256(data).hexdigest() and
            report["contract"] == json.loads(CONTRACT.read_bytes()) and report["targets"] == TARGETS
            and report["model"] == "patch-ng-1.18.1", "Source, contract or model drift")

    observations = observe(work)
    witnesses = []
    for row, bad, good in zip(observations[1:], TARGETS, reversed(TARGETS)):
        require(row["changed"] == [good], row)
        witnesses.append(dict(scenario=row["scenario"], failed_target=bad, exit=row["exit"],
                              mutations=row["mutations"], before=decode(row["before_hex"]),
                              after=decode(row["after_hex"])))
    require(witnesses == report["witnesses"], "Checker witnesses do not match disk observations")
    program = report["lean_certificate"]
    axioms = audit(work, program)
    cert = HERE / "counterexamples.lean"
    if record:
        cert.write_bytes(program.encode())
    require(program.encode() == cert.read_bytes(), "Certificate differs")

    # Preserve length when altering failure handling, then append a byte to the genuine source.
    old_code = b"return (errors == 0)"
    require(data.count(old_code) == 1, "Source mutation site drift")
    controls = {"default-limit": default_refusal}
    for name, content in [("changed-return", data.replace(old_code, b"return (errors != 0)")),
                          ("extra-byte", data + b"\n")]:
        path = work / (name + ".py")
        path.write_bytes(content)
        controls[name] = check(checker, path, CONTRACT, work, "unverified")
    return dict(frozen_commit=PIN, frozen_previous_contract=size_refusal, frozen_new_contract=old_contract_result,
                source_sha256=report["source_sha256"], source_bytes=len(data), status=report["status"],
                model=report["model"], certificate=cert.name, certificate_sha256=hashlib.sha256(cert.read_bytes()).hexdigest(),
                lean="4.19.0", axiom_checks=axioms, native=observations, witnesses=witnesses, controls=controls)


def decode(snapshot):
    return {name: bytes.fromhex(contents).decode("ascii") for name, contents in snapshot.items()}


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--record", action="store_true", help="regenerate the checked evidence")
    args = cli.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        result = replay(Path(tmp), args.record)
    dest = HERE / "results.json"
    if args.record:
        dest.write_text(json.dumps(result, indent=2) + "\n")
    require(result == json.loads(dest.read_bytes()), "Evidence drift")
    for row in result["native"]:
        print(row["scenario"], "exit", row["exit"], "target mutations", row["mutations"])
