"""Replay the two pinned leap-year certificates and check a Gregorian cycle."""
import calendar
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def main():
    baseline = json.loads((HERE.parent / "logic-lens-coverage/results.json").read_text())
    rows = [row for row in baseline["results"] if "/005-" in row["path"]]
    if [Path(row["path"]).stem for row in rows] != ["buggy", "fixed"]:
        raise ValueError("Missing 005 baseline")
    with tempfile.TemporaryDirectory() as tmp:
        install = Path(tmp) / "skills"
        subprocess.run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", install], check=True)
        for row in rows:
            source = HERE / "upstream" / Path(row["path"]).name
            if hashlib.sha256(source.read_bytes()).hexdigest() != row["sha256"]:
                raise ValueError("005 source differs from the pinned corpus")
            spec = Path(tmp) / "contract.json"
            spec.write_text(json.dumps(row["contract"]))
            run = subprocess.run([sys.executable, "-I", install / "brooks-verify/scripts/lean_review.py",
                                  source, spec], capture_output=True, text=True)
            report = json.loads(run.stdout)
            for field in ("status", "lean_certificate"):
                if report.get(field) != row["report"][field]:
                    raise ValueError(f"Unexpected {field} for {source}")
            if run.returncode != row["exit_code"]:
                raise ValueError(f"Unexpected checker exit for {source}")
            predicate = runpy.run_path(str(source))["is_leap_year"]
            mismatches = [y for y in range(1, 401) if predicate(y) != calendar.isleap(y)]
            expected = [100, 200, 300] if source.stem == "buggy" else []
            if mismatches != expected:
                raise ValueError(f"Python disagrees with the expected Gregorian observations: {mismatches}")
            print(f"{source.name}: {report['status']}, native mismatches on years 1..400: {mismatches}")


if __name__ == "__main__":
    main()
