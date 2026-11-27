"""Recheck the original Bash probe with installed brooks-verify, Bash, xargs and Lean."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HASHES = {"buggy.sh": "5fba42b865a25557ab613f3f65c24199a4294435b5a84bfc799e8d5742cd1134",
          "fixed.sh": "363d0c2d025122bb01df9a3ebabdaf40e8384a48d8f335dea82d1fcbfea3496e",
          "meta.json": "b7123d300708a68191696cd12d2807fbbd0f24c1c5e2b0228efc9f8c676093bd"}
CHALLENGES = {
    "buggy": """let r := WorkerExit.Run.ran 23 true 0
      WorkerExit.worker .swallowed r = 0 ∧ WorkerExit.child .swallowed r = 0 ∧
      WorkerExit.aggregate 123 [WorkerExit.child .swallowed r] = 0 ∧
      WorkerExit.caller .swallowed 0 123 [r] = 0""",
    "fixed": """∀ (producer aggregateCode commandCode : WorkerExit.Status) (output : Bool)
      (move : WorkerExit.Status) (runs : List WorkerExit.Run),
      commandCode ≠ 0 → aggregateCode ≠ 0 → WorkerExit.Run.ran commandCode output move ∈ runs →
      WorkerExit.worker .propagated (.ran commandCode output move) = commandCode ∧
      WorkerExit.child .propagated (.ran commandCode output move) = commandCode ∧
      WorkerExit.aggregate aggregateCode (runs.map (WorkerExit.child .propagated)) ≠ 0 ∧
      WorkerExit.caller .propagated producer aggregateCode runs ≠ 0""",
}

# Each job specifies the command exit, whether it produces bytes, and whether
# a completed output already exists. No provider CLI, credentials or network.
CASES = {
    "success": [(0, True, False)], "failure-23": [(23, True, False)],
    "failure-1": [(1, True, False)], "failure-255": [(255, True, False)],
    "parallel-fail-then-success": [(23, True, False), (0, True, False)],
    "parallel-success-then-fail": [(0, True, False), (23, True, False)],
    "empty-success": [(0, False, False)], "skipped": [(23, True, True)],
}
STUB = '''#!/bin/sh
read -r id rc emit
printf '%s\\n' "$rc" > "$TRACE/command-$id"
if [ "$emit" = yes ]; then printf 'fixture output\\n'; fi
exit "$rc"
'''
# No wrapper around xargs, no edits to the probe. RETURN sees PIPESTATUS when
# the source finishes. The child's EXIT trap sees bash -c's original status.
DRIVER = r'''
set -uo pipefail
probe=$1
shift
CASE_IDS=("$@")
if [[ $OBSERVE == yes ]]; then
  export BASH_ENV="$TRACE/child-env"
  trap 'printf "%s\n" "${PIPESTATUS[@]}" > "$TRACE/pipeline"' RETURN
fi
source "$probe"
exit "$?"
'''
CHILD_ENV = r'''trap 'printf "%s\n" "$?" > "$TRACE/child-$1"' EXIT'''


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def run(args, cwd, expected=0):
    proc = subprocess.run(args, cwd=cwd, text=True, capture_output=True, timeout=45)
    require(proc.returncode == expected, f"{args[0]} exit {proc.returncode}: {proc.stdout}{proc.stderr}")
    return proc.stdout


def exercise(source, jobs, work, bash, xargs, observe):
    with tempfile.TemporaryDirectory(dir=work) as tmp:
        box = Path(tmp)
        tools = box / "bin"
        tools.mkdir()
        # Only the listed real utilities and the deterministic stand-in are discoverable.
        for name, executable in {"bash": bash, "xargs": xargs, "mv": shutil.which("mv"),
                                 "cat": shutil.which("cat"), "rm": shutil.which("rm")}.items():
            (tools / name).symlink_to(executable)
        stub = tools / "claude"
        stub.write_text(STUB)
        stub.chmod(0o755)
        (box / "child-env").write_text(CHILD_ENV + "\n")
        ids = [str(i + 1) for i in range(len(jobs))]
        for i, (rc, emit, skip) in zip(ids, jobs):
            case = box / f"eval-{i}"
            case.mkdir()
            (case / ".name").write_text("fixture\n")
            (case / "prompt.md").write_text(f"{i} {rc} {'yes' if emit else 'no'}\n")
            if skip:
                (case / "output.md").write_text("completed\n")
        env = dict(PATH=str(tools), HOME=str(box), LC_ALL="C", TRACE=str(box), ITER_DIR=str(box),
                   PARALLEL="2", MODEL="offline-fixture", OBSERVE="yes" if observe else "no")
        proc = subprocess.run([bash, "--noprofile", "--norc", "-c", DRIVER, "probe", source, *ids],
                              cwd=box, env=env, text=True, capture_output=True, timeout=20)
        def trace(name):
            return [(int(p.read_text()) if p.exists() else None) for i in ids
                    for p in [box / f"{name}-{i}"]]
        commands = trace("command")
        fixed = source.name == "fixed.sh"
        expected_commands = [None if skip else rc for rc, _, skip in jobs]
        expected_children = [0 if skip else rc if fixed and rc else 1 if fixed and not emit else 0
                             for rc, emit, skip in jobs]
        require(commands == expected_commands, f"Missing command or unintended skip: {commands} {proc.stderr}")
        require((proc.returncode != 0) == any(expected_children), f"Wrong caller status: {proc.returncode}")
        record = {"command": commands, "caller": proc.returncode}
        if observe:
            children = trace("child")
            require(children == expected_children, f"Unexpected bash child statuses: {children}")
            stages = [int(s) for s in (box / "pipeline").read_text().splitlines()]
            require(stages == [0, proc.returncode], f"Unexpected PIPESTATUS: {stages}")
            record.update(child=children, producer=stages[0], xargs=stages[1])
        return record


def replay(corpus, work, bash, xargs):
    for name, digest in HASHES.items():
        require(sha((corpus / name).read_bytes()) == digest, f"Unrecognized fixture: {name}")
    require("version 4.19.0," in run(["lean", "--version"], work), "Expected Lean 4.19.0")
    run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", work / "skills"], work)
    checker = work / "skills/brooks-verify/scripts/verify_worker.py"
    evidence = dict(logic_lens_commit="3b158e228127e21bff7be6530e3923de0793a907", lean="4.19.0",
                    source_sha256=HASHES, checker_sha256=sha(checker.read_bytes()), variants={})
    runtime = dict(system=platform.system(), bash=run([bash, "--version"], work).splitlines()[0],
                   xargs_path=xargs, xargs_sha256=sha(Path(xargs).read_bytes()), variants={})
    for variant, status in [("buggy", "counterexample"), ("fixed", "verified")]:
        source = corpus / f"{variant}.sh"
        result = json.loads(run([sys.executable, "-I", checker, source.name, HERE / "contract.json"],
                                corpus, int(variant == "buggy")))
        require(result["status"] == status and result["source_sha256"] == HASHES[source.name]
                and result["contract"] == json.loads((HERE / "contract.json").read_text()), "Wrong report")
        certificate = result.pop("lean_certificate")
        require(certificate.encode() == (HERE / "certificates" / f"{variant}.lean").read_bytes(),
                f"{variant}: committed certificate differs")
        check = work / "Check.lean"
        check.write_text(certificate + f"\ntheorem checked002 : {CHALLENGES[variant]} := reviewedContract\n"
                         "#print axioms checked002\n#print axioms WorkerExit.allSuccessful\n")
        audit = run(["lean", check], work).strip().splitlines()
        axioms = "[propext]" if variant == "buggy" else "[propext, Quot.sound]"
        require(audit == [f"'checked002' depends on axioms: {axioms}",
                          "'WorkerExit.allSuccessful' depends on axioms: [propext, Quot.sound]"],
                f"Unexpected axiom set: {audit}")
        portable, local = {}, {}
        for label, jobs in CASES.items():
            measured = exercise(source, jobs, work, bash, xargs, True)
            plain = exercise(source, jobs, work, bash, xargs, False)
            require(all(measured[k] == v for k, v in plain.items()), "Observation altered the outcome")
            local[label] = measured
            portable[label] = {"command": measured["command"], "child": measured["child"],
                               "producer": measured["producer"], "xargs_nonzero": bool(measured["xargs"]),
                               "caller_nonzero": bool(measured["caller"])}
        runtime["variants"][variant] = local
        evidence["variants"][variant] = dict(report=result, certificate_sha256=sha(certificate.encode()),
                                             axioms=audit, observations=portable)
    return evidence, runtime


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--corpus", type=Path, default=HERE / "upstream")
    cli.add_argument("--bash", default="bash")
    cli.add_argument("--xargs", default="xargs")
    cli.add_argument("--output", type=Path, help="write a separate portable measurement")
    cli.add_argument("--runtime-output", type=Path, help="write platform-specific exact statuses")
    args = cli.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    bash, xargs = shutil.which(args.bash), shutil.which(args.xargs)
    require(bash and xargs, "Bash and xargs are required")
    with tempfile.TemporaryDirectory() as tmp:
        evidence, runtime = replay(args.corpus.resolve(), Path(tmp), bash, xargs)
    if args.output:
        args.output.write_text(json.dumps(evidence, indent=2) + "\n")
    else:
        require(evidence == json.loads((HERE / "results.json").read_text()), "Portable measurement differs")
    if args.runtime_output:
        args.runtime_output.write_text(json.dumps(runtime, indent=2) + "\n")
    print("002 replay passed. Command 23: buggy", runtime["variants"]["buggy"]["failure-23"],
          "fixed", runtime["variants"]["fixed"]["failure-23"])
