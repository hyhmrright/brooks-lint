"""Regression checks for the source and contract admitted by the 002 verifier."""
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
CHECKER = ROOT / "skills/brooks-verify/scripts/verify_worker.py"
PROBE = ROOT / "docs/research/logic-lens-002"
CONTRACT = json.loads((PROBE / "contract.json").read_bytes())
BUGGY = (PROBE / "upstream/buggy.sh").read_bytes()
FIXED = (PROBE / "upstream/fixed.sh").read_bytes()
LEAN = shutil.which("lean")


class WorkerExitTest(unittest.TestCase):
    def setUp(self):
        work = tempfile.TemporaryDirectory()
        self.addCleanup(work.cleanup)
        self.work = Path(work.name)

    def check(self, source, contract=CONTRACT, path=None):
        script = self.work / "subject.sh"
        script.write_bytes(source)
        spec = self.work / "contract.json"
        spec.write_text(json.dumps(contract), encoding="utf-8")
        env = os.environ.copy()
        if path is not None:
            env["PATH"] = path
        proc = subprocess.run([sys.executable, "-I", CHECKER, script, spec],
                              cwd=self.work, env=env, capture_output=True, text=True, timeout=30)
        return proc.returncode, json.loads(proc.stdout)

    def assert_unverified(self, source, contract=CONTRACT, path=None):
        rc, report = self.check(source, contract, path)
        self.assertEqual((rc, report["status"]), (2, "unverified"), report)
        self.assertTrue(report["reason"])
        self.assertNotIn("lean_certificate", report)
        return report

    def test_status_flow_and_shell_token_boundaries(self):
        capture = b'local rc=$?\n    rm -f "$tmp_out"'
        for old, new in [
            (capture, b'rm -f "$tmp_out"\n    local rc=$?'),
            (b'return "$rc"', b'return 0'),
            (b'    return "$rc"\n', b""),
            (b'return "$rc"', b"return '$rc'"),
            (b'set -euo pipefail; run_case "$@"', b'set -euo pipefail; run_case "$@" || true'),
            (b"' _ {}\n", b"' _ {} | cat\n"),
            (b'export -f run_case', b'export run_case'),
            (b'local rc=$?\n', b'local rc=$?\\\n'),
            (b'local rc=$?\n', b'local rc=$?\xe2\x80\xa8'),
            (b'return "$rc"\n', b'return "$rc"\r\n'),
            (b'local name\n', b'local name\x00\n'),
        ]:
            with self.subTest(old=old, new=new):
                self.assertEqual(FIXED.count(old), 1)
                self.assert_unverified(FIXED.replace(old, new))

    def test_unexpected_source_is_only_read_as_data(self):
        marker = self.work / "marker"
        changed = f'touch "{marker}"\n'.encode() + FIXED
        self.assert_unverified(changed)
        self.assertFalse(marker.exists())

    def test_rejects_other_obligations(self):
        for update in [{"command": "other"}, {"function": "wrapper"},
                       {"required_pipeline_status": "equal_to_command"},
                       {"failure": "unstarted_work"}, {"kind": "validate-before-write-v1"},
                       {"reference": "  "}, {"lean_certificate": "example : True := trivial"}]:
            with self.subTest(update=update):
                self.assert_unverified(FIXED, {**CONTRACT, **update})

    def test_both_statuses_require_lean(self):
        for source in (BUGGY, FIXED):
            with self.subTest(fixed=source == FIXED):
                report = self.assert_unverified(source, path=str(self.work))
                self.assertIn("Lean", report["reason"])

    @unittest.skipUnless(LEAN, "Lean 4 unavailable; worker kernel checks skipped")
    def test_original_scripts_and_witness(self):
        for source, rc, status, model, line in [
                (BUGGY, 1, "counterexample", "swallowed", b'echo "  ! [$cid] claude exited $rc'),
                (FIXED, 0, "verified", "propagated", b'return "$rc"')]:
            with self.subTest(model=model):
                code, report = self.check(source)
                self.assertEqual((code, report["status"], report["model"]), (rc, status, model))
                self.assertEqual(report["source_sha256"], hashlib.sha256(source).hexdigest())
                self.assertTrue(source.splitlines()[report["line"]-1].strip().startswith(line))
                self.assertEqual(report["contract"], CONTRACT)
                self.assertIn("theorem reviewedContract", report["lean_certificate"])
                if source == BUGGY:
                    self.assertEqual(report["witness"], dict(command=23, worker=0, child=0,
                                                            xargs=0, producer=0, caller=0))

    @unittest.skipUnless(LEAN, "Lean 4 unavailable; worker kernel checks skipped")
    def test_harmless_layout_changes_preserve_certification_and_location(self):
        marker = b'    return "$rc"'
        self.assertEqual(FIXED.count(marker), 1)
        changed = b'\n# Untrusted comment: return 0\n' + FIXED.replace(marker, b'\treturn "$rc"  ')
        rc, report = self.check(changed)
        self.assertEqual((rc, report["status"]), (0, "verified"))
        self.assertEqual(changed.splitlines()[report["line"]-1].strip(), b'return "$rc"')


if __name__ == "__main__":
    unittest.main(verbosity=2)
