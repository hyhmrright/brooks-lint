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
RESEARCH = Path(__file__).resolve().parents[1] / "docs/research/logic-lens-009"
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

    def test_dedupe_rejects_out_of_fragment_mutations(self):
        source = (RESEARCH / "upstream/fixed.py").read_text()
        contract = json.loads((RESEARCH / "contract.json").read_text())
        mutations = [
            ("return result", "return result[::-1]"),
            ("result.append(x)", "result.insert(0, x)"),
            ("seen.add(x)", "pass"),
            ("seen.add(x)", "seen.add('x')"),
            ("if x not in seen:", "if x in seen:"),
            ("for x in items:", "for x in reversed(items):"),
            ("seen.add(x)", "items.append(x)"),
            ("seen", "items"),
            ("seen", "set"),
            ("result", "list"),
            ("for x in items:", "for str in items:"),
        ]
        for old, new in mutations:
            with self.subTest(old=old, new=new):
                self.assertIn(old, source)
                report = self.check(source.replace(old, new), contract, 2)
                self.assertNotIn("lean_certificate", report)

    def test_dedupe_rejects_changed_contract_or_missing_kernel(self):
        source = (RESEARCH / "upstream/fixed.py").read_text()
        contract = json.loads((RESEARCH / "contract.json").read_text())
        for key, value in [("max_list_comparisons", 0), ("max_set_queries", "unlimited"),
                           ("output", "sorted"), ("reference", ""), ("lean_certificate", "forged")]:
            with self.subTest(key=key):
                self.check(source, {**contract, key: value}, 2)
        report = self.check(source, contract, 2, path=str(self.work))
        self.assertIn("lean", report["reason"].lower())

    @unittest.skipUnless(LEAN, "Lean 4 unavailable on PATH; kernel checks skipped")
    def test_upstream_dedupe_certificates_replay_against_separate_statements(self):
        contract = json.loads((RESEARCH / "contract.json").read_text())
        challenges = {
            "buggy": ('example : (Dedupe.listModel ["a", "b", "c", "d"]).comparisons = 6 ∧ '
                      '(Dedupe.listModel ["a", "b", "c", "d"]).comparisons > 4 := reviewedContract'),
            "fixed": ('example (items : List String) : '
                      '(Dedupe.setModel items).output = items.eraseDups ∧ '
                      '(Dedupe.setModel items).comparisons ≤ items.length ∧ '
                      '(Dedupe.setModel items).queries ≤ items.length := reviewedContract items'),
        }
        for variant, challenge in challenges.items():
            with self.subTest(variant=variant):
                source = (RESEARCH / f"upstream/{variant}.py").read_text()
                line = next(i for i, text in enumerate(source.splitlines(), 1)
                            if text.startswith("    for "))
                report = self.check(source, contract, int(variant == "buggy"), line=line)
                if variant == "buggy":
                    self.assertEqual(report["input"], ["a", "b", "c", "d"])
                    self.assertEqual(report["actual_list_comparisons"], 6)
                    self.assertEqual(report["max_list_comparisons"], 4)
                cert = self.work / "Replay.lean"
                cert.write_text(report["lean_certificate"] + "\n" + challenge + "\n")
                run = subprocess.run([LEAN, str(cert)], cwd=self.work,
                                     capture_output=True, text=True, timeout=30)
                self.assertEqual(run.returncode, 0, run.stdout + run.stderr)

    @unittest.skipUnless(LEAN, "Lean 4 unavailable on PATH; kernel checks skipped")
    def test_dedupe_accepts_consistent_local_renames(self):
        source = (RESEARCH / "upstream/fixed.py").read_text()
        source = source.replace("items", "names").replace("seen", "known").replace("result", "unique")
        contract = json.loads((RESEARCH / "contract.json").read_text())
        line = next(i for i, text in enumerate(source.splitlines(), 1) if text.startswith("    for "))
        self.check(source, dict(contract, parameter="names"), 0, line=line)

    def test_zero_and_variable_divisors_in_either_input(self):
        for divisor in ("0", "subtotal"):
            expression = f"subtotal % {divisor} == 0"
            for actual, spec in ((expression, "True"), ("True", expression)):
                with self.subTest(actual=actual, spec=spec):
                    self.check(implementation(actual), dict(POLICY, predicate=spec), 2)

    @unittest.skipUnless(LEAN, "Lean 4 unavailable on PATH; kernel checks skipped")
    def test_signed_remainders_match_python(self):
        for dividend in (-7, 7):
            for divisor in (-3, 3):
                with self.subTest(dividend=dividend, divisor=divisor):
                    remainder = dividend % divisor
                    impl = f"subtotal == {dividend} and subtotal % {divisor} == {remainder}"
                    result = self.check(implementation(impl), dict(POLICY, predicate="False"), 1)
                    self.assertEqual(result["input"], dividend)
                    self.assertIs(result["actual"], True)
                    self.assertIs(result["expected"], False)

    @unittest.skipUnless(LEAN, "Lean 4 unavailable on PATH; kernel checks skipped")
    def test_gregorian_century_exception_and_full_rule(self):
        contract = dict(function="leap", parameter="year", reference="Gregorian calendar",
                        predicate="not (year % 4 != 0 or (year % 100 == 0 and year % 400 != 0))")
        incomplete = "def leap(year):\n    return year % 4 == 0\n"
        report = self.check(incomplete, contract, 1)
        year = report["input"]
        self.assertEqual(year % 100, 0)
        self.assertNotEqual(year % 400, 0)
        self.assertIs(report["actual"], True)
        self.assertIs(report["expected"], False)
        full = "def leap(year):\n    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)\n"
        self.check(full, contract, 0)

    @unittest.skipUnless(LEAN, "Lean 4 unavailable on PATH; kernel checks skipped")
    def test_missing_a_periodic_witness_does_not_certify_equivalence(self):
        # The first positive solution, 4087, exceeds the local search radius.
        expression = "subtotal > 0 and subtotal % 61 == 0 and subtotal % 67 == 0"
        report = self.check(implementation(expression), dict(POLICY, predicate="False"), 2)
        self.assertNotIn("lean_certificate", report)

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
