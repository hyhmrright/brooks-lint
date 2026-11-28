"""Ensure source or contract drift cannot receive a word-list certificate."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
CASE = ROOT / "docs/research/logic-lens-006"
CHECKER = ROOT / "skills/brooks-verify/scripts/verify_list.py"
POLICY = json.loads((CASE / "contract.json").read_text())
FIXED = (CASE / "upstream/fixed.js").read_text()
BUGGY = (CASE / "upstream/buggy.js").read_text()


class WordListAdmissionTest(unittest.TestCase):
    def reject(self, source, contract=POLICY, missing_lean=False):
        with tempfile.TemporaryDirectory() as tmp:
            subject = Path(tmp, "validator.js")
            spec = Path(tmp, "contract.json")
            subject.write_text(source)
            spec.write_text(json.dumps(contract))
            proc = subprocess.run([sys.executable, "-I", CHECKER, subject, spec], cwd=tmp,
                                  env=dict(os.environ, PATH=tmp) if missing_lean else None,
                                  capture_output=True, text=True, timeout=30)
            result = json.loads(proc.stdout)
            self.assertEqual((proc.returncode, result["status"]), (2, "unverified"))
            self.assertNotIn("lean_certificate", result)
            if missing_lean:
                self.assertIn("Lean", result["reason"])

    def test_modified_semantics(self):
        for source in [FIXED.replace("$/.test", "$/m.test"), FIXED.replace("^", ""),
                       FIXED.replace("test(input)", 'test("")'), FIXED + "\nisValidList = null;",
                       FIXED.replace("module.exports", "global.exports")]:
            with self.subTest(source=source):
                self.assertNotEqual(source, FIXED)
                self.reject(source)

    def test_line_comment_boundaries(self):
        for end in ["\r", "\u2028", "\u2029"]:
            self.reject("// comment" + end + "isValidList = null;\n" + FIXED)

    def test_contract_scope(self):
        for changes in [{"reference": ""}, {"language": "any_list"}, {"cost": "linear"}]:
            self.reject(FIXED, {**POLICY, **changes})

    def test_both_statuses_require_kernel(self):
        for source in [BUGGY, FIXED]:
            self.reject(source, missing_lean=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
