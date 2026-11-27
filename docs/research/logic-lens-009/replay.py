"""Replay pinned probe 009 with an installed skill, then compare portable evidence."""
import argparse
import hashlib
import itertools
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HASHES = {
    "buggy.py": "471f5063f0b55630a09e9ef01cc9799d89b97b022dee286a6812bc8b4767f4e1",
    "fixed.py": "1140f494ee631995c21611e33bc96fd2f036dd18ed823b96b19ad9562e91cbd8",
    "meta.json": "2912c752d08e125f62382e76fe9c642e4eb44cbdfd176a98ae86bfc4826e64f9",
}
WITNESS = ["a", "b", "c", "d"]
# These independent challenges are checked against the named theorem exported
# by the CLI; a certificate that merely elaborates or proves True cannot pass.
CHALLENGES = {
    "buggy": 'let xs : List String := ["a","b","c","d"]; '
             '(Dedupe.listModel xs).comparisons = 6 ∧ (Dedupe.listModel xs).comparisons > xs.length',
    "fixed": '∀ xs : List String, (Dedupe.setModel xs).output = xs.eraseDups ∧ '
             '(Dedupe.setModel xs).comparisons ≤ xs.length ∧ (Dedupe.setModel xs).queries ≤ xs.length',
}
AXIOMS = {"buggy": "'checked009' does not depend on any axioms",
          "fixed": "'checked009' depends on axioms: [propext, Quot.sound]"}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def command(args, cwd, expected=0):
    proc = subprocess.run(args, cwd=cwd, capture_output=True, text=True, timeout=60)
    require(proc.returncode == expected, f"{args[0]} exit {proc.returncode}: {proc.stdout}{proc.stderr}")
    return proc.stdout


def observe(fn, values, variant):
    """Observe the membership line before it runs on the original Python objects."""
    comparisons = queries = 0
    def trace(frame, event, arg):
        nonlocal comparisons, queries
        if event == "line" and frame.f_code is fn.__code__ and frame.f_lineno == fn.membership_line:
            if variant == "fixed":
                queries += 1
            else:
                for element in frame.f_locals["result"]:
                    comparisons += 1
                    if element == frame.f_locals["x"]:
                        break
        return trace

    previous = sys.gettrace()
    try:
        sys.settrace(trace)
        output = fn(values)
    finally:
        sys.settrace(previous)
    require(output == list(dict.fromkeys(values)), "Original Python output disagrees with reference")
    return {"output": output, "list_element_visits": comparisons, "set_membership_queries": queries}


def replay(corpus, work, save_certificates):
    require(all(sha((corpus / k).read_bytes()) == v for k, v in HASHES.items()),
            "Upstream files differ from pinned source; refusing to execute")
    version = command(["lean", "--version"], work)
    require("version 4.19.0," in version, f"Expected Lean 4.19.0, got {version}")
    command(["node", ROOT / "bin/brooks-lint.mjs", "install", "--dir", work / "skills"], work)
    checker = work / "skills/brooks-verify/scripts/lean_review.py"
    artifact = {"logic_lens_commit": "3b158e228127e21bff7be6530e3923de0793a907",
                "lean": "4.19.0", "inputs_sha256": HASHES,
                "checker_sha256": sha(checker.read_bytes()),
                "model_sha256": sha(checker.with_name("Dedupe.lean").read_bytes()),
                "contract": json.loads((HERE / "contract.json").read_text()), "results": {}}
    for variant in ("buggy", "fixed"):
        source = corpus / (variant + ".py")
        text = command([sys.executable, "-I", checker, source.name, HERE / "contract.json"],
                       corpus, expected=int(variant == "buggy"))
        result = json.loads(text)
        cert = result.pop("lean_certificate")
        require(result["source_sha256"] == HASHES[source.name], "Certificate report source mismatch")
        require(result["contract"] == artifact["contract"], "Contract mismatch")
        if variant == "buggy":
            require(result["status"] == "counterexample" and result["input"] == WITNESS
                    and result["actual_list_comparisons"] == 6 and result["max_list_comparisons"] == 4,
                    "Wrong counterexample")
        else:
            require(result["status"] == "verified", "Missing equivalence proof")

        # Only these two digest-checked upstream modules are executed in the replay.
        namespace = {}
        raw = source.read_text()
        exec(compile(raw, str(source), "exec"), namespace)
        fn = namespace["dedupe"]
        fn.membership_line, = (i for i, line in enumerate(raw.splitlines(), 1) if "if x not in " in line)
        checked = 0
        differential = []
        model = "listModel" if variant == "buggy" else "setModel"
        for size in range(6):
            for values in itertools.product("abc", repeat=size):
                seen = observe(fn, list(values), variant)
                if variant == "fixed":
                    require(seen["set_membership_queries"] == size, "Lookup count mismatch")
                if size <= 3:
                    # Each string here is a single ASCII letter, valid in both syntaxes.
                    differential.append(
                        f"example : let r := Dedupe.{model} {json.dumps(values)}; "
                        f"r.output = {json.dumps(seen['output'])} ∧ "
                        f"r.comparisons = {seen['list_element_visits']} ∧ "
                        f"r.queries = {seen['set_membership_queries']} := by decide")
                checked += 1
        witness = observe(fn, WITNESS, variant)
        require(witness["list_element_visits"] == (6 if variant == "buggy" else 0)
                and witness["set_membership_queries"] == (4 if variant == "fixed" else 0),
                "Independent source observations disagree with proof")
        extra_goal = (
            "∀ xs : List String, xs.Nodup → (Dedupe.listModel xs).comparisons = (List.range xs.length).sum"
            if variant == "buggy" else
            "∀ xs : List String, (Dedupe.setModel xs).output = xs.eraseDups ∧ "
            "(Dedupe.setModel xs).comparisons = 0 ∧ (Dedupe.setModel xs).queries = xs.length ∧ "
            "(Dedupe.setModel xs).inserts ≤ xs.length")
        extra_proof = "Dedupe.listDistinctComparisons" if variant == "buggy" else "Dedupe.setContract"
        path = work / (variant + ".lean")
        path.write_text(cert + f"\ntheorem checked009 : {CHALLENGES[variant]} := reviewedContract\n"
                        + f"theorem checkedFamily : {extra_goal} := {extra_proof}\n"
                        + "\n".join(differential) + "\n#print axioms checked009\n#print axioms checkedFamily\n")
        audits = command(["lean", path], work).strip().splitlines()
        require(audits == [AXIOMS[variant], "'checkedFamily' depends on axioms: [propext, Quot.sound]"],
                f"Unexpected axioms or diagnostics: {audits}")
        if save_certificates:
            save_certificates.mkdir(parents=True, exist_ok=True)
            (save_certificates / (variant + ".lean")).write_bytes(path.read_bytes())
        artifact["results"][variant] = dict(report=result, certificate_sha256=sha(cert.encode()),
                                            checked_axioms=audits, differential_model_checks=len(differential), source_observation=witness,
                                            finite_output_checks=checked)
    return artifact


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--corpus", type=Path, default=HERE / "upstream",
                     help="directory containing the pinned original 009 files")
    cli.add_argument("--output", type=Path, help="write a new record instead of comparing to results.json")
    cli.add_argument("--cert-dir", type=Path, help="keep the standalone certificates with independent challenges")
    args = cli.parse_args()
    # Isolate Lean imports just as the checker does. Preserve the selected toolchain.
    for key in ("LEAN_PATH", "LEAN_SRC_PATH"):
        os.environ.pop(key, None)
    with tempfile.TemporaryDirectory() as scratch:
        data = replay(args.corpus.resolve(), Path(scratch), args.cert_dir)
    if args.output:
        args.output.write_text(json.dumps(data, indent=2) + "\n")
    else:
        require(data == json.loads((HERE / "results.json").read_text()), "Recorded evidence differs")
    print("009 replay passed: 6 > 4, fixed universal contract, both axiom audits, Python controls.")
