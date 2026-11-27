"""Regression checks for the supported batch-update source-to-model bridge."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
CHECKER = ROOT / "skills/brooks-verify/scripts/verify_batch.py"
PROBE = ROOT / "docs/research/logic-lens-001"
FIXED = (PROBE / "upstream/fixed.py").read_text()
BUGGY = (PROBE / "upstream/buggy.py").read_text()
CONTRACT = json.loads((PROBE / "contract.json").read_text())
LEAN = shutil.which("lean")


class BatchUpdateTest(unittest.TestCase):
    def setUp(self):
        work = tempfile.TemporaryDirectory()
        self.addCleanup(work.cleanup)
        self.work = Path(work.name)

    def run_checker(self, source, contract=CONTRACT, path=None):
        module = self.work / "subject.py"
        module.write_text(source, encoding="utf-8")
        spec = self.work / "contract.json"
        spec.write_text(json.dumps(contract), encoding="utf-8")
        env = os.environ.copy()
        if path is not None:
            env["PATH"] = path
        proc = subprocess.run([sys.executable, "-I", CHECKER, module, spec], cwd=self.work,
                              capture_output=True, text=True, env=env, timeout=30)
        return proc.returncode, json.loads(proc.stdout)

    def assert_unverified(self, source, contract=CONTRACT, path=None):
        code, report = self.run_checker(source, contract, path)
        self.assertEqual(code, 2, report)
        self.assertEqual(report["status"], "unverified")
        self.assertTrue(report["reason"])
        self.assertNotIn("lean_certificate", report)
        return report

    def test_contract_must_name_exact_failure_and_guarantee(self):
        for update in [{"failure": "any_exception"}, {"function": "compute_patch"},
                       {"target_contents": "unspecified"}, {"required_writes": "at_most_one"},
                       {"reference": ""}, {"kind": "stable-dedupe-v1"},
                       {"lean_certificate": "example : True := trivial"}]:
            with self.subTest(update=update):
                self.assert_unverified(FIXED, {**CONTRACT, **update})

    def test_rejects_changed_control_flow_and_inventory(self):
        mutations = [
            ("    return path, new_text", "    path.write_text(new_text)\n    return path, new_text"),
            ("if count != 1:", "if count > 1:"),
            ('sys.exit(f"ERROR: no {what}', 'print(f"ERROR: no {what}'),
            ("    patches.append(", "    patches[0][0].write_text(patches[0][1])\n    patches.append("),
            ("        path.write_text(new_text)", "        path.write_text('changed')"),
            ("    # Phase 2:", "    patches = []\n    # Phase 2:"),
            ('    "gemini-extension.json",', '    "package.json",'),
            ('    "gemini-extension.json",', '    "../outside.json",'),
        ]
        for old, new in mutations:
            with self.subTest(old=old, new=new):
                self.assertIn(old, FIXED)
                self.assert_unverified(FIXED.replace(old, new))

    def test_top_level_effect_is_rejected_without_evaluation(self):
        marker = self.work / "should-not-exist"
        changed = FIXED.replace("JSON_FILES = [", f"Path({str(marker)!r}).touch()\nJSON_FILES = [")
        self.assert_unverified(changed)
        self.assertFalse(marker.exists())

    def test_rejects_unreachable_concrete_witness(self):
        self.assert_unverified(BUGGY.replace('"package.json",', '"different.json",'))

    def test_missing_lean_cannot_issue_proof_or_counterexample(self):
        for source in (FIXED, BUGGY):
            with self.subTest(fixed=source == FIXED):
                report = self.assert_unverified(source, path=str(self.work))
                self.assertIn("Lean", report["reason"])

    @unittest.skipUnless(LEAN, "Lean 4 unavailable; batch kernel checks skipped")
    def test_both_pinned_sources(self):
        for text, exit_code, status, model in [(BUGGY, 1, "counterexample", "eager"),
                                               (FIXED, 0, "verified", "staged")]:
            with self.subTest(model=model):
                code, report = self.run_checker(text)
                self.assertEqual((code, report["status"], report["model"]), (exit_code, status, model))
                self.assertEqual(report["source_sha256"], hashlib.sha256(text.encode()).hexdigest())
                self.assertEqual(report["contract"], CONTRACT)
                self.assertTrue(report["lean_certificate"])
                if model == "eager":
                    self.assertEqual(report["writes"], ["package.json"])
                    self.assertEqual(report["failed_target"], ".claude-plugin/plugin.json")
                    self.assertEqual(report["failed_target_contents"], "{}\n")
                    self.assertEqual(json.loads(report["before"]), {"version": "1.0.0"})
                    self.assertEqual(json.loads(report["after"]), {"version": "2.0.0"})

    @unittest.skipUnless(LEAN, "Lean 4 unavailable; batch kernel checks skipped")
    def test_structural_admission_uses_effects_instead_of_helper_name(self):
        changed = FIXED.replace("compute_patch", "replace_once").replace(
            "    patches = [", "    # Reviewed metadata inputs.\n    patches  =  [")
        code, report = self.run_checker(changed)
        self.assertEqual((code, report["status"], report["model"]), (0, "verified", "staged"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
