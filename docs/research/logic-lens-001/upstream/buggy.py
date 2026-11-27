#!/usr/bin/env python3
"""Bump the Logic-Lens version across every metadata location in one shot.

Logic-Lens keeps the version in six places (CLAUDE.md -> Version Sync). Editing
them by hand drifts; validate-repo.sh catches drift but does not fix it. This
script rewrites all six to the target version, preserving each file's existing
formatting, then runs validate-repo.sh to confirm consistency.

Usage:
    python3 scripts/bump-version.py 0.7.0
"""
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

# Only the first `"version"` field is touched, matching validate-repo.sh's
# `grep ... | head -1` extraction. Each file has exactly one version field.
JSON_FILES = [
    "package.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".codex-plugin/plugin.json",
    "gemini-extension.json",
]


def replace_once(path: Path, pattern: str, replacement: str, what: str) -> None:
    text = path.read_text()
    new_text, count = re.subn(pattern, replacement, text, count=1)
    if count != 1:
        sys.exit(f"ERROR: no {what} found in {path.relative_to(REPO)}")
    path.write_text(new_text)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("Usage: python3 scripts/bump-version.py <new-version>   (e.g. 0.7.0)")
    version = sys.argv[1].lstrip("v")
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        sys.exit(f"ERROR: '{version}' is not a X.Y.Z version")

    for rel in JSON_FILES:
        replace_once(
            REPO / rel,
            r'("version"\s*:\s*")[^"]*(")',
            rf"\g<1>{version}\g<2>",
            '"version" field',
        )
    replace_once(
        REPO / "README.md",
        r"(version-)[^-]*(-blue)",
        rf"\g<1>{version}\g<2>",
        "version-X-blue badge",
    )

    print(f"Bumped version to {version} across {len(JSON_FILES)} metadata files + README badge.")
    print("Running validate-repo.sh ...", flush=True)
    sys.exit(subprocess.run(["bash", "scripts/validate-repo.sh"], cwd=REPO).returncode)


if __name__ == "__main__":
    main()
