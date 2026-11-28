"""Run an installed batch checker and reproduce a pre-admission frozen refusal."""
import json
import subprocess
import sys


def require(condition, detail):
    if not condition:
        raise ValueError(detail)


def invoke(argv, cwd, check=True):
    return subprocess.run(argv, cwd=cwd, check=check, capture_output=True, text=True, timeout=60)


def check(checker, source, contract, cwd, verdict):
    result = invoke([sys.executable, "-I", checker, source, contract], cwd, check=False)
    report = json.loads(result.stdout)
    require(report["status"] == verdict and result.returncode ==
            {"unverified": 2, "counterexample": 1}[verdict], report)
    if verdict == "unverified":
        require("lean_certificate" not in report, report)
    return report


def baseline(work, root, revision):
    folder = work / "frozen"
    folder.mkdir()
    # The frozen checker imports lean_review. Neither refusal reaches proof generation.
    for name in ("verify_batch.py", "lean_review.py"):
        (folder / name).write_bytes(subprocess.check_output(
            ["git", "show", f"{revision}:skills/brooks-verify/scripts/{name}"], cwd=root))
    return folder / "verify_batch.py"
