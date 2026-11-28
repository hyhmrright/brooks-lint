"""Replay both checker revisions against identical source bytes and native observations."""
import argparse
import itertools
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from replay import CASE, ROOT, measure, observe_released, observe_variants, sha
from variants import load_native_observer

ORACLE = load_native_observer()
EXPECTED = {
    "bump2version-1.0.1": ("unverified", None),
    "bump2version-eager": ("unverified", None),
    "staged-layout": ("verified", "staged"),
    "eager-layout": ("counterexample", "eager"),
    "staged-explicit-loop": ("verified", "staged"),
    "early-metadata-flush": ("counterexample", "early-flush"),
    "lazy-commit": ("counterexample", "lazy"),
}
METADATA_PATHS = json.dumps(ORACLE.TARGETS[:-1])
EARLY_CLAIM = f'''let paths : List String := {METADATA_PATHS}
    let r := BatchUpdate.flushThenBadge BatchUpdate.badgeDisk BatchUpdate.metadataTargets BatchUpdate.badgeTarget
    r.failure = some "README.md" ∧ r.writes = paths ∧
    paths.map BatchUpdate.badgeDisk = List.replicate 5 BatchUpdate.oldJSON ∧
    paths.map r.disk = List.replicate 5 BatchUpdate.newJSON ∧
    r.disk "README.md" = "missing badge\\n" ∧ BatchUpdate.newJSON ≠ BatchUpdate.oldJSON'''


def require(condition, message):
    if not condition:
        raise ValueError(message)


def audit(report, work, certificate_dir, record):
    model = report["model"]
    cert = report["lean_certificate"].encode()
    kind = "fixed" if model == "staged" else "buggy"
    if model == "early-flush":
        path = certificate_dir / "early-flush.lean"
        claim = EARLY_CLAIM
        if record:
            path.write_bytes(cert)
    else:
        path = ROOT / CASE / "certificates" / (kind + ".lean")
        claim = ORACLE.CHALLENGES[kind]
    require(path.read_bytes() == cert, f"Certificate differs: {path}")
    probe = work / "Audit.lean"
    probe.write_text(cert.decode() + "\ntheorem compared001 : " + claim +
                     " := reviewedContract\n#print axioms compared001\n")
    run = subprocess.run(["lean", probe], cwd=work, capture_output=True, text=True, check=True, timeout=30)
    require(run.stdout.strip() == "'compared001' does not depend on any axioms" and not run.stderr,
            f"Unexpected proof dependencies: {run.stdout}{run.stderr}")
    certificate = (HERE / "expanded" / path.name if model == "early-flush" else path).relative_to(ROOT)
    return dict(certificate=certificate.as_posix(), certificate_sha256=sha(cert))


def compare(work, evidence_dir, record):
    sources = list(itertools.chain(observe_released(work), observe_variants(work)))
    baseline = measure(work, sources)
    require(baseline == json.loads((HERE / "results.json").read_text()), "Frozen evidence drift")
    require(set(baseline["samples"]) == set(EXPECTED), "Sample inventory drift")
    install = work / "install"
    subprocess.run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", install],
                   cwd=work, check=True, capture_output=True, timeout=45)
    checker = install / "brooks-verify/scripts/verify_batch.py"
    contract = work / "contract.json"  # materialized from the baseline commit
    results = {}
    for name, source, observations in sources:
        old = baseline["samples"][name]
        require(old["source_sha256"] == sha(source.read_bytes()), f"{name}: source drift")
        run = subprocess.run([sys.executable, "-I", checker, source, contract], cwd=work,
                             text=True, capture_output=True, timeout=60)
        report = json.loads(run.stdout)
        status = report["status"]
        violations = [o for o in observations if o["preparation_failure"] and (o["writes"] or o["changed"])]
        require(status != "verified" or not violations, f"FALSE VERIFIED: {name}: {violations}")
        require((status, report.get("model")) == EXPECTED[name] and
                run.returncode == {"verified": 0, "counterexample": 1, "unverified": 2}[status], name)
        row = dict(source_sha256=old["source_sha256"], frozen=old["status"], current=status,
                   runs=len(observations), failure_runs_with_writes_or_changes=len(violations))
        if status == "unverified":
            require("lean_certificate" not in report and report["reason"].startswith("Unsupported "), name)
            row["reason"] = report["reason"]
        else:
            require(report["source_sha256"] == row["source_sha256"] and report["targets"] == ORACLE.TARGETS
                    and report["contract"] == json.loads(contract.read_bytes()), name)
            row.update(model=report["model"], **audit(report, work, evidence_dir, record))
        if status == "counterexample":
            bad = report["failed_target"]
            native, = [o for o in observations if o["scenario"] == "missing-match:" + bad]
            # The native observer asserts exact bytes (including trailing newlines) at every path.
            require(native["writes"] == native["changed"] == report["writes"]
                    and report["requested_version"] == "2.0.0"
                    and report["before"] == '{"version": "1.0.0"}\n'
                    and report["after"] == '{"version": "2.0.0"}\n'
                    and report["failed_target_contents"] == ("missing badge\n" if bad == "README.md" else "{}\n"),
                    f"{name}: certified witness differs from disk")
            row.update(failed_target=bad, writes=native["writes"], changed=native["changed"])
        results[name] = row
    return dict(frozen_commit=baseline["checker_commit"], installed_checker_sha256=sha(checker.read_bytes()),
                lean=baseline["lean"], samples=results)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, help="write new evidence to this directory")
    args = parser.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    destination = args.output_dir or HERE / "expanded"
    if args.output_dir:
        destination.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        report = compare(Path(tmp), destination, bool(args.output_dir))
    results_file = destination / "results.json"
    if args.output_dir:
        results_file.write_text(json.dumps(report, indent=2) + "\n")
    else:
        require(report == json.loads(results_file.read_bytes()), "Current evidence differs from record")
    for name, sample in report["samples"].items():
        print(f"{name}: {sample['frozen']} -> {sample['current']}")
