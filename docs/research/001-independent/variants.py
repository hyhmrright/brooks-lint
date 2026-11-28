"""Derive five held-out edits and execute them on disposable real files.

Only the two upstream sources and their native disk observer define these
fixtures. The checker output is collected separately by the caller.
"""
import importlib.util
from pathlib import Path

ORIGINAL = Path(__file__).resolve().parent.parent / "logic-lens-001"


def load_native_observer():
    spec = importlib.util.spec_from_file_location("native_001", ORIGINAL / "replay.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def replace_once(source, old, new):
    if source.count(old) != 1:
        raise ValueError(f"001 fixture context changed: {old!r}")
    return source.replace(old, new, 1)


def source_variants():
    staged = (ORIGINAL / "upstream/fixed.py").read_text()
    eager = (ORIGINAL / "upstream/buggy.py").read_text()
    for name, source in [("staged-layout", staged), ("eager-layout", eager)]:
        # Same literals and calls, different layout, quotes and comments.
        yield name, replace_once(source, '    "package.json",',
                                 "    'package.json',  # first manifest\n")

    explicit = replace_once(staged, "    patches = [\n        compute_patch(",
                            "    patches = []\n    for rel in JSON_FILES:\n        patch = compute_patch(")
    explicit = replace_once(explicit, "        for rel in JSON_FILES\n    ]",
                            "        patches.append(patch)")
    yield "staged-explicit-loop", explicit

    # A phase boundary placed one file too early. JSON failures are safe but
    # the README failure leaves all five manifests written.
    drain = "    for path, new_text in patches:\n        path.write_text(new_text)\n"
    early = replace_once(explicit, "    patches.append(\n        compute_patch(",
                         drain + "    patches = []\n    patches.append(\n        compute_patch(")
    yield "early-metadata-flush", early

    # Converting the computed list into a lazy iterator changes when the
    # missing match is detected even though compute_patch itself stays pure.
    lazy = replace_once(staged, "import re\n", "from itertools import chain\nimport re\n")
    lazy = replace_once(lazy, "    patches = [", "    metadata = (")
    lazy = replace_once(lazy, "    ]\n    patches.append(\n        compute_patch(",
                        "    )\n\n    def badge():\n        yield compute_patch(")
    lazy = replace_once(lazy, '            "version-X-blue badge",\n        )\n    )',
                        '            "version-X-blue badge",\n        )')
    lazy = replace_once(lazy, "in patches:\n", "in chain(metadata, badge()):\n")
    yield "lazy-commit", lazy


def observe_variants(work: Path):
    """Yield (sample ID, materialized .py path, list of real disk observations)."""
    oracle = load_native_observer()
    sample_dir = work / "001-local-samples"
    sample_dir.mkdir()
    for name, contents in source_variants():
        path = sample_dir / (name + ".py")
        path.write_text(contents)
        observations = []
        cases = [(target, False) for target in oracle.TARGETS]
        cases += [(None, False), (oracle.TARGETS[1], True), (oracle.TARGETS[-1], True)]
        for target, same_bytes in cases:
            eager = name in ("eager-layout", "lazy-commit") or (
                name == "early-metadata-flush" and target == oracle.TARGETS[-1])
            # The shared observer asserts the precise exit code, missing-match
            # diagnostic, validator reachability, write trace and actual bytes
            # of every file against the declared runtime oracle.
            result = oracle.observe(path, "buggy" if eager else "fixed", failure=target,
                                    same_version=same_bytes)
            scenario = "success" if target is None else f"missing-match:{target}"
            if same_bytes:
                scenario += ":same-version"
            observations.append(dict(preparation_failure=target is not None, scenario=scenario, **result))
        yield name, path, observations
