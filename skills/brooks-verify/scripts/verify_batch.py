"""Bind a supported version-update workflow to its Lean validation/write model."""
import ast
import hashlib
import json
from pathlib import Path
import sys
from subprocess import TimeoutExpired

# With -I, Python omits the script directory. Import only from this installed skill.
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lean_review import certify, read_small, statements


HEADER = """import re
import subprocess
import sys
from pathlib import Path
REPO = Path(__file__).resolve().parent.parent
"""
HELPER = """text = path.read_text()
new_text, count = re.subn(pattern, replacement, text, count=1)
if count != 1:
    sys.exit(f"ERROR: no {what} found in {path.relative_to(REPO)}")
"""
ARGUMENTS = r'''if len(sys.argv) != 2:
    sys.exit("Usage: python3 scripts/bump-version.py <new-version>   (e.g. 0.7.0)")
version = sys.argv[1].lstrip("v")
if not re.fullmatch(r"\d+\.\d+\.\d+", version):
    sys.exit(f"ERROR: '{version}' is not a X.Y.Z version")'''
JSON_PATCH = r'''HELPER(REPO / rel, r'("version"\s*:\s*")[^"]*(")', rf"\g<1>{version}\g<2>", '"version" field')'''
README_PATCH = r'''HELPER(REPO / "README.md", r"(version-)[^-]*(-blue)", rf"\g<1>{version}\g<2>", "version-X-blue badge")'''
POST_COMMIT = '''print(f"Bumped version to {version} across {len(JSON_FILES)} metadata files + README badge.")
print("Running validate-repo.sh ...", flush=True)
sys.exit(subprocess.run(["bash", "scripts/validate-repo.sh"], cwd=REPO).returncode)'''
ENTRY = '''if __name__ == "__main__":
    main()'''

CONTRACT = {"kind": "validate-before-write-v1", "function": "main",
            "failure": "target_pattern_mismatch", "required_writes": "none",
            "target_contents": "unchanged"}


def same(nodes, code):
    return ast.dump(ast.Module(body=nodes, type_ignores=[])) == ast.dump(ast.parse(code))


def function_shape(fn, signature):
    if not isinstance(fn, ast.FunctionDef):
        return False
    skeleton = ast.FunctionDef(**{key: getattr(fn, key) for key in fn._fields})
    skeleton.body = [ast.Pass()]
    return same([skeleton], signature + "\n    pass")


def source_model(tree):
    nodes = statements(tree.body)
    header_len = len(ast.parse(HEADER).body)
    if len(nodes) != header_len + 4 or not same(nodes[:header_len], HEADER):
        raise ValueError("Unsupported module initialization or imports")
    inventory, helper, main, entry = nodes[header_len:]
    if (not isinstance(inventory, ast.Assign) or len(inventory.targets) != 1
            or not isinstance(inventory.targets[0], ast.Name) or inventory.targets[0].id != "JSON_FILES"
            or not isinstance(inventory.value, ast.List)):
        raise ValueError("Expected a literal JSON_FILES inventory")
    paths = []
    for item in inventory.value.elts:
        if not isinstance(item, ast.Constant) or type(item.value) is not str:
            raise ValueError("Target paths must be literal strings")
        path = Path(item.value)
        if path.is_absolute() or path.as_posix() != item.value or ".." in path.parts or path.suffix != ".json":
            raise ValueError("Expected normalized relative JSON file names")
        paths.append(item.value)
    if len(paths) != len(set(paths)) or not paths:
        raise ValueError("Target inventory must be nonempty and unique")
    if not function_shape(main, "def main() -> None:") or not same([entry], ENTRY):
        raise ValueError("Unsupported main or module entry point")
    if not isinstance(helper, ast.FunctionDef) or helper.name not in {"replace_once", "compute_patch"}:
        raise ValueError("Unsupported patch helper")
    signature = f"def {helper.name}(path: Path, pattern: str, replacement: str, what: str) -> "
    for model, annotation, effect in [("eager", "None", "path.write_text(new_text)"),
                                      ("staged", "tuple[Path, str]", "return path, new_text")]:
        if (function_shape(helper, signature + annotation + ":") and
                same(statements(helper.body), HELPER + effect)):
            break
    else:
        raise ValueError("Unsupported helper validation or write effect")
    json_call = JSON_PATCH.replace("HELPER", helper.name)
    readme_call = README_PATCH.replace("HELPER", helper.name)
    if model == "eager":
        updates = f"for rel in JSON_FILES:\n    {json_call}\n{readme_call}"
    else:
        updates = ("patches = [\n    " + json_call + "\n    for rel in JSON_FILES\n]\n"
                   + f"patches.append({readme_call})\n"
                   + "for path, new_text in patches:\n    path.write_text(new_text)")
    if not same(statements(main.body), "\n".join((ARGUMENTS, updates, POST_COMMIT))):
        raise ValueError("Unsupported call order, validation phase or write phase")
    return model, paths + ["README.md"], helper.body[-1].lineno


def check(source, contract_path):
    contract = json.loads(read_small(contract_path))
    if (not isinstance(contract, dict) or set(contract) != set(CONTRACT) | {"reference"}
            or not isinstance(contract["reference"], str) or not contract["reference"].strip()
            or any(contract[key] != value for key, value in CONTRACT.items())):
        raise ValueError("Expected validate-before-write-v1 target-pattern failure contract")
    raw = read_small(source)
    tree = ast.parse(raw, filename=str(source))
    compile(tree, str(source), "exec")
    model, paths, line = source_model(tree)
    if model == "eager" and paths[:2] != ["package.json", ".claude-plugin/plugin.json"]:
        raise ValueError("Certified concrete witness requires the two named initial targets")
    folder = Path(__file__).resolve().parent
    program = (folder / "BatchUpdate.lean").read_text() + "\n" + (folder / f"batch-{model}.lean.inc").read_text()
    certify(program)
    report = dict(status="verified" if model == "staged" else "counterexample",
                  source=str(source), source_sha256=hashlib.sha256(raw).hexdigest(),
                  line=line, model=model, targets=paths, contract=contract, lean_certificate=program)
    if model == "eager":
        report.update(requested_version="2.0.0", failed_target=paths[1], writes=[paths[0]],
                      before='{"version": "1.0.0"}\n', after='{"version": "2.0.0"}\n',
                      failed_target_contents="{}\n")
    return report


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: verify_batch.py SOURCE.py CONTRACT.json")
        output = check(*sys.argv[1:])
    except (ValueError, SyntaxError, OSError, TimeoutExpired, RecursionError) as error:
        output = {"status": "unverified", "reason": str(error)}
    print(json.dumps(output))
    sys.exit({"verified": 0, "counterexample": 1, "unverified": 2}[output["status"]])
