"""Check Hermes version-field counterexamples against the unchanged release helper."""
import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import tomllib

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PIN = "4bdc2151b47b551d53dbb2e443ab130e6bb59c1f"
HOLDOUT = HERE.parent / "001-independent/holdout"
sys.path.insert(0, str(HOLDOUT.parent))
from checker_replay import baseline, check, invoke, require

SOURCE = HOLDOUT / "samples/hermes/release.py"
CONTRACT = HERE / "contract.json"
FIRST = "hermes_cli/__init__.py"
LAST = "pyproject.toml"
DATE_LINE = '__release_date__ = "2026.1.1"\n'
INITIAL = {FIRST: '__version__ = "1.0.0"\n' + DATE_LINE, LAST: '[project]\nversion = "1.0.0"\n'}
MISSING = {FIRST: "# no version field\n" + DATE_LINE, LAST: "[project]\n# no version field\n"}


def observe(work, missing):
    work.mkdir()
    initial = INITIAL.copy()
    if missing:
        initial[missing] = MISSING[missing]
    # Validate that the fixtures lack exactly the intended field before execution.
    assignments = {node.targets[0].id for node in ast.parse(initial[FIRST]).body if isinstance(node, ast.Assign)}
    require(("__version__" in assignments) == (missing != FIRST) and "__release_date__" in assignments, initial)
    require(("version" in tomllib.loads(initial[LAST])["project"]) == (missing != LAST), initial)
    script = work / "scripts/release.py"
    script.parent.mkdir()
    shutil.copyfile(SOURCE, script)
    (work / FIRST).parent.mkdir()
    for name, content in initial.items():
        (work / name).write_bytes(content.encode())
    proc = invoke([sys.executable, "-I", "-B", HOLDOUT / "native.py", script, json.dumps([FIRST, LAST])], work)
    receipt = json.loads((work / "return.json").read_bytes())
    require(receipt == {"outcome": "returned", "value": None} and not proc.stderr and not proc.stdout, proc)
    events = json.loads((work / "trace.json").read_bytes())
    require(events == [["open", FIRST], ["open", LAST]], events)
    final = {p: (work / p).read_bytes() for p in initial}
    for path, before in initial.items():
        expected = before if path == missing else before.replace("1.0.0", "2.0.0")
        require(final[path] == expected.encode(), path)
    return dict(function=receipt, harness_exit=proc.returncode, mutations=events,
                before_hex={p: s.encode().hex() for p, s in initial.items()},
                after_hex={p: b.hex() for p, b in final.items()})


def audit(work, program):
    # The theorem projections must also meet independently stated, literal disk claims.
    probe = program
    for i, (bad, good) in enumerate(((FIRST, LAST), (LAST, FIRST)), 1):
        lit = json.dumps
        name = f"hermesDisk{i}"
        probe += f"""
theorem {name} :
    let d := Hermes.initial {lit(bad)}
    let r := Hermes.run d
    d {lit(bad)} = {lit(MISSING[bad])} ∧ d {lit(good)} = {lit(INITIAL[good])} ∧
    r.outcome = .returnedNone ∧ r.writes = [{lit(FIRST)}, {lit(LAST)}] ∧
    r.disk {lit(bad)} = d {lit(bad)} ∧ r.disk {lit(good)} = {lit(INITIAL[good].replace("1.0.0","2.0.0"))} ∧
    r.disk {lit(good)} ≠ d {lit(good)} ∧ ¬ Hermes.required d := reviewedContract.{i}
#print axioms {name}
"""
    path = work / "Audit.lean"
    path.write_text(probe)
    result = invoke(["lean", path], work)
    expected = [f"'hermesDisk{i}' does not depend on any axioms" for i in (1, 2)]
    require(result.stdout.strip().splitlines() == expected and not result.stderr, result)
    return expected


def replay(work, record):
    require(sys.version_info[:2] == (3, 11), "Use Python 3.11")
    require("version 4.19.0," in invoke(["lean", "--version"], work).stdout, "Use Lean 4.19.0")
    frozen = baseline(work, ROOT, PIN)
    old = check(frozen, SOURCE, CONTRACT, work, "unverified")
    legacy = check(frozen, SOURCE, HERE.parent / "logic-lens-001/contract.json", work, "unverified")
    historical = json.loads((HOLDOUT / "results.json").read_bytes())["holdout"]["hermes"]
    require(legacy == historical["checker"], "Frozen refusal drift")
    installed = work / "installed"
    invoke(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", installed], work)
    checker = installed / "brooks-verify/scripts/verify_batch.py"
    report = check(checker, SOURCE, CONTRACT, work, "counterexample")
    digest = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    require(report["source_sha256"] == digest == historical["source_sha256"] and
            report["contract"] == json.loads(CONTRACT.read_bytes()) and report["targets"] == [FIRST, LAST]
            and report["model"] == "hermes-version-update", "Source or contract drift")
    rows = {}
    witnesses = []
    for name, missing in (("success", None), ("first-missing", FIRST), ("last-missing", LAST)):
        row = observe(work / name, missing)
        rows[name] = row
        if missing:
            witnesses.append(dict(scenario=name, missing_target=missing, returned=row["function"]["value"],
                                  mutations=row["mutations"], before=as_text(row["before_hex"]),
                                  after=as_text(row["after_hex"])))
    require(witnesses == report["witnesses"], "Certificate report differs from native witnesses")
    program = report["lean_certificate"]
    axioms = audit(work, program)
    cert = HERE / "counterexamples.lean"
    if record:
        cert.write_bytes(program.encode())
    require(cert.read_bytes() == program.encode(), "Certificate differs")
    control = work / "modified.py"
    source = SOURCE.read_bytes()
    needle = b"    VERSION_FILE.write_text(content)"
    require(source.count(needle) == 1, "Negative control site drift")
    control.write_bytes(source.replace(needle, b'    raise ValueError("missing field")'))
    rejection = check(checker, control, CONTRACT, work, "unverified")
    return dict(frozen_commit=PIN, frozen_new_contract=old, frozen_previous_contract=legacy, status=report["status"],
                source_sha256=digest, model=report["model"], lean="4.19.0", certificate=cert.name,
                certificate_sha256=hashlib.sha256(cert.read_bytes()).hexdigest(), axiom_checks=axioms,
                native=rows, witnesses=witnesses, changed_source_control=rejection)


def as_text(snapshot):
    return {name: bytes.fromhex(contents).decode("ascii") for name, contents in snapshot.items()}


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--record", action="store_true", help="regenerate checked evidence")
    args = cli.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        result = replay(Path(tmp), args.record)
    dest = HERE / "results.json"
    if args.record:
        dest.write_text(json.dumps(result, indent=2) + "\n")
    require(result == json.loads(dest.read_bytes()), "Evidence drift")
    for name, row in result["native"].items():
        print(name, "returned", row["function"]["value"], "writes", row["mutations"])
