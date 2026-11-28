"""Unsupported source or policy changes must never inherit the Fibonacci proof."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
CASE = ROOT / "docs/research/logic-lens-007"
CHECKER = ROOT / "skills/brooks-verify/scripts/verify_cache.py"
FIXED = (CASE / "upstream/fixed.py").read_text()
WRONG = (CASE / "controls/wrong_store.py").read_text()
POLICY = json.loads((CASE / "contract.json").read_text())


class CacheBoundaryTest(unittest.TestCase):
    def reject(self, source, policy=POLICY, missing_kernel=False):
        with tempfile.TemporaryDirectory() as tmp:
            subject = Path(tmp, "subject.py")
            subject.write_text(source)
            spec = Path(tmp, "policy.json")
            spec.write_text(json.dumps(policy))
            proc = subprocess.run([sys.executable, "-I", CHECKER, subject, spec], cwd=tmp,
                                  env=dict(os.environ, PATH=tmp) if missing_kernel else None,
                                  capture_output=True, text=True, timeout=30)
            report = json.loads(proc.stdout)
            self.assertEqual((proc.returncode, report["status"]), (2, "unverified"))
            self.assertNotIn("lean_certificate", report)
            if missing_kernel:
                self.assertIn("Lean", report["reason"])

    def test_unsupported_sources(self):
        for old, new in [
            ("= {}", "= {0: 1}"),
            ("raise ValueError", "_MEMO[n] = 0\n        raise ValueError"),
            ("return _MEMO[n]", "return _MEMO[n] + 1"),
            ("fib(n - 2)", "fib(n - 1)"),
            ("_MEMO[n] = result", "_MEMO[n + 1] = result"),
            ("return result", "return result\n\nfib = lambda n: 0"),
            ("n < 2", "n < 2.0"),
        ]:
            with self.subTest(new=new):
                self.assertIn(old, FIXED)
                self.reject(FIXED.replace(old, new))

    def test_invalid_policies(self):
        for key, value in [("invariant", "none"), ("negative", "return_zero"),
                           ("reference", ""), ("unknown", True)]:
            with self.subTest(key=key):
                self.reject(FIXED, {**POLICY, key: value})

    def test_proof_and_counterexample_require_lean(self):
        for source in (FIXED, WRONG):
            self.reject(source, missing_kernel=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
