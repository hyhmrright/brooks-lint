"""Check whole-string acceptance for the supported CommonJS word-list validators."""
import hashlib
import json
from pathlib import Path
from subprocess import TimeoutExpired
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lean_review import certify, read_small


POLICY = {"kind": "js-word-list-language-v1", "function": "isValidList",
          "language": "nonempty_comma_separated_words"}
RETURNS = {
    "loose": r"return /^(\w+,?\s*)*$/.test(input);",
    "strict": r"return /^\w+(,\s*\w+)*$/.test(input);",
}


def classify(raw):
    # Split only at LF, since CR, LS, and PS also terminate JS line comments.
    source = raw.decode("utf-8")
    if any(c in source for c in "\r\u2028\u2029"):
        raise ValueError("Expected LF as the only JavaScript line terminator")
    statements = []
    for number, line in enumerate(source.split("\n"), 1):
        code = line.strip(" \t")
        if code and not code.startswith("//"):
            statements.append((number, code))
    lines = [code for _, code in statements]
    for mode, expression in RETURNS.items():
        if lines == ["function isValidList(input) {", expression, "}",
                     "module.exports = { isValidList };"]:
            return mode, statements[1][0]
    raise ValueError("Unsupported CommonJS module, expression or regex flags")


def check(source, spec):
    contract = json.loads(read_small(spec))
    if (not isinstance(contract, dict) or set(contract) != set(POLICY) | {"reference"} or
            not isinstance(contract["reference"], str) or not contract["reference"].strip() or
            any(contract[k] != v for k, v in POLICY.items())):
        raise ValueError("Expected js-word-list-language-v1 and an independent language reference")
    raw = read_small(source)
    mode, line = classify(raw)
    folder = Path(__file__).resolve().parent
    certificate = ((folder / "WordList.lean").read_text(encoding="utf-8") + "\n" +
                   (folder / f"list-{mode}.lean.inc").read_text(encoding="utf-8"))
    certify(certificate)
    result = dict(status="verified" if mode == "strict" else "counterexample",
                  source=str(source), source_sha256=hashlib.sha256(raw).hexdigest(), line=line,
                  model=mode, contract=contract, lean_certificate=certificate)
    if mode == "loose":
        result["witness"] = dict(input="", actual=True, expected=False)
    return result


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: verify_list.py SOURCE.js CONTRACT.json")
        output = check(*sys.argv[1:])
    except (ValueError, OSError, TimeoutExpired, RecursionError) as error:
        output = {"status": "unverified", "reason": str(error)}
    print(json.dumps(output))
    sys.exit({"verified": 0, "counterexample": 1, "unverified": 2}[output["status"]])
