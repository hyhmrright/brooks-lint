"""Check Go 1.22 range binding and joined callback completion in a supported fanOut."""
import hashlib
import json
from pathlib import Path
import re
from subprocess import TimeoutExpired
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lean_review import certify, read_small


POLICY = {"kind": "go-loop-capture-v1", "function": "fanOut", "go_semantics": "1.22",
          "binding": "iteration_value", "at_return": "each_input_occurrence_once"}
HEADER = '''package worker
import "sync"
func fanOut(ids []int, handle func(int)) {
var wg sync.WaitGroup'''
LAUNCH = '''wg.Add(1)
go func() {
defer wg.Done()'''
CALL = '''handle(id)
}()
}'''
WAIT = '''wg.Wait()
}'''
FORMS = {
    "perIteration": (HEADER, "for _, id := range ids {", LAUNCH, CALL, WAIT),
    "shared": (HEADER, "ready := make(chan struct{})", "var id int", "for _, id = range ids {",
               LAUNCH, "<-ready", CALL, "close(ready)", WAIT),
}


def classify(raw):
    source = raw.decode("utf-8")
    if any(c in source for c in ("\x00", "\r", "\ufeff")):
        raise ValueError("Expected LF-delimited Go source without NUL or BOM")
    lines = source.split("\n")
    if lines[:2] != ["//go:build go1.22", ""]:
        raise ValueError("Expected the leading //go:build go1.22 constraint and a blank line")
    code = []
    locations = []
    for number, text in enumerate(lines[2:], 3):
        line = text.strip(" \t")
        if not line or line == "//" or re.match(r"// [A-Za-z]", line):
            continue
        code.append(line)
        locations.append(number)
    for mode, sections in FORMS.items():
        if code == "\n".join(sections).split("\n"):
            return mode, locations[code.index("handle(id)")]
    raise ValueError("Unsupported Go loop capture or WaitGroup workflow")


def check(source, spec):
    contract = json.loads(read_small(spec))
    if (not isinstance(contract, dict) or set(contract) != set(POLICY) | {"reference"} or
            not isinstance(contract["reference"], str) or not contract["reference"].strip() or
            any(contract[k] != value for k, value in POLICY.items())):
        raise ValueError("Expected go-loop-capture-v1 with Go 1.22 iteration values and joined callbacks")
    raw = read_small(source)
    mode, line = classify(raw)
    folder = Path(__file__).resolve().parent
    certificate = ((folder / "LoopCapture.lean").read_text(encoding="utf-8") + "\n" +
                   (folder / f"capture-{mode}.lean.inc").read_text(encoding="utf-8"))
    certify(certificate)
    result = dict(status="verified" if mode == "perIteration" else "counterexample",
                  source=str(source), source_sha256=hashlib.sha256(raw).hexdigest(), line=line,
                  model=mode, contract=contract, lean_certificate=certificate)
    if mode == "shared":
        result["witness"] = dict(inputs=[1, 2], handled=[2, 2])
    return result


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: verify_capture.py SOURCE.go CONTRACT.json")
        output = check(*sys.argv[1:])
    except (ValueError, OSError, TimeoutExpired, RecursionError) as error:
        output = {"status": "unverified", "reason": str(error)}
    print(json.dumps(output))
    sys.exit({"verified": 0, "counterexample": 1, "unverified": 2}[output["status"]])
