"""Run the installed-skill proof and runtime replays, stopping on a discrepancy."""
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
for folder in [f"logic-lens-{i:03}" for i in range(1, 10)] + ["verify-transfer"]:
    print(f"Replaying {folder}", flush=True)
    subprocess.run([sys.executable, "-I", HERE / folder / "replay.py"], check=True)
