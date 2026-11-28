#!/usr/bin/env python3
"""Bump the Logic-Lens version across every metadata location in one shot.

FIXED version (see ../meta.json). Two-phase write: validate and compute every
patch first, writing nothing until all files match, then write the batch. A
mid-run failure can no longer leave the repo half-bumped and version-inconsistent.

Usage:
    python3 scripts/bump-version.py 0.7.0
"""
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

JSON_FILES = [
    "package.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".codex-plugin/plugin.json",
    "gemini-extension.json",
]


def compute_patch(path: Path, pattern: str, replacement: str, what: str) -> tuple[Path, str]:
    """Read + substitute, returning (path, new_text). Writes nothing. Exits if no match."""
    text = path.read_text()
    new_text, count = re.subn(pattern, replacement, text, count=1)
    if count != 1:
        sys.exit(f"ERROR: no {what} found in {path.relative_to(REPO)}")
    return path, new_text


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("Usage: python3 scripts/bump-version.py <new-version>   (e.g. 0.7.0)")
    version = sys.argv[1].lstrip("v")
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        sys.exit(f"ERROR: '{version}' is not a X.Y.Z version")

    # Phase 1: validate every file matches and compute new contents. Write nothing yet,
    # so a no-match failure aborts before any file on disk has been touched.
    patches = [
        compute_patch(
            REPO / rel,
            r'("version"\s*:\s*")[^"]*(")',
            rf"\g<1>{version}\g<2>",
            '"version" field',
        )
        for rel in JSON_FILES
    ]
    patches.append(
        compute_patch(
            REPO / "README.md",
            r"(version-)[^-]*(-blue)",
            rf"\g<1>{version}\g<2>",
            "version-X-blue badge",
        )
    )

    # Phase 2: every file matched — now commit the batch to disk.
    for path, new_text in patches:
        path.write_text(new_text)

    print(f"Bumped version to {version} across {len(JSON_FILES)} metadata files + README badge.")
    print("Running validate-repo.sh ...", flush=True)
    sys.exit(subprocess.run(["bash", "scripts/validate-repo.sh"], cwd=REPO).returncode)


if __name__ == "__main__":
    main()
