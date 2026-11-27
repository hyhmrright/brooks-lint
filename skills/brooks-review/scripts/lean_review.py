"""Check a standalone Python integer predicate against an independent contract."""
import ast
import hashlib
import json
import operator
import os
import shutil
from pathlib import Path
import subprocess
import sys
import tempfile

OPS = {ast.Lt: ("<", operator.lt), ast.LtE: ("≤", operator.le),
       ast.Eq: ("=", operator.eq), ast.NotEq: ("≠", operator.ne),
       ast.GtE: ("≥", operator.ge), ast.Gt: (">", operator.gt)}
LIMIT = 32_768


def read_small(path):
    with open(path, "rb") as stream:
        data = stream.read(LIMIT + 1)
    if len(data) > LIMIT:
        raise ValueError("File exceeds the 32 KiB review limit")
    return data


def integer(node):
    if isinstance(node, ast.Constant) and type(node.value) is int:
        return node.value
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
        return -integer(node.operand)
    raise ValueError("Expected an integer literal")


def predicate(node, param, cuts):
    """Translate to a closed Lean proposition template and a witness-search evaluator."""
    if isinstance(node, ast.Constant) and type(node.value) is bool:
        return str(node.value), lambda _: node.value
    if isinstance(node, ast.BoolOp):
        parts = [predicate(item, param, cuts) for item in node.values]
        join, combine = (" ∧ ", all) if isinstance(node.op, ast.And) else (" ∨ ", any)
        return "(" + join.join(text for text, _ in parts) + ")", lambda x: combine(f(x) for _, f in parts)
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
        text, evaluate = predicate(node.operand, param, cuts)
        return "(¬ " + text + ")", lambda x: not evaluate(x)
    if isinstance(node, ast.Compare) and len(node.ops) == 1 and type(node.ops[0]) in OPS:
        if not isinstance(node.left, ast.Name) or node.left.id != param:
            raise ValueError("Comparisons must have the parameter on the left")
        value = integer(node.comparators[0])
        cuts.update([value - 1, value, value + 1])
        symbol, compare = OPS[type(node.ops[0])]
        return f"(x {symbol} ({value} : Int))", lambda x: compare(x, value)
    raise ValueError("Unsupported predicate expression")


def statements(body):
    if (body and isinstance(body[0], ast.Expr) and
            isinstance(body[0].value, ast.Constant) and type(body[0].value.value) is str):
        return body[1:]
    return body


def plain_annotation(node, name):
    return node is None or (isinstance(node, ast.Name) and node.id == name)


def check(source, contract_path):
    raw = read_small(source)
    tree = ast.parse(raw, filename=str(source))
    compile(tree, str(source), "exec")  # Enforce Python syntax rules without importing the file.
    contract = json.loads(read_small(contract_path))
    fields = {"function", "parameter", "predicate", "reference"}
    if (not isinstance(contract, dict) or set(contract) != fields or
            not all(isinstance(v, str) and v.strip() for v in contract.values())):
        raise ValueError("Contract needs function, parameter, predicate and reference strings")
    module = statements(tree.body)
    if len(module) != 1 or not isinstance(module[0], ast.FunctionDef):
        raise ValueError("Expected a standalone single-function Python module")
    fn = module[0]
    body = statements(fn.body)
    args = fn.args
    if (fn.name != contract["function"] or fn.decorator_list or not plain_annotation(fn.returns, "bool") or
            getattr(fn, "type_params", []) or args.posonlyargs or args.kwonlyargs or
            args.defaults or args.vararg or args.kwarg or len(args.args) != 1 or
            not plain_annotation(args.args[0].annotation, "int") or args.args[0].arg != contract["parameter"] or
            len(body) != 1 or not isinstance(body[0], ast.Return)):
        raise ValueError("Expected the contracted plain one-parameter, return-only function")

    cuts = {0}
    reference = ast.parse(contract["predicate"], mode="eval").body
    if sum(1 for root in (tree, reference) for _ in ast.walk(root)) > 320:
        raise ValueError("Expression exceeds the review complexity limit")
    actual, evaluate = predicate(body[0].value, contract["parameter"], cuts)
    expected, accepts = predicate(reference, contract["parameter"], cuts)
    witness = next((x for x in sorted(cuts, key=lambda x: (abs(x), x))
                    if evaluate(x) != accepts(x)), None)
    program = f"set_option linter.unusedVariables false\ndef impl (x : Int) : Prop := {actual}\ndef spec (x : Int) : Prop := {expected}\n"
    if witness is None:
        program += "example (x : Int) : impl x ↔ spec x := by\n  simp [impl, spec] <;> omega\n"
    else:
        def claim(name, truth):
            prop = f"{name} ({witness} : Int)"
            return prop if truth else f"(¬ {prop})"
        pair = claim("impl", evaluate(witness)) + " ∧ " + claim("spec", accepts(witness))
        program += f"example : {pair} := by\n  unfold impl spec\n  decide\n"
    # Resolve the trusted installed binary outside the reviewed project's environment.
    binary = shutil.which("lean")
    if not binary:
        raise ValueError("Lean 4 executable is unavailable")
    binary = os.path.abspath(binary)
    with tempfile.TemporaryDirectory() as work:
        path = Path(work, "Review.lean")
        path.write_text(program, encoding="utf-8")
        env = {k: v for k, v in os.environ.items() if k not in ("LEAN_PATH", "LEAN_SRC_PATH")}
        result = subprocess.run([binary, str(path)], cwd=work, env=env,
                                capture_output=True, text=True, timeout=20)
        if result.returncode or result.stderr.strip() or result.stdout.strip():
            raise ValueError("Lean did not certify the obligation: " +
                             (result.stdout + result.stderr).strip()[:1000])
    report = {"status": "verified" if witness is None else "counterexample",
              "source": str(source), "line": body[0].lineno, "function": fn.name,
              "source_sha256": hashlib.sha256(raw).hexdigest(), "contract": contract,
              "domain": "plain Python int", "lean_certificate": program}
    if witness is not None:
        report.update(input=witness, actual=evaluate(witness), expected=accepts(witness))
    return report


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: lean_review.py SOURCE.py CONTRACT.json")
        output = check(*sys.argv[1:])
    except (ValueError, SyntaxError, OSError, subprocess.TimeoutExpired, RecursionError) as error:
        output = {"status": "unverified", "reason": str(error)}
    print(json.dumps(output))
    sys.exit({"verified": 0, "counterexample": 1, "unverified": 2}[output["status"]])
