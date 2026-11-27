"""Changed Java behavior, an unsupported contract, or a missing kernel must fail closed."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
CASE = ROOT / "docs/research/logic-lens-003"
CHECKER = ROOT / "skills/brooks-verify/scripts/verify_date.py"
POLICY = json.loads((CASE / "contract.json").read_text())
BUGGY = (CASE / "upstream/buggy.java").read_text()
FIXED = (CASE / "upstream/fixed.java").read_text()


class DateAdmissionTest(unittest.TestCase):
    def reject(self, source, contract=POLICY, missing_lean=False):
        with tempfile.TemporaryDirectory() as tmp:
            subject = Path(tmp, "TimestampFormatter.java")
            spec = Path(tmp, "contract.json")
            subject.write_text(source)
            spec.write_text(json.dumps(contract))
            proc = subprocess.run([sys.executable, "-I", CHECKER, subject, spec], cwd=tmp,
                                  env=dict(os.environ, PATH=tmp) if missing_lean else None,
                                  capture_output=True, text=True, timeout=30)
            report = json.loads(proc.stdout)
            self.assertEqual((proc.returncode, report["status"]), (2, "unverified"))
            self.assertNotIn("lean_certificate", report)
            if missing_lean:
                self.assertIn("Lean", report["reason"])

    def test_semantic_changes(self):
        for source, old, new in [
            (BUGGY, "static String", "static synchronized String"),
            (FIXED, "HH:mm:ss", "hh:mm:ss"),
            (FIXED, "format(when)", "format(when.plusDays(1))"),
            (FIXED, "import java.time.format.", "import custom."),
            (FIXED, "/** Called concurrently from many request-handler threads. */",
             "/**/ static { System.exit(0); } //*/"),
            (FIXED, "public class", "// decoded before Java comment lexing" + r"\u000a" + "class Extra {}\npublic class"),
        ]:
            with self.subTest(new=new):
                self.assertEqual(source.count(old), 1)
                self.reject(source.replace(old, new))

    def test_unsupported_contract(self):
        for field, value in [("pattern", "yyyy"), ("result", "some_input"), ("reference", "")]:
            with self.subTest(field=field):
                self.reject(FIXED, {**POLICY, field: value})

    def test_both_statuses_require_kernel(self):
        for source in [BUGGY, FIXED]:
            self.reject(source, missing_lean=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
