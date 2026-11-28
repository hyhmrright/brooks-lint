"""Run an upstream entry point and observe attempted mutations of named targets."""
import json
import os
from pathlib import Path
import runpy
import sys

source, targets_json = sys.argv[1:3]
targets = {str(Path(name).absolute()): name for name in json.loads(targets_json)}
events = []


def record(event, args):
    if event == "open":
        flags = args[2]
        if not flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND):
            return
        paths = args[:1]
    elif event == "os.rename":
        paths = args[:2]
    elif event == "os.remove":
        paths = args[:1]
    else:
        return
    for path in paths:
        if isinstance(path, (str, bytes)):
            target = targets.get(os.path.abspath(os.fsdecode(path)))
            if target:
                events.append([event, target])


sys.addaudithook(record)
sys.argv = [source, *sys.argv[3:]]
try:
    if Path(source).name == "release.py":
        value = runpy.run_path(source)["update_version_files"]("2.0.0", "2026.1.1")
        Path("return.json").write_text(json.dumps({"outcome": "returned", "value": value}))
    else:
        runpy.run_path(source, run_name="__main__")
finally:
    Path("trace.json").write_text(json.dumps(events))
