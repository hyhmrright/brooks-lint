"""Regression coverage for applying patches below an unrelated Git worktree."""

import argparse
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch as patch_environment

from replay import GIT_APPLY, Replay


class ReplayGitIsolationTest(unittest.TestCase):
    def test_applies_patch_inside_an_ancestor_repository(self):
        with tempfile.TemporaryDirectory() as directory:
            repository = Path(directory)
            subprocess.run(["git", "init", "-q", repository], check=True)
            output = repository / "output"
            runner = Replay(argparse.Namespace(output=output, python=Path(sys.executable),
                                              pyright=Path("unused"), timeout=5))
            fixture = output / "candidate/tree"
            fixture.mkdir(parents=True)
            source = fixture / "source.py"
            source.write_text("before\n")
            patch = output / "candidate.patch"
            patch.write_text("""diff --git a/source.py b/source.py
--- a/source.py
+++ b/source.py
@@ -1 +1 @@
-before
+after{spacing}
""".format(spacing="  "))
            config = {"GIT_CONFIG_COUNT": "1", "GIT_CONFIG_KEY_0": "apply.whitespace",
                      "GIT_CONFIG_VALUE_0": "fix"}
            with patch_environment.dict(os.environ, config):
                self.assertEqual(runner.command(fixture, output / "check.log",
                                                *GIT_APPLY, "--check", patch), 0)
                self.assertEqual(runner.command(fixture, output / "apply.log",
                                                *GIT_APPLY, patch), 0)
            self.assertEqual(source.read_text(), "after  \n")


if __name__ == "__main__":
    unittest.main()
