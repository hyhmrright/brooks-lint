# 001 transfer study: three additional upstream implementations

**Decision: keep 001 advisory.** The frozen verifier issued zero certificates
for the three new programs. Two mismatch runs in patch-ng left a changed
target. Neither received a false verification, but there were zero verified
holdouts on which to assess the reliability of an approval. Requiring proof
would also block the Cookbook implementation that preserved both targets in
both mismatch runs. Treating abstention as permission would admit patch-ng.

## Reproduce

From a full checkout with Python 3.11, Git and Lean 4.19.0 on PATH, run:

```sh
python3.11 -I -B docs/research/001-independent/holdout/replay.py
```

Replay requires no network. It extracts the checker, helper, three proof
templates, Lean model and original contract from commit
`c05c01a76957327e561f2c9ed1c298c4c0311b87`. It runs each upstream source
unchanged against that contract, then compares ten isolated native runs and
three certificate controls to [the recorded evidence](results.json). The
evidence includes exact before/after bytes (hex), targeted write-open and
rename events, exit status, sample SHA-256 and the checker's full refusal.
Use `--print` to print a fresh measurement without updating the record.

## Native observations

Each success control changed both intended files. Each mismatch fixture contained
a valid requested edit for one target and no matching old text in the other.

| Upstream sample | First target mismatches | Last target mismatches | Frozen checker |
| --- | --- | --- | --- |
| OpenAI Cookbook patch CLI | Diagnostic, neither target touched | Diagnostic, neither target touched | Unsupported module initialization or imports |
| python-patch-ng CLI | Exit 255, last target changed | Exit 255, first target changed | Source exceeds 32 KiB limit |
| Hermes Agent version updater | Returned normally, both opened for writing, only last changed | Returned normally, both opened for writing, only first changed | Unsupported module initialization or imports |

The Cookbook CLI returns 0 even when its parser reports invalid context on
stderr. Its success control and error diagnostic distinguish rejection from
success. Patch-ng continues processing valid files. Hermes performs unchecked
regex substitutions: an absent version field produces no preparation error.
An additional invalid UTF-8 fixture raised a real decode error in its second file
after updating its first. This last run is outside the target-pattern contract.
These are transfer tests of 001; upstream projects can promise different behavior.

## Source selection and scope

The convenience sample covers a staged patch application, a released unified
diff tool and a project release updater. All are Python, operate on multiple
real files and were absent from the earlier 001 study. They are not a random
sample and no population error rate follows. The only synthetic inputs are the
target files and requested edits. The observer calls the two original CLI entry
points via runpy and calls the Hermes release helper directly to avoid release
side effects. A Python audit hook logs target operations within that process;
separate byte reads after exit check the final state. This exercise covers
content mismatch on existing regular files in disposable directories.

| Vendored file in samples/ | Exact source |
| --- | --- |
| cookbook/apply_patch.py | UTF-8 concatenation of zero-based cell 14's source strings in the [pinned notebook](https://github.com/openai/openai-cookbook/blob/7c3a2a78e19d1c42fd6e2512cb48a36a20970584/examples/gpt4-1_prompting_guide.ipynb) |
| patch-ng/patch_ng.py | [python-patch-ng 1.18.1](https://github.com/conan-io/python-patch-ng/blob/2f815d7b033f93140bb48ce69517b432d3d2bf86/patch_ng.py) |
| hermes/release.py | [Hermes Agent release script](https://github.com/NousResearch/hermes-agent/blob/1cec910b6a064d4e4821930be5cfaaf6145a2afd/scripts/release.py) |

Each source has its upstream license alongside it. The three holdouts stopped
before proof generation. As positive and negative controls, the runner also
re-emits the [staged proof](../../logic-lens-001/certificates/fixed.lean),
[early-flush witness](../expanded/early-flush.lean) and
[lazy/eager witness](../../logic-lens-001/certificates/buggy.lean) for previously
supported inputs. It checks their bytes, the independently stated theorem types
and Lean's empty axiom reports. Those certificates apply only to the controls.

The [Cookbook extension](../../001-cookbook/README.md) subsequently certified
the pinned Cookbook source and a per-file counterexample. This holdout still
replays the pre-extension checker.

The [patch-ng extension](../../001-patch-ng/README.md) checks both mismatch
positions for the exact 1.18.1 module that exceeded the frozen size limit.
