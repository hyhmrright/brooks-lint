"""Run the released bump2version CLI and a one-edit eager mutant on real files."""
import base64
import csv
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

UPSTREAM = Path(__file__).resolve().parent / "upstream"
TARGETS = ["first.txt", "second.txt", "third.txt"]

# Observe target write opens, including relative paths used by the upstream CLI.
CHILD = """
import json, os, sys
from pathlib import Path
sys.path.insert(0, sys.argv[1])
from bumpversion.cli import main
targets = json.loads(sys.argv[2])
writes = []
def audit(event, args):
    if event == 'open' and isinstance(args[0], str) and args[2] & (os.O_WRONLY | os.O_RDWR):
        path = Path(args[0]).resolve()
        if path.parent == Path.cwd() and path.name in targets:
            writes.append(path.name)
sys.addaudithook(audit)
try:
    main(['--current-version', '1.0.0', 'major', *targets])
finally:
    print(json.dumps(writes))
"""


def observe(package, failure, eager):
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        before = {name: b"missing\n" if name == failure else b"1.0.0\n" for name in TARGETS}
        for name, data in before.items():
            (root / name).write_bytes(data)
        proc = subprocess.run([sys.executable, "-I", "-B", "-c", CHILD, str(package),
                               json.dumps(TARGETS)], cwd=root, capture_output=True, text=True,
                              timeout=30, env={"PATH": "", "HOME": tmp})
        writes = json.loads(proc.stdout.strip())
        after = {name: (root / name).read_bytes() for name in TARGETS}
        expected = TARGETS if failure is None else TARGETS[:TARGETS.index(failure)] if eager else []
        if (writes != expected or proc.returncode != int(failure is not None)
                or any(after[n] != (b"2.0.0\n" if n in expected else before[n]) for n in TARGETS)
                or (failure and f"VersionNotFoundException: Did not find '1.0.0' in file: '{failure}'" not in proc.stderr)):
            raise ValueError((failure, writes, after, proc.stderr))
        return dict(scenario="missing-match:" + failure if failure else "success",
                    preparation_failure=bool(failure), exit_code=proc.returncode, writes=writes,
                    changed=[n for n in TARGETS if before[n] != after[n]])


def observe_released(work):
    with (UPSTREAM / "RECORD").open() as record:
        for name, digest, size in csv.reader(record):
            if name.startswith("bumpversion/"):
                raw = (UPSTREAM / name).read_bytes()
                encoded = base64.urlsafe_b64encode(hashlib.sha256(raw).digest()).rstrip(b"=").decode()
                if digest != "sha256=" + encoded or len(raw) != int(size):
                    raise ValueError(f"Release RECORD mismatch for {name}")
    for eager in [False, True]:
        package = UPSTREAM
        if eager:
            package = work / "eager-bump2version"
            shutil.copytree(UPSTREAM / "bumpversion", package / "bumpversion")
            cli = package / "bumpversion/cli.py"
            original = cli.read_text()
            calls = ["_check_files_contain_version(files, current_version, context)",
                     "_replace_version_in_files(files, current_version, new_version, args.dry_run, context)"]
            before = "\n".join("    " + c for c in calls)
            after = "    for target in files:\n" + "\n".join("        " + c.replace("(files,", "([target],") for c in calls)
            if original.count(before) != 1:
                raise ValueError("Unexpected release CLI")
            cli.write_text(original.replace(before, after))
        yield ("bump2version-eager" if eager else "bump2version-1.0.1",
               package / "bumpversion/cli.py", [observe(package, t, eager) for t in [*TARGETS, None]])
