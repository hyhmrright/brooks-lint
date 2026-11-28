"""Check the Go batch file lifetime contract against two complete supported forms."""
import hashlib
import json
from pathlib import Path
import re
from subprocess import TimeoutExpired
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lean_review import certify, read_small


POLICY = {"kind": "go-file-lifetime-v1", "function": "processFiles",
          "max_live": 1, "live_at_return": 0}
HEADER = '''package fileutil
import "os"
func processFiles(paths []string) error {
for _, p := range paths {'''
OPEN = '''f, err := os.Open(p)
if err != nil {
return err
}
defer f.Close()'''
BATCH_END = '''if err := scan(f); err != nil {
return err
}
}
return nil
}'''
HELPER = '''if err := processOne(p); err != nil {
return err
}
}
return nil
}
func processOne(p string) error {'''
FORMS = {"batch": "\n".join([HEADER, OPEN, BATCH_END]),
         "perFile": "\n".join([HEADER, HELPER, OPEN, "return scan(f)", "}"])}


def classify(raw):
    source = raw.decode("utf-8")
    if any(c in source for c in ("\x00", "\r", "\ufeff")):
        raise ValueError("Expected LF-delimited Go source without NUL or BOM")
    lines = []
    locations = []
    for number, text in enumerate(source.split("\n"), 1):
        line = text.strip(" \t")
        # Keep line boundaries for Go semicolon insertion. Only ignore
        # freestanding prose comments; build tags/directives cannot match.
        if not line or re.match(r"// [A-Za-z]", line):
            continue
        lines.append(line)
        locations.append(number)
    for mode, form in FORMS.items():
        if lines == form.split("\n"):
            return mode, locations[lines.index("defer f.Close()")]
    raise ValueError("Unsupported Go open/scan/defer workflow")


def check(source, spec):
    contract = json.loads(read_small(spec))
    if (not isinstance(contract, dict) or set(contract) != set(POLICY) | {"reference"} or
            not isinstance(contract["reference"], str) or not contract["reference"].strip() or
            any(type(contract[k]) is not type(v) or contract[k] != v for k, v in POLICY.items())):
        raise ValueError("Expected go-file-lifetime-v1 with max_live 1 and live_at_return 0")
    raw = read_small(source)
    mode, line = classify(raw)
    folder = Path(__file__).resolve().parent
    certificate = ((folder / "FileLifetime.lean").read_text(encoding="utf-8") + "\n" +
                   (folder / f"handle-{mode}.lean.inc").read_text(encoding="utf-8"))
    certify(certificate)
    result = dict(status="counterexample" if mode == "batch" else "verified",
                  model=mode, source=str(source), source_sha256=hashlib.sha256(raw).hexdigest(),
                  line=line, contract=contract, lean_certificate=certificate)
    if mode == "batch":
        result["witness"] = dict(inputs=["ok", "ok"], scans=[1, 2], peak=2, live_at_return=0)
    return result


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: verify_handles.py SOURCE.go CONTRACT.json")
        output = check(*sys.argv[1:])
    except (ValueError, OSError, TimeoutExpired, RecursionError) as error:
        output = {"status": "unverified", "reason": str(error)}
    print(json.dumps(output))
    sys.exit({"verified": 0, "counterexample": 1, "unverified": 2}[output["status"]])
