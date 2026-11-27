"""Exercise the public Lean review CLI on source and an independent policy."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

CHECKER = (Path(__file__).resolve().parents[1] /
           "skills/brooks-verify/scripts/lean_review.py")
LEAN = shutil.which("lean")
POLICY = {"function": "free_shipping", "parameter": "subtotal",
          "reference": "Shipping policy v2, section 4", "predicate": "subtotal >= 5000"}


def implementation(expression):
    return f"def free_shipping(subtotal):\n    return {expression}\n"


class LeanReviewTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.work = Path(directory.name)

    def check(self, source, contract, expected_exit, path=None, line=2):
        script = self.work / "shipping.py"
        script.write_text(source, encoding="utf-8")
        spec = self.work / "contract.json"
        spec.write_text(json.dumps(contract), encoding="utf-8")
        env = dict(os.environ)
        if path is not None:
            env["PATH"] = path
        run = subprocess.run([sys.executable, "-I", str(CHECKER), str(script), str(spec)],
                             cwd=self.work, env=env, capture_output=True, text=True, timeout=35)
        self.assertEqual(run.returncode, expected_exit, run.stdout + run.stderr)
        report = json.loads(run.stdout)
        status = {0: "verified", 1: "counterexample", 2: "unverified"}[expected_exit]
        self.assertEqual(report["status"], status)
        if status == "unverified":
            self.assertTrue(report["reason"])
        else:
            self.assertEqual(report["line"], line)
            self.assertEqual(report["source_sha256"], hashlib.sha256(script.read_bytes()).hexdigest())
            self.assertEqual(report["contract"], contract)
        return report

    def test_missing_checker_never_confirms_a_candidate_or_a_proof(self):
        for predicate in ("subtotal > 5000", "subtotal >= 5000"):
            with self.subTest(predicate=predicate):
                report = self.check(implementation(predicate), POLICY, 2, path=str(self.work))
                self.assertIn("lean", report["reason"].lower())

    def test_unsupported_code_and_contracts_are_never_executed(self):
        marker = self.work / "side-effect"
        call = f"open({str(marker)!r}, 'w')"
        valid = implementation("subtotal > 5000")
        for source, contract in [
            (call + "\n" + valid, POLICY),
            (implementation(call), POLICY),
            (valid, dict(POLICY, predicate=call)),
            (implementation("subtotal / 100 > 50"), POLICY),
            (valid, dict(POLICY, function="other_function")),
            (valid, dict(POLICY, reference="")),
        ]:
            with self.subTest(source=source, contract=contract):
                self.check(source, contract, 2)
                self.assertFalse(marker.exists())

    @unittest.skipUnless(LEAN, "Lean 4 unavailable on PATH; kernel checks skipped")
    def test_shipping_boundary_and_fixed_implementation(self):
        report = self.check(implementation("subtotal > 5000"), POLICY, 1)
        self.assertEqual(report["input"], 5000)
        self.assertIs(report["actual"], False)
        self.assertIs(report["expected"], True)
        self.check(implementation("subtotal >= 5000"), POLICY, 0)

    @unittest.skipUnless(LEAN, "Lean 4 unavailable on PATH; kernel checks skipped")
    def test_equivalent_boolean_expression_and_negative_boundary(self):
        contract = dict(POLICY, predicate="subtotal < -3 or subtotal >= 7")
        self.check(implementation("not (subtotal >= -3 and subtotal < 7)"), contract, 0)
        report = self.check(implementation("subtotal <= -3 or subtotal >= 7"), contract, 1)
        self.assertEqual(report["input"], -3)
        self.assertIs(report["actual"], True)
        self.assertIs(report["expected"], False)

    @unittest.skipUnless(LEAN, "Lean 4 unavailable on PATH; kernel checks skipped")
    def test_constants_and_integer_domain_beyond_machine_words(self):
        self.check(implementation("subtotal == 0 or subtotal != 0"),
                   dict(POLICY, predicate="True"), 0)
        annotated = ('"""Shipping eligibility."""\ndef free_shipping(subtotal: int) -> bool:\n'
                     '    """Subtotal includes discounts."""\n    return subtotal >= 5000\n')
        self.check(annotated, POLICY, 0, line=4)
        bound = 10 ** 25
        report = self.check(implementation("False"),
                            dict(POLICY, predicate=f"subtotal == {bound}"), 1)
        self.assertEqual(report["input"], bound)


if __name__ == "__main__":
    unittest.main(verbosity=2)
