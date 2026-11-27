"""Regression tests for the source-to-model and contract boundaries of 004."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
CASE = ROOT / "docs/research/logic-lens-004"
CHECKER = ROOT / "skills/brooks-verify/scripts/verify_handles.py"
FIXED = (CASE / "upstream/fixed.go").read_bytes()
CONTRACT = json.loads((CASE / "contract.json").read_bytes())


class LifetimeTest(unittest.TestCase):
    def rejected(self, raw, reason, contract=CONTRACT, no_lean=False):
        with tempfile.TemporaryDirectory() as tmp:
            source, spec = Path(tmp, "unit.go"), Path(tmp, "contract.json")
            source.write_bytes(raw)
            spec.write_text(json.dumps(contract))
            env = dict(os.environ, PATH=tmp) if no_lean else os.environ
            proc = subprocess.run([sys.executable, "-I", CHECKER, source, spec], cwd=tmp, env=env,
                                  text=True, capture_output=True, timeout=30)
            report = json.loads(proc.stdout)
            self.assertEqual((proc.returncode, report["status"]), (2, "unverified"))
            self.assertIn(reason, report["reason"])
            self.assertNotIn("lean_certificate", report)

    def test_removed_close_and_unmodeled_effects(self):
        for old, new in [(b"defer f.Close()", b""), (b"defer f.Close()", b"f.Close()"),
                         (b"return scan(f)", b"go scan(f)\nreturn nil"),
                         (b"os.Open(p)", b"os.Create(p)"),
                         (b"package fileutil", b"//go:build ignore\n\npackage fileutil"),
                         (b"package fileutil", b"// +build ignore\n\npackage fileutil")]:
            with self.subTest(new=new):
                self.assertEqual(FIXED.count(old), 1)
                self.rejected(FIXED.replace(old, new), "Unsupported")

    def test_weaker_or_mistyped_contracts(self):
        for k, v in [("max_live", 2), ("max_live", True), ("live_at_return", False),
                     ("function", "processOne"), ("reference", "  "), ("extra", "ok")]:
            with self.subTest(key=k, value=v):
                self.rejected(FIXED, "Expected", {**CONTRACT, k: v})

    def test_certification_requires_kernel_for_both_forms(self):
        for version in ("buggy", "fixed"):
            self.rejected((CASE / f"upstream/{version}.go").read_bytes(), "Lean", no_lean=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
