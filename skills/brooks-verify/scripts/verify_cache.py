"""Bind the complete Python Fibonacci module to its cross-call cache contract."""
import ast
import hashlib
import json
from pathlib import Path
from subprocess import TimeoutExpired
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lean_review import certify, read_small


POLICY = {"kind": "python-fib-cache-v1", "function": "fib", "cache": "_MEMO",
          "invariant": "fibonacci_entries", "across_calls": "correct_results",
          "negative": "ValueError_unchanged"}
FORM = '''_MEMO: dict[int, int] = {}


def fib(n: int) -> int:
    if n < 0:
        raise ValueError(f"fib requires n >= 0, got {n}")
    if n in _MEMO:
        return _MEMO[n]
    result = n if n < 2 else fib(n - 1) + fib(n - 2)
    _MEMO[n] = {write}
    return result
'''


def omit_docstring(body):
    if (body and isinstance(body[0], ast.Expr) and isinstance(body[0].value, ast.Constant)
            and type(body[0].value.value) is str):
        del body[0]


def classify(raw):
    # Parse bytes so Python honors its own source encoding declaration.
    module = ast.parse(raw)
    omit_docstring(module.body)
    for node in module.body:
        if isinstance(node, ast.FunctionDef):
            omit_docstring(node.body)
    actual = ast.dump(module)
    for mode, write in (("correct", "result"), ("wrongStore", "result + 1")):
        if actual == ast.dump(ast.parse(FORM.replace("{write}", write))):
            return mode, module.body[1].body[-2].lineno
    raise ValueError("Unsupported Fibonacci cache initialization, call or write")


def check(source, spec):
    contract = json.loads(read_small(spec))
    if (not isinstance(contract, dict) or set(contract) != set(POLICY) | {"reference"} or
            not isinstance(contract["reference"], str) or not contract["reference"].strip() or
            any(contract[k] != value for k, value in POLICY.items())):
        raise ValueError("Expected python-fib-cache-v1 with Fibonacci entries across calls and unchanged cache on ValueError")
    raw = read_small(source)
    mode, line = classify(raw)
    folder = Path(__file__).resolve().parent
    certificate = ((folder / "FibCache.lean").read_text(encoding="utf-8") + "\n" +
                   (folder / f"cache-{mode}.lean.inc").read_text(encoding="utf-8"))
    certify(certificate)
    result = dict(status="verified" if mode == "correct" else "counterexample",
                  source=str(source), source_sha256=hashlib.sha256(raw).hexdigest(), line=line,
                  model=mode, contract=contract, lean_certificate=certificate)
    if mode == "wrongStore":
        result["witness"] = {"inputs": [0, 0], "returns": [0, 1], "cache_after_first": {"0": 1}}
    return result


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: verify_cache.py SOURCE.py CONTRACT.json")
        output = check(*sys.argv[1:])
    except (ValueError, SyntaxError, OSError, TimeoutExpired, RecursionError) as error:
        output = {"status": "unverified", "reason": str(error)}
    print(json.dumps(output))
    sys.exit({"verified": 0, "counterexample": 1, "unverified": 2}[output["status"]])
