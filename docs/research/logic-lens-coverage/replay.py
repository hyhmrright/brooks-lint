"""Run the original logic-lens files through an installed brooks-verify checker."""
import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

# Independent obligations distilled from the probe metadata. Keep unrepresentable
# properties as prose so an admission probe cannot certify a weaker surrogate.
CASES = {
    "001": ("main", "version", "A metadata match failure leaves all target files unchanged."),
    "002": ("run_case", "cid", "Worker command failure makes the outer pipeline exit nonzero."),
    "003": ("format", "date", "Concurrent calls format each input without interference."),
    "004": ("processFiles", "paths", "Successful iterations release the file before the next iteration."),
    "005": ("is_leap_year", "year", "year % 4 == 0 and not (year % 100 == 0 and year % 400 != 0)"),
    "006": ("isValidList", "input", "List validation avoids pathological worst-case matching time."),
    "007": ("fib", "n", "Sharing the private memo across calls preserves Fibonacci values."),
    "008": ("fanOut", "ids", "Under Go 1.22 each goroutine captures its own iteration value."),
    "009": ("dedupe", "items", "Preserve first occurrence order without quadratic membership scans."),
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def run(checker, source_root):
    base = source_root / "evals/real-world/probes"
    rows = []
    probes = sorted(base.glob("*/meta.json"))
    if {p.parent.name[:3] for p in probes} != CASES.keys():
        raise ValueError("The supplied probe inventory differs from the research baseline")
    with tempfile.TemporaryDirectory() as scratch:
        spec = Path(scratch, "contract.json")
        for metadata in probes:
            folder = metadata.parent
            number = folder.name[:3]
            meta = json.loads(metadata.read_text())
            function, parameter, predicate = CASES[number]
            contract = dict(function=function, parameter=parameter, predicate=predicate,
                            reference=f"{metadata.relative_to(source_root)}")
            spec.write_text(json.dumps(contract))
            variants = ["fixed"] if meta.get("decoy") else ["buggy", "fixed"]
            for variant in variants:
                source, = folder.glob(variant + ".*")
                relative = source.relative_to(source_root)
                result = subprocess.run([sys.executable, "-I", checker, relative, spec],
                                        cwd=source_root, capture_output=True, text=True, timeout=30)
                report = json.loads(result.stdout)
                status = report["status"]
                if result.returncode != {"verified": 0, "counterexample": 1, "unverified": 2}[status]:
                    raise RuntimeError(result.stdout + result.stderr)
                row = dict(path=str(relative), sha256=sha(source.read_bytes()), contract=contract,
                           executable_contract=number == "005", exit_code=result.returncode,
                           report=report)
                if status != "unverified":
                    if number != "005" or row["sha256"] != report["source_sha256"]:
                        raise ValueError("Unexpected certification outside the encoded contract")
                    certificate = Path(scratch, "Replay.lean")
                    certificate.write_text(report["lean_certificate"])
                    subprocess.run(["lean", certificate], cwd=scratch, check=True)
                    row["certificate_replayed"] = True
                rows.append(row)
    return dict(corpus_revision=subprocess.check_output(
                    ["git", "-C", source_root, "rev-parse", "HEAD"], text=True).strip(),
                checker_sha256=sha(checker.read_bytes()), lean=subprocess.check_output(
                    ["lean", "--version"], text=True).strip(), results=rows)


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("checker", type=Path)
    cli.add_argument("logic_lens_checkout", type=Path)
    args = cli.parse_args()
    print(json.dumps(run(args.checker.resolve(), args.logic_lens_checkout.resolve()), indent=2))
