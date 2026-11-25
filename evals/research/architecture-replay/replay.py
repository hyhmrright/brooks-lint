"""Replay a frozen Blinker first refactoring step against an independent oracle."""

import argparse
from collections import Counter
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
import tarfile
import xml.etree.ElementTree as ET

REPO = Path(__file__).resolve().parents[3]
EVIDENCE = REPO / "docs/research/architecture-lifecycle-boundary-replay/evidence.tar.gz"
ARMS = ("checklist", "audit-before", "audit-after", "positive-control")
PROBE_FAILURE = "AssertionError: (False, [])"
CACHES = ("__pycache__", ".mypy_cache", ".pytest_cache", ".ruff_cache")
GIT_APPLY = ("git", "-c", "apply.ignoreWhitespace=no", "apply", "--whitespace=nowarn")


def normalized(name):
    return re.sub(r"[-_.]+", "-", name).lower()

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def extract(archive, target):
    target.mkdir()
    with tarfile.open(archive) as source:
        source.extractall(target, filter="data")


class Replay:
    def __init__(self, args):
        self.args = args
        self.output = args.output.resolve()
        self.output.mkdir(parents=True)
        self.python = args.python.absolute()
        self.pyright = args.pyright.absolute()

    def command(self, tree, log, *command):
        log.parent.mkdir(parents=True, exist_ok=True)
        env = dict(os.environ)
        for key in ("PYTHONHOME", "PYTEST_ADDOPTS", "PYTEST_PLUGINS",
                    "GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR",
                    "GIT_DISCOVERY_ACROSS_FILESYSTEM", "GIT_PREFIX"):
            env.pop(key, None)
        env.update(PYTHONPATH=str(tree / "src"), PYTEST_DISABLE_PLUGIN_AUTOLOAD="1",
                   PATH=os.pathsep.join((str(self.python.parent), env["PATH"])),
                   GIT_CEILING_DIRECTORIES=str(tree.parent))
        with log.open("wb") as output:
            process = subprocess.Popen(command, cwd=tree, env=env, stdout=output,
                                       stderr=subprocess.STDOUT, start_new_session=True)
            try:
                return process.wait(timeout=self.args.timeout)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                process.wait()
                return 124

    def verify_dependencies(self, fixture):
        log = self.output / "python-environment.json"
        code = (
            "import importlib.metadata as m, json, sys;"
            "print(json.dumps({'python': list(sys.version_info[:3]), "
            "'packages': {d.metadata['Name'].lower(): d.version for d in m.distributions()}}))"
        )
        if self.command(fixture, log, self.python, "-c", code):
            raise RuntimeError("Could not inspect the fixture interpreter.")
        observed = json.loads(log.read_text())
        if observed["python"][:2] != [3, 11]:
            raise ValueError("Blinker replay expects Python 3.11.")
        packages = {normalized(name): version for name, version in observed["packages"].items()}
        lock = fixture / "requirements.freeze"
        for line in lock.read_text().splitlines():
            name, pinned = line.split("==", maxsplit=1)
            actual = packages.get(normalized(name))
            if actual != pinned:
                raise ValueError(f"{name}: expected {pinned}; found {actual}.")
        log = self.output / "pyright-version.log"
        if self.command(fixture, log, self.pyright, "--version") or log.read_text().strip() != "pyright 1.1.360":
            raise ValueError("Blinker replay expects Pyright 1.1.360.")

    def tests(self, tree, logs, phase, *extra):
        return self.command(tree, logs / f"{phase}.log", self.python, "-m", "pytest",
                            "-p", "asyncio", "-q", *extra)

    def collect(self, tree, logs, phase, *extra):
        if self.tests(tree, logs, phase, "--collect-only", *extra):
            raise RuntimeError(f"Test collection failed; see {logs / (phase + '.log')}.")
        result = (logs / f"{phase}.log").read_text()
        return {line for line in result.splitlines() if line.startswith("tests/") and "::" in line}

    def verify_tree(self, tree, logs, probe):
        checks = {
            "compile": (self.python, "-m", "compileall", "-q", "src", "tests"),
            "mypy": (self.python, "-m", "mypy"),
            "ruff": (self.python, "-m", "ruff", "check", "--no-fix", "."),
            "ruff-format": (self.python, "-m", "ruff", "format", "--check", "."),
            "probe": (self.python, probe),
        }
        statuses = {name: self.command(tree, logs / f"{name}.log", *command)
                    for name, command in checks.items()}
        statuses["pytest"] = self.tests(tree, logs, "pytest")
        # The fixture uses the same hooks as the historical project's style job.
        # Potentially fixing hooks run on a disposable copy.
        style = tree.parent / "style"
        shutil.copytree(tree, style, ignore=shutil.ignore_patterns(*CACHES))
        statuses["style-git"] = self.command(style, logs / "style-git.log", "git", "init", "-q")
        text = [str(path.relative_to(style)) for path in sorted(style.rglob("*"))
                if path.is_file() and ".git" not in path.parts and path.suffix != ".png"]
        for hook in ("check-merge-conflict", "debug-statement-hook", "fix-byte-order-marker",
                     "trailing-whitespace-fixer", "end-of-file-fixer"):
            files = [name for name in text if name.endswith(".py")] if hook == "debug-statement-hook" else text
            statuses[hook] = self.command(style, logs / f"{hook}.log", self.python.parent / hook, *files)
        pyright_log = logs / "pyright.json"
        pyright_status = self.command(tree, pyright_log, self.pyright, "--outputjson")
        if pyright_status not in (0, 1):
            raise RuntimeError(f"Pyright failed to run; see {pyright_log}.")
        diagnostics = Counter()
        for item in json.loads(pyright_log.read_text())["generalDiagnostics"]:
            file = str(Path(item["file"]).relative_to(tree))
            diagnostics[(file, item["severity"], item.get("rule"), item["message"])] += 1
        return statuses, diagnostics

    def run(self, bundle):
        case = bundle / f"blinker/block-{self.args.block}"
        archived = case / f"results-proxy/blinker/{self.args.arm}"
        patch = self.args.patch.resolve() if self.args.patch else archived / "candidate.patch"
        if not patch.is_file():
            raise ValueError(f"Missing candidate patch: {patch}")
        archived_patch = self.output / "candidate.patch"
        shutil.copyfile(patch, archived_patch)
        patch = archived_patch
        source = case / "blinker-base.tgz"
        probe = case / "protocol/probe.py"
        mutation = case / "protocol/mutate.py"
        baseline = self.output / "baseline/tree"
        candidate = self.output / "candidate/tree"
        logs = candidate.parent / "logs"
        baseline.parent.mkdir()
        candidate.parent.mkdir()
        extract(source, baseline)
        extract(source, candidate)
        self.verify_dependencies(bundle / "blinker")
        proof = self.output / "controls/tree"
        proof.parent.mkdir()
        extract(source, proof)
        controls = proof.parent / "logs"
        receipt = {"case": "blinker", "block": self.args.block, "patch_sha256": digest(patch),
                   "baseline_sha256": digest(source)}
        baseline_checks, baseline_types = self.verify_tree(baseline, baseline.parent / "logs", probe)
        receipt["baseline"] = baseline_checks
        receipt["control"] = {
            "plant": self.command(proof, controls / "plant.log", self.python, mutation, proof),
            "pytest": self.tests(proof, controls, "pytest"),
            "probe": self.command(proof, controls / "probe.log", self.python, probe),
        }
        admitted = (all(code == 0 for code in baseline_checks.values())
                    and receipt["control"] == {"plant": 0, "pytest": 0, "probe": 1}
                    and PROBE_FAILURE in (controls / "probe.log").read_text().splitlines())
        receipt["mutation_admitted"] = admitted
        for label, flags in (("apply-check", ("--check",)), ("apply", ())):
            receipt[label] = self.command(candidate, logs / f"{label}.log", *GIT_APPLY, *flags, patch)
            if receipt[label]:
                return receipt
        self.command(candidate, logs / "changed-files.txt", *GIT_APPLY, "--numstat", patch)
        receipt["changed_files"] = (logs / "changed-files.txt").read_text().splitlines()
        receipt["caller_claims"] = []
        if not self.args.patch and (archived / "answer.txt").is_file():
            answer = (archived / "answer.txt").read_text()
            receipt["caller_claims"] = json.loads(answer[answer.find("{"):answer.rfind("}") + 1])["callers"]
        checks, types = self.verify_tree(candidate, logs, probe)
        receipt["candidate"] = checks
        receipt["baseline_pyright_diagnostics"] = sum(baseline_types.values())
        receipt["introduced_pyright_diagnostics"] = [
            {"path": file, "severity": severity, "rule": rule, "message": message, "count": count}
            for (file, severity, rule, message), count in (types - baseline_types).items()
        ]
        receipt["project_checks_passed"] = all(code == 0 for code in checks.values())

        if checks["pytest"] == 0 and checks["probe"] == 0 and admitted:
            original_nodes = self.collect(baseline, baseline.parent / "logs", "baseline-collect")
            candidate_nodes = self.collect(candidate, logs, "candidate-collect")
            receipt["missing_inherited_tests"] = sorted(original_nodes - candidate_nodes)
            nodes = sorted(candidate_nodes - original_nodes)
            receipt["added_tests"] = nodes
            receipt["authored_assertions"] = []
            receipt["mutation_result"] = "no-added-tests"
            if nodes:
                planted = candidate.parent / "planted"
                shutil.copytree(candidate, planted, ignore=shutil.ignore_patterns(*CACHES))
                plant = self.command(planted, logs / "plant.log", self.python, mutation, planted)
                if plant == 0:
                    probe_status = self.command(planted, logs / "planted-probe.log", self.python, probe)
                    if probe_status == 1 and PROBE_FAILURE in (logs / "planted-probe.log").read_text().splitlines():
                        report = logs / "planted-tests.xml"
                        outcome = self.tests(planted, logs, "planted-tests", f"--junitxml={report}", *nodes)
                        receipt["mutation_result"] = "passed" if outcome == 0 else "inconclusive"
                        if outcome == 1 and report.is_file():
                            failures = ET.parse(report).findall(".//testcase/failure")
                            receipt["authored_assertions"] = [
                                element.get("message") for element in failures
                                if (element.get("message") or "").startswith(("assert ", "AssertionError"))
                            ]
                            if receipt["authored_assertions"]:
                                receipt["mutation_result"] = "detected"
                    else:
                        receipt["mutation_result"] = "probe-did-not-confirm-mutation"
                else:
                    receipt["mutation_result"] = "mutation-not-applicable"
        return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--block", type=int, default=3, choices=range(1, 5))
    selection = parser.add_mutually_exclusive_group()
    selection.add_argument("--arm", default="positive-control", choices=ARMS)
    selection.add_argument("--patch", type=Path)
    parser.add_argument("--python", type=Path, required=True, help="Interpreter with the archived lock installed.")
    parser.add_argument("--pyright", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True, help="New directory for logs and the JSON result.")
    parser.add_argument("--timeout", type=int, default=60, help="Maximum seconds per check.")
    args = parser.parse_args()
    if not args.patch and args.arm == "positive-control" and args.block != 3:
        parser.error("The positive control is archived in block 3.")
    if args.timeout <= 0:
        parser.error("--timeout must be positive")
    replay = Replay(args)
    bundle = replay.output / "archive"
    extract(EVIDENCE, bundle)
    result = replay.run(bundle)
    rendered = json.dumps(result, indent=2) + "\n"
    (replay.output / "result.json").write_text(rendered)
    print(rendered, end="")
    accepted = (result.get("project_checks_passed")
                and result.get("missing_inherited_tests") == []
                and result.get("mutation_result") == "detected")
    return 0 if accepted else 1


if __name__ == "__main__":
    sys.exit(main())
