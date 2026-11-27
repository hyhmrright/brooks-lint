"""Install the skill, verify the pinned 001 sources and replay filesystem failures."""
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
TARGETS = ["package.json", ".claude-plugin/plugin.json", ".claude-plugin/marketplace.json",
           ".codex-plugin/plugin.json", "gemini-extension.json", "README.md"]
HASHES = {"buggy.py": "b6961dd1a0d091456ed2ffe18ae57a37313b9c07e3808afb80ca6bc1b066c440",
          "fixed.py": "4d4af91d57755bb8e3da2927ca72ca7c2f3fcc213bb361cbe1e74117e6a84319",
          "meta.json": "7185268ed6fdc470fbba2d5249c5fd35e8093a10de882f0674427b47b5d63126"}
# Executed in a fresh interpreter inside a temporary repository. Observe write
# opens separately from byte changes, so even a rewrite of identical bytes counts.
OBSERVER = """
import json, os, runpy, sys
from pathlib import Path
root = Path.cwd()
script = root / 'scripts/bump-version.py'
targets = json.loads(sys.argv[1])
writes = []
def observe(event, args):
    if event == 'open' and isinstance(args[0], str) and args[2] & (os.O_WRONLY | os.O_RDWR):
        p = Path(args[0])
        if p.is_relative_to(root) and p.relative_to(root).as_posix() in targets:
            writes.append(p.relative_to(root).as_posix())
sys.addaudithook(observe)
sys.argv = [str(script), '2.0.0']
try:
    runpy.run_path(str(script), run_name='__main__')
finally:
    print('WRITE_TRACE=' + json.dumps(writes))
"""
CHALLENGES = {
    "buggy": '''∀ tail : List BatchUpdate.Target,
      let ts := BatchUpdate.firstTarget :: BatchUpdate.secondTarget :: tail
      let r := BatchUpdate.eager BatchUpdate.exampleDisk ts
      r.failure = some ".claude-plugin/plugin.json" ∧ r.writes = ["package.json"] ∧
      BatchUpdate.exampleDisk "package.json" = "{\\"version\\": \\"1.0.0\\"}\\n" ∧
      r.disk "package.json" = "{\\"version\\": \\"2.0.0\\"}\\n" ∧
      r.disk "package.json" ≠ BatchUpdate.exampleDisk "package.json"''',
    "fixed": '''∀ (initial : BatchUpdate.Disk) (targets : List BatchUpdate.Target) (bad : String),
      BatchUpdate.prepare initial targets = .error bad →
      let r := BatchUpdate.staged initial targets
      r.failure = some bad ∧ r.writes = [] ∧ r.disk = initial''',
}


def require(ok, message):
    if not ok:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def run(args, cwd, expected=0):
    proc = subprocess.run(args, cwd=cwd, text=True, capture_output=True, timeout=45)
    require(proc.returncode == expected, f"{args[0]} exit {proc.returncode}: {proc.stdout}{proc.stderr}")
    return proc


def observe(source, variant, failure=None, validator_rc=0, same_version=False):
    with tempfile.TemporaryDirectory() as tmp:
        repo = Path(tmp).resolve()
        scripts = repo / "scripts"
        scripts.mkdir()
        shutil.copyfile(source, scripts / "bump-version.py")
        (scripts / "validate-repo.sh").write_text(f"touch validator-called\nexit {validator_rc}\n")
        before = {}
        for target in TARGETS:
            path = repo / target
            path.parent.mkdir(parents=True, exist_ok=True)
            text = 'version-1.0.0-blue\n' if target == "README.md" else '{"version": "1.0.0"}\n'
            if same_version:
                text = text.replace("1.0.0", "2.0.0")
            if target == failure:
                text = "missing badge\n" if target == "README.md" else "{}\n"
            before[target] = text.encode()
            path.write_bytes(before[target])
        rc = 1 if failure else validator_rc
        proc = run([sys.executable, "-I", "-B", "-c", OBSERVER, json.dumps(TARGETS)], repo, rc)
        writes = json.loads(proc.stdout.splitlines()[-1].removeprefix("WRITE_TRACE="))
        expected = TARGETS if not failure else TARGETS[:TARGETS.index(failure)] if variant == "buggy" else []
        require(writes == expected, f"{variant} {failure}: observed {writes}, expected {expected}")
        called = (repo / "validator-called").exists()
        require(called == (failure is None), "Post-write validator reached at wrong phase")
        if failure:
            require(f"found in {failure}" in proc.stderr, "Failure was not the required match check")
        after = {target: (repo / target).read_bytes() for target in TARGETS}
        for target in TARGETS:
            desired = before[target].replace(b"1.0.0", b"2.0.0") if target in expected else before[target]
            require(after[target] == desired, f"Unexpected bytes at {target}")
        return dict(failed_match=failure, exit_code=rc, writes=writes,
                    changed=[t for t in TARGETS if before[t] != after[t]], post_validator_called=called,
                    initially_at_requested_version=same_version)


def replay(corpus, work):
    for name, digest in HASHES.items():
        require(sha((corpus / name).read_bytes()) == digest, f"Unrecognized source: {name}")
    require("version 4.19.0," in run(["lean", "--version"], work).stdout, "Expected Lean 4.19.0")
    run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", work / "skills"], work)
    checker = work / "skills/brooks-verify/scripts/verify_batch.py"
    data = {"logic_lens_commit": "3b158e228127e21bff7be6530e3923de0793a907",
            "lean": "4.19.0", "source_hashes": HASHES, "checker_sha256": sha(checker.read_bytes()),
            "variants": {}}
    contract = json.loads((HERE / "contract.json").read_text())
    for variant, status, rc in [("buggy", "counterexample", 1), ("fixed", "verified", 0)]:
        source = corpus / f"{variant}.py"
        result = json.loads(run([sys.executable, "-I", "-B", checker, source.name, HERE / "contract.json"],
                                corpus, rc).stdout)
        cert = result.pop("lean_certificate")
        require(result["source_sha256"] == HASHES[source.name] and result["status"] == status
                and result["contract"] == contract and result["targets"] == TARGETS, "Wrong obligation or source")
        if variant == "buggy":
            require(result["writes"] == TARGETS[:1] and result["failed_target"] == TARGETS[1]
                    and result["before"] == '{"version": "1.0.0"}\n'
                    and result["after"] == '{"version": "2.0.0"}\n'
                    and result["failed_target_contents"] == "{}\n", "Wrong witness")
        stored = HERE / "certificates" / f"{variant}.lean"
        require(cert.encode() == stored.read_bytes(), f"{variant}: committed certificate differs")
        program = work / "Check.lean"
        program.write_text(cert + "\ntheorem checked001 : " + CHALLENGES[variant] + " := reviewedContract\n"
                           + "#print axioms checked001\n#print axioms BatchUpdate.stagedAccepted\n"
                           + "#print axioms BatchUpdate.exampleRejects\n")
        audit = run(["lean", program], work).stdout.strip().splitlines()
        require(audit == [f"'{n}' does not depend on any axioms" for n in
                          ["checked001", "BatchUpdate.stagedAccepted", "BatchUpdate.exampleRejects"]],
                f"Unexpected dependencies or diagnostics: {audit}")
        observations = [observe(source, variant, failure=t) for t in TARGETS]
        observations.extend([observe(source, variant), observe(source, variant, validator_rc=23),
                             observe(source, variant, failure=TARGETS[1], same_version=True)])
        data["variants"][variant] = dict(report=result, certificate_sha256=sha(cert.encode()),
                                         axiom_audit=audit, observations=observations)
    return data


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--corpus", type=Path, default=HERE / "upstream")
    cli.add_argument("--output", type=Path, help="save a separate measurement")
    args = cli.parse_args()
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as tmp:
        evidence = replay(args.corpus.resolve(), Path(tmp))
    if args.output:
        args.output.write_text(json.dumps(evidence, indent=2) + "\n")
    else:
        require(evidence == json.loads((HERE / "results.json").read_text()), "Evidence differs from record")
    print("001 replay passed: original sources, both certificates, axiom audits, 18 disk checks.")
