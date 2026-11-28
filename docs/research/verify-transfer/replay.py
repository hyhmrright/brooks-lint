"""Apply the frozen Python batch checker to the real Node release updater."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
REV = "7c1a6f3ce50de016ea0dc2f73db14b061bd11200"


def main():
    with tempfile.TemporaryDirectory() as tmp:
        repo = Path(tmp)
        scripts = repo / "scripts"
        scripts.mkdir()
        for name in ("bump-version.mjs", "version-refs.mjs"):
            data = subprocess.check_output(["git", "show", f"{REV}:scripts/{name}"], cwd=ROOT)
            (scripts / name).write_bytes(data)
        source = scripts / "bump-version.mjs"
        install = repo / "installed"
        subprocess.run(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", install], check=True)
        run = subprocess.run([sys.executable, "-I", install / "brooks-verify/scripts/verify_batch.py",
                              source, HERE.parent / "logic-lens-001/contract.json"], capture_output=True, text=True)
        report = json.loads(run.stdout)
        if run.returncode != 2 or report.get("status") != "unverified" or "lean_certificate" in report:
            raise ValueError(f"Expected the Python-only batch checker to abstain: {report}")
        (repo / "package.json").write_text('{"version":"2.1.0"}')
        first = repo / ".claude-plugin/plugin.json"
        first.parent.mkdir()
        first.write_text('{"version":"2.0.0"}')
        second = first.with_name("marketplace.json")
        second.write_text('{"plugins":[]}')
        before = [p.read_bytes() for p in (first, second)]
        native = subprocess.run(["node", source], cwd=repo, capture_output=True, text=True)
        if (native.returncode == 0 or "TypeError" not in native.stderr
                or json.loads(first.read_text())["version"] != "2.1.0"
                or first.read_bytes() == before[0] or second.read_bytes() != before[1]):
            raise ValueError(f"Unexpected native outcome: {native}")
        print(json.dumps(dict(revision=REV, source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                              checker=report, node_exit=native.returncode, changed=[str(first.relative_to(repo))])))


if __name__ == "__main__":
    main()
