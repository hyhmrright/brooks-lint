"""Check source and contract changes that would invalidate the 008 proof."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
CASE = ROOT / "docs/research/logic-lens-008"
CHECKER = ROOT / "skills/brooks-verify/scripts/verify_capture.py"
FIXED = (CASE / "upstream/fixed.go").read_text()
SHARED = (CASE / "controls/shared.go").read_text()
CONTRACT = json.loads((CASE / "contract.json").read_text())


class CaptureBoundaryTest(unittest.TestCase):
    def reject(self, raw, contract=CONTRACT, no_kernel=False):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp, "subject.go")
            source.write_text(raw)
            spec = Path(tmp, "contract.json")
            spec.write_text(json.dumps(contract))
            proc = subprocess.run([sys.executable, "-I", CHECKER, source, spec], cwd=tmp,
                                  env=dict(os.environ, PATH=tmp) if no_kernel else None,
                                  text=True, capture_output=True, timeout=30)
            report = json.loads(proc.stdout)
            self.assertEqual((proc.returncode, report["status"]), (2, "unverified"))
            self.assertTrue(report["reason"])
            self.assertNotIn("lean_certificate", report)
            if no_kernel:
                self.assertIn("Lean", report["reason"])

    def test_version_binding_and_wait_order(self):
        for source, old, new in [
            (FIXED, "//go:build go1.22\n", ""),
            (FIXED, "//go:build go1.22\n", "//go:build go1.21\n"),
            (FIXED, "//go:build go1.22\n\n", "//go:build go1.22 || linux\n\n"),
            (FIXED, "for _, id := range ids", "var id int\n\tfor _, id = range ids"),
            (FIXED, "wg.Add(1)", "wg.Add(2)"),
            (FIXED, "defer wg.Done()", "wg.Done()"),
            (FIXED, "handle(id)", "handle(id)\n\t\t\thandle(id)"),
            (FIXED, "wg.Wait()", ""),
            (SHARED, "<-ready", ""),
            (SHARED, "close(ready)", ""),
        ]:
            with self.subTest(change=(old, new)):
                self.assertEqual(source.count(old), 1)
                self.reject(source.replace(old, new))

    def test_contract_changes(self):
        for field, value in [("binding", "last_value"), ("function", "run"), ("go_semantics", "1.21"),
                             ("at_return", "unique_values"), ("reference", " "), ("other", 42)]:
            with self.subTest(field=field):
                self.reject(FIXED, {**CONTRACT, field: value})

    def test_both_results_require_kernel(self):
        for source in [FIXED, SHARED]:
            self.reject(source, no_kernel=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
