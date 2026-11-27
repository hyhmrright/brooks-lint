"""Shared process helpers for the offline Go/Lean case replays."""
import hashlib
import json
import os
import shutil
import subprocess


def digest(data):
    return hashlib.sha256(data).hexdigest()


def require(ok, message):
    if not ok:
        raise ValueError(message)


def run(args, cwd, code=0, env=None):
    p = subprocess.run(args, cwd=cwd, capture_output=True, text=True, timeout=120, env=env)
    require(p.returncode == code, f"{args[0]} exit {p.returncode}\n{p.stdout}{p.stderr}")
    return p.stdout


def go_observations(source, observer, work):
    folder = work / source.stem
    folder.mkdir()
    shutil.copyfile(source, folder / source.name)
    shutil.copyfile(observer, folder / "observe_test.go")
    (folder / "go.mod").write_text("module observation\n\ngo 1.22\n")
    env = dict(os.environ, GOCACHE=str(work / "gocache"), GOWORK="off", GOFLAGS="",
               GOTOOLCHAIN="local", GOPROXY="off", CGO_ENABLED="0")
    log = run(["go", "test", "-count=1", "-timeout=30s", "-v", "."], folder, env=env)
    return [json.loads(line[4:]) for line in log.splitlines() if line.startswith("OBS ")]
