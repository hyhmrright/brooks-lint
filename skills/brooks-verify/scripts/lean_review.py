"""Check supported Python predicates and deduplication loops against Lean contracts."""
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
MODULO_SEARCH_RADIUS = 256


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
        left = node.left
        value = integer(node.comparators[0])
        symbol, compare = OPS[type(node.ops[0])]
        if isinstance(left, ast.Name) and left.id == param:
            cuts.update((value - 1, value, value + 1))
            return f"(x {symbol} ({value} : Int))", lambda x: compare(x, value)
        if (isinstance(left, ast.BinOp) and isinstance(left.op, ast.Mod)
                and isinstance(left.left, ast.Name) and left.left.id == param):
            divisor = integer(left.right)
            if divisor == 0:
                raise ValueError("Modulo requires a nonzero integer literal divisor")
            # Python's remainder has the divisor's sign. Lean's % is Euclidean.
            term = (f"(x % ({divisor} : Int))" if divisor > 0
                    else f"(-((-x) % ({-divisor} : Int)))")
            # Probe the comparison boundary in adjacent periods, plus nearby
            # integers for intersections of several congruences. Lean decides
            # whether a candidate or a universal equivalence can be certified.
            for offset in (-abs(divisor), 0, abs(divisor)):
                cuts.update(offset + value + delta for delta in (-1, 0, 1))
            cuts.update(range(-MODULO_SEARCH_RADIUS, MODULO_SEARCH_RADIUS + 1))
            return f"({term} {symbol} ({value} : Int))", lambda x: compare(x % divisor, value)
        raise ValueError("Expected the parameter or parameter % integer literal on the left")
    raise ValueError("Unsupported predicate expression")


def statements(body):
    if (body and isinstance(body[0], ast.Expr) and
            isinstance(body[0].value, ast.Constant) and type(body[0].value.value) is str):
        return body[1:]
    return body


def plain_annotation(node, name):
    return node is None or (isinstance(node, ast.Name) and node.id == name)


# These are executable syntax patterns, not fixture hashes. Match the full body,
# allowing only consistent and injective renaming of local variables.
DEDUPE_PATTERNS = {
    "list": """out: list[str] = []
for item in inputs:
    if item not in out:
        out.append(item)
return out""",
    "set": """seen: set[str] = set()
out: list[str] = []
for item in inputs:
    if item not in seen:
        seen.add(item)
        out.append(item)
return out""",
}


def matches_pattern(pattern, subject, names):
    if type(pattern) is not type(subject):
        return False
    if isinstance(pattern, ast.Name) and pattern.id in {"inputs", "seen", "out", "item"}:
        if pattern.id not in names:
            if subject.id in names.values() or subject.id in {"list", "set", "str"}:
                return False
            names[pattern.id] = subject.id
        return names[pattern.id] == subject.id and type(pattern.ctx) is type(subject.ctx)
    if isinstance(pattern, list):
        return len(pattern) == len(subject) and all(
            matches_pattern(a, b, names) for a, b in zip(pattern, subject))
    if isinstance(pattern, ast.AST):
        return all(matches_pattern(value, getattr(subject, field), names)
                   for field, value in ast.iter_fields(pattern))
    return pattern == subject


def dedupe_check(tree, contract):
    policy = {"kind": "stable-dedupe-v1", "output": "first_occurrences",
              "max_list_comparisons": "input_length", "max_set_queries": "input_length"}
    if (set(contract) != set(policy) | {"function", "parameter", "reference"} or
            any(contract.get(key) != value for key, value in policy.items()) or
            not all(isinstance(value, str) and value.strip() for value in contract.values())):
        raise ValueError("Invalid stable-dedupe-v1 contract or unsupported operation budget")
    module = statements(tree.body)
    if len(module) != 1 or not isinstance(module[0], ast.FunctionDef):
        raise ValueError("Expected a standalone deduplication function")
    fn = module[0]
    args = fn.args
    param = contract["parameter"]
    annotation = ast.parse("list[str]", mode="eval").body
    if (fn.name != contract["function"] or fn.decorator_list or getattr(fn, "type_params", []) or
            args.posonlyargs or args.kwonlyargs or args.defaults or args.vararg or args.kwarg or
            len(args.args) != 1 or args.args[0].arg != param or
            any(name in {"list", "set", "str"} for name in (fn.name, param)) or
            not matches_pattern(annotation, fn.returns, {}) or
            not matches_pattern(annotation, args.args[0].annotation, {})):
        raise ValueError("Expected a plain list[str] to list[str] function with built-in bindings")
    body = statements(fn.body)
    model = next((name for name, code in DEDUPE_PATTERNS.items()
                  if matches_pattern(ast.parse(code).body, body, {"inputs": param})), None)
    if model is None:
        raise ValueError("Unsupported deduplication loop; cannot bind source to a cost model")
    program = Path(__file__).with_name("Dedupe.lean").read_text(encoding="utf-8")
    if model == "list":
        goal = """let xs : List String := ["a", "b", "c", "d"]
  (Dedupe.listModel xs).comparisons = 6 ∧ (Dedupe.listModel xs).comparisons > xs.length"""
        proof = "Dedupe.listBudgetWitness"
        result = {"status": "counterexample", "input": ["a", "b", "c", "d"],
                  "actual_list_comparisons": 6, "max_list_comparisons": 4}
    else:
        goal = """∀ xs : List String,
  (Dedupe.setModel xs).output = xs.eraseDups ∧
  (Dedupe.setModel xs).comparisons ≤ xs.length ∧ (Dedupe.setModel xs).queries ≤ xs.length"""
        proof = """by
  intro xs
  obtain ⟨ordered, scans, queries, _⟩ := Dedupe.setContract xs
  exact ⟨ordered, by omega, by omega⟩"""
        result = {"status": "verified"}
    program += f"\n-- Obligation selected from the checked source and explicit contract.\ntheorem reviewedContract : {goal} := {proof}\n"
    result.update(model=model, line=next(stmt.lineno for stmt in body if isinstance(stmt, ast.For)),
                  domain="plain list of built-in str values", lean_certificate=program)
    return result


def check(source, contract_path):
    raw = read_small(source)
    tree = ast.parse(raw, filename=str(source))
    compile(tree, str(source), "exec")  # Enforce Python syntax rules without importing the file.
    contract = json.loads(read_small(contract_path))
    if isinstance(contract, dict) and contract.get("kind") == "stable-dedupe-v1":
        report = dedupe_check(tree, contract)
    else:
        report = integer_check(tree, contract)
    certify(report["lean_certificate"])
    report.update(source=str(source), function=contract["function"], contract=contract,
                  source_sha256=hashlib.sha256(raw).hexdigest())
    return report


def integer_check(tree, contract):
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
    witness = next((x for x in sorted(cuts, key=lambda x: (abs(x), -x))
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
    report = {"status": "verified" if witness is None else "counterexample",
              "line": body[0].lineno, "domain": "plain Python int", "lean_certificate": program}
    if witness is not None:
        report.update(input=witness, actual=evaluate(witness), expected=accepts(witness))
    return report


def certify(program):
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


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: lean_review.py SOURCE.py CONTRACT.json")
        output = check(*sys.argv[1:])
    except (ValueError, SyntaxError, OSError, subprocess.TimeoutExpired, RecursionError) as error:
        output = {"status": "unverified", "reason": str(error)}
    print(json.dumps(output))
    sys.exit({"verified": 0, "counterexample": 1, "unverified": 2}[output["status"]])
