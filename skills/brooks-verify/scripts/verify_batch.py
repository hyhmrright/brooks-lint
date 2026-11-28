"""Bind a supported file-update workflow to its Lean validation/write model."""
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

# The early-flush certificate gives an exact trace and byte changes for this inventory.
METADATA_WITNESS = ["package.json", ".claude-plugin/plugin.json", ".claude-plugin/marketplace.json",
                    ".codex-plugin/plugin.json", "gemini-extension.json"]
DRAIN = "for path, new_text in patches:\n    path.write_text(new_text)"

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


def update_model(main, helper, writes_in_helper, lazy_import):
    """Match the entire main body, including exactly when each patch is evaluated."""
    json_call = JSON_PATCH.replace("HELPER", helper)
    badge_call = README_PATCH.replace("HELPER", helper)
    badge = f"patches.append({badge_call})"
    if lazy_import and not writes_in_helper:
        # Pulling one value from chain computes one pure patch. The consumer
        # writes that value before requesting the next one: eager disk semantics.
        lazy = (f"metadata = ({json_call} for rel in JSON_FILES)\n"
                f"def badge():\n    yield {badge_call}\n"
                "for path, new_text in chain(metadata, badge()):\n    path.write_text(new_text)")
        candidates = [("lazy", lazy)]
    elif writes_in_helper and not lazy_import:
        candidates = [("eager", f"for rel in JSON_FILES:\n    {json_call}\n{badge_call}")]
    elif not writes_in_helper:
        collect = f"patches = []\nfor rel in JSON_FILES:\n    patch = {json_call}\n    patches.append(patch)"
        comprehension = f"patches = [{json_call} for rel in JSON_FILES]"
        candidates = [("staged", "\n".join([comprehension, badge, DRAIN])),
                      ("staged", "\n".join([collect, badge, DRAIN])),
                      ("early-flush", "\n".join([collect, DRAIN, "patches = []", badge, DRAIN]))]
    else:
        candidates = []
    for model, updates in candidates:
        if same(statements(main.body), "\n".join((ARGUMENTS, updates, POST_COMMIT))):
            return model
    raise ValueError("Unsupported call order, validation phase or write phase")


def source_model(tree):
    nodes = statements(tree.body)
    lazy_import = same(nodes[:1], "from itertools import chain")
    if lazy_import:
        nodes = nodes[1:]
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
    for writes_in_helper, annotation, effect in [(True, "None", "path.write_text(new_text)"),
                                                (False, "tuple[Path, str]", "return path, new_text")]:
        if (function_shape(helper, signature + annotation + ":") and
                same(statements(helper.body), HELPER + effect)):
            break
    else:
        raise ValueError("Unsupported helper validation or write effect")
    model = update_model(main, helper.name, writes_in_helper, lazy_import)
    if model in {"lazy", "early-flush"}:
        # The first write is in the caller (the helper only computes a patch).
        line = next(loop.body[0].lineno for loop in statements(main.body)
                    if isinstance(loop, ast.For) and isinstance(loop.target, ast.Tuple))
    else:
        line = helper.body[-1].lineno
    return model, paths + ["README.md"], line


COOKBOOK_CONTRACT = {**CONTRACT, "kind": "cookbook-context-before-write-v1",
                     "failure": "target_context_mismatch"}
# Every byte outside this single process_patch block, including imports, parser,
# callbacks, and the CLI exception handler, must match the reviewed cell.
COOKBOOK_SHA256 = "4ede4c81d0eeaf870b0bfc94fa00324f97f555743d1e8cf14eadaaff41aa0d62"
COOKBOOK_STAGED = b'''    paths = identify_files_needed(text)
    orig = load_files(paths, open_fn)
    patch, _fuzz = text_to_patch(text, orig)
    commit = patch_to_commit(patch, orig)
    apply_commit(commit, write_fn, remove_fn)
'''
COOKBOOK_PER_FILE = rb'''    lines = text.splitlines()
    if len(lines) < 2 or lines[-1] != "*** End Patch":
        raise DiffError("Missing *** End Patch sentinel")
    headers = ("*** Update File: ", "*** Add File: ", "*** Delete File: ")
    starts = [i for i in range(1, len(lines) - 1) if lines[i].startswith(headers)]
    starts.append(len(lines) - 1)
    for start, end in zip(starts, starts[1:]):
        section = "\n".join(["*** Begin Patch", *lines[start:end], "*** End Patch"])
        paths = identify_files_needed(section)
        orig = load_files(paths, open_fn)
        patch, _fuzz = text_to_patch(section, orig)
        commit = patch_to_commit(patch, orig)
        apply_commit(commit, write_fn, remove_fn)
'''


def cookbook_model(raw):
    for model, block in [("cookbook-staged", COOKBOOK_STAGED), ("cookbook-per-file", COOKBOOK_PER_FILE)]:
        if raw.count(block) == 1:
            canonical = raw.replace(block, COOKBOOK_STAGED, 1)
            if hashlib.sha256(canonical).hexdigest() == COOKBOOK_SHA256:
                write_call = raw.index(b"apply_commit(commit, write_fn, remove_fn)", raw.index(block))
                return model, raw.count(b"\n", 0, write_call) + 1
    raise ValueError("Unsupported Cookbook parser, CLI, callbacks or patch schedule")


def check(source, contract_path):
    contract = json.loads(read_small(contract_path))
    cookbook = isinstance(contract, dict) and contract.get("kind") == COOKBOOK_CONTRACT["kind"]
    expected = COOKBOOK_CONTRACT if cookbook else CONTRACT
    if (not isinstance(contract, dict) or set(contract) != set(expected) | {"reference"}
            or not isinstance(contract["reference"], str) or not contract["reference"].strip()
            or any(contract[key] != value for key, value in expected.items())):
        raise ValueError("Expected " + expected["kind"] + " contract with the required failure and effects")
    raw = read_small(source)
    tree = ast.parse(raw, filename=str(source))
    compile(tree, str(source), "exec")
    if cookbook:
        model, line = cookbook_model(raw)
        # Successful certificates quantify over input-dependent inventories.
        paths = None if model == "cookbook-staged" else ["first.txt", "last.txt"]
    else:
        model, paths, line = source_model(tree)
    if model == "early-flush" and paths[:-1] != METADATA_WITNESS:
        raise ValueError("Certified metadata-flush witness requires the five named metadata targets")
    if model in {"eager", "lazy"} and paths[:2] != ["package.json", ".claude-plugin/plugin.json"]:
        raise ValueError("Certified concrete witness requires the two named initial targets")
    folder = Path(__file__).resolve().parent
    template = "eager" if model == "lazy" else model
    program = (folder / "BatchUpdate.lean").read_text() + "\n" + (folder / f"batch-{template}.lean.inc").read_text()
    certify(program)
    report = dict(status="verified" if model in {"staged", "cookbook-staged"} else "counterexample",
                  source=str(source), source_sha256=hashlib.sha256(raw).hexdigest(),
                  line=line, model=model, targets=paths, contract=contract, lean_certificate=program)
    if model == "cookbook-per-file":
        report.update(failed_target="last.txt", writes=["first.txt"], before="old\n",
                      after="new\n", failed_target_contents="unmatched\n")
    elif model not in {"staged", "cookbook-staged"}:
        early_flush = model == "early-flush"
        report.update(requested_version="2.0.0", failed_target=paths[-1] if early_flush else paths[1],
                      writes=paths[:-1] if early_flush else [paths[0]],
                      before='{"version": "1.0.0"}\n', after='{"version": "2.0.0"}\n',
                      failed_target_contents="missing badge\n" if early_flush else "{}\n")
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
