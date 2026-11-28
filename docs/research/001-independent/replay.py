"""Cross-check a frozen 001 verifier against held-out native file observations."""
import argparse
import hashlib
import itertools
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE))
from released import observe_released
from variants import observe_variants

PIN = "cb7fd5211ebcf12b34f3cf96c2368483b2e25e97"
SCRIPTS = "skills/brooks-verify/scripts/"
CASE = "docs/research/logic-lens-001/"


def frozen(path):
    return subprocess.check_output(["git", "show", PIN + ":" + path], cwd=ROOT)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def measure(work, samples=None):
    version = subprocess.check_output(["lean", "--version"], text=True)
    if "version 4.19.0," not in version:
        raise RuntimeError("Expected Lean 4.19.0")
    checker = work / "verify_batch.py"
    for name in [checker.name, "lean_review.py", "BatchUpdate.lean", "batch-staged.lean.inc", "batch-eager.lean.inc"]:
        (work / name).write_bytes(frozen(SCRIPTS + name))
    contract = work / "contract.json"
    contract.write_bytes(frozen(CASE + contract.name))
    results = {}
    if samples is None:
        samples = itertools.chain(observe_released(work), observe_variants(work))
    for name, source, observations in samples:
        proc = subprocess.run([sys.executable, "-I", checker, source, contract], cwd=work,
                              text=True, capture_output=True, timeout=60)
        report = json.loads(proc.stdout)
        status = report["status"]
        digest = sha(source.read_bytes())
        if proc.returncode != {"verified": 0, "counterexample": 1, "unverified": 2}[status]:
            raise RuntimeError((name, proc.stderr, report))
        sample = dict(source_sha256=digest, status=status, observations=observations)
        if status == "unverified":
            if "lean_certificate" in report or not report["reason"].startswith("Unsupported "):
                raise ValueError((name, report))
            sample["reason"] = report["reason"]
        else:
            cert = report["lean_certificate"].encode()
            variant = "fixed" if status == "verified" else "buggy"
            if (report["source_sha256"] != digest or report["contract"] != json.loads(contract.read_bytes())
                    or cert != frozen(CASE + f"certificates/{variant}.lean")):
                raise ValueError(f"{name}: certificate, source or contract mismatch")
            sample["certificate_sha256"] = sha(cert)
            if status == "counterexample":
                witness = [o for o in observations if o["scenario"] == "missing-match:" + report["failed_target"]]
                if len(witness) != 1 or witness[0]["writes"] != report["writes"] or not witness[0]["changed"]:
                    raise ValueError(f"{name}: native witness differs from certificate")
        violations = [o for o in observations if o["preparation_failure"] and (o["writes"] or o["changed"])]
        sample["observed_failure_runs_with_writes_or_changes"] = len(violations)
        if status == "verified" and violations:
            raise RuntimeError(f"FALSE VERIFIED: {name}: {violations}")
        results[name] = sample
    return dict(checker_commit=PIN, lean="4.19.0", samples=results)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, help="save a separate measurement")
    args = parser.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        result = measure(Path(tmp))
    if args.output:
        args.output.write_text(json.dumps(result, indent=2) + "\n")
    elif result != json.loads((HERE / "results.json").read_text()):
        raise SystemExit("Observations differ from results.json")
    for name, sample in result["samples"].items():
        print(name, sample["status"], sample["observed_failure_runs_with_writes_or_changes"])
